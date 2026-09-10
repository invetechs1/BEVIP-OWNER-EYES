/**
 * بصير | صفحات التحسينات: تتبع التقديمات، RFI/RFP، أوامر التغيير،
 * قاعدة بيانات المقاولين، خادم الملفات المركزي، وثائق المشروع،
 * نماذج ووثائق BIM وربط الكاميرات، ولوحة اختيار المشروع.
 */
(function () {
  'use strict';

  I18n.registerDict({
    ' أيام': ' days',
    ' يوم': ' days',
    '% من الميزانية': '% of budget',
    '(النسخ السابقة مؤرشفة بترميزها وقراراتها داخل نفس المستند)': '(previous versions are archived with their codes and decisions within the same document)',
    ') وربط بجدول الكميات': ') and linked to the BOQ',
    'آخر المقارنات الآلية (الموقع الفعلي ↔ نموذج BIM)': 'Latest Automated Comparisons (Actual Site ↔ BIM Model)',
    'أثر التكلفة': 'Cost Impact',
    'أثر التكلفة ': 'Cost impact ',
    'أثر التكلفة (ر.س)': 'Cost Impact (SAR)',
    'أثر التكلفة المعتمد': 'Approved Cost Impact',
    'أثر الجدول الزمني المعتمد': 'Approved Schedule Impact',
    'أثر المدة': 'Time Impact',
    'أثر المدة ': 'Time impact ',
    'أثر المدة (يوم)': 'Time Impact (days)',
    'أدخل اسم النموذج ورابطه السحابي': 'Enter the model name and its cloud link',
    'أدخل الموضوع': 'Enter the subject',
    'أسلوب تنفيذ/ITP': 'Method Statement/ITP',
    'أعدها': 'Prepared By',
    'أمر تغيير': 'Change Order',
    'أوامر التغيير وطلبات التعديل': 'Change Orders & Variation Requests',
    'أُرسل ': 'Sent ',
    'أُنشئت نسخة احتياطية كاملة: ': 'Full backup created: ',
    'إجمالي الأوامر': 'Total Orders',
    'إجمالي التقديمات': 'Total Submissions',
    'إرسال': 'Submit',
    'إرسال ': 'Submit ',
    'إرسال RFI جديد': 'Submit New RFI',
    'إرسال RFP جديد': 'Submit New RFP',
    'إضافة للمستودع': 'Add to Repository',
    'إغلاق': 'Close',
    'إلغاء': 'Cancel',
    'إنشاء وثيقة BIM من قالب': 'Create a BIM Document from a Template',
    'اختر المشروع لتعمل عليه — كل الصفحات والبيانات تتبع المشروع المحدد': 'Select the project to work on — all pages and data follow the selected project',
    'اختر فئة لعرض وثائقها': 'Select a category to view its documents',
    'اختر ملف النموذج أولاً': 'Please select the model file first',
    'اختر ملفاً أولاً': 'Please select a file first',
    'اربط كل تسليمة بمرحلة المشروع (تصميم، تنفيذ، تسليم) وتاريخها المستهدف.': 'Link each deliverable to the project phase (design, construction, handover) and its target date.',
    'اربط نموذجاً مستضافاً سحابياً (Autodesk / Trimble / أي رابط) — مزامنة موثوقة بلا رفع.': 'Link a cloud-hosted model (Autodesk / Trimble / any link) — reliable sync without uploading.',
    'اربطها لتفعيل المقارنة': 'Link it to enable comparison',
    'استرجاع سهل، سجل نسخ لكل ملف، وتنظيم بالفئات': 'Easy retrieval, a version history per file, and organization by category',
    'استرجاع هذه النسخة': 'Retrieve This Version',
    'استفسار RFI': 'RFI Query',
    'استفسارات RFI': 'RFI Queries',
    'اسم التقديم': 'Submission Name',
    'اسم النموذج': 'Model Name',
    'اعتماد': 'Approve',
    'اعتماد الرد وتوقيعه': 'Approve & Sign Response',
    'اعتماد مع ملاحظات': 'Approve with Notes',
    'اعتماد مواد': 'Material Approval',
    'اكتب الرد أولاً': 'Please write the response first',
    'الإصدار': 'Revision',
    'الاستشاري': 'Consultant',
    'الاستفسارات الفنية RFI': 'Technical Queries (RFI)',
    'البريد الإلكتروني': 'Email Address',
    'البريد: ': 'Email: ',
    'التاريخ': 'Date',
    'التخصص': 'Discipline',
    'التخصص: ': 'Discipline: ',
    'التنسيق بين التخصصات، اكتشاف التعارضات قبل التنفيذ، استخراج الكميات، وربط النموذج بالجدول الزمني (4D) والتكلفة (5D).': 'Cross-discipline coordination, clash detection prior to construction, quantity extraction, and linking the model to the schedule (4D) and cost (5D).',
    'الجهة': 'Contractor',
    'الحالة': 'Status',
    'الحالية': 'Current',
    'الحجم': 'Size',
    'الحجم الإجمالي': 'Total Size',
    'الدور في النموذج': 'Floor in Model',
    'الربط': 'Linked',
    'الرخص (سطر لكل رخصة)': 'Licenses (one per line)',
    'الرخص:': 'Licenses:',
    'الرد': 'Response',
    'الرد على: ': 'Reply to: ',
    'الرد وتاريخه': 'Response & Date',
    'السجل': 'History',
    'السجل التجاري: ': 'Commercial Registration: ',
    'السجل الكامل للتقديم': 'Full Submission History',
    'الشهادات والتصنيفات (سطر لكل شهادة)': 'Certifications & Classifications (one per line)',
    'الشهادات والتصنيفات:': 'Certifications & Classifications:',
    'العنوان': 'Address',
    'العنوان: ': 'Address: ',
    'الفئة': 'Category',
    'الفرق: ': 'Difference: ',
    'القرار': 'Decision',
    'الكاميرا': 'Camera',
    'الكود': 'Code',
    'المالك': 'Owner',
    'المدة': 'Duration',
    'المدة: ': 'Duration: ',
    'المرجع': 'Reference',
    'المرصود بالصورة: ': 'Observed in image: ',
    'المشروع الحالي ✓': 'Current Project ✓',
    'المصدر': 'Source',
    'المقارنة الآلية': 'Automated Comparison',
    'الملاحظات': 'Notes',
    'الملف': 'File',
    'الملفات المخزنة': 'Stored Files',
    'الموضوع': 'Subject',
    'الموقع': 'Location',
    'الميزانية: ': 'Budget: ',
    'النسخ': 'Versions',
    'النسخ الاحتياطي': 'Backup',
    'النماذج المفحوصة وإصداراتها (معماري/إنشائي/MEP) وتاريخ الفحص وقواعد التسامح.': 'The models inspected and their versions (architectural/structural/MEP), inspection date, and tolerance rules.',
    'النموذج': 'Model',
    'النوع': 'Type',
    'الهاتف': 'Phone',
    'الهاتف: ': 'Phone: ',
    'الوثائق القانونية (سطر لكل وثيقة)': 'Legal Documents (one per line)',
    'الوثائق القانونية:': 'Legal Documents:',
    'الوثيقة': 'Document',
    'الوصف': 'Description',
    'انتهاء المراجعة': 'Review Completed',
    'انتهاء المراجعة: ': 'Review Completed: ',
    'باسم المقاول': 'On Behalf of Contractor',
    'بانتظار الاعتماد': 'Pending Approval',
    'بانتظار الرد': 'Awaiting Response',
    'بانتظار الرد منذ ': 'Awaiting response for ',
    'بحث بالاسم أو الكود أو الرافع...': 'Search by name, code, or uploader...',
    'بحث برقم الملف أو الاسم أو الجهة...': 'Search by file number, name, or contractor...',
    'بدء المراجعة': 'Review Started',
    'بدء المراجعة: ': 'Review Started: ',
    'بسجل ردود موثق وموقع': 'With a documented, signed response record',
    'بقيمة ': 'Valued at ',
    'بكل الأنواع': 'Across all types',
    'بلا رد منذ ': 'No response for ',
    'بواسطة: ': 'By: ',
    'بيانات الشركة كاملة: العنوان، مسؤول التواصل، السجل التجاري، الرخص والشهادات والوثائق القانونية': 'Complete company records: address, contact person, commercial registration, licenses, certifications, and legal documents',
    'بيانات الشركة: ': 'Company Details: ',
    'تأكيد وتوقيع': 'Confirm & Sign',
    'تاريخ الإرسال': 'Sent Date',
    'تاريخ التقديم': 'Submission Date',
    'تاريخ التقديم: ': 'Submission Date: ',
    'تاريخ الرد': 'Response Date',
    'تاريخ نسخ كامل بلا تكرار ملفات': 'Full version history without duplicate files',
    'تتبع التقديمات': 'Submission Tracking',
    'تحديث البيانات': 'Update Details',
    'تحميل': 'Download',
    'تخزين مركزي آمن ومُكوَّد': 'Secure, centrally coded storage',
    'تصدير CSV': 'Export CSV',
    'تفاصيل العرض / الطلب': 'Proposal / Request Details',
    'تقارن كل لقطة بنسبة النموذج': 'Compares each shot with the model percentage',
    'تقرير اكتشاف التعارضات': 'Clash Detection Report',
    'تقرير الإغلاق': 'Close-Out Report',
    'تقرير الإغلاق Close-Out': 'Close-Out Report',
    'تقرير التعارضات': 'Clash Report',
    'تم الرد': 'Answered',
    'تم الرد عليها': 'Responded',
    'تُوجه للاستشاري أو للمالك مع تتبع الردود ومددها': 'Directed to the consultant or owner, with response tracking and durations',
    'جارية': 'In progress',
    'جارية منذ ': 'In progress for ',
    'جارٍ رفع ': 'Uploading ',
    'جدول زمني': 'Schedule Submittal',
    'حدد LOD/LOI المطلوب لكل تسليمة في كل مرحلة.': 'Specify the required LOD/LOI for each deliverable in each phase.',
    'حدد كل نموذج ووثيقة معلومات مطلوبة، ومسؤول إعدادها، وصيغتها (IFC/RVT/PDF).': 'Specify every required model and information document, who prepares it, and its format (IFC/RVT/PDF).',
    'حرر الأقسام ثم احفظ — تُكوَّد الوثيقة وتدخل الأرشيف المركزي': 'Edit the sections then save — the document will be coded and added to the central archive',
    'حفظ البيانات': 'Save Details',
    'حفظ الوثيقة وتكويدها': 'Save & Code Document',
    'خادم الملفات المركزي': 'Central File Server',
    'خطة تسليم المعلومات': 'Information Delivery Plan',
    'خطة تسليم المعلومات الرئيسية MIDP': 'Master Information Delivery Plan (MIDP)',
    'خطة تنفيذ BIM': 'BIM Execution Plan',
    'خطة تنفيذ الـBIM': 'BIM Execution Plan',
    'دورة اعتماد كاملة مع تتبع أثر التكلفة والجدول الزمني': 'A complete approval cycle with cost and schedule impact tracking',
    'دورة الاعتماد': 'Approval Cycle',
    'رابط النموذج السحابي': 'Cloud Model Link',
    'ربط الكاميرات بالنموذج': 'Camera-to-Model Linking',
    'ربط النموذج السحابي': 'Link Cloud Model',
    'ربط عناصر النموذج ببيانات الأصول (COBie) وكتيبات التشغيل.': 'Linking model elements to asset data (COBie) and operation manuals.',
    'ربط كاميرات الموقع بنموذج BIM': 'Linking Site Cameras to the BIM Model',
    'ربط نموذج سحابي': 'Link a Cloud Model',
    'رد': 'Reply',
    'رفض وإرجاع': 'Reject & Return',
    'رفع النموذج وربطه بجدول الكميات': 'Upload Model & Link to BOQ',
    'رفع للخادم': 'Upload to Server',
    'رفع مباشر لملفات BIM الكبيرة (IFC / RVT / NWD حتى 500MB) إلى خادم بصير المركزي.': 'Direct upload of large BIM files (IFC / RVT / NWD up to 500MB) to the central Bassir server.',
    'رفع نموذج من الجهاز': 'Upload a Model from Device',
    'رفعه': 'Uploaded By',
    'رقم السجل التجاري': 'Commercial Registration Number',
    'رقم الملف': 'File Number',
    'رقم الملف، الحالة، تواريخ التقديم والمراجعة، المدة، والسجل الكامل للتغييرات': 'File number, status, submission and review dates, duration, and the full change history',
    'رُفع النموذج (': 'Model uploaded (',
    'سجل كل تغييرات الحالة:': 'Full status change log:',
    'سجل نسخ الملف': 'File Version History',
    'سجل نماذج المشروع': 'Project Model Log',
    'سحابي': 'Cloud',
    'صُدّر الملف: ': 'File exported: ',
    'طلب استلام': 'Work Inspection Request',
    'طلب عرض RFP': 'RFP Request',
    'طلبات العروض والمقترحات RFP': 'Requests for Proposals (RFP)',
    'طلبات وعروض RFP': 'RFP Requests & Proposals',
    'عدد التعارضات: حرجة / جوهرية / ثانوية، ونسبة المُغلق منها من الفحص السابق.': 'Number of clashes: critical / major / minor, and the percentage closed since the previous check.',
    'عدد النسخ': 'Number of Versions',
    'عرض BIM/IFC حقيقي داخل المتصفح (بلا خدمة خارجية). ملفات DWG/RVT الأصلية تحتاج مسار Autodesk APS.': 'A real BIM/IFC viewer inside the browser (no external service). Original DWG/RVT files require the Autodesk APS pathway.',
    'عرض RFP': 'RFP Proposal',
    'عرض نموذج BIM ثلاثي الأبعاد (برج بصير)': 'View 3D BIM Model (Bassir Tower)',
    'عند وصول لقطة من كاميرا مربوطة، يحلل ذكاء بصير الصورة ويقارن الإنجاز المرصود بنسبة إنجاز الدور/التخصص في نموذج BIM وجدول الكميات — فيسهل التحقق من التقدم الفعلي مقابل النموذج.': 'When a shot arrives from a linked camera, Bassir AI analyzes the image and compares the observed progress with the floor/discipline progress percentage in the BIM model and BOQ — making it easy to verify actual progress against the model.',
    'عنوان الوثيقة': 'Document Title',
    'غير مربوط': 'Not Linked',
    'فتح': 'Open',
    'فتح والعمل عليه': 'Open & Work On It',
    'في المراجعة أكثر من ': 'In review for more than ',
    'قائمة النماذج والوثائق المسلمة نهائياً وأكوادها في أرشيف بصير.': 'A list of the models and documents finally delivered and their codes in the Bassir archive.',
    'قاعدة بيانات المقاولين': 'Contractor Database',
    'قرار': 'Decision',
    'قرار أمر التغيير: ': 'Change Order Decision: ',
    'قرارات جلسة التنسيق وإجراءات كل مقاول.': 'Coordination meeting decisions and each contractor\'s actions.',
    'قوالب جاهزة تُحرَّر وتُحفظ وتُكوَّد في الأرشيف': 'Ready-made templates you can edit, save, and code into the archive',
    'قيد الاعتماد': 'Pending Approval',
    'قيد المراجعة': 'Under Review',
    'قيد المراجعة الآن': 'Currently Under Review',
    'قيمة العقد: ': 'Contract Value: ',
    'كل الأنواع': 'All Types',
    'كل الحالات': 'All Statuses',
    'كل الفئات': 'All Categories',
    'كل كاميرا تُربط بدور وتخصص في النموذج — فتُقارن لقطاتها آلياً بالمخطط له': 'Each camera is linked to a floor and discipline in the model — its footage is then automatically compared against the plan',
    'لا أوامر تغيير بعد': 'No change orders yet',
    'لا تقديمات مطابقة': 'No matching submissions',
    'لا سجل حالات لهذا التقديم بعد': 'No status history for this submission yet',
    'لا سجلات — أرسل أول ': 'No records — send the first ',
    'لا مقارنات بعد — تصل تلقائياً مع لقطات الكاميرات المربوطة': 'No comparisons yet — they arrive automatically with linked camera footage',
    'لا مقاولون بعد — أضفهم من صفحة إدارة المقاولين': 'No contractors yet — add them from the Contractor Management page',
    'لا ملفات مطابقة — ارفع أول ملف للخادم المركزي': 'No matching files — upload the first file to the central server',
    'لا نماذج بعد — اربط سحابياً أو ارفع من الجهاز': 'No models yet — link a cloud model or upload from your device',
    'لا وثائق بعد — أنشئ أول وثيقة من القوالب أعلاه': 'No documents yet — create the first one from the templates above',
    'لا وثائق في هذه الفئة بعد': 'No documents in this category yet',
    'لدى الاستشاري': 'With Consultant',
    'لدى الاستشاري أو المالك': 'With Consultant or Owner',
    'لم يعيّن استشاري': 'No consultant assigned',
    'لوحة المشاريع': 'Projects Dashboard',
    'المشروع الحالي': 'Current Project',
    'ما نجح وما يُحسَّن في مشاريع قادمة.': 'What worked well and what should be improved in future projects.',
    'متأخرة عن المهلة': 'Overdue',
    'متأخرة — ': 'Overdue — ',
    'متوسط مدة الاستجابة': 'Average Response Time',
    'متوسط مدة المراجعة': 'Average Review Duration',
    'مخطط تنفيذي': 'Shop Drawing',
    'مدة الاستجابة': 'Response Time',
    'مدة الاستجابة (يوم)': 'Response Time (days)',
    'مدة المراجعة (يوم)': 'Review Duration (days)',
    'مدة المراجعة: ': 'Review Duration: ',
    'مدير BIM، منسق نماذج لكل مقاول، واجتماع تنسيق نماذج أسبوعي.': 'A BIM manager, a model coordinator for each contractor, and a weekly model coordination meeting.',
    'مراجعة الاستشاري': 'Consultant Review',
    'مربوط بجدول الكميات ✓': 'Linked to BOQ ✓',
    'مرجع للتعديل': 'Returned for Revision',
    'مرفق (اختياري)': 'Attachment (optional)',
    'مرفوض ✗': 'Rejected ✗',
    'مرفوض/مرجع: ': 'Rejected/Returned: ',
    'مرفوع': 'Uploaded',
    'مسؤول التواصل': 'Contact Person',
    'مسؤول التواصل: ': 'Contact Person: ',
    'مستخلص': 'Payment Certificate',
    'مستند تسليم': 'Handover Document',
    'مستودع مستندات هذا المشروع — كل ما يخصه في مكان واحد مُكوَّد': 'This project\'s document repository — everything related to it, coded and in one place',
    'مستوى التفصيل LOD 350 للتنفيذ، تسمية الملفات وفق ISO 19650، وحدة المتر، نقطة أصل موحدة.': 'LOD 350 for construction, file naming per ISO 19650, metric units, and a unified origin point.',
    'مصفوفة إسناد: من يُعِد، من يراجع، من يعتمد كل تسليمة.': 'An assignment matrix: who prepares, who reviews, and who approves each deliverable.',
    'مطابقة النموذج للتنفيذ الفعلي (As-Built) ونسبة التحقق الميداني.': 'Model conformance to as-built conditions and the field verification percentage.',
    'مطالبة/EOT': 'Claim/EOT',
    'معتمد': 'Approved',
    'معتمد / تم الرد': 'Approved / Answered',
    'معتمد مع ملاحظات': 'Approved with Notes',
    'معتمد ✓': 'Approved ✓',
    'معتمد: ': 'Approved: ',
    'معماري وإنشائي: كل أسبوعين. MEP: أسبوعياً أثناء التنسيق.': 'Architectural and structural: every two weeks. MEP: weekly during coordination.',
    'مفتوح': 'Open',
    'مقاول': 'Contractor',
    'ملف النموذج': 'Model File',
    'ملف بالمستودع': 'Files in Repository',
    'من': 'From',
    'من ': 'From ',
    'من القالب': 'from Template',
    'موجه إلى': 'To',
    'موحد Federated': 'Unified (Federated)',
    'مُقدَّم ✓': 'Submitted ✓',
    'نسخ الإصدارات المؤرشفة': 'Archived Version Copies',
    'نسخ المستند: ': 'Document Versions: ',
    'نسخ كاملة لقاعدة البيانات': 'Full database backups',
    'نسخة ': 'Version ',
    'نسخة احتياطية الآن': 'Back Up Now',
    'نسخة جديدة': 'New Version',
    'نسخة — آخرها ': 'versions — latest on ',
    'نشاط متأخر': 'Overdue Activity',
    'نص الاستفسار': 'Query Text',
    'نص الرد (يُوثق بتوقيعك وتاريخه)': 'Response Text (recorded with your signature & date)',
    'نظام بصير هو الـCDE المعتمد: الرفع والاعتماد والأرشفة والتكويد.': 'The Bassir system is the approved CDE: upload, approval, archiving, and coding.',
    'نماذج BIM': 'BIM Models',
    'نموذج BIM/الكميات: ': 'BIM/BOQ model: ',
    'هندسة قيمية': 'Value Engineering',
    'وثائق BIM (قوالب)': 'BIM Documents (Templates)',
    'وثائق BIM للمشروع': 'Project BIM Documents',
    'وثائق المشروع: ': 'Project Documents: ',
    'وصف كل تعارض: الموقع (المحور/الدور)، التخصصات المتعارضة، المسؤول، وتاريخ الحل المستهدف.': 'A description of each clash: location (grid/floor), the conflicting disciplines, the responsible party, and the target resolution date.',
    'وقّعه': 'Signed By',
    'يدعم ملفات BIM حتى 500MB': 'Supports BIM files up to 500MB',
    'يديره الأدمن': 'Managed by the admin',
    'يوم': 'days',
    'يوم تمديد إجمالي': 'Total extension days',
    'يوم لكل تقديم مكتمل': 'Days per completed submission',
    'يوم من الإرسال حتى الرد': 'Days from submission to response',
    '☁️ رُبط النموذج السحابي وأصبح مرئياً في رؤية المشروع': '☁️ Cloud model linked and now visible in Project Vision',
    '✅ أُرسل وسُجّل بانتظار الرد': '✅ Sent and recorded, awaiting response',
    '✅ أُضيف للمستودع وكُوّد تلقائياً': '✅ Added to the repository and coded automatically',
    '✅ أُنشئت الوثيقة وكُوّدت وأُدرجت بالأرشيف': '✅ Document created, coded, and added to the archive',
    '✅ حُدث ربط الكاميرا بالنموذج': '✅ Camera-model link updated',
    '✅ حُدثت بيانات الشركة': '✅ Company details updated',
    '✅ رُفع الملف وكُوّد وأُدرج في الخادم المركزي': '✅ File uploaded, coded, and added to the central server',
    '✅ رُفعت نسخة جديدة — القديمة مؤرشفة في سجل النسخ': '✅ New version uploaded — the previous one is archived in the version history',
    '✅ سُجّل الرد ووُقّع وأُشعر المرسل': '✅ Response recorded, signed, and the sender notified',
    '✅ سُجّل القرار وانعكس أثره على المؤشرات': '✅ Decision recorded and reflected in the metrics',
    '🏗️ انتقلت للمشروع — كل الصفحات الآن تعرض بياناته': '🏗️ Switched to the project — all pages now show its data',

    // History status labels (translated at usage, keys stay raw for lookup)
    'قُدّم للمراجعة': 'Submitted for Review',
    'اعتُمد': 'Approved',
    'أُرجع للمقاول': 'Returned to Contractor',
    'أُعيد التقديم (نسخة معدلة)': 'Resubmitted (Revised Version)',
    'فُتح': 'Opened',

    // BIM document kinds (translated at usage, keys stay raw for lookup)
    'خطة تنفيذ BIM (BEP)': 'BIM Execution Plan (BEP)',
    'خطة تسليم المعلومات (MIDP)': 'Information Delivery Plan (MIDP)',
    'وثيقة BIM أخرى': 'Other BIM Document',

    // BIM template section titles (translated at usage, keys stay raw for data-k lookup)
    'أهداف الـBIM': 'BIM Objectives',
    'الأدوار والمسؤوليات': 'Roles & Responsibilities',
    'معايير النمذجة': 'Modeling Standards',
    'بيئة البيانات المشتركة CDE': 'Common Data Environment (CDE)',
    'جدول تسليم النماذج': 'Model Delivery Schedule',
    'قائمة التسليمات': 'Deliverables List',
    'مواعيد التسليم': 'Delivery Dates',
    'مستويات المعلومات': 'Information Levels',
    'المسؤوليات': 'Responsibilities',
    'نطاق الفحص': 'Inspection Scope',
    'ملخص التعارضات': 'Clash Summary',
    'أبرز التعارضات المفتوحة': 'Key Open Clashes',
    'قرارات الحل': 'Resolution Decisions',
    'حالة النموذج النهائي': 'Final Model Status',
    'التسليمات المكتملة': 'Completed Deliverables',
    'بيانات التشغيل والصيانة': 'O&M Data',
    'الدروس المستفادة': 'Lessons Learned'
  });

  const VS = window.ViewsShared;
  const esc = VS.esc, pill = VS.pill, money = VS.money, toast = VS.toast, modal = VS.modal;

  function contractorName(ctx, id) {
    const c = (ctx.Sall || ctx.S).contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id || '—';
  }

  function fmtSize(n) {
    if (!n) return '—';
    if (n > 1e9) return (n / 1e9).toFixed(2) + ' GB';
    if (n > 1e6) return (n / 1e6).toFixed(1) + ' MB';
    return Math.max(1, Math.round(n / 1e3)) + ' KB';
  }

  const HIST_LABELS = {
    pending: 'قُدّم للمراجعة', approved: 'اعتُمد', approved_notes: 'اعتُمد مع ملاحظات',
    rejected: 'أُرجع للمقاول', resubmitted: 'أُعيد التقديم (نسخة معدلة)', open: 'فُتح', answered: 'تم الرد'
  };

  const SLA_DAYS = 7; // مهلة المراجعة المستهدفة بالأيام

  function daysSince(dateStr) {
    if (!dateStr) return null;
    return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000));
  }

  /** تصدير CSV بترميز يفتح عربياً في Excel */
  function exportCsv(filename, headers, rows) {
    const csv = '﻿' + [headers].concat(rows).map(function (r) {
      return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('📥 ' + I18n.t('صُدّر الملف: ') + filename);
  }

  // ============ 1) تتبع التقديمات: الحالة والتواريخ ومدة المراجعة والسجل الكامل ============
  const SUB_COLS = [
    ['shopDrawings', '📐 ' + I18n.t('مخطط تنفيذي')], ['materials', '🧱 ' + I18n.t('اعتماد مواد')],
    ['scheduleSubmittals', '🗓️ ' + I18n.t('جدول زمني')], ['wirs', '✅ ' + I18n.t('طلب استلام')],
    ['changeOrders', '🔁 ' + I18n.t('أمر تغيير')], ['payments', '💰 ' + I18n.t('مستخلص')],
    ['methodStatements', '🧾 ' + I18n.t('أسلوب تنفيذ/ITP')], ['claims', '⚖️ ' + I18n.t('مطالبة/EOT')],
    ['valueEngineering', '💡 ' + I18n.t('هندسة قيمية')], ['handoverDocs', '📦 ' + I18n.t('مستند تسليم')],
    ['rfis', '❓ ' + I18n.t('استفسار RFI')], ['rfps', '📮 ' + I18n.t('عرض RFP')]
  ];
  const subState = { q: '', status: 'all', type: 'all' };

  function submissionRows(ctx) {
    const rows = [];
    SUB_COLS.forEach(function (t) {
      (ctx.S[t[0]] || []).forEach(function (it) {
        const submitted = (it.history && it.history[0] && it.history[0].date) || it.date || '';
        rows.push({
          col: t[0], typeName: t[1], item: it,
          fileNo: it.docCode || it.ref || '—', title: it.title || '',
          contractor: contractorName(ctx, it.contractorId),
          submitted: submitted, current: it.date || '',
          status: it.status || ''
        });
      });
    });
    rows.sort(function (a, b) { return String(b.current).localeCompare(String(a.current)); });
    return rows;
  }

  function historyModal(ctx, row) {
    const it = row.item;
    const hist = it.history || [];
    const revs = it.revisions || [];
    modal(
      '<h3>🕓 ' + I18n.t('السجل الكامل للتقديم') + '</h3>' +
      '<div class="m-sub">' + row.typeName + ' · <span class="num">' + esc(row.fileNo) + '</span> — ' + esc(row.title) + '</div>' +
      '<div class="card" style="padding:14px">' +
      '<div class="grid g2 small" style="gap:8px">' +
      '<div>📅 ' + I18n.t('تاريخ التقديم: ') + '<b class="num">' + esc(row.submitted || '—') + '</b></div>' +
      '<div>🔎 ' + I18n.t('بدء المراجعة: ') + '<b class="num">' + esc(it.reviewStartDate || it.date || '—') + '</b></div>' +
      '<div>🏁 ' + I18n.t('انتهاء المراجعة: ') + '<b class="num">' + esc(it.reviewEndDate || '—') + '</b></div>' +
      '<div>⏱ ' + I18n.t('مدة المراجعة: ') + '<b class="num">' + (it.reviewDays != null ? it.reviewDays + I18n.t(' يوم') : I18n.t('جارية')) + '</b></div>' +
      '</div>' +
      (revs.length ? '<div class="small mt">🗂 ' + I18n.t('نسخ المستند: ') + '<b class="num">' + (revs.length + 1) + '</b> ' + I18n.t('(النسخ السابقة مؤرشفة بترميزها وقراراتها داخل نفس المستند)') + '</div>' : '') +
      '<div class="mt"><b class="small">' + I18n.t('سجل كل تغييرات الحالة:') + '</b>' +
      (hist.length ?
        '<div class="timeline" style="margin-top:10px">' +
        hist.map(function (h) {
          return '<div class="tl-item"><b class="small">' + esc(I18n.t(HIST_LABELS[h.status] || h.status)) + '</b>' +
            ' <span class="small muted num">' + esc(h.date || '') + '</span>' +
            '<div class="small muted">' + I18n.t('بواسطة: ') + esc(h.by || '—') + (h.role ? ' (' + esc(h.role) + ')' : '') + '</div>' +
            (h.notes ? '<div class="small" style="color:#c6cdda">' + esc(h.notes) + '</div>' : '') + '</div>';
        }).join('') + '</div>'
        : '<div class="small muted mt">' + I18n.t('لا سجل حالات لهذا التقديم بعد') + '</div>') + '</div>' +
      '</div>' +
      '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('إغلاق') + '</button></div>'
    );
  }

  function renderSubmissions(el, ctx) {
    const SLA_DAYS = VS.thresholds(ctx.S.projects[0]).slaReviewDays; // عتبة المشروع الحالي
    const all = submissionRows(ctx);
    const rows = all.filter(function (r) {
      if (subState.type !== 'all' && r.col !== subState.type) return false;
      if (subState.status !== 'all' && r.status !== subState.status) return false;
      if (subState.q) {
        const hay = (r.fileNo + ' ' + (r.item.ref || '') + ' ' + r.title + ' ' + r.contractor).toLowerCase();
        if (hay.indexOf(subState.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    const pending = all.filter(function (r) { return r.status === 'pending' || r.status === 'open'; }).length;
    const done = all.filter(function (r) { return ['approved', 'approved_notes', 'answered'].indexOf(r.status) !== -1; }).length;
    const rejected = all.filter(function (r) { return r.status === 'rejected'; }).length;
    const durations = all.map(function (r) { return r.item.reviewDays; }).filter(function (d) { return d != null; });
    const avgDays = durations.length ? Math.round(durations.reduce(function (a, b) { return a + b; }, 0) / durations.length * 10) / 10 : 0;
    const overdue = all.filter(function (r) {
      return (r.status === 'pending' || r.status === 'open') && (daysSince(r.item.date) || 0) > SLA_DAYS;
    }).length;

    el.innerHTML =
      '<div class="grid g4 mb" style="grid-template-columns:repeat(5,1fr)">' +
      '<div class="card kpi"><div class="lbl">' + I18n.t('إجمالي التقديمات') + '</div><div class="val num">' + all.length + '</div><div class="sub">' + I18n.t('بكل الأنواع') + '</div></div>' +
      '<div class="card kpi k-warn"><div class="lbl">' + I18n.t('قيد المراجعة الآن') + '</div><div class="val num">' + pending + '</div><div class="sub">' + I18n.t('لدى الاستشاري') + '</div></div>' +
      '<div class="card kpi ' + (overdue ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + I18n.t('متأخرة عن المهلة') + '</div><div class="val num">' + overdue + '</div><div class="sub">' + I18n.t('في المراجعة أكثر من ') + SLA_DAYS + I18n.t(' أيام') + '</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">' + I18n.t('معتمد / تم الرد') + '</div><div class="val num">' + done + '</div><div class="sub">' + I18n.t('مرفوض/مرجع: ') + '<b class="num">' + rejected + '</b></div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('متوسط مدة المراجعة') + '</div><div class="val num">' + avgDays + '</div><div class="sub">' + I18n.t('يوم لكل تقديم مكتمل') + '</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0 0 8px">📋 ' + I18n.t('تتبع التقديمات') + ' <span class="hint">' + I18n.t('رقم الملف، الحالة، تواريخ التقديم والمراجعة، المدة، والسجل الكامل للتغييرات') + '</span></h3>' +
      '<button class="btn ghost sm" id="sb-csv">📥 ' + I18n.t('تصدير CSV') + '</button></div>' +
      '<div class="grid" style="grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:14px">' +
      '<input class="inp" id="sb-q" placeholder="🔍 ' + I18n.t('بحث برقم الملف أو الاسم أو الجهة...') + '" value="' + esc(subState.q) + '">' +
      '<select class="inp" id="sb-type"><option value="all">' + I18n.t('كل الأنواع') + '</option>' +
      SUB_COLS.map(function (t) {
        const n = (ctx.S[t[0]] || []).length;
        return n ? '<option value="' + t[0] + '"' + (subState.type === t[0] ? ' selected' : '') + '>' + t[1] + ' (' + n + ')</option>' : '';
      }).join('') + '</select>' +
      '<select class="inp" id="sb-status">' +
      [['all', I18n.t('كل الحالات')], ['pending', I18n.t('قيد المراجعة')], ['approved', I18n.t('معتمد')], ['approved_notes', I18n.t('معتمد مع ملاحظات')], ['rejected', I18n.t('مرجع للتعديل')], ['open', I18n.t('مفتوح')], ['answered', I18n.t('تم الرد')]].map(function (o) {
        return '<option value="' + o[0] + '"' + (subState.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
      (rows.length ?
        '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('رقم الملف') + '</th><th>' + I18n.t('اسم التقديم') + '</th><th>' + I18n.t('النوع') + '</th><th>' + I18n.t('الجهة') + '</th><th>' + I18n.t('تاريخ التقديم') + '</th><th>' + I18n.t('بدء المراجعة') + '</th><th>' + I18n.t('انتهاء المراجعة') + '</th><th>' + I18n.t('المدة') + '</th><th>' + I18n.t('الحالة') + '</th><th>' + I18n.t('النسخ') + '</th><th></th></tr></thead><tbody>' +
        rows.slice(0, 300).map(function (r, i) {
          const it = r.item;
          return '<tr>' +
            '<td class="num small" style="white-space:nowrap"><b style="color:var(--accent2)">' + esc(r.fileNo) + '</b>' +
            (it.ref && it.docCode ? '<div class="muted">' + esc(it.ref) + '</div>' : '') + '</td>' +
            '<td class="small" style="max-width:240px">' + esc(r.title) + '</td>' +
            '<td class="small">' + r.typeName + '</td>' +
            '<td class="small">' + esc(r.contractor) + '</td>' +
            '<td class="small muted num">' + esc(r.submitted || '—') + '</td>' +
            '<td class="small muted num">' + esc(it.reviewStartDate || it.date || '—') + '</td>' +
            '<td class="small muted num">' + esc(it.reviewEndDate || '—') + '</td>' +
            '<td class="num small">' + (it.reviewDays != null
              ? '<b>' + it.reviewDays + '</b> ' + I18n.t('يوم')
              : (function () {
                  const d = daysSince(it.date) || 0;
                  return d > SLA_DAYS
                    ? '<span class="pill p-danger" style="font-size:10px">⏰ ' + I18n.t('متأخرة — ') + d + I18n.t(' يوم') + '</span>'
                    : '<span class="muted">' + I18n.t('جارية منذ ') + d + I18n.t(' يوم') + '</span>';
                })()) + '</td>' +
            '<td>' + pill(r.status) + '</td>' +
            '<td class="num small">' + ((it.revisions || []).length + 1) + '</td>' +
            '<td><div class="flex" style="gap:6px">' + window.DrawingViewer.btn(it) +
            '<button class="btn ghost sm" data-hist="' + i + '">🕓 ' + I18n.t('السجل') + '</button></div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📋</div>' + I18n.t('لا تقديمات مطابقة') + '</div>') +
      '</div>';

    el.querySelector('#sb-csv').addEventListener('click', function () {
      exportCsv('bassir-submissions.csv',
        [I18n.t('رقم الملف'), I18n.t('المرجع'), I18n.t('اسم التقديم'), I18n.t('النوع'), I18n.t('الجهة'), I18n.t('تاريخ التقديم'), I18n.t('بدء المراجعة'), I18n.t('انتهاء المراجعة'), I18n.t('مدة المراجعة (يوم)'), I18n.t('الحالة'), I18n.t('عدد النسخ')],
        rows.map(function (r) {
          const it = r.item;
          return [r.fileNo, it.ref || '', r.title, r.typeName.replace(/^\S+\s/, ''), r.contractor,
            r.submitted, it.reviewStartDate || it.date || '', it.reviewEndDate || '',
            it.reviewDays != null ? it.reviewDays : I18n.t('جارية'), r.status, (it.revisions || []).length + 1];
        }));
    });
    el.querySelector('#sb-type').addEventListener('change', function (e) { subState.type = e.target.value; renderSubmissions(el, ctx); });
    el.querySelector('#sb-status').addEventListener('change', function (e) { subState.status = e.target.value; renderSubmissions(el, ctx); });
    const q = el.querySelector('#sb-q');
    q.addEventListener('input', function () {
      subState.q = q.value; renderSubmissions(el, ctx);
      const q2 = el.querySelector('#sb-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });
    el.querySelectorAll('[data-hist]').forEach(function (b) {
      b.addEventListener('click', function () { historyModal(ctx, rows[Number(b.getAttribute('data-hist'))]); });
    });
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const r = rows.find(function (x) { return x.item.id === b.getAttribute('data-dview'); });
        if (!r) return;
        const isStaff = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
        window.DrawingViewer.open(ctx, r.col, r.item, {
          canEdit: isStaff, canReview: isStaff && r.item.status === 'pending',
          canRespond: ctx.U.role === 'contractor'
        });
      });
    });
  }

  // ============ 2) الاستفسارات والعروض RFI / RFP: إرسال، ردود، ومدد الاستجابة ============
  const rfxState = { tab: 'rfis' };

  function turnaround(it) {
    if (!it.signDate || !it.date) return null;
    return Math.max(0, Math.round((new Date(it.signDate) - new Date(it.date)) / 86400000));
  }

  function renderRfx(el, ctx) {
    const SLA_DAYS = VS.thresholds(ctx.S.projects[0]).slaReviewDays; // عتبة المشروع الحالي
    const tab = rfxState.tab;
    const isRfp = tab === 'rfps';
    const items = (ctx.S[tab] || []).slice().sort(function (a, b) {
      return (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1);
    });
    const canAnswer = ['consultant', 'admin', 'owner_rep', 'owner'].indexOf(ctx.U.role) !== -1;
    const open = items.filter(function (x) { return x.status === 'open'; }).length;
    const answered = items.filter(function (x) { return x.status === 'answered'; });
    const tds = answered.map(turnaround).filter(function (d) { return d != null; });
    const avgTd = tds.length ? Math.round(tds.reduce(function (a, b) { return a + b; }, 0) / tds.length * 10) / 10 : 0;

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'rfis' ? 'active' : '') + '" data-xtab="rfis">❓ ' + I18n.t('استفسارات RFI') + '</div>' +
      '<div class="tab ' + (tab === 'rfps' ? 'active' : '') + '" data-xtab="rfps">📮 ' + I18n.t('طلبات وعروض RFP') + '</div>' +
      '</div>' +
      '<div class="grid g3 mb">' +
      '<div class="card kpi ' + (open ? 'k-warn' : 'k-ok') + '"><div class="lbl">' + I18n.t('بانتظار الرد') + '</div><div class="val num">' + open + '</div><div class="sub">' + (isRfp ? I18n.t('لدى الاستشاري أو المالك') : I18n.t('لدى الاستشاري')) + '</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">' + I18n.t('تم الرد عليها') + '</div><div class="val num">' + answered.length + '</div><div class="sub">' + I18n.t('بسجل ردود موثق وموقع') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('متوسط مدة الاستجابة') + '</div><div class="val num">' + avgTd + '</div><div class="sub">' + I18n.t('يوم من الإرسال حتى الرد') + '</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;margin-bottom:8px;flex-wrap:wrap">' +
      '<h3 style="margin:0">' + (isRfp ? '📮 ' + I18n.t('طلبات العروض والمقترحات RFP') + ' <span class="hint">' + I18n.t('تُوجه للاستشاري أو للمالك مع تتبع الردود ومددها') + '</span>' : '❓ ' + I18n.t('الاستفسارات الفنية RFI')) + '</h3>' +
      '<div class="flex"><button class="btn ghost sm" id="rx-csv">📥 ' + I18n.t('تصدير CSV') + '</button>' +
      '<button class="btn sm" id="rx-add">➕ ' + I18n.t(isRfp ? 'إرسال RFP جديد' : 'إرسال RFI جديد') + '</button></div></div>' +
      (items.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('المرجع') + '</th><th>' + I18n.t('الموضوع') + '</th><th>' + I18n.t('من') + '</th>' + (isRfp ? '<th>' + I18n.t('موجه إلى') + '</th>' : '') +
        '<th>' + I18n.t('تاريخ الإرسال') + '</th><th>' + I18n.t('الحالة') + '</th><th>' + I18n.t('الرد وتاريخه') + '</th><th>' + I18n.t('مدة الاستجابة') + '</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          const td = turnaround(it);
          return '<tr><td class="num small"><b>' + esc(it.ref || '') + '</b>' +
            (it.docCode ? '<div class="muted" style="font-size:10px;color:var(--accent2)">' + esc(it.docCode) + '</div>' : '') + '</td>' +
            '<td style="max-width:280px">' + esc(it.title) +
            (it.question ? '<div class="small muted">' + esc(it.question) + '</div>' : '') + '</td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            (isRfp ? '<td class="small">' + (it.to === 'owner' ? '👁 ' + I18n.t('المالك') : '📐 ' + I18n.t('الاستشاري')) + '</td>' : '') +
            '<td class="small muted num">' + esc(it.date) + '</td>' +
            '<td>' + pill(it.status) + '</td>' +
            '<td class="small" style="max-width:260px">' + (it.answer ? '<span style="color:var(--ok)">' + esc(it.answer) + '</span>' +
              (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') : '<span class="muted">—</span>') + '</td>' +
            '<td class="num small">' + (td != null
              ? '<b>' + td + '</b> ' + I18n.t('يوم')
              : it.status === 'open'
                ? (function () {
                    const d = daysSince(it.date) || 0;
                    return d > SLA_DAYS
                      ? '<span class="pill p-danger" style="font-size:10px">⏰ ' + I18n.t('بلا رد منذ ') + d + I18n.t(' يوم') + '</span>'
                      : '<span class="muted">' + I18n.t('بانتظار الرد منذ ') + d + I18n.t(' يوم') + '</span>';
                  })()
                : '<span class="muted">—</span>') + '</td>' +
            '<td>' + (canAnswer && it.status === 'open' ? '<button class="btn sm" data-ans="' + it.id + '">↩️ ' + I18n.t('رد') + '</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>' + I18n.t('لا سجلات — أرسل أول ') + (isRfp ? 'RFP' : 'RFI') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-xtab]').forEach(function (t) {
      t.addEventListener('click', function () { rfxState.tab = t.getAttribute('data-xtab'); renderRfx(el, ctx); });
    });
    el.querySelector('#rx-csv').addEventListener('click', function () {
      exportCsv(isRfp ? 'bassir-rfp.csv' : 'bassir-rfi.csv',
        [I18n.t('المرجع'), I18n.t('الكود'), I18n.t('الموضوع'), I18n.t('من'), I18n.t('موجه إلى'), I18n.t('تاريخ الإرسال'), I18n.t('الحالة'), I18n.t('الرد'), I18n.t('وقّعه'), I18n.t('تاريخ الرد'), I18n.t('مدة الاستجابة (يوم)')],
        items.map(function (it) {
          return [it.ref || '', it.docCode || '', it.title, contractorName(ctx, it.contractorId),
            isRfp ? (it.to === 'owner' ? I18n.t('المالك') : I18n.t('الاستشاري')) : I18n.t('الاستشاري'),
            it.date, it.status, it.answer || '', it.signature || '', it.signDate || '',
            turnaround(it) != null ? turnaround(it) : ''];
        }));
    });
    el.querySelector('#rx-add').addEventListener('click', function () {
      const m = modal(
        '<h3>➕ ' + I18n.t('إرسال ') + I18n.t(isRfp ? 'طلب عرض RFP' : 'استفسار RFI') + '</h3>' +
        (ctx.U.role !== 'contractor' ?
          '<label class="fl">' + I18n.t('باسم المقاول') + '</label><select class="inp" id="rx-cont">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' : '') +
        (isRfp ? '<label class="fl">' + I18n.t('موجه إلى') + '</label><select class="inp" id="rx-to"><option value="consultant">📐 ' + I18n.t('الاستشاري') + '</option><option value="owner">👁 ' + I18n.t('المالك') + '</option></select>' : '') +
        '<label class="fl">' + I18n.t('المرجع') + '</label><input class="inp num" id="rx-ref" placeholder="' + (isRfp ? 'RFP-001' : 'RFI-001') + '">' +
        '<label class="fl">' + I18n.t('الموضوع') + '</label><input class="inp" id="rx-title">' +
        '<label class="fl">' + I18n.t(isRfp ? 'تفاصيل العرض / الطلب' : 'نص الاستفسار') + '</label><textarea class="inp" id="rx-q" rows="4"></textarea>' +
        '<label class="fl">' + I18n.t('مرفق (اختياري)') + '</label><input class="inp" id="rx-file" type="file">' +
        '<div class="m-actions"><button class="btn" id="rx-ok">' + I18n.t('إرسال') + '</button><button class="btn mutedb" id="rx-cancel">' + I18n.t('إلغاء') + '</button></div>'
      );
      m.querySelector('#rx-cancel').addEventListener('click', function () { m.remove(); });
      m.querySelector('#rx-ok').addEventListener('click', async function () {
        const title = m.querySelector('#rx-title').value.trim();
        if (!title) { toast(I18n.t('أدخل الموضوع'), true); return; }
        const data = {
          ref: m.querySelector('#rx-ref').value || (isRfp ? 'RFP-' : 'RFI-') + Math.floor(Math.random() * 900 + 100),
          title: title, question: m.querySelector('#rx-q').value, status: 'open'
        };
        const cs = m.querySelector('#rx-cont');
        if (cs) data.contractorId = cs.value;
        if (isRfp) data.to = m.querySelector('#rx-to').value;
        const rf = m.querySelector('#rx-file').files[0];
        if (rf) data.file = await Api.upload(rf);
        try {
          await Api.create(tab, data);
          m.remove(); toast(I18n.t('✅ أُرسل وسُجّل بانتظار الرد')); ctx.refresh();
        } catch (e) { toast(e.message, true); }
      });
    });
    el.querySelectorAll('[data-ans]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-ans'); });
        const m = modal(
          '<h3>↩️ ' + I18n.t('الرد على: ') + esc(it.title) + '</h3>' +
          '<div class="m-sub">' + esc(it.ref || '') + ' · ' + I18n.t('من ') + esc(contractorName(ctx, it.contractorId)) + ' · ' + I18n.t('أُرسل ') + esc(it.date) + '</div>' +
          (it.question ? '<div class="card" style="padding:12px;margin-bottom:8px"><div class="small">' + esc(it.question) + '</div></div>' : '') +
          '<label class="fl">' + I18n.t('نص الرد (يُوثق بتوقيعك وتاريخه)') + '</label><textarea class="inp" id="an-text" rows="4"></textarea>' +
          '<div class="m-actions"><button class="btn" id="an-ok">' + I18n.t('اعتماد الرد وتوقيعه') + '</button><button class="btn mutedb" id="an-cancel">' + I18n.t('إلغاء') + '</button></div>'
        );
        m.querySelector('#an-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#an-ok').addEventListener('click', async function () {
          const txt = m.querySelector('#an-text').value.trim();
          if (!txt) { toast(I18n.t('اكتب الرد أولاً'), true); return; }
          try {
            await Api.update(tab, it.id, {
              answer: txt, status: 'answered',
              signature: ctx.U.name, signDate: new Date().toISOString().slice(0, 10)
            });
            m.remove(); toast(I18n.t('✅ سُجّل الرد ووُقّع وأُشعر المرسل')); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  }

  // ============ 3) أوامر التغيير والتعديلات: أثر التكلفة والمدة ودورة الاعتماد ============
  function renderVariations(el, ctx) {
    const items = (ctx.S.changeOrders || []).slice().sort(function (a, b) {
      return (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1);
    });
    const canReview = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const appr = items.filter(function (x) { return x.status === 'approved' || x.status === 'approved_notes'; });
    const pend = items.filter(function (x) { return x.status === 'pending'; });
    const costAppr = appr.reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    const costPend = pend.reduce(function (a, b) { return a + (b.amount || 0); }, 0);
    const daysAppr = appr.reduce(function (a, b) { return a + (b.days || 0); }, 0);
    const P = ctx.S.projects[0] || {};
    const budget = P.budgetPlanned || 0;

    function stageChips(it) {
      const done = it.status !== 'pending';
      const ok = it.status === 'approved' || it.status === 'approved_notes';
      return '<div class="flex" style="gap:4px;flex-wrap:wrap">' +
        '<span class="pill p-ok" style="font-size:10px">1. ' + I18n.t('مُقدَّم ✓') + '</span>' +
        '<span class="pill ' + (done ? 'p-ok' : 'p-warn') + '" style="font-size:10px">2. ' + I18n.t('مراجعة الاستشاري') + (done ? ' ✓' : '...') + '</span>' +
        '<span class="pill ' + (!done ? 'p-muted' : ok ? 'p-ok' : 'p-danger') + '" style="font-size:10px">3. ' + (!done ? I18n.t('القرار') : ok ? I18n.t('معتمد ✓') : I18n.t('مرفوض ✗')) + '</span>' +
        '</div>';
    }

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi k-warn"><div class="lbl">' + I18n.t('قيد الاعتماد') + '</div><div class="val num">' + pend.length + '</div><div class="sub">' + I18n.t('بقيمة ') + money(costPend) + '</div></div>' +
      '<div class="card kpi ' + (costAppr > 0 ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + I18n.t('أثر التكلفة المعتمد') + '</div><div class="val">' + money(costAppr) + '</div>' +
      '<div class="sub num">' + (budget ? (costAppr / budget * 100).toFixed(1) + I18n.t('% من الميزانية') : '—') + '</div></div>' +
      '<div class="card kpi ' + (daysAppr ? 'k-warn' : 'k-ok') + '"><div class="lbl">' + I18n.t('أثر الجدول الزمني المعتمد') + '</div><div class="val num">+' + daysAppr + '</div><div class="sub">' + I18n.t('يوم تمديد إجمالي') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('إجمالي الأوامر') + '</div><div class="val num">' + items.length + '</div><div class="sub">' + I18n.t('معتمد: ') + '<b class="num">' + appr.length + '</b></div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0 0 8px">🔁 ' + I18n.t('أوامر التغيير وطلبات التعديل') + ' <span class="hint">' + I18n.t('دورة اعتماد كاملة مع تتبع أثر التكلفة والجدول الزمني') + '</span></h3>' +
      '<button class="btn ghost sm" id="vr-csv">📥 ' + I18n.t('تصدير CSV') + '</button></div>' +
      (items.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('المرجع') + '</th><th>' + I18n.t('الوصف') + '</th><th>' + I18n.t('الجهة') + '</th><th>' + I18n.t('أثر التكلفة') + '</th><th>' + I18n.t('أثر المدة') + '</th><th>' + I18n.t('دورة الاعتماد') + '</th><th>' + I18n.t('القرار') + '</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          return '<tr><td class="num small"><b>' + esc(it.ref || '') + '</b>' +
            (it.docCode ? '<div class="muted" style="font-size:10px;color:var(--accent2)">' + esc(it.docCode) + '</div>' : '') + '</td>' +
            '<td style="max-width:260px">' + esc(it.title) + '<div class="small muted num">' + esc(it.date || '') + '</div></td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            '<td>' + money(it.amount) + '</td>' +
            '<td class="num small">+' + (it.days || 0) + I18n.t(' يوم') + '</td>' +
            '<td>' + stageChips(it) + '</td>' +
            '<td class="small" style="max-width:200px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
            (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td>' +
            '<td><div class="flex" style="gap:6px">' + window.DrawingViewer.btn(it) +
            (canReview && it.status === 'pending' ? '<button class="btn sm" data-vrev="' + it.id + '">✍️ ' + I18n.t('قرار') + '</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🔁</div>' + I18n.t('لا أوامر تغيير بعد') + '</div>') +
      '</div>';

    el.querySelector('#vr-csv').addEventListener('click', function () {
      exportCsv('bassir-variations.csv',
        [I18n.t('المرجع'), I18n.t('الكود'), I18n.t('الوصف'), I18n.t('الجهة'), I18n.t('أثر التكلفة (ر.س)'), I18n.t('أثر المدة (يوم)'), I18n.t('التاريخ'), I18n.t('الحالة'), I18n.t('القرار'), I18n.t('وقّعه')],
        items.map(function (it) {
          return [it.ref || '', it.docCode || '', it.title, contractorName(ctx, it.contractorId),
            it.amount || 0, it.days || 0, it.date || '', it.status, it.notes || '', it.signature || ''];
        }));
    });
    el.querySelectorAll('[data-vrev]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-vrev'); });
        const m = modal(
          '<h3>✍️ ' + I18n.t('قرار أمر التغيير: ') + esc(it.title) + '</h3>' +
          '<div class="m-sub">' + I18n.t('أثر التكلفة ') + money(it.amount) + ' · ' + I18n.t('أثر المدة ') + '+' + (it.days || 0) + I18n.t(' يوم') + '</div>' +
          '<label class="fl">' + I18n.t('القرار') + '</label><select class="inp" id="vr-status">' +
          '<option value="approved">✅ ' + I18n.t('اعتماد') + '</option><option value="approved_notes">📝 ' + I18n.t('اعتماد مع ملاحظات') + '</option>' +
          '<option value="rejected">❌ ' + I18n.t('رفض وإرجاع') + '</option></select>' +
          '<label class="fl">' + I18n.t('الملاحظات') + '</label><textarea class="inp" id="vr-notes" rows="3"></textarea>' +
          '<div class="m-actions"><button class="btn" id="vr-ok">' + I18n.t('تأكيد وتوقيع') + '</button><button class="btn mutedb" id="vr-cancel">' + I18n.t('إلغاء') + '</button></div>'
        );
        m.querySelector('#vr-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#vr-ok').addEventListener('click', async function () {
          try {
            await Api.review({ collection: 'changeOrders', id: it.id, status: m.querySelector('#vr-status').value, notes: m.querySelector('#vr-notes').value });
            m.remove(); toast(I18n.t('✅ سُجّل القرار وانعكس أثره على المؤشرات')); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-dview'); });
        if (it) window.DrawingViewer.open(ctx, 'changeOrders', it, { canEdit: canReview, canReview: canReview && it.status === 'pending' });
      });
    });
  }

  // ============ 4) قاعدة بيانات المقاولين: بيانات الشركات والوثائق القانونية ============
  function renderContractorDb(el, ctx) {
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const list = ctx.S.contractors || [];

    function chips(arr, cls) {
      if (!arr || !arr.length) return '<span class="muted small">—</span>';
      return arr.map(function (x) { return '<span class="pill ' + (cls || 'p-muted') + '" style="font-size:10.5px;margin:2px">' + esc(x) + '</span>'; }).join(' ');
    }

    el.innerHTML =
      '<div class="card mb"><h3>🗃️ ' + I18n.t('قاعدة بيانات المقاولين') + ' <span class="hint">' + I18n.t('بيانات الشركة كاملة: العنوان، مسؤول التواصل، السجل التجاري، الرخص والشهادات والوثائق القانونية') + '</span></h3></div>' +
      '<div class="grid g2">' +
      list.map(function (c) {
        const d = VS.discOf(ctx, c.type);
        return '<div class="card"><div class="flex" style="justify-content:space-between">' +
          '<h3 style="margin:0">' + d.icon + ' ' + esc(c.name) + '</h3>' +
          (canEdit ? '<button class="btn ghost sm" data-cedit="' + c.id + '">✏️ ' + I18n.t('تحديث البيانات') + '</button>' : '') + '</div>' +
          '<div class="grid g2 small" style="gap:8px;margin-top:12px">' +
          '<div>🏷️ ' + I18n.t('التخصص: ') + '<b>' + esc(d.name) + '</b></div>' +
          '<div>📄 ' + I18n.t('السجل التجاري: ') + '<b class="num">' + esc(c.crNumber || '—') + '</b></div>' +
          '<div>📍 ' + I18n.t('العنوان: ') + esc(c.address || '—') + '</div>' +
          '<div>👤 ' + I18n.t('مسؤول التواصل: ') + '<b>' + esc(c.contactPerson || '—') + '</b></div>' +
          '<div>📞 ' + I18n.t('الهاتف: ') + '<b class="num" dir="ltr">' + esc(c.phone || '—') + '</b></div>' +
          '<div>📧 ' + I18n.t('البريد: ') + '<b class="num" dir="ltr">' + esc(c.email || '—') + '</b></div>' +
          '<div>💰 ' + I18n.t('قيمة العقد: ') + money(c.contractValue) + '</div>' +
          '<div>🗓️ ' + I18n.t('المدة: ') + '<span class="num">' + esc(c.startDate || '') + ' ← ' + esc(c.endDate || '') + '</span></div>' +
          '</div>' +
          '<div class="small mt"><b>🪪 ' + I18n.t('الرخص:') + '</b> ' + chips(c.licenses, 'p-info') + '</div>' +
          '<div class="small mt"><b>🎖️ ' + I18n.t('الشهادات والتصنيفات:') + '</b> ' + chips(c.certifications, 'p-ok') + '</div>' +
          '<div class="small mt"><b>⚖️ ' + I18n.t('الوثائق القانونية:') + '</b> ' + chips(c.legalDocs) + '</div>' +
          '</div>';
      }).join('') + '</div>' +
      (!list.length ? '<div class="empty"><div class="e-ico">🗃️</div>' + I18n.t('لا مقاولون بعد — أضفهم من صفحة إدارة المقاولين') + '</div>' : '');

    el.querySelectorAll('[data-cedit]').forEach(function (b) {
      b.addEventListener('click', function () {
        const c = list.find(function (x) { return x.id === b.getAttribute('data-cedit'); });
        const m = modal(
          '<h3>✏️ ' + I18n.t('بيانات الشركة: ') + esc(c.name) + '</h3>' +
          '<div class="grid g2"><div><label class="fl">' + I18n.t('العنوان') + '</label><input class="inp" id="ce-address" value="' + esc(c.address || '') + '"></div>' +
          '<div><label class="fl">' + I18n.t('مسؤول التواصل') + '</label><input class="inp" id="ce-contact" value="' + esc(c.contactPerson || '') + '"></div></div>' +
          '<div class="grid g2"><div><label class="fl">' + I18n.t('الهاتف') + '</label><input class="inp num" id="ce-phone" value="' + esc(c.phone || '') + '"></div>' +
          '<div><label class="fl">' + I18n.t('البريد الإلكتروني') + '</label><input class="inp num" id="ce-email" dir="ltr" value="' + esc(c.email || '') + '"></div></div>' +
          '<label class="fl">' + I18n.t('رقم السجل التجاري') + '</label><input class="inp num" id="ce-cr" value="' + esc(c.crNumber || '') + '">' +
          '<label class="fl">' + I18n.t('الرخص (سطر لكل رخصة)') + '</label><textarea class="inp" id="ce-lic" rows="2">' + esc((c.licenses || []).join('\n')) + '</textarea>' +
          '<label class="fl">' + I18n.t('الشهادات والتصنيفات (سطر لكل شهادة)') + '</label><textarea class="inp" id="ce-cert" rows="2">' + esc((c.certifications || []).join('\n')) + '</textarea>' +
          '<label class="fl">' + I18n.t('الوثائق القانونية (سطر لكل وثيقة)') + '</label><textarea class="inp" id="ce-legal" rows="2">' + esc((c.legalDocs || []).join('\n')) + '</textarea>' +
          '<div class="m-actions"><button class="btn" id="ce-ok">' + I18n.t('حفظ البيانات') + '</button><button class="btn mutedb" id="ce-cancel">' + I18n.t('إلغاء') + '</button></div>'
        );
        m.querySelector('#ce-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#ce-ok').addEventListener('click', async function () {
          try {
            await Api.update('contractors', c.id, {
              address: m.querySelector('#ce-address').value,
              contactPerson: m.querySelector('#ce-contact').value,
              phone: m.querySelector('#ce-phone').value,
              email: m.querySelector('#ce-email').value,
              crNumber: m.querySelector('#ce-cr').value,
              licenses: m.querySelector('#ce-lic').value.split('\n').filter(Boolean),
              certifications: m.querySelector('#ce-cert').value.split('\n').filter(Boolean),
              legalDocs: m.querySelector('#ce-legal').value.split('\n').filter(Boolean)
            });
            m.remove(); toast(I18n.t('✅ حُدثت بيانات الشركة')); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  }

  // ============ 5) خادم الملفات المركزي: تخزين آمن، نسخ، واسترجاع ============
  const fsState = { q: '', cat: 'all' };
  const DOC_CATEGORIES = ['العقود', 'جداول الكميات BOQ', 'التصاميم الأولية', 'مخططات IFC', 'المواصفات', 'متطلبات المالك', 'وثائق فنية', 'تقارير', 'أخرى'];

  function renderFileServer(el, ctx) {
    const files = (ctx.S.files || []).filter(function (f) {
      if (fsState.cat !== 'all' && (f.category || 'أخرى') !== fsState.cat) return false;
      if (fsState.q) {
        const hay = ((f.name || '') + ' ' + (f.docCode || '') + ' ' + (f.by || '')).toLowerCase();
        if (hay.indexOf(fsState.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    const totalSize = (ctx.S.files || []).reduce(function (a, f) { return a + (f.size || 0); }, 0);
    const totalVers = (ctx.S.files || []).reduce(function (a, f) { return a + (f.versions || []).length; }, 0);
    const isAdmin = ctx.U.role === 'admin';

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">' + I18n.t('الملفات المخزنة') + '</div><div class="val num">' + (ctx.S.files || []).length + '</div><div class="sub">' + I18n.t('تخزين مركزي آمن ومُكوَّد') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('الحجم الإجمالي') + '</div><div class="val num" style="font-size:20px">' + fmtSize(totalSize) + '</div><div class="sub">' + I18n.t('يدعم ملفات BIM حتى 500MB') + '</div></div>' +
      '<div class="card kpi k-ok"><div class="lbl">' + I18n.t('نسخ الإصدارات المؤرشفة') + '</div><div class="val num">' + totalVers + '</div><div class="sub">' + I18n.t('تاريخ نسخ كامل بلا تكرار ملفات') + '</div></div>' +
      '<div class="card kpi ' + (isAdmin ? 'k-warn' : '') + '"><div class="lbl">' + I18n.t('النسخ الاحتياطي') + '</div><div class="val" style="font-size:16px">' +
      (isAdmin ? '<button class="btn sm" id="fs-backup">🛡 ' + I18n.t('نسخة احتياطية الآن') + '</button>' : '<span class="small muted">' + I18n.t('يديره الأدمن') + '</span>') + '</div>' +
      '<div class="sub" id="fs-backups-info">' + I18n.t('نسخ كاملة لقاعدة البيانات') + '</div></div>' +
      '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;margin-bottom:12px">' +
      '<h3 style="margin:0">🗄️ ' + I18n.t('خادم الملفات المركزي') + ' <span class="hint">' + I18n.t('استرجاع سهل، سجل نسخ لكل ملف، وتنظيم بالفئات') + '</span></h3>' +
      '<div class="flex"><input class="inp" id="fs-upfile" type="file" style="max-width:220px">' +
      '<select class="inp" id="fs-upcat" style="max-width:170px">' +
      DOC_CATEGORIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
      '<button class="btn sm" id="fs-up">⬆ ' + I18n.t('رفع للخادم') + '</button></div></div>' +
      '<div class="grid" style="grid-template-columns:2fr 1fr;gap:10px;margin-bottom:14px">' +
      '<input class="inp" id="fs-q" placeholder="🔍 ' + I18n.t('بحث بالاسم أو الكود أو الرافع...') + '" value="' + esc(fsState.q) + '">' +
      '<select class="inp" id="fs-cat"><option value="all">' + I18n.t('كل الفئات') + '</option>' +
      DOC_CATEGORIES.map(function (c) {
        const n = (ctx.S.files || []).filter(function (f) { return (f.category || 'أخرى') === c; }).length;
        return n ? '<option' + (fsState.cat === c ? ' selected' : '') + '>' + c + '</option>' : '';
      }).join('') + '</select></div>' +
      (files.length ?
        '<div class="tbl-wrap" style="max-height:55vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('الكود') + '</th><th>' + I18n.t('الملف') + '</th><th>' + I18n.t('الفئة') + '</th><th>' + I18n.t('الحجم') + '</th><th>' + I18n.t('رفعه') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('النسخ') + '</th><th></th></tr></thead><tbody>' +
        files.map(function (f, i) {
          const nv = (f.versions || []).length;
          return '<tr><td class="num small" style="white-space:nowrap"><b style="color:var(--accent2)">' + esc(f.docCode || '—') + '</b></td>' +
            '<td class="small" style="max-width:260px;direction:ltr;text-align:right">📎 ' + esc(f.name || '') + '</td>' +
            '<td class="small"><span class="pill p-muted">' + esc(f.category || 'أخرى') + '</span></td>' +
            '<td class="small num">' + fmtSize(f.size) + '</td>' +
            '<td class="small">' + esc(f.by || '—') + '</td>' +
            '<td class="small muted num">' + esc(f.date || '') + '</td>' +
            '<td class="num small">' + (nv ? '<button class="btn ghost sm" data-vers="' + i + '">🗂 ' + (nv + 1) + '</button>' : '1') + '</td>' +
            '<td><div class="flex" style="gap:6px">' +
            (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ ' + I18n.t('تحميل') + '</a>' : '') +
            '<button class="btn mutedb sm" data-newver="' + i + '">⬆ ' + I18n.t('نسخة جديدة') + '</button></div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🗄️</div>' + I18n.t('لا ملفات مطابقة — ارفع أول ملف للخادم المركزي') + '</div>') +
      '<input type="file" id="fs-verfile" style="display:none">' +
      '</div>';

    el.querySelector('#fs-cat').addEventListener('change', function (e) { fsState.cat = e.target.value; renderFileServer(el, ctx); });
    const q = el.querySelector('#fs-q');
    q.addEventListener('input', function () {
      fsState.q = q.value; renderFileServer(el, ctx);
      const q2 = el.querySelector('#fs-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });

    el.querySelector('#fs-up').addEventListener('click', async function () {
      const f = el.querySelector('#fs-upfile').files[0];
      if (!f) { toast(I18n.t('اختر ملفاً أولاً'), true); return; }
      try {
        await Api.upload(f, { category: el.querySelector('#fs-upcat').value });
        toast(I18n.t('✅ رُفع الملف وكُوّد وأُدرج في الخادم المركزي')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    // نسخة جديدة لملف قائم: تؤرشف السابقة في versions بلا سجل مكرر
    let verTarget = null;
    const verInput = el.querySelector('#fs-verfile');
    el.querySelectorAll('[data-newver]').forEach(function (b) {
      b.addEventListener('click', function () { verTarget = files[Number(b.getAttribute('data-newver'))]; verInput.click(); });
    });
    verInput.addEventListener('change', async function () {
      const f = verInput.files[0];
      if (!f || !verTarget) return;
      try {
        await Api.upload(f, { versionOf: verTarget.id });
        toast(I18n.t('✅ رُفعت نسخة جديدة — القديمة مؤرشفة في سجل النسخ')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    el.querySelectorAll('[data-vers]').forEach(function (b) {
      b.addEventListener('click', function () {
        const f = files[Number(b.getAttribute('data-vers'))];
        modal(
          '<h3>🗂 ' + I18n.t('سجل نسخ الملف') + '</h3><div class="m-sub num">' + esc(f.docCode || '') + '</div>' +
          '<div class="card" style="padding:12px">' +
          '<div class="flex" style="justify-content:space-between"><b class="small" style="direction:ltr">📎 ' + esc(f.name) + '</b><span class="pill p-ok">' + I18n.t('الحالية') + '</span></div>' +
          '<div class="small muted num">' + esc(f.date || '') + ' · ' + fmtSize(f.size) + ' · ' + esc(f.by || '') + '</div></div>' +
          (f.versions || []).slice().reverse().map(function (v) {
            return '<div class="card" style="padding:12px;margin-top:8px">' +
              '<div class="flex" style="justify-content:space-between"><b class="small" style="direction:ltr">📎 ' + esc(v.name) + '</b><span class="pill p-muted">' + I18n.t('نسخة ') + v.v + '</span></div>' +
              '<div class="small muted num">' + esc(v.date || '') + ' · ' + fmtSize(v.size) + ' · ' + esc(v.by || '') + '</div>' +
              (v.url ? '<a class="btn ghost sm" style="margin-top:6px" href="' + esc(v.url) + '" target="_blank">⬇ ' + I18n.t('استرجاع هذه النسخة') + '</a>' : '') + '</div>';
          }).join('') +
          '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('إغلاق') + '</button></div>'
        );
      });
    });

    if (isAdmin) {
      el.querySelector('#fs-backup').addEventListener('click', async function () {
        try {
          const r = await Api.backup();
          toast('🛡 ' + I18n.t('أُنشئت نسخة احتياطية كاملة: ') + (r.file || ''));
          loadBackups();
        } catch (e) { toast(e.message, true); }
      });
      function loadBackups() {
        Api.backups().then(function (list) {
          const info = el.querySelector('#fs-backups-info');
          if (info && list.length) info.innerHTML = '<b class="num">' + list.length + '</b> ' + I18n.t('نسخة — آخرها ') + esc(list[0].date || '');
        }).catch(function () { /* تجاهل */ });
      }
      loadBackups();
    }
  }

  // ============ 6) وثائق المشروع: مستودع لكل مشروع حسب الفئة ============
  const pdState = { cat: null };
  const CAT_ICONS = { 'العقود': '📜', 'جداول الكميات BOQ': '📊', 'التصاميم الأولية': '🎨', 'مخططات IFC': '📐', 'المواصفات': '📘', 'متطلبات المالك': '👁', 'وثائق فنية': '🔧', 'تقارير': '📝', 'أخرى': '📎' };

  function renderProjectDocs(el, ctx) {
    const P = ctx.S.projects[0] || {};
    const files = ctx.S.files || [];
    const byCat = {};
    DOC_CATEGORIES.forEach(function (c) { byCat[c] = []; });
    files.forEach(function (f) { (byCat[f.category || 'أخرى'] = byCat[f.category || 'أخرى'] || []).push(f); });
    const canUp = ctx.U.role !== 'owner';

    const sel = pdState.cat;
    el.innerHTML =
      '<div class="card mb"><h3>📁 ' + I18n.t('وثائق المشروع: ') + esc(P.name || '') + ' <span class="hint">' + I18n.t('مستودع مستندات هذا المشروع — كل ما يخصه في مكان واحد مُكوَّد') + '</span></h3>' +
      (canUp ? '<div class="flex mt"><input class="inp" id="pd2-file" type="file" style="max-width:240px">' +
        '<select class="inp" id="pd2-cat" style="max-width:190px">' +
        DOC_CATEGORIES.map(function (c) { return '<option' + (sel === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
        '<button class="btn sm" id="pd2-up">⬆ ' + I18n.t('إضافة للمستودع') + '</button></div>' : '') + '</div>' +

      '<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px" class="mb">' +
      DOC_CATEGORIES.map(function (c) {
        const n = (byCat[c] || []).length;
        return '<div class="card" data-pcat="' + esc(c) + '" style="cursor:pointer;padding:16px;border-color:' + (sel === c ? 'var(--accent)' : 'var(--border)') + '">' +
          '<div class="flex" style="justify-content:space-between"><b>' + (CAT_ICONS[c] || '📎') + ' ' + esc(c) + '</b>' +
          '<span class="pill ' + (n ? 'p-info' : 'p-muted') + ' num">' + n + '</span></div></div>';
      }).join('') + '</div>' +

      (sel ?
        '<div class="card mt"><h3>' + (CAT_ICONS[sel] || '📎') + ' ' + esc(sel) + '</h3>' +
        ((byCat[sel] || []).length ?
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('الكود') + '</th><th>' + I18n.t('الملف') + '</th><th>' + I18n.t('الحجم') + '</th><th>' + I18n.t('رفعه') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('النسخ') + '</th><th></th></tr></thead><tbody>' +
          byCat[sel].map(function (f) {
            return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(f.docCode || '—') + '</b></td>' +
              '<td class="small" style="direction:ltr;text-align:right">📎 ' + esc(f.name || '') + '</td>' +
              '<td class="small num">' + fmtSize(f.size) + '</td>' +
              '<td class="small">' + esc(f.by || '—') + '</td>' +
              '<td class="small muted num">' + esc(f.date || '') + '</td>' +
              '<td class="num small">' + ((f.versions || []).length + 1) + '</td>' +
              '<td>' + (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ ' + I18n.t('تحميل') + '</a>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="empty"><div class="e-ico">📁</div>' + I18n.t('لا وثائق في هذه الفئة بعد') + '</div>') + '</div>'
        : '<div class="small muted mt">' + I18n.t('اختر فئة لعرض وثائقها') + '</div>');

    el.querySelectorAll('[data-pcat]').forEach(function (c) {
      c.addEventListener('click', function () {
        pdState.cat = pdState.cat === c.getAttribute('data-pcat') ? null : c.getAttribute('data-pcat');
        renderProjectDocs(el, ctx);
      });
    });
    const up = el.querySelector('#pd2-up');
    if (up) up.addEventListener('click', async function () {
      const f = el.querySelector('#pd2-file').files[0];
      if (!f) { toast(I18n.t('اختر ملفاً أولاً'), true); return; }
      try {
        await Api.upload(f, { category: el.querySelector('#pd2-cat').value });
        toast(I18n.t('✅ أُضيف للمستودع وكُوّد تلقائياً')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ 7) BIM: النماذج (سحابي/من الجهاز) + الوثائق بالقوالب + ربط الكاميرات ============
  const bimState = { tab: 'models' };
  const BIM_KINDS = { bep: 'خطة تنفيذ BIM (BEP)', midp: 'خطة تسليم المعلومات (MIDP)', clash: 'تقرير اكتشاف التعارضات', closeout: 'تقرير الإغلاق (Close-Out)', other: 'وثيقة BIM أخرى' };
  const BIM_TEMPLATES = {
    bep: {
      title: I18n.t('خطة تنفيذ الـBIM'),
      sections: {
        'أهداف الـBIM': I18n.t('التنسيق بين التخصصات، اكتشاف التعارضات قبل التنفيذ، استخراج الكميات، وربط النموذج بالجدول الزمني (4D) والتكلفة (5D).'),
        'الأدوار والمسؤوليات': I18n.t('مدير BIM، منسق نماذج لكل مقاول، واجتماع تنسيق نماذج أسبوعي.'),
        'معايير النمذجة': I18n.t('مستوى التفصيل LOD 350 للتنفيذ، تسمية الملفات وفق ISO 19650، وحدة المتر، نقطة أصل موحدة.'),
        'بيئة البيانات المشتركة CDE': I18n.t('نظام بصير هو الـCDE المعتمد: الرفع والاعتماد والأرشفة والتكويد.'),
        'جدول تسليم النماذج': I18n.t('معماري وإنشائي: كل أسبوعين. MEP: أسبوعياً أثناء التنسيق.')
      }
    },
    midp: {
      title: I18n.t('خطة تسليم المعلومات الرئيسية MIDP'),
      sections: {
        'قائمة التسليمات': I18n.t('حدد كل نموذج ووثيقة معلومات مطلوبة، ومسؤول إعدادها، وصيغتها (IFC/RVT/PDF).'),
        'مواعيد التسليم': I18n.t('اربط كل تسليمة بمرحلة المشروع (تصميم، تنفيذ، تسليم) وتاريخها المستهدف.'),
        'مستويات المعلومات': I18n.t('حدد LOD/LOI المطلوب لكل تسليمة في كل مرحلة.'),
        'المسؤوليات': I18n.t('مصفوفة إسناد: من يُعِد، من يراجع، من يعتمد كل تسليمة.')
      }
    },
    clash: {
      title: I18n.t('تقرير اكتشاف التعارضات'),
      sections: {
        'نطاق الفحص': I18n.t('النماذج المفحوصة وإصداراتها (معماري/إنشائي/MEP) وتاريخ الفحص وقواعد التسامح.'),
        'ملخص التعارضات': I18n.t('عدد التعارضات: حرجة / جوهرية / ثانوية، ونسبة المُغلق منها من الفحص السابق.'),
        'أبرز التعارضات المفتوحة': I18n.t('وصف كل تعارض: الموقع (المحور/الدور)، التخصصات المتعارضة، المسؤول، وتاريخ الحل المستهدف.'),
        'قرارات الحل': I18n.t('قرارات جلسة التنسيق وإجراءات كل مقاول.')
      }
    },
    closeout: {
      title: I18n.t('تقرير الإغلاق Close-Out'),
      sections: {
        'حالة النموذج النهائي': I18n.t('مطابقة النموذج للتنفيذ الفعلي (As-Built) ونسبة التحقق الميداني.'),
        'التسليمات المكتملة': I18n.t('قائمة النماذج والوثائق المسلمة نهائياً وأكوادها في أرشيف بصير.'),
        'بيانات التشغيل والصيانة': I18n.t('ربط عناصر النموذج ببيانات الأصول (COBie) وكتيبات التشغيل.'),
        'الدروس المستفادة': I18n.t('ما نجح وما يُحسَّن في مشاريع قادمة.')
      }
    }
  };

  function renderBim(el, ctx) {
    const tab = bimState.tab;
    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'models' ? 'active' : '') + '" data-btab="models">🏢 ' + I18n.t('نماذج BIM') + '</div>' +
      '<div class="tab ' + (tab === 'docs' ? 'active' : '') + '" data-btab="docs">📚 ' + I18n.t('وثائق BIM (قوالب)') + '</div>' +
      '<div class="tab ' + (tab === 'cams' ? 'active' : '') + '" data-btab="cams">🎥 ' + I18n.t('ربط الكاميرات بالنموذج') + '</div>' +
      '</div><div id="bim-body"></div>';
    el.querySelectorAll('[data-btab]').forEach(function (t) {
      t.addEventListener('click', function () { bimState.tab = t.getAttribute('data-btab'); renderBim(el, ctx); });
    });
    const body = el.querySelector('#bim-body');
    if (tab === 'models') renderBimModels(body, ctx);
    else if (tab === 'docs') renderBimDocs(body, ctx);
    else renderBimCams(body, ctx);
  }

  function renderBimModels(el, ctx) {
    const models = ctx.S.bimModels || [];
    el.innerHTML =
      '<div class="grid g2">' +
      '<div class="card"><h3>☁️ ' + I18n.t('ربط نموذج سحابي') + '</h3>' +
      '<div class="m-sub">' + I18n.t('اربط نموذجاً مستضافاً سحابياً (Autodesk / Trimble / أي رابط) — مزامنة موثوقة بلا رفع.') + '</div>' +
      '<label class="fl">' + I18n.t('اسم النموذج') + '</label><input class="inp" id="bm-cname" placeholder="BassirTower_Rev04.ifc">' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('الإصدار') + '</label><input class="inp num" id="bm-crev" placeholder="Rev-04"></div>' +
      '<div><label class="fl">' + I18n.t('التخصص') + '</label><select class="inp" id="bm-cdisc"><option value="federated">' + I18n.t('موحد Federated') + '</option>' +
      (ctx.S.projects[0] ? ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') : '') +
      '</select></div></div>' +
      '<label class="fl">' + I18n.t('رابط النموذج السحابي') + '</label><input class="inp num" id="bm-curl" dir="ltr" placeholder="https://acc.autodesk.com/...">' +
      '<div class="m-actions"><button class="btn block" id="bm-cloud">☁️ ' + I18n.t('ربط النموذج السحابي') + '</button></div></div>' +

      '<div class="card"><h3>💻 ' + I18n.t('رفع نموذج من الجهاز') + '</h3>' +
      '<div class="m-sub">' + I18n.t('رفع مباشر لملفات BIM الكبيرة (IFC / RVT / NWD حتى 500MB) إلى خادم بصير المركزي.') + '</div>' +
      '<label class="fl">' + I18n.t('ملف النموذج') + '</label><input class="inp" id="bm-file" type="file" accept=".ifc,.rvt,.nwd,.nwc,.dwg">' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('الإصدار') + '</label><input class="inp num" id="bm-frev" placeholder="Rev-04"></div>' +
      '<div><label class="fl">' + I18n.t('التخصص') + '</label><select class="inp" id="bm-fdisc"><option value="federated">' + I18n.t('موحد Federated') + '</option>' +
      (ctx.S.projects[0] ? ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') : '') +
      '</select></div></div>' +
      '<div class="m-actions"><button class="btn block" id="bm-local">⬆ ' + I18n.t('رفع النموذج وربطه بجدول الكميات') + '</button></div>' +
      '<div class="small muted" id="bm-progress"></div></div></div>' +

      '<div class="card mt"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🏢 ' + I18n.t('سجل نماذج المشروع') + '</h3>' +
      '<button class="btn sm" id="bm-demo3d">🧊 ' + I18n.t('عرض نموذج BIM ثلاثي الأبعاد (برج بصير)') + '</button></div>' +
      '<div class="small muted mb">' + I18n.t('عرض BIM/IFC حقيقي داخل المتصفح (بلا خدمة خارجية). ملفات DWG/RVT الأصلية تحتاج مسار Autodesk APS.') + '</div>' +
      (models.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('الكود') + '</th><th>' + I18n.t('النموذج') + '</th><th>' + I18n.t('الإصدار') + '</th><th>' + I18n.t('المصدر') + '</th><th>' + I18n.t('الحجم') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('الربط') + '</th><th></th></tr></thead><tbody>' +
        models.map(function (m) {
          return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(m.docCode || '—') + '</b></td>' +
            '<td class="small" style="direction:ltr;text-align:right">🏢 ' + esc(m.name) + '</td>' +
            '<td class="small num">' + esc(m.rev || '') + '</td>' +
            '<td class="small">' + (m.source === 'cloud' ? '<span class="pill p-info">☁️ ' + I18n.t('سحابي') + '</span>' : '<span class="pill p-ok">💻 ' + I18n.t('مرفوع') + '</span>') + '</td>' +
            '<td class="small num">' + fmtSize(m.size) + '</td>' +
            '<td class="small muted num">' + esc(m.date || '') + '</td>' +
            '<td>' + (m.linkedBoq ? '<span class="pill p-ok">' + I18n.t('مربوط بجدول الكميات ✓') + '</span>' : '<span class="pill p-muted">' + I18n.t('غير مربوط') + '</span>') + '</td>' +
            '<td><div class="flex" style="gap:6px">' +
            (m.url && /\.ifc$/i.test(m.url) ? '<button class="btn sm" data-bim3d="' + esc(m.url) + '" data-bimname="' + esc(m.name) + '" data-bimid="' + esc(m.id) + '">🧊 3D</button>' : '') +
            (m.url ? '<a class="btn ghost sm" href="' + esc(m.url) + '" target="_blank">' + I18n.t('فتح') + ' ↗</a>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">🏢</div>' + I18n.t('لا نماذج بعد — اربط سحابياً أو ارفع من الجهاز') + '</div>') +
      '</div>';

    function open3d(o) {
      // عرض IFC ثلاثي الأبعاد يعمل داخل المتصفح بالكامل (web-ifc + three.js) — بلا خادم
      if (!window.BimViewer) { toast('عارض النماذج غير متوفر', true); return; }
      window.BimViewer.open(o);
    }
    const demo3d = el.querySelector('#bm-demo3d');
    const canMapBim = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    if (demo3d) demo3d.addEventListener('click', function () {
      // زر العرض السريع يفتح نفس ملف النموذج المسجّل في السجل أدناه — نجد معرّفه الحقيقي
      // ليعمل الربط ببنود الكميات هنا أيضاً، لا فقط عبر زر "3D" داخل السجل
      const registered = (ctx.S.bimModels || []).find(function (mm) { return mm.url === '/vendor/bim/BassirTower.ifc'; });
      open3d({ title: 'برج بصير التجاري — نموذج BIM ثلاثي الأبعاد', url: '/vendor/bim/BassirTower.ifc', ctx: ctx, modelId: registered ? registered.id : null, canMap: canMapBim });
    });
    el.querySelectorAll('[data-bim3d]').forEach(function (b) {
      b.addEventListener('click', function () {
        open3d({
          title: b.getAttribute('data-bimname') || 'نموذج BIM', url: b.getAttribute('data-bim3d'),
          ctx: ctx, modelId: b.getAttribute('data-bimid'), canMap: canMapBim
        });
      });
    });

    el.querySelector('#bm-cloud').addEventListener('click', async function () {
      const name = el.querySelector('#bm-cname').value.trim();
      const url = el.querySelector('#bm-curl').value.trim();
      if (!name || !url) { toast(I18n.t('أدخل اسم النموذج ورابطه السحابي'), true); return; }
      try {
        await Api.create('bimModels', {
          name: name, rev: el.querySelector('#bm-crev').value, discipline: el.querySelector('#bm-cdisc').value,
          source: 'cloud', url: url, by: ctx.U.name, linkedBoq: true
        });
        toast(I18n.t('☁️ رُبط النموذج السحابي وأصبح مرئياً في رؤية المشروع')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
    el.querySelector('#bm-local').addEventListener('click', async function () {
      const f = el.querySelector('#bm-file').files[0];
      if (!f) { toast(I18n.t('اختر ملف النموذج أولاً'), true); return; }
      const prog = el.querySelector('#bm-progress');
      prog.textContent = '⏳ ' + I18n.t('جارٍ رفع ') + f.name + ' (' + fmtSize(f.size) + ')...';
      try {
        const up = await Api.upload(f, { category: 'مخططات IFC' });
        await Api.create('bimModels', {
          name: f.name, rev: el.querySelector('#bm-frev').value, discipline: el.querySelector('#bm-fdisc').value,
          source: 'local', url: up.url || '', size: f.size, by: ctx.U.name, linkedBoq: true
        });
        prog.textContent = '';
        toast('✅ ' + I18n.t('رُفع النموذج (') + fmtSize(f.size) + I18n.t(') وربط بجدول الكميات')); ctx.refresh();
      } catch (e) { prog.textContent = ''; toast(e.message, true); }
    });
  }

  function renderBimDocs(el, ctx) {
    const docs = ctx.S.bimDocs || [];
    el.innerHTML =
      '<div class="card mb"><h3>📚 ' + I18n.t('إنشاء وثيقة BIM من قالب') + ' <span class="hint">' + I18n.t('قوالب جاهزة تُحرَّر وتُحفظ وتُكوَّد في الأرشيف') + '</span></h3>' +
      '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px">' +
      [['bep', '📋', I18n.t('خطة تنفيذ BIM'), 'BEP'], ['midp', '🗓️', I18n.t('خطة تسليم المعلومات'), 'MIDP'],
       ['clash', '💥', I18n.t('تقرير التعارضات'), 'Clash Report'], ['closeout', '🏁', I18n.t('تقرير الإغلاق'), 'Close-Out']].map(function (t) {
        return '<div class="card" data-tmpl="' + t[0] + '" style="cursor:pointer;padding:16px;text-align:center">' +
          '<div style="font-size:26px">' + t[1] + '</div><b class="small">' + t[2] + '</b>' +
          '<div class="small muted num" style="direction:ltr">' + t[3] + '</div></div>';
      }).join('') + '</div></div>' +

      '<div class="card"><h3>📚 ' + I18n.t('وثائق BIM للمشروع') + '</h3>' +
      (docs.length ?
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('الكود') + '</th><th>' + I18n.t('الوثيقة') + '</th><th>' + I18n.t('النوع') + '</th><th>' + I18n.t('الإصدار') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('أعدها') + '</th><th>' + I18n.t('الحالة') + '</th><th></th></tr></thead><tbody>' +
        docs.map(function (d2) {
          return '<tr><td class="num small"><b style="color:var(--accent2)">' + esc(d2.docCode || '—') + '</b></td>' +
            '<td class="small">' + esc(d2.title) + '</td>' +
            '<td class="small"><span class="pill p-muted">' + esc(I18n.t(BIM_KINDS[d2.kind] || d2.kind)) + '</span></td>' +
            '<td class="small num">' + esc(d2.rev || '') + '</td>' +
            '<td class="small muted num">' + esc(d2.date || '') + '</td>' +
            '<td class="small">' + esc(d2.by || '') + '</td>' +
            '<td>' + pill(d2.status || '') + '</td>' +
            '<td><button class="btn ghost sm" data-bdoc="' + d2.id + '">📖 ' + I18n.t('فتح') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📚</div>' + I18n.t('لا وثائق بعد — أنشئ أول وثيقة من القوالب أعلاه') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-tmpl]').forEach(function (c) {
      c.addEventListener('click', function () {
        const kind = c.getAttribute('data-tmpl');
        const tpl = BIM_TEMPLATES[kind];
        const m = modal(
          '<h3>📋 ' + esc(tpl.title) + ' — ' + I18n.t('من القالب') + '</h3>' +
          '<div class="m-sub">' + I18n.t('حرر الأقسام ثم احفظ — تُكوَّد الوثيقة وتدخل الأرشيف المركزي') + '</div>' +
          '<label class="fl">' + I18n.t('عنوان الوثيقة') + '</label><input class="inp" id="bd-title" value="' + esc(tpl.title + ' - ' + (ctx.S.projects[0] ? ctx.S.projects[0].name : '')) + '">' +
          '<label class="fl">' + I18n.t('الإصدار') + '</label><input class="inp num" id="bd-rev" value="R1">' +
          Object.keys(tpl.sections).map(function (k, i) {
            return '<label class="fl">' + esc(I18n.t(k)) + '</label><textarea class="inp" data-sec="' + i + '" data-k="' + esc(k) + '" rows="2">' + esc(tpl.sections[k]) + '</textarea>';
          }).join('') +
          '<div class="m-actions"><button class="btn" id="bd-ok">💾 ' + I18n.t('حفظ الوثيقة وتكويدها') + '</button><button class="btn mutedb" id="bd-cancel">' + I18n.t('إلغاء') + '</button></div>'
        );
        m.querySelector('#bd-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#bd-ok').addEventListener('click', async function () {
          const sections = {};
          m.querySelectorAll('[data-sec]').forEach(function (t) { sections[t.getAttribute('data-k')] = t.value; });
          try {
            await Api.create('bimDocs', {
              kind: kind, title: m.querySelector('#bd-title').value, rev: m.querySelector('#bd-rev').value,
              sections: sections, status: 'pending', by: ctx.U.name
            });
            m.remove(); toast(I18n.t('✅ أُنشئت الوثيقة وكُوّدت وأُدرجت بالأرشيف')); ctx.refresh();
          } catch (e) { toast(e.message, true); }
        });
      });
    });
    el.querySelectorAll('[data-bdoc]').forEach(function (b) {
      b.addEventListener('click', function () {
        const d2 = docs.find(function (x) { return x.id === b.getAttribute('data-bdoc'); });
        modal(
          '<h3>📖 ' + esc(d2.title) + '</h3>' +
          '<div class="m-sub num">' + esc(d2.docCode || '') + ' · ' + esc(d2.rev || '') + ' · ' + esc(d2.date || '') + ' · ' + esc(d2.by || '') + '</div>' +
          Object.keys(d2.sections || {}).map(function (k) {
            return '<div class="card" style="padding:12px;margin-bottom:8px"><b class="small">' + esc(I18n.t(k)) + '</b>' +
              '<div class="small" style="margin-top:6px;line-height:1.9;color:#c6cdda">' + esc(d2.sections[k]) + '</div></div>';
          }).join('') +
          '<div class="m-actions"><button class="btn mutedb" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('إغلاق') + '</button></div>'
        );
      });
    });
  }

  function renderBimCams(el, ctx) {
    const cams = ctx.S.cameras || [];
    const P = ctx.S.projects[0] || { floors: [], disciplines: [] };
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const camInsights = (ctx.S.aiInsights || []).filter(function (a) { return a.source === 'camera' || a.source === 'photos'; }).slice(0, 6);

    el.innerHTML =
      '<div class="card mb"><h3>🎥 ' + I18n.t('ربط كاميرات الموقع بنموذج BIM') + ' <span class="hint">' + I18n.t('كل كاميرا تُربط بدور وتخصص في النموذج — فتُقارن لقطاتها آلياً بالمخطط له') + '</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('الكاميرا') + '</th><th>' + I18n.t('الموقع') + '</th><th>' + I18n.t('الدور في النموذج') + '</th><th>' + I18n.t('التخصص') + '</th><th>' + I18n.t('المقارنة الآلية') + '</th></tr></thead><tbody>' +
      cams.map(function (c) {
        return '<tr><td><b>🎥 ' + esc(c.name) + '</b><div class="small muted num">' + esc(c.id) + '</div></td>' +
          '<td class="small">' + esc(c.location || '') + '</td>' +
          '<td>' + (canEdit ?
            '<select class="inp" data-camfloor="' + c.id + '" style="padding:6px 10px;font-size:12px"><option value="">— ' + I18n.t('غير مربوط') + ' —</option>' +
            P.floors.map(function (f2) { return '<option value="' + f2.id + '"' + (c.bimFloor === f2.id ? ' selected' : '') + '>' + esc(f2.name) + '</option>'; }).join('') + '</select>'
            : '<span class="small">' + esc(VS.floorName(ctx, c.bimFloor) || '—') + '</span>') + '</td>' +
          '<td>' + (canEdit ?
            '<select class="inp" data-camdisc="' + c.id + '" style="padding:6px 10px;font-size:12px"><option value="">—</option>' +
            P.disciplines.map(function (d2) { return '<option value="' + d2.id + '"' + (c.bimDiscipline === d2.id ? ' selected' : '') + '>' + d2.icon + ' ' + esc(d2.name) + '</option>'; }).join('') + '</select>'
            : '<span class="small">' + esc((VS.discOf(ctx, c.bimDiscipline) || {}).name || '—') + '</span>') + '</td>' +
          '<td class="small">' + (c.bimFloor ? '<span class="pill p-ok">✓ ' + I18n.t('تقارن كل لقطة بنسبة النموذج') + '</span>' : '<span class="pill p-muted">' + I18n.t('اربطها لتفعيل المقارنة') + '</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="small muted mt">💡 ' + I18n.t('عند وصول لقطة من كاميرا مربوطة، يحلل ذكاء بصير الصورة ويقارن الإنجاز المرصود بنسبة إنجاز الدور/التخصص في نموذج BIM وجدول الكميات — فيسهل التحقق من التقدم الفعلي مقابل النموذج.') + '</div></div>' +

      '<div class="card"><h3>🤖 ' + I18n.t('آخر المقارنات الآلية (الموقع الفعلي ↔ نموذج BIM)') + '</h3>' +
      (camInsights.length ?
        camInsights.map(function (a) {
          const diff = (a.detected != null && a.reported != null) ? a.detected - a.reported : null;
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b class="small">' + esc(a.area || '') + '</b>' +
            '<span class="small muted num">' + esc(a.date || '') + '</span></div>' +
            (a.detected != null ? '<div class="small num" style="margin-top:6px">' + I18n.t('المرصود بالصورة: ') + '<b>' + a.detected + '%</b>' +
              (a.reported != null ? ' · ' + I18n.t('نموذج BIM/الكميات: ') + '<b>' + a.reported + '%</b> · ' + I18n.t('الفرق: ') + '<b style="color:' + (diff >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + (diff > 0 ? '+' : '') + diff + '%</b>' : '') + '</div>' : '') +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(a.note || '') + '</div></div>';
        }).join('')
        : '<div class="empty"><div class="e-ico">🤖</div>' + I18n.t('لا مقارنات بعد — تصل تلقائياً مع لقطات الكاميرات المربوطة') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-camfloor],[data-camdisc]').forEach(function (s) {
      s.addEventListener('change', async function () {
        const id = s.getAttribute('data-camfloor') || s.getAttribute('data-camdisc');
        const patch = {};
        patch[s.hasAttribute('data-camfloor') ? 'bimFloor' : 'bimDiscipline'] = s.value;
        try { await Api.update('cameras', id, patch); toast(I18n.t('✅ حُدث ربط الكاميرا بالنموذج')); ctx.refreshSilent(); }
        catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ 8) لوحة اختيار المشروع: كل المشاريع وفتح أي منها ============
  function renderProjectsDash(el, ctx) {
    const projects = (ctx.Sall || ctx.S).projects;
    const Sall = ctx.Sall || ctx.S;

    function countFor(pid, col, pred) {
      return (Sall[col] || []).filter(function (x) {
        return (!x.projectId || x.projectId === pid) && (!pred || pred(x));
      }).length;
    }

    /* عدد الأنشطة المتأخرة (§6-1، §9-2/9): بنود بانتظار إجراء تجاوزت مدة المراجعة (SLA).
       يحل محل عدّاد «ملفات المستودع» عديم الدلالة القراري. */
    function overdueFor(pid) {
      const sla = (VS.thresholds((Sall.projects.find(function (p) { return p.id === pid; }) || {})).slaReviewDays) || 7;
      const now = Date.now();
      function pastSla(x) {
        const d = x.date || x.submittedDate || x.createdAt;
        if (!d) return false;
        const t = new Date(d).getTime();
        return !isNaN(t) && (now - t) > sla * 86400000;
      }
      let n = 0;
      ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments'].forEach(function (c) {
        n += countFor(pid, c, function (x) { return x.status === 'pending' && pastSla(x); });
      });
      ['rfis', 'ncrs'].forEach(function (c) {
        n += countFor(pid, c, function (x) { return x.status === 'open' && pastSla(x); });
      });
      return n;
    }

    el.innerHTML =
      '<div class="card mb"><h3>🗂️ ' + I18n.t('لوحة المشاريع') + ' <span class="hint">' + I18n.t('اختر المشروع لتعمل عليه — كل الصفحات والبيانات تتبع المشروع المحدد') + '</span></h3></div>' +
      '<div class="grid g2">' +
      projects.map(function (p) {
        const active = ctx.projectId === p.id;
        const nCont = countFor(p.id, 'contractors');
        const nPend = ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments']
          .reduce(function (a, c) { return a + countFor(p.id, c, function (x) { return x.status === 'pending'; }); }, 0);
        const nOverdue = overdueFor(p.id);
        const prog = p.progressActual || 0;
        const planned = p.progressPlanned != null ? p.progressPlanned : null;
        const zc = function (v) { return v ? 'num' : 'num zero'; };
        return '<div class="card" style="border-color:' + (active ? 'var(--accent)' : 'var(--border)') + '">' +
          '<div class="flex" style="justify-content:space-between">' +
          '<h3 style="margin:0">🏗️ ' + esc(p.name) + '</h3>' +
          (active ? VS.statusPill('p-ok', 'المشروع الحالي', '✓') : '<button class="btn sm" data-selproj="' + p.id + '">' + I18n.t('فتح والعمل عليه') + ' ←</button>') + '</div>' +
          '<div class="small muted" style="margin:8px 0">' + esc(p.location || '—') + ' · 👨‍💼 ' + esc(p.consultantName || I18n.t('لم يعيّن استشاري')) + '</div>' +
          '<div class="flex" style="gap:8px;margin:10px 0">' + VS.progressBar(prog, planned, p) +
          '<b class="num small">' + prog + '%</b>' +
          (planned != null ? '<span class="small muted num">/ ' + I18n.t('المخطط') + ' ' + planned + '%</span>' : '') + '</div>' +
          '<div class="grid g3 small" style="gap:8px;text-align:center">' +
          '<div class="card" style="padding:10px"><b class="' + zc(nCont) + '">' + nCont + '</b><div class="muted" style="font-size:11px">' + I18n.t('مقاول') + '</div></div>' +
          '<div class="card" style="padding:10px"><b class="' + zc(nPend) + '"' + (nPend ? ' style="color:var(--status-warning)"' : '') + '>' + nPend + '</b><div class="muted" style="font-size:11px">' + I18n.t('بانتظار الاعتماد') + '</div></div>' +
          '<div class="card" style="padding:10px"><b class="' + zc(nOverdue) + '"' + (nOverdue ? ' style="color:var(--status-critical)"' : '') + '>' + nOverdue + '</b><div class="muted" style="font-size:11px">' + I18n.t('نشاط متأخر') + '</div></div>' +
          '</div>' +
          '<div class="small muted mt num">' + I18n.t('الميزانية: ') + VS.millions(p.budgetPlanned || 0) + (p.startPlanned ? ' · ' + esc(p.startPlanned) + ' ← ' + esc(p.endPlanned || '') : '') + '</div>' +
          '</div>';
      }).join('') + '</div>';

    el.querySelectorAll('[data-selproj]').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx.setProject(b.getAttribute('data-selproj'));
        toast(I18n.t('🏗️ انتقلت للمشروع — كل الصفحات الآن تعرض بياناته'));
      });
    });
  }

  window.ViewsModules = {
    renderSubmissions: renderSubmissions,
    renderRfx: renderRfx,
    renderVariations: renderVariations,
    renderContractorDb: renderContractorDb,
    renderFileServer: renderFileServer,
    renderProjectDocs: renderProjectDocs,
    renderBim: renderBim,
    renderProjectsDash: renderProjectsDash
  };
})();
