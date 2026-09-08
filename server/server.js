/**
 * بصير - عيون المالك | خادم النظام (بدون أي اعتماديات خارجية)
 * التشغيل:  node server/server.js   ثم افتح  http://localhost:3000
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const seedModule = require('../shared/seed-data.js');
const coreModule = require('../shared/api-core.js');
const storageModule = require('./storage.js');
const integrations = require('./integrations.js');
const pdfModule = require('./pdf.js');
const reportsModule = require('./reports.js');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_DIR = storageModule.DATA_DIR;
// مجلد الملفات المرفوعة: قابل للتوجيه لمسار خارجي (مثلاً تخزين مُخصص على الخادم) عبر UPLOADS_DIR،
// وإلا يُستخدم data/uploads محلياً افتراضياً. المستندات والصور تُحفظ في مجلدين فرعيين منفصلين.
const UPLOADS_DIR = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.join(DATA_DIR, 'uploads');
const UPLOADS_IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const UPLOADS_DOCS_DIR = path.join(UPLOADS_DIR, 'documents');

// ============ قاعدة البيانات (SQLite افتراضياً) ============
const storage = storageModule.createStorage();
const SEED_VERSION = seedModule.buildSeed().meta.version;

function loadDb() {
  if (process.argv.indexOf('--reset') === -1) {
    const saved = storage.load();
    if (saved && saved.meta && saved.meta.version === SEED_VERSION) return saved;
    if (saved) console.log('نسخة البيانات قديمة — سيعاد التهيئة بالبيانات المحدثة');
  }
  return seedModule.buildSeed();
}

const db = loadDb();
let saveTimer = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(function () {
    saveTimer = null;
    try { storage.persist(db); }
    catch (e) { console.error('فشل حفظ قاعدة البيانات:', e.message); }
  }, 150);
}

// ============ تشفير كلمات المرور (scrypt المدمجة) ============
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { passwordHash: crypto.scryptSync(String(plain), salt, 64).toString('hex'), salt: salt };
}

function verifyPassword(plain, user) {
  if (user.passwordHash && user.salt) {
    const h = crypto.scryptSync(String(plain), user.salt, 64);
    const stored = Buffer.from(user.passwordHash, 'hex');
    return h.length === stored.length && crypto.timingSafeEqual(h, stored);
  }
  return false;
}

// ترحيل: أي كلمة مرور نصية قديمة تُشفَّر فور الإقلاع وتُحذف من التخزين
let migrated = 0;
db.users.forEach(function (u) {
  if (u.password) {
    Object.assign(u, hashPassword(u.password));
    delete u.password;
    migrated++;
  }
});
if (migrated) console.log('🔐 شُفِّرت كلمات مرور ' + migrated + ' مستخدم (scrypt)');
persist();

/**
 * تسليم الإشعارات فعلياً عبر البريد وواتساب لكل مستلم حسب تفضيلاته.
 * غير معطِّل للمسار الأساسي: يُطلق بلا انتظار، وأي فشل يوثَّق فقط.
 * القنوات غير المهيأة (بلا مفاتيح .env) تُسجَّل كمحاكاة موثّقة.
 */
