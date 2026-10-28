/* =====================================================================
   TBMEC Smart IT Support Portal — approved knowledge base
   One place for every troubleshooting article, FAQ and search keyword.
   The guide pages, the search box and the IT Assistant all read from
   this file, so an answer only needs to be changed once.

   Every text is a pair: [English, Arabic].
   To add a new article: copy an existing block, give it a new id,
   and link it to a page (route) and a section id on that page (sec).
   ===================================================================== */
window.TBMEC_KB = {

  /* Support request categories (Contact IT page).
     guide = the article a student should try before sending a request. */
  requestTypes: [
    { id: 'password',      label: ['Password reset', 'إعادة تعيين كلمة المرور'],             guide: 'pw-signin' },
    { id: 'bb-login',      label: ['Blackboard login error', 'خطأ في الدخول إلى بلاك بورد'],    guide: 'bb-login' },
    { id: 'lockdown',      label: ['LockDown Browser issue', 'مشكلة في متصفح LockDown'],       guide: 'bb-lockdown' },
    { id: 'ipad-settings', label: ['iPad settings issue', 'مشكلة في إعدادات الآيباد'],          guide: 'rs-grey' },
    { id: 'app-install',   label: ['App installation issue', 'مشكلة في تثبيت التطبيقات'],       guide: 'rs-pending' },
    { id: 'mdm',           label: ['iPad formatting / MDM release', 'تهيئة الآيباد / إزالة الإدارة (MDM)'], guide: 'gr-process' },
    { id: 'other',         label: ['Other technical issue', 'مشكلة تقنية أخرى'],               guide: null }
  ],

  articles: {

    /* ------------------------- PASSWORD & LOGIN ------------------------- */
    'pw-domain': {
      route: 'password', sec: 'domain', req: 'password', icon: 'lock',
      title: ['New school login (email domain update)', 'اسم الدخول الجديد (تحديث نطاق البريد)'],
      summary: ['Only the email domain changed. Your student number stays the same: use 812345@ats.sch.ae instead of 812345@aths.ac.ae (812345 is only an example).',
                'تغيّر نطاق البريد فقط، ورقم الطالب يبقى كما هو: استخدم 812345@ats.sch.ae بدلاً من 812345@aths.ac.ae (الرقم 812345 مجرد مثال).'],
      keys: ['domain', 'new email', 'school email', 'email address', 'aths', 'ats.sch', 'username', 'user name', 'login name', 'which email', 'student number change', 'id change',
             'نطاق', 'البريد الجديد', 'البريد المدرسي', 'ايميل', 'اسم المستخدم', 'اسم الدخول', 'رقم الطالب', 'تغير الرقم']
    },
    'pw-signin': {
      route: 'password', sec: 'signin', req: 'password', icon: 'lock',
      title: ['Can’t sign in? Check these first', 'لا تستطيع تسجيل الدخول؟ تحقّق من هذه أولاً'],
      summary: ['Most sign-in problems come from the email domain or a typing mistake. Check them before requesting a reset.',
                'معظم مشكلات الدخول سببها نطاق البريد أو خطأ في الكتابة. تحقّق منها قبل طلب إعادة التعيين.'],
      steps: [
        ['Check your student number is correct.', 'تأكّد من أن رقم الطالب صحيح.'],
        ['Confirm the email domain: your login should end with @ats.sch.ae.', 'تأكّد من نطاق البريد: يجب أن ينتهي اسم الدخول بـ ‎@ats.sch.ae.'],
        ['Check for typing mistakes: Caps Lock, extra spaces, and that the keyboard is set to English.', 'تحقّق من أخطاء الكتابة: زر الأحرف الكبيرة، والمسافات الزائدة، وأن لغة لوحة المفاتيح هي الإنجليزية.'],
        ['Try signing in again.', 'حاول تسجيل الدخول مرة أخرى.'],
        ['If you forgot your password or your account is locked, submit a password reset request.', 'إذا نسيت كلمة المرور أو كان حسابك مقفلاً، قدّم طلب إعادة تعيين كلمة المرور.']
      ],
      keys: ['cant login', 'can\'t login', 'cannot login', 'can not login', 'cant sign in', 'can\'t sign in', 'cannot sign in', 'login failed', 'sign in failed', 'wrong password', 'incorrect password', 'password incorrect', 'password is incorrect', 'password is wrong', 'password not working', 'password doesnt work', 'locked', 'account locked', 'login problem', 'not logging in',
             'لا استطيع الدخول', 'ما اقدر ادخل', 'ما يدخل', 'تسجيل الدخول', 'كلمه المرور خطا', 'كلمه المرور غير صحيحه', 'الحساب مقفل', 'حسابي مقفل', 'مشكله في الدخول']
    },
    'pw-reset': {
      route: 'password', sec: 'reset', req: 'password', icon: 'file',
      title: ['Forgot your password? Request a reset', 'نسيت كلمة المرور؟ اطلب إعادة تعيينها'],
      summary: ['Use the school’s official Password Reset Request form (Microsoft Forms). IT receives your request and contacts you. Never type your old password or a code into the form.',
                'استخدم النموذج الرسمي لطلب إعادة تعيين كلمة المرور (Microsoft Forms). يصل طلبك إلى الدعم التقني ويتواصلون معك. لا تكتب كلمة المرور القديمة أو أي رمز في النموذج.'],
      steps: [
        ['Press “Request password reset” to open the official Microsoft Form.', 'اضغط «طلب إعادة تعيين كلمة المرور» لفتح نموذج Microsoft الرسمي.'],
        ['Fill in your name, student number and class exactly.', 'اكتب اسمك ورقمك الطلابي وصفك بدقة.'],
        ['Submit the form. IT is notified automatically.', 'أرسل النموذج، وسيصل إشعار تلقائي إلى الدعم التقني.'],
        ['Wait for IT to contact you with the next step. Do not submit the form many times.', 'انتظر تواصل الدعم التقني معك بالخطوة التالية، ولا تُرسل النموذج عدة مرات.']
      ],
      keys: ['forgot', 'forget', 'forgotten', 'reset password', 'password reset', 'new password', 'change password', 'reset my password', 'password form',
             'نسيت', 'نسيت كلمه المرور', 'اعاده تعيين', 'كلمه سر', 'كلمه المرور', 'باسورد', 'الباسوورد', 'تغيير كلمه المرور']
    },

    /* ---------------------- BLACKBOARD & LOCKDOWN ---------------------- */
    'bb-login': {
      route: 'blackboard', sec: 'login', req: 'bb-login', icon: 'book',
      title: ['Problem A — Blackboard login error', 'المشكلة أ — خطأ في الدخول إلى بلاك بورد'],
      summary: ['If Blackboard will not let you in or keeps returning to the login page, make sure you are on ats.blackboard.com and using your school email.',
                'إذا لم يسمح لك بلاك بورد بالدخول أو كان يعيدك إلى صفحة الدخول، فتأكّد من أنك في ats.blackboard.com وتستخدم بريدك المدرسي.'],
      symptoms: [
        ['You can’t log in.', 'لا تستطيع تسجيل الدخول.'],
        ['Blackboard keeps sending you back to the login screen.', 'يعيدك بلاك بورد إلى شاشة الدخول باستمرار.'],
        ['Sign-in fails even though your details are correct.', 'يفشل الدخول رغم أن بياناتك صحيحة.']
      ],
      steps: [
        ['Open Google Chrome.', 'افتح متصفح Google Chrome.'],
        ['To test the login, open a New Incognito Window (Ctrl + Shift + N on Windows, ⌘ + Shift + N on Mac).', 'لتجربة الدخول، افتح نافذة تصفح متخفٍ جديدة (Ctrl + Shift + N في ويندوز، أو ⌘ + Shift + N في ماك).'],
        ['Type ats.blackboard.com in the address bar.', 'اكتب ats.blackboard.com في شريط العنوان.'],
        ['Sign in with your school email ending @ats.sch.ae.', 'سجّل الدخول ببريدك المدرسي المنتهي بـ ‎@ats.sch.ae.'],
        ['Check your student number and password carefully.', 'تحقّق جيداً من رقمك الطلابي وكلمة المرور.'],
        ['Sign in again. If it still fails, follow Problem B (clear browsing data).', 'سجّل الدخول من جديد. إذا استمرت المشكلة، اتبع المشكلة ب (مسح بيانات التصفح).']
      ],
      keys: ['blackboard login', 'blackboard not opening', 'blackboard not working', 'blackboard wont open', 'cant open blackboard', 'blackboard error', 'login page again', 'back to login', 'keeps returning', 'black board', 'blackboard',
             'بلاك بورد', 'البلاك بورد', 'بلاكبورد', 'البلاك بورد ما يفتح', 'لا يفتح', 'ما يفتح', 'صفحه الدخول']
    },
    'bb-sso': {
      route: 'blackboard', sec: 'sso', req: 'bb-login', icon: 'lock',
      title: ['Problem B — “Sign On Error”: authentication request expired', 'المشكلة ب — «Sign On Error»: انتهت صلاحية طلب المصادقة'],
      summary: ['This error usually means an old sign-in session saved in your browser has expired. Clearing ALL browsing data (time range: All time) and signing in again usually fixes it.',
                'يعني هذا الخطأ غالباً أن جلسة دخول قديمة محفوظة في المتصفح قد انتهت. مسح جميع بيانات التصفح (المدة: كل الوقت) ثم الدخول من جديد يحل المشكلة عادةً.'],
      stepsChrome: [
        ['Open Chrome and tap the three dots ⋮ (top-right).', 'افتح Chrome واضغط على النقاط الثلاث ⋮ (أعلى اليمين).'],
        ['Go to Settings → Privacy and security.', 'اذهب إلى الإعدادات ← الخصوصية والأمان.'],
        ['Choose Delete browsing data (it may say “Clear browsing data”).', 'اختر «حذف بيانات التصفح» (قد تظهر باسم «محو بيانات التصفح»).'],
        ['Set Time range to All time.', 'اختر المدة الزمنية: كل الوقت.'],
        ['Tick Browsing history, Cookies and other site data, and Cached images and files, then press Delete data.', 'حدّد سجل التصفح، وملفات تعريف الارتباط وبيانات المواقع الأخرى، والصور والملفات المخزّنة مؤقتاً، ثم اضغط «حذف البيانات».'],
        ['Close Chrome completely and open it again.', 'أغلق Chrome تماماً ثم افتحه من جديد.'],
        ['Go to ats.blackboard.com and sign in with your school email.', 'ادخل إلى ats.blackboard.com وسجّل ببريدك المدرسي.']
      ],
      stepsSafari: [
        ['Open the Settings app on the iPad (not Safari itself).', 'افتح تطبيق الإعدادات في الآيباد (وليس متصفح Safari).'],
        ['Tap Apps → Safari. On older iPadOS versions, Safari is directly in the Settings list.', 'اضغط «التطبيقات» ← Safari. في إصدارات iPadOS الأقدم يظهر Safari مباشرة في قائمة الإعدادات.'],
        ['Tap Clear History and Website Data.', 'اضغط «مسح السجل وبيانات المواقع».'],
        ['If asked to choose a time range, choose All history, then confirm.', 'إذا طُلب اختيار المدة، اختر «كل السجل» ثم أكّد.'],
        ['Close Safari completely (swipe it away from the app switcher) and open it again.', 'أغلق Safari تماماً (اسحبه للأعلى من مبدّل التطبيقات) ثم افتحه من جديد.'],
        ['Go to ats.blackboard.com and sign in with your school email.', 'ادخل إلى ats.blackboard.com وسجّل ببريدك المدرسي.']
      ],
      warn: ['Clearing cookies signs you out of other websites too. Make sure you know the passwords you will need afterwards.',
             'مسح ملفات تعريف الارتباط يسجّل خروجك من المواقع الأخرى أيضاً. تأكّد من معرفتك لكلمات المرور التي ستحتاجها بعد ذلك.'],
      keys: ['sign on error', 'sign-on error', 'signon', 'single sign-on', 'single sign on', 'sso', 'authentication', 'authentication request', 'request has expired', 'expired', 'unable to log into your account', 'clear browsing data', 'clear cookies', 'cookies', 'cache',
             'sign on', 'خطا تسجيل الدخول', 'انتهت صلاحيه', 'المصادقه', 'مسح بيانات التصفح', 'الكوكيز', 'ملفات تعريف الارتباط']
    },
    'bb-lockdown': {
      route: 'blackboard', sec: 'lockdown', req: 'lockdown', icon: 'shield',
      title: ['Problem C — LockDown Browser issue', 'المشكلة ج — مشكلة متصفح LockDown'],
      summary: ['Some assessments need Respondus LockDown Browser. Most launch problems are fixed by using the correct Blackboard site in a normal Chrome window after clearing browsing data (All time).',
                'تتطلب بعض الاختبارات متصفح Respondus LockDown. معظم مشكلات التشغيل تُحل باستخدام موقع بلاك بورد الصحيح في نافذة Chrome عادية بعد مسح بيانات التصفح (كل الوقت).'],
      steps: [
        ['Use a supported browser (an up-to-date Google Chrome on a computer) in a normal window — not Incognito.', 'استخدم متصفحاً مدعوماً (أحدث إصدار من Google Chrome على الكمبيوتر) في نافذة عادية وليس في وضع التصفح المتخفي.'],
        ['Make sure the address is ats.blackboard.com — not another institution’s Blackboard.', 'تأكّد أن العنوان هو ats.blackboard.com وليس بلاك بورد مؤسسة أخرى.'],
        ['Clear browsing data with the time range All time (see Problem B).', 'امسح بيانات التصفح مع اختيار المدة «كل الوقت» (انظر المشكلة ب).'],
        ['Sign back into Blackboard with your school email.', 'سجّل الدخول إلى بلاك بورد مجدداً ببريدك المدرسي.'],
        ['Open the required assessment.', 'افتح الاختبار المطلوب.'],
        ['Follow the school’s instructions to launch LockDown Browser. Only install it if your teacher or IT told you to.', 'اتبع تعليمات المدرسة لتشغيل متصفح LockDown، ولا تثبّته إلا إذا طلب منك المعلم أو الدعم التقني ذلك.'],
        ['If the assessment opened in a new LockDown window, the “Return to Learn” page behind it is normal — finish the test in the LockDown window.', 'إذا فُتح الاختبار في نافذة LockDown جديدة، فصفحة «Return to Learn» خلفها طبيعية؛ أكمل الاختبار في نافذة LockDown.']
      ],
      keys: ['lockdown', 'lock down', 'lockdown browser', 'respondus', 'exam browser', 'secure assessment', 'test browser', 'quiz browser', 'install lockdown', 'lockdown error',
             'لوك داون', 'لوكداون', 'متصفح الاختبار', 'متصفح الاختبارات', 'الاختبار ما يفتح', 'الاختبار لا يفتح', 'امتحان']
    },
    'bb-loop': {
      route: 'blackboard', sec: 'loop', req: 'lockdown', icon: 'refresh',
      title: ['Problem D — “Return to Learn” loop', 'المشكلة د — تكرار صفحة «Return to Learn»'],
      summary: ['If you keep seeing the Secure Assessment page and “Return to Learn” without the test opening, work through the checklist. If it still loops, tell your teacher — they may need to check the LockDown settings for that assessment.',
                'إذا ظهرت صفحة Secure Assessment و«Return to Learn» مراراً دون أن يفتح الاختبار، اتبع قائمة الفحص. إذا استمر التكرار، أبلغ معلمك؛ فقد يحتاج إلى مراجعة إعدادات LockDown لهذا الاختبار.'],
      checklist: [
        ['I am on ats.blackboard.com (not another site).', 'أنا في موقع ats.blackboard.com (وليس موقعاً آخر).'],
        ['I am using a normal window, not Incognito / Private.', 'أستخدم نافذة عادية، وليس التصفح المتخفي أو الخاص.'],
        ['I cleared browsing data for All time and signed in again.', 'مسحت بيانات التصفح لكل الوقت وسجّلت الدخول من جديد.'],
        ['LockDown Browser is available on this device (only if the school asked you to install it).', 'متصفح LockDown متوفر على هذا الجهاز (فقط إذا طلبت المدرسة تثبيته).'],
        ['I closed other browser windows and tried to open the assessment once more.', 'أغلقت نوافذ المتصفح الأخرى وحاولت فتح الاختبار مرة واحدة أخرى.'],
        ['I checked whether the test opened in a separate LockDown window.', 'تحقّقت مما إذا كان الاختبار قد فُتح في نافذة LockDown منفصلة.']
      ],
      keys: ['return to learn', 'loop', 'looping', 'keeps coming back', 'again and again', 'same page', 'repeat', 'keeps asking lockdown', 'secure assessment page',
             'يرجعني', 'نفس الصفحه', 'تتكرر', 'يتكرر', 'ريترن تو ليرن']
    },
    'bb-critical': {
      route: 'blackboard', sec: 'critical', req: 'lockdown', icon: 'alert',
      title: ['Problem E — “Critical Error: Error retrieving profile info”', 'المشكلة هـ — «Critical Error: Error retrieving profile info»'],
      summary: ['LockDown Browser could not load your profile, often because of the network connection or the way the test was launched. No single step fixes every case, so try them in order.',
                'لم يتمكن متصفح LockDown من تحميل ملفك الشخصي، وغالباً يكون السبب الاتصال بالشبكة أو طريقة فتح الاختبار. لا توجد خطوة واحدة تحل كل الحالات، لذا جرّبها بالترتيب.'],
      steps: [
        ['Check your internet: make sure Wi-Fi is on and connected to the school network.', 'تحقّق من الإنترنت: تأكّد أن الواي فاي يعمل ومتصل بشبكة المدرسة.'],
        ['Confirm the server shown is ats.blackboard.com.', 'تأكّد أن الخادم الظاهر هو ats.blackboard.com.'],
        ['Press OK, close LockDown Browser completely, then open it again.', 'اضغط OK، وأغلق متصفح LockDown تماماً، ثم افتحه من جديد.'],
        ['Launch the assessment again the approved way: from Blackboard, not by opening LockDown on its own.', 'افتح الاختبار مجدداً بالطريقة المعتمدة: من داخل بلاك بورد، وليس بفتح LockDown وحده.'],
        ['If the error continues, contact IT with a screenshot of the full error and your device type.', 'إذا استمر الخطأ، تواصل مع الدعم التقني وأرفق لقطة للخطأ كاملاً ونوع جهازك.']
      ],
      keys: ['critical error', 'profile info', 'retrieving profile', 'error retrieving', 'you may exit the browser',
             'خطا حرج', 'الملف الشخصي', 'معلومات الملف']
    },

    /* ------------------------ RESET ALL SETTINGS ------------------------ */
    'rs-pending': {
      route: 'reset', sec: 'pending', req: 'app-install', icon: 'download',
      title: ['Problem A — Comportal download stuck on “Pending”', 'المشكلة أ — تنزيل Comportal عالق على «Pending»'],
      summary: ['When apps stay on “Pending” in Comportal, Reset All Settings usually fixes it. It keeps your photos, files and apps. Never choose Erase All Content and Settings.',
                'عندما تبقى التطبيقات على «Pending» في Comportal، فإن «إعادة تعيين جميع الإعدادات» تحل المشكلة عادةً، وتبقى صورك وملفاتك وتطبيقاتك. لا تختر أبداً «مسح جميع المحتويات والإعدادات».'],
      steps: [
        ['Open Settings on the iPad.', 'افتح الإعدادات في الآيباد.'],
        ['Tap General.', 'اضغط «عام».'],
        ['Tap Transfer or Reset iPad.', 'اضغط «نقل أو إعادة تعيين iPad».'],
        ['Tap Reset.', 'اضغط «إعادة تعيين».'],
        ['Choose Reset All Settings.', 'اختر «إعادة تعيين جميع الإعدادات».'],
        ['Enter your iPad passcode if asked.', 'أدخل رمز الآيباد إذا طُلب منك.'],
        ['Let the iPad restart.', 'انتظر حتى يُعاد تشغيل الآيباد.'],
        ['Reconnect to the school Wi-Fi.', 'أعد الاتصال بشبكة الواي فاي المدرسية.'],
        ['Open Comportal and sign in.', 'افتح Comportal وسجّل الدخول.'],
        ['Try downloading the required app again.', 'حاول تنزيل التطبيق المطلوب مرة أخرى.']
      ],
      keys: ['pending', 'comportal', 'company portal', 'download stuck', 'stuck downloading', 'app not downloading', 'app not installing', 'cant install', 'can\'t install', 'waiting', 'install app', 'download app', 'apps pending', 'app stuck',
             'كومبورتال', 'كمبورتال', 'بندنق', 'معلق التنزيل', 'التنزيل معلق', 'التطبيق معلق', 'انتظار', 'لا يتحمل', 'ما يتحمل', 'ما ينزل', 'تثبيت التطبيق', 'تنزيل']
    },
    'rs-grey': {
      route: 'reset', sec: 'grey', req: 'ipad-settings', icon: 'settings',
      title: ['Problem B — app icons look grey', 'المشكلة ب — أيقونات التطبيقات رمادية'],
      summary: ['If Chrome, Edge or other icons on the Home Screen turn into grey boxes, use the same Reset All Settings steps. Photos, files and apps stay.',
                'إذا تحوّلت أيقونات Chrome أو Edge أو غيرها في الشاشة الرئيسية إلى مربعات رمادية، فاستخدم خطوات «إعادة تعيين جميع الإعدادات» نفسها. تبقى الصور والملفات والتطبيقات.'],
      keys: ['grey', 'gray', 'grey icons', 'gray icons', 'grey boxes', 'grey box', 'icons grey', 'icon disappeared', 'chrome grey', 'edge grey', 'blank icon',
             'رمادي', 'رماديه', 'ايقونات رماديه', 'الايقونات', 'مربع رمادي', 'اختفت الايقونه']
    },

    /* -------------------------- iPAD TROUBLESHOOTING -------------------------- */
    'ip-frozen': {
      route: 'ipad', sec: 'frozen', req: 'ipad-settings', icon: 'tablet',
      title: ['Frozen or unresponsive iPad — force restart', 'الآيباد متجمّد أو لا يستجيب — إعادة تشغيل إجبارية'],
      summary: ['A force restart fixes most frozen iPads. It does not delete anything. The button order depends on whether your iPad has a Home button.',
                'إعادة التشغيل الإجبارية تحل معظم حالات تجمّد الآيباد، ولا تحذف أي شيء. يختلف ترتيب الأزرار حسب وجود زر الشاشة الرئيسية.'],
      steps: [
        ['Quickly press and release Volume Up.', 'اضغط زر رفع الصوت واتركه بسرعة.'],
        ['Quickly press and release Volume Down.', 'اضغط زر خفض الصوت واتركه بسرعة.'],
        ['Press and hold the Top button.', 'اضغط مطوّلاً على الزر العلوي.'],
        ['Release the button when the Apple logo appears.', 'اترك الزر عند ظهور شعار Apple.']
      ],
      stepsHome: [
        ['Press and hold the Top button and the Home button at the same time.', 'اضغط مطوّلاً على الزر العلوي وزر الشاشة الرئيسية في الوقت نفسه.'],
        ['Keep holding until the Apple logo appears, then release both.', 'استمر بالضغط حتى يظهر شعار Apple، ثم اترك الزرين.']
      ],
      keys: ['frozen', 'freeze', 'freezing', 'stuck', 'not responding', 'unresponsive', 'black screen', 'wont turn on', 'won\'t turn on', 'doesnt turn on', 'restart', 'force restart', 'hang', 'hanging', 'screen not working', 'touch not working',
             'متجمد', 'تجمد', 'هنق', 'يهنق', 'معلق الجهاز', 'الايباد معلق', 'الايباد علق', 'لا يستجيب', 'ما يستجيب', 'شاشه سوداء', 'اعاده تشغيل', 'الايباد ما يشتغل', 'الايباد لا يعمل', 'الايباد طافي', 'ما يشتغل الايباد']
    },
    'ip-other': {
      route: 'ipad', sec: 'other', req: 'ipad-settings', icon: 'help',
      title: ['Other iPad problems', 'مشكلات أخرى في الآيباد'],
      summary: ['Search the help articles, ask the IT Assistant, or report the problem to IT if the approved steps don’t help.',
                'ابحث في المقالات، أو اسأل المساعد التقني، أو أبلغ الدعم التقني إذا لم تنفع الخطوات المعتمدة.'],
      keys: ['ipad problem', 'ipad issue', 'ipad broken', 'charging', 'not charging', 'battery', 'cracked', 'broken screen', 'keyboard', 'pencil',
             'مشكله الايباد', 'الشحن', 'ما يشحن', 'البطاريه', 'الشاشه مكسوره', 'مكسور']
    },

    /* ----------------------------- GRADUATES ----------------------------- */
    'gr-process': {
      route: 'graduate', sec: 'process', req: 'mdm', icon: 'graduate',
      title: ['Graduating students — iPad release and erase', 'الطلبة الخريجون — إخلاء الآيباد ومسحه'],
      summary: ['Do not erase a school iPad yourself first. IT must confirm your device can be released and remove school management (MDM). Only after IT confirms should you erase it, if instructed.',
                'لا تمسح الآيباد المدرسي بنفسك أولاً. يجب أن يؤكد الدعم التقني إمكانية إخلاء جهازك وإزالته من الإدارة المدرسية (MDM). وبعد التأكيد فقط امسحه إذا طُلب منك ذلك.'],
      steps: [
        ['Ask IT to confirm whether your device can be released from school management.', 'اطلب من الدعم التقني تأكيد إمكانية إخلاء جهازك من الإدارة المدرسية.'],
        ['IT checks your student number and the school’s device ownership / release policy.', 'يتحقق الدعم التقني من رقمك الطلابي ومن سياسة ملكية الأجهزة وإخلائها في المدرسة.'],
        ['If eligible, authorized IT staff complete the approved MDM removal.', 'إذا كنت مؤهلاً، يكمل موظفو الدعم المعتمدون إزالة الجهاز من MDM.'],
        ['You receive confirmation and the approved instructions.', 'تصلك رسالة تأكيد مع التعليمات المعتمدة.'],
        ['Only then, and only if instructed, erase the iPad.', 'بعد ذلك فقط، وإذا طُلب منك، امسح الآيباد.']
      ],
      stepsErase: [
        ['Back up any personal files you are allowed to keep.', 'احفظ نسخة من الملفات الشخصية المسموح لك بالاحتفاظ بها.'],
        ['Open Settings → General → Transfer or Reset iPad.', 'افتح الإعدادات ← عام ← نقل أو إعادة تعيين iPad.'],
        ['Tap Erase All Content and Settings, then Continue.', 'اضغط «مسح جميع المحتويات والإعدادات» ثم «متابعة».'],
        ['Enter your passcode and confirm Erase iPad. The iPad restarts showing “Hello”.', 'أدخل رمز المرور وأكّد «مسح iPad». سيُعاد تشغيل الجهاز وتظهر شاشة «Hello».']
      ],
      keys: ['graduate', 'graduating', 'graduation', 'format', 'formatting', 'erase', 'wipe', 'factory reset', 'mdm', 'remove management', 'keep my ipad', 'release device', 'enrollment', 'enrolment', 'remote management',
             'خريج', 'الخريجين', 'تخرج', 'فورمات', 'تهيئه', 'مسح الجهاز', 'مسح الايباد', 'اعاده ضبط المصنع', 'ازاله الاداره', 'التسجيل']
    },

    /* ------------------------------ RULES ------------------------------ */
    'ru-icloud': {
      route: 'rules', sec: 'icloud', req: 'ipad-settings', icon: 'cloud',
      title: ['Rule A — No personal iCloud on school iPads', 'القاعدة أ — يُمنع iCloud الشخصي على الآيباد المدرسي'],
      summary: ['Personal Apple IDs / iCloud accounts are not allowed on school-managed iPads. If you already added one, contact IT so they can guide you through the approved removal.',
                'لا يُسمح بحسابات Apple ID أو iCloud الشخصية على أجهزة الآيباد المدرسية. إذا أضفت حساباً بالفعل، تواصل مع الدعم التقني ليرشدك إلى طريقة الإزالة المعتمدة.'],
      keys: ['icloud', 'i cloud', 'apple id', 'appleid', 'apple account', 'personal account', 'my own account', 'sign in apple',
             'ايكلاود', 'اي كلاود', 'حساب ابل', 'ابل اي دي', 'حساب شخصي']
    },
    'ru-device': {
      route: 'rules', sec: 'device', req: 'other', icon: 'tablet',
      title: ['Rule B — Using your school device', 'القاعدة ب — استخدام الجهاز المدرسي'],
      summary: ['School iPads are for learning and are managed by the school. Use them as instructed and look after them.',
                'أجهزة الآيباد المدرسية مخصصة للتعلم وتديرها المدرسة. استخدمها وفق التعليمات وحافظ عليها.'],
      keys: ['device rules', 'school device', 'device policy', 'rules', 'policy', 'allowed',
             'قواعد', 'سياسه', 'مسموح', 'ممنوع', 'الجهاز المدرسي']
    },
    'ru-apps': {
      route: 'rules', sec: 'apps', req: 'app-install', icon: 'block',
      title: ['Rule C — Unauthorized apps', 'القاعدة ج — التطبيقات غير المصرّح بها'],
      summary: ['Only install apps the school provides through Comportal. Social media, games and tools to get around device restrictions are not allowed.',
                'ثبّت فقط التطبيقات التي توفرها المدرسة عبر Comportal. لا يُسمح بتطبيقات التواصل الاجتماعي والألعاب وأدوات تجاوز قيود الجهاز.'],
      keys: ['tiktok', 'snapchat', 'instagram', 'whatsapp', 'social media', 'game', 'games', 'roblox', 'fortnite', 'app store', 'unauthorized app', 'download games', 'jailbreak',
             'تيك توك', 'سناب', 'انستقرام', 'واتساب', 'العاب', 'لعبه', 'برامج التواصل', 'اب ستور']
    },
    'ru-vpn': {
      route: 'rules', sec: 'vpn', req: 'other', icon: 'wifi',
      title: ['Rule D — VPNs and bypassing the network', 'القاعدة د — الشبكات الافتراضية (VPN) وتجاوز الشبكة'],
      summary: ['Unauthorized VPN apps, proxies and any attempt to get around the school network filters are not allowed.',
                'لا يُسمح بتطبيقات VPN غير المصرّح بها أو البروكسي أو أي محاولة لتجاوز فلاتر شبكة المدرسة.'],
      keys: ['vpn', 'proxy', 'bypass', 'unblock', 'blocked website', 'site blocked', 'website blocked', 'filter',
             'في بي ان', 'vpn', 'بروكسي', 'محجوب', 'حجب', 'تجاوز', 'فك الحجب']
    },
    'ru-account': {
      route: 'rules', sec: 'account', req: 'password', icon: 'key',
      title: ['Rule E — Account and password safety', 'القاعدة هـ — أمان الحساب وكلمة المرور'],
      summary: ['Never share your password, never use another student’s account, and never put a password in an IT form. If you think someone used your account, report it to IT straight away.',
                'لا تشارك كلمة مرورك، ولا تستخدم حساب طالب آخر، ولا تكتب كلمة المرور في أي نموذج دعم. إذا شككت أن أحداً استخدم حسابك، أبلغ الدعم التقني فوراً.'],
      keys: ['hacked', 'someone logged', 'someone used my account', 'compromised', 'share password', 'friend account', 'another account', 'phishing', 'suspicious email', 'stolen',
             'اخترق', 'مخترق', 'تهكير', 'هكر', 'حسابي مسروق', 'احد دخل حسابي', 'مشاركه كلمه المرور', 'حساب صديقي', 'رساله مشبوهه']
    }
  },

  /* ------------------------------- FAQ ------------------------------- */
  faqs: [
    { q: ['Did my student number change?', 'هل تغيّر رقمي الطلابي؟'],
      a: ['No. Only the email domain changed. Use your same number with @ats.sch.ae.', 'لا. تغيّر نطاق البريد فقط. استخدم رقمك نفسه مع ‎@ats.sch.ae.'], link: 'pw-domain' },
    { q: ['I forgot my password. What do I do?', 'نسيت كلمة المرور، ماذا أفعل؟'],
      a: ['Open the official Password Reset Request form from the Password & Login page. IT is notified when you submit it.', 'افتح النموذج الرسمي لطلب إعادة تعيين كلمة المرور من صفحة كلمة المرور وتسجيل الدخول. يصل إشعار إلى الدعم التقني عند الإرسال.'], link: 'pw-reset' },
    { q: ['Blackboard says “Sign On Error”. What now?', 'يظهر في بلاك بورد «Sign On Error»، ماذا أفعل؟'],
      a: ['Clear ALL browsing data with the time range “All time”, close the browser, then sign in again at ats.blackboard.com.', 'امسح جميع بيانات التصفح مع اختيار «كل الوقت»، وأغلق المتصفح، ثم سجّل الدخول من جديد في ats.blackboard.com.'], link: 'bb-sso' },
    { q: ['Will Reset All Settings delete my photos or files?', 'هل تحذف «إعادة تعيين جميع الإعدادات» صوري أو ملفاتي؟'],
      a: ['No. It resets settings such as Wi-Fi and preferences. It is different from Erase All Content and Settings, which deletes everything.', 'لا. هي تعيد ضبط الإعدادات مثل الواي فاي والتفضيلات، وتختلف عن «مسح جميع المحتويات والإعدادات» الذي يحذف كل شيء.'], link: 'rs-pending' },
    { q: ['My apps are stuck on “Pending” in Comportal.', 'التطبيقات عالقة على «Pending» في Comportal.'],
      a: ['Use Reset All Settings, reconnect to Wi-Fi, then try the download again in Comportal.', 'استخدم «إعادة تعيين جميع الإعدادات»، ثم أعد الاتصال بالواي فاي، وحاول التنزيل مجدداً من Comportal.'], link: 'rs-pending' },
    { q: ['My iPad is frozen.', 'الآيباد متجمّد.'],
      a: ['Do a force restart: Volume Up, Volume Down, then hold the Top button until the Apple logo appears. It does not delete anything.', 'نفّذ إعادة تشغيل إجبارية: رفع الصوت، ثم خفض الصوت، ثم اضغط مطوّلاً على الزر العلوي حتى يظهر شعار Apple. لن يُحذف أي شيء.'], link: 'ip-frozen' },
    { q: ['I’m graduating. Can I erase my iPad?', 'أنا خريج، هل يمكنني مسح الآيباد؟'],
      a: ['Not yet. Contact IT with your student number first. Erase only after IT confirms the device is released from school management.', 'ليس الآن. تواصل أولاً مع الدعم التقني برقمك الطلابي، ولا تمسح الجهاز إلا بعد تأكيدهم إخلاءه من الإدارة المدرسية.'], link: 'gr-process' },
    { q: ['Can I use my personal iCloud on the school iPad?', 'هل يمكنني استخدام iCloud الشخصي على الآيباد المدرسي؟'],
      a: ['No. Personal Apple IDs are not allowed on school-managed iPads.', 'لا. لا يُسمح بحسابات Apple الشخصية على أجهزة الآيباد المدرسية.'], link: 'ru-icloud' },
    { q: ['Can I use a VPN at school?', 'هل يمكنني استخدام VPN في المدرسة؟'],
      a: ['No. Unauthorized VPNs and attempts to bypass the school network are not allowed.', 'لا. لا يُسمح بالشبكات الافتراضية غير المصرّح بها أو محاولات تجاوز شبكة المدرسة.'], link: 'ru-vpn' },
    { q: ['Does this website send my request to IT?', 'هل يرسل هذا الموقع طلبي إلى الدعم التقني؟'],
      a: ['The password reset form does: it goes straight to IT. For other problems, this site helps you prepare a clear request that you then send through the approved school channel.', 'نموذج إعادة تعيين كلمة المرور يرسل طلبك مباشرة إلى الدعم التقني. أما المشكلات الأخرى فيساعدك الموقع على تجهيز طلب واضح ترسله عبر القناة المدرسية المعتمدة.'], link: null, route: 'contact' },
    { q: ['Is the IT Assistant a real AI?', 'هل المساعد التقني ذكاء اصطناعي حقيقي؟'],
      a: ['Right now it runs in guide mode: it matches your question to the school’s approved guides. It cannot reset passwords, unlock accounts or remove MDM.', 'يعمل حالياً في وضع الإرشاد: يطابق سؤالك مع الأدلة المعتمدة في المدرسة، ولا يمكنه إعادة تعيين كلمات المرور أو فتح الحسابات أو إزالة MDM.'], link: null, route: 'assistant' }
  ]
};
