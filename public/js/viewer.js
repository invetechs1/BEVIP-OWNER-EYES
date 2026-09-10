/**
 * بصير | عارض المستندات والمخططات مع الترميز الكامل (Markup & Review)
 * - يفتح PDF حقيقياً داخل النظام (PDF.js) والصور، مع أدوات: قلم، مستطيل، سهم،
 *   تظليل، سحابة مراجعة، نص، دبابيس مرقمة، وأختام (اعتماد/رفض/للمراجعة).
 * - الحفظ يتم على نفس المستند بلا ملفات مكررة، مع سجل كامل للحالات والنسخ.
 * - المقاول يرد على ملاحظات الاستشاري على نفس نسخة المستند ثم يعيد التقديم،
 *   فتُؤرشف النسخة السابقة (ملف + ترميز + قرار) في revisions تلقائياً.
 * الإحداثيات تُخزن منسوبة (0..1) لكل صفحة فتبقى صحيحة مع أي مقاس عرض.
 */
(function () {
  'use strict';

  I18n.registerDict({
    'ربط بجدول الكميات': 'Link to BOQ',
    'عرض الربط بجدول الكميات': 'View BOQ Linking',
    'أداة الربط': 'Mapping Tool',
    'تحديد': 'Select',
    'رسم منطقة جديدة': 'Draw New Area',
    'اختر منطقة مرسومة، أو ارسم منطقة جديدة لربطها ببند كميات.': 'Select a drawn area, or draw a new one to link it to a BOQ item.',
    'منطقة مرتبطة': 'Mapped Area',
    'منطقة جديدة — لم تُحفظ بعد': 'New Area — Not Saved Yet',
    'نسبة التخصيص': 'Allocation',
    'تغيير الربط': 'Change Link',
    'نسبة التخصيص لهذه المنطقة': 'Allocation for this area',
    'حذف المنطقة': 'Delete Area',
    'حذف هذه المنطقة نهائياً؟': 'Permanently delete this area?',
    'تم الحذف': 'Deleted',
    'ارسم منطقة جديدة — الآن اربطها ببند كميات في اللوحة الجانبية': 'New area drawn — now link it to a BOQ item in the side panel'
  });

  const esc = Charts.esc;
  const APPROVAL_COLS = ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments',
    'methodStatements', 'claims', 'valueEngineering', 'handoverDocs'];
  const COLORS = ['#ff3b30', '#ffcc00', '#2dd4a0', '#4cc9f0', '#ffffff'];
  const IMG_EXT = /\.(png|jpe?g|webp|gif|bmp)$/i;
  const PDF_EXT = /\.pdf$/i;
  const DXF_EXT = /\.dxf$/i;
  const STAMPS = [
    ['اعتُمد ✔', '#2dd4a0'], ['اعتُمد بملاحظات', '#4cc9f0'],
    ['مرفوض ✖', '#ff3b30'], ['أعد التقديم', '#ffcc00'], ['تمت المراجعة', '#ffffff']
  ];
  const HIST_LABELS = {
    pending: 'قُدّم للمراجعة', approved: 'اعتُمد', approved_notes: 'اعتُمد مع ملاحظات',
    rejected: 'أُرجع للمقاول', resubmitted: 'أُعيد التقديم (نسخة معدلة)',
    open: 'فُتح', answered: 'تم الرد'
  };

  let pdfjsPromise = null;
  function loadPdfjs() {
    if (!pdfjsPromise) {
      pdfjsPromise = import('/vendor/pdfjs/pdf.min.mjs').then(function (lib) {
        lib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
        return lib;
      });
    }
    return pdfjsPromise;
  }

  function fileOf(item) {
    const f = item.file;
    if (!f) return { name: '', url: '', isImage: false, isPdf: false, isDxf: false };
    if (typeof f === 'string') return { name: f, url: '', isImage: false, isPdf: false, isDxf: false };
    const name = f.name || '', url = f.url || '';
    return {
      name: name, url: url,
      isImage: !!url && IMG_EXT.test(name || url),
      isPdf: !!url && PDF_EXT.test(name || url),
      isDxf: !!url && DXF_EXT.test(name || url)
    };
  }

  /**
   * فتح العارض.
   * opts: { canEdit (يرسم ويحفظ), canReview (أزرار الاعتماد/الإرجاع),
   *         canRespond (المقاول: رد على الملاحظات + إعادة تقديم), onDone }
   */
  function openDrawingViewer(ctx, collection, item, opts) {
    opts = opts || {};
    const VS = window.ViewsShared;
    const f = fileOf(item);
    const canEdit = !!opts.canEdit;
    const canReview = !!opts.canReview && APPROVAL_COLS.indexOf(collection) !== -1 && item.status === 'pending';
    const canRespond = !!opts.canRespond && item.status !== 'pending';
    const canDraw = canEdit || canRespond;
    // مناطق مرتبطة ببنود الكميات (§6/§8 من وثيقة المتطلبات): العرض متاح لأي دور يفتح مخططاً يدعمه (المالك يرى الاعتماد الفعلي)،
    // بينما الإنشاء/التعديل يقتصر على الاستشاري/الأدمن فقط.
    const showMap = !!opts.showMap;
    const canMap = showMap && !!opts.canMap;
    const canDeleteMap = canMap && ctx.U.role === 'admin'; // الحذف متاح للأدمن فقط — يطابق قاعدة النظام العامة (deleteItem)
    let anns = JSON.parse(JSON.stringify(item.annotations || []));
    let tool = 'pen', color = COLORS[0], stampIdx = 0, current = null, dirty = false;
    let page = 1, numPages = 1, pdfDoc = null, viewingRev = null; // viewingRev: عرض نسخة مؤرشفة للقراءة
    let mapMode = false, mapTool = 'select', mapDraft = null, mapSelected = null;

    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML =
      '<div class="dv-wrap">' +
      '<div class="dv-head">' +
      '<div><b>🖊 ' + esc(item.title || f.name) + '</b>' +
      '<div class="small muted">' + esc(item.ref || '') +
      (item.docCode ? ' · <span style="color:var(--accent2)">' + esc(item.docCode) + '</span>' : '') +
      (f.name ? ' · 📎 ' + esc(f.name) : '') +
      (item.markupBy ? ' · آخر ترميز: ' + esc(item.markupBy) + ' (' + esc(item.markupDate || '') + ')' : '') + '</div></div>' +
      '<span class="spacer"></span>' +
      '<span id="dv-pagenav" style="display:none" class="flex">' +
      '<button class="btn mutedb sm" id="dv-prev">‹</button>' +
      '<span class="small num" id="dv-pageno" style="min-width:52px;text-align:center"></span>' +
      '<button class="btn mutedb sm" id="dv-next">›</button></span>' +
      VS.pill(item.status || '') +
      (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ الملف الأصلي</a>' : '') +
      (showMap ? '<button class="btn mutedb sm" id="dv-maptoggle">🗺️ ' + (canMap ? I18n.t('ربط بجدول الكميات') : I18n.t('عرض الربط بجدول الكميات')) + '</button>' : '') +
      '<button class="btn mutedb sm" id="dv-close">✕ إغلاق</button></div>' +

      (canDraw ?
        '<div class="dv-tools">' +
        '<span class="small muted">الأداة:</span>' +
        [['pen', '✏️ ريدلاين'], ['hl', '🖍 تظليل'], ['cloud', '☁️ سحابة'], ['rect', '⬜ مستطيل'],
         ['arrow', '↗ سهم'], ['text', '🅰 نص'], ['pin', '📍 ملاحظة'], ['stamp', '🔖 ختم']].map(function (t) {
          return '<button class="dv-tool' + (t[0] === 'pen' ? ' active' : '') + '" data-tool="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
        '<select class="inp" id="dv-stampsel" style="display:none;max-width:170px;padding:5px 10px;font-size:12px">' +
        STAMPS.map(function (s, i) { return '<option value="' + i + '">' + s[0] + '</option>'; }).join('') + '</select>' +
        '<span class="small muted" style="margin-inline-start:10px">اللون:</span>' +
        COLORS.map(function (c, i) {
          return '<button class="dv-color' + (i === 0 ? ' active' : '') + '" data-color="' + c + '" style="background:' + c + '"></button>';
        }).join('') +
        '<span class="spacer"></span>' +
        '<button class="btn mutedb sm" id="dv-undo">↩ تراجع</button>' +
        '<button class="btn mutedb sm" id="dv-clearall">🗑 مسح الكل</button>' +
        '<button class="btn sm" id="dv-save">💾 ' + (canRespond ? 'حفظ ردودي على نفس المستند' : 'حفظ الترميز') + '</button>' +
        '</div>' : '') +

      (showMap ?
        '<div class="dv-tools" id="dv-maptools" style="display:none">' +
        '<span class="small muted">' + I18n.t('أداة الربط') + ':</span>' +
        '<button class="dv-maptool active" data-maptool="select">✋ ' + I18n.t('تحديد') + '</button>' +
        (canMap ? '<button class="dv-maptool" data-maptool="draw">▭ ' + I18n.t('رسم منطقة جديدة') + '</button>' : '') +
        '<span class="spacer"></span>' +
        '<span class="small muted" style="display:flex;gap:12px;align-items:center">' +
        '<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#30a46c;margin-inline-end:4px"></i>' + I18n.t('معتمد بالكامل') + '</span>' +
        '<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#f5a524;margin-inline-end:4px"></i>' + I18n.t('إنجاز جزئي') + '</span>' +
        '<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#3a4258;margin-inline-end:4px"></i>' + I18n.t('لم يبدأ') + '</span>' +
        '</span></div>' : '') +

      '<div class="dv-body"><div class="dv-stage-wrap"><div class="dv-stage" id="dv-stage"' +
      (f.isDxf ? ' style="min-height:60vh"' : '') + '>' + // dv-dxf-host أدناه absolute بلا ارتفاع طبيعي؛ بلا هذا يبقى dv-stage صفر الارتفاع

      (f.isImage
        ? '<img id="dv-img" src="' + esc(f.url) + '" alt="" draggable="false">'
        : f.isPdf
          ? '<canvas id="dv-pdf"></canvas>'
          : f.isDxf
            ? '<div id="dv-dxf-host" style="position:absolute;inset:0;display:flex;flex-direction:column;background:#0f1720">' +
              '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#0c141c;border-bottom:1px solid #1e2a36;color:#e8eaed;font:600 13px system-ui,sans-serif">' +
              '<span>📐 مخطط متجه (DXF) — خطوط حقيقية قابلة للقياس</span>' +
              '<button class="btn mutedb sm" id="dv-dxf-fit" style="margin-inline-start:auto">⤢ احتواء</button>' +
              '<button class="btn mutedb sm" id="dv-dxf-measure">📏 قياس</button>' +
              '<span id="dv-dxf-coord" style="color:#90a4ae;font-weight:400;font-size:12px;min-width:150px">—</span></div>' +
              '<div style="flex:1;position:relative;min-height:0"><canvas id="dv-dxf-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab"></canvas>' +
              '<div id="dv-dxf-status" style="position:absolute;left:0;right:0;bottom:0;padding:6px 10px;background:rgba(0,0,0,.4);color:#b0bec5;font:12px system-ui,sans-serif;pointer-events:none">جارٍ تحميل المخطط…</div></div></div>'
            : '<div class="dv-sheet" id="dv-sheet"><div class="dv-sheet-title">📐 ' + esc(item.title || 'المخطط') + '</div>' +
              '<div class="dv-sheet-sub">' + esc(item.ref || '') + (f.name ? ' · ' + esc(f.name) : '') + '</div>' +
              '<div class="dv-sheet-note">ورقة ترميز — الملف الأصلي بصيغة غير قابلة للمعاينة داخل المتصفح' + (f.url ? ' (حمّله من الزر أعلاه)' : '') + '</div></div>') +
      '<canvas id="dv-canvas"' + (f.isDxf ? ' style="display:none"' : '') + '></canvas>' +
      (showMap ? '<div id="dv-maplayer" style="position:absolute;inset:0;display:none"></div>' : '') +
      '</div></div>' +

      '<div class="dv-side">' +
      (showMap ? '<div class="dv-pins" id="dv-mappanel" style="display:none"></div>' : '') +
      '<div class="dv-pins" id="dv-pins"></div>' +
      '<div id="dv-history"></div>' +
      (canReview ?
        '<div class="dv-review"><label class="fl">ملاحظات القرار (تصل للمقاول مع الترميز)</label>' +
        '<textarea class="inp" id="dv-notes" rows="2" placeholder="اكتب ملاحظاتك..."></textarea>' +
        '<div class="m-actions">' +
        '<button class="btn ok" id="dv-approve">✅ اعتماد</button>' +
        '<button class="btn" id="dv-approve-notes">📝 اعتماد مع ملاحظات</button>' +
        '<button class="btn danger" id="dv-reject">↩ إرجاع للمقاول لعمل اللازم</button>' +
        '</div></div>'
        : (item.notes || item.signature ?
          '<div class="dv-review"><b class="small">قرار الاستشاري:</b><div class="small" style="margin-top:6px">' + esc(item.notes || '—') + '</div>' +
          (item.signature ? '<div class="sig">✍️ ' + esc(item.signature) + ' · ' + esc(item.signDate || '') + '</div>' : '') + '</div>' : '')) +
      (canRespond ?
        '<div class="dv-review"><b class="small">📤 إعادة التقديم على نفس المستند</b>' +
        '<div class="small muted" style="margin:6px 0;line-height:1.8">تُؤرشف النسخة الحالية (الملف + الترميز + القرار) تلقائياً في سجل النسخ — بلا ملفات مكررة.</div>' +
        '<label class="fl">ملف معدل (اختياري — يحل محل الحالي كنسخة جديدة)</label>' +
        '<input class="inp" id="dv-refile" type="file">' +
        '<div class="m-actions"><button class="btn block" id="dv-resubmit">🔄 إعادة التقديم للمراجعة</button></div></div>' : '') +
      '</div></div></div>';

    document.body.appendChild(back);

    const stage = back.querySelector('#dv-stage');
    const canvas = back.querySelector('#dv-canvas');
    const cx2 = canvas.getContext('2d');
    const img = back.querySelector('#dv-img');
    const pdfCanvas = back.querySelector('#dv-pdf');

    // ============ عرض DXF متجه حقيقي داخل النظام ============
    let dxfView = null;
    async function openDxf() {
      const host = back.querySelector('#dv-dxf-host');
      const dcanvas = back.querySelector('#dv-dxf-canvas');
      const dstatus = back.querySelector('#dv-dxf-status');
      const dcoord = back.querySelector('#dv-dxf-coord');
      if (!window.DxfViewer || !host || !dcanvas) {
        if (dstatus) dstatus.textContent = 'عارض DXF غير متوفر.';
        return;
      }
      function sizeCanvas() {
        const box = dcanvas.parentElement.getBoundingClientRect();
        dcanvas.width = Math.max(300, Math.floor(box.width));
        dcanvas.height = Math.max(200, Math.floor(box.height));
      }
      try {
        const res = await fetch(new URL(f.url, location.href).href);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        const model = window.DxfViewer.parse(text);
        if (!model.entities.length) { dstatus.textContent = 'لا توجد كيانات قابلة للرسم في هذا الملف.'; return; }
        sizeCanvas();
        dxfView = new window.DxfViewer._DxfView(dcanvas, model);
        dxfView._coordCb = function (w) { dcoord.textContent = 'X: ' + w.x.toFixed(2) + '  Y: ' + w.y.toFixed(2); };
        dstatus.textContent = 'الكيانات: ' + model.entities.length +
          ' • الطبقات: ' + Object.keys(model.layers).length +
          ' • الأبعاد: ' + model.bounds.w.toFixed(2) + ' × ' + model.bounds.h.toFixed(2) + ' وحدة';
        const bFit = back.querySelector('#dv-dxf-fit');
        const bMeasure = back.querySelector('#dv-dxf-measure');
        if (bFit) bFit.onclick = function () { dxfView.fit(); };
        if (bMeasure) bMeasure.onclick = function () {
          const on = dxfView.toggleMeasure();
          bMeasure.textContent = on ? '📏 إيقاف القياس' : '📏 قياس';
          dstatus.textContent = on ? 'وضع القياس: انقر نقطتين لقياس المسافة الحقيقية.'
            : 'الكيانات: ' + model.entities.length + ' • الطبقات: ' + Object.keys(model.layers).length;
        };
        window.addEventListener('resize', function () { if (dxfView) { sizeCanvas(); dxfView.fit(); } });
      } catch (e) {
        dstatus.textContent = 'تعذّر تحميل مخطط DXF: ' + e.message;
      }
    }

    // ============ عرض PDF حقيقي داخل النظام ============
    async function openPdf() {
      try {
        const lib = await loadPdfjs();
        pdfDoc = await lib.getDocument({ url: new URL(f.url, location.href).href }).promise;
        numPages = pdfDoc.numPages;
        if (numPages > 1) {
          back.querySelector('#dv-pagenav').style.display = 'inline-flex';
        }
        await renderPdfPage();
      } catch (e) {
        // فشل التحميل (ديمو بلا خادم مثلاً): نعود لورقة الترميز
        pdfCanvas.style.display = 'none';
        const sheet = document.createElement('div');
        sheet.className = 'dv-sheet'; sheet.id = 'dv-sheet';
        sheet.innerHTML = '<div class="dv-sheet-title">📐 ' + esc(item.title || 'المخطط') + '</div>' +
          '<div class="dv-sheet-sub">' + esc(f.name) + '</div>' +
          '<div class="dv-sheet-note">تعذّرت معاينة الـPDF هنا — الترميز يُحفظ على المستند نفسه</div>';
        stage.insertBefore(sheet, canvas);
        fit();
      }
    }

    // مهمة العرض الحالية على نفس الكانفس — PDF.js يمنع بدء عرض جديد قبل انتهاء/إلغاء السابق صراحةً
    // (مثلاً عند نقر "التالي/السابق" بسرعة قبل اكتمال عرض الصفحة الأولى)
    let pdfRenderTask = null;
    async function renderPdfPage() {
      if (!pdfDoc) return;
      if (pdfRenderTask) { try { pdfRenderTask.cancel(); await pdfRenderTask.promise; } catch (e) { /* إلغاء متوقع — نتجاهله */ } }
      const pg = await pdfDoc.getPage(page);
      const wrapW = Math.max(stage.parentElement.clientWidth - 20, 640);
      const vp1 = pg.getViewport({ scale: 1 });
      const scale = wrapW / vp1.width;
      const vp = pg.getViewport({ scale: scale * devicePixelRatio });
      pdfCanvas.width = vp.width; pdfCanvas.height = vp.height;
      pdfCanvas.style.width = Math.round(vp.width / devicePixelRatio) + 'px';
      pdfCanvas.style.height = Math.round(vp.height / devicePixelRatio) + 'px';
      pdfRenderTask = pg.render({ canvasContext: pdfCanvas.getContext('2d'), viewport: vp });
      try { await pdfRenderTask.promise; } catch (e) { if (e && e.name === 'RenderingCancelledException') return; throw e; }
      pdfRenderTask = null;
      back.querySelector('#dv-pageno').textContent = page + ' / ' + numPages;
      fit();
    }

    function gotoPage(d) {
      const n = Math.min(numPages, Math.max(1, page + d));
      if (n === page) return;
      page = n; current = null; mapSelected = null;
      renderPdfPage();
    }
    back.querySelector('#dv-prev').addEventListener('click', function () { gotoPage(1); });  // RTL: السابق يميناً
    back.querySelector('#dv-next').addEventListener('click', function () { gotoPage(-1); });

    function fit() {
      const base = img || (pdfCanvas && pdfCanvas.style.display !== 'none' ? pdfCanvas : back.querySelector('#dv-sheet'));
      if (!base) return;
      const w = base.clientWidth, h = base.clientHeight;
      if (!w || !h) return;
      canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      cx2.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      redraw();
      if (showMap && mapMode) renderMapLayer();
    }

    function W() { return canvas.clientWidth; }
    function H() { return canvas.clientHeight; }
    function activeAnns() { return viewingRev ? (viewingRev.annotations || []) : anns; }
    function pageAnns() { return activeAnns().filter(function (a) { return (a.page || 1) === page; }); }

    function drawArrow(a) {
      const x1 = a.from[0] * W(), y1 = a.from[1] * H(), x2 = a.to[0] * W(), y2 = a.to[1] * H();
      cx2.beginPath(); cx2.moveTo(x1, y1); cx2.lineTo(x2, y2); cx2.stroke();
      const ang = Math.atan2(y2 - y1, x2 - x1);
      cx2.beginPath();
      cx2.moveTo(x2, y2);
      cx2.lineTo(x2 - 14 * Math.cos(ang - 0.45), y2 - 14 * Math.sin(ang - 0.45));
      cx2.lineTo(x2 - 14 * Math.cos(ang + 0.45), y2 - 14 * Math.sin(ang + 0.45));
      cx2.closePath(); cx2.fillStyle = cx2.strokeStyle; cx2.fill();
    }

    /** سحابة مراجعة: أقواس متتالية على محيط المستطيل */
    function drawCloud(a) {
      const x = Math.min(a.from[0], a.to[0]) * W(), y = Math.min(a.from[1], a.to[1]) * H();
      const w = Math.abs(a.to[0] - a.from[0]) * W(), h = Math.abs(a.to[1] - a.from[1]) * H();
      if (w < 8 || h < 8) return;
      const r = Math.max(7, Math.min(14, Math.min(w, h) / 6));
      cx2.beginPath();
      let i;
      const nx = Math.max(2, Math.round(w / (r * 1.6))), ny = Math.max(2, Math.round(h / (r * 1.6)));
      for (i = 0; i < nx; i++) cx2.arc(x + (i + 0.5) * w / nx, y, r, Math.PI, 0);              // أعلى
      for (i = 0; i < ny; i++) cx2.arc(x + w, y + (i + 0.5) * h / ny, r, -Math.PI / 2, Math.PI / 2); // يمين
      for (i = nx - 1; i >= 0; i--) cx2.arc(x + (i + 0.5) * w / nx, y + h, r, 0, Math.PI);     // أسفل
      for (i = ny - 1; i >= 0; i--) cx2.arc(x, y + (i + 0.5) * h / ny, r, Math.PI / 2, -Math.PI / 2); // يسار
      cx2.stroke();
    }

    function drawStamp(a) {
      const x = a.at[0] * W(), y = a.at[1] * H();
      cx2.font = '800 16px Tahoma';
      const tw = cx2.measureText(a.text).width;
      cx2.save();
      cx2.translate(x, y); cx2.rotate(-0.12);
      cx2.strokeStyle = a.color; cx2.lineWidth = 2.5;
      cx2.globalAlpha = 0.9;
      cx2.strokeRect(-tw / 2 - 14, -20, tw + 28, 40);
      cx2.fillStyle = a.color; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
      cx2.fillText(a.text, 0, 1);
      if (a.by) { cx2.font = '600 9px Tahoma'; cx2.fillText(a.by + ' · ' + (a.date || ''), 0, 14); }
      cx2.restore();
      cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic'; cx2.globalAlpha = 1;
    }

    function drawAnn(a) {
      cx2.strokeStyle = a.color; cx2.fillStyle = a.color; cx2.lineWidth = 2.5; cx2.lineJoin = 'round'; cx2.lineCap = 'round';
      if (a.type === 'pen') {
        cx2.beginPath();
        a.points.forEach(function (pt, i) { i ? cx2.lineTo(pt[0] * W(), pt[1] * H()) : cx2.moveTo(pt[0] * W(), pt[1] * H()); });
        cx2.stroke();
      } else if (a.type === 'rect') {
        cx2.strokeRect(a.from[0] * W(), a.from[1] * H(), (a.to[0] - a.from[0]) * W(), (a.to[1] - a.from[1]) * H());
      } else if (a.type === 'hl') {
        cx2.globalAlpha = 0.3;
        cx2.fillRect(a.from[0] * W(), a.from[1] * H(), (a.to[0] - a.from[0]) * W(), (a.to[1] - a.from[1]) * H());
        cx2.globalAlpha = 1;
      } else if (a.type === 'cloud') {
        drawCloud(a);
      } else if (a.type === 'arrow') {
        drawArrow(a);
      } else if (a.type === 'stamp') {
        drawStamp(a);
      } else if (a.type === 'text') {
        cx2.font = '700 15px Tahoma'; cx2.direction = 'rtl';
        cx2.fillText(a.text, a.at[0] * W(), a.at[1] * H());
      } else if (a.type === 'pin') {
        const x = a.at[0] * W(), y = a.at[1] * H();
        cx2.beginPath(); cx2.arc(x, y, 12, 0, 7); cx2.fill();
        cx2.fillStyle = '#10151f'; cx2.font = '800 12px Tahoma'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
        cx2.fillText(String(a.n), x, y + 1);
        cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic';
      }
    }

    function redraw() {
      cx2.clearRect(0, 0, W(), H());
      pageAnns().forEach(drawAnn);
      if (current) drawAnn(current);
      drawPinsList();
      drawHistory();
    }

    // ============ قائمة الملاحظات + ردود المقاول على نفس المستند ============
    function drawPinsList() {
      const list = activeAnns();
      const noted = list.filter(function (a) { return a.type === 'pin' || a.type === 'text' || a.type === 'stamp'; });
      const box = back.querySelector('#dv-pins');
      if (!noted.length) {
        box.innerHTML = '<div class="small muted">' + (canDraw ? 'ارسم على المستند أو أضف ملاحظات مرقمة 📍 بالنقر على الموضع' : 'لا توجد ملاحظات مرسومة على هذا المستند') + '</div>';
        return;
      }
      box.innerHTML = '<b class="small">📍 الملاحظات على المستند' + (viewingRev ? ' (نسخة ' + viewingRev.rev + ' مؤرشفة)' : '') + ':</b>' +
        noted.map(function (a) {
          const idx = list.indexOf(a);
          const badge = a.type === 'pin' ? String(a.n) : a.type === 'stamp' ? '🔖' : '🅰';
          return '<div class="dv-pin-row" style="align-items:flex-start;flex-direction:column">' +
            '<div class="flex" style="gap:8px"><span class="dv-pin-n" style="background:' + a.color + '">' + badge + '</span>' +
            '<span class="small">' + esc(a.text) + (a.page && numPages > 1 ? ' <span class="muted num">(ص' + a.page + ')</span>' : '') + '</span></div>' +
            (a.replies || []).map(function (r) {
              return '<div class="small dv-reply">↩ <b>' + esc(r.by) + '</b> <span class="muted num">' + esc(r.date) + '</span><br>' + esc(r.text) + '</div>';
            }).join('') +
            (canRespond && !viewingRev && a.type !== 'stamp' ? '<button class="btn ghost sm" data-reply="' + idx + '" style="margin-top:4px">↩ رد على الملاحظة</button>' : '') +
            '</div>';
        }).join('');
      box.querySelectorAll('[data-reply]').forEach(function (b) {
        b.addEventListener('click', function () {
          const a = anns[Number(b.getAttribute('data-reply'))];
          const txt = prompt('ردك على الملاحظة (يُسجل باسمك على نفس المستند):');
          if (!txt) return;
          if (!a.replies) a.replies = [];
          a.replies.push({ by: ctx.U.name, date: new Date().toISOString().slice(0, 10), text: txt });
          dirty = true; redraw();
        });
      });
    }

    // ============ سجل الحالات والنسخ (Audit trail داخل المستند) ============
    function drawHistory() {
      const box = back.querySelector('#dv-history');
      const hist = item.history || [];
      const revs = item.revisions || [];
      if (!hist.length && !revs.length) { box.innerHTML = ''; return; }
      box.innerHTML =
        '<div class="dv-pins">' +
        (revs.length ?
          '<b class="small">🗂 نسخ المستند (' + (revs.length + 1) + '):</b>' +
          '<div class="flex" style="flex-wrap:wrap;gap:6px;margin:8px 0">' +
          revs.map(function (r) {
            return '<button class="btn ghost sm' + (viewingRev === r ? ' active' : '') + '" data-rev="' + r.rev + '">نسخة ' + r.rev +
              ' <span class="muted num">' + esc(r.archivedAt || '') + '</span></button>';
          }).join('') +
          '<button class="btn ' + (viewingRev ? 'ghost ' : '') + 'sm" data-rev="cur">النسخة الحالية</button></div>' : '') +
        (hist.length ?
          '<b class="small">🕓 سجل الحالات:</b>' +
          hist.slice().reverse().map(function (h) {
            return '<div class="dv-hist-row"><span class="num muted small">' + esc(h.date || '') + '</span> ' +
              '<b class="small">' + esc(HIST_LABELS[h.status] || h.status) + '</b>' +
              '<span class="small muted"> — ' + esc(h.by || '') + '</span>' +
              (h.notes ? '<div class="small muted" style="margin-top:2px">' + esc(h.notes) + '</div>' : '') + '</div>';
          }).join('') : '') +
        ((item.reviewDays != null && item.reviewEndDate) ?
          '<div class="small mt" style="color:var(--accent2)">⏱ مدة المراجعة: <b class="num">' + item.reviewDays + '</b> يوم (' +
          esc(item.reviewStartDate || item.date || '') + ' ← ' + esc(item.reviewEndDate) + ')</div>' : '') +
        '</div>';
      box.querySelectorAll('[data-rev]').forEach(function (b) {
        b.addEventListener('click', function () {
          const v = b.getAttribute('data-rev');
          viewingRev = v === 'cur' ? null : revs.find(function (r) { return String(r.rev) === v; }) || null;
          redraw();
        });
      });
    }

    function pos(ev) {
      const r = canvas.getBoundingClientRect();
      return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
    }

    // ============ ربط مناطق المخطط ببنود الكميات (§6 من وثيقة المتطلبات) ============
    // كل منطقة مستطيلة تُخزَّن بإحداثيات منسوبة (0..1) لنفس الصفحة، ونفس نمط تخزين
    // الترميز أعلاه — وتُلوَّن حسب نسبة إنجاز بند الكميات المربوط بها (bq.progress)،
    // بلا أي حساب مواز؛ نفس مصدر الحقيقة الذي تعتمده لوحة القيادة والتقارير.
    const mapLayer = showMap ? back.querySelector('#dv-maplayer') : null;
    const mapPanel = showMap ? back.querySelector('#dv-mappanel') : null;

    function mapStatusColor(bq) {
      if (!bq) return null;
      const p = bq.progress || 0;
      if (p >= 100) return '#30a46c';
      if (p > 0) return '#f5a524';
      return '#3a4258';
    }
    function pageMappings() {
      if (!showMap) return [];
      return (ctx.S.drawingMappings || []).filter(function (m) { return m.drawingId === item.id && (m.page || 1) === page; });
    }
    function boqOf(m) { return (ctx.S.boqItems || []).find(function (b) { return b.id === m.boqItemId; }) || null; }
    function relevantBoq() {
      return (ctx.S.boqItems || []).filter(function (b) { return !item.floor || item.floor === 'ELEV' || b.floor === item.floor; })
        .sort(function (a, b) { return (a.code || '').localeCompare(b.code || ''); });
    }
    function mapPosPct(ev) {
      const r = mapLayer.getBoundingClientRect();
      return [Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height))];
    }

    /** منطقة مرسومة للتو ولم تُحفظ بعد — لا تُكتب على الخادم إلا بعد اختيار بند كميات صراحةً (§ لا سجلات يتيمة) */
    function renderPendingPanel() {
      const x = Math.min(mapDraft.from[0], mapDraft.to[0]), y = Math.min(mapDraft.from[1], mapDraft.to[1]);
      const w = Math.abs(mapDraft.to[0] - mapDraft.from[0]), h = Math.abs(mapDraft.to[1] - mapDraft.from[1]);
      mapPanel.innerHTML =
        '<b class="small">▭ ' + I18n.t('منطقة جديدة — لم تُحفظ بعد') + '</b>' +
        '<div class="mt">' +
        '<label class="fl">' + I18n.t('اربط ببند كميات') + '</label>' +
        '<select class="inp" id="dm-boqsel"><option value="">' + I18n.t('اختر بند كميات...') + '</option>' +
        relevantBoq().map(function (b) { return '<option value="' + b.id + '">' + esc(b.code || b.id) + ' — ' + esc(b.description || '') + '</option>'; }).join('') + '</select>' +
        '<label class="fl">' + I18n.t('نسبة التخصيص لهذه المنطقة') + '</label>' +
        '<input class="inp num" id="dm-pct" type="number" min="1" max="100" value="100">' +
        '<div class="m-actions">' +
        '<button class="btn sm" id="dm-save">💾 ' + I18n.t('حفظ الربط') + '</button>' +
        '<button class="btn mutedb sm" id="dm-cancel">' + I18n.t('إلغاء') + '</button>' +
        '</div></div>';
      mapPanel.querySelector('#dm-save').addEventListener('click', async function () {
        const boqItemId = mapPanel.querySelector('#dm-boqsel').value;
        if (!boqItemId) { VS.toast(I18n.t('اختر بند كميات...'), true); return; }
        const pct = Math.max(1, Math.min(100, Number(mapPanel.querySelector('#dm-pct').value) || 100));
        try {
          const created = await Api.create('drawingMappings', {
            drawingId: item.id, projectId: ctx.projectId, page: page, x: x, y: y, w: w, h: h,
            boqItemId: boqItemId, allocationPct: pct
          });
          mapDraft = null;
          await ctx.refreshSilent();
          mapSelected = created;
          VS.toast(I18n.t('تم الربط بنجاح'));
          renderMapLayer(); renderMapPanel();
        } catch (e) { VS.toast(e.message, true); }
      });
      mapPanel.querySelector('#dm-cancel').addEventListener('click', function () {
        mapDraft = null; // لم يُكتب شيء على الخادم بعد — إلغاء نظيف بلا أي أثر
        renderMapLayer(); renderMapPanel();
      });
    }

    function renderMapPanel() {
      if (!mapPanel) return;
      if (mapDraft) { renderPendingPanel(); return; }
      if (!mapSelected) {
        mapPanel.innerHTML = '<div class="small muted">' + I18n.t('اختر منطقة مرسومة، أو ارسم منطقة جديدة لربطها ببند كميات.') + '</div>';
        return;
      }
      const m = mapSelected;
      const bq = boqOf(m);
      let html = '<b class="small">📐 ' + I18n.t('منطقة مرتبطة') + '</b>';
      if (bq) {
        html += '<div class="mt small"><b>' + esc(bq.code || bq.id) + '</b> — ' + esc(bq.description || '') + '</div>' +
          '<div class="flex" style="justify-content:space-between;margin-top:8px"><span class="small muted">' + I18n.t('الإنجاز المعتمد') + '</span><b class="num small">' + (bq.progress || 0) + '%</b></div>' +
          '<div class="bar" style="margin-top:4px"><i style="width:' + (bq.progress || 0) + '%;background:' + mapStatusColor(bq) + '"></i></div>' +
          '<div class="small muted mt">' + I18n.t('نسبة التخصيص') + ': <b class="num">' + (m.allocationPct || 100) + '%</b></div>';
      }
      if (canMap) {
        html += '<div class="mt" style="border-top:1px solid var(--border);padding-top:10px">' +
          '<label class="fl">' + (bq ? I18n.t('تغيير الربط') : I18n.t('اربط ببند كميات')) + '</label>' +
          '<select class="inp" id="dm-boqsel"><option value="">' + I18n.t('اختر بند كميات...') + '</option>' +
          relevantBoq().map(function (b) {
            return '<option value="' + b.id + '"' + (m.boqItemId === b.id ? ' selected' : '') + '>' + esc(b.code || b.id) + ' — ' + esc(b.description || '') + '</option>';
          }).join('') + '</select>' +
          '<label class="fl">' + I18n.t('نسبة التخصيص لهذه المنطقة') + '</label>' +
          '<input class="inp num" id="dm-pct" type="number" min="1" max="100" value="' + (m.allocationPct || 100) + '">' +
          '<div class="m-actions">' +
          '<button class="btn sm" id="dm-save">💾 ' + I18n.t('حفظ الربط') + '</button>' +
          (canDeleteMap ? '<button class="btn danger sm" id="dm-del">🗑 ' + I18n.t('حذف المنطقة') + '</button>' : '') +
          '</div></div>';
      }
      mapPanel.innerHTML = html;
      const saveBtn = mapPanel.querySelector('#dm-save');
      if (saveBtn) saveBtn.addEventListener('click', async function () {
        const boqItemId = mapPanel.querySelector('#dm-boqsel').value;
        if (!boqItemId) { VS.toast(I18n.t('اختر بند كميات...'), true); return; }
        const pct = Math.max(1, Math.min(100, Number(mapPanel.querySelector('#dm-pct').value) || 100));
        try {
          await Api.update('drawingMappings', m.id, { boqItemId: boqItemId, allocationPct: pct });
          await ctx.refreshSilent();
          VS.toast(I18n.t('تم الربط بنجاح'));
          mapSelected = (ctx.S.drawingMappings || []).find(function (x) { return x.id === m.id; }) || null;
          renderMapLayer(); renderMapPanel();
        } catch (e) { VS.toast(e.message, true); }
      });
      const delBtn = mapPanel.querySelector('#dm-del');
      if (delBtn) delBtn.addEventListener('click', async function () {
        if (!confirm(I18n.t('حذف هذه المنطقة نهائياً؟'))) return;
        try {
          await Api.remove('drawingMappings', m.id);
          await ctx.refreshSilent();
          mapSelected = null;
          VS.toast(I18n.t('تم الحذف'));
          renderMapLayer(); renderMapPanel();
        } catch (e) { VS.toast(e.message, true); }
      });
    }

    function renderMapLayer() {
      if (!mapLayer) return;
      mapLayer.innerHTML = '';
      pageMappings().forEach(function (m) {
        const bq = boqOf(m);
        const box = document.createElement('div');
        box.style.cssText = 'position:absolute;cursor:pointer;border:1.5px solid;left:' + (m.x * 100) + '%;top:' + (m.y * 100) + '%;width:' + (m.w * 100) + '%;height:' + (m.h * 100) + '%;';
        const c = mapStatusColor(bq) || '#8b95a8';
        box.style.borderColor = c;
        box.style.background = c + (bq ? '46' : '22');
        if (m === mapSelected || (mapSelected && mapSelected.id === m.id)) box.style.boxShadow = '0 0 0 2px var(--accent)';
        box.title = bq ? (bq.code || bq.id) + ' — ' + (bq.progress || 0) + '%' : I18n.t('غير مربوط');
        box.addEventListener('click', function (e) {
          e.stopPropagation();
          if (mapTool !== 'select') return;
          mapDraft = null; // اختيار منطقة موجودة يُلغي أي رسم جديد غير محفوظ (لم يُكتب على الخادم أصلاً)
          mapSelected = m;
          renderMapLayer(); renderMapPanel();
        });
        mapLayer.appendChild(box);
      });
      if (mapDraft) {
        const box = document.createElement('div');
        const x = Math.min(mapDraft.from[0], mapDraft.to[0]), y = Math.min(mapDraft.from[1], mapDraft.to[1]);
        const w = Math.abs(mapDraft.to[0] - mapDraft.from[0]), h = Math.abs(mapDraft.to[1] - mapDraft.from[1]);
        box.style.cssText = 'position:absolute;border:1.5px dashed var(--accent);background:rgba(224,164,88,.18);left:' + (x * 100) + '%;top:' + (y * 100) + '%;width:' + (w * 100) + '%;height:' + (h * 100) + '%;';
        mapLayer.appendChild(box);
      }
    }

    if (showMap) {
      const toggleBtn = back.querySelector('#dv-maptoggle');
      const maptools = back.querySelector('#dv-maptools');
      toggleBtn.addEventListener('click', function () {
        mapMode = !mapMode;
        toggleBtn.classList.toggle('active', mapMode);
        maptools.style.display = mapMode ? '' : 'none';
        mapLayer.style.display = mapMode ? '' : 'none';
        mapPanel.style.display = mapMode ? '' : 'none';
        canvas.style.pointerEvents = mapMode ? 'none' : '';
        if (mapMode) { renderMapLayer(); renderMapPanel(); }
      });
      back.querySelectorAll('.dv-maptool').forEach(function (b) {
        b.addEventListener('click', function () {
          mapTool = b.getAttribute('data-maptool');
          back.querySelectorAll('.dv-maptool').forEach(function (x) { x.classList.toggle('active', x === b); });
          mapLayer.style.cursor = mapTool === 'draw' ? 'crosshair' : 'default';
        });
      });
    }

    // رسم منطقة جديدة — الاستشاري/الأدمن فقط. العرض والتحديد أعلاه متاحان لأي دور (canMap ⊂ showMap)
    if (canMap) {
      let mapDown = null;
      mapLayer.addEventListener('pointerdown', function (ev) {
        if (mapTool !== 'draw') return;
        mapDown = mapPosPct(ev);
        mapDraft = { from: mapDown, to: mapDown };
        mapLayer.setPointerCapture(ev.pointerId);
      });
      mapLayer.addEventListener('pointermove', function (ev) {
        if (!mapDraft) return;
        mapDraft.to = mapPosPct(ev);
        renderMapLayer();
      });
      mapLayer.addEventListener('pointerup', function () {
        if (!mapDraft) return;
        const w = Math.abs(mapDraft.to[0] - mapDraft.from[0]), h = Math.abs(mapDraft.to[1] - mapDraft.from[1]);
        if (w < 0.02 || h < 0.02) { mapDraft = null; renderMapLayer(); return; } // منطقة أصغر من أن تكون مقصودة
        // لا كتابة على الخادم هنا — تبقى محلية فقط حتى يختار المستخدم بند كميات ويحفظ صراحةً (renderPendingPanel)
        mapSelected = null;
        mapTool = 'select';
        back.querySelectorAll('.dv-maptool').forEach(function (x2) { x2.classList.toggle('active', x2.getAttribute('data-maptool') === 'select'); });
        renderMapLayer(); renderMapPanel();
      });
    }

    if (canDraw) {
      canvas.style.cursor = 'crosshair';
      canvas.addEventListener('pointerdown', function (ev) {
        if (viewingRev) return; // النسخ المؤرشفة للقراءة فقط
        const p = pos(ev);
        if (tool === 'stamp') {
          const s = STAMPS[stampIdx];
          anns.push({ type: 'stamp', at: p, text: s[0], color: s[1], page: page,
            by: ctx.U.name, date: new Date().toISOString().slice(0, 10) });
          dirty = true; redraw();
          return;
        }
        if (tool === 'text' || tool === 'pin') {
          const txt = prompt(tool === 'pin' ? 'نص الملاحظة المرقمة:' : 'النص الذي سيكتب على المستند:');
          if (txt) {
            if (tool === 'pin') {
              const n = anns.filter(function (a) { return a.type === 'pin'; }).length + 1;
              anns.push({ type: 'pin', at: p, text: txt, color: color, n: n, page: page, by: ctx.U.name });
            } else {
              anns.push({ type: 'text', at: p, text: txt, color: color, page: page, by: ctx.U.name });
            }
            dirty = true; redraw();
          }
          return;
        }
        canvas.setPointerCapture(ev.pointerId);
        current = tool === 'pen'
          ? { type: 'pen', points: [p], color: color, page: page }
          : { type: tool, from: p, to: p, color: color, page: page };
      });
      canvas.addEventListener('pointermove', function (ev) {
        if (!current) return;
        const p = pos(ev);
        if (current.type === 'pen') current.points.push(p); else current.to = p;
        redraw();
      });
      canvas.addEventListener('pointerup', function () {
        if (!current) return;
        anns.push(current); current = null; dirty = true; redraw();
      });

      back.querySelectorAll('.dv-tool').forEach(function (b) {
        b.addEventListener('click', function () {
          tool = b.getAttribute('data-tool');
          back.querySelector('#dv-stampsel').style.display = tool === 'stamp' ? '' : 'none';
          back.querySelectorAll('.dv-tool').forEach(function (x) { x.classList.toggle('active', x === b); });
        });
      });
      back.querySelector('#dv-stampsel').addEventListener('change', function (e) { stampIdx = Number(e.target.value); });
      back.querySelectorAll('.dv-color').forEach(function (b) {
        b.addEventListener('click', function () {
          color = b.getAttribute('data-color');
          back.querySelectorAll('.dv-color').forEach(function (x) { x.classList.toggle('active', x === b); });
        });
      });
      back.querySelector('#dv-undo').addEventListener('click', function () { anns.pop(); dirty = true; redraw(); });
      back.querySelector('#dv-clearall').addEventListener('click', function () {
        if (anns.length && confirm('مسح كل الترميز عن المستند؟')) { anns = []; dirty = true; redraw(); }
      });
      back.querySelector('#dv-save').addEventListener('click', function () { saveAnns(true); });
    }

    async function saveAnns(showToast) {
      try {
        await Api.update(collection, item.id, {
          annotations: anns,
          markupBy: ctx.U.name,
          markupDate: new Date().toISOString().slice(0, 10)
        });
        item.annotations = anns; dirty = false;
        if (showToast) VS.toast('💾 حُفظ على نفس المستند — بلا نسخ مكررة');
      } catch (e) { VS.toast(e.message, true); }
    }

    async function decide(status) {
      try {
        if (dirty || anns.length !== (item.annotations || []).length) await saveAnns(false);
        await Api.review({
          collection: collection, id: item.id, status: status,
          notes: back.querySelector('#dv-notes').value ||
            (status === 'rejected' ? 'مرجع للمقاول لعمل اللازم — راجع الترميز على المخطط' : '')
        });
        back.remove();
        VS.toast(status === 'rejected' ? '↩ أُرجع المستند للمقاول مع الترميز والملاحظات' : '✅ اعتُمد المستند بتوقيعك');
        if (opts.onDone) opts.onDone(); else ctx.refresh();
      } catch (e) { VS.toast(e.message, true); }
    }

    if (canReview) {
      back.querySelector('#dv-approve').addEventListener('click', function () { decide('approved'); });
      back.querySelector('#dv-approve-notes').addEventListener('click', function () { decide('approved_notes'); });
      back.querySelector('#dv-reject').addEventListener('click', function () { decide('rejected'); });
    }

    // إعادة التقديم: أرشفة النسخة ورجوع المستند لقيد المراجعة — دورة متصلة
    if (canRespond) {
      back.querySelector('#dv-resubmit').addEventListener('click', async function () {
        if (!confirm('إعادة تقديم المستند للمراجعة؟ ستؤرشف النسخة الحالية بترميزها وقرارها في سجل النسخ.')) return;
        try {
          if (dirty) await saveAnns(false);
          let newFile = null;
          const rf = back.querySelector('#dv-refile').files[0];
          if (rf) newFile = await Api.upload(rf, { versionOf: item.file && item.file.id });
          await Api.resubmit({ collection: collection, id: item.id, file: newFile || undefined });
          back.remove();
          VS.toast('🔄 أُعيد التقديم — أُرشفت النسخة السابقة وعاد المستند لقيد المراجعة');
          if (opts.onDone) opts.onDone(); else ctx.refresh();
        } catch (e) { VS.toast(e.message, true); }
      });
    }

    back.querySelector('#dv-close').addEventListener('click', function () {
      if (dirty && canDraw && confirm('لديك ترميز غير محفوظ — حفظه قبل الإغلاق؟')) { saveAnns(true).then(function () { back.remove(); }); return; }
      back.remove();
    });
    back.addEventListener('click', function (e) { if (e.target === back && !dirty) back.remove(); });

    if (img) { img.addEventListener('load', fit); if (img.complete) fit(); }
    else if (f.isPdf) openPdf();
    else if (f.isDxf) setTimeout(openDxf, 30);
    else setTimeout(fit, 30);
    window.addEventListener('resize', fit);
  }

  /** زر فتح العارض لعنصر فيه ملف أو ترميز */
  function viewerBtn(item, extra) {
    if (!item.file && !(item.annotations || []).length) return '';
    const n = (item.annotations || []).length;
    const f = fileOf(item);
    return '<button class="btn ghost sm" data-dview="' + item.id + '"' + (extra || '') + '>' +
      (f.isPdf ? '📄 PDF' : f.isDxf ? '📐 DXF' : '🖊 المخطط') +
      (n ? ' <span class="pill p-warn" style="font-size:10px;padding:1px 7px">' + n + '</span>' : '') + '</button>';
  }

  window.DrawingViewer = { open: openDrawingViewer, btn: viewerBtn };
})();