function deliverNotification(notif, recipients) {
  const projectName = db.projects && db.projects[0] ? db.projects[0].name : '';
  const subject = 'بصير · إشعار: ' + (notif.kind === 'submit' ? 'تقديم جديد'
    : notif.kind === 'decision' ? 'قرار اعتماد'
    : notif.kind === 'answer' ? 'رد على استفسار'
    : notif.kind === 'resubmit' ? 'إعادة تقديم'
    : notif.kind === 'assign' ? 'إسناد مهمة'
    : notif.kind === 'health' ? 'تراجع صحة المشروع'
    : notif.kind === 'recovery' ? 'تحسّن صحة المشروع' : 'تحديث');
  const html = '<div dir="rtl" style="font-family:Tahoma,Arial;line-height:1.9">' +
    '<h3 style="color:#0b5">👁 بصير — عيون المالك</h3>' +
    '<p><b>' + escapeHtml(subject) + '</b></p><p>' + escapeHtml(notif.text) + '</p>' +
    (projectName ? '<p style="color:#888">المشروع: ' + escapeHtml(projectName) + '</p>' : '') +
    '<p style="color:#aaa;font-size:12px">' + escapeHtml(notif.time) + '</p></div>';

  recipients.forEach(function (u) {
    if (u.notifyEmail !== false && u.email) {
      integrations.sendEmail(u.email, subject, html)
        .then(function () { logDelivery('email', u, notif, 'sent'); })
        .catch(function (e) { logDelivery('email', u, notif, e.notConfigured ? 'sent_demo' : 'failed'); });
    }
    if (u.notifyWhatsapp && u.phone) {
      integrations.sendWhatsapp(u.phone, subject + '\n' + notif.text + (projectName ? '\nالمشروع: ' + projectName : ''))
        .then(function () { logDelivery('whatsapp', u, notif, 'sent'); })
        .catch(function (e) { logDelivery('whatsapp', u, notif, e.notConfigured ? 'sent_demo' : 'failed'); });
    }
  });
}

function logDelivery(channel, user, notif, status) {
  if (!db.messages) db.messages = [];
  db.messages.push({
    id: 'MSGN' + Date.now() + Math.floor(Math.random() * 1000),
    channel: channel, to: channel === 'email' ? user.email : user.phone,
    title: 'إشعار آلي: ' + notif.text.slice(0, 60), auto: true,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: status, by: 'النظام'
  });
  if (db.messages.length > 500) db.messages.splice(0, db.messages.length - 500);
  persist();
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

const core = coreModule.createCore(db, persist, {
  password: { hash: hashPassword, verify: verifyPassword },
  onNotify: deliverNotification
});

// ============ توكنات موقعة (JWT HS256) تبقى صالحة بعد إعادة التشغيل ============
const SECRET_FILE = path.join(DATA_DIR, '.jwt-secret');
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try { return fs.readFileSync(SECRET_FILE, 'utf8').trim(); } catch (e) { /* أول تشغيل */ }
  const s = crypto.randomBytes(48).toString('hex');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 });
  return s;
}
const JWT_SECRET = loadSecret();
const TOKEN_TTL = 12 * 3600 * 1000; // 12 ساعة

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signToken(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ uid: user.id, exp: Date.now() + TOKEN_TTL }));
  const sig = b64url(crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + payload).digest());
  return header + '.' + payload + '.' + sig;
}

function verifyToken(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  const expected = b64url(crypto.createHmac('sha256', JWT_SECRET).update(parts[0] + '.' + parts[1]).digest());
  const a = Buffer.from(parts[2]), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()); }
  catch (e) { return null; }
  if (!payload.exp || payload.exp < Date.now()) return null;
  const u = db.users.find(function (x) { return x.id === payload.uid; });
  if (!u) return null;
  return { id: u.id, username: u.username, name: u.name, role: u.role, contractorId: u.contractorId || null,
    projectIds: u.projectIds && u.projectIds.length ? u.projectIds : null };
}

function authUser(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? verifyToken(m[1]) : null;
}

// ============ حد محاولات الدخول (10 محاولات / 10 دقائق لكل عنوان) ============
const loginAttempts = new Map();
function loginLimited(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now > rec.resetAt) { loginAttempts.set(ip, { count: 1, resetAt: now + 600000 }); return false; }
  rec.count++;
  return rec.count > 10;
}

// ============ أدوات HTTP ============
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let data = '';
    req.on('data', function (c) { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', function () {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(new Error('JSON غير صالح')); }
    });
    req.on('error', reject);
  });
}

