/**
 * بصير | مولّد الديمو التفاعلي
 * يدمج الواجهة كاملة مع نواة المنطق والبيانات في ملف HTML واحد ذاتي التشغيل
 * (يعمل بلا خادم: يفتح مباشرة في المتصفح أو يُنشر كصفحة ثابتة).
 * التشغيل: node tools/build-demo.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = function (p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); };

// الترتيب مطابق لوسوم <script> في public/index.html (i18n أولاً لتوفير I18n)
const SCRIPTS = [
  'public/js/i18n.js',
  'shared/seed-data.js',
  'shared/api-core.js',
  'public/js/api.js',
  'public/js/charts.js',
  'public/js/viewer.js',
  'public/js/bim-viewer.js',
  'public/js/dxf-viewer.js',
  'public/js/views.js',
  'public/js/views2.js',
  'public/js/views3.js',
  'public/js/views4.js',
  'public/js/views5.js',
  'public/js/app.js'
];

const css = read('public/css/styles.css');
const js = SCRIPTS.map(function (p) {
  return '/* ===== ' + p + ' ===== */\n' + read(p);
}).join('\n\n');

const banner =
  '<div style="position:fixed;bottom:0;inset-inline:0;z-index:90;text-align:center;padding:6px;font-size:11px;' +
  'color:#8b95a8;background:rgba(11,14,20,.9);border-top:1px solid #222c40">' +
  'نسخة ديمو تفاعلية كاملة تعمل داخل المتصفح — البيانات محفوظة محلياً ويمكن إعادة ضبطها من الشريط الجانبي' +
  '</div>';

/** محتوى الصفحة (بدون هيكل html/head/body — للنشر كـ Artifact) */
const inner =
  '<title>بصير - عيون المالك | ديمو تفاعلي</title>\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<style>\n' + css + '\n</style>\n' +
  '<div dir="rtl" style="direction:rtl"><div id="app"></div></div>\n' + banner + '\n' +
  '<script>window.DEMO_MODE = true;</script>\n' +
  '<script>\n' + js + '\n</script>\n';

/** نسخة مستقلة كاملة (تفتح مباشرة من القرص) */
const standalone =
  '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="UTF-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<title>بصير - عيون المالك | ديمو تفاعلي</title>\n' +
  '<style>\n' + css + '\n</style>\n</head>\n<body>\n' +
  '<div id="app"></div>\n' + banner + '\n' +
  '<script>window.DEMO_MODE = true;</script>\n' +
  '<script>\n' + js + '\n</script>\n</body>\n</html>\n';

const outDir = path.join(ROOT, 'demo');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'bassir-demo.html'), standalone);
fs.writeFileSync(path.join(outDir, 'bassir-demo-artifact.html'), inner);
console.log('✅ demo/bassir-demo.html (' + Math.round(standalone.length / 1024) + ' KB) — يفتح مباشرة في أي متصفح');
console.log('✅ demo/bassir-demo-artifact.html — نسخة النشر كصفحة');
