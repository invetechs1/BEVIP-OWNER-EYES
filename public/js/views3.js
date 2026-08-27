/**
 * بصير | صفحات التحسينات: تتبع التقديمات، RFI/RFP، أوامر التغيير،
 * قاعدة بيانات المقاولين، خادم الملفات المركزي، وثائق المشروع،
 * نماذج ووثائق BIM وربط الكاميرات، ولوحة اختيار المشروع.
 */
(function () {
  'use strict';

  const VS = window.ViewsShared;
  const esc = VS.esc, pill = VS.pill, money = VS.money, toast = VS.toast, modal = VS.modal;

  function contractorName(ctx, id) {
    const c = (ctx.Sall || ctx.S).contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id || '—';
  }

  function fmtSize(n) {
    if (!n) return '—';
    if (n > 1e9) return (n / 1e9).toFixed(2) + ' GB';
    if (n > 1e6) return (n / 1e6).toFixed(1) + ' MB';
    return Math.max(1, Math.round(n / 1e3)) + ' KB';
  }

  const HIST_LABELS = {
    pending: 'قُدّم للمراجعة', approved: 'اعتُمد', approved_notes: 'اعتُمد مع ملاحظات',
    rejected: 'أُرجع للمقاول', resubmitted: 'أُعيد التقديم (نسخة معدلة)', open: 'فُتح', answered: 'تم الرد'
  };

  const SLA_DAYS = 7; // مهلة المراجعة المستهدفة بالأيام

  function daysSince(dateStr) {
    if (!dateStr) return null;
    return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000));
  }

  /** تصدير CSV بترميز يفتح عربياً في Excel */
  function exportCsv(filename, headers, rows) {
    const csv = '﻿' + [headers].concat(rows).map(function (r) {
      return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('📥 صُدّر الملف: ' + filename);
  }

  // ============ 1) تتبع التقديمات: الحالة والتواريخ ومدة المراجعة والسجل الكامل ============
  const SUB_COLS = [
    ['shopDrawings', '📐 مخطط تنفيذي'], ['materials', '🧱 اعتماد مواد'],
    ['scheduleSubmittals', '🗓️ جدول زمني'], ['wirs', '✅ طلب استلام'],
    ['changeOrders', '🔁 أمر تغيير'], ['payments', '💰 مستخلص'],
    ['methodStatements', '🧾 أسلوب تنفيذ/ITP'], ['claims', '⚖️ مطالبة/EOT'],
    ['valueEngineering', '💡 هندسة قيمية'], ['handoverDocs', '📦 مستند تسليم'],
    ['rfis', '❓ استفسار RFI'], ['rfps', '📮 عرض RFP']
  ];
  const subState = { q: '', status: 'all', type: 'all' };

  function submissionRows(ctx) {
    const rows = [];
    SUB_COLS.forEach(function (t) {
      (ctx.S[t[0]] || []).forEach(function (it) {
        const submitted = (it.history && it.history[0] && it.history[0].date) || it.date || '';
        rows.push({
          col: t[0], typeName: t[1], item: it,
          fileNo: it.docCode || it.ref || '—', title: it.title || '',
          contractor: contractorName(ctx, it.contractorId),
          submitted: submitted, current: it.date || '',
          status: it.status || ''
        });
      });
    });
    rows.sort(function (a, b) { return String(b.current).localeCompare(String(a.current)); });
    return rows;
  }

  function historyModal(ctx, row) {
    const it = row.item;
    const hist = it.history || [];
    const revs = it.revisions || [];
    modal(
      '<h3>🕓 السجل الكامل للتقديم</h3>' +
      '<div class="m-sub">' + row.typeName + ' · <span class="num">' + esc(row.fileNo) + '</span> — ' + esc(row.title) + '</div>' +
      '<div class="card" style="padding:14px">' +
      '<div class="grid g2 small" style="gap:8px">' +
      '<div>📅 تاريخ التقديم: <b class="num">' + esc(row.submitted || '—') + '</b></div>' +
      '<div>🔎 بدء المراجعة: <b class="num">' + esc(it.reviewStartDate || it.date || '—') + '</b></div>' +
      '<div>🏁 انتهاء المراجعة: <b class="num">' + esc(it.reviewEndDate || '—') + '</b></div>' +
      '<div>⏱ مدة المراجعة: <b class="num">' + (it.reviewDays != null ? it.reviewDays + ' يوم' : 'جارية') + '</b></div>' +
      '</div>' +
      (revs.length ? '<div class="small mt">🗂 نسخ المستند: <b class="num">' + (revs.length + 1) + '</b> (النسخ السابقة مؤرشفة بترميزها وقراراتها داخل نفس المستند)</div>' : '') +
      '<div class="mt"><b class="small">سجل كل تغييرات الحالة:</b>' +
      (hist.length ?
        '<div class="timeline" style="margin-top:10px">' +
        hist.map(function (h) {
          return '<div class="tl-item"><b class="small">' + esc(HIST_LABELS[h.status] || h.status) + '</b>' +
            ' <span class="small muted num">' + esc(h.date || '') + '</span>' +
            '<div class="small muted">بواسطة: ' + esc(h.by || '—') + (h.role ? ' (' + esc(h.role) + ')' : '') + '</div>' +
            (h.notes ? '<div class="small" style="color:#c6cdda">' + esc(h.notes) + '</div>' : '') + '</div>';
        }).join('') + '</div>'
        : '<div class="small muted mt">لا سجل حالات لهذا التقديم بعد</div>') + '</div>' +
      '</div>' +
      '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">إغلاق</button></div>'
    );
  }

  function renderSubmissions(el, ctx) {
    const SLA_DAYS = VS.thresholds(ctx.S.projects[0]).slaReviewDays; // عتبة المشروع الحالي
    const all = submissionRows(ctx);
    const rows = all.filter(function (r) {
      if (subState.type !== 'all' && r.col !== subState.type) return false;
      if (subState.status !== 'all' && r.status !== subState.status) return false;
      if (subState.q) {
        const hay = (r.fileNo + ' ' + (r.item.ref || '') + ' ' + r.title + ' ' + r.contractor).toLowerCase();
        if (hay.indexOf(subState.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    const pending = all.filter(function (r) { return r.status === 'pending' || r.status === 'open'; }).length;
    const done = all.filter(function (r) { return ['approved', 'approved_notes', 'answered'].indexOf(r.status) !== -1; }).length;
    const rejected = all.filter(function (r) { return r.status === 'rejected'; }).length;
    const durations = all.map(function (r) { return r.item.reviewDays; }).filter(function (d) { return d != null; });
    const avgDays = durations.length ? Math.round(durations.reduce(function (a, b) { return a + b; }, 0) / durations.length * 10) / 10 : 0;
    const overdue = all.filter(function (r) {
      return (r.status === 'pending' || r.status === 'open') && (daysSince(r.item.date) || 0) > SLA_DAYS;
    }).length;

    el.innerHTML =
      '<div class="grid g4 mb" style="grid-template-columns:repeat(5,1fr)">' +
      '<div class="card kpi"><div class="lbl">إجمالي التقديمات</div><div class="val num">' + all.length + '</div><div class="sub">بكل الأنواع</div></div>' +
      '<div class="card kpi k-warn"><div class="lbl">قيد المراجعة الآن</div><div class="val num">' + pending + '</div><div class="sub">لدى الاستشاري</div></div>' +
      '<div class="card kpi ' + (overdue ? 'k-danger' : 'k-ok') + '"><div class="lbl">متأخرة عن المهلة</div><div class="val num">' + overdue + '</div><div class="sub">في المراجعة أكثر من ' + SLA_DAYS + ' أيام</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">معتمد / تم الرد</div><div class="val num">' + done + '</div><div class="sub">مرفوض/مرجع: <b class="num">' + rejected + '</b></div></div>' +
      '<div class="card kpi k-info"><div class="lbl">متوسط مدة المراجعة</div><div class="val num">' + avgDays + '</div><div class="sub">يوم لكل تقديم مكتمل</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0 0 8px">📋 تتبع التقديمات <span class="hint">رقم الملف، الحالة، تواريخ التقديم والمراجعة، المدة، والسجل الكامل للتغييرات</span></h3>' +
      '<button class="btn ghost sm" id="sb-csv">📥 تصدير CSV</button></div>' +
      '<div class="grid" style="grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:14px">' +
      '<input class="inp" id="sb-q" placeholder="🔍 بحث برقم الملف أو الاسم أو الجهة..." value="' + esc(subState.q) + '">' +
      '<select class="inp" id="sb-type"><option value="all">كل الأنواع</option>' +
      SUB_COLS.map(function (t) {
        const n = (ctx.S[t[0]] || []).length;
        return n ? '<option value="' + t[0] + '"' + (subState.type === t[0] ? ' selected' : '') + '>' + t[1] + ' (' + n + ')</option>' : '';
      }).join('') + '</select>' +
      '<select class="inp" id="sb-status">' +
      [['all', 'كل الحالات'], ['pending', 'قيد المراجعة'], ['approved', 'معتمد'], ['approved_notes', 'معتمد مع ملاحظات'], ['rejected', 'مرجع للتعديل'], ['open', 'مفتوح'], ['answered', 'تم الرد']].map(function (o) {
        return '<option value="' + o[0] + '"' + (subState.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
      (rows.length ?
        '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>رقم الملف</th><th>اسم التقديم</th><th>النوع</th><th>الجهة</th><th>تاريخ التقديم</th><th>بدء المراجعة</th><th>انتهاء المراجعة</th><th>المدة</th><th>الحالة</th><th>النسخ</th><th></th></tr></thead><tbody>' +
        rows.slice(0, 300).map(function (r, i) {
          const it = r.item;
          return '<tr>' +
            '<td class="num small" style="white-space:nowrap"><b style="color:var(--accent2)">' + esc(r.fileNo) + '</b>' +
            (it.ref && it.docCode ? '<div class="muted">' + esc(it.ref) + '</div>' : '') + '</td>' +
            '<td class="small" style="max-width:240px">' + esc(r.title) + '</td>' +
            '<td class="small">' + r.typeName + '</td>' +
            '<td class="small">' + esc(r.contractor) + '</td>' +
            '<td class="small muted num">' + esc(r.submitted || '—') + '</td>' +
            '<td class="small muted num">' + esc(it.reviewStartDate || it.date || '—') + '</td>' +
            '<td class="small muted num">' + esc(it.reviewEndDate || '—') + '</td>' +
            '<td class="num small">' + (it.reviewDays != null
              ? '<b>' + it.reviewDays + '</b> يوم'
              : (function () {
                  const d = daysSince(it.date) || 0;
                  return d > SLA_DAYS
                    ? '<span class="pill p-danger" style="font-size:10px">⏰ متأخرة — ' + d + ' يوم</span>'
                    : '<span class="muted">جارية منذ ' + d + ' يوم</span>';
                })()) + '</td>' +
            '<td>' + pill(r.status) + '</td>' +
            '<td class="num small">' + ((it.revisions || []).length + 1) + '</td>' +
            '<td><div class="flex" style="gap:6px">' + window.DrawingViewer.btn(it) +
            '<button class="btn ghost sm" data-hist="' + i + '">🕓 السجل</button></div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📋</div>لا تقديمات مطابقة</div>') +
      '</div>';

    el.querySelector('#sb-csv').addEventListener('click', function () {
      exportCsv('bassir-submissions.csv',
        ['رقم الملف', 'المرجع', 'اسم التقديم', 'النوع', 'الجهة', 'تاريخ التقديم', 'بدء المراجعة', 'انتهاء المراجعة', 'مدة المراجعة (يوم)', 'الحالة', 'عدد النسخ'],
        rows.map(function (r) {
          const it = r.item;
          return [r.fileNo, it.ref || '', r.title, r.typeName.replace(/^\S+\s/, ''), r.contractor,
            r.submitted, it.reviewStartDate || it.date || '', it.reviewEndDate || '',
            it.reviewDays != null ? it.reviewDays : 'جارية', r.status, (it.revisions || []).length + 1];
        }));
    });
    el.querySelector('#sb-type').addEventListener('change', function (e) { subState.type = e.target.value; renderSubmissions(el, ctx); });
    el.querySelector('#sb-status').addEventListener('change', function (e) { subState.status = e.target.value; renderSubmissions(el, ctx); });
    const q = el.querySelector('#sb-q');
    q.addEventListener('input', function () {
      subState.q = q.value; renderSubmissions(el, ctx);
      const q2 = el.querySelector('#sb-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });
    el.querySelectorAll('[data-hist]').forEach(function (b) {
      b.addEventListener('click', function () { historyModal(ctx, rows[Number(b.getAttribute('data-hist'))]); });
    });
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const r = rows.find(function (x) { return x.item.id === b.getAttribute('data-dview'); });
        if (!r) return;
        const isStaff = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
        window.DrawingViewer.open(ctx, r.col, r.item, {
          canEdit: isStaff, canReview: isStaff && r.item.status === 'pending',
          canRespond: ctx.U.role === 'contractor'
        });
      });
    });
  }

  // ============ 2) الاستفسارات والعروض RFI / RFP: إرسال، ردود، ومدد الاستجابة ============
  const rfxState = { tab: 'rfis' };

  function turnaround(it) {
    if (!it.signDate || !it.date) return null;
    return Math.max(0, Math.round((new Date(it.signDate) - new Date(it.date)) / 86400000));
  }

  function renderRfx(el, ctx) {
    const SLA_DAYS = VS.thresholds(ctx.S.projects[0]).slaReviewDays; // عتبة المشروع الحالي
    const tab = rfxState.tab;
    const isRfp = tab === 'rfps';
    const items = (ctx.S[tab] || []).slice().sort(function (a, b) {
      return (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1);
    });
    const canAnswer = ['consultant', 'admin', 'owner_rep', 'owner'].indexOf(ctx.U.role) !== -1;
    const open = items.filter(function (x) { return x.status === 'open'; }).length;
    const answered = items.filter(function (x) { return x.status === 'answered'; });
    const tds = answered.map(turnaround).filter(function (d) { return d != null; });
    const avgTd = tds.length ? Math.round(tds.reduce(function (a, b) { return a + b; }, 0) / tds.length * 10) / 10 : 0;

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'rfis' ? 'active' : '') + '" data-xtab="rfis">❓ استفسارات RFI</div>' +
      '<div class="tab ' + (tab === 'rfps' ? 'active' : '') + '" data-xtab="rfps">📮 طلبات وعروض RFP</div>' +
      '</div>' +
      '<div class="grid g3 mb">' +
      '<div class="card kpi ' + (open ? 'k-warn' : 'k-ok') + '"><div class="lbl">بانتظار الرد</div><div class="val num">' + open + '</div><div class="sub">' + (isRfp ? 'لدى الاستشاري أو المالك' : 'لدى الاستشاري') + '</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">تم الرد عليها</div><div class="val num">' + answered.length + '</div><div class="sub">بسجل ردود موثق وموقع</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">متوسط مدة الاستجابة</div><div class="val num">' + avgTd + '</div><div class="sub">يوم من الإرسال حتى الرد</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;margin-bottom:8px;flex-wrap:wrap">' +
      '<h3 style="margin:0">' + (isRfp ? '📮 طلبات العروض والمقترحات RFP <span class="hint">تُوجه للاستشاري أو للمالك مع تتبع الردود ومددها</span>' : '❓ الاستفسارات الفنية RFI') + '</h3>' +
      '<div class="flex"><button class="btn ghost sm" id="rx-csv">📥 تصدير CSV</button>' +
      '<button class="btn sm" id="rx-add">➕ إرسال ' + (isRfp ? 'RFP' : 'RFI') + ' جديد</button></div></div>' +
      (items.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>المرجع</th><th>الموضوع</th><th>من</th>' + (isRfp ? '<th>موجه إلى</th>' : '') +
        '<th>تاريخ الإرسال</th><th>الحالة</th><th>الرد وتاريخه</th><th>مدة الاستجابة</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          const td = turnaround(it);
          return '<tr><td class="num small"><b>' + esc(it.ref || '') + '</b>' +
            (it.docCode ? '<div class="muted" style="font-size:10px;color:var(--accent2)">' + esc(it.docCode) + '</div>' : '') + '</td>' +
            '<td style="max-width:280px">' + esc(it.title) +
            (it.question ? '<div class="small muted">' + esc(it.question) + '</div>' : '') + '</td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            (isRfp ? '<td class="small">' + (it.to === 'owner' ? '👁 المالك' : '📐 الاستشاري') + '</td>' : '') +
            '<td class="small muted num">' + esc(it.date) + '</td>' +
            '<td>' + pill(it.status) + '</td>' +
            '<td class="small" style="max-width:260px">' + (it.answer ? '<span style="color:var(--ok)">' + esc(it.answer) + '</span>' +
              (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') : '<span class="muted">—</span>') + '</td>' +
            '<td class="num small">' + (td != null
              ? '<b>' + td + '</b> يوم'
              : it.status === 'open'
                ? (function () {
                    const d = daysSince(it.date) || 0;
                    return d > SLA_DAYS
                      ? '<span class="pill p-danger" style="font-size:10px">⏰ بلا رد منذ ' + d + ' يوم</span>'
                      : '<span class="muted">بانتظار الرد منذ ' + d + ' يوم</span>';
                  })()
                : '<span class="muted">—</span>') + '</td>' +
            '<td>' + (canAnswer && it.status === 'open' ? '<button class="btn sm" data-ans="' + it.id + '">↩️ رد</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>لا سجلات — أرسل أول ' + (isRfp ? 'RFP' : 'RFI') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-xtab]').forEach(function (t) {
      t.addEventListener('click', function () { rfxState.tab = t.getAttribute('data-xtab'); renderRfx(el, ctx); });
    });
    el.querySelector('#rx-csv').addEventListener('click', function () {
      exportCsv(isRfp ? 'bassir-rfp.csv' : 'bassir-rfi.csv',
        ['المرجع', 'الكود', 'الموضوع', 'من', 'موجه إلى', 'تاريخ الإرسال', 'الحالة', 'الرد', 'وقّعه', 'تاريخ الرد', 'مدة الاستجابة (يوم)'],
        items.map(function (it) {
          return [it.ref || '', it.docCode || '', it.title, contractorName(ctx, it.contractorId),
            isRfp ? (it.to === 'owner' ? 'المالك' : 'الاستشاري') : 'الاستشاري',
            it.date, it.status, it.answer || '', it.signature || '', it.signDate || '',
            turnaround(it) != null ? turnaround(it) : ''];
        }));
    });
    el.querySelector('#rx-add').addEventListener('click', function () {
      const m = modal(
        '<h3>➕ إرسال ' + (isRfp ? 'طلب عرض RFP' : 'استفسار RFI') + '</h3>' +
        (ctx.U.role !== 'contractor' ?
          '<label class="fl">باسم المقاول</label><select class="inp" id="rx-cont">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' : '') +
        (isRfp ? '<label class="fl">موجه إلى</label><select class="inp" id="rx-to"><option value="consultant">📐 الاستشاري</option><option value="owner">👁 المالك</option></select>' : '') +
        '<label class="fl">المرجع</label><input class="inp num" id="rx-ref" placeholder="' + (isRfp ? 'RFP-001' : 'RFI-001') + '">' +
        '<label class="fl">الموضوع</label><input class="inp" id="rx-title">' +
        '<label class="fl">' + (isRfp ? 'تفاصيل العرض / الطلب' : 'نص الاستفسار') + '</label><textarea class="inp" id="rx-q" rows="4"></textarea>' +
        '<label class="fl">مرفق (اختياري)</label><input class="inp" id="rx-file" type="file">' +
        '<div class="m-actions"><button class="btn" id="rx-ok">إرسال</button><button class="btn mutedb" id="rx-cancel">إلغاء</button></div>'
      );
      m.querySelector('#rx-cancel').addEventListener('click', function () { m.remove(); });
      m.querySelector('#rx-ok').addEventListener('click', async function () {
        const title = m.querySelector('#rx-title').value.trim();
        if (!title) { toast('أدخل الموضوع', true); return; }
        const data = {
          ref: m.querySelector('#rx-ref').value || (isRfp ? 'RFP-' : 'RFI-') + Math.floor(Math.random() * 900 + 100),
          title: title, question: m.querySelector('#rx-q').value, status: 'open'
        };
        const cs = m.querySelector('#rx-cont');
        if (cs) data.contractorId = cs.value;
        if (isRfp) data.to = m.querySelector('#rx-to').value;
        const rf = m.querySelector('#rx-file').files[0];
        if (rf) data.file = await Api.upload(rf);
        try {
          await Api.create(tab, data);
          m.remove(); toast('✅ أُرسل وسُجّل بانتظار الرد'); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });
    el.querySelectorAll('[data-ans]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-ans'); });
        const m = modal(
          '<h3>↩️ الرد على: ' + esc(it.title) + '</h3>' +
          '<div class="m-sub">' + esc(it.ref || '') + ' · من ' + esc(contractorName(ctx, it.contractorId)) + ' · أُرسل ' + esc(it.date) + '</div>' +
          (it.question ? '<div class="card" style="padding:12px;margin-bottom:8px"><div class="small">' + esc(it.question) + '</div></div>' : '') +
          '<label class="fl">نص الرد (يُوثق بتوقيعك وتاريخه)</label><textarea class="inp" id="an-text" rows="4"></textarea>' +
          '<div class="m-actions"><button class="btn" id="an-ok">اعتماد الرد وتوقيعه</button><button class="btn mutedb" id="an-cancel">إلغاء</button></div>'
        );
        m.querySelector('#an-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#an-ok').addEventListener('click', async function () {
          const txt = m.querySelector('#an-text').value.trim();
          if (!txt) { toast('اكتب الرد أولاً', true); return; }
          try {
            await Api.update(tab, it.id, {
              answer: txt, status: 'answered',
              signature: ctx.U.name, signDate: new Date().toISOString().slice(0, 10)
            });
            m.remove(); toast('✅ سُجّل الرد ووُقّع وأُشعر المرسل'); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  }

  // ============ 3) أوامر التغيير والتعديلات: أثر التكلفة والمدة ودورة الاعتماد ============
  function renderVariations(el, ctx) {
    const items = (ctx.S.changeOrders || []).slice().sort(function (a, b) {
      return (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1);
    });
    const canReview = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const appr = items.filter(function (x) { return x.status === 'approved' || x.status === 'approved_notes'; });
    const pend = items.filter(function (x) { return x.status === 'pending'; });
    const costAppr = appr.reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    const costPend = pend.reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    const daysAppr = appr.reduce(function (a, b) { return a + (b.days || 0); }, 0);
    const P = ctx.S.projects[0] || {};
    const budget = P.budgetPlanned || 0;

    function stageChips(it) {
      const done = it.status !== 'pending';
      const ok = it.status === 'approved' || it.status === 'approved_notes';
      return '<div class="flex" style="gap:4px;flex-wrap:wrap">' +
        '<span class="pill p-ok" style="font-size:10px">1. مُقدَّم ✓</span>' +
        '<span class="pill ' + (done ? 'p-ok' : 'p-warn') + '" style="font-size:10px">2. مراجعة الاستشاري' + (done ? ' ✓' : '...') + '</span>' +
        '<span class="pill ' + (!done ? 'p-muted' : ok ? 'p-ok' : 'p-danger') + '" style="font-size:10px">3. ' + (!done ? 'القرار' : ok ? 'معتمد ✓' : 'مرفوض ✗') + '</span>' +
        '</div>';
    }

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi k-warn"><div class="lbl">قيد الاعتماد</div><div class="val num">' + pend.length + '</div><div class="sub">بقيمة ' + money(costPend) + '</div></div>' +
      '<div class="card kpi ' + (costAppr > 0 ? 'k-danger' : 'k-ok') + '"><div class="lbl">أثر التكلفة المعتمد</div><div class="val">' + money(costAppr) + '</div>' +
      '<div class="sub num">' + (budget ? (costAppr / budget * 100).toFixed(1) + '% من الميزانية' : '—') + '</div></div>' +
      '<div class="card kpi ' + (daysAppr ? 'k-warn' : 'k-ok') + '"><div class="lbl">أثر الجدول الزمني المعتمد</div><div class="val num">+' + daysAppr + '</div><div class="sub">يوم تمديد إجمالي</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">إجمالي الأوامر</div><div class="val num">' + items.length + '</div><div class="sub">معتمد: <b class="num">' + appr.length + '</b></div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0 0 8px">🔁 أوامر التغيير وطلبات التعديل <span class="hint">دورة اعتماد كاملة مع تتبع أثر التكلفة والجدول الزمني</span></h3>' +
      '<button class="btn ghost sm" id="vr-csv">📥 تصدير CSV</button></div>' +
      (items.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>المرجع</th><th>الوصف</th><th>الجهة</th><th>أثر التكلفة</th><th>أثر المدة</th><th>دورة الاعتماد</th><th>القرار</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          return '<tr><td class="num small"><b>' + esc(it.ref || '') + '</b>' +
            (it.docCode ? '<div class="muted" style="font-size:10px;color:var(--accent2)">' + esc(it.docCode) + '</div>' : '') + '</td>' +
            '<td style="max-width:260px">' + esc(it.title) + '<div class="small muted num">' + esc(it.date || '') + '</div></td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            '<td>' + money(it.amount) + '</td>' +
            '<td class="num small">+' + (it.days || 0) + ' يوم</td>' +
            '<td>' + stageChips(it) + '</td>' +
            '<td class="small" style="max-width:200px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
            (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td>' +
            '<td><div class="flex" style="gap:6px">' + window.DrawingViewer.btn(it) +
            (canReview && it.status === 'pending' ? '<button class="btn sm" data-vrev="' + it.id + '">✍️ قرار</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🔁</div>لا أوامر تغيير بعد</div>') +
      '</div>';

    el.querySelector('#vr-csv').addEventListener('click', function () {
      exportCsv('bassir-variations.csv',
        ['المرجع', 'الكود', 'الوصف', 'الجهة', 'أثر التكلفة (ر.س)', 'أثر المدة (يوم)', 'التاريخ', 'الحالة', 'القرار', 'وقّعه'],
        items.map(function (it) {
          return [it.ref || '', it.docCode || '', it.title, contractorName(ctx, it.contractorId),
            it.amount || 0, it.days || 0, it.date || '', it.status, it.notes || '', it.signature || ''];
        }));
    });
    el.querySelectorAll('[data-vrev]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-vrev'); });
        const m = modal(
          '<h3>✍️ قرار أمر التغيير: ' + esc(it.title) + '</h3>' +
          '<div class="m-sub">أثر التكلفة ' + money(it.amount) + ' · أثر المدة +' + (it.days || 0) + ' يوم</div>' +
          '<label class="fl">القرار</label><select class="inp" id="vr-status">' +
          '<option value="approved">✅ اعتماد</option><option value="approved_notes">📝 اعتماد مع ملاحظات</option>' +
          '<option value="rejected">❌ رفض وإرجاع</option></select>' +
          '<label class="fl">الملاحظات</label><textarea class="inp" id="vr-notes" rows="3"></textarea>' +
          '<div class="m-actions"><button class="btn" id="vr-ok">تأكيد وتوقيع</button><button class="btn mutedb" id="vr-cancel">إلغاء</button></div>'
        );
        m.querySelector('#vr-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#vr-ok').addEventListener('click', async function () {
          try {
            await Api.review({ collection: 'changeOrders', id: it.id, status: m.querySelector('#vr-status').value, notes: m.querySelector('#vr-notes').value });
            m.remove(); toast('✅ سُجّل القرار وانعكس أثره على المؤشرات'); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-dview'); });
        if (it) window.DrawingViewer.open(ctx, 'changeOrders', it, { canEdit: canReview, canReview: canReview && it.status === 'pending' });
      });
    });
  }

  // ============ 4) قاعدة بيانات المقاولين: بيانات الشركات والوثائق القانونية ============
  function renderContractorDb(el, ctx) {
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const list = ctx.S.contractors || [];

    function chips(arr, cls) {
      if (!arr || !arr.length) return '<span class="muted small">—</span>';
      return arr.map(function (x) { return '<span class="pill ' + (cls || 'p-muted') + '" style="font-size:10.5px;margin:2px">' + esc(x) + '</span>'; }).join(' ');
    }

    el.innerHTML =
      '<div class="card mb"><h3>🗃️ قاعدة بيانات المقاولين <span class="hint">بيانات الشركة كاملة: العنوان، مسؤول التواصل، السجل التجاري، الرخص والشهادات والوثائق القانونية</span></h3></div>' +
      '<div class="grid g2">' +
      list.map(function (c) {
        const d = VS.discOf(ctx, c.type);
        return '<div class="card"><div class="flex" style="justify-content:space-between">' +
          '<h3 style="margin:0">' + d.icon + ' ' + esc(c.name) + '</h3>' +
          (canEdit ? '<button class="btn ghost sm" data-cedit="' + c.id + '">✏️ تحديث البيانات</button>' : '') + '</div>' +
          '<div class="grid g2 small" style="gap:8px;margin-top:12px">' +
          '<div>🏷️ التخصص: <b>' + esc(d.name) + '</b></div>' +
          '<div>📄 السجل التجاري: <b class="num">' + esc(c.crNumber || '—') + '</b></div>' +
          '<div>📍 العنوان: ' + esc(c.address || '—') + '</div>' +
          '<div>👤 مسؤول التواصل: <b>' + esc(c.contactPerson || '—') + '</b></div>' +
          '<div>📞 الهاتف: <b class="num" dir="ltr">' + esc(c.phone || '—') + '</b></div>' +
          '<div>📧 البريد: <b class="num" dir="ltr">' + esc(c.email || '—') + '</b></div>' +
          '<div>💰 قيمة العقد: ' + money(c.contractValue) + '</div>' +
          '<div>🗓️ المدة: <span class="num">' + esc(c.startDate || '') + ' ← ' + esc(c.endDate || '') + '</span></div>' +
          '</div>' +
          '<div class="small mt"><b>🪪 الرخص:</b> ' + chips(c.licenses, 'p-info') + '</div>' +
          '<div class="small mt"><b>🎖️ الشهادات والتصنيفات:</b> ' + chips(c.certifications, 'p-ok') + '</div>' +
          '<div class="small mt"><b>⚖️ الوثائق القانونية:</b> ' + chips(c.legalDocs) + '</div>' +
          '</div>';
      }).join('') + '</div>' +
      (!list.length ? '<div class="empty"><div class="e-ico">🗃️</div>لا مقاولون بعد — أضفهم من صفحة إدارة المقاولين</div>' : '');

    el.querySelectorAll('[data-cedit]').forEach(function (b) {
      b.addEventListener('click', function () {
        const c = list.find(function (x) { return x.id === b.getAttribute('data-cedit'); });
        const m = modal(
          '<h3>✏️ بيانات الشركة: ' + esc(c.name) + '</h3>' +
          '<div class="grid g2"><div><label class="fl">العنوان</label><input class="inp" id="ce-address" value="' + esc(c.address || '') + '"></div>' +
          '<div><label class="fl">مسؤول التواصل</label><input class="inp" id="ce-contact" value="' + esc(c.contactPerson || '') + '"></div></div>' +
          '<div class="grid g2"><div><label class="fl">الهاتف</label><input class="inp num" id="ce-phone" value="' + esc(c.phone || '') + '"></div>' +
          '<div><label class="fl">البريد الإلكتروني</label><input class="inp num" id="ce-email" dir="ltr" value="' + esc(c.email || '') + '"></div></div>' +
          '<label class="fl">رقم السجل التجاري</label><input class="inp num" id="ce-cr" value="' + esc(c.crNumber || '') + '">' +
          '<label class="fl">الرخص (سطر لكل رخصة)</label><textarea class="inp" id="ce-lic" rows="2">' + esc((c.licenses || []).join('\n')) + '</textarea>' +
          '<label class="fl">الشهادات والتصنيفات (سطر لكل شهادة)</label><textarea class="inp" id="ce-cert" rows="2">' + esc((c.certifications || []).join('\n')) + '</textarea>' +
          '<label class="fl">الوثائق القانونية (سطر لكل وثيقة)</label><textarea class="inp" id="ce-legal" rows="2">' + esc((c.legalDocs || []).join('\n')) + '</textarea>' +
          '<div class="m-actions"><button class="btn" id="ce-ok">حفظ البيانات</button><button class="btn mutedb" id="ce-cancel">إلغاء</button></div>'
        );
        m.querySelector('#ce-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#ce-ok').addEventListener('click', async function () {
          try {
            await Api.update('contractors', c.id, {
              address: m.querySelector('#ce-address').value,
              contactPerson: m.querySelector('#ce-contact').value,
              phone: m.querySelector('#ce-phone').value,
              email: m.querySelector('#ce-email').value,
              crNumber: m.querySelector('#ce-cr').value,
              licenses: m.querySelector('#ce-lic').value.split('\n').filter(Boolean),
              certifications: m.querySelector('#ce-cert').value.split('\n').filter(Boolean),
              legalDocs: m.querySelector('#ce-legal').value.split('\n').filter(Boolean)
            });
            m.remove(); toast('✅ حُدثت بيانات الشركة'); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  }

  // ============ 5) خادم الملفات المركزي: تخزين آمن، نسخ، واسترجاع ============
  const fsState = { q: '', cat: 'all' };
  const DOC_CATEGORIES = ['العقود', 'جداول الكميات BOQ', 'التصاميم الأولية', 'مخططات IFC', 'المواصفات', 'متطلبات المالك', 'وثائق فنية', 'تقارير', 'أخرى'];

  function renderFileServer(el, ctx) {
    const files = (ctx.S.files || []).filter(function (f) {
      if (fsState.cat !== 'all' && (f.category || 'أخرى') !== fsState.cat) return false;
      if (fsState.q) {
        const hay = ((f.name || '') + ' ' + (f.docCode || '') + ' ' + (f.by || '')).toLowerCase();
        if (hay.indexOf(fsState.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    const totalSize = (ctx.S.files || []).reduce(function (a, f) { return a + (f.size || 0); }, 0);
    const totalVers = (ctx.S.files || []).reduce(function (a, f) { return a + (f.versions || []).length; }, 0);
    const isAdmin = ctx.U.role === 'admin';

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">الملفات المخزنة</div><div class="val num">' + (ctx.S.files || []).length + '</div><div class="sub">تخزين مركزي آمن ومُكوَّد</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">الحجم الإجمالي</div><div class="val num" style="font-size:20px">' + fmtSize(totalSize) + '</div><div class="sub">يدعم ملفات BIM حتى 500MB</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">نسخ الإصدارات المؤرشفة</div><div class="val num">' + totalVers + '</div><div class="sub">تاريخ نسخ كامل بلا تكرار ملفات</div></div>' +
      '<div class="card kpi ' + (isAdmin ? 'k-warn' : '') + '"><div class="lbl">النسخ الاحتياطي</div><div class="val" style="font-size:16px">' +
      (isAdmin ? '<button class="btn sm" id="fs-backup">🛡 نسخة احتياطية الآن</button>' : '<span class="small muted">يديره الأدمن</span>') + '</div>' +
      '<div class="sub" id="fs-backups-info">نسخ كاملة لقاعدة البيانات</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;margin-bottom:12px">' +
      '<h3 style="margin:0">🗄️ خادم الملفات المركزي <span class="hint">استرجاع سهل، سجل نسخ لكل ملف، وتنظيم بالفئات</span></h3>' +
      '<div class="flex"><input class="inp" id="fs-upfile" type="file" style="max-width:220px">' +
      '<select class="inp" id="fs-upcat" style="max-width:170px">' +
      DOC_CATEGORIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
      '<button class="btn sm" id="fs-up">⬆ رفع للخادم</button></div></div>' +
      '<div class="grid" style="grid-template-columns:2fr 1fr;gap:10px;margin-bottom:14px">' +
      '<input class="inp" id="fs-q" placeholder="🔍 بحث بالاسم أو الكود أو الرافع..." value="' + esc(fsState.q) + '">' +
      '<select class="inp" id="fs-cat"><option value="all">كل الفئات</option>' +
      DOC_CATEGORIES.map(function (c) {
        const n = (ctx.S.files || []).filter(function (f) { return (f.category || 'أخرى') === c; }).length;
        return n ? '<option' + (fsState.cat === c ? ' selected' : '') + '>' + c + '</option>' : '';
      }).join('') + '</select></div>' +
      (files.length ?
        '<div class="tbl-wrap" style="max-height:55vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>الكود</th><th>الملف</th><th>الفئة</th><th>الحجم</th><th>رفعه</th><th>التاريخ</th><th>النسخ</th><th></th></tr></thead><tbody>' +
        files.map(function (f, i) {
          const nv = (f.versions || []).length;
          return '<tr><td class="num small" style="white-space:nowrap"><b style="color:var(--accent2)">' + esc(f.docCode || '—') + '</b></td>' +
            '<td class="small" style="max-width:260px;direction:ltr;text-align:right">📎 ' + esc(f.name || '') + '</td>' +
            '<td class="small"><span class="pill p-muted">' + esc(f.category || 'أخرى') + '</span></td>' +
            '<td class="small num">' + fmtSize(f.size) + '</td>' +
            '<td class="small">' + esc(f.by || '—') + '</td>' +
            '<td class="small muted num">' + esc(f.date || '') + '</td>' +
            '<td class="num small">' + (nv ? '<button class="btn ghost sm" data-vers="' + i + '">🗂 ' + (nv + 1) + '</button>' : '1') + '</td>' +
            '<td><div class="flex" style="gap:6px">' +
            (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ تحميل</a>' : '') +
            '<button class="btn mutedb sm" data-newver="' + i + '">⬆ نسخة جديدة</button></div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🗄️</div>لا ملفات مطابقة — ارفع أول ملف للخادم المركزي</div>') +
      '<input type="file" id="fs-verfile" style="display:none">' +
      '</div>';

    el.querySelector('#fs-cat').addEventListener('change', function (e) { fsState.cat = e.target.value; renderFileServer(el, ctx); });
    const q = el.querySelector('#fs-q');
    q.addEventListener('input', function () {
      fsState.q = q.value; renderFileServer(el, ctx);
      const q2 = el.querySelector('#fs-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });

    el.querySelector('#fs-up').addEventListener('click', async function () {
      const f = el.querySelector('#fs-upfile').files[0];
      if (!f) { toast('اختر ملفاً أولاً', true); return; }
      try {
        await Api.upload(f, { category: el.querySelector('#fs-upcat').value });
        toast('✅ رُفع الملف وكُوّد وأُدرج في الخادم المركزي'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    // نسخة جديدة لملف قائم: تؤرشف السابقة في versions بلا سجل مكرر
    let verTarget = null;
    const verInput = el.querySelector('#fs-verfile');
    el.querySelectorAll('[data-newver]').forEach(function (b) {
      b.addEventListener('click', function () { verTarget = files[Number(b.getAttribute('data-newver'))]; verInput.click(); });
    });
    verInput.addEventListener('change', async function () {
      const f = verInput.files[0];
      if (!f || !verTarget) return;
      try {
        await Api.upload(f, { versionOf: verTarget.id });
        toast('✅ رُفعت نسخة جديدة — القديمة مؤرشفة في سجل النسخ'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    el.querySelectorAll('[data-vers]').forEach(function (b) {
      b.addEventListener('click', function () {
        const f = files[Number(b.getAttribute('data-vers'))];
        modal(
          '<h3>🗂 سجل نسخ الملف</h3><div class="m-sub num">' + esc(f.docCode || '') + '</div>' +
          '<div class="card" style="padding:12px">' +
          '<div class="flex" style="justify-content:space-between"><b class="small" style="direction:ltr">📎 ' + esc(f.name) + '</b><span class="pill p-ok">الحالية</span></div>' +
          '<div class="small muted num">' + esc(f.date || '') + ' · ' + fmtSize(f.size) + ' · ' + esc(f.by || '') + '</div></div>' +
          (f.versions || []).slice().reverse().map(function (v) {
            return '<div class="card" style="padding:12px;margin-top:8px">' +
              '<div class="flex" style="justify-content:space-between"><b class="small" style="direction:ltr">📎 ' + esc(v.name) + '</b><span class="pill p-muted">نسخة ' + v.v + '</span></div>' +
              '<div class="small muted num">' + esc(v.date || '') + ' · ' + fmtSize(v.size) + ' · ' + esc(v.by || '') + '</div>' +
              (v.url ? '<a class="btn ghost sm" style="margin-top:6px" href="' + esc(v.url) + '" target="_blank">⬇ استرجاع هذه النسخة</a>' : '') + '</div>';
          }).join('') +
          '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">إغلاق</button></div>'
        );
      });
    });

    if (isAdmin) {
      el.querySelector('#fs-backup').addEventListener('click', async function () {
        try {
          const r = await Api.backup();
          toast('🛡 أُنشئت نسخة احتياطية كاملة: ' + (r.file || ''));
          loadBackups();
        } catch (e) { toast(e.message, true); }
      });
      function loadBackups() {
        Api.backups().then(function (list) {
          const info = el.querySelector('#fs-backups-info');
          if (info && list.length) info.innerHTML = '<b class="num">' + list.length + '</b> نسخة — آخرها ' + esc(list[0].date || '');
        }).catch(function () { /* تجاهل */ });
      }
      loadBackups();
    }
  }

  // ============ 6) وثائق المشروع: مستودع لكل مشروع حسب الفئة ============
  const pdState = { cat: null };
  const CAT_ICONS = { 'العقود': '📜', 'جداول الكميات BOQ': '📊', 'التصاميم الأولية': '🎨', 'مخططات IFC': '📐', 'المواصفات': '📘', 'متطلبات المالك': '👁', 'وثائق فنية': '🔧', 'تقارير': '📝', 'أخرى': '📎' };

  function renderProjectDocs(el, ctx) {
    const P = ctx.S.projects[0] || {};
    const files = ctx.S.files || [];
    const byCat = {};
    DOC_CATEGORIES.forEach(function (c) { byCat[c] = []; });
    files.forEach(function (f) { (byCat[f.category || 'أخرى'] = byCat[f.category || 'أخرى'] || []).push(f); });
    const canUp = ctx.U.role !== 'owner';

    const sel = pdState.cat;
    el.innerHTML =
      '<div class="card mb"><h3>📁 وثائق المشروع: ' + esc(P.name || '') + ' <span class="hint">مستودع مستندات هذا المشروع — كل ما يخصه في مكان واحد مُكوَّد</span></h3>' +
      (canUp ? '<div class="flex mt"><input class="inp" id="pd2-file" type="file" style="max-width:240px">' +
        '<select class="inp" id="pd2-cat" style="max-width:190px">' +
        DOC_CATEGORIES.map(function (c) { return '<option' + (sel === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
        '<button class="btn sm" id="pd2-up">⬆ إضافة للمستودع</button></div>' : '') + '</div>' +

      '<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px" class="mb">' +
      DOC_CATEGORIES.map(function (c) {
        const n = (byCat[c] || []).length;
        return '<div class="card" data-pcat="' + esc(c) + '" style="cursor:pointer;padding:16px;border-color:' + (sel === c ? 'var(--accent)' : 'var(--border)') + '">' +
          '<div class="flex" style="justify-content:space-between"><b>' + (CAT_ICONS[c] || '📎') + ' ' + esc(c) + '</b>' +
          '<span class="pill ' + (n ? 'p-info' : 'p-muted') + ' num">' + n + '</span></div></div>';
      }).join('') + '</div>' +

      (sel ?
        '<div class="card mt"><h3>' + (CAT_ICONS[sel] || '📎') + ' ' + esc(sel) + '</h3>' +
        ((byCat[sel] || []).length ?
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الملف</th><th>الحجم</th><th>رفعه</th><th>التاريخ</th><th>النسخ</th><th></th></tr></thead><tbody>' +
          byCat[sel].map(function (f) {
            return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(f.docCode || '—') + '</b></td>' +
              '<td class="small" style="direction:ltr;text-align:right">📎 ' + esc(f.name || '') + '</td>' +
              '<td class="small num">' + fmtSize(f.size) + '</td>' +
              '<td class="small">' + esc(f.by || '—') + '</td>' +
              '<td class="small muted num">' + esc(f.date || '') + '</td>' +
              '<td class="num small">' + ((f.versions || []).length + 1) + '</td>' +
              '<td>' + (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ تحميل</a>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="empty"><div class="e-ico">📁</div>لا وثائق في هذه الفئة بعد</div>') + '</div>'
        : '<div class="small muted mt">اختر فئة لعرض وثائقها</div>');

    el.querySelectorAll('[data-pcat]').forEach(function (c) {
      c.addEventListener('click', function () {
        pdState.cat = pdState.cat === c.getAttribute('data-pcat') ? null : c.getAttribute('data-pcat');
        renderProjectDocs(el, ctx);
      });
    });
    const up = el.querySelector('#pd2-up');
    if (up) up.addEventListener('click', async function () {
      const f = el.querySelector('#pd2-file').files[0];
      if (!f) { toast('اختر ملفاً أولاً', true); return; }
      try {
        await Api.upload(f, { category: el.querySelector('#pd2-cat').value });
        toast('✅ أُضيف للمستودع وكُوّد تلقائياً'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ 7) BIM: النماذج (سحابي/من الجهاز) + الوثائق بالقوالب + ربط الكاميرات ============
  const bimState = { tab: 'models' };
  const BIM_KINDS = { bep: 'خطة تنفيذ BIM (BEP)', midp: 'خطة تسليم المعلومات (MIDP)', clash: 'تقرير اكتشاف التعارضات', closeout: 'تقرير الإغلاق (Close-Out)', other: 'وثيقة BIM أخرى' };
  const BIM_TEMPLATES = {
    bep: {
      title: 'خطة تنفيذ الـBIM',
      sections: {
        'أهداف الـBIM': 'التنسيق بين التخصصات، اكتشاف التعارضات قبل التنفيذ، استخراج الكميات، وربط النموذج بالجدول الزمني (4D) والتكلفة (5D).',
        'الأدوار والمسؤوليات': 'مدير BIM، منسق نماذج لكل مقاول، واجتماع تنسيق نماذج أسبوعي.',
        'معايير النمذجة': 'مستوى التفصيل LOD 350 للتنفيذ، تسمية الملفات وفق ISO 19650، وحدة المتر، نقطة أصل موحدة.',
        'بيئة البيانات المشتركة CDE': 'نظام بصير هو الـCDE المعتمد: الرفع والاعتماد والأرشفة والتكويد.',
        'جدول تسليم النماذج': 'معماري وإنشائي: كل أسبوعين. MEP: أسبوعياً أثناء التنسيق.'
      }
    },
    midp: {
      title: 'خطة تسليم المعلومات الرئيسية MIDP',
      sections: {
        'قائمة التسليمات': 'حدد كل نموذج ووثيقة معلومات مطلوبة، ومسؤول إعدادها، وصيغتها (IFC/RVT/PDF).',
        'مواعيد التسليم': 'اربط كل تسليمة بمرحلة المشروع (تصميم، تنفيذ، تسليم) وتاريخها المستهدف.',
        'مستويات المعلومات': 'حدد LOD/LOI المطلوب لكل تسليمة في كل مرحلة.',
        'المسؤوليات': 'مصفوفة إسناد: من يُعِد، من يراجع، من يعتمد كل تسليمة.'
      }
    },
    clash: {
      title: 'تقرير اكتشاف التعارضات',
      sections: {
        'نطاق الفحص': 'النماذج المفحوصة وإصداراتها (معماري/إنشائي/MEP) وتاريخ الفحص وقواعد التسامح.',
        'ملخص التعارضات': 'عدد التعارضات: حرجة / جوهرية / ثانوية، ونسبة المُغلق منها من الفحص السابق.',
        'أبرز التعارضات المفتوحة': 'وصف كل تعارض: الموقع (المحور/الدور)، التخصصات المتعارضة، المسؤول، وتاريخ الحل المستهدف.',
        'قرارات الحل': 'قرارات جلسة التنسيق وإجراءات كل مقاول.'
      }
    },
    closeout: {
      title: 'تقرير الإغلاق Close-Out',
      sections: {
        'حالة النموذج النهائي': 'مطابقة النموذج للتنفيذ الفعلي (As-Built) ونسبة التحقق الميداني.',
        'التسليمات المكتملة': 'قائمة النماذج والوثائق المسلمة نهائياً وأكوادها في أرشيف بصير.',
        'بيانات التشغيل والصيانة': 'ربط عناصر النموذج ببيانات الأصول (COBie) وكتيبات التشغيل.',
        'الدروس المستفادة': 'ما نجح وما يُحسَّن في مشاريع قادمة.'
      }
    }
  };

  function renderBim(el, ctx) {
    const tab = bimState.tab;
    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'models' ? 'active' : '') + '" data-btab="models">🏢 نماذج BIM</div>' +
      '<div class="tab ' + (tab === 'docs' ? 'active' : '') + '" data-btab="docs">📚 وثائق BIM (قوالب)</div>' +
      '<div class="tab ' + (tab === 'cams' ? 'active' : '') + '" data-btab="cams">🎥 ربط الكاميرات بالنموذج</div>' +
      '</div><div id="bim-body"></div>';
    el.querySelectorAll('[data-btab]').forEach(function (t) {
      t.addEventListener('click', function () { bimState.tab = t.getAttribute('data-btab'); renderBim(el, ctx); });
    });
    const body = el.querySelector('#bim-body');
    if (tab === 'models') renderBimModels(body, ctx);
    else if (tab === 'docs') renderBimDocs(body, ctx);
    else renderBimCams(body, ctx);
  }

  function renderBimModels(el, ctx) {
    const models = ctx.S.bimModels || [];
    el.innerHTML =
      '<div class="grid g2">' +
      '<div class="card"><h3>☁️ ربط نموذج سحابي</h3>' +
      '<div class="m-sub">اربط نموذجاً مستضافاً سحابياً (Autodesk / Trimble / أي رابط) — مزامنة موثوقة بلا رفع.</div>' +
      '<label class="fl">اسم النموذج</label><input class="inp" id="bm-cname" placeholder="BassirTower_Rev04.ifc">' +
      '<div class="grid g2"><div><label class="fl">الإصدار</label><input class="inp num" id="bm-crev" placeholder="Rev-04"></div>' +
      '<div><label class="fl">التخصص</label><select class="inp" id="bm-cdisc"><option value="federated">موحد Federated</option>' +
      (ctx.S.projects[0] ? ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') : '') +
      '</select></div></div>' +
      '<label class="fl">رابط النموذج السحابي</label><input class="inp num" id="bm-curl" dir="ltr" placeholder="https://acc.autodesk.com/...">' +
      '<div class="m-actions"><button class="btn block" id="bm-cloud">☁️ ربط النموذج السحابي</button></div></div>' +

      '<div class="card"><h3>💻 رفع نموذج من الجهاز</h3>' +
      '<div class="m-sub">رفع مباشر لملفات BIM الكبيرة (IFC / RVT / NWD حتى 500MB) إلى خادم بصير المركزي.</div>' +
      '<label class="fl">ملف النموذج</label><input class="inp" id="bm-file" type="file" accept=".ifc,.rvt,.nwd,.nwc,.dwg">' +
      '<div class="grid g2"><div><label class="fl">الإصدار</label><input class="inp num" id="bm-frev" placeholder="Rev-04"></div>' +
      '<div><label class="fl">التخصص</label><select class="inp" id="bm-fdisc"><option value="federated">موحد Federated</option>' +
      (ctx.S.projects[0] ? ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') : '') +
      '</select></div></div>' +
      '<div class="m-actions"><button class="btn block" id="bm-local">⬆ رفع النموذج وربطه بجدول الكميات</button></div>' +
      '<div class="small muted" id="bm-progress"></div></div></div>' +

      '<div class="card mt"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🏢 سجل نماذج المشروع</h3>' +
      '<button class="btn sm" id="bm-demo3d">🧊 عرض نموذج IFC ثلاثي الأبعاد (تجريبي)</button></div>' +
      '<div class="small muted mb">عرض BIM/IFC حقيقي داخل المتصفح (بلا خدمة خارجية). ملفات DWG/RVT الأصلية تحتاج مسار Autodesk APS.</div>' +
      (models.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>النموذج</th><th>الإصدار</th><th>المصدر</th><th>الحجم</th><th>التاريخ</th><th>الربط</th><th></th></tr></thead><tbody>' +
        models.map(function (m) {
          return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(m.docCode || '—') + '</b></td>' +
            '<td class="small" style="direction:ltr;text-align:right">🏢 ' + esc(m.name) + '</td>' +
            '<td class="small num">' + esc(m.rev || '') + '</td>' +
            '<td class="small">' + (m.source === 'cloud' ? '<span class="pill p-info">☁️ سحابي</span>' : '<span class="pill p-ok">💻 مرفوع</span>') + '</td>' +
            '<td class="small num">' + fmtSize(m.size) + '</td>' +
            '<td class="small muted num">' + esc(m.date || '') + '</td>' +
            '<td>' + (m.linkedBoq ? '<span class="pill p-ok">مربوط بجدول الكميات ✓</span>' : '<span class="pill p-muted">غير مربوط</span>') + '</td>' +
            '<td><div class="flex" style="gap:6px">' +
            (m.url && /\.ifc$/i.test(m.url) ? '<button class="btn sm" data-bim3d="' + esc(m.url) + '" data-bimname="' + esc(m.name) + '">🧊 3D</button>' : '') +
            (m.url ? '<a class="btn ghost sm" href="' + esc(m.url) + '" target="_blank">فتح ↗</a>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🏢</div>لا نماذج بعد — اربط سحابياً أو ارفع من الجهاز</div>') +
      '</div>';

    function open3d(o) {
      if (window.DEMO_MODE || !window.BimViewer) { toast('العرض ثلاثي الأبعاد لنماذج IFC متاح في نسخة الخادم', true); return; }
      window.BimViewer.open(o);
    }
    const demo3d = el.querySelector('#bm-demo3d');
    if (demo3d) demo3d.addEventListener('click', function () {
      open3d({ title: 'نموذج IFC تجريبي — بصير', url: '/vendor/bim/BassirTower-sample.ifc' });
    });
    el.querySelectorAll('[data-bim3d]').forEach(function (b) {
      b.addEventListener('click', function () {
        open3d({ title: b.getAttribute('data-bimname') || 'نموذج BIM', url: b.getAttribute('data-bim3d') });
      });
    });

    el.querySelector('#bm-cloud').addEventListener('click', async function () {
      const name = el.querySelector('#bm-cname').value.trim();
      const url = el.querySelector('#bm-curl').value.trim();
      if (!name || !url) { toast('أدخل اسم النموذج ورابطه السحابي', true); return; }
      try {
        await Api.create('bimModels', {
          name: name, rev: el.querySelector('#bm-crev').value, discipline: el.querySelector('#bm-cdisc').value,
          source: 'cloud', url: url, by: ctx.U.name, linkedBoq: true
        });
        toast('☁️ رُبط النموذج السحابي وأصبح مرئياً في رؤية المشروع'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
    el.querySelector('#bm-local').addEventListener('click', async function () {
      const f = el.querySelector('#bm-file').files[0];
      if (!f) { toast('اختر ملف النموذج أولاً', true); return; }
      const prog = el.querySelector('#bm-progress');
      prog.textContent = '⏳ جارٍ رفع ' + f.name + ' (' + fmtSize(f.size) + ')...';
      try {
        const up = await Api.upload(f, { category: 'مخططات IFC' });
        await Api.create('bimModels', {
          name: f.name, rev: el.querySelector('#bm-frev').value, discipline: el.querySelector('#bm-fdisc').value,
          source: 'local', url: up.url || '', size: f.size, by: ctx.U.name, linkedBoq: true
        });
        prog.textContent = '';
        toast('✅ رُفع النموذج (' + fmtSize(f.size) + ') وربط بجدول الكميات'); ctx.refresh();
      } catch (e) { prog.textContent = ''; toast(e.message, true); }
    });
  }

  function renderBimDocs(el, ctx) {
    const docs = ctx.S.bimDocs || [];
    el.innerHTML =
      '<div class="card mb"><h3>📚 إنشاء وثيقة BIM من قالب <span class="hint">قوالب جاهزة تُحرَّر وتُحفظ وتُكوَّد في الأرشيف</span></h3>' +
      '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px">' +
      [['bep', '📋', 'خطة تنفيذ BIM', 'BEP'], ['midp', '🗓️', 'خطة تسليم المعلومات', 'MIDP'],
       ['clash', '💥', 'تقرير التعارضات', 'Clash Report'], ['closeout', '🏁', 'تقرير الإغلاق', 'Close-Out']].map(function (t) {
        return '<div class="card" data-tmpl="' + t[0] + '" style="cursor:pointer;padding:16px;text-align:center">' +
          '<div style="font-size:26px">' + t[1] + '</div><b class="small">' + t[2] + '</b>' +
          '<div class="small muted num" style="direction:ltr">' + t[3] + '</div></div>';
      }).join('') + '</div></div>' +

      '<div class="card"><h3>📚 وثائق BIM للمشروع</h3>' +
      (docs.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الوثيقة</th><th>النوع</th><th>الإصدار</th><th>التاريخ</th><th>أعدها</th><th>الحالة</th><th></th></tr></thead><tbody>' +
        docs.map(function (d2) {
          return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(d2.docCode || '—') + '</b></td>' +
            '<td class="small">' + esc(d2.title) + '</td>' +
            '<td class="small"><span class="pill p-muted">' + esc(BIM_KINDS[d2.kind] || d2.kind) + '</span></td>' +
            '<td class="small num">' + esc(d2.rev || '') + '</td>' +
            '<td class="small muted num">' + esc(d2.date || '') + '</td>' +
            '<td class="small">' + esc(d2.by || '') + '</td>' +
            '<td>' + pill(d2.status || '') + '</td>' +
            '<td><button class="btn ghost sm" data-bdoc="' + d2.id + '">📖 فتح</button></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📚</div>لا وثائق بعد — أنشئ أول وثيقة من القوالب أعلاه</div>') +
      '</div>';

    el.querySelectorAll('[data-tmpl]').forEach(function (c) {
      c.addEventListener('click', function () {
        const kind = c.getAttribute('data-tmpl');
        const tpl = BIM_TEMPLATES[kind];
        const m = modal(
          '<h3>📋 ' + esc(tpl.title) + ' — من القالب</h3>' +
          '<div class="m-sub">حرر الأقسام ثم احفظ — تُكوَّد الوثيقة وتدخل الأرشيف المركزي</div>' +
          '<label class="fl">عنوان الوثيقة</label><input class="inp" id="bd-title" value="' + esc(tpl.title + ' - ' + (ctx.S.projects[0] ? ctx.S.projects[0].name : '')) + '">' +
          '<label class="fl">الإصدار</label><input class="inp num" id="bd-rev" value="R1">' +
          Object.keys(tpl.sections).map(function (k, i) {
            return '<label class="fl">' + esc(k) + '</label><textarea class="inp" data-sec="' + i + '" data-k="' + esc(k) + '" rows="2">' + esc(tpl.sections[k]) + '</textarea>';
          }).join('') +
          '<div class="m-actions"><button class="btn" id="bd-ok">💾 حفظ الوثيقة وتكويدها</button><button class="btn mutedb" id="bd-cancel">إلغاء</button></div>'
        );
        m.querySelector('#bd-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#bd-ok').addEventListener('click', async function () {
          const sections = {};
          m.querySelectorAll('[data-sec]').forEach(function (t) { sections[t.getAttribute('data-k')] = t.value; });
          try {
            await Api.create('bimDocs', {
              kind: kind, title: m.querySelector('#bd-title').value, rev: m.querySelector('#bd-rev').value,
              sections: sections, status: 'pending', by: ctx.U.name
            });
            m.remove(); toast('✅ أُنشئت الوثيقة وكُوّدت وأُدرجت بالأرشيف'); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
    el.querySelectorAll('[data-bdoc]').forEach(function (b) {
      b.addEventListener('click', function () {
        const d2 = docs.find(function (x) { return x.id === b.getAttribute('data-bdoc'); });
        modal(
          '<h3>📖 ' + esc(d2.title) + '</h3>' +
          '<div class="m-sub num">' + esc(d2.docCode || '') + ' · ' + esc(d2.rev || '') + ' · ' + esc(d2.date || '') + ' · ' + esc(d2.by || '') + '</div>' +
          Object.keys(d2.sections || {}).map(function (k) {
            return '<div class="card" style="padding:12px;margin-bottom:8px"><b class="small">' + esc(k) + '</b>' +
              '<div class="small" style="margin-top:6px;line-height:1.9;color:#c6cdda">' + esc(d2.sections[k]) + '</div></div>';
          }).join('') +
          '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">إغلاق</button></div>'
        );
      });
    });
  }

  function renderBimCams(el, ctx) {
    const cams = ctx.S.cameras || [];
    const P = ctx.S.projects[0] || { floors: [], disciplines: [] };
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const camInsights = (ctx.S.aiInsights || []).filter(function (a) { return a.source === 'camera' || a.source === 'photos'; }).slice(0, 6);

    el.innerHTML =
      '<div class="card mb"><h3>🎥 ربط كاميرات الموقع بنموذج BIM <span class="hint">كل كاميرا تُربط بدور وتخصص في النموذج — فتُقارن لقطاتها آلياً بالمخطط له</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكاميرا</th><th>الموقع</th><th>الدور في النموذج</th><th>التخصص</th><th>المقارنة الآلية</th></tr></thead><tbody>' +
      cams.map(function (c) {
        return '<tr><td><b>🎥 ' + esc(c.name) + '</b><div class="small muted num">' + esc(c.id) + '</div></td>' +
          '<td class="small">' + esc(c.location || '') + '</td>' +
          '<td>' + (canEdit ?
            '<select class="inp" data-camfloor="' + c.id + '" style="padding:6px 10px;font-size:12px"><option value="">— غير مربوط —</option>' +
            P.floors.map(function (f2) { return '<option value="' + f2.id + '"' + (c.bimFloor === f2.id ? ' selected' : '') + '>' + esc(f2.name) + '</option>'; }).join('') + '</select>'
            : '<span class="small">' + esc(VS.floorName(ctx, c.bimFloor) || '—') + '</span>') + '</td>' +
          '<td>' + (canEdit ?
            '<select class="inp" data-camdisc="' + c.id + '" style="padding:6px 10px;font-size:12px"><option value="">—</option>' +
            P.disciplines.map(function (d2) { return '<option value="' + d2.id + '"' + (c.bimDiscipline === d2.id ? ' selected' : '') + '>' + d2.icon + ' ' + esc(d2.name) + '</option>'; }).join('') + '</select>'
            : '<span class="small">' + esc((VS.discOf(ctx, c.bimDiscipline) || {}).name || '—') + '</span>') + '</td>' +
          '<td class="small">' + (c.bimFloor ? '<span class="pill p-ok">✓ تقارن كل لقطة بنسبة النموذج</span>' : '<span class="pill p-muted">اربطها لتفعيل المقارنة</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="small muted mt">💡 عند وصول لقطة من كاميرا مربوطة، يحلل ذكاء بصير الصورة ويقارن الإنجاز المرصود بنسبة إنجاز الدور/التخصص في نموذج BIM وجدول الكميات — فيسهل التحقق من التقدم الفعلي مقابل النموذج.</div></div>' +

      '<div class="card"><h3>🤖 آخر المقارنات الآلية (الموقع الفعلي ↔ نموذج BIM)</h3>' +
      (camInsights.length ?
        camInsights.map(function (a) {
          const diff = (a.detected != null && a.reported != null) ? a.detected - a.reported : null;
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b class="small">' + esc(a.area || '') + '</b>' +
            '<span class="small muted num">' + esc(a.date || '') + '</span></div>' +
            (a.detected != null ? '<div class="small num" style="margin-top:6px">المرصود بالصورة: <b>' + a.detected + '%</b>' +
              (a.reported != null ? ' · نموذج BIM/الكميات: <b>' + a.reported + '%</b> · الفرق: <b style="color:' + (diff >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + (diff > 0 ? '+' : '') + diff + '%</b>' : '') + '</div>' : '') +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(a.note || '') + '</div></div>';
        }).join('')
        : '<div class="empty"><div class="e-ico">🤖</div>لا مقارنات بعد — تصل تلقائياً مع لقطات الكاميرات المربوطة</div>') +
      '</div>';

    el.querySelectorAll('[data-camfloor],[data-camdisc]').forEach(function (s) {
      s.addEventListener('change', async function () {
        const id = s.getAttribute('data-camfloor') || s.getAttribute('data-camdisc');
        const patch = {};
        patch[s.hasAttribute('data-camfloor') ? 'bimFloor' : 'bimDiscipline'] = s.value;
        try { await Api.update('cameras', id, patch); toast('✅ حُدث ربط الكاميرا بالنموذج'); ctx.refreshSilent(); }
        catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ 8) لوحة اختيار المشروع: كل المشاريع وفتح أي منها ============
  function renderProjectsDash(el, ctx) {
    const projects = (ctx.Sall || ctx.S).projects;
    const Sall = ctx.Sall || ctx.S;

    function countFor(pid, col, pred) {
      return (Sall[col] || []).filter(function (x) {
        return (!x.projectId || x.projectId === pid) && (!pred || pred(x));
      }).length;
    }

    el.innerHTML =
      '<div class="card mb"><h3>🗂️ لوحة المشاريع <span class="hint">اختر المشروع لتعمل عليه — كل الصفحات والبيانات تتبع المشروع المحدد</span></h3></div>' +
      '<div class="grid g2">' +
      projects.map(function (p) {
        const active = ctx.projectId === p.id;
        const nCont = countFor(p.id, 'contractors');
        const nPend = ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments']
          .reduce(function (a, c) { return a + countFor(p.id, c, function (x) { return x.status === 'pending'; }); }, 0);
        const nFiles = countFor(p.id, 'files');
        const prog = p.progressActual || 0;
        return '<div class="card" style="border-color:' + (active ? 'var(--accent)' : 'var(--border)') + '">' +
          '<div class="flex" style="justify-content:space-between">' +
          '<h3 style="margin:0">🏗️ ' + esc(p.name) + '</h3>' +
          (active ? '<span class="pill p-ok">المشروع الحالي ✓</span>' : '<button class="btn sm" data-selproj="' + p.id + '">فتح والعمل عليه ←</button>') + '</div>' +
          '<div class="small muted" style="margin:8px 0">' + esc(p.location || '—') + ' · 👨‍💼 ' + esc(p.consultantName || 'لم يعيّن استشاري') + '</div>' +
          '<div class="flex" style="gap:8px;margin:10px 0"><div class="bar" style="flex:1"><i style="width:' + prog + '%"></i></div><b class="num small">' + prog + '%</b></div>' +
          '<div class="grid g3 small" style="gap:8px;text-align:center">' +
          '<div class="card" style="padding:10px"><b class="num">' + nCont + '</b><div class="muted" style="font-size:11px">مقاول</div></div>' +
          '<div class="card" style="padding:10px"><b class="num" style="color:' + (nPend ? 'var(--warn)' : 'var(--ok)') + '">' + nPend + '</b><div class="muted" style="font-size:11px">بانتظار الاعتماد</div></div>' +
          '<div class="card" style="padding:10px"><b class="num">' + nFiles + '</b><div class="muted" style="font-size:11px">ملف بالمستودع</div></div>' +
          '</div>' +
          '<div class="small muted mt num">الميزانية: ' + VS.millions(p.budgetPlanned || 0) + (p.startPlanned ? ' · ' + esc(p.startPlanned) + ' ← ' + esc(p.endPlanned || '') : '') + '</div>' +
          '</div>';
      }).join('') + '</div>';

    el.querySelectorAll('[data-selproj]').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx.setProject(b.getAttribute('data-selproj'));
        toast('🏗️ انتقلت للمشروع — كل الصفحات الآن تعرض بياناته');
      });
    });
  }

  window.ViewsModules = {
    renderSubmissions: renderSubmissions,
    renderRfx: renderRfx,
    renderVariations: renderVariations,
    renderContractorDb: renderContractorDb,
    renderFileServer: renderFileServer,
    renderProjectDocs: renderProjectDocs,
    renderBim: renderBim,
    renderProjectsDash: renderProjectsDash
  };
})();