/** قراءة جسم ثنائي (لرفع الملفات ولقطات الكاميرات) بحد 15MB */
function readRawBody(req, maxBytes) {
  maxBytes = maxBytes || 15e6;
  return new Promise(function (resolve, reject) {
    const chunks = [];
    let size = 0;
    req.on('data', function (c) {
      size += c.length;
      if (size > maxBytes) { req.destroy(); reject(new Error('الملف أكبر من الحد المسموح (15MB)')); return; }
      chunks.push(c);
    });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

/** حفظ ملف مرفوع باسم عشوائي غير قابل للتخمين، في مجلد الصور أو المستندات حسب نوعه، وإرجاع سجله */
function storeUpload(buffer, originalName, mime, byUser) {
  const isImage = /^image\//.test(mime || '');
  const sub = isImage ? 'images' : 'documents';
  const dir = isImage ? UPLOADS_IMAGES_DIR : UPLOADS_DOCS_DIR;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const safe = path.basename(String(originalName || 'file')).replace(/[^\w.\-؀-ۿ]+/g, '_').slice(0, 80) || 'file';
  const stored = crypto.randomBytes(9).toString('hex') + '-' + safe;
  fs.writeFileSync(path.join(dir, stored), buffer);
  const rec = {
    id: 'F' + crypto.randomBytes(6).toString('hex'),
    name: safe, stored: stored, url: '/uploads/' + sub + '/' + stored,
    size: buffer.length, mime: mime || 'application/octet-stream',
    by: byUser || null, date: new Date().toISOString().slice(0, 10)
  };
  return rec;
}

/** يستنتج مشروع الملف المرفوع: مشروع المقاول الفعلي إن وُجد، وإلا المشروع الأول (توافقاً مع الوضع أحادي المشروع) */
function inferProjectId(user) {
  if (user && user.role === 'contractor') {
    const c = db.contractors.find(function (x) { return x.id === user.contractorId; });
    if (c && c.projectId) return c.projectId;
  }
  return db.projects[0] ? db.projects[0].id : 'P1';
}

/** يعدّ الملفات المرفوعة إجمالاً عبر مجلدي الصور والمستندات */
function countUploads() {
  return [UPLOADS_IMAGES_DIR, UPLOADS_DOCS_DIR].reduce(function (n, dir) {
    try { return n + fs.readdirSync(dir).length; } catch (e) { return n; }
  }, 0);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.pdf': 'application/pdf',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.gif': 'image/gif', '.webp': 'image/webp',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm', '.ifc': 'text/plain; charset=utf-8', '.dxf': 'text/plain; charset=utf-8'
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  // كل نوع مسار له مجلد أساس خاص به وتحقق احتواء مستقل — يدعم ذلك أن UPLOADS_DIR
  // قد يقع خارج ROOT كلياً (مسار تخزين خارجي مُوجَّه عبر متغير البيئة).
  let base, rel;
  if (urlPath.startsWith('/uploads/')) { base = UPLOADS_DIR; rel = urlPath.slice('/uploads/'.length); }
  else if (urlPath.startsWith('/shared/')) { base = ROOT; rel = urlPath; }
  else { base = path.join(ROOT, 'public'); rel = urlPath; }
  const baseNorm = path.normalize(base);
  const file = path.normalize(path.join(base, rel));
  if (file !== baseNorm && !file.startsWith(baseNorm + path.sep)) { json(res, 403, { error: 'forbidden' }); return; }
  fs.readFile(file, function (e, buf) {
    if (e) { json(res, 404, { error: 'not found: ' + urlPath }); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

// ============ الموجّه ============
const SERVER_STARTED = Date.now();
const server = http.createServer(async function (req, res) {
  try {
    const u = req.url.split('?')[0];

    // فحص الصحة (عام، بلا مصادقة) — لموازِن الأحمال و Docker healthcheck
    if (u === '/healthz' || u === '/api/health') {
      return json(res, 200, {
        status: 'ok',
        uptime: Math.round((Date.now() - SERVER_STARTED) / 1000),
        storage: storage.kind,
        projects: (db.projects || []).length,
        version: (db.meta && db.meta.version) || null,
        time: new Date().toISOString()
      });
    }

    // مدخل لقطات الكاميرات: الكاميرا/NVR تدفع JPEG عبر HTTP بمفتاح CAMERA_KEY
    let m0 = u.match(/^\/api\/cameras\/([\w-]+)\/snapshot$/);
    if (m0 && req.method === 'POST') {
      if (!process.env.CAMERA_KEY || req.headers['x-camera-key'] !== process.env.CAMERA_KEY) {
        return json(res, 401, { error: 'مفتاح الكاميرا غير صحيح (x-camera-key)' });
      }
      const cam = db.cameras.find(function (c) { return c.id === m0[1]; });
      if (!cam) return json(res, 404, { error: 'كاميرا غير معروفة' });
      const buf = await readRawBody(req);
      const rec = storeUpload(buf, cam.id + '-snapshot.jpg', req.headers['content-type'] || 'image/jpeg', cam.name);
      rec.projectId = cam.projectId || inferProjectId(null);
      rec.docCode = core.docCode('files', rec.projectId);
      if (!db.files) db.files = [];
      db.files.unshift(rec);
      const photo = {
        id: 'PH' + Date.now(), projectId: db.projects[0] ? db.projects[0].id : 'P1',
        date: new Date().toISOString().slice(0, 10),
        area: cam.location || '', title: 'لقطة ' + cam.name,
        ai: 'بانتظار التحليل', detected: null, url: rec.url
      };
      db.photos.unshift(photo);
      cam.status = 'online';
      core.audit(null, 'snapshot', 'لقطة واردة من ' + cam.name);
      persist();
      // تحليل غير متزامن إن كان الذكاء الاصطناعي مهيأ
      if (integrations.aiConfigured()) {
        // نسبة النموذج (BOQ) للعنصر المرتبط بالكاميرا — أساس المقارنة الآلية
        const bimReported = cam.bimFloor ? core.floorDisciplineProgress(cam.bimFloor, cam.bimDiscipline || null) : null;
        integrations.analyzeImage(buf, rec.mime, { area: cam.name, reported: bimReported }).then(function (a) {
          photo.ai = a.summary; photo.detected = a.progress;
          db.aiInsights.unshift({
            id: 'AI' + Date.now(), projectId: photo.projectId, date: photo.date, source: 'camera',
            area: cam.name + (cam.bimFloor ? ' ← نموذج BIM' : ''),
            detected: a.progress, reported: bimReported,
            note: a.summary + (a.safety.length ? ' — سلامة: ' + a.safety.join('؛ ') : ''),
            severity: a.safety.length ? 'alert' : 'ok'
          });
          persist();
        }).catch(function (e) { photo.ai = 'تعذر التحليل: ' + e.message; persist(); });
      }
      return json(res, 201, { ok: true, photo: photo, aiQueued: integrations.aiConfigured() });
    }

    if (!u.startsWith('/api/')) return serveStatic(req, res);

    // تسجيل الدخول
    if (u === '/api/login' && req.method === 'POST') {
      const ip = req.socket.remoteAddress || '?';
      if (loginLimited(ip)) return json(res, 429, { error: 'محاولات كثيرة — أعد المحاولة بعد 10 دقائق' });
      const body = await readBody(req);
      const user = core.login(body.username, body.password);
      loginAttempts.delete(ip);
      return json(res, 200, { token: signToken(user), user: user });
    }

    const user = authUser(req);
    if (!user) return json(res, 401, { error: 'يلزم تسجيل الدخول' });

    if (u === '/api/logout' && req.method === 'POST') {
      // التوكنات موقعة بلا حالة على الخادم — الخروج بحذف التوكن لدى العميل
      return json(res, 200, { ok: true });
    }

    if (u === '/api/me') return json(res, 200, { user: user });

    if (u === '/api/state') {
      const st = core.getState(user);
      // رابط خادم بث الكاميرات (MediaMTX) — لغير المقاول
      if (user.role !== 'contractor') st.mediaServerUrl = process.env.MEDIA_SERVER_URL || null;
      return json(res, 200, st);
    }

    if (u === '/api/summary/contractors') {
      const cid = user.role === 'contractor' ? user.contractorId : null;
      const list = db.contractors
        .filter(function (c) { return !cid || c.id === cid; })
        .map(core.contractorSummary);
      return json(res, 200, list);
    }

    // CRUD عام على المجموعات
    let m = u.match(/^\/api\/collections\/(\w+)$/);
    if (m && req.method === 'POST') {
      const body = await readBody(req);
      const item = core.createItem(user, m[1], body);
      return json(res, 201, item);
    }
    m = u.match(/^\/api\/collections\/(\w+)\/([\w-]+)$/);
    if (m && req.method === 'PUT') {
      const body = await readBody(req);
      return json(res, 200, core.updateItem(user, m[1], m[2], body));
    }
    if (m && req.method === 'DELETE') {
      return json(res, 200, core.deleteItem(user, m[1], m[2]));
    }

    // رفع الملفات (صور، مخططات، مستندات، نماذج BIM كبيرة) — تخزين فعلي مع فئات ونسخ
    if (u === '/api/upload' && req.method === 'POST') {
      const buf = await readRawBody(req, 500e6); // يدعم نماذج BIM حتى 500MB
      if (!buf.length) return json(res, 400, { error: 'لا يوجد محتوى' });
      const name = decodeURIComponent(req.headers['x-filename'] || 'file');
      const category = decodeURIComponent(req.headers['x-category'] || '') || 'أخرى';
      const versionOf = req.headers['x-version-of'] || null;
      if (!db.files) db.files = [];

      // نسخة جديدة لملف موجود: يؤرشف السابق في versions بلا تكرار سجلات
      if (versionOf) {
        const existing = db.files.find(function (f) { return f.id === versionOf; });
        if (!existing) return json(res, 404, { error: 'الملف الأصلي غير موجود' });
        const rec = storeUpload(buf, name, req.headers['content-type'], user.name);
        if (!existing.versions) existing.versions = [];
        existing.versions.push({
          v: existing.versions.length + 1, name: existing.name, url: existing.url,
          size: existing.size, by: existing.by, date: existing.date
        });
        existing.name = rec.name; existing.url = rec.url; existing.stored = rec.stored;
        existing.size = rec.size; existing.mime = rec.mime;
        existing.by = user.name; existing.date = rec.date;
        core.audit(user, 'upload', 'نسخة جديدة (' + (existing.versions.length + 1) + ') من الملف ' + existing.docCode);
        persist();
        return json(res, 201, existing);
      }

      const rec = storeUpload(buf, name, req.headers['content-type'], user.name);
      rec.projectId = req.headers['x-project'] || inferProjectId(user);
      rec.docCode = core.docCode('files', rec.projectId);
      rec.category = category;
      rec.versions = [];
      db.files.unshift(rec);
      core.audit(user, 'upload', 'رفع ملف: ' + rec.name + ' (' + rec.docCode + ' · ' + category + ')');
      persist();
      return json(res, 201, rec);
    }

    // حالة التكامل مع الخدمات الحقيقية
    if (u === '/api/integrations/status') {
      if (['admin', 'consultant'].indexOf(user.role) === -1) return json(res, 403, { error: 'غير مصرح' });
      const s = integrations.status();
      s.storage = { kind: storage.kind, file: path.basename(storage.file) };
      s.uploads = countUploads();
      s.uploadsDir = UPLOADS_DIR;
      return json(res, 200, s);
    }

    // تحليل صورة بالذكاء الاصطناعي الحقيقي (Claude Vision)
    if (u === '/api/actions/analyze-photo' && req.method === 'POST') {
      if (['admin', 'consultant'].indexOf(user.role) === -1) return json(res, 403, { error: 'غير مصرح' });
      const body = await readBody(req);
      const stored = String(body.url || '').replace('/uploads/', '');
      const fpath = path.normalize(path.join(UPLOADS_DIR, stored));
      if (!stored || !fpath.startsWith(UPLOADS_DIR) || !fs.existsSync(fpath)) {
        return json(res, 404, { error: 'ارفع الصورة أولاً ثم أعد المحاولة' });
      }
      let analysis;
      try {
        analysis = await integrations.analyzeImage(fs.readFileSync(fpath), body.mime, {
          area: body.area, reported: body.reported
        });
      } catch (e) {
        return json(res, e.notConfigured ? 503 : 502, { error: e.message });
      }
      const today = new Date().toISOString().slice(0, 10);
      const diff = body.reported != null ? Math.round((analysis.progress - body.reported) * 10) / 10 : null;
      db.photos.unshift({
        id: 'PH' + Date.now(), projectId: body.projectId || (db.projects[0] ? db.projects[0].id : 'P1'),
        date: today, area: body.area || '',
        title: body.area || 'صورة محللة', ai: analysis.summary, detected: analysis.progress, url: body.url
      });
      db.aiInsights.unshift({
        id: 'AI' + Date.now(), projectId: body.projectId || (db.projects[0] ? db.projects[0].id : 'P1'),
        date: today, source: 'photos', area: body.area || '',
        detected: analysis.progress, reported: body.reported != null ? Number(body.reported) : null,
        note: analysis.summary +
          (analysis.observations.length ? ' — ' + analysis.observations.join('؛ ') : '') +
          (analysis.safety.length ? ' — ⚠ سلامة: ' + analysis.safety.join('؛ ') : ''),
        severity: analysis.safety.length ? 'alert' : (diff != null && Math.abs(diff) > 5 ? 'warn' : 'ok')
      });
      persist();
      return json(res, 200, { analysis: analysis, diff: diff });
    }

    // إجراءات الأعمال
    if (u === '/api/actions/review' && req.method === 'POST') {
      const body = await readBody(req);
      const item = core.review(user, body);
      return json(res, 200, item);
    }
    if (u === '/api/actions/add-contractor' && req.method === 'POST') {
      return json(res, 201, core.addContractor(user, await readBody(req)));
    }
    if (u === '/api/actions/add-project' && req.method === 'POST') {
      return json(res, 201, core.addProject(user, await readBody(req)));
    }
    if (u === '/api/actions/resubmit' && req.method === 'POST') {
      return json(res, 200, core.resubmit(user, await readBody(req)));
    }
    if (u === '/api/actions/notify-read' && req.method === 'POST') {
      return json(res, 200, core.markNotificationsRead(user));
    }
    if (u === '/api/actions/profile' && req.method === 'POST') {
      return json(res, 200, core.updateProfile(user, await readBody(req)));
    }
    if (u === '/api/actions/record-health' && req.method === 'POST') {
      return json(res, 200, core.recordHealthSnapshot(user, await readBody(req)));
    }

    // النسخ الاحتياطي (أدمن): نسخة مؤرخة من قاعدة البيانات في data/backups
    if (u === '/api/actions/backup' && req.method === 'POST') {
      if (user.role !== 'admin') return json(res, 403, { error: 'النسخ الاحتياطي صلاحية الأدمن' });
      const bdir = path.join(DATA_DIR, 'backups');
      if (!fs.existsSync(bdir)) fs.mkdirSync(bdir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      const dest = path.join(bdir, 'bassir-' + stamp + '.json');
      fs.writeFileSync(dest, JSON.stringify(db));
      core.audit(user, 'update', 'نسخة احتياطية: ' + path.basename(dest));
      persist();
      return json(res, 201, { ok: true, file: path.basename(dest), size: fs.statSync(dest).size });
    }
    if (u === '/api/backups') {
      if (user.role !== 'admin') return json(res, 403, { error: 'غير مصرح' });
      const bdir = path.join(DATA_DIR, 'backups');
      const list = fs.existsSync(bdir) ? fs.readdirSync(bdir).sort().reverse().map(function (f) {
        return { file: f, size: fs.statSync(path.join(bdir, f)).size };
      }) : [];
      return json(res, 200, list);
    }

    if (u === '/api/actions/send-report' && req.method === 'POST') {
      const body = await readBody(req);
      // إرسال حقيقي إن كانت القناة مهيأة، وإلا يوثق في السجل كمحاكاة
      const text = 'تقرير من نظام بصير - عيون المالك\n' + (body.title || 'تقرير المشروع') + '\n' +
        'المشروع: ' + (db.projects[0] ? db.projects[0].name : '') + '\nبواسطة: ' + user.name;
      try {
        if (body.channel === 'whatsapp') await integrations.sendWhatsapp(body.to, text);
        else await integrations.sendEmail(body.to, body.title || 'تقرير بصير', '<div dir="rtl">' + text.replace(/\n/g, '<br>') + '</div>');
        body.status = 'sent';
      } catch (e) {
        if (!e.notConfigured) return json(res, 502, { error: e.message });
        body.status = 'sent_demo'; // القناة غير مهيأة — سجل محاكاة
      }
      return json(res, 200, core.sendReport(user, body));
    }

    // تقارير PDF ثنائية اللغة — تُبنى من بيانات الخادم الحقيقية مباشرة (لا تعمل في وضع الديمو بالمتصفح)
    if (u === '/api/actions/progress-report' && req.method === 'GET') {
      if (['admin', 'consultant', 'owner', 'owner_rep'].indexOf(user.role) === -1) return json(res, 403, { error: 'غير مصرح' });
      const qs = new URL(req.url, 'http://x').searchParams;
      const lang = qs.get('lang') === 'en' ? 'en' : 'ar';
      const period = qs.get('period') === 'monthly' ? 'monthly' : 'weekly';
      const pdfDoc = reportsModule.buildProgressReport(db, lang, period);
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + period + '-report.pdf"' });
      pdfDoc.pipe(res);
      pdfDoc.end();
      core.audit(user, 'export', 'تصدير تقرير ' + (period === 'monthly' ? 'شهري' : 'أسبوعي') + ' (PDF)');
      persist();
      return;
    }

    if (u === '/api/actions/incident-report' && req.method === 'GET') {
      if (['admin', 'consultant', 'owner', 'owner_rep'].indexOf(user.role) === -1) return json(res, 403, { error: 'غير مصرح' });
      const qs = new URL(req.url, 'http://x').searchParams;
      const lang = qs.get('lang') === 'en' ? 'en' : 'ar';
      const insight = (db.aiInsights || []).find(function (x) { return x.id === qs.get('id'); });
      if (!insight) return json(res, 404, { error: 'التنبيه غير موجود' });
      const pdfDoc = reportsModule.buildIncidentReport(db, insight, lang);
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Incident-Report.pdf"' });
      pdfDoc.pipe(res);
      pdfDoc.end();
      core.audit(user, 'export', 'تصدير تقرير حادث (PDF): ' + (insight.area || insight.id));
      persist();
      return;
    }

    json(res, 404, { error: 'مسار غير معروف: ' + u });
  } catch (e) {
    json(res, e.status || 500, { error: e.message });
  }
});

server.listen(PORT, function () {
  const st = integrations.status();
  const flag = function (c) { return c ? '✅ مهيأ' : '◽ محاكاة (غير مهيأ)'; };
  console.log('');
  console.log('  👁  بصير - عيون المالك | Bassir Owner Eyes');
  console.log('  ─────────────────────────────────────────');
  console.log('  الخادم يعمل على:  http://localhost:' + PORT);
  console.log('  قاعدة البيانات:   ' + (storage.kind === 'sqlite' ? 'SQLite ✅ (' + path.basename(storage.file) + ')' : 'ملف JSON'));
  console.log('  البريد:           ' + flag(st.email.configured) + (st.email.provider ? ' (' + st.email.provider + ')' : ''));
  console.log('  واتساب:           ' + flag(st.whatsapp.configured));
  console.log('  الذكاء الاصطناعي: ' + flag(st.ai.configured) + (st.ai.keyPresent && !st.ai.sdkInstalled ? ' — ثبّت الحزمة: npm install @anthropic-ai/sdk' : ''));
  console.log('  مدخل الكاميرات:   ' + flag(st.cameraIngest.configured));
  console.log('  (فعّل الخدمات عبر ملف .env — انظر .env.example)');
  console.log('');
  console.log('  حسابات الديمو:');
  console.log('    admin / admin123        (مدير النظام)');
  console.log('    owner / owner123        (المالك)');
  console.log('    rep / rep123            (ممثل المالك)');
  console.log('    consultant / consult123 (الاستشاري)');
  console.log('    cont-str / cont123      (مقاول إنشائي)');
  console.log('');
});
