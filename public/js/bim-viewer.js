/**
 * بصير | عارض BIM/IFC ثلاثي الأبعاد الحقيقي (web-ifc + three.js)
 * يفتح ملف IFC فعلياً داخل المتصفح، يقرأ هندسته، ويعرضه بتدوير/تكبير تفاعلي
 * — بلا أي خدمة خارجية. (DWG/RVT الأصلية تحتاج مسار Autodesk APS المنفصل.)
 *
 * ربط عناصر BIM ببنود جدول الكميات (§10-12 من وثيقة المتطلبات):
 * كل عنصر في النموذج (عمود، بلاطة، لوح واجهة...) له expressID حقيقي من ملف الـIFC.
 * عند تمرير ctx + modelId، يُلوَّن كل عنصر حسب نسبة إنجاز بند الكميات المربوط به —
 * فيتحول من داكن/شفاف (غير مربوط) إلى كهرماني (جزئي) إلى أخضر ساطع (معتمد بالكامل)،
 * بنفس مصدر الحقيقة الذي تعتمده لوحة القيادة والتقارير (bq.progress) — لا حساب مواز.
 * إن كان canMap=true (استشاري/أدمن)، يمكن النقر على عنصر وربطه ببند كميات مباشرة.
 */
(function () {
  'use strict';

  I18n.registerDict({
    'ربط عناصر النموذج ببنود الكميات': 'Link Model Elements to BOQ Items',
    'اختر عنصراً في النموذج لعرض تفاصيله': 'Select an element in the model to see its details',
    'العنصر': 'Element',
    'الفئة': 'Category',
    'المعرّف الفريد (GUID)': 'Unique ID (GUID)',
    'بند الكميات المربوط': 'Linked BOQ Item',
    'غير مربوط بعد': 'Not linked yet',
    'اربط ببند كميات': 'Link to a BOQ Item',
    'اختر بند كميات...': 'Select a BOQ item…',
    'نسبة التخصيص لهذا العنصر': 'Allocation for this element',
    'حفظ الربط': 'Save Link',
    'إلغاء الربط': 'Remove Link',
    'تم الربط بنجاح': 'Linked successfully',
    'تم إلغاء الربط': 'Link removed',
    'الإنجاز المعتمد': 'Approved Progress',
    'القيمة المعتمدة': 'Approved Value',
    'دلالة الألوان': 'Color Key',
    'غير مربوط': 'Not linked',
    'لم يبدأ': 'Not started',
    'إنجاز جزئي': 'Partially approved',
    'معتمد بالكامل': 'Fully approved',
    'عناصر مربوطة': 'elements linked',
    'انقر أي عنصر في النموذج لعرض تفاصيله أو ربطه ببند كميات.': 'Click any element in the model to see its details or link it to a BOQ item.',
    'عنصر بلا اسم': 'Unnamed element'
  });

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

  // ألوان الحالة — نفس القيم الدلالية المستخدمة في باقي النظام (styles.css) لا حساب مواز
  const COL_OK = 0x30a46c, COL_WARN = 0xf5a524, COL_NONE = 0x3a4258;

  /** يحسب حالة العنصر ولونه من نسبة إنجاز بند الكميات المربوط به فقط (bq.progress — مصدر الحقيقة الوحيد) */
  function statusOf(boqItem) {
    if (!boqItem) return { key: 'unlinked', color: null };
    const p = boqItem.progress || 0;
    if (p >= 100) return { key: 'ok', color: COL_OK, pct: p };
    if (p > 0) return { key: 'warn', color: COL_WARN, pct: p };
    return { key: 'none', color: COL_NONE, pct: p };
  }

  /**
   * فتح عارض BIM.
   * opts: { title, url, ctx, modelId, canMap }
   *  - ctx + modelId: يُفعّلان تلوين العناصر حسب اعتماد بنود الكميات المربوطة (لكل الأدوار، قراءة).
   *  - canMap: يُظهر لوحة الربط الجانبية للنقر وربط/إلغاء ربط عنصر ببند كميات (استشاري/أدمن فقط).
   */
  async function open(opts) {
    opts = opts || {};
    const ctx = opts.ctx || null;
    const modelId = opts.modelId || null;
    const canMap = !!opts.canMap && !!ctx && !!modelId;
    const canDelete = canMap && ctx.U.role === 'admin'; // الحذف متاح للأدمن فقط — يطابق قاعدة النظام العامة (deleteItem)
    const showPanel = !!ctx; // لوحة القراءة تظهر لأي دور مرّر ctx، والربط الفعلي يقتصر على canMap

    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML =
      '<div class="dv-wrap" style="width:min(1280px,97vw)">' +
      '<div class="dv-head"><div><b>🧊 ' + esc(opts.title || I18n.t('نموذج BIM')) + '</b>' +
      '<div class="small muted" id="bv-info">' + I18n.t('جارٍ تحميل محرك BIM وقراءة النموذج...') + '</div></div>' +
      '<span class="spacer"></span>' +
      '<div class="flex" style="gap:6px">' +
      '<button class="btn mutedb sm" id="bv-fit">⤢ ' + I18n.t('ملاءمة') + '</button>' +
      '<button class="btn mutedb sm" id="bv-wire">🔲 ' + I18n.t('شبكي') + '</button>' +
      '<button class="btn mutedb sm" id="bv-close">✕ ' + I18n.t('إغلاق') + '</button></div></div>' +

      '<div class="dv-body">' +
      '<div class="dv-stage-wrap" style="padding:0">' +
      '<div class="bv-stage" id="bv-stage" style="position:relative;background:#0d1017;border-radius:12px;height:70vh;overflow:hidden">' +
      '<div id="bv-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8b95a8;flex-direction:column;gap:10px;z-index:2">' +
      '<div style="font-size:34px">🧊</div><div class="small">' + I18n.t('جارٍ بناء النموذج ثلاثي الأبعاد...') + '</div></div></div>' +
      '<div class="small muted mt">🖱 ' + I18n.t('اسحب للتدوير · عجلة الماوس للتكبير · اسحب باليمين للتحريك') + (showPanel ? ' · ' + I18n.t('انقر عنصراً لعرض تفاصيله') : '') + '</div>' +
      '</div>' +
      (showPanel ?
        '<div class="dv-side" id="bv-side">' +
        '<div class="dv-pins" id="bv-legend"></div>' +
        '<div class="dv-review" id="bv-panel"><div class="small muted">' + I18n.t('اختر عنصراً في النموذج لعرض تفاصيله') + '</div></div>' +
        '</div>' : '') +
      '</div>' +
      '</div>';
    document.body.appendChild(back);
    const stage = back.querySelector('#bv-stage');
    const info = back.querySelector('#bv-info');
    const panelEl = back.querySelector('#bv-panel');
    const legendEl = back.querySelector('#bv-legend');
    const toast = (window.ViewsShared && window.ViewsShared.toast) || function (m) { console.log(m); };

    function close() { cancelAnimationFrame(raf); try { renderer && renderer.dispose(); } catch (e) {} back.remove(); window.removeEventListener('resize', onResize); }
    back.querySelector('#bv-close').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });

    let THREE, renderer, scene, camera, root, raf = 0, meshes = [], wire = false;
    let selected = null; // آخر مesh مُختار
    const elementInfo = {}; // expressID -> {name, globalId, category}
    let mappings = {}; // expressID -> سجل الربط الحالي (من ctx.S.bimMappings)

    // مدار يدوي (بلا اعتماد إضافي)
    const cam = { theta: Math.PI * 0.25, phi: Math.PI * 0.32, dist: 20, target: null };

    function boqOptions() {
      if (!ctx) return [];
      return (ctx.S.boqItems || []).slice().sort(function (a, b) { return (a.code || '').localeCompare(b.code || ''); });
    }

    function refreshMappings() {
      mappings = {};
      if (!ctx || !modelId) return;
      (ctx.S.bimMappings || []).forEach(function (m) {
        if (m.bimModelId === modelId) mappings[m.elementExpressId] = m;
      });
    }

    function boqOf(mapping) {
      if (!mapping || !ctx) return null;
      return (ctx.S.boqItems || []).find(function (b) { return b.id === mapping.boqItemId; }) || null;
    }

    /** يعيد تلوين كل عناصر النموذج حسب حالة الربط والاعتماد الحالية (يُستدعى بعد كل تغيير) */
    function recolorAll() {
      if (!ctx || !modelId) return;
      refreshMappings();
      meshes.forEach(function (mesh) {
        const id = mesh.userData.expressID;
        const mapping = mappings[id];
        if (!mapping) {
          // غير مربوط بعد: نُبقي اللون الأصلي لكن نُخفّف الشفافية (تحذير بصري بلا فقدان شكل النموذج)
          mesh.material.color.copy(mesh.userData.baseColor);
          mesh.material.opacity = Math.min(mesh.userData.baseOpacity, 0.35);
          mesh.material.transparent = true;
          return;
        }
        const st = statusOf(boqOf(mapping));
        mesh.material.color.setHex(st.color);
        mesh.material.opacity = 1;
        mesh.material.transparent = false;
      });
    }

    function renderLegend() {
      if (!legendEl) return;
      const linked = Object.keys(mappings).length;
      legendEl.innerHTML =
        '<b class="small">' + I18n.t('دلالة الألوان') + '</b>' +
        '<div class="small muted" style="margin-top:8px;display:flex;flex-direction:column;gap:6px">' +
        '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#30a46c;margin-inline-end:6px"></i>' + I18n.t('معتمد بالكامل') + '</span>' +
        '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#f5a524;margin-inline-end:6px"></i>' + I18n.t('إنجاز جزئي') + '</span>' +
        '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#3a4258;margin-inline-end:6px"></i>' + I18n.t('لم يبدأ') + '</span>' +
        '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#8b95a8;opacity:.4;margin-inline-end:6px"></i>' + I18n.t('غير مربوط') + '</span>' +
        '</div><div class="small muted mt" style="border-top:1px solid var(--border);padding-top:8px">' +
        '<b class="num">' + linked + '</b> ' + I18n.t('عناصر مربوطة') + '</div>';
    }

    function renderPanel() {
      if (!panelEl) return;
      if (!selected) {
        panelEl.innerHTML = '<div class="small muted">' + I18n.t('انقر أي عنصر في النموذج لعرض تفاصيله أو ربطه ببند كميات.') + '</div>';
        return;
      }
      const id = selected.userData.expressID;
      const info2 = elementInfo[id] || {};
      const mapping = mappings[id];
      const bq = boqOf(mapping);
      const st = statusOf(bq);

      let html = '<b class="small">🔩 ' + esc(info2.name || I18n.t('عنصر بلا اسم')) + '</b>' +
        '<div class="small muted" style="margin:6px 0">' + esc(info2.category || '') + '</div>' +
        '<div class="small" style="font-family:monospace;font-size:10.5px;color:var(--muted);word-break:break-all">' + esc(info2.globalId || '') + '</div>';

      if (bq) {
        html += '<div class="mt" style="border-top:1px solid var(--border);padding-top:10px">' +
          '<div class="small"><b>' + I18n.t('بند الكميات المربوط') + ':</b> ' + esc(bq.code || bq.id) + ' — ' + esc(bq.description || '') + '</div>' +
          '<div class="flex" style="justify-content:space-between;margin-top:8px"><span class="small muted">' + I18n.t('الإنجاز المعتمد') + '</span><b class="num small">' + (bq.progress || 0) + '%</b></div>' +
          '<div class="bar" style="margin-top:4px"><i style="width:' + (bq.progress || 0) + '%;background:' + (st.key === 'ok' ? '#30a46c' : st.key === 'warn' ? '#f5a524' : '#3a4258') + '"></i></div>' +
          '<div class="flex" style="justify-content:space-between;margin-top:8px"><span class="small muted">' + I18n.t('القيمة المعتمدة') + '</span><b class="num small">' + Math.round((bq.qty || 0) * (bq.unitPrice || 0) * (bq.progress || 0) / 100).toLocaleString('en-US') + ' ' + I18n.t('ر.س') + '</b></div>' +
          '</div>';
      } else {
        html += '<div class="mt small muted" style="border-top:1px solid var(--border);padding-top:10px">' + I18n.t('غير مربوط بعد') + '</div>';
      }

      if (canMap) {
        html += '<div class="mt" style="border-top:1px solid var(--border);padding-top:10px">' +
          '<label class="fl">' + (bq ? I18n.t('تغيير الربط') : I18n.t('اربط ببند كميات')) + '</label>' +
          '<select class="inp" id="bv-boqsel"><option value="">' + I18n.t('اختر بند كميات...') + '</option>' +
          boqOptions().map(function (b) {
            return '<option value="' + b.id + '"' + (mapping && mapping.boqItemId === b.id ? ' selected' : '') + '>' + esc(b.code || b.id) + ' — ' + esc(b.description || '') + '</option>';
          }).join('') + '</select>' +
          '<label class="fl">' + I18n.t('نسبة التخصيص لهذا العنصر') + '</label>' +
          '<input class="inp num" id="bv-pct" type="number" min="1" max="100" value="' + (mapping ? mapping.allocationPct : 100) + '">' +
          '<div class="m-actions">' +
          '<button class="btn sm" id="bv-savelink">💾 ' + I18n.t('حفظ الربط') + '</button>' +
          (mapping && canDelete ? '<button class="btn danger sm" id="bv-unlink">' + I18n.t('إلغاء الربط') + '</button>' : '') +
          '</div></div>';
      }
      panelEl.innerHTML = html;

      const saveBtn = panelEl.querySelector('#bv-savelink');
      if (saveBtn) saveBtn.addEventListener('click', async function () {
        const boqItemId = panelEl.querySelector('#bv-boqsel').value;
        if (!boqItemId) { toast(I18n.t('اختر بند كميات...'), true); return; }
        const pct = Math.max(1, Math.min(100, Number(panelEl.querySelector('#bv-pct').value) || 100));
        try {
          if (mapping) {
            await Api.update('bimMappings', mapping.id, { boqItemId: boqItemId, allocationPct: pct });
          } else {
            await Api.create('bimMappings', {
              bimModelId: modelId, elementExpressId: id, projectId: ctx.projectId,
              elementName: info2.name || '', elementCategory: info2.category || '', globalId: info2.globalId || '',
              boqItemId: boqItemId, allocationPct: pct
            });
          }
          await ctx.refreshSilent();
          toast(I18n.t('تم الربط بنجاح'));
          recolorAll(); renderLegend(); renderPanel();
        } catch (e) { toast(e.message, true); }
      });
      const unlinkBtn = panelEl.querySelector('#bv-unlink');
      if (unlinkBtn) unlinkBtn.addEventListener('click', async function () {
        try {
          await Api.remove('bimMappings', mapping.id);
          await ctx.refreshSilent();
          toast(I18n.t('تم إلغاء الربط'));
          recolorAll(); renderLegend(); renderPanel();
        } catch (e) { toast(e.message, true); }
      });
    }

    try {
      THREE = await loadThree();
      const WebIFC = await loadWebIFC();
      const api = new WebIFC.IfcAPI();
      api.SetWasmPath('/vendor/bim/', true);
      await api.Init();

      const resp = await fetch(opts.url);
      if (!resp.ok) throw new Error('تعذّر جلب ملف النموذج');
      const buf = new Uint8Array(await resp.arrayBuffer());
      const modelIfcID = api.OpenModel(buf);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d1017);
      root = new THREE.Group();
      scene.add(root);

      const box = new THREE.Box3();
      let meshCount = 0, triCount = 0;
      const expressIDs = [];

      api.StreamAllMeshes(modelIfcID, function (placedMesh) {
        const geos = placedMesh.geometries;
        for (let i = 0; i < geos.size(); i++) {
          const pg = geos.get(i);
          const geo = api.GetGeometry(modelIfcID, pg.geometryExpressID);
          const verts = api.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize());
          const idx = api.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize());
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
          mesh.userData.expressID = placedMesh.expressID;
          mesh.userData.baseColor = mat.color.clone();
          mesh.userData.baseOpacity = c.w;
          root.add(mesh);
          meshes.push(mesh);
          bg.computeBoundingBox();
          const bb = bg.boundingBox.clone().applyMatrix4(mesh.matrix);
          box.union(bb);
          meshCount++;
          triCount += idx.length / 3;
          geo.delete && geo.delete();
        }
        if (showPanel && expressIDs.indexOf(placedMesh.expressID) === -1) expressIDs.push(placedMesh.expressID);
      });

      // نقرأ خصائص كل عنصر (الاسم، GUID، التصنيف) قبل إغلاق النموذج — تُستخدم في لوحة التفاصيل
      if (showPanel && api.properties && api.properties.getItemProperties) {
        for (let i = 0; i < expressIDs.length; i++) {
          const eid = expressIDs[i];
          try {
            const props = await api.properties.getItemProperties(modelIfcID, eid, false);
            elementInfo[eid] = {
              name: (props.Name && props.Name.value) || '',
              globalId: (props.GlobalId && props.GlobalId.value) || '',
              category: (props.PredefinedType && props.PredefinedType.value) || ''
            };
          } catch (e) { /* عنصر لا يدعم قراءة الخصائص — نتجاهله بأمان */ }
        }
      }
      api.CloseModel(modelIfcID);

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const d1 = new THREE.DirectionalLight(0xffffff, 0.8); d1.position.set(1, 2, 1.5); scene.add(d1);
      const d2 = new THREE.DirectionalLight(0xafc4ff, 0.35); d2.position.set(-1, -0.5, -1); scene.add(d2);

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

      info.innerHTML = '✅ ' + I18n.t('نموذج IFC حقيقي') + ' — <b class="num">' + meshCount + '</b> ' + I18n.t('عنصر') + ' · <b class="num">' + Math.round(triCount).toLocaleString('en-US') + '</b> ' + I18n.t('مثلث');
      window.BimViewer._last = { meshCount: meshCount, triCount: triCount };

      if (showPanel) { recolorAll(); renderLegend(); renderPanel(); }

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

      // تحكم بالماوس + تمييز نقرة عادية (اختيار) عن سحب (تدوير/تحريك)
      let drag = null, downPt = null;
      renderer.domElement.addEventListener('pointerdown', function (e) {
        drag = { x: e.clientX, y: e.clientY, btn: e.button };
        downPt = { x: e.clientX, y: e.clientY, t: Date.now() };
        renderer.domElement.setPointerCapture(e.pointerId);
      });
      renderer.domElement.addEventListener('pointermove', function (e) {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
        if (drag.btn === 2 || e.shiftKey) {
          const panScale = cam.dist * 0.0015;
          const right = new THREE.Vector3().subVectors(camera.position, cam.target).cross(camera.up).normalize();
          const up = camera.up.clone();
          cam.target.addScaledVector(right, -dx * panScale).addScaledVector(up, dy * panScale);
        } else {
          cam.theta -= dx * 0.008;
          cam.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.phi - dy * 0.008));
        }
        applyCam();
      });
      renderer.domElement.addEventListener('pointerup', function (e) {
        drag = null;
        if (showPanel && downPt && Math.abs(e.clientX - downPt.x) < 5 && Math.abs(e.clientY - downPt.y) < 5 && Date.now() - downPt.t < 500 && (e.button === 0)) {
          pick(e);
        }
        downPt = null;
      });
      renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      renderer.domElement.addEventListener('wheel', function (e) {
        e.preventDefault();
        cam.dist = Math.max(0.5, cam.dist * (e.deltaY > 0 ? 1.12 : 0.89));
        applyCam();
      }, { passive: false });

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      function pick(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        if (selected) selected.material.emissive && selected.material.emissive.setHex(0x000000);
        if (!hits.length) { selected = null; renderPanel(); return; }
        selected = hits[0].object;
        if (!selected.material.emissive) selected.material.emissive = new THREE.Color(0x000000);
        selected.material.emissive.setHex(0x3a2a10);
        renderPanel();
      }

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
