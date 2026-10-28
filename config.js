/* =====================================================================
   TBMEC Smart IT Support Portal — settings file
   Change links and contact details here. You never need to edit app.js
   to update a link.

   SAFETY RULES
   - Never paste a Microsoft Forms "DesignPageV2" (editor) link here.
     Only use the student link from Forms > Collect responses > Copy link.
   - Never put passwords, API keys or secrets in this file. Everything
     here is visible to anyone who opens the website.
   ===================================================================== */
window.TBMEC_CONFIG = {
  portalName: 'TBMEC Smart IT Support',
  portalNameAr: 'بوابة الدعم التقني الذكي',
  tagline: 'Smart Solutions. Faster Support. Better Learning.',
  taglineAr: 'حلول ذكية. دعم أسرع. تعلّم أفضل.',
  schoolName: 'Tahnoun Bin Mohammed Educational Complex',
  schoolNameAr: 'مجمع طحنون بن محمد التعليمي',

  /* ---- Password reset (LIVE) ----
     Existing school form, student response link. Confirmed by school IT
     on 27 Oct 2026; submissions notify IT through Power Automate. */
  passwordResetFormUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=BcfdYznIHEegZcnM9MOT0FVdx8kmqC5NmQw1ZU9qGaNUMVFIMzc1R1laREpLNDNCNTRFVUdOQjhONi4u',
  passwordResetLinkVerified: true,

  /* What a student should do if the form asks them to sign in and they
     cannot (for example, their account is locked). Edit to match your
     school's real process. */
  itDeskNote: {
    en: 'Visit the IT support office on your campus during school hours, or ask your homeroom teacher to contact IT for you. Bring your student number. Never share your password.',
    ar: 'توجّه إلى مكتب الدعم التقني في الحرم خلال الدوام المدرسي، أو اطلب من معلم الصف التواصل مع الدعم التقني نيابةً عنك. أحضر رقمك الطلابي، ولا تشارك كلمة المرور أبداً.'
  },

  /* ---- General IT support request (NOT CONNECTED YET) ----
     When you create a general "IT Support Request" Microsoft Form, paste
     its Collect responses link here. Until then the website lets students
     prepare and copy their request instead of pretending to send it. */
  generalSupportFormUrl: '',

  /* Approved IT mailbox. When set, the request page shows an
     "Open email draft" button (it opens the student's mail app; nothing
     is sent automatically). Leave empty to hide it. */
  itSupportEmail: '',

  /* ---- AI assistant (NOT CONNECTED YET) ----
     Paste the web-channel embed URL of your published Copilot Studio agent.
     Empty = the built-in guide-mode assistant is used. */
  copilotStudioEmbedUrl: '',

  /* ---- Useful links shown in the footer and "More information" ---- */
  links: [
    { en: 'ATS Blackboard', ar: 'بلاك بورد ATS', url: 'https://ats.blackboard.com' },
    { en: 'School email (Outlook)', ar: 'البريد المدرسي (Outlook)', url: 'https://outlook.office.com' },
    { en: 'Microsoft 365', ar: 'مايكروسوفت 365', url: 'https://www.office.com' }
  ]
};
