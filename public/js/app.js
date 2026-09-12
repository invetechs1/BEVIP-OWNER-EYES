/** بصير | التطبيق الرئيسي: الدخول، التوجيه، الهيكل */
(function () {
  'use strict';

  const VS = window.ViewsShared, VR = window.ViewsRoles, VM = window.ViewsModules, VH = window.ViewsHandover, VX = window.ViewsExtra;
  const esc = VS.esc;
  const t = I18n.t;

  I18n.registerDict({
    'عين المالك': "Owner's Eye",
    'لوحة القيادة': 'Dashboard',
    'خريطة الإنجاز': 'Progress Map',
    'مراقبة الموقع': 'Site Monitoring',
    'المقاولون والأداء': 'Contractors & Performance',
    'الرصد البصري': 'Visual Monitoring',
    'التقارير والإرسال': 'Reports & Sending',
    'لوحة المقاول': 'Contractor Dashboard',
    'الاعتمادات': 'Approvals',
    'سجلات المكتب الفني': 'Technical Office Records',
    'جداول الكميات': 'Bill of Quantities',
    'إدارة المقاولين': 'Manage Contractors',
    'إعداد التقارير': 'Report Builder',
    'المخططات والنماذج': 'Drawings & Models',
    'النماذج والمخططات BIM': 'BIM Models & Drawings',
    'التقديمات والاعتمادات': 'Submittals & Approvals',
    'المستندات': 'Documents',
    'المشاريع والاستشاريون': 'Projects & Consultants',
    'المستخدمون والصلاحيات': 'Users & Permissions',
    'سجل النظام': 'System Log',
    'إعدادات النظام': 'System Settings',
    'إعدادات المشروع': 'Project Settings',
    'المتابعة': 'Monitoring',
    'أعمالي': 'My Work',
    'المكتب الفني': 'Technical Office',
    'الإدارة': 'Administration',
    'مدير النظام': 'System Admin',
    'المالك': 'Owner',
    'ممثل المالك': "Owner's Representative",
    'استشاري المشروع': 'Project Consultant',
    'مقاول': 'Contractor',
    'تسجيل الخروج': 'Logout',
    'وضع الديمو': 'Demo mode',
    '↺ إعادة ضبط بيانات الديمو': '↺ Reset demo data',
    'اسم المستخدم': 'Username',
    'كلمة المرور': 'Password',
    'دخول': 'Login',
    'حسابات تجريبية — اضغط للتعبئة:': 'Demo accounts — click to fill:',
    '👁 المالك': '👁 Owner',
    '🧑‍💼 ممثل المالك': "🧑‍💼 Owner's Rep",
    '📐 الاستشاري': '📐 Consultant',
    '👷 مقاول معماري': '👷 Architectural Contractor',
    '🏗️ مقاول إنشائي': '🏗️ Structural Contractor',
    '⚙️ الأدمن': '⚙️ Admin',
    'عينك على مشروعك — منصة الرؤية البصرية التي تربط المالك بالاستشاري والمقاول<br>وترى بها تقدم مشروعك كما لو كنت في الموقع':
      'Your eye on your project — a visual platform connecting the owner, consultant, and contractors<br>so you can see your project\'s progress as if you were on site',
    'لوحة المشاريع': 'Projects Dashboard',
    'تتبع التقديمات': 'Submissions Tracking',
    'أوامر التغيير': 'Change Orders',
    'وثائق المشروع': 'Project Documents',
    'التسليم والإغلاق': 'Handover & Closeout',
    'أرشيف المستندات': 'Document Archive',
    'تتبع تقديماتي': 'My Submissions',
    'ملاحظاتي وضماناتي': 'My Punch List & Warranties',
    'أرشيف مستنداتي': 'My Document Archive',
    'الاستفسارات والعروض RFI/RFP': 'RFIs & RFPs',
    'مراحل المشروع': 'Project Phases',
    'إدارة BIM': 'BIM Management',
    'قاعدة بيانات المقاولين': 'Contractor Database',
    'محفظة المشاريع': 'Projects Portfolio',
    'خادم الملفات المركزي': 'Central File Server'
  });

  /* ============ مصنع الصفحات المبوّبة (Tabbed parent screens · §4-1/§5) ============
     يوحّد الشاشات المكرّرة تحت شاشة أب واحدة بتبويبات، مع إعادة استخدام دوال العرض
     المجرَّبة نفسها. كل تبويب يُبوَّب بصلاحيته، ويُظهر شريط التبويب فقط ما يخصّ الدور. */
  function tabbed(pageId, tabsDef) {
    return function (el, ctx) {
      const tabs = tabsDef.filter(function (t) { return !t.roles || t.roles.indexOf(ctx.U.role) !== -1; });
      if (!tabs.length) { el.innerHTML = '<div class="empty" style="padding:30px">لا صلاحية لعرض هذا القسم</div>'; return; }
      const key = 'bassir-tab-' + pageId;
      let active = sessionStorage.getItem(key);
      if (!tabs.some(function (t) { return t.id === active; })) active = tabs[0].id;
      function paint() {
        el.innerHTML =
          (tabs.length > 1
            ? '<div class="tabbar">' + tabs.map(function (t) {
                return '<button class="tab' + (t.id === active ? ' active' : '') + '" data-tab="' + t.id + '">' + esc(t.label) + '</button>';
              }).join('') + '</div>'
            : '') +
          '<div id="tab-body"></div>';
        el.querySelectorAll('[data-tab]').forEach(function (b) {
          b.addEventListener('click', function () {
            active = b.getAttribute('data-tab'); sessionStorage.setItem(key, active); paint();
          });
        });
        const tab = tabs.find(function (t) { return t.id === active; });
        tab.render(el.querySelector('#tab-body'), ctx);
      }
      paint();
    };
  }

  const OWNER_SET = ['admin', 'owner', 'owner_rep', 'consultant'];

  /* الهيكل الجديد (§5): 7 أقسام بترتيب دورة حياة المشروع، 14 عنصراً (13 ظاهرة لغير الأدمن).
     المعرّفات القديمة تبقى تعمل عبر ALIAS (إعادة توجيه داخلية — §13-9). */
  const PAGES = [
    // لوحة تُعرض كرابط «كل المشاريع» فوق القائمة، لا كعنصر قائمة (§9-1/14)
    { id: 'projects', title: 'كل المشاريع', icon: '🗂️', topLink: true, roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VM.renderProjectsDash },

    // === 1 · نظرة عامة ===
    { id: 'owner-eye', title: 'عين المالك', icon: '👁', sec: 'نظرة عامة', roles: ['admin', 'owner', 'owner_rep'], render: VS.renderOwnerEye },
    { id: 'dashboard', title: 'لوحة القيادة', icon: '📊', sec: 'نظرة عامة', roles: OWNER_SET, render: VS.renderDashboard },
    { id: 'progress-map', title: 'خريطة الإنجاز', icon: '🗺️', sec: 'نظرة عامة', roles: OWNER_SET, render: VS.renderVision },

    // === 2 · الأعمال والاعتمادات ===
    { id: 'submittals', title: 'التقديمات والاعتمادات', icon: '📋', sec: 'الأعمال والاعتمادات', roles: OWNER_SET, badge: badgeMyDecision,
      render: tabbed('submittals', [
        { id: 'all', label: 'كل السجلات', render: VR.renderArchive },
        { id: 'my-decision', label: 'بانتظار قراري', roles: ['admin', 'consultant'], render: VR.renderApprovals },
        { id: 'submissions', label: 'التقديمات', render: VM.renderSubmissions },
        { id: 'co', label: 'أوامر التغيير', render: VM.renderVariations },
        { id: 'rfi', label: 'RFI · RFP', render: VM.renderRfx }
      ]) },
    { id: 'tech-office', title: 'سجلات المكتب الفني', icon: '🏛️', sec: 'الأعمال والاعتمادات', roles: ['admin', 'consultant'], render: VR.renderTechOffice },
    { id: 'boq', title: 'جداول الكميات', icon: '📐', sec: 'الأعمال والاعتمادات', roles: ['admin', 'consultant', 'owner_rep'], render: VR.renderBoq },

    // === 3 · المقاولون ===
    { id: 'contractors', title: 'المقاولون', icon: '👷', sec: 'المقاولون', roles: OWNER_SET,
      render: tabbed('contractors', [
        { id: 'performance', label: 'الأداء', render: VS.renderContractors },
        { id: 'contracts', label: 'العقود', roles: ['admin', 'consultant'], render: VR.renderManageContractors },
        { id: 'profiles', label: 'بيانات الشركات', roles: ['admin', 'consultant', 'owner_rep'], render: VM.renderContractorDb }
      ]) },

    // === 4 · الموقع والمتابعة ===
    { id: 'cameras', title: 'مراقبة الموقع', icon: '🎥', sec: 'الموقع والمتابعة', roles: OWNER_SET, render: VS.renderCameras },
    { id: 'ai', title: 'الرصد البصري', icon: '🛰️', sec: 'الموقع والمتابعة', roles: OWNER_SET, render: VS.renderAi },
    { id: 'reports', title: 'التقارير', icon: '📨', sec: 'الموقع والمتابعة', roles: OWNER_SET,
      render: tabbed('reports', [
        { id: 'create', label: 'إنشاء', roles: ['admin', 'consultant'], render: VR.renderDailyReport },
        { id: 'send', label: 'إرسال', render: VS.renderReports }
      ]) },
    { id: 'schedule', title: 'الجدول الزمني', icon: '📅', sec: 'الموقع والمتابعة', roles: OWNER_SET, render: VX.renderSchedule },

    // === 5 · المستندات والنماذج ===
    { id: 'documents', title: 'المستندات', icon: '🗄️', sec: 'المستندات والنماذج', roles: OWNER_SET,
      render: tabbed('documents', [
        { id: 'files', label: 'المستندات', render: VM.renderFileServer },
        { id: 'project-docs', label: 'وثائق المشروع', render: VM.renderProjectDocs }
      ]) },
    { id: 'bim', title: 'النماذج والمخططات BIM', icon: '🧊', sec: 'المستندات والنماذج', roles: OWNER_SET,
      render: tabbed('bim', [
        { id: 'models', label: 'النماذج', render: VM.renderBim },
        { id: 'upload', label: 'رفع مخطط/نموذج', roles: ['admin', 'consultant'], render: VR.renderBimUpload }
      ]) },

    // === 6 · التسليم ===
    { id: 'handover', title: 'التسليم والإغلاق', icon: '🏁', sec: 'التسليم', roles: OWNER_SET, render: VH.renderHandover },

    // === 7 · الإعدادات ===
    { id: 'project-settings', title: 'إعدادات المشروع', icon: '⚙️', sec: 'الإعدادات', roles: ['admin', 'consultant'], render: VH.renderPhases },
    { id: 'users', title: 'المستخدمون والصلاحيات', icon: '👥', sec: 'الإعدادات', roles: ['admin', 'owner_rep'], render: VR.renderUsers },
    { id: 'system-settings', title: 'إعدادات النظام', icon: '🔧', sec: 'الإعدادات', roles: ['admin'], render: VR.renderSystem },

    // === الإدارة (أدمن/ممثل المالك) ===
    { id: 'portfolio', title: 'محفظة المشاريع', icon: '📈', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VH.renderPortfolio },
    { id: 'rep-projects', title: 'المشاريع والاستشاريون', icon: '🗂️', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderRepProjects },
    { id: 'audit', title: 'سجل النظام', icon: '📜', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderAudit },

    // === أعمالي (المقاول) ===
    { id: 'home', title: 'لوحة المقاول', icon: '🏗️', sec: 'أعمالي', roles: ['contractor'], render: VR.renderContractorHome },
    { id: 'boq-c', title: 'جدول الكميات', icon: '📐', sec: 'أعمالي', roles: ['contractor'], render: VX.renderContractorBoq },
    { id: 'schedule-c', title: 'الجدول الزمني', icon: '📅', sec: 'أعمالي', roles: ['contractor'], render: VX.renderSchedule },
    { id: 'submittals-c', title: 'تقديماتي', icon: '📋', sec: 'أعمالي', roles: ['contractor'], render: VM.renderSubmissions },
    { id: 'handover-c', title: 'ملاحظاتي وضماناتي', icon: '🏁', sec: 'أعمالي', roles: ['contractor'], render: VH.renderHandover },
    { id: 'documents-c', title: 'مستنداتي', icon: '📚', sec: 'أعمالي', roles: ['contractor'], render: VR.renderArchive }
  ];

  /* إعادة التوجيه من المعرّفات القديمة إلى الجديدة (روابط محفوظة + إشارات داخلية · §13-9).
     القيمة إمّا معرّف صفحة، أو {id, tab} لفتح تبويب محدّد داخل شاشة أب. */
  const ALIAS = {
    vision: 'progress-map',
    submissions: { id: 'submittals', tab: 'submissions' },
    approvals: { id: 'submittals', tab: 'my-decision' },
    variations: { id: 'submittals', tab: 'co' },
    rfx: { id: 'submittals', tab: 'rfi' },
    archive: { id: 'submittals', tab: 'all' },
    'project-docs': { id: 'documents', tab: 'project-docs' },
    'file-server': { id: 'documents', tab: 'files' },
    'manage-contractors': { id: 'contractors', tab: 'contracts' },
    'contractor-db': { id: 'contractors', tab: 'profiles' },
    'bim-upload': { id: 'bim', tab: 'upload' },
    daily: { id: 'reports', tab: 'create' },
    phases: 'project-settings',
    system: 'system-settings',
    'submissions-c': 'submittals-c',
    'archive-c': 'documents-c'
  };

  /** يحوّل معرّفاً (قد يكون قديماً) إلى المعرّف الحالي، مع ضبط التبويب المطلوب إن وُجد */
  function resolveId(id) {
    const a = ALIAS[id];
    if (!a) return id;
    if (typeof a === 'string') return a;
    try { sessionStorage.setItem('bassir-tab-' + a.id, a.tab); } catch (e) { /* تجاهل */ }
    return a.id;
  }

  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'استشاري المشروع', contractor: 'مقاول'
  };

  function badgePending(S) {
    return ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
  }

  /* §13-8: الشارة الوحيدة الباقية على «التقديمات» = عدد ما ينتظر قرار المستخدم الحالي.
     تعريف واحد لكل الشارات: «عدد ما ينتظر إجراءك» (§10-6). */
  function badgeMyDecision(S) { return badgePending(S); }

  function badgeRfx(S) {
    return ['rfis', 'rfps'].reduce(function (a, c) {
      return a + (S[c] || []).filter(function (x) { return x.status === 'open'; }).length;
    }, 0);
  }

  function badgeTech(S) {
    const pending = ['methodStatements', 'claims', 'valueEngineering']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
    const open = ['rfis', 'ncrs', 'snags', 'hseReports']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'open'; }).length; }, 0);
    return pending + open;
  }

  const app = document.getElementById('app');
  let ctx = null;

  // ============ مبدّل اللغة ============
  function langSwitchHtml(extraClass) {
    const lang = I18n.getLang();
    return '<div class="lang-switch' + (extraClass ? ' ' + extraClass : '') + '">' +
      '<span class="lang-btn' + (lang === 'ar' ? ' active' : '') + '" data-lang="ar">العربية</span>' +
      '<span class="lang-btn' + (lang === 'en' ? ' active' : '') + '" data-lang="en">English</span>' +
      '</div>';
  }

  function wireLangSwitch(root) {
    root.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        const l = b.getAttribute('data-lang');
        if (l === I18n.getLang()) return;
        I18n.setLang(l);
        location.reload();
      });
    });
  }

  // ============ شاشة الدخول ============
  function renderLogin(msg) {
    app.innerHTML =
      '<div class="login-wrap">' + langSwitchHtml('login-lang-switch') + '<div class="login-card">' +
      '<div class="login-logo">👁</div>' +
      '<div class="login-title">بصير <small>BASSIR · OWNER EYES</small></div>' +
      '<div class="login-sub">' + t('عينك على مشروعك — منصة الرؤية البصرية التي تربط المالك بالاستشاري والمقاول<br>وترى بها تقدم مشروعك كما لو كنت في الموقع') + '</div>' +
      (msg ? '<div class="pill p-danger" style="display:block;text-align:center;margin-bottom:12px;padding:10px">' + esc(msg) + '</div>' : '') +
      '<label class="fl">' + t('اسم المستخدم') + '</label><input class="inp num" id="lg-user" autocomplete="username">' +
      '<label class="fl">' + t('كلمة المرور') + '</label><input class="inp num" id="lg-pass" type="password" autocomplete="current-password">' +
      '<div class="m-actions"><button class="btn block" id="lg-go">' + t('دخول') + '</button></div>' +
      '<div class="demo-accounts"><h4>' + t('حسابات تجريبية — اضغط للتعبئة:') + '</h4>' +
      [['owner', 'owner123', '👁 المالك'], ['rep', 'rep123', '🧑‍💼 ممثل المالك'], ['consultant', 'consult123', '📐 الاستشاري'],
       ['cont-arch', 'cont123', '👷 مقاول معماري'], ['cont-str', 'cont123', '🏗️ مقاول إنشائي'], ['admin', 'admin123', '⚙️ الأدمن']]
        .map(function (a) { return '<span class="demo-chip" data-u="' + a[0] + '" data-p="' + a[1] + '">' + t(a[2]) + '</span>'; }).join('') +
      '</div></div></div>';

    wireLangSwitch(app);
    app.querySelectorAll('.demo-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        document.getElementById('lg-user').value = c.getAttribute('data-u');
        document.getElementById('lg-pass').value = c.getAttribute('data-p');
        doLogin();
      });
    });
    document.getElementById('lg-go').addEventListener('click', doLogin);
    document.getElementById('lg-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  }

  async function doLogin() {
    const u = document.getElementById('lg-user').value.trim();
    const p = document.getElementById('lg-pass').value;
    try {
      await Api.login(u, p);
      await boot();
    } catch (e) { renderLogin(e.message); }
  }

  // ============ الهيكل الرئيسي ============
  async function boot() {
    const user = Api.currentUser();
    if (!user) { renderLogin(); return; }
    let S;
    try { S = await Api.state(); }
    catch (e) { await Api.logout(); renderLogin(e.status === 401 ? null : e.message); return; }

    const myPages = PAGES.filter(function (p) { return p.roles.indexOf(user.role) !== -1; });
    const navPages = myPages.filter(function (p) { return !p.topLink; }); // عناصر القائمة (بلا رابط «كل المشاريع»)
    const projectsPage = myPages.find(function (p) { return p.topLink && p.id === 'projects'; });
    let current = resolveId(location.hash.replace('#', '')) || navPages[0].id;
    if (!myPages.some(function (p) { return p.id === current; })) current = navPages[0].id;

    // ============ تعدد المشاريع: المشروع الحالي وترشيح بياناته ============
    let rawS = S;
    let currentProject = sessionStorage.getItem('bassir-project');
    if (!rawS.projects.some(function (p) { return p.id === currentProject; })) {
      currentProject = rawS.projects[0] ? rawS.projects[0].id : null;
    }

    /** يرشّح اللقطة لبيانات المشروع المحدد (كل عنصر يحمل projectId) */
    function scopedState(full, pid) {
      if (!pid || full.projects.length <= 1) return full;
      const c = {};
      Object.keys(full).forEach(function (k) {
        c[k] = Array.isArray(full[k])
          ? full[k].filter(function (x) { return !x || typeof x !== 'object' || !x.projectId || x.projectId === pid; })
          : full[k];
      });
      c.projects = full.projects.filter(function (p) { return p.id === pid; });
      if (!c.projects.length) c.projects = full.projects;
      return c;
    }

    ctx = {
      U: user,
      S: scopedState(rawS, currentProject),
      Sall: rawS, // اللقطة الكاملة (لصفحات عين المالك، المشاريع، المستخدمين)
      projectId: currentProject,
      nav: function (id) { current = resolveId(id); location.hash = current; draw(); },
      setProject: function (pid) {
        currentProject = pid;
        ctx.projectId = pid;
        sessionStorage.setItem('bassir-project', pid);
        ctx.S = scopedState(rawS, pid);
        draw();
      },
      refresh: async function () {
        rawS = await Api.state();
        ctx.Sall = rawS; ctx.S = scopedState(rawS, currentProject); S = rawS;
        draw();
      },
      refreshSilent: async function () {
        rawS = await Api.state();
        ctx.Sall = rawS; ctx.S = scopedState(rawS, currentProject); S = rawS;
        drawSidebar();
      }
    };

    function sidebarHtml() {
      let html = '<div class="brand"><span class="eye">👁</span><div><b>بصير</b><small>OWNER EYES</small></div></div>';
      html += langSwitchHtml();
      // رابط «كل المشاريع» فوق القائمة كمستوى أعلى، لا كعنصر قائمة (§9-1/14)
      if (projectsPage && rawS.projects.length > 1) {
        html += '<a href="#projects" class="all-projects" data-page="projects">‹ ' + esc(t('كل المشاريع')) + '</a>';
      }
      // حقل بحث سريع في القائمة (§10-9)
      html += '<input class="nav-search" id="nav-q" type="search" placeholder="' + esc(t('بحث في القائمة…')) + '" autocomplete="off">';
      let lastSec = '';
      navPages.forEach(function (p) {
        if (p.sec !== lastSec) { html += '<div class="nav-sec">' + esc(t(p.sec)) + '</div>'; lastSec = p.sec; }
        const badge = p.badge ? p.badge(S) : 0;
        html += '<a href="#' + p.id + '" class="nav-item ' + (current === p.id ? 'active' : '') + '" data-page="' + p.id + '" data-label="' + esc(t(p.title)) + '">' +
          '<span class="ico">' + p.icon + '</span>' + esc(t(p.title)) +
          (badge ? '<span class="badge">' + badge + '</span>' : '') + '</a>';
      });
      html += '<div class="side-user"><div class="who">' + esc(user.name) + '</div>' +
        '<div class="role">' + esc(t(ROLE_NAMES[user.role] || user.role)) + (Api.demo ? ' · ' + t('وضع الديمو') : '') + '</div>' +
        '<button class="btn mutedb sm block" id="btn-logout">' + t('تسجيل الخروج') + '</button>' +
        (Api.demo ? '<button class="btn ghost sm block" id="btn-reset" style="margin-top:8px">' + t('↺ إعادة ضبط بيانات الديمو') + '</button>' : '') +
        '</div>';
      return html;
    }

    function drawSidebar() {
      const sb = app.querySelector('.sidebar');
      if (!sb) return;
      sb.innerHTML = sidebarHtml();
      wireSidebar(sb);
    }

    function wireSidebar(sb) {
      wireLangSwitch(sb);
      sb.querySelectorAll('[data-page]').forEach(function (n) {
        n.addEventListener('click', function (e) {
          // احترام فتح تبويب جديد / نافذة جديدة على الرابط الحقيقي (§10-4)
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          ctx.nav(n.getAttribute('data-page'));
        });
      });
      // بحث سريع يرشّح عناصر القائمة (§10-9)
      const q = sb.querySelector('#nav-q');
      if (q) q.addEventListener('input', function () {
        const term = q.value.trim().toLowerCase();
        sb.querySelectorAll('.nav-item').forEach(function (n) {
          const lbl = (n.getAttribute('data-label') || n.textContent || '').toLowerCase();
          n.style.display = (!term || lbl.indexOf(term) !== -1) ? '' : 'none';
        });
        sb.querySelectorAll('.nav-sec').forEach(function (s) { s.style.display = term ? 'none' : ''; });
      });
      sb.querySelector('#btn-logout').addEventListener('click', async function () {
        await Api.logout(); location.hash = ''; renderLogin();
      });
      const rs = sb.querySelector('#btn-reset');
      if (rs) rs.addEventListener('click', function () {
        Api.resetDemo(); location.reload();
      });
    }

    function draw() {
      const page = myPages.find(function (p) { return p.id === current; }) || myPages[0];
      const P = ctx.S.projects[0];
      // مبدّل المشروع: يظهر عند وجود أكثر من مشروع في نطاق المستخدم
      const projCtl = rawS.projects.length > 1
        ? '<select class="inp" id="proj-switch" style="max-width:280px;padding:8px 12px;font-size:13px">' +
          rawS.projects.map(function (pp) {
            return '<option value="' + pp.id + '"' + (pp.id === currentProject ? ' selected' : '') + '>🏗️ ' + esc(pp.name) + '</option>';
          }).join('') + '</select>'
        : '<span class="proj">🏗️ ' + esc(P ? P.name : '') + ' · ' + esc(P ? P.location || '' : '') + '</span>';

      // جرس الإشعارات: أحداث دورة المراجعة تصل لصاحبها فور تحديث اللقطة
      const notifs = ctx.S.notifications || [];
      const unread = notifs.filter(function (n) { return (n.readBy || []).indexOf(user.id) === -1; }).length;

      app.innerHTML =
        '<div class="app"><aside class="sidebar">' + sidebarHtml() + '</aside>' +
        '<div class="main"><div class="topbar"><h1>' + page.icon + ' ' + esc(t(page.title)) + '</h1>' +
        projCtl +
        '<span class="spacer"></span>' +
        '<button class="bell" id="btn-bell" title="الإشعارات">🔔' +
        (unread ? '<span class="bell-n">' + unread + '</span>' : '') + '</button>' +
        '<span class="small muted num">' + new Date().toLocaleDateString(I18n.locale(), { year: 'numeric', month: 'long', day: 'numeric' }) + '</span>' +
        '</div>' +
        // فتات المسار (§10-5): المشروع ← القسم ← الصفحة
        '<div class="crumbs">' +
        (P ? '<span>🏗️ ' + esc(P.name) + '</span>' : '') +
        (page.sec ? '<span class="crumb-sep">›</span><span>' + esc(t(page.sec)) + '</span>' : '') +
        '<span class="crumb-sep">›</span><span class="crumb-cur">' + esc(t(page.title)) + '</span>' +
        '</div>' +
        '<div class="content" id="page"></div></div></div>';
      wireSidebar(app.querySelector('.sidebar'));
      const ps = app.querySelector('#proj-switch');
      if (ps) ps.addEventListener('change', function () { ctx.setProject(ps.value); });
      app.querySelector('#btn-bell').addEventListener('click', function () { openNotifications(notifs, unread); });
      page.render(document.getElementById('page'), ctx);
    }

    function openNotifications(notifs, unread) {
      const old = document.querySelector('.notif-pop');
      if (old) { old.remove(); return; }
      const pop = document.createElement('div');
      pop.className = 'notif-pop';
      pop.innerHTML =
        '<div class="flex" style="justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border)">' +
        '<b class="small">🔔 الإشعارات' + (unread ? ' <span class="pill p-danger" style="font-size:10px">' + unread + ' جديد</span>' : '') + '</b>' +
        '<div class="flex" style="gap:6px"><button class="btn ghost sm" id="nt-settings">⚙ الإعدادات</button>' +
        '<button class="btn mutedb sm" id="nt-close">✕</button></div></div>' +
        '<div class="notif-list">' +
        (notifs.length ? notifs.map(function (n) {
          const isNew = (n.readBy || []).indexOf(user.id) === -1;
          return '<div class="notif-row' + (isNew ? ' new' : '') + '">' +
            '<div class="small" style="line-height:1.8">' + esc(n.text) + '</div>' +
            '<div class="small muted num">' + esc(n.time || '') + '</div></div>';
        }).join('') : '<div class="empty" style="padding:26px"><div class="e-ico">🔕</div>لا إشعارات بعد</div>') +
        '</div>';
      document.body.appendChild(pop);
      pop.querySelector('#nt-close').addEventListener('click', function () { pop.remove(); });
      pop.querySelector('#nt-settings').addEventListener('click', function () { pop.remove(); openNotifSettings(); });
      // فتح الجرس يعلّم إشعاراتك كمقروءة
      if (unread) {
        Api.notifyRead().then(function () { return ctx.refreshSilent(); }).then(function () {
          const b = app.querySelector('#btn-bell .bell-n');
          if (b) b.remove();
        }).catch(function () { /* تجاهل */ });
      }
    }

    /** إعدادات الإشعارات: بريد وجوال المستخدم وقنوات وصوله (لنفسه) */
    function openNotifSettings() {
      const p = (ctx.S.profile) || { email: '', phone: '', notifyEmail: true, notifyWhatsapp: false };
      const back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML =
        '<div class="modal">' +
        '<h3>⚙ إعدادات الإشعارات</h3>' +
        '<div class="m-sub">تصلك تنبيهات دورة المراجعة داخل النظام، ويمكنك استلامها أيضاً على بريدك أو واتساب.</div>' +
        '<label class="fl">البريد الإلكتروني</label><input class="inp num" id="ns-email" dir="ltr" value="' + esc(p.email || '') + '" placeholder="you@company.com">' +
        '<label class="fl">رقم الجوال (واتساب)</label><input class="inp num" id="ns-phone" dir="ltr" value="' + esc(p.phone || '') + '" placeholder="05xxxxxxxx">' +
        '<label class="fl flex" style="cursor:pointer;margin-top:12px"><input type="checkbox" id="ns-em"' + (p.notifyEmail !== false ? ' checked' : '') + '> 📧 استلام الإشعارات على البريد</label>' +
        '<label class="fl flex" style="cursor:pointer"><input type="checkbox" id="ns-wa"' + (p.notifyWhatsapp ? ' checked' : '') + '> 💬 استلام الإشعارات على واتساب</label>' +
        '<div class="small muted" style="margin-top:8px;line-height:1.8">إن لم تكن قناة البريد/واتساب مهيأة على الخادم، تُسجَّل المحاولة كمحاكاة موثّقة وتظل الإشعارات داخل النظام تعمل دائماً.</div>' +
        '<div class="m-actions"><button class="btn" id="ns-save">حفظ</button><button class="btn mutedb" id="ns-cancel">إلغاء</button></div>' +
        '</div>';
      document.body.appendChild(back);
      back.querySelector('#ns-cancel').addEventListener('click', function () { back.remove(); });
      back.addEventListener('click', function (e) { if (e.target === back) back.remove(); });
      back.querySelector('#ns-save').addEventListener('click', async function () {
        try {
          await Api.updateProfile({
            email: back.querySelector('#ns-email').value,
            phone: back.querySelector('#ns-phone').value,
            notifyEmail: back.querySelector('#ns-em').checked,
            notifyWhatsapp: back.querySelector('#ns-wa').checked
          });
          back.remove();
          VS.toast('✅ حُفظت تفضيلات الإشعارات');
          ctx.refreshSilent();
        } catch (e) { VS.toast(e.message, true); }
      });
    }

    draw();
  }

  window.addEventListener('hashchange', function () {
    if (!ctx) return;
    const id = location.hash.replace('#', '');
    if (id) ctx.nav(id);
  });

  boot();
})();
