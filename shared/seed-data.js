/**
 * بصير - عيون المالك | Bassir Owner Eyes
 * بيانات الديمو الأساسية (تعمل في Node.js وفي المتصفح)
 * تُولَّد البيانات بشكل حتمي (deterministic) حتى تتطابق نسخة الخادم مع نسخة الديمو التفاعلي.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.BassirSeed = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // مولد أرقام شبه عشوائي حتمي (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FLOORS = [
    { id: 'B1', name: 'القبو' },
    { id: 'GF', name: 'الدور الأرضي' },
    { id: 'MZ', name: 'الميزانين' },
    { id: 'F1', name: 'الدور الأول' },
    { id: 'F2', name: 'الدور الثاني' },
    { id: 'F3', name: 'الدور الثالث' },
    { id: 'F4', name: 'الدور الرابع' },
    { id: 'RF', name: 'السطح' }
  ];

  const DISCIPLINES = [
    { id: 'structural',    name: 'الأعمال الإنشائية', color: '#8d99ae', icon: '🏗️' },
    { id: 'architectural', name: 'الأعمال المعمارية', color: '#e0a458', icon: '🏛️' },
    { id: 'electrical',    name: 'الأعمال الكهربائية', color: '#ffd166', icon: '⚡' },
    { id: 'hvac',          name: 'أعمال التكييف HVAC', color: '#4cc9f0', icon: '❄️' },
    { id: 'plumbing',      name: 'الأعمال الصحية', color: '#06d6a0', icon: '🚿' },
    { id: 'fire',          name: 'أعمال الحريق', color: '#ef476f', icon: '🧯' },
    { id: 'furniture',     name: 'الفرش والأثاث', color: '#b5838d', icon: '🛋️' }
  ];

  // نسب الإنجاز المستهدفة لكل تخصص في كل دور (تتناقص كلما ارتفعنا)
  const DISC_BASE_PROGRESS = {
    structural:    { B1: 100, GF: 100, MZ: 100, F1: 100, F2: 98, F3: 92, F4: 78, RF: 55 },
    architectural: { B1: 95,  GF: 88,  MZ: 80,  F1: 72,  F2: 55, F3: 35, F4: 15, RF: 5  },
    electrical:    { B1: 85,  GF: 70,  MZ: 62,  F1: 55,  F2: 40, F3: 22, F4: 8,  RF: 0  },
    hvac:          { B1: 80,  GF: 62,  MZ: 55,  F1: 45,  F2: 30, F3: 15, F4: 5,  RF: 10 },
    plumbing:      { B1: 90,  GF: 75,  MZ: 68,  F1: 60,  F2: 45, F3: 28, F4: 12, RF: 20 },
    fire:          { B1: 70,  GF: 50,  MZ: 40,  F1: 30,  F2: 18, F3: 8,  F4: 0,  RF: 0  },
    furniture:     { B1: 0,   GF: 25,  MZ: 15,  F1: 10,  F2: 0,  F3: 0,  F4: 0,  RF: 0  }
  };

  const BOQ_TEMPLATES = {
    structural: [
      ['خرسانة مسلحة للأعمدة', 'م3', 180, 950], ['خرسانة مسلحة للأسقف', 'م3', 420, 880],
      ['حديد تسليح', 'طن', 95, 3200], ['أعمال العزل المائي', 'م2', 600, 45]
    ],
    architectural: [
      ['مباني بلوك أسمنتي', 'م2', 850, 65], ['لياسة داخلية وخارجية', 'م2', 1700, 38],
      ['أعمال الدهانات', 'م2', 1600, 32], ['تركيب رخام وسيراميك', 'م2', 700, 145],
      ['أسقف مستعارة جبسية', 'م2', 550, 85], ['أبواب ونوافذ ألمنيوم', 'عدد', 24, 1850]
    ],
    electrical: [
      ['تمديدات كهربائية رئيسية', 'نقطة', 320, 95], ['لوحات توزيع فرعية', 'عدد', 6, 4500],
      ['إنارة داخلية LED', 'عدد', 180, 120], ['نظام تيار خفيف وشبكات', 'نقطة', 90, 210]
    ],
    hvac: [
      ['وحدات تكييف مركزي', 'عدد', 4, 28000], ['دكتات هواء معزولة', 'م2', 480, 165],
      ['مخارج هواء وجريلات', 'عدد', 85, 240], ['ترموستات وتحكم', 'عدد', 30, 380]
    ],
    plumbing: [
      ['تمديدات تغذية مياه', 'م.ط', 650, 42], ['تمديدات صرف صحي', 'م.ط', 520, 58],
      ['أطقم صحية كاملة', 'عدد', 26, 2400], ['سخانات مركزية', 'عدد', 8, 1900]
    ],
    fire: [
      ['شبكة رشاشات آلية', 'رأس', 260, 185], ['خزائن حريق ومطافئ', 'عدد', 18, 1450],
      ['نظام إنذار حريق', 'نقطة', 140, 260], ['مضخات حريق', 'عدد', 2, 42000]
    ],
    furniture: [
      ['فرش مكاتب إدارية', 'عدد', 40, 3200], ['كنب ومجالس استقبال', 'طقم', 8, 9500],
      ['ستائر ومعلقات', 'م2', 300, 140], ['تجهيزات مطابخ', 'عدد', 6, 14500]
    ]
  };

  function buildSeed() {
    const rand = rng(20260718);
    const db = {};

    // ============ المشروع ============
    db.projects = [{
      id: 'P1',
      name: 'برج بصير التجاري',
      location: 'الرياض - حي الملقا',
      description: 'برج تجاري إداري مكوّن من قبو وأرضي وميزانين وأربعة أدوار متكررة وسطح، بمساحة بناء إجمالية 12,400 م².',
      ownerName: 'م. عبدالله الراشد',
      consultantName: 'دار العمران للاستشارات الهندسية',
      startPlanned: '2025-03-01', endPlanned: '2026-12-31',
      startActual: '2025-03-15', endForecast: '2027-02-15',
      budgetPlanned: 52000000, costActual: 29800000, costPlannedToDate: 27200000,
      progressPlanned: 62, progressActual: 54.5,
      type: 'برج تجاري / إداري',
      dlpStart: '2027-02-15', dlpMonths: 12,
      thresholds: { slaReviewDays: 7, warrantyWarnDays: 90, contractorDelayPct: 3, healthAlertGrade: 'C' },
      floors: FLOORS, disciplines: DISCIPLINES
    }, {
      id: 'P2',
      name: 'فيلا الياسمين السكنية',
      location: 'جدة - حي الشاطئ',
      description: 'فيلا سكنية فاخرة من دورين وملحق وقبو، بمساحة بناء 1,150 م² مع مسبح وحديقة.',
      ownerName: 'م. عبدالله الراشد',
      consultantName: 'دار العمران للاستشارات الهندسية',
      startPlanned: '2025-09-01', endPlanned: '2026-11-30',
      startActual: '2025-09-10', endForecast: '2026-11-20',
      budgetPlanned: 8500000, costActual: 3350000, costPlannedToDate: 3450000,
      progressPlanned: 39, progressActual: 41,
      type: 'فيلا سكنية',
      dlpStart: '2026-12-15', dlpMonths: 12,
      thresholds: { slaReviewDays: 10, warrantyWarnDays: 60, contractorDelayPct: 5, healthAlertGrade: 'B' },
      floors: FLOORS, disciplines: DISCIPLINES
    }];

    // ============ مكتبة المراحل وقوالبها حسب نوع المشروع ============
    // كل مرحلة لها مفتاح ثابت واسم عربي وإنجليزي، تُستخدم في تكوين مراحل المشروع
    db.phaseLibrary = [
      { key: 'design_approvals', ar: 'التصميم واعتمادات الاستشاري', en: 'Design & Consultant Approvals' },
      { key: 'tendering', ar: 'الطرح واختيار المقاول', en: 'Tendering & Contractor Selection' },
      { key: 'mobilization', ar: 'التجهيز وتأسيس الموقع', en: 'Mobilization & Site Setup' },
      { key: 'excavation', ar: 'الحفر والأساسات', en: 'Excavation & Foundations' },
      { key: 'concrete', ar: 'الهيكل الخرساني', en: 'Concrete Structure' },
      { key: 'steel', ar: 'الهيكل المعدني', en: 'Steel Structure (where applicable)' },
      { key: 'blockwork', ar: 'المباني واللياسة', en: 'Blockwork & Plastering' },
      { key: 'waterproofing', ar: 'العزل المائي والحراري والصوتي', en: 'Waterproofing, Thermal & Acoustic Insulation' },
      { key: 'mep', ar: 'الأعمال الكهروميكانيكية MEP', en: 'MEP Works' },
      { key: 'fitout', ar: 'التشطيبات الداخلية', en: 'Interior Fit-Out' },
      { key: 'facades', ar: 'الواجهات والكسوة الخارجية', en: 'Facades & External Cladding' },
      { key: 'external_works', ar: 'الأعمال الخارجية والمواقف', en: 'External Works & Parking Areas' },
      { key: 'landscaping', ar: 'التنسيق والتشجير والهاردسكيب', en: 'Landscaping & Hardscape' },
      { key: 'infrastructure', ar: 'البنية التحتية والخدمات', en: 'Infrastructure & Utilities' },
      { key: 'ffe', ar: 'الفرش والتأثيث FF&E', en: 'FF&E (Furniture, Fixtures & Equipment)' },
      { key: 'testing', ar: 'اختبار وتشغيل الأنظمة', en: 'Systems Testing & Commissioning' },
      { key: 'handover', ar: 'تسليم المشروع', en: 'Project Handover' },
      { key: 'dlp', ar: 'فترة ضمان العيوب DLP', en: 'Defects Liability Period (DLP)' }
    ];
    // قوالب المراحل الافتراضية حسب نوع المشروع (قابلة للتخصيص لكل مشروع)
    db.phaseTemplates = {
      'برج تجاري / إداري': ['design_approvals', 'tendering', 'mobilization', 'excavation', 'concrete', 'blockwork', 'waterproofing', 'mep', 'fitout', 'facades', 'external_works', 'ffe', 'testing', 'handover', 'dlp'],
      'فيلا سكنية': ['design_approvals', 'tendering', 'mobilization', 'excavation', 'concrete', 'blockwork', 'waterproofing', 'mep', 'fitout', 'facades', 'landscaping', 'ffe', 'handover', 'dlp'],
      'مجمع صناعي / مستودعات': ['design_approvals', 'tendering', 'mobilization', 'excavation', 'concrete', 'steel', 'blockwork', 'mep', 'infrastructure', 'external_works', 'testing', 'handover', 'dlp'],
      'default': ['design_approvals', 'tendering', 'mobilization', 'excavation', 'concrete', 'blockwork', 'mep', 'fitout', 'facades', 'testing', 'handover', 'dlp']
    };

    // ============ المقاولون ============
    db.contractors = [
      { id: 'C1', projectId: 'P1', name: 'شركة الإعمار الحديثة', type: 'structural',
        contractValue: 18000000, startDate: '2025-03-15', endDate: '2026-04-30',
        amountReceived: 15300000, plannedProgress: 95, phone: '0501112233',
        address: 'الرياض - طريق الملك فهد - برج الأعمال 12', contactPerson: 'م. فهد العتيبي',
        email: 'info@emaar-hadeetha.sa', crNumber: '1010456789',
        licenses: ['رخصة مقاولات درجة أولى - أبنية', 'عضوية الهيئة السعودية للمقاولين'],
        certifications: ['ISO 9001:2015', 'ISO 45001:2018'],
        legalDocs: [] },
      { id: 'C2', projectId: 'P1', name: 'مؤسسة البناء المعماري', type: 'architectural',
        contractValue: 12000000, startDate: '2025-09-01', endDate: '2026-10-31',
        amountReceived: 8900000, plannedProgress: 60, phone: '0502223344',
        address: 'الرياض - حي العليا - شارع التحلية', contactPerson: 'م. ماجد القحطاني',
        email: 'projects@albinaa-arch.sa', crNumber: '1010334455',
        licenses: ['رخصة مقاولات درجة ثانية - تشطيبات'],
        certifications: ['ISO 9001:2015'],
        legalDocs: [] },
      { id: 'C3', projectId: 'P1', name: 'شركة الطاقة المتحدة', type: 'electrical',
        contractValue: 6500000, startDate: '2025-10-01', endDate: '2026-11-30',
        amountReceived: 2600000, plannedProgress: 50, phone: '0503334455' },
      { id: 'C4', projectId: 'P1', name: 'تكييف الخليج المتقدم', type: 'hvac',
        contractValue: 5000000, startDate: '2025-11-01', endDate: '2026-11-30',
        amountReceived: 2400000, plannedProgress: 55, phone: '0504445566' },
      { id: 'C5', projectId: 'P1', name: 'شركة المياه للأعمال الصحية', type: 'plumbing',
        contractValue: 3200000, startDate: '2025-10-15', endDate: '2026-10-31',
        amountReceived: 1550000, plannedProgress: 58, phone: '0505556677' },
      { id: 'C6', projectId: 'P1', name: 'أنظمة الأمان للحريق', type: 'fire',
        contractValue: 2800000, startDate: '2025-12-01', endDate: '2026-12-15',
        amountReceived: 1300000, plannedProgress: 45, phone: '0506667788' },
      { id: 'C7', projectId: 'P1', name: 'دار الفرش الراقي', type: 'furniture',
        contractValue: 4000000, startDate: '2026-05-01', endDate: '2026-12-20',
        amountReceived: 350000, plannedProgress: 12, phone: '0507778899' },
      // مقاولو المشروع الثاني (فيلا الياسمين)
      { id: 'C10', projectId: 'P2', name: 'مقاولات الشاطئ للإنشاءات', type: 'structural',
        contractValue: 3500000, startDate: '2025-09-10', endDate: '2026-06-30',
        amountReceived: 1400000, plannedProgress: 42, phone: '0508889900',
        address: 'جدة - حي الحمراء', contactPerson: 'م. وليد باناجه', email: 'info@shatea-const.sa',
        crNumber: '4030112233', licenses: ['رخصة مقاولات درجة ثالثة - أبنية'], certifications: ['ISO 9001:2015'], legalDocs: [] },
      { id: 'C11', projectId: 'P2', name: 'لمسات التشطيب الحديثة', type: 'architectural',
        contractValue: 2600000, startDate: '2026-01-01', endDate: '2026-11-15',
        amountReceived: 780000, plannedProgress: 30, phone: '0509990011',
        address: 'جدة - حي السلامة', contactPerson: 'م. ريم الغامدي', email: 'projects@lamsat.sa',
        crNumber: '4030445566', licenses: ['رخصة مقاولات درجة ثالثة - تشطيبات'], certifications: [], legalDocs: [] }
    ];

    // ============ جدول الكميات BOQ (مرتبط بالأدوار والتخصصات) ============
    db.boqItems = [];
    let boqSeq = 1;
    db.contractors.forEach(function (c) {
      const templates = BOQ_TEMPLATES[c.type];
      const baseByFloor = DISC_BASE_PROGRESS[c.type];
      FLOORS.forEach(function (fl, fi) {
        templates.forEach(function (t, ti) {
          // ليس كل بند موجوداً في كل دور
          if (c.type === 'furniture' && (fl.id === 'B1' || fl.id === 'RF')) return;
          if (c.type === 'hvac' && fl.id === 'RF' && ti > 1) return;
          const base = baseByFloor[fl.id];
          const jitter = Math.round((rand() - 0.5) * 12);
          const progress = Math.max(0, Math.min(100, base + jitter));
          const qty = Math.max(1, Math.round(t[2] / FLOORS.length + (rand() - 0.5) * 6));
          db.boqItems.push({
            id: 'BQ' + (boqSeq++),
            projectId: c.projectId || 'P1', contractorId: c.id, discipline: c.type,
            floor: fl.id, zone: ti % 6,
            code: c.type.substring(0, 2).toUpperCase() + '-' + fl.id + '-' + String(ti + 1).padStart(2, '0'),
            description: t[0], unit: t[1], qty: qty, unitPrice: t[3],
            progress: progress,
            status: progress >= 100 ? 'منجز' : progress > 0 ? 'جاري' : 'لم يبدأ'
          });
        });
      });
    });

    // ============ الجدول الزمني (منحنى S: مخطط vs فعلي) ============
    db.scheduleCurve = [
      { projectId: 'P1', month: '2025-03', planned: 2,  actual: 1 },  { projectId: 'P1', month: '2025-05', planned: 8,  actual: 6 },
      { projectId: 'P1', month: '2025-07', planned: 15, actual: 12 }, { projectId: 'P1', month: '2025-09', planned: 24, actual: 20 },
      { projectId: 'P1', month: '2025-11', planned: 33, actual: 28 }, { projectId: 'P1', month: '2026-01', planned: 42, actual: 36 },
      { projectId: 'P1', month: '2026-03', planned: 50, actual: 44 }, { projectId: 'P1', month: '2026-05', planned: 57, actual: 50 },
      { projectId: 'P1', month: '2026-07', planned: 62, actual: 54.5 }, { projectId: 'P1', month: '2026-09', planned: 74, actual: null },
      { projectId: 'P1', month: '2026-11', planned: 88, actual: null }, { projectId: 'P1', month: '2026-12', planned: 100, actual: null }
    ];

    db.scheduleTasks = [
      { projectId: 'P1', id: 'T1', phaseKey: 'design_approvals', name: 'التصميم واعتمادات الاستشاري', startPlanned: '2024-10-01', endPlanned: '2025-01-31', startActual: '2024-10-05', endActual: '2025-02-10', progress: 100 },
      { projectId: 'P1', id: 'T2', phaseKey: 'tendering', name: 'الطرح واختيار المقاول', startPlanned: '2025-01-01', endPlanned: '2025-02-28', startActual: '2025-01-10', endActual: '2025-03-05', progress: 100 },
      { projectId: 'P1', id: 'T3', phaseKey: 'mobilization', name: 'التجهيز وتأسيس الموقع', startPlanned: '2025-02-15', endPlanned: '2025-03-15', startActual: '2025-03-01', endActual: '2025-03-20', progress: 100 },
      { projectId: 'P1', id: 'T4', phaseKey: 'excavation', name: 'الحفر والأساسات', startPlanned: '2025-03-01', endPlanned: '2025-06-15', startActual: '2025-03-15', endActual: '2025-07-01', progress: 100 },
      { projectId: 'P1', id: 'T5', phaseKey: 'concrete', name: 'الهيكل الخرساني', startPlanned: '2025-06-01', endPlanned: '2026-01-31', startActual: '2025-06-20', endActual: '2026-02-28', progress: 100 },
      { projectId: 'P1', id: 'T6', phaseKey: 'blockwork', name: 'المباني واللياسة', startPlanned: '2025-10-01', endPlanned: '2026-06-30', startActual: '2025-10-15', endActual: null, progress: 72 },
      { projectId: 'P1', id: 'T7', phaseKey: 'waterproofing', name: 'العزل المائي والحراري والصوتي', startPlanned: '2026-01-01', endPlanned: '2026-07-31', startActual: '2026-01-20', endActual: null, progress: 55 },
      { projectId: 'P1', id: 'T8', phaseKey: 'mep', name: 'الأعمال الكهروميكانيكية MEP', startPlanned: '2025-11-01', endPlanned: '2026-09-30', startActual: '2025-11-20', endActual: null, progress: 46 },
      { projectId: 'P1', id: 'T9', phaseKey: 'fitout', name: 'التشطيبات الداخلية', startPlanned: '2026-02-01', endPlanned: '2026-10-31', startActual: '2026-03-01', endActual: null, progress: 30 },
      { projectId: 'P1', id: 'T10', phaseKey: 'facades', name: 'الواجهات والكسوة الخارجية', startPlanned: '2026-04-01', endPlanned: '2026-09-30', startActual: '2026-05-01', endActual: null, progress: 18 },
      { projectId: 'P1', id: 'T11', phaseKey: 'external_works', name: 'الأعمال الخارجية والمواقف', startPlanned: '2026-07-01', endPlanned: '2026-11-30', startActual: null, endActual: null, progress: 6 },
      { projectId: 'P1', id: 'T12', phaseKey: 'ffe', name: 'الفرش والتأثيث FF&E', startPlanned: '2026-08-01', endPlanned: '2026-12-15', startActual: null, endActual: null, progress: 4 },
      { projectId: 'P1', id: 'T13', phaseKey: 'testing', name: 'اختبار وتشغيل الأنظمة', startPlanned: '2026-10-01', endPlanned: '2026-12-20', startActual: null, endActual: null, progress: 0 },
      { projectId: 'P1', id: 'T14', phaseKey: 'handover', name: 'تسليم المشروع', startPlanned: '2026-12-01', endPlanned: '2026-12-31', startActual: null, endActual: null, progress: 0 },
      { projectId: 'P1', id: 'T15', phaseKey: 'dlp', name: 'فترة ضمان العيوب DLP', startPlanned: '2027-02-15', endPlanned: '2028-02-15', startActual: null, endActual: null, progress: 0 }
    ];

    // ============ منحنى التكلفة ============
    db.costCurve = [
      { projectId: 'P1', month: '2025-05', planned: 2.5,  actual: 2.1 },  { projectId: 'P1', month: '2025-08', planned: 7.0,  actual: 6.2 },
      { projectId: 'P1', month: '2025-11', planned: 13.5, actual: 12.8 }, { projectId: 'P1', month: '2026-02', planned: 19.0, actual: 19.6 },
      { projectId: 'P1', month: '2026-05', planned: 24.0, actual: 26.3 }, { projectId: 'P1', month: '2026-07', planned: 27.2, actual: 29.8 },
      { projectId: 'P1', month: '2026-10', planned: 38.0, actual: null }, { projectId: 'P1', month: '2026-12', planned: 52.0, actual: null }
    ];

    // ============ المستخدمون ============
    db.users = [
      { id: 'U1', username: 'admin',      password: 'admin123',   name: 'مدير النظام',                    role: 'admin', email: 'admin@bassir.app', phone: '0500000001', notifyEmail: true, notifyWhatsapp: false },
      { id: 'U2', username: 'owner',      password: 'owner123',   name: 'م. عبدالله الراشد',              role: 'owner', projectIds: ['P1'], email: 'owner@bassir.app', phone: '0500000002', notifyEmail: true, notifyWhatsapp: true },
      { id: 'U3', username: 'rep',        password: 'rep123',     name: 'م. سالم الحربي (ممثل المالك)',   role: 'owner_rep', email: 'rep@bassir.app', phone: '0500000003', notifyEmail: true, notifyWhatsapp: false },
      { id: 'U4', username: 'consultant', password: 'consult123', name: 'م. خالد العمران (الاستشاري)',    role: 'consultant', email: 'consultant@bassir.app', phone: '0500000004', notifyEmail: true, notifyWhatsapp: true },
      { id: 'U5', username: 'cont-str',   password: 'cont123',    name: 'شركة الإعمار الحديثة',           role: 'contractor', contractorId: 'C1', email: 'str@bassir.app', phone: '0500000005', notifyEmail: true, notifyWhatsapp: true },
      { id: 'U6', username: 'cont-arch',  password: 'cont123',    name: 'مؤسسة البناء المعماري',          role: 'contractor', contractorId: 'C2', email: 'arch@bassir.app', phone: '0500000006', notifyEmail: true, notifyWhatsapp: true },
      { id: 'U7', username: 'cont-elec',  password: 'cont123',    name: 'شركة الطاقة المتحدة',            role: 'contractor', contractorId: 'C3', email: 'elec@bassir.app', phone: '0500000007', notifyEmail: true, notifyWhatsapp: false }
    ];

    // ============ اعتمادات المخططات (Shop Drawings) ============
    db.shopDrawings = [
      { id: 'SD1', projectId: 'P1', contractorId: 'C2', ref: 'SD-ARC-014', title: 'مخطط تفاصيل الواجهة الشمالية', date: '2026-07-02', status: 'pending', notes: '', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' } },
      { id: 'SD2', projectId: 'P1', contractorId: 'C3', ref: 'SD-ELE-009', title: 'مخطط لوحات التوزيع - الدور الثاني', date: '2026-07-05', status: 'pending', notes: '', file: { name: 'A-305-section.pdf', url: '/vendor/sample/A-305-section.pdf' } },
      { id: 'SD3', projectId: 'P1', contractorId: 'C2', ref: 'SD-ARC-012', title: 'تفاصيل الأسقف المستعارة - الأرضي', date: '2026-06-20', status: 'approved', notes: 'اعتمد مع الالتزام بمناسيب التكييف', signature: 'م. خالد العمران', signDate: '2026-06-24', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' } },
      { id: 'SD4', projectId: 'P1', contractorId: 'C4', ref: 'SD-HVC-006', title: 'مسارات الدكتات - الميزانين', date: '2026-06-15', status: 'rejected', notes: 'تعارض مع كمرة ساقطة محور 5-C، يعاد التنسيق', signature: 'م. خالد العمران', signDate: '2026-06-18', file: { name: 'A-305-section.pdf', url: '/vendor/sample/A-305-section.pdf' },
        markupBy: 'م. خالد العمران', markupDate: '2026-06-18',
        annotations: [
          { type: 'rect', from: [0.3, 0.3], to: [0.62, 0.55], color: '#ff3b30' },
          { type: 'arrow', from: [0.75, 0.22], to: [0.6, 0.36], color: '#ff3b30' },
          { type: 'pin', at: [0.46, 0.42], n: 1, text: 'الدكت يتعارض مع الكمرة الساقطة محور 5-C — يخفض المنسوب 15سم', color: '#ffcc00' },
          { type: 'text', at: [0.64, 0.2], text: 'يعدل المسار', color: '#ff3b30' }
        ] },
      { id: 'SD5', projectId: 'P1', contractorId: 'C1', ref: 'SD-STR-021', title: 'تفاصيل خزان المياه العلوي', date: '2026-06-28', status: 'approved_notes', notes: 'اعتمد مع ملاحظات: زيادة سماكة العزل', signature: 'م. خالد العمران', signDate: '2026-07-01', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' } }
    ];

    // ============ اعتمادات المواد (Material Submittals) ============
    db.materials = [
      { id: 'MT1', projectId: 'P1', contractorId: 'C2', ref: 'MS-ARC-031', title: 'رخام أرضيات البهو الرئيسي', brand: 'Carrara - إيطالي', date: '2026-07-08', status: 'pending', notes: '', file: 'datasheet-marble.pdf' },
      { id: 'MT2', projectId: 'P1', contractorId: 'C3', ref: 'MS-ELE-018', title: 'كابلات نحاس مقاومة للحريق', brand: 'الرياض للكابلات', date: '2026-07-06', status: 'pending', notes: '', file: 'datasheet-cables.pdf' },
      { id: 'MT3', projectId: 'P1', contractorId: 'C4', ref: 'MS-HVC-011', title: 'وحدات تكييف VRF', brand: 'Daikin', date: '2026-06-22', status: 'approved', notes: 'مطابق للمواصفات', signature: 'م. خالد العمران', signDate: '2026-06-25', file: 'datasheet-vrf.pdf' },
      { id: 'MT4', projectId: 'P1', contractorId: 'C6', ref: 'MS-FIR-004', title: 'رؤوس رشاشات آلية', brand: 'Tyco', date: '2026-06-18', status: 'rejected', notes: 'الشهادة UL منتهية، يرفق إصدار محدث', signature: 'م. خالد العمران', signDate: '2026-06-21', file: 'datasheet-sprinkler.pdf' }
    ];

    // ============ اعتماد الجداول الزمنية ============
    db.scheduleSubmittals = [
      { id: 'SC1', projectId: 'P1', contractorId: 'C2', ref: 'SCH-ARC-R3', title: 'الجدول الزمني المحدّث - أعمال التشطيبات (مراجعة 3)', date: '2026-07-01', status: 'pending', notes: '', file: 'schedule-arc-r3.xml' },
      { id: 'SC2', projectId: 'P1', contractorId: 'C7', ref: 'SCH-FUR-R1', title: 'الجدول الزمني المبدئي - أعمال الفرش', date: '2026-06-25', status: 'approved', notes: 'اعتمد مع ربط البدء بجاهزية التشطيبات', signature: 'م. خالد العمران', signDate: '2026-06-28', file: 'schedule-fur-r1.xml' }
    ];

    // ============ طلبات استلام الأعمال (WIR) ============
    db.wirs = [
      { id: 'WIR1', projectId: 'P1', contractorId: 'C2', ref: 'WIR-ARC-087', title: 'استلام لياسة الدور الأول - الجناح الشرقي', date: '2026-07-10', status: 'pending', notes: '', location: 'F1' },
      { id: 'WIR2', projectId: 'P1', contractorId: 'C5', ref: 'WIR-PLB-042', title: 'استلام تمديدات الصرف - الدور الثاني', date: '2026-07-09', status: 'pending', notes: '', location: 'F2' },
      { id: 'WIR3', projectId: 'P1', contractorId: 'C1', ref: 'WIR-STR-134', title: 'استلام خرسانة سقف الدور الرابع', date: '2026-06-30', status: 'approved', notes: 'استلمت الأعمال - نتائج الكسر مطابقة', signature: 'م. خالد العمران', signDate: '2026-07-02', location: 'F4' },
      { id: 'WIR4', projectId: 'P1', contractorId: 'C3', ref: 'WIR-ELE-055', title: 'استلام تمديدات الدور الثالث', date: '2026-06-26', status: 'approved_notes', notes: 'قبول مع ملاحظات: استكمال تثبيت العلب في المحور B', signature: 'م. خالد العمران', signDate: '2026-06-29', location: 'F3' },
      { id: 'WIR5', projectId: 'P1', contractorId: 'C4', ref: 'WIR-HVC-019', title: 'استلام دكتات الميزانين', date: '2026-06-20', status: 'rejected', notes: 'مرفوض: العزل غير مكتمل والتعليق غير مطابق', signature: 'م. خالد العمران', signDate: '2026-06-23', location: 'MZ' }
    ];

    // ============ أوامر التغيير ============
    db.changeOrders = [
      { id: 'CO1', projectId: 'P1', contractorId: 'C2', ref: 'CO-ARC-05', title: 'تغيير رخام الواجهة إلى حجر طبيعي', amount: 380000, days: 15, date: '2026-07-04', status: 'pending', notes: '' },
      { id: 'CO2', projectId: 'P1', contractorId: 'C3', ref: 'CO-ELE-03', title: 'إضافة نقاط شواحن سيارات كهربائية بالقبو', amount: 145000, days: 10, date: '2026-06-27', status: 'approved', notes: 'معتمد ضمن ميزانية الاحتياطي', signature: 'م. خالد العمران', signDate: '2026-07-01' },
      { id: 'CO3', projectId: 'P1', contractorId: 'C4', ref: 'CO-HVC-02', title: 'رفع سعة تكييف قاعة الاجتماعات', amount: 95000, days: 7, date: '2026-06-15', status: 'rejected', notes: 'الحمل الحراري الحالي كافٍ وفق الدراسة', signature: 'م. خالد العمران', signDate: '2026-06-19' }
    ];

    // ============ المستخلصات ============
    db.payments = [
      { id: 'PC1', projectId: 'P1', contractorId: 'C1', ref: 'IPC-STR-11', title: 'المستخلص رقم 11 - أعمال الهيكل (سقف السطح)', amount: 1250000, date: '2026-07-06', status: 'pending', notes: '',
        lines: [
          { boqItemId: 'BQ29', progress: 100 }, { boqItemId: 'BQ30', progress: 95 },
          { boqItemId: 'BQ31', progress: 100 }, { boqItemId: 'BQ32', progress: 90 }
        ] },
      { id: 'PC2', projectId: 'P1', contractorId: 'C2', ref: 'IPC-ARC-07', title: 'المستخلص رقم 7 - تشطيبات الدور الثاني', amount: 980000, date: '2026-07-08', status: 'pending', notes: '',
        lines: [
          { boqItemId: 'BQ57', progress: 100 }, { boqItemId: 'BQ58', progress: 90 },
          { boqItemId: 'BQ59', progress: 85 }, { boqItemId: 'BQ60', progress: 95 }
        ] },
      { id: 'PC3', projectId: 'P1', contractorId: 'C3', ref: 'IPC-ELE-04', title: 'المستخلص رقم 4 - الأعمال الكهربائية', amount: 620000, date: '2026-06-20', status: 'approved', notes: 'صرف بعد خصم الدفعة المقدمة', signature: 'م. خالد العمران', signDate: '2026-06-24', lines: [] }
    ];

    // ============ التقارير اليومية والشهرية ============
    db.dailyReports = [
      { id: 'DR1', projectId: 'P1', date: '2026-07-16', weather: 'مشمس 41°', manpower: 186, equipment: 'رافعة برجية 2، بوبكات 3، خلاطة 1',
        works: ['صب خرسانة سقف السطح - المرحلة الثانية', 'لياسة الدور الثاني - الجناح الغربي', 'تمديدات كهرباء الدور الثالث', 'تركيب دكتات الدور الأول'],
        photos: ['ph-f4-slab.jpg', 'ph-f2-plaster.jpg', 'ph-f3-elec.jpg'], by: 'م. خالد العمران' },
      { id: 'DR2', projectId: 'P1', date: '2026-07-15', weather: 'مشمس 40°', manpower: 172, equipment: 'رافعة برجية 2، بوبكات 2',
        works: ['تجهيز حديد سقف السطح', 'تركيب رخام البهو الرئيسي', 'اختبار ضغط شبكة الحريق - القبو'],
        photos: ['ph-rf-steel.jpg', 'ph-gf-marble.jpg'], by: 'م. خالد العمران' },
      { id: 'DR3', projectId: 'P1', date: '2026-07-14', weather: 'غائم جزئياً 38°', manpower: 165, equipment: 'رافعة برجية 2',
        works: ['أعمال عزل السطح', 'دهانات الوجه الأول - الدور الأول', 'تركيب أطقم صحية - الأرضي'],
        photos: ['ph-rf-insul.jpg', 'ph-f1-paint.jpg'], by: 'م. خالد العمران' }
    ];

    db.monthlyReports = [
      { id: 'MR1', projectId: 'P1', month: '2026-06', title: 'التقرير الشهري - يونيو 2026',
        summary: 'بلغت نسبة الإنجاز الفعلية 52.8% مقابل 60% مخطط. أبرز المعوقات: تأخر توريد وحدات التكييف وإعادة تقديم مخططات الدكتات. تمت معالجة 14 طلب اعتماد مواد و22 طلب استلام أعمال.',
        progressPlanned: 60, progressActual: 52.8, by: 'م. خالد العمران' },
      { id: 'MR2', projectId: 'P1', month: '2026-05', title: 'التقرير الشهري - مايو 2026',
        summary: 'نسبة الإنجاز 50% فعلي مقابل 57% مخطط. اكتمال الهيكل حتى الدور الرابع وبدء التشطيبات في الأدوار السفلية.',
        progressPlanned: 57, progressActual: 50, by: 'م. خالد العمران' }
    ];

    // ============ رؤى الذكاء الاصطناعي ============
    db.aiInsights = [
      { projectId: 'P1', id: 'AI1', date: '2026-07-16', source: 'camera', area: 'الدور الرابع - سقف', detected: 78, reported: 78,
        note: 'تحليل بث الكاميرا رقم 3: صب السقف مكتمل بنسبة 78% ويطابق تقرير الموقع.', severity: 'ok' },
      { projectId: 'P1', id: 'AI2', date: '2026-07-15', source: 'photos', area: 'الدور الثاني - لياسة', detected: 49, reported: 55,
        note: 'رصد النظام فرقاً 6% بين نسبة اللياسة المرصودة بصرياً (49%) والنسبة المرفوعة في التقرير (55%). يُنصح بالتحقق ميدانياً قبل اعتماد المستخلص القادم.', severity: 'warn' },
      { projectId: 'P1', id: 'AI3', date: '2026-07-14', source: 'camera', area: 'الميزانين - دكتات التكييف', detected: 38, reported: 40,
        note: 'وتيرة تقدم أعمال الدكتات أبطأ من المخطط بـ 12 يوماً. عند استمرار الوتيرة الحالية سيتأخر تسليم الميزانين إلى نوفمبر.', severity: 'warn' },
      { projectId: 'P1', id: 'AI4', date: '2026-07-12', source: 'photos', area: 'القبو - غرفة المضخات', detected: 70, reported: 70,
        note: 'تركيب مضخات الحريق يسير وفق الجدول. يُنصح بجدولة اختبار التشغيل خلال أسبوعين.', severity: 'ok' },
      { projectId: 'P1', id: 'AI5', date: '2026-07-10', source: 'camera', area: 'الموقع العام', detected: null, reported: null,
        note: 'تنبيه سلامة: رصدت الكاميرا 2 عمالة دون أحزمة أمان على حافة الدور الثالث يوم 10 يوليو الساعة 10:42 صباحاً. تم إشعار مدير السلامة.', severity: 'alert', kind: 'safety', cameraId: 'CAM2', assignedTo: 'C1', incidentId: 'INC1' },
      { projectId: 'P1', id: 'AI6', date: '2026-07-08', source: 'analysis', area: 'مالي', detected: null, reported: null,
        note: 'تنبيه مالي: مقاول الحريق (أنظمة الأمان) استلم 46% من قيمة العقد مقابل إنجاز فعلي 31%. يُنصح بمراجعة الدفعات القادمة وربطها بمستخلصات موثقة بصرياً.', severity: 'alert', kind: 'financial', assignedTo: '' }
    ];

    // ============ صور الموقع (مع تحليل AI محاكى) ============
    db.photos = [
      { projectId: 'P1', id: 'PH1', date: '2026-07-16', area: 'F4', title: 'صب سقف الدور الرابع', ai: 'خرسانة حديثة الصب - اكتشاف 4 عمال، معدات صب مكتملة', detected: 78 },
      { projectId: 'P1', id: 'PH2', date: '2026-07-15', area: 'GF', title: 'رخام البهو الرئيسي', ai: 'تقدم التبليط 62% من مساحة البهو', detected: 62 },
      { projectId: 'P1', id: 'PH3', date: '2026-07-14', area: 'F2', title: 'لياسة الجناح الغربي', ai: 'اللياسة المنجزة 49% من مساحة الجدران المرصودة', detected: 49 },
      { projectId: 'P1', id: 'PH4', date: '2026-07-12', area: 'B1', title: 'غرفة مضخات الحريق', ai: 'مضختان مركبتان - التوصيلات 70%', detected: 70 }
    ];

    // ============ موديول المكتب الفني ============

    // الاستفسارات الفنية RFI
    db.rfis = [
      { id: 'RFI1', projectId: 'P1', contractorId: 'C2', ref: 'RFI-ARC-021', title: 'منسوب رخام البهو عند المدخل الرئيسي',
        question: 'المخطط المعماري A-102 يظهر منسوب تشطيب +0.15 بينما المقطع A-305 يظهر +0.10. أيهما المعتمد؟',
        date: '2026-07-12', status: 'open', answer: '', discipline: 'architectural' },
      { id: 'RFI2', projectId: 'P1', contractorId: 'C3', ref: 'RFI-ELE-014', title: 'مسار الكابل الرئيسي أسفل الرامب',
        question: 'يوجد تعارض بين مسار الكابل الرئيسي وخط الصرف في القبو محور 3-B. نرجو تحديد المسار البديل.',
        date: '2026-07-08', status: 'answered', answer: 'يُحوَّل المسار إلى حامل كابلات معلق أسفل السقف مع الحفاظ على بعد 30سم عن خط الصرف. مرفق سكتش SK-E-09.',
        signature: 'م. خالد العمران', signDate: '2026-07-10', discipline: 'electrical' },
      { id: 'RFI3', projectId: 'P1', contractorId: 'C1', ref: 'RFI-STR-033', title: 'تفصيلة تسليح فتحة المنور بسقف الرابع',
        question: 'نرجو تزويدنا بتفصيلة التسليح الإضافي حول فتحة المنور المستحدثة بأمر التغيير CO-ARC-05.',
        date: '2026-07-05', status: 'answered', answer: 'اعتمدوا تفصيلة التقوية النمطية TD-12 مع أسياخ إضافية 4T16 على كل جانب.',
        signature: 'م. خالد العمران', signDate: '2026-07-07', discipline: 'structural' }
    ];

    // طلبات العروض RFP (توجه للاستشاري أو المالك)
    db.rfps = [
      { id: 'RFP1', projectId: 'P1', contractorId: 'C2', ref: 'RFP-ARC-002', title: 'عرض بديل لنظام واجهات زجاجية موفرة للطاقة',
        question: 'نرفق عرضاً فنياً ومالياً لنظام واجهات Low-E يخفض الحمل الحراري 22% بفارق سعري 4%. نرجو الدراسة.',
        to: 'owner', date: '2026-07-10', status: 'open', answer: '' },
      { id: 'RFP2', projectId: 'P1', contractorId: 'C7', ref: 'RFP-FUR-001', title: 'عرض توريد أثاث مكتبي بديل (مصنع محلي)',
        question: 'عرض بديل بضمان 5 سنوات وتوفير 12% عن المواصفة الأصلية مع مطابقة كاملة.',
        to: 'consultant', date: '2026-07-05', status: 'answered',
        answer: 'قُبل مبدئياً — يقدم نموذج Mockup للاعتماد النهائي قبل التوريد.',
        signature: 'م. خالد العمران', signDate: '2026-07-08' }
    ];

    // نماذج BIM المرفوعة (سحابي أو من الجهاز)
    db.bimModels = [
      { id: 'BM1', projectId: 'P1', name: 'BassirTower_Rev03.ifc', rev: 'Rev-03', discipline: 'federated',
        source: 'cloud', url: 'https://acc.autodesk.com/models/bassir-tower-rev03', size: 486000000,
        date: '2026-06-12', by: 'دار العمران للاستشارات', linkedBoq: true },
      { id: 'BM2', projectId: 'P1', name: 'BassirTower.ifc', rev: 'Rev-04', discipline: 'federated',
        source: 'device', url: '/vendor/bim/BassirTower.ifc', size: 152568,
        date: '2026-07-01', by: 'دار العمران للاستشارات', linkedBoq: true }
    ];

    // وثائق BIM (خطة تنفيذ BIM كمثال)
    db.bimDocs = [
      { id: 'BD1', projectId: 'P1', kind: 'bep', title: 'خطة تنفيذ الـBIM - برج بصير التجاري', rev: 'R2',
        date: '2026-05-01', by: 'دار العمران للاستشارات', status: 'approved',
        sections: {
          'أهداف الـBIM': 'التنسيق بين التخصصات، اكتشاف التعارضات قبل التنفيذ، استخراج الكميات، وربط النموذج بالجدول الزمني (4D) والتكلفة (5D).',
          'الأدوار والمسؤوليات': 'مدير BIM: دار العمران. منسق نماذج لكل مقاول. اجتماع تنسيق نماذج أسبوعي.',
          'معايير النمذجة': 'LOD 350 للتنفيذ، تسمية الملفات وفق ISO 19650، وحدة المتر، نقطة أصل موحدة.',
          'بيئة البيانات المشتركة CDE': 'نظام بصير هو الـCDE المعتمد: الرفع والاعتماد والأرشفة والتكويد.',
          'جدول تسليم النماذج': 'معماري وإنشائي: محدث كل أسبوعين. MEP: أسبوعياً أثناء التنسيق.'
        } },
      { id: 'BD2', projectId: 'P1', kind: 'midp', title: 'خطة تسليم المعلومات الرئيسية MIDP - برج بصير', rev: 'R1',
        date: '2026-06-20', by: 'دار العمران للاستشارات', status: 'pending',
        sections: {
          'قائمة التسليمات': 'نموذج معماري وإنشائي (IFC)، نماذج MEP منسقة، مخططات تنفيذية PDF، وجداول كميات مستخرجة.',
          'مواعيد التسليم': 'نهاية كل مرحلة إنشائية + تسليم نهائي As-Built قبل الاستلام الابتدائي بـ30 يوماً.',
          'مستويات المعلومات': 'LOD 350 أثناء التنفيذ، LOD 500 للتسليم النهائي مع بيانات الأصول.',
          'المسؤوليات': 'يُعِد: منسقو النماذج. يراجع: مدير BIM. يعتمد: استشاري المشروع عبر نظام بصير.'
        } }
    ];

    // خادم الملفات المركزي: وثائق المشروع التأسيسية بالفئات
    db.files = [
      { id: 'FL1', projectId: 'P1', name: 'Bassir-Main-Contract-2025.pdf', url: '', size: 4200000,
        category: 'العقود', by: 'م. سعود الجاسر', date: '2025-08-20', versions: [] },
      { id: 'FL2', projectId: 'P1', name: 'Bassir-BOQ-Master-Rev2.xlsx', url: '', size: 1850000,
        category: 'جداول الكميات BOQ', by: 'دار العمران للاستشارات', date: '2026-01-15',
        versions: [{ v: 1, name: 'Bassir-BOQ-Master-Rev1.xlsx', url: '', size: 1720000, by: 'دار العمران للاستشارات', date: '2025-09-10' }] },
      { id: 'FL3', projectId: 'P1', name: 'Bassir-IFC-Structural-Set.dwg', url: '', size: 96000000,
        category: 'مخططات IFC', by: 'دار العمران للاستشارات', date: '2026-02-02', versions: [] },
      { id: 'FL4', projectId: 'P1', name: 'Bassir-Technical-Specifications.pdf', url: '', size: 12400000,
        category: 'المواصفات', by: 'دار العمران للاستشارات', date: '2025-10-05', versions: [] },
      { id: 'FL5', projectId: 'P1', name: 'Owner-Requirements-Brief.pdf', url: '', size: 2100000,
        category: 'متطلبات المالك', by: 'م. سعود الجاسر', date: '2025-07-30', versions: [] }
    ];

    // ============ وحدة التسليم والإغلاق (Handover) ============
    // قائمة التسليم التفاعلية: مستندات وتصاريح ومتطلبات — لكل بند حالة قابلة للتحديث
    db.handoverItems = [
      // المستندات والتسليمات
      { id: 'HI1', projectId: 'P1', group: 'docs', title: 'شهادة التسليم الابتدائي', en: 'Preliminary Handover Certificate', status: 'in_progress', responsible: 'الاستشاري', file: null, notes: 'بانتظار إغلاق ملاحظات التسليم الحرجة', date: '2026-11-01' },
      { id: 'HI2', projectId: 'P1', group: 'docs', title: 'شهادة التسليم النهائي', en: 'Final Handover Certificate', status: 'pending', responsible: 'الاستشاري', file: null, notes: '', date: '' },
      { id: 'HI3', projectId: 'P1', group: 'docs', title: 'قائمة الملاحظات مع تتبع الإغلاق', en: 'Punch List with closure tracking', status: 'in_progress', responsible: 'الاستشاري', file: null, notes: 'انظر لوحة قائمة الملاحظات', date: '2026-10-20' },
      { id: 'HI4', projectId: 'P1', group: 'docs', title: 'شهادات اختبار وتشغيل الأنظمة', en: 'Testing & Commissioning Certificates', status: 'in_progress', responsible: 'المقاول', file: null, notes: 'أُنجزت أنظمة الحريق والكهرباء، بانتظار التكييف', date: '2026-10-15' },
      { id: 'HI5', projectId: 'P1', group: 'docs', title: 'كتيبات التشغيل والصيانة (O&M)', en: 'Operation & Maintenance Manuals', status: 'pending', responsible: 'المقاول', file: null, notes: '', date: '' },
      { id: 'HI6', projectId: 'P1', group: 'docs', title: 'مخططات كما نُفِّذ (As-Built)', en: 'As-Built Drawings', status: 'in_progress', responsible: 'المقاول', file: null, notes: 'تسليم 60% من الحزم', date: '2026-10-10' },
      { id: 'HI7', projectId: 'P1', group: 'docs', title: 'شهادات ضمان الموردين والمقاولين من الباطن', en: 'Supplier & Subcontractor Warranties', status: 'in_progress', responsible: 'المقاول', file: null, notes: 'انظر سجل الضمانات', date: '2026-10-05' },
      { id: 'HI8', projectId: 'P1', group: 'docs', title: 'تقرير الفحص النهائي للاستشاري', en: 'Consultant Final Inspection Report', status: 'pending', responsible: 'الاستشاري', file: null, notes: '', date: '' },
      // المتطلبات النظامية والتشغيلية
      { id: 'HI9', projectId: 'P1', group: 'regulatory', title: 'شهادة إتمام البناء (الأمانة/البلدية)', en: 'Municipality Building Completion Certificate', status: 'pending', responsible: 'الاستشاري', file: null, notes: 'مرتبطة بإغلاق ملاحظات الأمانة', date: '' },
      { id: 'HI10', projectId: 'P1', group: 'regulatory', title: 'موافقة الدفاع المدني', en: 'Civil Defense Approval', status: 'in_progress', responsible: 'المقاول', file: null, notes: 'تمت المعاينة الأولى، ملاحظتان مفتوحتان', date: '2026-10-18' },
      { id: 'HI11', projectId: 'P1', group: 'regulatory', title: 'موافقة الشركة السعودية للكهرباء (SEC)', en: 'Saudi Electricity Company (SEC) Approval', status: 'in_progress', responsible: 'المقاول', file: null, notes: 'اعتماد المحطة قيد المراجعة', date: '2026-10-12' },
      { id: 'HI12', projectId: 'P1', group: 'regulatory', title: 'شهادة الإشغال', en: 'Occupancy Certificate', status: 'pending', responsible: 'الاستشاري', file: null, notes: '', date: '' },
      { id: 'HI13', projectId: 'P1', group: 'regulatory', title: 'سجل تسليم المفاتيح', en: 'Keys Handover Log', status: 'in_progress', responsible: 'المالك', file: null, notes: 'انظر سجل المفاتيح', date: '2026-11-05' }
    ];

    // قائمة الملاحظات (Punch List) — مرتبطة بالمقاول المسؤول مع تتبع الإغلاق
    db.punchList = [
      { id: 'PL1', projectId: 'P1', contractorId: 'C2', ref: 'PL-ARC-001', title: 'خدش بواجهة الجرانيت — البهو الرئيسي', location: 'GF', severity: 'minor', status: 'open', raisedDate: '2026-10-10', closedDate: null, notes: '' },
      { id: 'PL2', projectId: 'P1', contractorId: 'C2', ref: 'PL-ARC-002', title: 'فرق منسوب بلاط الممر — الدور الثاني', location: 'F2', severity: 'major', status: 'open', raisedDate: '2026-10-12', closedDate: null, notes: 'يتطلب إعادة تنفيذ جزئية' },
      { id: 'PL3', projectId: 'P1', contractorId: 'C4', ref: 'PL-HVC-001', title: 'تسريب هواء عند وصلة دكت — الميزانين', location: 'MEZ', severity: 'major', status: 'closed', raisedDate: '2026-09-28', closedDate: '2026-10-14', notes: 'أُعيد إحكام الوصلة وأُعيد الاختبار' },
      { id: 'PL4', projectId: 'P1', contractorId: 'C3', ref: 'PL-ELE-001', title: 'لوحة إنارة طوارئ غير مبرمجة — الدور الأول', location: 'F1', severity: 'minor', status: 'open', raisedDate: '2026-10-15', closedDate: null, notes: '' },
      { id: 'PL5', projectId: 'P1', contractorId: 'C1', ref: 'PL-STR-001', title: 'تعشيش خرساني ظاهر — سلم الطوارئ', location: 'B1', severity: 'minor', status: 'closed', raisedDate: '2026-09-20', closedDate: '2026-10-02', notes: 'مُعالج بمونة إصلاح معتمدة' }
    ];

    // سجل الضمانات مع تواريخ الانتهاء (تنبيهات قرب الانتهاء)
    db.warranties = [
      { id: 'WR1', projectId: 'P1', contractorId: 'C4', item: 'مصاعد شركة أوتيس (4 مصاعد)', supplier: 'أوتيس العربية', startDate: '2026-09-01', endDate: '2028-09-01', months: 24, docCode: '', file: null },
      { id: 'WR2', projectId: 'P1', contractorId: 'C4', item: 'وحدات التكييف المركزي (شيلر)', supplier: 'كاريير', startDate: '2026-08-15', endDate: '2027-08-15', months: 12, docCode: '', file: null },
      { id: 'WR3', projectId: 'P1', contractorId: 'C3', item: 'مولد الطوارئ 800 كيلو', supplier: 'كاتربيلر', startDate: '2026-07-01', endDate: '2027-01-01', months: 6, docCode: '', file: null },
      { id: 'WR4', projectId: 'P1', contractorId: 'C2', item: 'العزل المائي للأسطح', supplier: 'سيكا', startDate: '2026-06-01', endDate: '2031-06-01', months: 60, docCode: '', file: null },
      { id: 'WR5', projectId: 'P1', contractorId: 'C5', item: 'نظام إنذار وإطفاء الحريق', supplier: 'أنظمة الأمان المتحدة', startDate: '2026-08-20', endDate: '2027-08-20', months: 12, docCode: '', file: null }
    ];

    // سجل تسليم المفاتيح
    db.keysLog = [
      { id: 'KL1', projectId: 'P1', area: 'مدخل الطابق الأرضي الرئيسي', count: 4, handedTo: 'إدارة تشغيل المبنى', by: 'المقاول', date: '2026-11-05', signature: 'م. عبدالله الراشد' },
      { id: 'KL2', projectId: 'P1', area: 'غرف الكهرباء والميكانيكا', count: 12, handedTo: 'فريق الصيانة', by: 'المقاول', date: '', signature: '' }
    ];

    // تقارير الحوادث/السلامة (قابلة للأرشفة والطباعة) — مرتبطة بتنبيهات الكاميرات
    db.incidents = [
      { id: 'INC1', projectId: 'P1', ref: 'INC-2026-014', title: 'عمالة دون أحزمة أمان على حافة الدور الثالث', kind: 'violation', severity: 'high',
        source: 'camera', cameraId: 'CAM2', location: 'الدور الثالث - الحافة الشمالية', date: '2026-07-10', time: '10:42',
        assignedTo: 'C1', status: 'open', action: 'إيقاف العمل بالمنطقة وإشعار مدير السلامة، وإعادة تدريب على العمل بالمرتفعات', by: 'نظام بصير' }
    ];

    // التدفق النقدي المرتبط بنسب الإنجاز (مليون ريال): وارد من المالك ومنصرف للمقاولين
    db.cashFlow = [
      { projectId: 'P1', month: '2025-05', inflow: 3.0, outflow: 2.1, progress: 8 },
      { projectId: 'P1', month: '2025-08', inflow: 6.5, outflow: 6.2, progress: 18 },
      { projectId: 'P1', month: '2025-11', inflow: 13.0, outflow: 12.8, progress: 30 },
      { projectId: 'P1', month: '2026-02', inflow: 20.0, outflow: 19.6, progress: 42 },
      { projectId: 'P1', month: '2026-05', inflow: 25.5, outflow: 26.3, progress: 50 },
      { projectId: 'P1', month: '2026-07', inflow: 28.0, outflow: 29.8, progress: 54.5 },
      { projectId: 'P1', month: '2026-10', inflow: 37.0, outflow: 38.0, progress: 70 },
      { projectId: 'P1', month: '2026-12', inflow: 50.0, outflow: 52.0, progress: 92 }
    ];

    // سجل مؤشر صحة المشروع الشهري (لقطات مسجّلة — يُلحق بها المؤشر الحالي في الواجهة)
    db.healthHistory = [
      { projectId: 'P1', month: '2026-01', score: 82 },
      { projectId: 'P1', month: '2026-02', score: 80 },
      { projectId: 'P1', month: '2026-03', score: 78 },
      { projectId: 'P1', month: '2026-04', score: 74 },
      { projectId: 'P1', month: '2026-05', score: 71 },
      { projectId: 'P1', month: '2026-06', score: 69 },
      { projectId: 'P1', month: '2026-07', score: 67 },
      // فيلا الياسمين: اتجاه صاعد (أداء جيد)
      { projectId: 'P2', month: '2026-03', score: 76 },
      { projectId: 'P2', month: '2026-04', score: 79 },
      { projectId: 'P2', month: '2026-05', score: 82 },
      { projectId: 'P2', month: '2026-06', score: 84 },
      { projectId: 'P2', month: '2026-07', score: 86 }
    ];

    // ============ بيانات المشروع الثاني (فيلا الياسمين) ============
    db.scheduleCurve.push(
      { projectId: 'P2', month: '2025-09', planned: 3, actual: 3 }, { projectId: 'P2', month: '2025-12', planned: 14, actual: 15 },
      { projectId: 'P2', month: '2026-03', planned: 26, actual: 28 }, { projectId: 'P2', month: '2026-05', planned: 34, actual: 36 },
      { projectId: 'P2', month: '2026-07', planned: 39, actual: 41 }, { projectId: 'P2', month: '2026-09', planned: 58, actual: null },
      { projectId: 'P2', month: '2026-11', planned: 100, actual: null }
    );
    db.costCurve.push(
      { projectId: 'P2', month: '2025-12', planned: 1.2, actual: 1.1 }, { projectId: 'P2', month: '2026-03', planned: 2.2, actual: 2.1 },
      { projectId: 'P2', month: '2026-07', planned: 3.45, actual: 3.35 }, { projectId: 'P2', month: '2026-11', planned: 8.5, actual: null }
    );
    db.cashFlow.push(
      { projectId: 'P2', month: '2025-12', inflow: 1.3, outflow: 1.1, progress: 15 },
      { projectId: 'P2', month: '2026-03', inflow: 2.3, outflow: 2.1, progress: 28 },
      { projectId: 'P2', month: '2026-07', inflow: 3.6, outflow: 3.35, progress: 41 }
    );
    db.scheduleTasks.push(
      { projectId: 'P2', id: 'P2T1', phaseKey: 'design_approvals', name: 'التصميم واعتمادات الاستشاري', startPlanned: '2025-05-01', endPlanned: '2025-08-15', startActual: '2025-05-05', endActual: '2025-08-20', progress: 100 },
      { projectId: 'P2', id: 'P2T2', phaseKey: 'mobilization', name: 'التجهيز وتأسيس الموقع', startPlanned: '2025-08-15', endPlanned: '2025-09-15', startActual: '2025-09-01', endActual: '2025-09-18', progress: 100 },
      { projectId: 'P2', id: 'P2T3', phaseKey: 'excavation', name: 'الحفر والأساسات', startPlanned: '2025-09-01', endPlanned: '2025-11-30', startActual: '2025-09-10', endActual: '2025-12-05', progress: 100 },
      { projectId: 'P2', id: 'P2T4', phaseKey: 'concrete', name: 'الهيكل الخرساني', startPlanned: '2025-11-01', endPlanned: '2026-04-30', startActual: '2025-11-15', endActual: null, progress: 78 },
      { projectId: 'P2', id: 'P2T5', phaseKey: 'blockwork', name: 'المباني واللياسة', startPlanned: '2026-03-01', endPlanned: '2026-07-31', startActual: '2026-03-20', endActual: null, progress: 40 },
      { projectId: 'P2', id: 'P2T6', phaseKey: 'mep', name: 'الأعمال الكهروميكانيكية MEP', startPlanned: '2026-04-01', endPlanned: '2026-09-30', startActual: '2026-04-15', endActual: null, progress: 22 },
      { projectId: 'P2', id: 'P2T7', phaseKey: 'fitout', name: 'التشطيبات الداخلية', startPlanned: '2026-06-01', endPlanned: '2026-10-31', startActual: null, endActual: null, progress: 5 },
      { projectId: 'P2', id: 'P2T8', phaseKey: 'landscaping', name: 'التنسيق والتشجير', startPlanned: '2026-09-01', endPlanned: '2026-11-15', startActual: null, endActual: null, progress: 0 },
      { projectId: 'P2', id: 'P2T9', phaseKey: 'handover', name: 'تسليم المشروع', startPlanned: '2026-11-01', endPlanned: '2026-11-30', startActual: null, endActual: null, progress: 0 },
      { projectId: 'P2', id: 'P2T10', phaseKey: 'dlp', name: 'فترة ضمان العيوب DLP', startPlanned: '2026-12-15', endPlanned: '2027-12-15', startActual: null, endActual: null, progress: 0 }
    );

    // تقارير عدم المطابقة NCR
    db.ncrs = [
      { id: 'NCR1', projectId: 'P1', contractorId: 'C2', ref: 'NCR-ARC-009', title: 'لياسة غير مستوية بالجناح الغربي - الدور الثاني',
        description: 'تجاوز التفاوت المسموح (3مم/2م) في جدران المحور 2-B، قياسات وصلت إلى 8مم.',
        date: '2026-07-09', status: 'open', severity: 'major', correctiveAction: '' },
      { id: 'NCR2', projectId: 'P1', contractorId: 'C4', ref: 'NCR-HVC-004', title: 'تعليق دكتات بدون عزل اهتزاز',
        description: 'تم تعليق دكتات الميزانين مباشرة بدون رابر اهتزاز مخالفة للمواصفة 23-31-13.',
        date: '2026-07-03', status: 'open', severity: 'major', correctiveAction: '' },
      { id: 'NCR3', projectId: 'P1', contractorId: 'C1', ref: 'NCR-STR-011', title: 'تعشيش خرسانة بعمود الدور الثالث محور 4-C',
        description: 'ظهور تعشيش سطحي بعد فك الشدة.',
        date: '2026-06-18', status: 'closed', severity: 'minor',
        correctiveAction: 'تمت المعالجة بمونة إصلاح إسمنتية عالية المقاومة وفق إجراء المعالجة المعتمد، وفُحصت بالمطرقة الارتدادية.',
        signature: 'م. خالد العمران', signDate: '2026-06-25' }
    ];

    // التعليمات الموقعية Site Instructions
    db.siteInstructions = [
      { id: 'SI1', projectId: 'P1', contractorId: 'C2', ref: 'SI-047', title: 'إيقاف أعمال الدهانات بالواجهة الشمالية',
        details: 'تُوقف الدهانات الخارجية لحين اعتماد عينة اللون النهائية من المالك.', date: '2026-07-14', status: 'issued' },
      { id: 'SI2', projectId: 'P1', contractorId: 'C5', ref: 'SI-045', title: 'تعديل ميول صرف سطح الميزانين',
        details: 'ضبط الميول إلى 1.5% باتجاه المصافي وفق المخطط P-204 قبل صب المدة.', date: '2026-07-10', status: 'done',
        signature: 'م. خالد العمران', signDate: '2026-07-13' },
      { id: 'SI3', projectId: 'P1', contractorId: 'C1', ref: 'SI-044', title: 'تأمين فتحات الأسقف المكشوفة',
        details: 'تركيب حواجز وتغطيات آمنة لجميع الفتحات في الأدوار 3 و4 خلال 24 ساعة.', date: '2026-07-08', status: 'done',
        signature: 'م. خالد العمران', signDate: '2026-07-09' }
    ];

    // اعتماد أساليب التنفيذ وخطط الفحص Method Statements / ITP
    db.methodStatements = [
      { id: 'MS1', projectId: 'P1', contractorId: 'C1', ref: 'MS-STR-018', kind: 'ms', title: 'أسلوب تنفيذ خرسانة السطح بالمضخة البرجية',
        date: '2026-07-11', status: 'pending', notes: '', file: 'MS-STR-018.pdf' },
      { id: 'MS2', projectId: 'P1', contractorId: 'C6', ref: 'ITP-FIR-003', kind: 'itp', title: 'خطة فحص واختبار شبكة الرشاشات',
        date: '2026-07-06', status: 'pending', notes: '', file: 'ITP-FIR-003.pdf' },
      { id: 'MS3', projectId: 'P1', contractorId: 'C2', ref: 'MS-ARC-012', kind: 'ms', title: 'أسلوب تركيب رخام الواجهات بنظام التثبيت الميكانيكي',
        date: '2026-06-28', status: 'approved', notes: 'مع الالتزام باختبار شد المثبتات', signature: 'م. خالد العمران', signDate: '2026-07-01', file: 'MS-ARC-012.pdf' }
    ];

    // اختبارات المواد المعملية
    db.materialTests = [
      { id: 'TST1', projectId: 'P1', contractorId: 'C1', ref: 'CT-238', title: 'كسر مكعبات خرسانة سقف الرابع - 28 يوم',
        lab: 'مختبر الفحوصات الإنشائية المعتمد', target: '30 نيوتن/مم²', value: '34.2 نيوتن/مم²', result: 'pass', date: '2026-07-15' },
      { id: 'TST2', projectId: 'P1', contractorId: 'C1', ref: 'CT-235', title: 'كسر مكعبات خرسانة أعمدة السطح - 7 أيام',
        lab: 'مختبر الفحوصات الإنشائية المعتمد', target: '21 نيوتن/مم²', value: '24.8 نيوتن/مم²', result: 'pass', date: '2026-07-12' },
      { id: 'TST3', projectId: 'P1', contractorId: 'C5', ref: 'PT-041', title: 'اختبار ضغط شبكة التغذية - الدور الثاني',
        lab: 'فحص موقعي', target: '10 بار / ساعتين', value: 'هبوط 0.4 بار', result: 'fail', date: '2026-07-10',
        notes: 'رُصد تسريب عند وصلة محور 2-A، يعاد الاختبار بعد المعالجة' },
      { id: 'TST4', projectId: 'P1', contractorId: 'C2', ref: 'TL-019', title: 'اختبار شد مثبتات رخام الواجهة',
        lab: 'المختبر السعودي للجودة', target: '5 كيلو نيوتن', value: '7.1 كيلو نيوتن', result: 'pass', date: '2026-07-05' }
    ];

    // محاضر الاجتماعات
    db.meetings = [
      { id: 'MTG1', projectId: 'P1', ref: 'MOM-29', title: 'اجتماع تنسيق الموقع الأسبوعي رقم 29', date: '2026-07-13',
        attendees: 'الاستشاري، الإعمار الحديثة، البناء المعماري، الطاقة المتحدة، تكييف الخليج',
        items: ['متابعة تأخر توريد وحدات VRF - تعهد المقاول بالوصول 25 يوليو', 'حسم تعارض دكتات الميزانين مع الكمرات خلال أسبوع', 'التشديد على إغلاق ملاحظات السلامة قبل نهاية الأسبوع', 'رفع مخطط الواجهة المعدل للاعتماد'], by: 'م. خالد العمران' },
      { id: 'MTG2', projectId: 'P1', ref: 'MOM-28', title: 'اجتماع تنسيق الموقع الأسبوعي رقم 28', date: '2026-07-06',
        attendees: 'الاستشاري، ممثل المالك، جميع المقاولين',
        items: ['استعراض نسب الإنجاز مقابل المخطط', 'مناقشة المستخلص 11 لمقاول الهيكل', 'جدولة اختبارات مضخات الحريق'], by: 'م. خالد العمران' }
    ];

    // قوائم ملاحظات التسليم Snag List
    db.snags = [
      { id: 'SNG1', projectId: 'P1', contractorId: 'C2', ref: 'SNG-114', title: 'خدوش بواجهة رخام المصعد الرئيسي', location: 'GF', date: '2026-07-11', status: 'open' },
      { id: 'SNG2', projectId: 'P1', contractorId: 'C3', ref: 'SNG-112', title: 'لوحة مفاتيح غير مثبتة بإحكام - ممر الدور الأول', location: 'F1', date: '2026-07-09', status: 'open' },
      { id: 'SNG3', projectId: 'P1', contractorId: 'C2', ref: 'SNG-108', title: 'فواصل سيراميك غير منتظمة بدورة مياه الميزانين', location: 'MZ', date: '2026-07-02', status: 'closed', signature: 'م. خالد العمران', signDate: '2026-07-08' },
      { id: 'SNG4', projectId: 'P1', contractorId: 'C5', ref: 'SNG-105', title: 'تسريب بسيط أسفل مغسلة القبو', location: 'B1', date: '2026-06-28', status: 'closed', signature: 'م. خالد العمران', signDate: '2026-07-03' }
    ];

    // تقارير السلامة HSE
    db.hseReports = [
      { id: 'HSE1', projectId: 'P1', contractorId: 'C1', ref: 'HSE-067', kind: 'violation', title: 'عمالة بدون أحزمة أمان على حافة الدور الثالث',
        details: 'رصد بكاميرا المراقبة رقم 2 — أُوقف العمل فوراً وأُلزم المقاول بإعادة التدريب.', severity: 'high', date: '2026-07-10', status: 'open' },
      { id: 'HSE2', projectId: 'P1', contractorId: 'C4', ref: 'HSE-065', kind: 'observation', title: 'تخزين أسطوانات أكسجين قرب مواد قابلة للاشتعال',
        details: 'نُقلت الأسطوانات إلى منطقة التخزين الآمنة وثُبتت لافتات تحذيرية.', severity: 'medium', date: '2026-07-06', status: 'closed', signature: 'م. خالد العمران', signDate: '2026-07-07' },
      { id: 'HSE3', projectId: 'P1', contractorId: 'C2', ref: 'HSE-061', kind: 'incident', title: 'إصابة طفيفة - جرح يد أثناء تركيب الأسقف المستعارة',
        details: 'إسعاف أولي بالموقع، لا أيام عمل مفقودة. تم التوعية بلبس القفازات المقاومة للقطع.', severity: 'low', date: '2026-06-30', status: 'closed', signature: 'م. خالد العمران', signDate: '2026-07-01' }
    ];

    // المطالبات وتمديد المدة Claims / EOT
    db.claims = [
      { id: 'CLM1', projectId: 'P1', contractorId: 'C4', ref: 'EOT-HVC-02', kind: 'eot', title: 'طلب تمديد مدة 21 يوماً - تأخر جمركي لوحدات VRF',
        days: 21, amount: 0, date: '2026-07-09', status: 'pending', notes: '' },
      { id: 'CLM2', projectId: 'P1', contractorId: 'C1', ref: 'CLM-STR-01', kind: 'cost', title: 'مطالبة مالية - أعمال إضافية لتثبيت التربة',
        days: 0, amount: 260000, date: '2026-06-20', status: 'rejected',
        notes: 'الأعمال ضمن نطاق العقد وفق البند 4-12 من المواصفات', signature: 'م. خالد العمران', signDate: '2026-06-26' }
    ];

    // الهندسة القيمية Value Engineering
    db.valueEngineering = [
      { id: 'VE1', projectId: 'P1', contractorId: 'C3', ref: 'VE-ELE-03', title: 'استبدال إنارة الممرات بنظام LED بمستشعرات حركة',
        saving: 185000, date: '2026-07-04', status: 'pending', notes: '', details: 'توفير 35% من استهلاك الإنارة مع عمر تشغيلي أطول.' },
      { id: 'VE2', projectId: 'P1', contractorId: 'C2', ref: 'VE-ARC-01', title: 'بديل محلي معتمد لرخام السلالم الخدمية',
        saving: 120000, date: '2026-06-15', status: 'approved', notes: 'اعتمد للسلالم الخدمية فقط دون البهو الرئيسي',
        signature: 'م. خالد العمران', signDate: '2026-06-22', details: 'نفس السماكة والمقاومة بمصدر توريد أسرع.' }
    ];

    // مستندات التسليم والإغلاق Handover
    db.handoverDocs = [
      { id: 'HND1', projectId: 'P1', contractorId: 'C1', ref: 'ABD-STR-01', kind: 'asbuilt', title: 'مخططات كما نُفذ - الهيكل الإنشائي (حتى الدور الرابع)',
        date: '2026-07-13', status: 'pending', notes: '', file: 'AsBuilt-STR-R1.pdf' },
      { id: 'HND2', projectId: 'P1', contractorId: 'C4', ref: 'OMM-HVC-01', kind: 'om', title: 'كتيبات التشغيل والصيانة - وحدات التكييف المركبة',
        date: '2026-07-08', status: 'pending', notes: '', file: 'OM-HVAC-V1.pdf' },
      { id: 'HND3', projectId: 'P1', contractorId: 'C5', ref: 'WRT-PLB-01', kind: 'warranty', title: 'شهادات ضمان السخانات المركزية (5 سنوات)',
        date: '2026-06-25', status: 'approved', notes: 'سارية حتى 2031', signature: 'م. خالد العمران', signDate: '2026-06-28', file: 'Warranty-Heaters.pdf' }
    ];

    // سجل المراسلات
    db.correspondence = [
      { id: 'COR1', projectId: 'P1', ref: 'OUT-2026-088', direction: 'out', to: 'مؤسسة البناء المعماري', title: 'إنذار بشأن تأخر معدل إنجاز التشطيبات', date: '2026-07-12', by: 'م. خالد العمران' },
      { id: 'COR2', projectId: 'P1', ref: 'IN-2026-134', direction: 'in', to: 'المكتب الاستشاري', from: 'تكييف الخليج المتقدم', title: 'إشعار وصول شحنة وحدات VRF للميناء', date: '2026-07-11' },
      { id: 'COR3', projectId: 'P1', ref: 'OUT-2026-085', direction: 'out', to: 'ممثل المالك', title: 'رفع التقرير الشهري يونيو مع توصيات تسريع الأعمال', date: '2026-07-02', by: 'م. خالد العمران' }
    ];

    // ============ كاميرات الموقع ============
    db.cameras = [
      { id: 'CAM1', name: 'كاميرا 1 - الواجهة الشمالية', location: 'برج الرافعة الشرقي', url: 'rtsp://site.bassir.local/cam1', streamPath: 'cam1', status: 'online', installed: '2025-06-01', bimFloor: 'GF', bimDiscipline: 'architectural' },
      { id: 'CAM2', name: 'كاميرا 2 - الدور الثالث', location: 'العمود C-4', url: 'rtsp://site.bassir.local/cam2', streamPath: 'cam2', status: 'online', installed: '2025-11-15', bimFloor: 'F3', bimDiscipline: 'architectural' },
      { id: 'CAM3', name: 'كاميرا 3 - السطح', location: 'غرفة المصعد العلوية', url: 'rtsp://site.bassir.local/cam3', streamPath: 'cam3', status: 'online', installed: '2026-03-01', bimFloor: 'RF', bimDiscipline: 'structural' },
      { id: 'CAM4', name: 'كاميرا 4 - بوابة الموقع', location: 'المدخل الرئيسي', url: 'rtsp://site.bassir.local/cam4', streamPath: 'cam4', status: 'offline', installed: '2025-06-01' }
    ];

    // ============ سجل مخططات المشروع (مربوطة بجدول الكميات) ============
    db.planDrawings = [
      { id: 'PD1', projectId: 'P1', floor: 'GF', discipline: 'architectural', ref: 'A-101', title: 'المسقط المعماري - الدور الأرضي', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' }, date: '2026-05-10', by: 'دار العمران للاستشارات' },
      { id: 'PD2', projectId: 'P1', floor: 'GF', discipline: 'structural', ref: 'S-101', title: 'المسقط الإنشائي - الدور الأرضي', file: { name: 'A-305-section.pdf', url: '/vendor/sample/A-305-section.pdf' }, date: '2026-05-10', by: 'دار العمران للاستشارات' },
      { id: 'PD3', projectId: 'P1', floor: 'F1', discipline: 'architectural', ref: 'A-102', title: 'المسقط المعماري - الدور الأول', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' }, date: '2026-05-12', by: 'دار العمران للاستشارات' },
      { id: 'PD4', projectId: 'P1', floor: 'F2', discipline: 'electrical', ref: 'E-102', title: 'مخطط القوى والإنارة - الدور الثاني', file: { name: 'A-305-section.pdf', url: '/vendor/sample/A-305-section.pdf' }, date: '2026-05-20', by: 'دار العمران للاستشارات' },
      { id: 'PD5', projectId: 'P1', floor: 'MZ', discipline: 'hvac', ref: 'M-101', title: 'مخطط الدكتات - الميزانين', file: { name: 'A-305-section.pdf', url: '/vendor/sample/A-305-section.pdf' }, date: '2026-05-22', by: 'دار العمران للاستشارات' },
      { id: 'PD6', projectId: 'P1', floor: 'ELEV', discipline: 'architectural', ref: 'A-201', title: 'مخطط الواجهة الشمالية والجنوبية', file: { name: 'A-101-ground-floor.pdf', url: '/vendor/sample/A-101-ground-floor.pdf' }, date: '2026-05-15', by: 'دار العمران للاستشارات' },
      { id: 'PD7', projectId: 'P1', floor: 'GF', discipline: 'architectural', ref: 'A-101-DXF', title: 'المسقط المعماري (DXF متجه قابل للقياس) - الأرضي', file: { name: 'A-101-ground-floor.dxf', url: '/vendor/sample/A-101-ground-floor.dxf' }, date: '2026-05-11', by: 'دار العمران للاستشارات' }
    ];

    // ============ التقارير الأسبوعية ============
    db.weeklyReports = [
      { id: 'WR1', projectId: 'P1', weekOf: '2026-07-12', title: 'التقرير الأسبوعي - الأسبوع 29',
        summary: 'استمرار صب سقف السطح وتقدم التشطيبات بالأدوار السفلية. متوسط العمالة اليومية 175 عاملاً.',
        progressPlanned: 62, progressActual: 54.5,
        achievements: ['اكتمال 78% من صب سقف السطح', 'إنجاز رخام البهو الرئيسي بنسبة 62%', 'إقفال 8 ملاحظات استلام'],
        issues: ['تأخر وصول وحدات VRF (متوقع 25 يوليو)', 'نقص عمالة لياسة بالجناح الغربي'],
        photos: ['wk29-rf.jpg', 'wk29-gf.jpg', 'wk29-f2.jpg'], attachments: ['manpower-wk29.xlsx'], by: 'م. خالد العمران' },
      { id: 'WR2', projectId: 'P1', weekOf: '2026-07-05', title: 'التقرير الأسبوعي - الأسبوع 28',
        summary: 'بدء تجهيزات صب سقف السطح واستكمال تمديدات الدور الثالث.',
        progressPlanned: 61, progressActual: 53.6,
        achievements: ['اعتماد 5 مخططات تنفيذية', 'نجاح اختبارات كسر مكعبات الدور الرابع'],
        issues: ['ملاحظة سلامة عالية الخطورة على حافة الدور الثالث'],
        photos: ['wk28-f3.jpg', 'wk28-rf.jpg'], attachments: [], by: 'م. خالد العمران' }
    ];

    // ============ سجل الرسائل (واتساب / إيميل) ============
    db.messages = [
      { id: 'MSG1', channel: 'whatsapp', to: '0501234567', date: '2026-07-15 09:00', title: 'التقرير الأسبوعي', status: 'sent' },
      { id: 'MSG2', channel: 'email', to: 'owner@example.com', date: '2026-07-01 08:30', title: 'التقرير الشهري - يونيو', status: 'sent' }
    ];

    db.auditLog = [
      { id: 'AL1', time: '2026-07-18 08:15', userName: 'م. خالد العمران (الاستشاري)', role: 'consultant', action: 'review', target: 'اعتماد المستخلص IPC-ELE-04' },
      { id: 'AL2', time: '2026-07-17 14:02', userName: 'مؤسسة البناء المعماري', role: 'contractor', action: 'create', target: 'رفع طلب استلام WIR-ARC-087' },
      { id: 'AL3', time: '2026-07-17 09:30', userName: 'م. سالم الحربي (ممثل المالك)', role: 'owner_rep', action: 'login', target: 'دخول إلى النظام' }
    ];

    // إشارات جودة/تسليم خفيفة للمشروع الثاني (تجعل صحته واقعية)
    db.ncrs.push({ id: 'NCR-P2-1', projectId: 'P2', contractorId: 'C11', ref: 'NCR-VIL-002', title: 'فرق لون في دهان الواجهة الأمامية',
      description: 'تباين ظاهر في درجة اللون بين دفعتي الدهان بالواجهة الجنوبية.', date: '2026-07-06', status: 'open', severity: 'minor', correctiveAction: '' });
    db.punchList.push({ id: 'PL-P2-1', projectId: 'P2', contractorId: 'C10', ref: 'PL-VIL-001', title: 'تعشيش بسيط بسلم القبو', location: 'B1', severity: 'minor', status: 'open', raisedDate: '2026-07-02', closedDate: null, notes: '' });

    // ============ تكويد كل المستندات (حتمي حسب تاريخ كل مستند) ============
    const DOC_TYPES = {
      shopDrawings: 'SD', materials: 'MAT', scheduleSubmittals: 'SCH', wirs: 'WIR',
      changeOrders: 'CO', payments: 'IPC', methodStatements: 'MS', claims: 'CLM',
      valueEngineering: 'VE', handoverDocs: 'HOD', rfis: 'RFI', ncrs: 'NCR',
      siteInstructions: 'SI', snags: 'SNG', hseReports: 'HSE', materialTests: 'TST',
      meetings: 'MOM', correspondence: 'COR', dailyReports: 'DDR', weeklyReports: 'WKR',
      monthlyReports: 'MOR', planDrawings: 'DRW', photos: 'PHT', rfps: 'RFP', bimModels: 'BIM', bimDocs: 'BDC',
      files: 'FIL', punchList: 'PNL', warranties: 'WTY', incidents: 'INC', handoverItems: 'HND'
    };
    // سجل تتبع أولي لكل معاملة موجودة (تقديم ثم قرار إن وجد)
    ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments',
     'methodStatements', 'claims', 'valueEngineering', 'handoverDocs', 'rfis', 'rfps'].forEach(function (col) {
      (db[col] || []).forEach(function (it) {
        const cName = (db.contractors.find(function (c) { return c.id === it.contractorId; }) || {}).name || 'المقاول';
        it.history = [{ status: 'pending', by: cName, role: 'contractor', date: it.date }];
        if (it.status && it.status !== 'pending' && it.status !== 'open') {
          it.reviewStartDate = it.date;
          it.reviewEndDate = it.signDate || it.date;
          it.reviewDays = Math.max(0, Math.round((new Date(it.reviewEndDate) - new Date(it.date)) / 86400000));
          it.history.push({ status: it.status, by: it.signature || 'الاستشاري', role: 'consultant', date: it.reviewEndDate, notes: it.notes || '' });
        }
      });
    });

    const docSeq = {};
    Object.keys(DOC_TYPES).forEach(function (col) {
      (db[col] || []).forEach(function (it) {
        const y = String(it.date || it.month || it.weekOf || '2026').slice(0, 4);
        const key = (it.projectId || 'P1') + '-' + DOC_TYPES[col] + '-' + y;
        docSeq[key] = (docSeq[key] || 0) + 1;
        it.docCode = 'BSR-' + key + '-' + String(docSeq[key]).padStart(4, '0');
      });
    });

    db.notifications = [];
    db.comments = [];
    db.meta = { seq: 1000, seededAt: '2026-07-18', version: 19, docSeq: docSeq };

    return db;
  }

  return { buildSeed: buildSeed, FLOORS: FLOORS, DISCIPLINES: DISCIPLINES };
});
