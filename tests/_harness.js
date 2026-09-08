/*
 * أدوات اختبار مشتركة (Playwright) لنظام بصير — عيون المالك.
 * تشغّل التطبيق في «وضع الديمو» داخل المتصفح بلا خادم، عبر اعتراض الطلبات
 * وتقديم ملفات المستودع مباشرة. تُبقي قاعدة بيانات الديمو مشتركة عبر تسجيلات
 * الدخول المتعددة (لمحاكاة عدة مستخدمين على نفس المشروع).
 *
 * المتطلبات:  npm i -D playwright  (ثم:  npx playwright install chromium)
 * التشغيل:    node tests/<name>.js
 * متغيّرات بيئة اختيارية:
 *   CHROME_PATH   مسار متصفح Chromium جاهز (يتخطّى تنزيل Playwright)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const PUB = path.join(REPO, 'public');
const OUT = path.join(__dirname, 'output');
try { fs.mkdirSync(OUT, { recursive: true }); } catch (e) { /* ignore */ }

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.ifc': 'text/plain', '.dxf': 'text/plain', '.pdf': 'application/pdf'
};

// حسابات الديمو (اسم المستخدم/كلمة المرور/الدور)
const ROLES = {
  owner:      ['owner', 'owner123'],
  owner_rep:  ['rep', 'rep123'],
  consultant: ['consultant', 'consult123'],
  contractor: ['cont-arch', 'cont123'],
  admin:      ['admin', 'admin123']
};

async function launch() {
  const opts = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
  if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  return chromium.launch(opts);
}

// يقدّم ملفات المستودع تحت أصل وهمي، ويحقن وضع الديمو مع تصفير جلسة الدخول فقط
async function serve(page) {
  await page.route('**/*', route => {
    const u = new URL(route.request().url());
    let p = u.pathname;
    if (p === '/' || p === '') p = '/index.html';
    const base = p.startsWith('/shared/') ? REPO : PUB;
    const file = path.join(base, p);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      let body = fs.readFileSync(file);
      if (p === '/index.html') {
        body = body.toString().replace('<body>',
          '<body>\n<script>window.DEMO_MODE=true;sessionStorage.clear();' +
          'if(!localStorage.getItem("__run")){localStorage.clear();localStorage.setItem("__run","1");}</script>');
      }
      return route.fulfill({ status: 200, headers: { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' }, body });
    }
    return route.fulfill({ status: 404, body: 'not found' });
  });
}

async function login(page, roleOrUser, pass) {
  const cred = ROLES[roleOrUser] || [roleOrUser, pass];
  await page.goto('http://bassir.test/', { waitUntil: 'networkidle' });
  await page.fill('#lg-user', cred[0]);
  await page.fill('#lg-pass', cred[1]);
  await page.click('#lg-go');
  await page.waitForSelector('.sidebar .nav-item', { timeout: 8000 });
}

async function clearModals(page) {
  await page.evaluate(() => document.querySelectorAll('.modal-back').forEach(m => m.remove()));
}

async function nav(page, id) {
  await clearModals(page);
  await page.click('.sidebar .nav-item[data-page="' + id + '"]');
  await page.waitForTimeout(200);
}

function db(page) {
  return page.evaluate(() => { try { return JSON.parse(localStorage.getItem('bassir-demo-db')); } catch (e) { return null; } });
}

const file = name => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test ' + name) });

module.exports = { REPO, PUB, OUT, ROLES, launch, serve, login, clearModals, nav, db, file };
