/*
 * dxf-viewer.js — عارض DXF حقيقي داخل المتصفح (بلا اعتماديات خارجية)
 *
 * يقرأ ملفات AutoCAD DXF (ASCII) ويرسم خطوطاً متجهية قابلة للقياس على Canvas.
 * يدعم الكيانات: LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, TEXT, MTEXT, POINT.
 * ميزات: احتواء تلقائي (Fit)، تكبير/تصغير بالعجلة، تحريك بالسحب،
 *        أداة قياس نقطتين تعرض المسافة بوحدات الرسم الحقيقية،
 *        عرض/إخفاء الطبقات، مؤشر إحداثيات حيّ.
 *
 * الواجهة العامة:  window.DxfViewer.open({ title, url })
 *                  window.DxfViewer.parse(text) -> { entities, layers, bounds }
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   *  1) المحلّل (Parser): يحوّل نص DXF إلى قائمة كيانات هندسية
   * ------------------------------------------------------------------ */

  // يقسّم DXF إلى أزواج [code, value] — كل زوج سطران (رمز المجموعة ثم القيمة).
  function tokenize(text) {
    // نطبّع أسطر الويندوز/ماك ونتجاهل الفراغات الطرفية.
    var lines = text.split(/\r\n|\r|\n/);
    var pairs = [];
    for (var i = 0; i + 1 < lines.length; i += 2) {
      var code = parseInt(lines[i].trim(), 10);
      if (isNaN(code)) { i -= 1; continue; } // سطر تالف: انزلق سطراً واحداً
      pairs.push([code, lines[i + 1]]);
    }
    return pairs;
  }

  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }

  // يمشي على قسم ENTITIES ويبني كائنات كيانات.
  function parse(text) {
    var pairs = tokenize(text);
    var entities = [];
    var layers = {};
    var i = 0;

    // تخطَّ حتى بداية قسم ENTITIES (إن وُجد؛ وإلا حلّل الكل).
    var start = 0, hasEntitiesSection = false;
    for (var k = 0; k < pairs.length - 1; k++) {
      if (pairs[k][0] === 0 && pairs[k][1].trim() === 'SECTION' &&
          pairs[k + 1][0] === 2 && pairs[k + 1][1].trim() === 'ENTITIES') {
        start = k + 2; hasEntitiesSection = true; break;
      }
    }
    i = hasEntitiesSection ? start : 0;

    function registerLayer(name) {
      if (!(name in layers)) layers[name] = { name: name, visible: true, count: 0 };
      layers[name].count++;
    }

    while (i < pairs.length) {
      var code = pairs[i][0];
      var val = pairs[i][1] != null ? pairs[i][1].trim() : '';

      if (code === 0 && (val === 'ENDSEC' || val === 'EOF')) break;

      if (code !== 0) { i++; continue; }

      var type = val;
      i++;
      // اجمع أزواج هذا الكيان حتى الكيان التالي (code 0).
      var ent = { type: type, layer: '0' };
      var lwVerts = [];       // رؤوس LWPOLYLINE
      var plVerts = [];       // رؤوس POLYLINE (عبر VERTEX)
      var pendingVertex = null;

      // معالج خاص لـ POLYLINE القديمة: تتبعها كيانات VERTEX ثم SEQEND.
      if (type === 'POLYLINE') {
        // اقرأ خصائص POLYLINE نفسها
        while (i < pairs.length && pairs[i][0] !== 0) {
          var c = pairs[i][0], v = pairs[i][1].trim();
          if (c === 8) ent.layer = v;
          if (c === 70) ent.flags = num(v);
          i++;
        }
        // اقرأ كيانات VERTEX
        while (i < pairs.length && pairs[i][0] === 0 && pairs[i][1].trim() === 'VERTEX') {
          i++;
          var vx = { x: 0, y: 0 };
          while (i < pairs.length && pairs[i][0] !== 0) {
            var vc = pairs[i][0], vv = pairs[i][1].trim();
            if (vc === 10) vx.x = num(vv);
            else if (vc === 20) vx.y = num(vv);
            i++;
          }
          plVerts.push(vx);
        }
        // تخطَّ SEQEND
        if (i < pairs.length && pairs[i][0] === 0 && pairs[i][1].trim() === 'SEQEND') {
          i++;
          while (i < pairs.length && pairs[i][0] !== 0) i++;
        }
        ent.vertices = plVerts;
        ent.closed = !!(ent.flags & 1);
        registerLayer(ent.layer);
        if (plVerts.length >= 2) entities.push(ent);
        continue;
      }

      // بقية الكيانات: اقرأ الأزواج حتى الكيان التالي.
      while (i < pairs.length && pairs[i][0] !== 0) {
        var gc = pairs[i][0];
        var gv = pairs[i][1] != null ? pairs[i][1].trim() : '';
        switch (gc) {
          case 8: ent.layer = gv; break;
          case 10:
            if (type === 'LWPOLYLINE') { lwVerts.push({ x: num(gv), y: 0 }); }
            else ent.x = num(gv);
            break;
          case 20:
            if (type === 'LWPOLYLINE') { if (lwVerts.length) lwVerts[lwVerts.length - 1].y = num(gv); }
            else ent.y = num(gv);
            break;
          case 11: ent.x2 = num(gv); break;
          case 21: ent.y2 = num(gv); break;
          case 40: ent.r = num(gv); ent.h = num(gv); break; // نصف قطر / ارتفاع نص
          case 50: ent.a0 = num(gv); break;                  // زاوية بداية القوس
          case 51: ent.a1 = num(gv); break;                  // زاوية نهاية القوس
          case 70: ent.flags = num(gv); break;
          case 1: ent.text = gv; break;
          default: break;
        }
        i++;
      }

      if (type === 'LWPOLYLINE') {
        ent.vertices = lwVerts;
        ent.closed = !!(ent.flags & 1);
      }
      registerLayer(ent.layer);
      entities.push(ent);
    }

    var bounds = computeBounds(entities);
    return { entities: entities, layers: layers, bounds: bounds };
  }

  // يحسب المستطيل المحيط بكل الكيانات لأجل الاحتواء التلقائي.
  function computeBounds(entities) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    function ext(x, y) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    entities.forEach(function (e) {
      switch (e.type) {
        case 'LINE': ext(e.x, e.y); ext(e.x2, e.y2); break;
        case 'LWPOLYLINE':
        case 'POLYLINE':
          (e.vertices || []).forEach(function (v) { ext(v.x, v.y); }); break;
        case 'CIRCLE': ext(e.x - e.r, e.y - e.r); ext(e.x + e.r, e.y + e.r); break;
        case 'ARC': ext(e.x - e.r, e.y - e.r); ext(e.x + e.r, e.y + e.r); break;
        case 'TEXT':
        case 'MTEXT':
        case 'POINT': ext(e.x, e.y); break;
      }
    });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 100; maxY = 100; }
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY,
             w: maxX - minX, h: maxY - minY };
  }

  /* ------------------------------------------------------------------ *
   *  2) العارض (Renderer): Canvas 2D مع تحويل عالم→شاشة
   * ------------------------------------------------------------------ */

  var LAYER_COLORS = {
    WALLS: '#e8eaed', COLUMNS: '#ffb74d', DOORS: '#4fc3f7',
    DIM: '#9ccc65', TEXT: '#ce93d8', TITLE: '#fff176', '0': '#cfd8dc'
  };
  function layerColor(name) { return LAYER_COLORS[name] || '#90caf9'; }

  function DxfView(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;
    this.scale = 1;
    this.tx = 0; this.ty = 0;       // إزاحة (بكسل)
    this.measure = { active: false, p1: null, p2: null };
    this.mouseWorld = { x: 0, y: 0 };
    this._bindEvents();
    this.fit();
  }

  DxfView.prototype.worldToScreen = function (x, y) {
    // نقلب Y لأن إحداثيات CAD تصعد للأعلى بينما الشاشة تنزل.
    return { x: x * this.scale + this.tx,
             y: this.canvas.height - (y * this.scale + this.ty) };
  };
  DxfView.prototype.screenToWorld = function (sx, sy) {
    return { x: (sx - this.tx) / this.scale,
             y: (this.canvas.height - sy - this.ty) / this.scale };
  };

  DxfView.prototype.fit = function () {
    var b = this.model.bounds;
    var pad = 40;
    var cw = this.canvas.width - pad * 2, ch = this.canvas.height - pad * 2;
    var sx = b.w > 0 ? cw / b.w : 1, sy = b.h > 0 ? ch / b.h : 1;
    this.scale = Math.min(sx, sy) || 1;
    // مركّز الرسم داخل الكانفس.
    this.tx = pad + (cw - b.w * this.scale) / 2 - b.minX * this.scale;
    this.ty = pad + (ch - b.h * this.scale) / 2 - b.minY * this.scale;
    this.draw();
  };

  DxfView.prototype.zoomAt = function (sx, sy, factor) {
    var before = this.screenToWorld(sx, sy);
    this.scale *= factor;
    // ثبّت النقطة تحت المؤشر أثناء التكبير.
    this.tx = sx - before.x * this.scale;
    this.ty = (this.canvas.height - sy) - before.y * this.scale;
    this.draw();
  };

  DxfView.prototype.draw = function () {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f1720';
    ctx.fillRect(0, 0, W, H);
    this._drawGrid();

    var self = this;
    this.model.entities.forEach(function (e) {
      var lay = self.model.layers[e.layer];
      if (lay && !lay.visible) return;
      ctx.strokeStyle = layerColor(e.layer);
      ctx.fillStyle = layerColor(e.layer);
      ctx.lineWidth = 1.25;
      self._drawEntity(e);
    });

    this._drawMeasure();
    this._drawScaleBar();
    ctx.restore();
  };

  DxfView.prototype._drawEntity = function (e) {
    var ctx = this.ctx, self = this;
    function P(x, y) { return self.worldToScreen(x, y); }
    switch (e.type) {
      case 'LINE': {
        var a = P(e.x, e.y), b = P(e.x2, e.y2);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        break;
      }
      case 'LWPOLYLINE':
      case 'POLYLINE': {
        var vs = e.vertices || []; if (vs.length < 2) break;
        ctx.beginPath();
        var s0 = P(vs[0].x, vs[0].y); ctx.moveTo(s0.x, s0.y);
        for (var j = 1; j < vs.length; j++) { var s = P(vs[j].x, vs[j].y); ctx.lineTo(s.x, s.y); }
        if (e.closed) ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'CIRCLE': {
        var c = P(e.x, e.y);
        ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(0.5, e.r * this.scale), 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'ARC': {
        var cc = P(e.x, e.y);
        // Canvas: الزوايا باتجاه عقارب الساعة مع محور Y نازل؛ لذا نعكس ونستخدم counter-clockwise.
        var a0 = -(e.a0 * Math.PI / 180), a1 = -(e.a1 * Math.PI / 180);
        ctx.beginPath();
        ctx.arc(cc.x, cc.y, Math.max(0.5, e.r * this.scale), a0, a1, true);
        ctx.stroke();
        break;
      }
      case 'TEXT':
      case 'MTEXT': {
        if (!e.text) break;
        var t = P(e.x, e.y);
        var px = Math.max(9, (e.h || 0.3) * this.scale);
        ctx.save();
        ctx.font = px + 'px system-ui, sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(e.text, t.x, t.y);
        ctx.restore();
        break;
      }
      case 'POINT': {
        var pp = P(e.x, e.y);
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 2, 0, Math.PI * 2); ctx.fill();
        break;
      }
    }
  };

  DxfView.prototype._drawGrid = function () {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    // شبكة بوحدة رسم واحدة، تُخفى إن صغُرت جداً.
    var step = this.scale;
    if (step < 8) return;
    // اختر خطوة عالمية 1/5/10 حسب الكثافة.
    var unit = 1;
    while (unit * this.scale < 30) unit *= (unit === 1 ? 5 : 2);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    var b = this.model.bounds;
    var startX = Math.floor(b.minX / unit) * unit;
    var endX = Math.ceil(b.maxX / unit) * unit;
    var startY = Math.floor(b.minY / unit) * unit;
    var endY = Math.ceil(b.maxY / unit) * unit;
    for (var gx = startX; gx <= endX; gx += unit) {
      var a = this.worldToScreen(gx, startY), c = this.worldToScreen(gx, endY);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    }
    for (var gy = startY; gy <= endY; gy += unit) {
      var d = this.worldToScreen(startX, gy), f = this.worldToScreen(endX, gy);
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(f.x, f.y); ctx.stroke();
    }
    ctx.restore();
  };

  DxfView.prototype._drawMeasure = function () {
    var m = this.measure; if (!m.p1) return;
    var ctx = this.ctx;
    var a = this.worldToScreen(m.p1.x, m.p1.y);
    var end = m.p2 || this.mouseWorld;
    var b = this.worldToScreen(end.x, end.y);
    ctx.save();
    ctx.strokeStyle = '#ff5252'; ctx.fillStyle = '#ff5252'; ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.setLineDash([]);
    [a, b].forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
    var dx = end.x - m.p1.x, dy = end.y - m.p1.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var label = dist.toFixed(2) + ' وحدة';
    var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    ctx.font = '13px system-ui, sans-serif';
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(mid.x - tw / 2 - 6, mid.y - 22, tw + 12, 20);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, mid.x, mid.y - 12);
    ctx.textAlign = 'start';
    ctx.restore();
  };

  DxfView.prototype._drawScaleBar = function () {
    var ctx = this.ctx, H = this.canvas.height;
    // اختر طول قضيب مرجعي مرتباً (1,2,5,10...).
    var target = 120; // بكسل
    var unit = 1;
    while (unit * this.scale < target) unit *= (unit === 1 ? 5 : 2);
    while (unit * this.scale > target * 2) unit /= 2;
    var px = unit * this.scale;
    var x0 = 16, y0 = H - 20;
    ctx.save();
    ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - 5); ctx.lineTo(x0, y0); ctx.lineTo(x0 + px, y0); ctx.lineTo(x0 + px, y0 - 5);
    ctx.stroke();
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(unit + ' وحدة', x0, y0 - 8);
    ctx.restore();
  };

  DxfView.prototype._bindEvents = function () {
    var self = this, canvas = this.canvas;
    var dragging = false, last = null;

    canvas.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var sx = ev.clientX - rect.left, sy = ev.clientY - rect.top;
      self.zoomAt(sx, sy, ev.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, { passive: false });

    canvas.addEventListener('mousedown', function (ev) {
      var rect = canvas.getBoundingClientRect();
      var sx = ev.clientX - rect.left, sy = ev.clientY - rect.top;
      if (self.measure.active) {
        var w = self.screenToWorld(sx, sy);
        if (!self.measure.p1 || self.measure.p2) {
          self.measure.p1 = w; self.measure.p2 = null;
        } else {
          self.measure.p2 = w;
        }
        self.draw();
        return;
      }
      dragging = true; last = { x: sx, y: sy };
    });

    window.addEventListener('mousemove', function (ev) {
      var rect = canvas.getBoundingClientRect();
      var sx = ev.clientX - rect.left, sy = ev.clientY - rect.top;
      self.mouseWorld = self.screenToWorld(sx, sy);
      if (self._coordCb) self._coordCb(self.mouseWorld);
      if (self.measure.active && self.measure.p1 && !self.measure.p2) { self.draw(); }
      if (!dragging) return;
      self.tx += sx - last.x;
      self.ty -= sy - last.y; // Y مقلوب
      last = { x: sx, y: sy };
      self.draw();
    });

    window.addEventListener('mouseup', function () { dragging = false; });
  };

  DxfView.prototype.toggleMeasure = function () {
    this.measure.active = !this.measure.active;
    if (!this.measure.active) { this.measure.p1 = this.measure.p2 = null; }
    this.draw();
    return this.measure.active;
  };

  /* ------------------------------------------------------------------ *
   *  3) الواجهة العامة + نافذة العرض (modal)
   * ------------------------------------------------------------------ */

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') e.setAttribute('style', attrs[k]);
      else if (k.slice(0, 2) === 'on') e[k] = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  function openModal(opts) {
    opts = opts || {};
    var title = opts.title || 'عارض DXF';

    var overlay = el('div', { style:
      'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;' +
      'align-items:center;justify-content:center;' });

    var box = el('div', { style:
      'width:min(96vw,1200px);height:min(92vh,820px);background:#111a24;border-radius:12px;' +
      'display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);' });

    // شريط علوي
    var bar = el('div', { style:
      'display:flex;align-items:center;gap:8px;padding:10px 14px;background:#0c141c;' +
      'border-bottom:1px solid #1e2a36;color:#e8eaed;font:600 14px system-ui,sans-serif;' });
    var btnFit = el('button', { style: btnStyle(), title: 'احتواء' }, ['⤢ احتواء']);
    var btnMeasure = el('button', { style: btnStyle(), title: 'قياس مسافة' }, ['📐 قياس']);
    var coord = el('span', { style: 'margin-inline-start:auto;color:#90a4ae;font-weight:400;font-size:12px;' }, ['—']);
    var btnClose = el('button', { style: btnStyle('#b71c1c'), title: 'إغلاق' }, ['✕']);
    bar.appendChild(el('span', { style: 'font-size:16px;' }, ['📐']));
    bar.appendChild(el('span', {}, [title]));
    bar.appendChild(btnFit); bar.appendChild(btnMeasure);
    bar.appendChild(coord); bar.appendChild(btnClose);

    // منطقة العرض: طبقات + كانفس
    var body = el('div', { style: 'flex:1;display:flex;min-height:0;' });
    var side = el('div', { style:
      'width:180px;background:#0c141c;border-inline-end:1px solid #1e2a36;padding:10px;' +
      'overflow:auto;color:#cfd8dc;font:12px system-ui,sans-serif;' });
    side.appendChild(el('div', { style: 'font-weight:700;margin-bottom:8px;color:#90a4ae;' }, ['الطبقات']));
    var layerList = el('div', {});
    side.appendChild(layerList);

    var stage = el('div', { style: 'flex:1;position:relative;min-width:0;background:#0f1720;' });
    var canvas = el('canvas', { style: 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;' });
    var status = el('div', { style:
      'position:absolute;left:0;right:0;bottom:0;padding:6px 10px;background:rgba(0,0,0,.4);' +
      'color:#b0bec5;font:12px system-ui,sans-serif;pointer-events:none;' }, ['جارٍ التحميل…']);
    stage.appendChild(canvas); stage.appendChild(status);
    body.appendChild(side); body.appendChild(stage);

    box.appendChild(bar); box.appendChild(body);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function close() { document.body.removeChild(overlay); window.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    window.addEventListener('keydown', onKey);
    btnClose.onclick = close;
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });

    // اضبط دقة الكانفس على الحجم الفعلي.
    function sizeCanvas() {
      var r = stage.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(r.width));
      canvas.height = Math.max(200, Math.floor(r.height));
    }

    var view = null;

    function boot(text) {
      var model;
      try { model = parse(text); }
      catch (err) { status.textContent = 'تعذّر تحليل ملف DXF: ' + err.message; return; }
      if (!model.entities.length) { status.textContent = 'لا توجد كيانات قابلة للرسم في هذا الملف.'; return; }
      sizeCanvas();
      view = new DxfView(canvas, model);
      window.DxfViewer._last = {
        entityCount: model.entities.length,
        layerCount: Object.keys(model.layers).length,
        bounds: model.bounds
      };

      // عدّاد الكيانات في الحالة
      status.textContent = 'الكيانات: ' + model.entities.length +
        ' • الطبقات: ' + Object.keys(model.layers).length +
        ' • الأبعاد: ' + model.bounds.w.toFixed(2) + ' × ' + model.bounds.h.toFixed(2) + ' وحدة';

      // مؤشر الإحداثيات الحي
      view._coordCb = function (w) { coord.textContent = 'X: ' + w.x.toFixed(2) + '  Y: ' + w.y.toFixed(2); };

      // قائمة الطبقات
      Object.keys(model.layers).forEach(function (name) {
        var lay = model.layers[name];
        var row = el('label', { style: 'display:flex;align-items:center;gap:6px;padding:3px 0;cursor:pointer;' });
        var cb = el('input', { type: 'checkbox' }); cb.checked = true;
        cb.onchange = function () { lay.visible = cb.checked; view.draw(); };
        var sw = el('span', { style: 'width:12px;height:12px;border-radius:2px;display:inline-block;background:' + layerColor(name) + ';' });
        row.appendChild(cb); row.appendChild(sw);
        row.appendChild(el('span', {}, [name + ' (' + lay.count + ')']));
        layerList.appendChild(row);
      });

      btnFit.onclick = function () { view.fit(); };
      btnMeasure.onclick = function () {
        var on = view.toggleMeasure();
        btnMeasure.style.background = on ? '#00695c' : '#1c2b3a';
        status.textContent = on ? 'وضع القياس: انقر نقطتين لقياس المسافة.'
                                : 'الكيانات: ' + model.entities.length + ' • الطبقات: ' + Object.keys(model.layers).length;
      };
    }

    window.addEventListener('resize', function () { if (view) { sizeCanvas(); view.fit(); } });

    // حمّل النص: إمّا opts.text مباشرة أو عبر fetch لـ opts.url
    if (opts.text) {
      setTimeout(function () { boot(opts.text); }, 0);
    } else if (opts.url) {
      fetch(opts.url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(boot).catch(function (err) {
        status.textContent = 'تعذّر تحميل الملف: ' + err.message;
      });
    } else {
      status.textContent = 'لم يُحدَّد ملف DXF.';
    }

    return { close: close };
  }

  function btnStyle(bg) {
    return 'background:' + (bg || '#1c2b3a') + ';color:#e8eaed;border:1px solid #2a3b4c;' +
           'border-radius:6px;padding:6px 12px;font:600 13px system-ui,sans-serif;cursor:pointer;';
  }

  window.DxfViewer = {
    open: openModal,
    parse: parse,
    _last: null,
    _DxfView: DxfView
  };
})();
