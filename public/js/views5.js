/**
 * بصير | صفحات إضافية للمقاول: جدول الكميات + الجدول الزمني
 *  - renderContractorBoq: جدول كميات المقاول مع (المنجز/الجاري/المتبقي) ومؤشر التأخير حسب الجدول الزمني.
 *  - renderSchedule: عرض الجدول الزمني مع مؤشرات التأخير، وقراءة ملف جدول زمني مرفوع
 *    (CSV / Primavera XER / P6 XML / Excel XLSX / PDF) عبر parseScheduleFile.
 */
(function () {
  'use strict';
  const VS = window.ViewsShared;
  const esc = VS.esc, money = VS.money, toast = VS.toast, floorName = VS.floorName, discOf = VS.discOf;
  const t = I18n.t;

  I18n.registerDict({
    'جدول الكميات': 'Bill of Quantities',
    'الجدول الزمني': 'Schedule',
    'الكمية المنجزة': 'Completed Qty',
    'الكمية الجاري العمل فيها': 'In-Progress Qty',
    'الكمية المتبقية': 'Remaining Qty',
    'التأخير': 'Delay',
    'ضمن الجدول': 'On schedule',
    'سيتأخر — سرّع العمل': 'Will slip — speed up',
    'متأخر': 'Behind',
    'منجز': 'Complete',
    'لم يبدأ': 'Not started',
    'المتوقع حسب الجدول': 'Expected by schedule',
    'رفع ملف الجدول الزمني': 'Upload schedule file',
    'يقرأ CSV / Primavera XER / P6 XML / Excel / PDF': 'Reads CSV / Primavera XER / P6 XML / Excel / PDF'
  });

  const todayMs = () => Date.now();
  function daysBetween(a, b) { return (new Date(b) - new Date(a)) / 86400000; }

  /** النسبة المتوقّعة اليوم ضمن نافذة زمنية (خطّي 0..100) */
  function expectedPct(start, end) {
    if (!start || !end) return null;
    const s = new Date(start).getTime(), e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    const now = todayMs();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  }

  /** مؤشر التأخير: يقارن الفعلي بالمتوقّع حسب الجدول ويعيد {cls, icon, label, expected} */
  function delayStatus(actual, start, end, amberTh, redTh) {
    amberTh = amberTh == null ? 10 : amberTh;
    redTh = redTh == null ? amberTh * 2 : redTh;
    const a = Number(actual) || 0;
    if (a >= 100) return { cls: 'p-ok', icon: '✓', label: 'منجز', expected: 100 };
    const exp = expectedPct(start, end);
    if (exp == null) return { cls: 'p-none', icon: '—', label: a > 0 ? 'ضمن الجدول' : 'لم يبدأ', expected: null };
    const overdueEnd = new Date(end).getTime() < todayMs();
    const gap = exp - a;
    if (overdueEnd && a < 100) return { cls: 'p-danger', icon: '✕', label: 'متأخر', expected: exp };
    if (gap <= amberTh) return { cls: 'p-ok', icon: '✓', label: a > 0 ? 'ضمن الجدول' : 'لم يبدأ', expected: exp };
    if (gap <= redTh) return { cls: 'p-warn', icon: '⚠', label: 'سيتأخر — سرّع العمل', expected: exp };
    return { cls: 'p-danger', icon: '✕', label: 'متأخر', expected: exp };
  }

  /** نافذة المقاول الزمنية: من عقده، وإلا من مدى مراحل الجدول الزمني للمشروع */
  function contractorWindow(ctx) {
    const c = (ctx.S.contractors || []).find(function (x) { return x.id === ctx.U.contractorId; }) || (ctx.S.contractors || [])[0];
    if (c && c.startDate && c.endDate) return { start: c.startDate, end: c.endDate };
    const tasks = ctx.S.scheduleTasks || [];
    if (tasks.length) {
      const starts = tasks.map(function (x) { return x.startPlanned; }).filter(Boolean).sort();
      const ends = tasks.map(function (x) { return x.endPlanned; }).filter(Boolean).sort();
      if (starts.length && ends.length) return { start: starts[0], end: ends[ends.length - 1] };
    }
    return { start: null, end: null };
  }

  // ============ 1) جدول كميات المقاول ============
  function renderContractorBoq(el, ctx) {
    const items = (ctx.S.boqItems || []).slice();
    const th = VS.thresholds(ctx.S.projects[0]);
    const win = contractorWindow(ctx);

    // الكميات الجاري العمل فيها = مطالَب بها في مستخلصات معلّقة لم تُعتمد بعد
    const pendingByItem = {};
    (ctx.S.payments || []).filter(function (p) { return p.status === 'pending'; }).forEach(function (p) {
      (p.lines || []).forEach(function (ln) {
        pendingByItem[ln.boqItemId] = Math.max(pendingByItem[ln.boqItemId] || 0, Number(ln.progress) || 0);
      });
    });

    let totVal = 0, totEarned = 0, nLate = 0, nSlip = 0;
    const rows = items.map(function (b) {
      const d = discOf(ctx, b.discipline);
      const approved = Number(b.progress) || 0;
      const pendTarget = pendingByItem[b.id] || 0;
      const inProgPct = Math.max(0, Math.min(100 - approved, pendTarget - approved));
      const doneQty = b.qty * approved / 100;
      const progQty = b.qty * inProgPct / 100;
      const remQty = Math.max(0, b.qty - doneQty - progQty);
      const line = b.qty * b.unitPrice;
      totVal += line; totEarned += line * approved / 100;
      const ds = delayStatus(approved, win.start, win.end, th.progressAmberPct, th.progressAmberPct * 2);
      if (ds.cls === 'p-danger' && approved < 100) nLate++;
      if (ds.cls === 'p-warn') nSlip++;
      const fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
      return '<tr>' +
        '<td class="num small">' + esc(b.code) + '</td>' +
        '<td>' + d.icon + ' ' + esc(b.description) + '<div class="small muted">' + esc(floorName(ctx, b.floor)) + '</div></td>' +
        '<td class="num small">' + b.unitPrice.toLocaleString('en-US') + '<div class="muted">' + esc(b.unit) + '</div></td>' +
        '<td class="num small">' + b.qty + '</td>' +
        '<td class="num small" style="color:var(--status-ok)">' + fmt(doneQty) + '<div class="muted">' + approved + '%</div></td>' +
        '<td class="num small" style="color:var(--status-info)">' + fmt(progQty) + (inProgPct ? '<div class="muted">+' + inProgPct + '%</div>' : '') + '</td>' +
        '<td class="num small" style="color:var(--status-warning)">' + fmt(remQty) + '</td>' +
        '<td>' + VS.statusPill(ds.cls, ds.label, ds.icon) +
          (ds.expected != null && ds.cls !== 'p-ok' ? '<div class="small muted num">' + t('المتوقع حسب الجدول') + ' ' + ds.expected + '%</div>' : '') + '</td>' +
        '</tr>';
    }).join('');

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">إجمالي بنودي</div><div class="val num">' + items.length + '</div><div class="sub">بند في عقدي</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">قيمة عقدي</div><div class="val num">' + Math.round(totVal / 1e6 * 10) / 10 + 'M</div><div class="sub">ر.س</div></div>' +
      '<div class="card kpi ' + (nSlip ? 'k-warn' : 'k-ok') + '"><div class="lbl">بنود ستتأخر</div><div class="val num ' + (nSlip ? '' : 'zero') + '">' + nSlip + '</div><div class="sub">سرّع العمل بها</div></div>' +
      '<div class="card kpi ' + (nLate ? 'k-danger' : 'k-ok') + '"><div class="lbl">بنود متأخرة</div><div class="val num ' + (nLate ? '' : 'zero') + '">' + nLate + '</div><div class="sub">خلف الجدول الزمني</div></div>' +
      '</div>' +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">📐 جدول كمياتي <span class="hint">المنجز والجاري والمتبقي لكل بند، ومؤشر التأخير حسب الجدول الزمني</span></h3>' +
      '<span class="pill p-ok">' + t('المنفذ: ') + money(Math.round(totEarned)) + ' (' + (totVal ? Math.round(totEarned / totVal * 100) : 0) + '%)</span></div>' +
      (items.length ?
        '<div class="tbl-wrap" style="max-height:64vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>الكود</th><th>البند</th><th>سعر الوحدة</th><th>الكمية</th><th>' + t('الكمية المنجزة') + '</th><th>' + t('الكمية الجاري العمل فيها') + '</th><th>' + t('الكمية المتبقية') + '</th><th>' + t('التأخير') + '</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="legend" style="margin-top:12px">' +
        '<span>' + VS.statusPill('p-ok', 'ضمن الجدول', '✓') + '</span>' +
        '<span>' + VS.statusPill('p-warn', 'سيتأخر — سرّع العمل', '⚠') + '</span>' +
        '<span>' + VS.statusPill('p-danger', 'متأخر', '✕') + '</span></div>'
        : '<div class="empty"><div class="e-ico">📐</div>لا بنود في عقدك بعد</div>') +
      '</div>';
  }

  // ============ 2) قرّاء ملفات الجدول الزمني ============
  // كلها تُعيد مصفوفة: [{ name, start, end, progress }]

  function normDate(s) {
    if (!s) return '';
    s = String(s).trim();
    // Primavera: 2026-01-31 00:00  |  01-Jan-26  |  1/31/2026
    let m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[1] + '-' + m[2] + '-' + m[3];
    m = s.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{4})/); if (m) return m[3] + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
    const MON = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    m = s.match(/(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{2,4})/);
    if (m) { let y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + (MON[m[2].toLowerCase()] || '01') + '-' + String(m[1]).padStart(2, '0'); }
    return '';
  }
  function pct(v) { const n = parseFloat(String(v).replace('%', '')); return isNaN(n) ? 0 : Math.max(0, Math.min(100, Math.round(n))); }

  function parseDelimited(text) {
    const lines = text.split(/\r\n|\r|\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    const sep = lines[0].indexOf('\t') !== -1 ? '\t' : (lines[0].split(';').length > lines[0].split(',').length ? ';' : ',');
    const rows = lines.map(function (l) { return l.split(sep).map(function (c) { return c.replace(/^"|"$/g, '').trim(); }); });
    const head = rows[0].map(function (h) { return h.toLowerCase(); });
    const find = function (keys) { for (let i = 0; i < head.length; i++) { if (keys.some(function (k) { return head[i].indexOf(k) !== -1; })) return i; } return -1; };
    const ci = { name: find(['task', 'activity', 'name', 'المهمة', 'المرحلة', 'البند', 'النشاط']), start: find(['start', 'بداية', 'من']), end: find(['finish', 'end', 'نهاية', 'الى', 'إلى']), prog: find(['%', 'complete', 'progress', 'الإنجاز', 'نسبة']) };
    const hasHeader = ci.name !== -1 || ci.start !== -1;
    const body = hasHeader ? rows.slice(1) : rows;
    return body.map(function (r) {
      return {
        name: (ci.name !== -1 ? r[ci.name] : r[0]) || '',
        start: normDate(ci.start !== -1 ? r[ci.start] : r[1]),
        end: normDate(ci.end !== -1 ? r[ci.end] : r[2]),
        progress: pct(ci.prog !== -1 ? r[ci.prog] : r[3])
      };
    }).filter(function (x) { return x.name; });
  }

  function parseXer(text) {
    const lines = text.split(/\r\n|\r|\n/);
    let fields = null, out = [];
    let inTask = false;
    for (const line of lines) {
      if (line.startsWith('%T')) { inTask = line.trim().split('\t')[1] === 'TASK'; fields = null; continue; }
      if (!inTask) continue;
      const parts = line.split('\t');
      if (line.startsWith('%F')) { fields = parts.slice(1); continue; }
      if (line.startsWith('%R') && fields) {
        const vals = parts.slice(1);
        const g = function (k) { const i = fields.indexOf(k); return i !== -1 ? vals[i] : ''; };
        const name = g('task_name') || g('task_code');
        if (name) out.push({ name: name, start: normDate(g('target_start_date') || g('act_start_date') || g('early_start_date')), end: normDate(g('target_end_date') || g('act_end_date') || g('early_end_date')), progress: pct(g('phys_complete_pct') || g('complete_pct')) });
      }
    }
    return out;
  }

  function parseP6Xml(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    let nodes = doc.getElementsByTagName('Activity');
    if (!nodes.length) nodes = doc.getElementsByTagName('Task');
    const out = [];
    const childText = function (el, names) { for (const n of names) { const c = el.getElementsByTagName(n)[0]; if (c && c.textContent) return c.textContent; } return ''; };
    for (const el of nodes) {
      const name = childText(el, ['Name', 'name', 'task_name']);
      if (!name) continue;
      out.push({
        name: name,
        start: normDate(childText(el, ['StartDate', 'PlannedStartDate', 'ActualStartDate', 'EarlyStartDate'])),
        end: normDate(childText(el, ['FinishDate', 'PlannedFinishDate', 'ActualFinishDate', 'EarlyFinishDate'])),
        progress: pct(childText(el, ['PercentComplete', 'PhysicalPercentComplete', 'PercentCompleteType']))
      });
    }
    return out;
  }

  // XLSX: فكّ ضغط ZIP عبر DecompressionStream المدمج في المتصفح (بلا مكتبات)
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await stream.arrayBuffer());
  }
  async function readZipEntry(buf, nameMatch) {
    const dv = new DataView(buf); const u8 = new Uint8Array(buf);
    // اعثر على نهاية الفهرس المركزي EOCD
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0 && i > u8.length - 65558; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd === -1) throw new Error('ملف XLSX غير صالح');
    let off = dv.getUint32(eocd + 16, true); const count = dv.getUint16(eocd + 10, true);
    const dec = new TextDecoder();
    for (let e = 0; e < count; e++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const fnLen = dv.getUint16(off + 28, true), exLen = dv.getUint16(off + 30, true), cmLen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const fname = dec.decode(u8.subarray(off + 46, off + 46 + fnLen));
      off += 46 + fnLen + exLen + cmLen;
      if (!nameMatch(fname)) continue;
      // اقرأ الترويسة المحلية لتحديد بداية البيانات
      const lfnLen = dv.getUint16(lho + 26, true), lexLen = dv.getUint16(lho + 28, true);
      const dataStart = lho + 30 + lfnLen + lexLen;
      const raw = u8.subarray(dataStart, dataStart + compSize);
      return method === 0 ? raw : await inflateRaw(raw);
    }
    return null;
  }
  async function parseXlsx(buf) {
    const dec = new TextDecoder();
    const ssBytes = await readZipEntry(buf, function (n) { return /sharedStrings\.xml$/i.test(n); });
    const shared = [];
    if (ssBytes) { const xml = dec.decode(ssBytes); const doc = new DOMParser().parseFromString(xml, 'application/xml'); const sis = doc.getElementsByTagName('si'); for (const si of sis) { shared.push((si.textContent || '').trim()); } }
    const sheetBytes = await readZipEntry(buf, function (n) { return /worksheets\/sheet1\.xml$/i.test(n); }) || await readZipEntry(buf, function (n) { return /worksheets\/.*\.xml$/i.test(n); });
    if (!sheetBytes) throw new Error('لا توجد ورقة بيانات في الملف');
    const doc = new DOMParser().parseFromString(dec.decode(sheetBytes), 'application/xml');
    const rowsEl = doc.getElementsByTagName('row'); const grid = [];
    for (const row of rowsEl) {
      const cells = row.getElementsByTagName('c'); const arr = [];
      for (const c of cells) {
        const ref = (c.getAttribute('r') || '').replace(/\d+/g, '');
        const col = ref.split('').reduce(function (a, ch) { return a * 26 + (ch.charCodeAt(0) - 64); }, 0) - 1;
        const type = c.getAttribute('t'); const v = c.getElementsByTagName('v')[0];
        let val = v ? v.textContent : (c.getElementsByTagName('t')[0] ? c.getElementsByTagName('t')[0].textContent : '');
        if (type === 's') val = shared[parseInt(val, 10)] || '';
        arr[col >= 0 ? col : arr.length] = val;
      }
      grid.push(arr);
    }
    // حوّل الشبكة إلى نص مفصول بجدولة ثم استخدم محلّل CSV
    return parseDelimited(grid.map(function (r) { return r.map(function (c) { return (c == null ? '' : c); }).join('\t'); }).join('\n'));
  }

  async function parsePdf(url) {
    const lib = await import('/vendor/pdfjs/pdf.min.mjs');
    lib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
    const pdf = await lib.getDocument({ url: url }).promise;
    let text = '';
    for (let p = 1; p <= pdf.numPages; p++) { const page = await pdf.getPage(p); const c = await page.getTextContent(); let lastY = null, line = ''; c.items.forEach(function (it) { const y = Math.round(it.transform[5]); if (lastY !== null && Math.abs(y - lastY) > 3) { text += line.trim() + '\n'; line = ''; } line += it.str + ' '; lastY = y; }); text += line.trim() + '\n'; }
    // أبقِ الأسطر التي تحوي تاريخاً (على الأرجح صفوف مهام)
    const lines = text.split('\n').filter(function (l) { return /\d{4}-\d{2}-\d{2}|\d{1,2}[\/-][A-Za-z]{3}|\d{1,2}\/\d{1,2}\/\d{4}/.test(l); });
    return lines.map(function (l) {
      const dates = l.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[- ][A-Za-z]{3}[- ]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{4})/g) || [];
      const prog = (l.match(/(\d{1,3})\s*%/) || [])[1];
      const name = l.replace(/(\d{4}-\d{2}-\d{2}|\d{1,2}[- ][A-Za-z]{3}[- ]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{4})/g, '').replace(/\d{1,3}\s*%/, '').trim();
      return { name: name || 'مهمة', start: normDate(dates[0]), end: normDate(dates[1] || dates[0]), progress: pct(prog) };
    }).filter(function (x) { return x.start; });
  }

  /** يقرأ ملف جدول زمني بأي صيغة مدعومة ويعيد قائمة المهام */
  async function parseScheduleFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'xlsx' || ext === 'xlsm') { return parseXlsx(await file.arrayBuffer()); }
    if (ext === 'pdf') { return parsePdf(URL.createObjectURL(file)); }
    const text = await file.text();
    if (ext === 'xer') return parseXer(text);
    if (ext === 'xml') return parseP6Xml(text);
    if (text.trim()[0] === '<') return parseP6Xml(text);
    if (text.indexOf('%T') !== -1 && text.indexOf('TASK') !== -1) return parseXer(text);
    return parseDelimited(text); // csv / tsv / txt
  }

  // ============ عرض صفحة الجدول الزمني ============
  function renderSchedule(el, ctx) {
    const canUpload = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const tasks = (ctx.S.scheduleTasks || []).slice();
    const th = VS.thresholds(ctx.S.projects[0]);
    let nLate = 0, nSlip = 0;
    const rows = tasks.map(function (tk) {
      const ds = delayStatus(tk.progress, tk.startPlanned, tk.endPlanned, th.progressAmberPct, th.progressAmberPct * 2);
      if (ds.cls === 'p-danger' && (tk.progress || 0) < 100) nLate++;
      if (ds.cls === 'p-warn') nSlip++;
      const barCls = VS.barClass(tk.progress, ds.expected, th.progressAmberPct);
      return '<tr>' +
        '<td><b>' + esc(tk.name) + '</b></td>' +
        '<td class="small muted num">' + esc(tk.startPlanned || '—') + ' ← ' + esc(tk.endPlanned || '—') + '</td>' +
        '<td class="small muted num">' + esc(tk.startActual || '—') + ' ← ' + esc(tk.endActual || '—') + '</td>' +
        '<td style="min-width:150px"><div class="flex" style="gap:8px"><div class="bar ' + barCls + '" style="flex:1"><i style="width:' + (tk.progress || 0) + '%"></i></div><b class="num small">' + (tk.progress || 0) + '%</b></div></td>' +
        '<td>' + VS.statusPill(ds.cls, ds.label, ds.icon) + (ds.expected != null && ds.cls !== 'p-ok' ? '<div class="small muted num">' + t('المتوقع حسب الجدول') + ' ' + ds.expected + '%</div>' : '') + '</td>' +
        '</tr>';
    }).join('');

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">مراحل الجدول</div><div class="val num">' + tasks.length + '</div><div class="sub">مرحلة/نشاط</div></div>' +
      '<div class="card kpi ' + (nSlip ? 'k-warn' : 'k-ok') + '"><div class="lbl">ستتأخر</div><div class="val num ' + (nSlip ? '' : 'zero') + '">' + nSlip + '</div><div class="sub">تحتاج تسريعاً</div></div>' +
      '<div class="card kpi ' + (nLate ? 'k-danger' : 'k-ok') + '"><div class="lbl">متأخرة</div><div class="val num ' + (nLate ? '' : 'zero') + '">' + nLate + '</div><div class="sub">خلف الجدول</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">اليوم</div><div class="val num" style="font-size:18px">' + new Date().toISOString().slice(0, 10) + '</div><div class="sub">تاريخ المقارنة</div></div>' +
      '</div>' +
      (canUpload ?
        '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:10px">' +
        '<h3 style="margin:0">📅 ' + t('رفع ملف الجدول الزمني') + ' <span class="hint">' + t('يقرأ CSV / Primavera XER / P6 XML / Excel / PDF') + '</span></h3>' +
        '<div class="flex"><input class="inp" id="sch-file" type="file" accept=".csv,.txt,.tsv,.xer,.xml,.xlsx,.xlsm,.pdf" style="max-width:260px">' +
        '<button class="btn sm" id="sch-read">📖 قراءة الملف</button></div></div>' +
        '<div id="sch-preview" class="small muted">اختر ملف الجدول الزمني ثم «قراءة الملف» — سيُستخرج منه المهام والتواريخ ونِسَب الإنجاز.</div></div>'
        : '') +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">📅 الجدول الزمني <span class="hint">المخطط مقابل الفعلي ومؤشر التأخير حسب تاريخ اليوم</span></h3></div>' +
      (tasks.length ?
        '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>المرحلة / النشاط</th><th>المخطط (من ← إلى)</th><th>الفعلي</th><th>الإنجاز</th><th>' + t('التأخير') + '</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📅</div>لا جدول زمني بعد' + (canUpload ? ' — ارفع ملفاً أعلاه' : ' — يرفعه الاستشاري') + '</div>') +
      '</div>';

    const readBtn = el.querySelector('#sch-read');
    if (readBtn) readBtn.addEventListener('click', async function () {
      const f = el.querySelector('#sch-file').files[0];
      const prev = el.querySelector('#sch-preview');
      if (!f) { toast('اختر ملف الجدول الزمني أولاً', true); return; }
      prev.innerHTML = '⏳ جارٍ قراءة الملف…';
      try {
        const parsed = await parseScheduleFile(f);
        if (!parsed.length) { prev.innerHTML = '⚠️ لم يتم استخراج مهام من الملف. تأكد من الصيغة (يُفضّل CSV/XER/XML/XLSX).'; return; }
        prev.innerHTML =
          '<div class="flex" style="justify-content:space-between;flex-wrap:wrap"><b class="small">✅ استُخرجت ' + parsed.length + ' مهمة من ' + esc(f.name) + '</b>' +
          '<button class="btn sm" id="sch-apply">💾 اعتماد كجدول زمني للمشروع</button></div>' +
          '<div class="tbl-wrap" style="max-height:34vh;overflow-y:auto;margin-top:10px"><table class="tbl"><thead><tr><th>المهمة</th><th>من</th><th>إلى</th><th>الإنجاز</th><th>التأخير</th></tr></thead><tbody>' +
          parsed.slice(0, 200).map(function (p) { const ds = delayStatus(p.progress, p.start, p.end, th.progressAmberPct, th.progressAmberPct * 2); return '<tr><td>' + esc(p.name) + '</td><td class="small muted num">' + esc(p.start || '—') + '</td><td class="small muted num">' + esc(p.end || '—') + '</td><td class="num small">' + p.progress + '%</td><td>' + VS.statusPill(ds.cls, ds.label, ds.icon) + '</td></tr>'; }).join('') +
          '</tbody></table></div>';
        const applyBtn = el.querySelector('#sch-apply');
        if (applyBtn) applyBtn.addEventListener('click', async function () {
          try {
            // احفظ الملف في المستندات، وأنشئ مراحل الجدول من المستخرَج
            await Api.upload(f, { category: 'الجدول الزمني' });
            const existing = (ctx.S.scheduleTasks || []);
            for (const p of parsed) {
              await Api.create('scheduleTasks', { name: p.name, startPlanned: p.start, endPlanned: p.end, startActual: null, endActual: null, progress: p.progress });
            }
            toast('✅ اعتُمد الجدول الزمني وأُضيفت ' + parsed.length + ' مرحلة');
            ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      } catch (e) { prev.innerHTML = '❌ تعذّرت قراءة الملف: ' + esc(e.message); }
    });
  }

  window.ViewsExtra = {
    renderContractorBoq: renderContractorBoq,
    renderSchedule: renderSchedule,
    parseScheduleFile: parseScheduleFile,
    delayStatus: delayStatus, expectedPct: expectedPct
  };
})();
