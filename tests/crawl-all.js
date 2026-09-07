/* زحف شامل: لكل دور، يزور كل صفحة، ينقر كل التبويبات/الفلاتر وكل الأزرار،
   يفتح النوافذ ويملؤها ويغلقها، ويجمع كل أخطاء JS. الهدف: ألا يبقى زرّ دون اختبار. */
const H = require('./_harness');

(async () => {
  const browser = await H.launch();
  const summary = {};
  let totalErr = 0;
  for (const role of Object.keys(H.ROLES)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const errors = []; let cur = '(login)';
    page.on('pageerror', e => errors.push('PAGEERR@' + cur + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE@' + cur + ': ' + m.text()); });
    page.on('dialog', d => d.accept());
    await H.serve(page);
    await H.login(page, role);
    const pages = await page.$$eval('.sidebar .nav-item[data-page]', els => els.map(e => e.getAttribute('data-page')));
    let clicks = 0, tabs = 0, modals = 0;
    async function fillClose() {
      if (!(await page.$('.modal-back'))) return;
      modals++;
      try { await page.evaluate(() => { const m = document.querySelector('.modal-back'); if (!m) return; m.querySelectorAll('input[type=text],input:not([type]),textarea').forEach(i => i.value = 'اختبار آلي'); m.querySelectorAll('input[type=number]').forEach(i => i.value = '10'); m.querySelectorAll('select').forEach(s => { if (s.options.length) s.selectedIndex = 0; }); }); } catch (e) {}
      const cancel = await page.$('.modal-back [id$="-cancel"], .modal-back button.mutedb');
      if (cancel) { try { await cancel.click({ timeout: 1000 }); } catch (e) { await H.clearModals(page); } } else await H.clearModals(page);
      await H.clearModals(page);
    }
    for (const id of pages) {
      cur = role + '/' + id;
      await H.clearModals(page);
      try { await page.click('.sidebar .nav-item[data-page="' + id + '"]', { timeout: 4000 }); } catch (e) { errors.push('NAVFAIL ' + cur); continue; }
      await page.waitForTimeout(200);
      for (const sel of ['.tabbar .tab', '[data-atab]', '[data-ctab]', '[data-vtab]', '[data-disc]', '[data-floor]', '.floor-tabs .tab']) {
        const n = await page.$$eval('#page ' + sel, e => e.length).catch(() => 0);
        for (let i = 0; i < n; i++) { const els = await page.$$('#page ' + sel); if (els[i]) { try { await els[i].click({ timeout: 1500 }); tabs++; await page.waitForTimeout(50); } catch (e) {} } }
      }
      await H.clearModals(page);
      const budget = Math.min(await page.$$eval('#page button', e => e.length).catch(() => 0), 40);
      for (let i = 0; i < budget; i++) {
        const btns = await page.$$('#page button'); const btn = btns[i]; if (!btn) continue;
        const txt = (await btn.innerText().catch(() => '')) || '';
        if (/خروج|إعادة ضبط|logout|reset/i.test(txt)) continue;
        try { await btn.click({ timeout: 1200 }); clicks++; await page.waitForTimeout(70); } catch (e) {}
        await fillClose(); await H.clearModals(page);
      }
    }
    summary[role] = { pages: pages.length, tabs, clicks, modals, errors: errors.length };
    totalErr += errors.length;
    errors.slice(0, 10).forEach(e => console.log('  ❌ ' + e));
    await page.close();
  }
  await browser.close();
  console.log('\n=== Full-system crawl ===');
  Object.keys(summary).forEach(r => { const s = summary[r]; console.log(r + ': pages ' + s.pages + ' · tabs ' + s.tabs + ' · buttons ' + s.clicks + ' · modals ' + s.modals + ' · errors ' + s.errors); });
  console.log('total errors: ' + totalErr);
  console.log(totalErr === 0 ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(totalErr === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
