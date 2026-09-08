/*
 * اختبار السلسلة الأساسية: ربط المخطط بجدول الكميات (مظلم ← ساطع).
 * المقاول يرفع مستخلص إنجاز 100٪ لأدنى دور معماري → الاستشاري يعتمده →
 * تتحدّث نسب البنود → تُضيء مناطق خريطة الإنجاز التي يراها المالك.
 * يقيس سطوع مناطق المخطط قبل/بعد كإثبات موضوعي.
 */
const H = require('./_harness');

(async () => {
  const browser = await H.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('C:' + m.text()); });
  page.on('dialog', d => d.accept());
  await H.serve(page);

  async function readMap(floorId) {
    await H.nav(page, 'progress-map');
    const dc = page.locator('[data-disc="architectural"]'); if (await dc.count()) await dc.first().click(); await page.waitForTimeout(150);
    const fl = page.locator('[data-floor="' + floorId + '"]'); if (await fl.count()) await fl.first().click(); await page.waitForTimeout(250);
    return page.evaluate(() => {
      const rects = [...document.querySelectorAll('.zone-shape rect')];
      const bright = rects.map(r => { const m = (r.getAttribute('fill') || '').match(/rgb\((\d+),(\d+),(\d+)\)/); return m ? (+m[1] + +m[2] + +m[3]) : 0; });
      return { brightSum: bright.reduce((a, c) => a + c, 0), floorPct: (document.querySelector('.floor-tabs .tab.active .num') || {}).textContent || '?' };
    });
  }
  const R = {};
  await H.login(page, 'owner_rep');
  const target = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); const by = {}; d.boqItems.filter(x => x.discipline === 'architectural').forEach(x => { (by[x.floor] = by[x.floor] || []).push(x.progress); }); let best = null; Object.keys(by).forEach(f => { const a = by[f].reduce((s, c) => s + c, 0) / by[f].length; if (best === null || a < best.avg) best = { floor: f, avg: Math.round(a) }; }); return best; });
  const before = await readMap(target.floor);
  await page.screenshot({ path: H.OUT + '/map-before.png' });

  // contractor submits payment raising target-floor architectural items to 100%
  await H.login(page, 'contractor');
  await H.nav(page, 'home');
  const ptab = page.locator('[data-ctab="payments"]'); if (await ptab.count()) await ptab.first().click(); await page.waitForTimeout(200);
  await page.click('#ct-new'); await page.waitForSelector('#sb-title', { timeout: 4000 });
  await page.fill('#sb-title', 'مستخلص إنجاز معماري 100% — ' + target.floor);
  if (await page.locator('#sb-amount').count()) await page.fill('#sb-amount', '950000');
  const sel0 = await page.$('#sb-lines [data-lf="boqItemId"]');
  const opts = await sel0.$$eval('option', os => os.map((o, i) => ({ i, t: o.textContent })));
  const idx = opts.filter(o => o.t.includes(' — ' + target.floor + ' (')).map(o => o.i).slice(0, 6);
  async function setLine(row, opt) { const rows = await page.$$('#sb-lines > div'); const r = rows[row]; if (!r) return; await (await r.$('[data-lf="boqItemId"]')).selectOption({ index: opt }); await (await r.$('[data-lf="progress"]')).fill('100'); }
  for (let k = 0; k < idx.length; k++) { if (k > 0) await page.click('#sb-addline'); await page.waitForTimeout(60); await setLine(k, idx[k]); }
  if (await page.locator('#sb-file').count()) await page.setInputFiles('#sb-file', H.file('IPC-' + target.floor + '.pdf'));
  await page.click('#sb-ok'); await page.waitForTimeout(500);
  const payId = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); return d.payments[d.payments.length - 1].id; });

  // consultant approves that specific payment
  await H.login(page, 'consultant');
  await H.nav(page, 'submittals');
  await page.locator('.tabbar .tab', { hasText: 'بانتظار قراري' }).first().click(); await page.waitForTimeout(300);
  const payTab = page.locator('[data-atab="payments"]'); if (await payTab.count()) { await payTab.first().click(); await page.waitForTimeout(250); }
  let approved = false;
  const btn = page.locator('[data-review="' + payId + '"]');
  if (await btn.count()) { await btn.first().click(); await page.waitForSelector('#rv-ok', { timeout: 4000 }).catch(() => {}); if (await page.locator('#rv-ok').count()) { await page.selectOption('#rv-status', 'approved').catch(() => {}); await page.click('#rv-ok'); await page.waitForTimeout(700); approved = true; } }

  // owner_rep re-reads the map
  await H.login(page, 'owner_rep');
  const after = await readMap(target.floor);
  await page.screenshot({ path: H.OUT + '/map-after.png' });

  R.targetFloor = target.floor; R.before = before; R.after = after; R.approved = approved; R.jsErrors = errors.length;
  R.brightnessIncreased = after.brightSum > before.brightSum;
  console.log(JSON.stringify(R, null, 2));
  await browser.close();
  const ok = approved && R.brightnessIncreased && errors.length === 0;
  console.log(ok ? 'RESULT: PASS (dark→bright works)' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
