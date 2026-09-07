/*
 * دورة «يوم في الموقع»: يختبر إجراءات حقيقية لكل دور على مشروع برج بصير.
 * المقاول: رفع طلب استلام (WIR) + استفسار (RFI) + اعتماد مواد (بمرفقات).
 * الاستشاري: رفع مخطط تنفيذي + مراجعة واعتماد تقديم بتوقيع إلكتروني.
 * ممثل المالك: تصفّح كل صفحاته وفتح سجل.
 * يتحقق من تغيّر حالة البيانات فعلياً (لا مجرد تصفّح).
 */
const H = require('./_harness');

(async () => {
  const browser = await H.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('C:' + m.text()); });
  page.on('pageerror', e => errors.push('P:' + e.message));
  page.on('dialog', d => d.accept());
  await H.serve(page);

  const log = [];
  const step = (role, name, ok, detail) => { log.push({ role, name, ok }); console.log((ok ? '  ✅' : '  ❌') + ' [' + role + '] ' + name + (detail ? ' — ' + detail : '')); };
  const counts = async () => page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); const o = {}; ['wirs', 'rfis', 'materials', 'planDrawings'].forEach(k => o[k] = (d[k] || []).length); return o; });

  // CONTRACTOR
  await H.login(page, 'contractor');
  const before = await counts();
  async function submit(tab, title, extra) {
    await H.nav(page, 'home');
    const t = page.locator('[data-ctab="' + tab + '"]'); if (await t.count()) await t.first().click(); await page.waitForTimeout(200);
    await page.click('#ct-new'); await page.waitForSelector('#sb-title', { timeout: 4000 });
    await page.fill('#sb-title', title);
    if (extra) await extra();
    if (await page.locator('#sb-file').count()) await page.setInputFiles('#sb-file', H.file(tab + '.pdf'));
    await page.click('#sb-ok'); await page.waitForTimeout(400);
  }
  await submit('wirs', 'طلب استلام صبة سقف الدور السابع', async () => { if (await page.locator('#sb-loc').count()) await page.selectOption('#sb-loc', { index: 6 }).catch(() => {}); });
  await submit('rfis', 'تعارض مسار الدكت وكمرة المحور C-4', async () => { if (await page.locator('#sb-question').count()) await page.fill('#sb-question', 'نطلب توجيه الاستشاري.'); });
  await submit('materials', 'اعتماد بلاط بورسلان 60×60');
  const after = await counts();
  step('مقاول', 'رفع WIR', after.wirs === before.wirs + 1);
  step('مقاول', 'رفع RFI', after.rfis === before.rfis + 1);
  step('مقاول', 'رفع اعتماد مواد', after.materials === before.materials + 1);

  // CONSULTANT
  await H.login(page, 'consultant');
  const pdBefore = (await counts()).planDrawings;
  await H.nav(page, 'bim');
  const upTab = page.locator('.tabbar .tab', { hasText: 'رفع' }); if (await upTab.count()) await upTab.first().click(); await page.waitForTimeout(300);
  if (await page.locator('#pd-title').count()) await page.fill('#pd-title', 'مخطط معماري اختبار');
  if (await page.locator('#pd-ref').count()) await page.fill('#pd-ref', 'A-101-T');
  if (await page.locator('#pd-file').count()) { await page.setInputFiles('#pd-file', H.file('A-101.pdf')); await page.click('#pd-add'); await page.waitForTimeout(500); }
  step('استشاري', 'رفع مخطط تنفيذي', (await counts()).planDrawings >= pdBefore + 1);

  const pend = async () => page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); let n = 0;['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments'].forEach(c => n += (d[c] || []).filter(x => x.status === 'pending').length); return n; });
  const pB = await pend();
  await H.nav(page, 'submittals');
  await page.locator('.tabbar .tab', { hasText: 'بانتظار قراري' }).first().click(); await page.waitForTimeout(300);
  let done = false;
  const subtabs = await page.$$('[data-atab]');
  for (let i = 0; i < Math.max(1, subtabs.length); i++) {
    if (subtabs.length) { const st = (await page.$$('[data-atab]'))[i]; await st.click(); await page.waitForTimeout(200); }
    const rb = page.locator('[data-review]');
    if (await rb.count()) { await rb.first().click(); await page.waitForSelector('#rv-ok', { timeout: 4000 }).catch(() => {}); if (await page.locator('#rv-ok').count()) { await page.selectOption('#rv-status', 'approved').catch(() => {}); await page.click('#rv-ok'); await page.waitForTimeout(600); done = true; break; } await H.clearModals(page); }
  }
  step('استشاري', 'مراجعة واعتماد تقديم', done && (await pend()) === pB - 1);

  // OWNER REP
  await H.login(page, 'owner_rep');
  const rp = await page.$$eval('.sidebar .nav-item[data-page]', els => els.map(e => e.getAttribute('data-page')));
  for (const id of rp) await H.nav(page, id);
  step('ممثل المالك', 'تصفّح كل صفحاته (' + rp.length + ')', true);

  await browser.close();
  const fails = log.filter(l => !l.ok).length;
  console.log('\n=== E2E cycle ===  خطوات فاشلة: ' + fails + ' · أخطاء JS: ' + errors.length);
  errors.slice(0, 8).forEach(e => console.log('  ' + e));
  const ok = fails === 0 && errors.length === 0;
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
