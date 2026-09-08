/* اختبار عرض نموذج BIM الحقيقي: يحمّل ملف IFC (البرج) في عارض web-ifc ويتأكد
   أنه يُصيّر عشرات العناصر (مبنى فعلي) لا صندوقاً واحداً. */
const H = require('./_harness');
const MODEL = process.env.IFC || '/vendor/bim/BassirTower.ifc';

(async () => {
  const browser = await H.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await H.serve(page);
  await page.goto('http://bassir.test/', { waitUntil: 'networkidle' });
  // login (any role) then load the model directly via the viewer API
  await H.login(page, 'consultant');
  await page.evaluate((url) => window.BimViewer.open({ title: 'BIM', url }), MODEL);
  await page.waitForFunction(() => window.BimViewer._last && window.BimViewer._last.meshCount > 0, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const last = await page.evaluate(() => window.BimViewer._last || null);
  await page.screenshot({ path: H.OUT + '/bim-tower.png' });
  console.log('meshes:', last && last.meshCount, 'triangles:', last && last.triCount, 'jsErrors:', errors.length);
  errors.slice(0, 6).forEach(e => console.log('  ' + e));
  await browser.close();
  const ok = last && last.meshCount > 20 && errors.length === 0;
  console.log(ok ? 'RESULT: PASS (real building renders)' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
