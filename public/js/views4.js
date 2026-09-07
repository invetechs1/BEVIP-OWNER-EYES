/**
 * بصير | وحدة التسليم والإغلاق + مراحل المشروع + تقارير الحوادث
 * - قائمة تسليم تفاعلية (مستندات + متطلبات نظامية) قابلة للتحديث والرفع
 * - قائمة ملاحظات (Punch List) مرتبطة بالمقاول مع تتبع الإغلاق
 * - سجل الضمانات مع تنبيهات قرب الانتهاء
 * - سجل تسليم المفاتيح
 * - لوحة فترة ضمان العيوب DLP
 * - تقرير تسليم موحّد قابل للطباعة/التصدير PDF (عربي/إنجليزي)
 * - تكوين مراحل المشروع حسب نوعه (قابل للتخصيص)
 * - تقارير حوادث قابلة للأرشفة والطباعة مرتبطة بتنبيهات الكاميرات
 */
(function () {
  'use strict';

  const VS = window.ViewsShared;
  const esc = VS.esc, pill = VS.pill, toast = VS.toast, modal = VS.modal;

  function contractorName(ctx, id) {
    const c = (ctx.Sall || ctx.S).contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id || '—';
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
  function daysFromNow(dateStr) { if (!dateStr) return null; return Math.round((new Date(dateStr) - Date.now()) / 86400000); }

  const HND_STATUS = { pending: ['لم يبدأ', 'p-muted'], in_progress: ['قيد الإنجاز', 'p-warn'], done: ['مكتمل ✓', 'p-ok'], na: ['غير مطلوب', 'p-muted'] };
  function hndPill(s) { const v = HND_STATUS[s] || [s, 'p-muted']; return '<span class="pill ' + v[1] + '">' + esc(v[0]) + '</span>'; }

  // ============ الطباعة/التصدير PDF (نافذة طباعة منسّقة) ============
  function printDoc(title, bodyHtml) {
    const w = window.open('', '_blank');
    if (!w) { toast('اسمح بالنوافذ المنبثقة للطباعة', true); return; }
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>body{font-family:Tahoma,Arial,sans-serif;color:#111;margin:32px;line-height:1.8}' +
      'h1{font-size:22px;border-bottom:3px solid #0b8457;padding-bottom:8px;color:#0b5}' +
      'h2{font-size:16px;margin-top:22px;color:#0b8457;border-right:4px solid #0b8457;padding-right:10px}' +
      'table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px}' +
      'th,td{border:1px solid #bbb;padding:7px 9px;text-align:right}th{background:#eef6f2}' +
      '.muted{color:#666;font-size:12px}.ok{color:#0b8457;font-weight:700}.bad{color:#c0392b;font-weight:700}' +
      '.head{display:flex;justify-content:space-between;align-items:center}.logo{font-size:26px}' +
      '.badge{display:inline-block;border:1px solid #999;border-radius:20px;padding:2px 10px;font-size:11px}' +
      '@media print{.noprint{display:none}}</style></head><body>' +
      '<div class="head"><div><span class="logo">👁 بصير — عيون المالك</span></div>' +
      '<div class="muted">تاريخ الإصدار: ' + todayStr() + '</div></div>' +
      bodyHtml +
      '<p class="muted" style="margin-top:26px;border-top:1px solid #ccc;padding-top:10px">وثيقة مُصدَّرة آلياً من منصة بصير — Bassir Owner Eyes Platform</p>' +
      '<div class="noprint" style="margin-top:20px"><button onclick="window.print()" style="padding:10px 22px;font-size:14px;cursor:pointer;background:#0b8457;color:#fff;border:0;border-radius:8px">🖨 طباعة / حفظ PDF</button></div>' +
      '</body></html>');
    w.document.close();
  }

  // ============ صفحة التسليم والإغلاق (Handover) ============
  const hoState = { tab: 'checklist' };

  function renderHandover(el, ctx) {
    const tabs = [
      ['checklist', '📋 قائمة التسليم'],
      ['punch', '📌 قائمة الملاحظات'],
      ['warranties', '🛡️ الضمانات'],
      ['keys', '🔑 سجل المفاتيح'],
      ['dlp', '🏁 لوحة DLP'],
      ['report', '📄 تقرير التسليم الموحّد']
    ];
    el.innerHTML =
      '<div class="tabs">' + tabs.map(function (t) {
        return '<div class="tab ' + (hoState.tab === t[0] ? 'active' : '') + '" data-hotab="' + t[0] + '">' + t[1] + '</div>';
      }).join('') + '</div><div id="ho-body"></div>';
    el.querySelectorAll('[data-hotab]').forEach(function (t) {
      t.addEventListener('click', function () { hoState.tab = t.getAttribute('data-hotab'); renderHandover(el, ctx); });
    });
    const body = el.querySelector('#ho-body');
    if (hoState.tab === 'checklist') renderChecklist(body, ctx);
    else if (hoState.tab === 'punch') renderPunch(body, ctx);
    else if (hoState.tab === 'warranties') renderWarranties(body, ctx);
    else if (hoState.tab === 'keys') renderKeys(body, ctx);
    else if (hoState.tab === 'dlp') renderDlp(body, ctx);
    else renderUnifiedReport(body, ctx);
  }

  // ---- قائمة التسليم التفاعلية (مستندات + متطلبات نظامية) ----
  function renderChecklist(el, ctx) {
    const items = ctx.S.handoverItems || [];
    const canEdit = ['consultant', 'admin', 'owner_rep'].indexOf(ctx.U.role) !== -1;
    const groups = [
      ['docs', '📁 المستندات والتسليمات'],
      ['regulatory', '🏛️ المتطلبات النظامية والتشغيلية']
    ];
    const done = items.filter(function (i) { return i.status === 'done'; }).length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;

    el.innerHTML =
      '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">✅ قائمة التسليم التفاعلية <span class="hint">حدّث حالة كل بند وارفع مستنده داخل المنصة</span></h3>' +
      '<div class="flex" style="gap:8px;align-items:center"><div class="bar" style="width:160px"><i style="width:' + pct + '%"></i></div>' +
      '<b class="num">' + done + '/' + items.length + ' (' + pct + '%)</b></div></div></div>' +
      groups.map(function (g) {
        const gi = items.filter(function (i) { return i.group === g[0]; });
        return '<div class="card mb"><h3>' + g[1] + '</h3>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>البند</th><th>المسؤول</th><th>الحالة</th><th>المستند</th><th>ملاحظات</th>' + (canEdit ? '<th></th>' : '') + '</tr></thead><tbody>' +
          gi.map(function (it) {
            return '<tr><td><b>' + esc(it.title) + '</b><div class="small muted" dir="ltr" style="text-align:right">' + esc(it.en || '') + '</div></td>' +
              '<td class="small">' + esc(it.responsible || '—') + '</td>' +
              '<td>' + hndPill(it.status) + '</td>' +
              '<td class="small">' + (it.file
                ? '📎 ' + VS.att(it.file) + ' <button class="btn ghost sm" data-hreview="' + it.id + '">🔍 مراجعة</button>'
                : '<span class="muted">—</span>') + '</td>' +
              '<td class="small" style="max-width:220px">' + esc(it.notes || '') + (it.date ? '<div class="muted num">' + esc(it.date) + '</div>' : '') + '</td>' +
              (canEdit ? '<td><button class="btn ghost sm" data-hedit="' + it.id + '">تحديث</button></td>' : '') +
              '</tr>';
          }).join('') + '</tbody></table></div></div>';
      }).join('');

    // مراجعة مستند التسليم المرفوع داخل المنصة (عارض PDF/صور مع الترميز)
    el.querySelectorAll('[data-hreview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-hreview'); });
        if (it && window.DrawingViewer) window.DrawingViewer.open(ctx, 'handoverItems', it, { canEdit: canEdit, canReview: false });
      });
    });

    el.querySelectorAll('[data-hedit]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-hedit'); });
        const m = modal(
          '<h3>تحديث بند التسليم</h3><div class="m-sub">' + esc(it.title) + '</div>' +
          '<label class="fl">الحالة</label><select class="inp" id="he-status">' +
          Object.keys(HND_STATUS).map(function (k) { return '<option value="' + k + '"' + (it.status === k ? ' selected' : '') + '>' + HND_STATUS[k][0] + '</option>'; }).join('') + '</select>' +
          '<label class="fl">المسؤول</label><input class="inp" id="he-resp" value="' + esc(it.responsible || '') + '">' +
          '<label class="fl">ملاحظات</label><textarea class="inp" id="he-notes" rows="2">' + esc(it.notes || '') + '</textarea>' +
          '<label class="fl">رفع مستند البند</label><input class="inp" id="he-file" type="file">' +
          '<div class="m-actions"><button class="btn" id="he-ok">حفظ</button><button class="btn mutedb" id="he-cancel">إلغاء</button></div>'
        );
        m.querySelector('#he-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#he-ok').addEventListener('click', async function () {
          try {
            const patch = {
              status: m.querySelector('#he-status').value,
              responsible: m.querySelector('#he-resp').value,
              notes: m.querySelector('#he-notes').value,
              date: todayStr()
            };
            const f = m.querySelector('#he-file').files[0];
            if (f) patch.file = await Api.upload(f, { category: 'وثائق فنية' });
            await Api.update('handoverItems', it.id, patch);
            m.remove(); toast('✅ حُدّث بند التسليم'); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  }

  // ---- قائمة الملاحظات (Punch List) ----
  function renderPunch(el, ctx) {
    const items = (ctx.S.punchList || []).slice().sort(function (a, b) { return (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1); });
    const canManage = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const isContractor = ctx.U.role === 'contractor';
    const open = items.filter(function (x) { return x.status === 'open'; }).length;
    const closed = items.length - open;
    // تجميع حسب المقاول
    const byC = {};
    items.forEach(function (it) { (byC[it.contractorId] = byC[it.contractorId] || []).push(it); });

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">إجمالي الملاحظات</div><div class="val num">' + items.length + '</div></div>' +
      '<div class="card kpi ' + (open ? 'k-warn' : 'k-ok') + '"><div class="lbl">مفتوحة</div><div class="val num">' + open + '</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">مغلقة</div><div class="val num">' + closed + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">نسبة الإغلاق</div><div class="val num">' + (items.length ? Math.round(closed / items.length * 100) : 0) + '%</div></div>' +
      '</div>' +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">📌 قائمة الملاحظات مرتبطة بالمقاول المسؤول <span class="hint">تتبع فتح/إغلاق لكل ملاحظة</span></h3>' +
      '<div class="flex">' + (canManage ? '<button class="btn sm" id="pl-add">➕ ملاحظة جديدة</button>' : '') +
      '<button class="btn ghost sm" id="pl-print">🖨 طباعة القائمة</button></div></div>' +
      Object.keys(byC).map(function (cid) {
        const list = byC[cid];
        const co = list.filter(function (x) { return x.status === 'open'; }).length;
        return '<div style="margin-top:14px"><b>👷 ' + esc(contractorName(ctx, cid)) + '</b> ' +
          '<span class="pill ' + (co ? 'p-warn' : 'p-ok') + '">' + co + ' مفتوحة / ' + list.length + '</span>' +
          '<div class="tbl-wrap" style="margin-top:8px"><table class="tbl"><thead><tr><th>المرجع</th><th>الملاحظة</th><th>الموقع</th><th>الخطورة</th><th>أُثيرت</th><th>الحالة / الإغلاق</th><th></th></tr></thead><tbody>' +
          list.map(function (it) {
            return '<tr><td class="num small"><b>' + esc(it.ref || '') + '</b>' + (it.docCode ? '<div class="muted" style="font-size:10px;color:var(--accent2)">' + esc(it.docCode) + '</div>' : '') + '</td>' +
              '<td>' + esc(it.title) + (it.notes ? '<div class="small muted">' + esc(it.notes) + '</div>' : '') + '</td>' +
              '<td class="small">' + esc(VS.floorName(ctx, it.location) || it.location || '') + '</td>' +
              '<td>' + (it.severity === 'major' ? '<span class="pill p-danger">جوهرية</span>' : '<span class="pill p-warn">ثانوية</span>') + '</td>' +
              '<td class="small muted num">' + esc(it.raisedDate || '') + '</td>' +
              '<td>' + (it.status === 'closed' ? '<span class="pill p-ok">مغلقة ✓</span><div class="small muted num">' + esc(it.closedDate || '') + '</div>' : '<span class="pill p-warn">مفتوحة</span>') + '</td>' +
              '<td>' + ((canManage || isContractor) && it.status === 'open' ? '<button class="btn sm" data-plclose="' + it.id + '">✅ إغلاق</button>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>';
      }).join('') +
      (items.length ? '' : '<div class="empty"><div class="e-ico">📌</div>لا ملاحظات تسليم</div>') +
      '</div>';

    const addBtn = el.querySelector('#pl-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      const m = modal(
        '<h3>➕ ملاحظة تسليم جديدة</h3>' +
        '<label class="fl">المقاول المسؤول</label><select class="inp" id="pl-cont">' +
        ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' +
        '<label class="fl">المرجع</label><input class="inp num" id="pl-ref" placeholder="PL-001">' +
        '<label class="fl">الملاحظة</label><input class="inp" id="pl-title">' +
        '<div class="grid g2"><div><label class="fl">الموقع</label><select class="inp" id="pl-loc">' +
        ctx.S.projects[0].floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select></div>' +
        '<div><label class="fl">الخطورة</label><select class="inp" id="pl-sev"><option value="minor">ثانوية</option><option value="major">جوهرية</option></select></div></div>' +
        '<div class="m-actions"><button class="btn" id="pl-ok">حفظ وإسناد للمقاول</button><button class="btn mutedb" id="pl-cancel">إلغاء</button></div>'
      );
      m.querySelector('#pl-cancel').addEventListener('click', function () { m.remove(); });
      m.querySelector('#pl-ok').addEventListener('click', async function () {
        const title = m.querySelector('#pl-title').value.trim();
        if (!title) { toast('أدخل نص الملاحظة', true); return; }
        try {
          await Api.create('punchList', {
            contractorId: m.querySelector('#pl-cont').value,
            ref: m.querySelector('#pl-ref').value || 'PL-' + Math.floor(Math.random() * 900 + 100),
            title: title, location: m.querySelector('#pl-loc').value, severity: m.querySelector('#pl-sev').value,
            status: 'open', raisedDate: todayStr(), closedDate: null
          });
          m.remove(); toast('✅ أُضيفت الملاحظة وأُسندت للمقاول (أُشعر بها)'); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });

    el.querySelectorAll('[data-plclose]').forEach(function (b) {
      b.addEventListener('click', async function () {
        try {
          await Api.update('punchList', b.getAttribute('data-plclose'), { status: 'closed', closedDate: todayStr() });
          toast('✅ أُغلقت الملاحظة'); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });

    el.querySelector('#pl-print').addEventListener('click', function () {
      printDoc('قائمة الملاحظات — Punch List', punchReportHtml(ctx, items));
    });
  }

  function punchReportHtml(ctx, items) {
    return '<h1>قائمة الملاحظات — Punch List</h1>' +
      '<p class="muted">المشروع: ' + esc(ctx.S.projects[0].name) + '</p>' +
      '<table><thead><tr><th>المرجع</th><th>المقاول</th><th>الملاحظة</th><th>الموقع</th><th>الخطورة</th><th>الحالة</th><th>الإغلاق</th></tr></thead><tbody>' +
      items.map(function (it) {
        return '<tr><td>' + esc(it.ref || '') + '</td><td>' + esc(contractorName(ctx, it.contractorId)) + '</td><td>' + esc(it.title) + '</td>' +
          '<td>' + esc(VS.floorName(ctx, it.location) || it.location || '') + '</td><td>' + (it.severity === 'major' ? 'جوهرية' : 'ثانوية') + '</td>' +
          '<td class="' + (it.status === 'closed' ? 'ok' : 'bad') + '">' + (it.status === 'closed' ? 'مغلقة' : 'مفتوحة') + '</td><td>' + esc(it.closedDate || '—') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  // ---- الضمانات + تنبيهات قرب الانتهاء ----
  function renderWarranties(el, ctx) {
    const items = (ctx.S.warranties || []).slice().sort(function (a, b) { return String(a.endDate).localeCompare(String(b.endDate)); });
    const canAdd = ['contractor', 'consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const warnDays = VS.thresholds(ctx.S.projects[0]).warrantyWarnDays;
    const expiringSoon = items.filter(function (w) { const d = daysFromNow(w.endDate); return d != null && d >= 0 && d <= warnDays; });
    const expired = items.filter(function (w) { const d = daysFromNow(w.endDate); return d != null && d < 0; });

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">إجمالي الضمانات</div><div class="val num">' + items.length + '</div></div>' +
      '<div class="card kpi ' + (expiringSoon.length ? 'k-warn' : 'k-ok') + '"><div class="lbl">قرب الانتهاء (≤العتبة)</div><div class="val num">' + expiringSoon.length + '</div></div>' +
      '<div class="card kpi ' + (expired.length ? 'k-danger' : 'k-ok') + '"><div class="lbl">منتهية</div><div class="val num">' + expired.length + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">سارية</div><div class="val num">' + (items.length - expired.length) + '</div></div>' +
      '</div>' +
      (expiringSoon.length ? '<div class="card mb" style="border-color:var(--warn)"><b class="small" style="color:var(--warn)">⏰ تنبيهات قرب انتهاء الضمان:</b>' +
        expiringSoon.map(function (w) { return '<div class="small" style="margin-top:6px">• ' + esc(w.item) + ' — ينتهي خلال <b class="num">' + daysFromNow(w.endDate) + '</b> يوم (' + esc(w.endDate) + ')</div>'; }).join('') + '</div>' : '') +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🛡️ سجل ضمانات الموردين والمقاولين من الباطن</h3>' +
      (canAdd ? '<button class="btn sm" id="wr-add">➕ إضافة ضمان</button>' : '') + '</div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>البند/النظام</th><th>المورّد</th><th>المقاول</th><th>البداية</th><th>الانتهاء</th><th>المدة</th><th>الحالة</th></tr></thead><tbody>' +
      items.map(function (w) {
        const d = daysFromNow(w.endDate);
        const st = d == null ? '' : d < 0 ? '<span class="pill p-danger">منتهٍ</span>' : d <= 90 ? '<span class="pill p-warn">≤ ' + d + ' يوم</span>' : '<span class="pill p-ok">ساري</span>';
        return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(w.docCode || '') + '</b></td>' +
          '<td>' + esc(w.item) + '</td><td class="small">' + esc(w.supplier || '') + '</td>' +
          '<td class="small">' + esc(contractorName(ctx, w.contractorId)) + '</td>' +
          '<td class="small muted num">' + esc(w.startDate || '') + '</td><td class="small num">' + esc(w.endDate || '') + '</td>' +
          '<td class="num small">' + (w.months || '—') + ' شهر</td><td>' + st + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (items.length ? '' : '<div class="empty"><div class="e-ico">🛡️</div>لا ضمانات مسجلة</div>') + '</div>';

    const addBtn = el.querySelector('#wr-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      const m = modal(
        '<h3>➕ إضافة ضمان</h3>' +
        '<label class="fl">البند / النظام</label><input class="inp" id="w-item" placeholder="مصاعد، تكييف، عزل...">' +
        '<label class="fl">المورّد</label><input class="inp" id="w-sup">' +
        '<label class="fl">المقاول</label><select class="inp" id="w-cont">' +
        ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' +
        '<div class="grid g2"><div><label class="fl">تاريخ البداية</label><input class="inp" id="w-start" type="date" value="' + todayStr() + '"></div>' +
        '<div><label class="fl">مدة الضمان (شهر)</label><input class="inp num" id="w-months" type="number" value="12"></div></div>' +
        '<label class="fl">رفع شهادة الضمان</label><input class="inp" id="w-file" type="file">' +
        '<div class="m-actions"><button class="btn" id="w-ok">حفظ</button><button class="btn mutedb" id="w-cancel">إلغاء</button></div>'
      );
      m.querySelector('#w-cancel').addEventListener('click', function () { m.remove(); });
      m.querySelector('#w-ok').addEventListener('click', async function () {
        const item = m.querySelector('#w-item').value.trim();
        if (!item) { toast('أدخل البند', true); return; }
        const start = m.querySelector('#w-start').value || todayStr();
        const months = Number(m.querySelector('#w-months').value) || 12;
        const end = new Date(start); end.setMonth(end.getMonth() + months);
        try {
          const data = {
            item: item, supplier: m.querySelector('#w-sup').value, contractorId: m.querySelector('#w-cont').value,
            startDate: start, endDate: end.toISOString().slice(0, 10), months: months
          };
          const f = m.querySelector('#w-file').files[0];
          if (f) data.file = await Api.upload(f, { category: 'وثائق فنية' });
          await Api.create('warranties', data);
          m.remove(); toast('✅ أُضيف الضمان'); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });
  }

  // ---- سجل تسليم المفاتيح ----
  function renderKeys(el, ctx) {
    const items = ctx.S.keysLog || [];
    const canAdd = ['consultant', 'admin', 'owner_rep'].indexOf(ctx.U.role) !== -1;
    el.innerHTML =
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🔑 سجل تسليم المفاتيح</h3>' + (canAdd ? '<button class="btn sm" id="k-add">➕ تسجيل تسليم</button>' : '') + '</div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المنطقة</th><th>عدد المفاتيح</th><th>سُلّمت إلى</th><th>بواسطة</th><th>التاريخ</th><th>التوقيع</th></tr></thead><tbody>' +
      items.map(function (k) {
        return '<tr><td>' + esc(k.area) + '</td><td class="num">' + (k.count || '') + '</td><td class="small">' + esc(k.handedTo || '') + '</td>' +
          '<td class="small">' + esc(k.by || '') + '</td><td class="small muted num">' + (k.date || '<span class="pill p-warn">لم تُسلّم</span>') + '</td>' +
          '<td class="small">' + (k.signature ? '✍️ ' + esc(k.signature) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (items.length ? '' : '<div class="empty"><div class="e-ico">🔑</div>لا سجلات</div>') + '</div>';

    const addBtn = el.querySelector('#k-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      const m = modal(
        '<h3>🔑 تسجيل تسليم مفاتيح</h3>' +
        '<label class="fl">المنطقة</label><input class="inp" id="k-area">' +
        '<div class="grid g2"><div><label class="fl">عدد المفاتيح</label><input class="inp num" id="k-count" type="number"></div>' +
        '<div><label class="fl">سُلّمت إلى</label><input class="inp" id="k-to"></div></div>' +
        '<label class="fl">التوقيع باسم</label><input class="inp" id="k-sig" value="' + esc(ctx.U.name) + '">' +
        '<div class="m-actions"><button class="btn" id="k-ok">تسجيل</button><button class="btn mutedb" id="k-cancel">إلغاء</button></div>'
      );
      m.querySelector('#k-cancel').addEventListener('click', function () { m.remove(); });
      m.querySelector('#k-ok').addEventListener('click', async function () {
        const area = m.querySelector('#k-area').value.trim();
        if (!area) { toast('أدخل المنطقة', true); return; }
        try {
          await Api.create('keysLog', {
            area: area, count: Number(m.querySelector('#k-count').value) || 0,
            handedTo: m.querySelector('#k-to').value, by: ctx.U.name, date: todayStr(),
            signature: m.querySelector('#k-sig').value
          });
          m.remove(); toast('✅ سُجّل تسليم المفاتيح'); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });
  }

  // ---- لوحة فترة ضمان العيوب DLP ----
  function renderDlp(el, ctx) {
    const P = ctx.S.projects[0] || {};
    const start = P.dlpStart, months = P.dlpMonths || 12;
    let end = '';
    if (start) { const e = new Date(start); e.setMonth(e.getMonth() + months); end = e.toISOString().slice(0, 10); }
    const total = start && end ? daysBetween(start, end) : 0;
    const elapsed = start ? Math.max(0, Math.min(total, daysBetween(start, todayStr()))) : 0;
    const remaining = Math.max(0, total - elapsed);
    const started = start && new Date(start) <= new Date();
    const pct = total ? Math.round(elapsed / total * 100) : 0;
    // عيوب فترة الضمان = ملاحظات مفتوحة تُعامل كعيوب + عناصر handoverDocs من نوع dlp
    const defects = (ctx.S.punchList || []).filter(function (x) { return x.status === 'open'; });

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi ' + (started ? 'k-info' : '') + '"><div class="lbl">حالة فترة الضمان</div><div class="val" style="font-size:18px">' + (started ? 'جارية' : (start ? 'لم تبدأ' : 'غير محددة')) + '</div><div class="sub num">' + (start ? esc(start) + ' ← ' + esc(end) : '—') + '</div></div>' +
      '<div class="card kpi"><div class="lbl">المدة</div><div class="val num">' + months + '</div><div class="sub">شهر</div></div>' +
      '<div class="card kpi ' + (remaining < 60 && started ? 'k-warn' : 'k-ok') + '"><div class="lbl">المتبقي</div><div class="val num">' + remaining + '</div><div class="sub">يوم' + (started ? ' (' + pct + '% انقضى)' : '') + '</div></div>' +
      '<div class="card kpi ' + (defects.length ? 'k-warn' : 'k-ok') + '"><div class="lbl">عيوب مفتوحة</div><div class="val num">' + defects.length + '</div><div class="sub">تحت المسؤولية</div></div>' +
      '</div>' +
      '<div class="card mb"><h3>🏁 فترة ضمان العيوب (DLP) — التقدم الزمني</h3>' +
      '<div class="flex" style="gap:10px;align-items:center"><div class="bar" style="flex:1;height:16px"><i style="width:' + pct + '%;background:var(--accent2)"></i></div><b class="num">' + pct + '%</b></div>' +
      '<div class="small muted mt">تبدأ فترة ضمان العيوب بعد التسليم الابتدائي، وخلالها يلتزم المقاول بمعالجة العيوب الظاهرة على نفقته حتى إصدار شهادة التسليم النهائي.</div></div>' +
      '<div class="card"><h3>🔧 العيوب المفتوحة تحت فترة الضمان</h3>' +
      (defects.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المرجع</th><th>العيب</th><th>المقاول المسؤول</th><th>الموقع</th><th>الخطورة</th><th>أُثير</th></tr></thead><tbody>' +
        defects.map(function (it) {
          return '<tr><td class="num small">' + esc(it.ref || '') + '</td><td>' + esc(it.title) + '</td><td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            '<td class="small">' + esc(VS.floorName(ctx, it.location) || it.location || '') + '</td>' +
            '<td>' + (it.severity === 'major' ? '<span class="pill p-danger">جوهرية</span>' : '<span class="pill p-warn">ثانوية</span>') + '</td>' +
            '<td class="small muted num">' + esc(it.raisedDate || '') + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">✅</div>لا عيوب مفتوحة</div>') + '</div>';
  }

  // ---- تقرير التسليم الموحّد (طباعة/PDF عربي/إنجليزي) ----
  function renderUnifiedReport(el, ctx) {
    const items = ctx.S.handoverItems || [];
    const punch = ctx.S.punchList || [];
    const warr = ctx.S.warranties || [];
    const done = items.filter(function (i) { return i.status === 'done'; }).length;
    const openPunch = punch.filter(function (x) { return x.status === 'open'; }).length;

    el.innerHTML =
      '<div class="card"><h3>📄 تقرير التسليم الموحّد <span class="hint">تجميع كامل لحالة التسليم — قابل للتصدير PDF للعميل</span></h3>' +
      '<div class="grid g3 mb" style="margin-top:14px">' +
      '<div class="card kpi"><div class="lbl">بنود التسليم المكتملة</div><div class="val num">' + done + '/' + items.length + '</div></div>' +
      '<div class="card kpi ' + (openPunch ? 'k-warn' : 'k-ok') + '"><div class="lbl">ملاحظات مفتوحة</div><div class="val num">' + openPunch + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">ضمانات مسجلة</div><div class="val num">' + warr.length + '</div></div>' +
      '</div>' +
      '<div class="small muted mb">يشمل التقرير: حالة كل بند تسليم ومسؤوله، ملخص قائمة الملاحظات وإغلاقها، سجل الضمانات، وحالة المتطلبات النظامية.</div>' +
      '<div class="flex"><button class="btn" id="ur-ar">🖨 تصدير التقرير (عربي)</button>' +
      '<button class="btn" id="ur-en">🖨 Export Report (English)</button></div></div>';

    el.querySelector('#ur-ar').addEventListener('click', function () { printDoc('تقرير التسليم الموحّد', unifiedHtml(ctx, 'ar')); });
    el.querySelector('#ur-en').addEventListener('click', function () { printDoc('Unified Handover Report', unifiedHtml(ctx, 'en')); });
  }

  function unifiedHtml(ctx, lang) {
    const P = ctx.S.projects[0] || {};
    const items = ctx.S.handoverItems || [];
    const punch = ctx.S.punchList || [];
    const warr = ctx.S.warranties || [];
    const L = lang === 'en'
      ? { title: 'Unified Handover Report', project: 'Project', docs: 'Documents & Submittals', reg: 'Regulatory Requirements', item: 'Item', resp: 'Responsible', status: 'Status', punch: 'Punch List Summary', ref: 'Ref', contractor: 'Contractor', note: 'Note', state: 'State', warr: 'Warranties', wend: 'Expiry', open: 'Open', closed: 'Closed',
          st: { pending: 'Pending', in_progress: 'In Progress', done: 'Completed', na: 'N/A' } }
      : { title: 'تقرير التسليم الموحّد', project: 'المشروع', docs: 'المستندات والتسليمات', reg: 'المتطلبات النظامية', item: 'البند', resp: 'المسؤول', status: 'الحالة', punch: 'ملخص قائمة الملاحظات', ref: 'المرجع', contractor: 'المقاول', note: 'الملاحظة', state: 'الحالة', warr: 'الضمانات', wend: 'الانتهاء', open: 'مفتوحة', closed: 'مغلقة',
          st: { pending: 'لم يبدأ', in_progress: 'قيد الإنجاز', done: 'مكتمل', na: 'غير مطلوب' } };
    function grpTable(grp) {
      return '<table><thead><tr><th>' + L.item + '</th><th>' + L.resp + '</th><th>' + L.status + '</th></tr></thead><tbody>' +
        items.filter(function (i) { return i.group === grp; }).map(function (it) {
          const name = lang === 'en' ? (it.en || it.title) : it.title;
          return '<tr><td>' + esc(name) + '</td><td>' + esc(it.responsible || '—') + '</td><td class="' + (it.status === 'done' ? 'ok' : '') + '">' + esc(L.st[it.status] || it.status) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    return '<h1>' + L.title + '</h1>' +
      '<p class="muted">' + L.project + ': <b>' + esc(P.name) + '</b>' + (P.location ? ' — ' + esc(P.location) : '') + '</p>' +
      '<h2>' + L.docs + '</h2>' + grpTable('docs') +
      '<h2>' + L.reg + '</h2>' + grpTable('regulatory') +
      '<h2>' + L.punch + '</h2>' +
      '<p>' + L.open + ': <b class="bad">' + punch.filter(function (x) { return x.status === 'open'; }).length + '</b> — ' + L.closed + ': <b class="ok">' + punch.filter(function (x) { return x.status === 'closed'; }).length + '</b></p>' +
      '<table><thead><tr><th>' + L.ref + '</th><th>' + L.contractor + '</th><th>' + L.note + '</th><th>' + L.state + '</th></tr></thead><tbody>' +
      punch.map(function (it) {
        return '<tr><td>' + esc(it.ref || '') + '</td><td>' + esc(contractorName(ctx, it.contractorId)) + '</td><td>' + esc(it.title) + '</td>' +
          '<td class="' + (it.status === 'closed' ? 'ok' : 'bad') + '">' + (it.status === 'closed' ? L.closed : L.open) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<h2>' + L.warr + '</h2><table><thead><tr><th>' + L.item + '</th><th>' + L.contractor + '</th><th>' + L.wend + '</th></tr></thead><tbody>' +
      warr.map(function (w) { return '<tr><td>' + esc(w.item) + '</td><td>' + esc(contractorName(ctx, w.contractorId)) + '</td><td>' + esc(w.endDate || '') + '</td></tr>'; }).join('') + '</tbody></table>';
  }

  // ============ تكوين مراحل المشروع (قابل للتخصيص حسب النوع) ============
  function renderPhases(el, ctx) {
    const P = ctx.S.projects[0] || {};
    const tasks = (ctx.S.scheduleTasks || []).slice();
    const lib = ctx.S.phaseLibrary || [];
    const templates = ctx.S.phaseTemplates || {};
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;

    el.innerHTML =
      '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🗂️ مراحل المشروع <span class="hint">نوع المشروع: ' + esc(P.type || 'غير محدد') + ' — قابلة للتخصيص</span></h3>' +
      (canEdit ? '<div class="flex"><select class="inp" id="ph-tmpl" style="max-width:220px"><option value="">تطبيق قالب حسب النوع...</option>' +
        Object.keys(templates).map(function (t) { return '<option value="' + esc(t) + '">' + esc(t === 'default' ? 'قالب افتراضي' : t) + '</option>'; }).join('') + '</select>' +
        '<button class="btn sm" id="ph-add">➕ مرحلة</button></div>' : '') + '</div>' +
      '<div class="small muted">أضف أو احذف المراحل بما يناسب طبيعة المشروع — تنعكس في لوحة القيادة ومقارنات الإنجاز.</div></div>' +

      (canEdit ? (function () {
        const th = VS.thresholds(P);
        return '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
          '<h3 style="margin:0">⚙️ عتبات التنبيه لهذا المشروع <span class="hint">تضبط متى تُطلق التنبيهات وتُحتسب المؤشرات</span></h3>' +
          '<button class="btn sm" id="th-save">💾 حفظ العتبات</button></div>' +
          '<div class="grid g4" style="margin-top:12px">' +
          '<div><label class="fl">مهلة المراجعة (SLA) — يوم</label><input class="inp num" id="th-sla" type="number" min="1" value="' + th.slaReviewDays + '"></div>' +
          '<div><label class="fl">تنبيه قرب انتهاء الضمان — يوم</label><input class="inp num" id="th-warr" type="number" min="1" value="' + th.warrantyWarnDays + '"></div>' +
          '<div><label class="fl">حد تأخر المقاول — %</label><input class="inp num" id="th-delay" type="number" min="0" value="' + th.contractorDelayPct + '"></div>' +
          '<div><label class="fl">حد انحراف التقدّم (كهرماني/أحمر) — نقطة</label><input class="inp num" id="th-dev" type="number" min="1" value="' + th.progressAmberPct + '"></div>' +
          '<div><label class="fl">درجة تنبيه الصحة (عند/دون)</label><select class="inp" id="th-grade">' +
          ['A', 'B', 'C', 'D'].map(function (g) { return '<option value="' + g + '"' + (th.healthAlertGrade === g ? ' selected' : '') + '>' + g + (g === 'B' ? ' — جيد فأدنى' : g === 'C' ? ' — مقبول فأدنى' : g === 'D' ? ' — حرج فقط' : ' — أي هبوط') + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
          '<div class="small muted mt">تُطبَّق فوراً على تتبع التقديمات (SLA)، وتنبيهات الضمانات، ومقارنة المقاولين، وتنبيه هبوط/تحسّن صحة المشروع.</div></div>';
      })() : '') +

      '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>المرحلة</th><th>مخطط</th><th>فعلي</th><th>الإنجاز</th>' + (canEdit ? '<th></th>' : '') + '</tr></thead><tbody>' +
      tasks.map(function (t, i) {
        return '<tr><td class="num small">' + (i + 1) + '</td>' +
          '<td><b>' + esc(t.name) + '</b>' + (t.phaseKey ? '<div class="small muted" dir="ltr" style="text-align:right">' + esc((lib.find(function (l) { return l.key === t.phaseKey; }) || {}).en || '') + '</div>' : '') + '</td>' +
          '<td class="small muted num">' + esc(t.startPlanned || '') + ' ← ' + esc(t.endPlanned || '') + '</td>' +
          '<td class="small muted num">' + esc(t.startActual || '—') + ' ← ' + esc(t.endActual || '—') + '</td>' +
          '<td><div class="flex" style="gap:6px"><div class="bar" style="flex:1"><i style="width:' + (t.progress || 0) + '%"></i></div><b class="num small">' + (t.progress || 0) + '%</b></div></td>' +
          (canEdit ? '<td><div class="flex" style="gap:4px"><button class="btn ghost sm" data-phedit="' + t.id + '">تحديث</button><button class="btn danger sm" data-phdel="' + t.id + '">حذف</button></div></td>' : '') +
          '</tr>';
      }).join('') + '</tbody></table></div>' +
      (tasks.length ? '' : '<div class="empty"><div class="e-ico">🗂️</div>لا مراحل — طبّق قالباً أو أضف مرحلة</div>') + '</div>';

    const thSave = el.querySelector('#th-save');
    if (thSave) thSave.addEventListener('click', async function () {
      try {
        await Api.update('projects', P.id, {
          thresholds: {
            slaReviewDays: Math.max(1, Number(el.querySelector('#th-sla').value) || 7),
            warrantyWarnDays: Math.max(1, Number(el.querySelector('#th-warr').value) || 90),
            contractorDelayPct: Math.max(0, Number(el.querySelector('#th-delay').value) || 3),
            progressAmberPct: Math.max(1, Number(el.querySelector('#th-dev').value) || 10),
            healthAlertGrade: el.querySelector('#th-grade').value || 'C'
          }
        });
        toast('✅ حُفظت عتبات التنبيه — طُبّقت على مؤشرات هذا المشروع'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const tmpl = el.querySelector('#ph-tmpl');
    if (tmpl) tmpl.addEventListener('change', async function () {
      const key = tmpl.value;
      if (!key || !templates[key]) return;
      if (!confirm('تطبيق قالب "' + (key === 'default' ? 'افتراضي' : key) + '"؟ سيضيف المراحل غير الموجودة.')) { tmpl.value = ''; return; }
      const existing = tasks.map(function (t) { return t.phaseKey; });
      try {
        for (const pk of templates[key]) {
          if (existing.indexOf(pk) !== -1) continue;
          const ph = lib.find(function (l) { return l.key === pk; });
          if (ph) await Api.create('scheduleTasks', { phaseKey: pk, name: ph.ar, progress: 0, startPlanned: '', endPlanned: '', startActual: null, endActual: null });
        }
        toast('✅ طُبّق القالب وأُضيفت المراحل'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const addBtn = el.querySelector('#ph-add');
    if (addBtn) addBtn.addEventListener('click', function () { phaseModal(ctx, null, lib); });
    el.querySelectorAll('[data-phedit]').forEach(function (b) {
      b.addEventListener('click', function () { phaseModal(ctx, tasks.find(function (t) { return t.id === b.getAttribute('data-phedit'); }), lib); });
    });
    el.querySelectorAll('[data-phdel]').forEach(function (b) {
      b.addEventListener('click', async function () {
        if (!confirm('حذف هذه المرحلة؟')) return;
        try { await Api.remove('scheduleTasks', b.getAttribute('data-phdel')); toast('حُذفت المرحلة'); ctx.refresh(); }
        catch (e) { toast(e.message, true); }
      });
    });
  }

  function phaseModal(ctx, t, lib) {
    const isEdit = !!t;
    t = t || {};
    const m = modal(
      '<h3>' + (isEdit ? '✏️ تحديث مرحلة' : '➕ مرحلة جديدة') + '</h3>' +
      '<label class="fl">من المكتبة (اختياري)</label><select class="inp" id="ph-lib"><option value="">— مخصصة —</option>' +
      lib.map(function (l) { return '<option value="' + l.key + '"' + (t.phaseKey === l.key ? ' selected' : '') + '>' + esc(l.ar) + '</option>'; }).join('') + '</select>' +
      '<label class="fl">اسم المرحلة</label><input class="inp" id="ph-name" value="' + esc(t.name || '') + '">' +
      '<div class="grid g2"><div><label class="fl">بداية مخططة</label><input class="inp" id="ph-sp" type="date" value="' + esc(t.startPlanned || '') + '"></div>' +
      '<div><label class="fl">نهاية مخططة</label><input class="inp" id="ph-ep" type="date" value="' + esc(t.endPlanned || '') + '"></div></div>' +
      '<div class="grid g2"><div><label class="fl">بداية فعلية</label><input class="inp" id="ph-sa" type="date" value="' + esc(t.startActual || '') + '"></div>' +
      '<div><label class="fl">نهاية فعلية</label><input class="inp" id="ph-ea" type="date" value="' + esc(t.endActual || '') + '"></div></div>' +
      '<label class="fl">نسبة الإنجاز %</label><input class="inp num" id="ph-prog" type="number" min="0" max="100" value="' + (t.progress || 0) + '">' +
      '<div class="m-actions"><button class="btn" id="ph-ok">حفظ</button><button class="btn mutedb" id="ph-cancel">إلغاء</button></div>'
    );
    const libSel = m.querySelector('#ph-lib');
    libSel.addEventListener('change', function () {
      const l = lib.find(function (x) { return x.key === libSel.value; });
      if (l) m.querySelector('#ph-name').value = l.ar;
    });
    m.querySelector('#ph-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#ph-ok').addEventListener('click', async function () {
      const name = m.querySelector('#ph-name').value.trim();
      if (!name) { toast('أدخل اسم المرحلة', true); return; }
      const data = {
        phaseKey: libSel.value || null, name: name,
        startPlanned: m.querySelector('#ph-sp').value, endPlanned: m.querySelector('#ph-ep').value,
        startActual: m.querySelector('#ph-sa').value || null, endActual: m.querySelector('#ph-ea').value || null,
        progress: Number(m.querySelector('#ph-prog').value) || 0
      };
      try {
        if (isEdit) await Api.update('scheduleTasks', t.id, data);
        else await Api.create('scheduleTasks', data);
        m.remove(); toast('✅ حُفظت المرحلة'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ لوحة محفظة المشاريع (ممثل المالك / الأدمن) ============
  const GRADE_PILL = { A: 'p-ok', B: 'p-ok', C: 'p-warn', D: 'p-danger' };
  const HC = { ok: '#2dd4a0', warn: '#ffcc00', danger: '#ff3b30' };

  function renderPortfolio(el, ctx) {
    const A = ctx.Sall || ctx.S;
    const projects = A.projects || [];
    const ph = A.projectHealth || {};
    const hist = A.healthHistory || [];

    function trendArrow(pid, score) {
      const h = hist.filter(function (x) { return x.projectId === pid; }).sort(function (a, b) { return String(a.month).localeCompare(String(b.month)); });
      if (!h.length) return '';
      const d = score - h[h.length - 1].score;
      return d > 0 ? '<span style="color:var(--ok)">▲ +' + d + '</span>' : d < 0 ? '<span style="color:var(--danger)">▼ ' + d + '</span>' : '<span class="muted">—</span>';
    }

    const rows = projects.map(function (p) {
      const h = ph[p.id] || { score: 0, grade: '—', cls: 'warn', gradeAr: '', issues: {} };
      const g = projectGlanceLite(p);
      return { p: p, h: h, g: g };
    });
    const avg = rows.length ? Math.round(rows.reduce(function (a, r) { return a + r.h.score; }, 0) / rows.length) : 0;
    const atRisk = rows.filter(function (r) { return r.h.cls === 'warn' || r.h.cls === 'danger'; }).length;
    const totalBudget = rows.reduce(function (a, r) { return a + (r.p.budgetPlanned || 0); }, 0);
    const totalCost = rows.reduce(function (a, r) { return a + (r.p.costActual || 0); }, 0);
    const wProg = totalBudget ? Math.round(rows.reduce(function (a, r) { return a + (r.p.progressActual || 0) * (r.p.budgetPlanned || 0); }, 0) / totalBudget) : 0;

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">عدد المشاريع</div><div class="val num">' + rows.length + '</div><div class="sub">تحت الإشراف</div></div>' +
      '<div class="card kpi ' + (avg >= 70 ? 'k-ok' : avg >= 55 ? 'k-warn' : 'k-danger') + '"><div class="lbl">متوسط صحة المحفظة</div><div class="val num">' + avg + '</div><div class="sub">من 100</div></div>' +
      '<div class="card kpi ' + (atRisk ? 'k-warn' : 'k-ok') + '"><div class="lbl">مشاريع تحت المخاطرة</div><div class="val num">' + atRisk + '</div><div class="sub">فئة C أو D</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">إجمالي الميزانيات</div><div class="val" style="font-size:19px">' + VS.millions(totalBudget) + '</div><div class="sub num">الإنجاز المرجّح ' + wProg + '%</div></div>' +
      '</div>' +

      '<div class="card mb"><h3>🗂️ محفظة المشاريع — مقارنة الصحة <span class="hint">اضغط "فتح" للعمل على أي مشروع</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>المشروع</th><th>النوع</th><th>الإنجاز (فعلي/مخطط)</th><th>التكلفة</th><th>مؤشر الصحة</th><th>الاتجاه</th><th>مخاطر مفتوحة</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        const p = r.p, h = r.h;
        const risks = (h.issues.openNcr || 0) + (h.issues.failedTests || 0) + (h.issues.openPunch || 0) + (h.issues.openHse || 0) + (h.issues.openInc || 0);
        const active = ctx.projectId === p.id;
        return '<tr>' +
          '<td><b>🏗️ ' + esc(p.name) + '</b><div class="small muted">' + esc(p.location || '') + '</div></td>' +
          '<td class="small">' + esc(p.type || '—') + '</td>' +
          '<td><div class="flex" style="gap:6px"><div class="bar ' + (r.g.behind ? 'b-danger' : 'b-ok') + '" style="flex:1;min-width:90px"><i style="width:' + (p.progressActual || 0) + '%"></i></div>' +
          '<b class="num small">' + (p.progressActual || 0) + '%</b></div><div class="small muted num">مخطط ' + (p.progressPlanned || 0) + '%</div></td>' +
          '<td class="small num">' + VS.millions(p.costActual || 0) + '<div class="muted">من ' + VS.millions(p.budgetPlanned || 0) + '</div></td>' +
          '<td><div class="flex" style="gap:8px;align-items:center"><b class="num" style="font-size:17px;color:' + (HC[h.cls] || HC.warn) + '">' + h.score + '</b>' +
          '<span class="pill ' + (GRADE_PILL[h.grade] || 'p-muted') + '">' + h.grade + '</span></div></td>' +
          '<td class="small">' + trendArrow(p.id, h.score) + '</td>' +
          '<td>' + (risks ? '<span class="pill p-warn">' + risks + '</span>' : '<span class="pill p-ok">0</span>') + '</td>' +
          '<td>' + (active ? '<span class="pill p-ok">الحالي</span>' : '<button class="btn sm" data-openp="' + p.id + '">فتح ←</button>') + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="flex mt"><button class="btn ghost sm" id="pf-print">🖨 تصدير تقرير المحفظة PDF</button></div></div>';

    el.querySelectorAll('[data-openp]').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx.setProject(b.getAttribute('data-openp'));
        ctx.nav('dashboard');
      });
    });
    el.querySelector('#pf-print').addEventListener('click', function () {
      printDoc('تقرير محفظة المشاريع', portfolioHtml(rows, { avg: avg, atRisk: atRisk, totalBudget: totalBudget, wProg: wProg }));
    });
  }

  function projectGlanceLite(p) {
    const progVar = (p.progressActual || 0) - (p.progressPlanned || 0);
    return { behind: progVar < -3, progVar: Math.round(progVar * 10) / 10 };
  }

  function portfolioHtml(rows, agg) {
    return '<h1>تقرير محفظة المشاريع</h1>' +
      '<p class="muted">عدد المشاريع: <b>' + rows.length + '</b> · متوسط الصحة: <b>' + agg.avg + '/100</b> · تحت المخاطرة: <b>' + agg.atRisk + '</b> · إجمالي الميزانيات: <b>' + (agg.totalBudget / 1e6).toFixed(1) + 'M</b> · الإنجاز المرجّح: <b>' + agg.wProg + '%</b></p>' +
      '<table><thead><tr><th>المشروع</th><th>النوع</th><th>الإنجاز الفعلي</th><th>المخطط</th><th>مؤشر الصحة</th><th>الفئة</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r.p.name) + '</td><td>' + esc(r.p.type || '') + '</td><td>' + (r.p.progressActual || 0) + '%</td><td>' + (r.p.progressPlanned || 0) + '%</td>' +
          '<td>' + r.h.score + '</td><td class="' + (r.h.cls === 'ok' ? 'ok' : 'bad') + '">' + r.h.grade + ' — ' + esc(r.h.gradeAr) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  window.ViewsHandover = {
    renderHandover: renderHandover,
    renderPhases: renderPhases,
    renderPortfolio: renderPortfolio,
    printDoc: printDoc
  };
})();
