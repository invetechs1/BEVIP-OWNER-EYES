/* اختبار دخان: يسجّل الدخول بكل الأدوار الخمسة ويصيّر كل صفحة، ويتأكد من عدم وجود أخطاء JS. */
const H = require('./_harness');

(async () => {
  const browser = await H.launch();
  const results = {};
  let failed = false;
  for (const role of Object.keys(H.ROLES)) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
    page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
    await H.serve(page);
    await H.login(page, role);
    const pages = await page.$$eval('.sidebar .nav-item[data-page]', els => els.map(e => e.getAttribute('data-page')));
    for (const id of pages) { await H.nav(page, id); }
    results[role] = { pages: pages.length, errors: errors.length };
    if (errors.length) { failed = true; errors.slice(0, 8).forEach(e => console.log('  ❌ [' + role + '] ' + e)); }
    await page.close();
  }
  await browser.close();
  console.log('\n=== Roles smoke ===');
  Object.keys(results).forEach(r => console.log(r + ': ' + results[r].pages + ' pages, ' + results[r].errors + ' errors'));
  console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
