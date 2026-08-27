/**
 * بصير | عارض BIM/IFC ثلاثي الأبعاد الحقيقي (web-ifc + three.js)
 * يفتح ملف IFC فعلياً داخل المتصفح، يقرأ هندسته، ويعرضه بتدوير/تكبير تفاعلي
 * — بلا أي خدمة خارجية. (DWG/RVT الأصلية تحتاج مسار Autodesk APS المنفصل.)
 */
(function () {
  'use strict';

  let webifcPromise = null;
  function loadThree() { return import('/vendor/bim/three.module.js'); }
  function loadWebIFC() {
    if (window.WebIFC) return Promise.resolve(window.WebIFC);
    if (webifcPromise) return webifcPromise;
    webifcPromise = new Promise(function (res, rej) {
      const s = document.createElement('script');
      s.src = '/vendor/bim/web-ifc-api-iife.js';
      s.onload = function () { res(window.WebIFC); };
      s.onerror = function () { rej(new Error('تعذّر تحميل محرك IFC')); };
      document.head.appendChild(s);
    });
    return webifcPromise;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /**
   * فتح عارض BIM. opts: { title, url } — url لملف IFC.
   */
  async function open(opts) {
    opts = opts || {};
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML =
      '<div class="dv-wrap" style="width:min(1280px,97vw)">' +
      '<div class="dv-head"><div><b>🧊 ' + esc(opts.title || 'نموذج BIM') + '</b>' +
      '<div class="small muted" id="bv-info">جارٍ تحميل محرك BIM وقراءة النموذج...</div></div>' +
      '<span class="spacer"></span>' +
      '<div class="flex" style="gap:6px">' +
      '<button class="btn mutedb sm" id="bv-fit">⤢ ملاءمة</button>' +
      '<button class="btn mutedb sm" id="bv-wire">🔲 شبكي</button>' +
      '<button class="btn mutedb sm" id="bv-close">✕ إغلاق</button></div></div>' +
      '<div class="bv-stage" id="bv-stage" style="position:relative;background:#0d1017;border:1px solid var(--border);border-radius:12px;height:70vh;overflow:hidden">' +
      '<div id="bv-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8b95a8;flex-direction:column;gap:10px">' +
      '<div style="font-size:34px">🧊</div><div class="small">جارٍ بناء النموذج ثلاثي الأبعاد...</div></div></div>' +
      '<div class="small muted mt">🖱 اسحب للتدوير · عجلة الماوس للتكبير · اسحب باليمين للتحريك</div>' +
      '</div>';
    document.body.appendChild(back);
    const stage = back.querySelector('#bv-stage');
    const info = back.querySelector('#bv-info');
    const toast = (window.ViewsShared && window.ViewsShared.toast) || function (m) { console.log(m); };

    function close() { cancelAnimationFrame(raf); try { renderer && renderer.dispose(); } catch (e) {} back.remove(); window.removeEventListener('resize', onResize); }
    back.querySelector('#bv-close').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });

    let THREE, renderer, scene, camera, root, raf = 0, meshes = [], wire = false;
    // مدار يدوي (بلا اعتماد إضافي)
    const cam = { theta: Math.PI * 0.25, phi: Math.PI * 0.32, dist: 20, target: null };

    try {
      THREE = await loadThree();
      const WebIFC = await loadWebIFC();
      const api = new WebIFC.IfcAPI();
      api.SetWasmPath('/vendor/bim/', true);
      await api.Init();

      const resp = await fetch(opts.url);
      if (!resp.ok) throw new Error('تعذّر جلب ملف النموذج');
      const buf = new Uint8Array(await resp.arrayBuffer());
      const modelID = api.OpenModel(buf);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d1017);
      root = new THREE.Group();
      scene.add(root);

      const box = new THREE.Box3();
      let meshCount = 0, triCount = 0;

      api.StreamAllMeshes(modelID, function (placedMesh) {
        const geos = placedMesh.geometries;
        for (let i = 0; i < geos.size(); i++) {
          const pg = geos.get(i);
          const geo = api.GetGeometry(modelID, pg.geometryExpressID);
          const verts = api.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize());
          const idx = api.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize());
          // verts: [px,py,pz,nx,ny,nz, ...]
          const nV = verts.length / 6;
          const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3);
          for (let v = 0; v < nV; v++) {
            pos[v * 3] = verts[v * 6]; pos[v * 3 + 1] = verts[v * 6 + 1]; pos[v * 3 + 2] = verts[v * 6 + 2];
            nor[v * 3] = verts[v * 6 + 3]; nor[v * 3 + 1] = verts[v * 6 + 4]; nor[v * 3 + 2] = verts[v * 6 + 5];
          }
          const bg = new THREE.BufferGeometry();
          bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
          bg.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
          const c = pg.color;
          const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color(c.x, c.y, c.z),
            transparent: c.w < 1, opacity: c.w, side: THREE.DoubleSide
          });
          const mesh = new THREE.Mesh(bg, mat);
          const m = pg.flatTransformation;
          mesh.matrixAutoUpdate = false;
          mesh.matrix.set(m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]);
          root.add(mesh);
          meshes.push(mesh);
          bg.computeBoundingBox();
          const bb = bg.boundingBox.clone().applyMatrix4(mesh.matrix);
          box.union(bb);
          meshCount++;
          triCount += idx.length / 3;
          // تحرير ذاكرة web-ifc
          geo.delete && geo.delete();
        }
      });
      api.CloseModel(modelID);

      // إضاءة
      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const d1 = new THREE.DirectionalLight(0xffffff, 0.8); d1.position.set(1, 2, 1.5); scene.add(d1);
      const d2 = new THREE.DirectionalLight(0xafc4ff, 0.35); d2.position.set(-1, -0.5, -1); scene.add(d2);

      // كاميرا وملاءمة
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      cam.target = center;
      cam.dist = Math.max(size.x, size.y, size.z, 1) * 2.2;
      camera = new THREE.PerspectiveCamera(50, stage.clientWidth / stage.clientHeight, 0.05, cam.dist * 50);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      stage.appendChild(renderer.domElement);
      const loading = back.querySelector('#bv-loading'); if (loading) loading.remove();

      info.innerHTML = '✅ نموذج IFC حقيقي — <b class="num">' + meshCount + '</b> عنصر · <b class="num">' + Math.round(triCount).toLocaleString('en-US') + '</b> مثلث';
      window.BimViewer._last = { meshCount: meshCount, triCount: triCount };

      function applyCam() {
        const t = cam.target;
        camera.position.set(
          t.x + cam.dist * Math.sin(cam.phi) * Math.cos(cam.theta),
          t.y + cam.dist * Math.cos(cam.phi),
          t.z + cam.dist * Math.sin(cam.phi) * Math.sin(cam.theta)
        );
        camera.lookAt(t);
      }
      applyCam();

      function loop() { raf = requestAnimationFrame(loop); renderer.render(scene, camera); }
      loop();

      function onResize() {
        if (!stage.clientWidth) return;
        camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix();
        renderer.setSize(stage.clientWidth, stage.clientHeight);
      }
      window.addEventListener('resize', onResize);

      // تحكم بالماوس
      let drag = null;
      renderer.domElement.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, btn: e.button }; renderer.domElement.setPointerCapture(e.pointerId); });
      renderer.domElement.addEventListener('pointermove', function (e) {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
        if (drag.btn === 2 || e.shiftKey) { // تحريك
          const panScale = cam.dist * 0.0015;
          const right = new THREE.Vector3().subVectors(camera.position, cam.target).cross(camera.up).normalize();
          const up = camera.up.clone();
          cam.target.addScaledVector(right, -dx * panScale).addScaledVector(up, dy * panScale);
        } else { // تدوير
          cam.theta -= dx * 0.008;
          cam.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.phi - dy * 0.008));
        }
        applyCam();
      });
      renderer.domElement.addEventListener('pointerup', function () { drag = null; });
      renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      renderer.domElement.addEventListener('wheel', function (e) {
        e.preventDefault();
        cam.dist = Math.max(0.5, cam.dist * (e.deltaY > 0 ? 1.12 : 0.89));
        applyCam();
      }, { passive: false });

      back.querySelector('#bv-fit').addEventListener('click', function () {
        cam.target = center.clone(); cam.dist = Math.max(size.x, size.y, size.z, 1) * 2.2;
        cam.theta = Math.PI * 0.25; cam.phi = Math.PI * 0.32; applyCam();
      });
      back.querySelector('#bv-wire').addEventListener('click', function () {
        wire = !wire; meshes.forEach(function (mesh) { mesh.material.wireframe = wire; });
      });
    } catch (e) {
      const loading = back.querySelector('#bv-loading');
      if (loading) loading.innerHTML = '<div style="font-size:34px">⚠️</div><div class="small" style="color:var(--warn)">' + esc(e.message) + '</div>';
      info.textContent = 'تعذّر عرض النموذج';
      toast(e.message, true);
    }
  }

  window.BimViewer = { open: open, _last: null };
})();
