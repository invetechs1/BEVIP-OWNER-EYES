/** بصير | التطبيق الرئيسي: الدخول، التوجيه، الهيكل */
(function () {
  'use strict';

  const VS = window.ViewsShared, VR = window.ViewsRoles, VM = window.ViewsModules, VH = window.ViewsHandover;
  const esc = VS.esc;
  const t = I18n.t;

  I18n.registerDict({
    'عين المالك': "Owner's Eye",
    'لوحة القيادة': 'Dashboard',
    'رؤية المشروع': 'Project Vision',
    'كاميرات الموقع': 'Site Cameras',
    'المقاولون والأداء': 'Contractors & Performance',
    'ذكاء بصير الاصطناعي': 'Bassir AI',
    'التقارير والإرسال': 'Reports & Sending',
    'لوحة المقاول': 'Contractor Dashboard',
    'الاعتمادات': 'Approvals',
    'خدمات المكتب الفني': 'Technical Office Services',
    'جداول الكميات': 'Bill of Quantities',
    'إدارة المقاولين': 'Manage Contractors',
    'إعداد التقارير': 'Report Builder',
    'المخططات والنماذج': 'Drawings & Models',
    'المشاريع والاستشاريون': 'Projects & Consultants',
    'المستخدمون والصلاحيات': 'Users & Permissions',
    'سجل النظام': 'System Log',
    'التكامل والإعدادات': 'Integrations & Settings',
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

  const PAGES = [
    { id: 'owner-eye', title: 'عين المالك', icon: '👁', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep'], render: VS.renderOwnerEye },
    { id: 'projects', title: 'لوحة المشاريع', icon: '🗂️', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VM.renderProjectsDash },
    { id: 'dashboard', title: 'لوحة القيادة', icon: '📊', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderDashboard },
    { id: 'vision', title: 'رؤية المشروع', icon: '🗺️', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderVision },
    { id: 'cameras', title: 'كاميرات الموقع', icon: '🎥', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderCameras },
    { id: 'contractors', title: 'المقاولون والأداء', icon: '👷', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderContractors },
    { id: 'ai', title: 'ذكاء بصير الاصطناعي', icon: '🤖', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderAi },
    { id: 'reports', title: 'التقارير والإرسال', icon: '📨', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderReports },
    { id: 'submissions', title: 'تتبع التقديمات', icon: '📋', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VM.renderSubmissions },
    { id: 'variations', title: 'أوامر التغيير', icon: '🔁', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VM.renderVariations },
    { id: 'project-docs', title: 'وثائق المشروع', icon: '📁', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VM.renderProjectDocs },
    { id: 'handover', title: 'التسليم والإغلاق', icon: '🏁', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VH.renderHandover },
    { id: 'archive', title: 'أرشيف المستندات', icon: '📚', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VR.renderArchive },

    { id: 'home', title: 'لوحة المقاول', icon: '🏗️', sec: 'أعمالي', roles: ['contractor'], render: VR.renderContractorHome },
    { id: 'submissions-c', title: 'تتبع تقديماتي', icon: '📋', sec: 'أعمالي', roles: ['contractor'], render: VM.renderSubmissions },
    { id: 'handover-c', title: 'ملاحظاتي وضماناتي', icon: '🏁', sec: 'أعمالي', roles: ['contractor'], render: VH.renderHandover },
    { id: 'archive-c', title: 'أرشيف مستنداتي', icon: '📚', sec: 'أعمالي', roles: ['contractor'], render: VR.renderArchive },

    { id: 'approvals', title: 'الاعتمادات', icon: '✍️', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderApprovals, badge: badgePending },
    { id: 'rfx', title: 'الاستفسارات والعروض RFI/RFP', icon: '📮', sec: 'المكتب الفني', roles: ['admin', 'consultant', 'owner_rep', 'owner'], render: VM.renderRfx, badge: badgeRfx },
    { id: 'tech-office', title: 'خدمات المكتب الفني', icon: '🏛️', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderTechOffice, badge: badgeTech },
    { id: 'boq', title: 'جداول الكميات', icon: '📊', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderBoq },
    { id: 'manage-contractors', title: 'إدارة المقاولين', icon: '🧰', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderManageContractors },
    { id: 'daily', title: 'إعداد التقارير', icon: '📝', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderDailyReport },
    { id: 'phases', title: 'مراحل المشروع', icon: '🗂️', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VH.renderPhases },
    { id: 'bim-upload', title: 'المخططات والنماذج', icon: '🏢', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderBimUpload },
    { id: 'bim', title: 'إدارة BIM', icon: '🧊', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VM.renderBim },
    { id: 'contractor-db', title: 'قاعدة بيانات المقاولين', icon: '🗃️', sec: 'المكتب الفني', roles: ['admin', 'consultant', 'owner_rep'], render: VM.renderContractorDb },

    { id: 'portfolio', title: 'محفظة المشاريع', icon: '📈', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VH.renderPortfolio },
    { id: 'file-server', title: 'خادم الملفات المركزي', icon: '🗄️', sec: 'الإدارة', roles: ['admin', 'consultant', 'owner_rep'], render: VM.renderFileServer },
    { id: 'rep-projects', title: 'المشاريع والاستشاريون', icon: '🗂️', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderRepProjects },
    { id: 'users', title: 'المستخدمون والصلاحيات', icon: '👥', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderUsers },
    { id: 'audit', title: 'سجل النظام', icon: '📜', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderAudit },
    { id: 'system', title: 'التكامل والإعدادات', icon: '⚙️', sec: 'الإدارة', roles: ['admin', 'consultant'], render: VR.renderSystem }
  ];

  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'استشاري المشروع', contractor: 'مقاول'
  };

  function badgePending(S) {
    return ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
  }

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
    let current = location.hash.replace('#', '') || myPages[0].id;
    if (!myPages.some(function (p) { return p.id === current; })) current = myPages[0].id;

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
      nav: function (id) { current = id; location.hash = id; draw(); },
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
      let lastSec = '';
      myPages.forEach(function (p) {
        if (p.sec !== lastSec) { html += '<div class="nav-sec">' + esc(t(p.sec)) + '</div>'; lastSec = p.sec; }
        const badge = p.badge ? p.badge(S) : 0;
        html += '<div class="nav-item ' + (current === p.id ? 'active' : '') + '" data-page="' + p.id + '">' +
          '<span class="ico">' + p.icon + '</span>' + esc(t(p.title)) +
          (badge ? '<span class="badge">' + badge + '</span>' : '') + '</div>';
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
        n.addEventListener('click', function () { ctx.nav(n.getAttribute('data-page')); });
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
        '</div><div class="content" id="page"></div></div></div>';
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
