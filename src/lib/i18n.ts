import { getAppDictionary } from "@/lib/i18n-app";
import { getAdminDictionary } from "@/lib/i18n-admin";
import { getLegalDictionary } from "@/lib/i18n-legal";

export const LOCALES = ["fr", "ar", "en", "it"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "site_locale";

export const LOCALE_OPTIONS: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: "fr", label: "Français", shortLabel: "FR" },
  { value: "ar", label: "العربية", shortLabel: "AR" },
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "it", label: "Italiano", shortLabel: "IT" },
];

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && LOCALES.includes(value as Locale));
}

export function getTextDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

const fr: Record<string, string> = {
  "language.label": "Langue",
  "nav.home": "Accueil",
  "nav.about": "Le cabinet",
  "nav.services": "Services",
  "nav.articles": "Articles",
  "nav.faq": "FAQ",
  "nav.contact": "Contact",
  "nav.allServices": "Tous les services",
  "nav.account": "Mon espace",
  "nav.admin": "Administration",
  "nav.login": "Connexion",
  "nav.order": "Commander",
  "nav.orderLong": "Commander une traduction",
  "services.civil": "État civil",
  "services.civilDetail": "Naissance, mariage, divorce",
  "services.diplomas": "Diplômes & relevés",
  "services.diplomasDetail": "Études et équivalences",
  "services.contracts": "Contrats & actes",
  "services.contractsDetail": "Documents professionnels",
  "services.court": "Documents judiciaires",
  "services.courtDetail": "Jugements et procédures",
  "services.interpreting": "Interprétariat",
  "services.interpretingDetail": "Missions officielles",
  "hero.credential": "Traducteur assermenté près la Cour d’appel de Tunis",
  "hero.titleBefore": "Vos actes traduits,",
  "hero.titleAccent": "certifiés",
  "hero.titleAfter": "et remis sous cachet.",
  "hero.description": "Diplômes, actes d’état civil, contrats, jugements… Déposez votre document, recevez un devis et récupérez votre traduction officielle sans vous déplacer.",
  "hero.discover": "Découvrir nos services",
  "hero.status": "Statut",
  "hero.statusValue": "Traducteur & interprète assermenté",
  "hero.languages": "Langues",
  "hero.languagesValue": "Français · Arabe · Anglais",
  "hero.payment": "Paiement",
  "hero.paymentValue": "50 % à la commande, 50 % à la livraison",
  "hero.source": "Document source",
  "hero.certified": "Traduction certifiée",
  "hero.birth": "Extrait de naissance",
  "hero.compliant": "Conforme & signée",
  "hero.seal": "Cachet officiel apposé",
  "hero.unlocked": "Débloqué au paiement du solde",
  "stats.languages": "Langues de travail",
  "stats.payment": "Paiement en deux temps",
  "stats.paymentDetail": "Acompte, puis solde à la livraison",
  "stats.steps": "Étapes suivies en ligne",
  "stats.stepsDetail": "Du dépôt au téléchargement",
  "stats.compliance": "Conformité certifiée",
  "stats.complianceDetail": "Cachet et signature sur chaque acte",
  "home.servicesEyebrow": "Nos prestations",
  "home.servicesTitle": "Des traductions officielles pour chaque démarche",
  "home.servicesDescription": "Traductions assermentées et cachetées, destinées aux administrations, universités, ambassades et tribunaux.",
  "home.priceNote": "Le prix dépend de la langue, du nombre de pages, du délai et de la complexité.",
  "home.allServices": "Voir le détail de tous nos services",
  "workflow.eyebrow": "Comment ça marche",
  "workflow.title": "Un paiement en deux temps, simple et sécurisé",
  "workflow.description": "Vous réglez 50 % pour lancer la traduction. Le fichier final est livré verrouillé, puis devient téléchargeable dès le paiement du solde.",
  "workflow.step1Title": "Déposez le document",
  "workflow.step1Desc": "Téléversez votre fichier et indiquez la langue et le délai souhaités.",
  "workflow.step2Title": "Recevez le devis",
  "workflow.step2Desc": "Prix calculé automatiquement, validé par le traducteur.",
  "workflow.step3Title": "Réglez l’avance",
  "workflow.step3Desc": "50 % à la commande pour lancer le travail.",
  "workflow.step4Title": "Traduction & livraison",
  "workflow.step4Desc": "Le traducteur dépose le fichier certifié dans votre espace.",
  "workflow.step5Title": "Solde & téléchargement",
  "workflow.step5Desc": "Payez les 50 % restants : le fichier se débloque instantanément.",
  "workflow.deposit": "Acompte 50 %",
  "workflow.locked": "Verrouillé",
  "workflow.unlocked": "Déverrouillé",
  "statement.quote": "Une traduction assermentée engage ma signature autant que ma responsabilité. Chaque acte est vérifié, cacheté et livré avec la même exigence — qu’il s’agisse d’un extrait de naissance ou d’un jugement destiné à un tribunal étranger.",
  "statement.role": "Traducteur & interprète assermenté, Cour d’appel de Tunis",
  "cta.badge": "Devis gratuit · sans engagement",
  "cta.title": "Votre document mérite une traduction qui tient devant l’administration.",
  "cta.contact": "Nous contacter",
  "service.from": "Dès {price} TND/page",
  "service.quote": "Sur devis",
  "service.order": "Commander",
  "footer.certified": "Traductions certifiées",
  "footer.certifiedDetail": "Cachet et signature officiels",
  "footer.private": "Documents confidentiels",
  "footer.privateDetail": "Stockage privé et accès sécurisé",
  "footer.tracking": "Suivi en ligne",
  "footer.trackingDetail": "De la demande au téléchargement",
  "footer.description": "Traductions juridiques certifiées en français, arabe et anglais pour particuliers, entreprises et institutions.",
  "footer.quote": "Demander un devis",
  "footer.navigation": "Navigation",
  "footer.clientArea": "Espace client",
  "footer.newOrder": "Nouvelle commande",
  "footer.dashboard": "Tableau de bord",
  "footer.track": "Suivre une commande",
  "footer.documents": "Mes documents",
  "footer.rights": "Tous droits réservés.",
  "footer.security": "Confidentialité · Paiement sécurisé · Documents protégés",
  "auth.tracking": "Suivi de chaque étape en temps réel",
  "auth.documents": "Documents accessibles de façon sécurisée",
  "auth.payment": "Paiement progressif en deux étapes",
  "auth.secureNote": "En continuant, vous accédez à un espace sécurisé dédié au suivi de vos traductions.",
  "common.email": "Email",
  "common.password": "Mot de passe",
  "common.phone": "Téléphone",
  "common.optional": "optionnel",
  "login.eyebrow": "Espace client",
  "login.sideTitle": "Suivez votre commande de traduction, du devis au téléchargement.",
  "login.sideSubtitle": "Chaque étape — acompte, traduction, solde et fichier débloqué — est visible en temps réel depuis votre espace.",
  "login.secure": "Accès sécurisé",
  "login.welcome": "Bienvenue",
  "login.noAccount": "Pas encore de compte ?",
  "login.create": "Créer un compte",
  "login.submit": "Se connecter",
  "login.loading": "Connexion…",
  "login.error": "Email ou mot de passe incorrect.",
  "register.eyebrow": "Créer un compte",
  "register.sideTitle": "Un compte, toutes vos commandes de traduction au même endroit.",
  "register.sideSubtitle": "Déposez vos documents, réglez l’acompte, suivez la traduction et téléchargez vos actes certifiés une fois le solde payé.",
  "register.personal": "Espace personnel",
  "register.existing": "Déjà client ?",
  "register.login": "Se connecter",
  "register.firstName": "Prénom",
  "register.lastName": "Nom",
  "register.submit": "Créer mon compte",
  "register.loading": "Création du compte…",
  "register.passwordHint": "10 caractères minimum",
};

export type TranslationKey = string;
type Dictionary = Record<string, string>;

const en: Dictionary = {
  "language.label": "Language", "nav.home": "Home", "nav.about": "The firm", "nav.services": "Services", "nav.articles": "Articles", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.allServices": "All services", "nav.account": "My account", "nav.admin": "Administration", "nav.login": "Sign in", "nav.order": "Order", "nav.orderLong": "Order a translation",
  "services.civil": "Civil status", "services.civilDetail": "Birth, marriage, divorce", "services.diplomas": "Diplomas & transcripts", "services.diplomasDetail": "Studies and equivalency", "services.contracts": "Contracts & deeds", "services.contractsDetail": "Professional documents", "services.court": "Legal documents", "services.courtDetail": "Judgments and proceedings", "services.interpreting": "Interpreting", "services.interpretingDetail": "Official assignments",
  "hero.credential": "Sworn translator at the Tunis Court of Appeal", "hero.titleBefore": "Your documents translated,", "hero.titleAccent": "certified", "hero.titleAfter": "and officially stamped.", "hero.description": "Diplomas, civil-status records, contracts and judgments… Upload your document, receive a quote and collect your official translation online.", "hero.discover": "Discover our services", "hero.status": "Status", "hero.statusValue": "Sworn translator & interpreter", "hero.languages": "Languages", "hero.languagesValue": "French · Arabic · English", "hero.payment": "Payment", "hero.paymentValue": "50% when ordering, 50% on delivery", "hero.source": "Source document", "hero.certified": "Certified translation", "hero.birth": "Birth certificate", "hero.compliant": "Verified & signed", "hero.seal": "Official stamp applied", "hero.unlocked": "Unlocked after balance payment",
  "stats.languages": "Working languages", "stats.payment": "Two-step payment", "stats.paymentDetail": "Deposit, then balance on delivery", "stats.steps": "Online tracking steps", "stats.stepsDetail": "From upload to download", "stats.compliance": "Certified compliance", "stats.complianceDetail": "Stamp and signature on every document",
  "home.servicesEyebrow": "Our services", "home.servicesTitle": "Official translations for every procedure", "home.servicesDescription": "Sworn, stamped translations for authorities, universities, embassies and courts.", "home.priceNote": "Price depends on language, page count, deadline and complexity.", "home.allServices": "View all our services",
  "workflow.eyebrow": "How it works", "workflow.title": "Simple, secure two-step payment", "workflow.description": "Pay 50% to start the translation. The final file is delivered locked and becomes downloadable as soon as the balance is paid.", "workflow.step1Title": "Upload your document", "workflow.step1Desc": "Upload your file and select the language and deadline.", "workflow.step2Title": "Receive your quote", "workflow.step2Desc": "The price is calculated and validated by the translator.", "workflow.step3Title": "Pay the deposit", "workflow.step3Desc": "Pay 50% to start the work.", "workflow.step4Title": "Translation & delivery", "workflow.step4Desc": "The translator uploads the certified file to your account.", "workflow.step5Title": "Balance & download", "workflow.step5Desc": "Pay the remaining 50% to unlock the file instantly.", "workflow.deposit": "50% deposit", "workflow.locked": "Locked", "workflow.unlocked": "Unlocked",
  "statement.quote": "A sworn translation commits both my signature and my professional responsibility. Every document is checked, stamped and delivered to the same standard — whether it is a birth certificate or a judgment intended for a foreign court.", "statement.role": "Sworn translator & interpreter, Tunis Court of Appeal",
  "cta.badge": "Free quote · no obligation", "cta.title": "Your document deserves a translation that stands up to official scrutiny.", "cta.contact": "Contact us",
  "service.from": "From {price} TND/page", "service.quote": "On request", "service.order": "Order",
  "footer.certified": "Certified translations", "footer.certifiedDetail": "Official stamp and signature", "footer.private": "Confidential documents", "footer.privateDetail": "Private storage and secure access", "footer.tracking": "Online tracking", "footer.trackingDetail": "From request to download", "footer.description": "Certified legal translations in French, Arabic and English for individuals, businesses and institutions.", "footer.quote": "Request a quote", "footer.navigation": "Navigation", "footer.clientArea": "Client area", "footer.newOrder": "New order", "footer.dashboard": "Dashboard", "footer.track": "Track an order", "footer.documents": "My documents", "footer.rights": "All rights reserved.", "footer.security": "Privacy · Secure payment · Protected documents",
  "auth.tracking": "Track every step in real time", "auth.documents": "Secure access to your documents", "auth.payment": "Progressive payment in two steps", "auth.secureNote": "By continuing, you access a secure area dedicated to tracking your translations.",
  "common.email": "Email", "common.password": "Password", "common.phone": "Phone", "common.optional": "optional",
  "login.eyebrow": "Client area", "login.sideTitle": "Track your translation order from quote to download.", "login.sideSubtitle": "Every step — deposit, translation, balance and unlocked file — is visible in real time.", "login.secure": "Secure access", "login.welcome": "Welcome", "login.noAccount": "No account yet?", "login.create": "Create an account", "login.submit": "Sign in", "login.loading": "Signing in…", "login.error": "Incorrect email or password.",
  "register.eyebrow": "Create an account", "register.sideTitle": "One account for all your translation orders.", "register.sideSubtitle": "Upload documents, pay the deposit, track translation and download certified files after the balance is paid.", "register.personal": "Personal area", "register.existing": "Already a client?", "register.login": "Sign in", "register.firstName": "First name", "register.lastName": "Last name", "register.submit": "Create my account", "register.loading": "Creating account…", "register.passwordHint": "At least 10 characters",
};

const it: Dictionary = {
  "language.label": "Lingua", "nav.home": "Home", "nav.about": "Lo studio", "nav.services": "Servizi", "nav.articles": "Articoli", "nav.faq": "FAQ", "nav.contact": "Contatti", "nav.allServices": "Tutti i servizi", "nav.account": "Il mio spazio", "nav.admin": "Amministrazione", "nav.login": "Accedi", "nav.order": "Ordina", "nav.orderLong": "Ordina una traduzione",
  "services.civil": "Stato civile", "services.civilDetail": "Nascita, matrimonio, divorzio", "services.diplomas": "Diplomi e certificati", "services.diplomasDetail": "Studi ed equivalenze", "services.contracts": "Contratti e atti", "services.contractsDetail": "Documenti professionali", "services.court": "Documenti giudiziari", "services.courtDetail": "Sentenze e procedimenti", "services.interpreting": "Interpretariato", "services.interpretingDetail": "Incarichi ufficiali",
  "hero.credential": "Traduttore giurato presso la Corte d’appello di Tunisi", "hero.titleBefore": "I vostri atti tradotti,", "hero.titleAccent": "certificati", "hero.titleAfter": "e consegnati con timbro.", "hero.description": "Diplomi, atti di stato civile, contratti e sentenze… Caricate il documento, ricevete un preventivo e ottenete la traduzione ufficiale online.", "hero.discover": "Scopri i nostri servizi", "hero.status": "Qualifica", "hero.statusValue": "Traduttore e interprete giurato", "hero.languages": "Lingue", "hero.languagesValue": "Francese · Arabo · Inglese", "hero.payment": "Pagamento", "hero.paymentValue": "50% all’ordine, 50% alla consegna", "hero.source": "Documento originale", "hero.certified": "Traduzione certificata", "hero.birth": "Estratto di nascita", "hero.compliant": "Conforme e firmata", "hero.seal": "Timbro ufficiale apposto", "hero.unlocked": "Sbloccato dopo il saldo",
  "stats.languages": "Lingue di lavoro", "stats.payment": "Pagamento in due fasi", "stats.paymentDetail": "Acconto e saldo alla consegna", "stats.steps": "Fasi tracciate online", "stats.stepsDetail": "Dal caricamento al download", "stats.compliance": "Conformità certificata", "stats.complianceDetail": "Timbro e firma su ogni atto",
  "home.servicesEyebrow": "I nostri servizi", "home.servicesTitle": "Traduzioni ufficiali per ogni pratica", "home.servicesDescription": "Traduzioni giurate e timbrate per amministrazioni, università, ambasciate e tribunali.", "home.priceNote": "Il prezzo dipende dalla lingua, dal numero di pagine, dai tempi e dalla complessità.", "home.allServices": "Scopri tutti i servizi",
  "workflow.eyebrow": "Come funziona", "workflow.title": "Pagamento in due fasi, semplice e sicuro", "workflow.description": "Pagate il 50% per avviare la traduzione. Il file finale viene consegnato bloccato e diventa scaricabile dopo il saldo.", "workflow.step1Title": "Caricate il documento", "workflow.step1Desc": "Caricate il file e indicate lingua e tempi desiderati.", "workflow.step2Title": "Ricevete il preventivo", "workflow.step2Desc": "Prezzo calcolato e convalidato dal traduttore.", "workflow.step3Title": "Pagate l’acconto", "workflow.step3Desc": "Il 50% all’ordine per iniziare il lavoro.", "workflow.step4Title": "Traduzione e consegna", "workflow.step4Desc": "Il traduttore carica il file certificato nel vostro spazio.", "workflow.step5Title": "Saldo e download", "workflow.step5Desc": "Pagate il restante 50% e il file si sblocca subito.", "workflow.deposit": "Acconto 50%", "workflow.locked": "Bloccato", "workflow.unlocked": "Sbloccato",
  "statement.quote": "Una traduzione giurata impegna la mia firma e la mia responsabilità professionale. Ogni atto viene verificato, timbrato e consegnato con la stessa cura, da un estratto di nascita a una sentenza destinata a un tribunale estero.", "statement.role": "Traduttore e interprete giurato, Corte d’appello di Tunisi",
  "cta.badge": "Preventivo gratuito · senza impegno", "cta.title": "Il vostro documento merita una traduzione valida davanti alle autorità.", "cta.contact": "Contattaci",
  "service.from": "Da {price} TND/pagina", "service.quote": "Su preventivo", "service.order": "Ordina",
  "footer.certified": "Traduzioni certificate", "footer.certifiedDetail": "Timbro e firma ufficiali", "footer.private": "Documenti riservati", "footer.privateDetail": "Archiviazione privata e accesso sicuro", "footer.tracking": "Monitoraggio online", "footer.trackingDetail": "Dalla richiesta al download", "footer.description": "Traduzioni giuridiche certificate in francese, arabo e inglese per privati, imprese e istituzioni.", "footer.quote": "Richiedi un preventivo", "footer.navigation": "Navigazione", "footer.clientArea": "Area cliente", "footer.newOrder": "Nuovo ordine", "footer.dashboard": "Pannello di controllo", "footer.track": "Segui un ordine", "footer.documents": "I miei documenti", "footer.rights": "Tutti i diritti riservati.", "footer.security": "Riservatezza · Pagamento sicuro · Documenti protetti",
  "auth.tracking": "Segui ogni fase in tempo reale", "auth.documents": "Accesso sicuro ai documenti", "auth.payment": "Pagamento progressivo in due fasi", "auth.secureNote": "Continuando, accedete a uno spazio sicuro dedicato alle vostre traduzioni.",
  "common.email": "Email", "common.password": "Password", "common.phone": "Telefono", "common.optional": "facoltativo",
  "login.eyebrow": "Area cliente", "login.sideTitle": "Seguite il vostro ordine dal preventivo al download.", "login.sideSubtitle": "Ogni fase — acconto, traduzione, saldo e file sbloccato — è visibile in tempo reale.", "login.secure": "Accesso sicuro", "login.welcome": "Benvenuti", "login.noAccount": "Non avete ancora un account?", "login.create": "Crea un account", "login.submit": "Accedi", "login.loading": "Accesso…", "login.error": "Email o password non corretti.",
  "register.eyebrow": "Crea un account", "register.sideTitle": "Un account per tutti i vostri ordini di traduzione.", "register.sideSubtitle": "Caricate i documenti, pagate l’acconto, seguite il lavoro e scaricate gli atti certificati dopo il saldo.", "register.personal": "Spazio personale", "register.existing": "Già clienti?", "register.login": "Accedi", "register.firstName": "Nome", "register.lastName": "Cognome", "register.submit": "Crea il mio account", "register.loading": "Creazione account…", "register.passwordHint": "Almeno 10 caratteri",
};

const ar: Dictionary = {
  "language.label": "اللغة", "nav.home": "الرئيسية", "nav.about": "المكتب", "nav.services": "الخدمات", "nav.articles": "المقالات", "nav.faq": "الأسئلة الشائعة", "nav.contact": "اتصل بنا", "nav.allServices": "كل الخدمات", "nav.account": "فضائي", "nav.admin": "الإدارة", "nav.login": "تسجيل الدخول", "nav.order": "اطلب", "nav.orderLong": "اطلب ترجمة",
  "services.civil": "الحالة المدنية", "services.civilDetail": "الولادة والزواج والطلاق", "services.diplomas": "الشهادات وكشوف الأعداد", "services.diplomasDetail": "الدراسة والمعادلات", "services.contracts": "العقود والحجج", "services.contractsDetail": "الوثائق المهنية", "services.court": "الوثائق القضائية", "services.courtDetail": "الأحكام والإجراءات", "services.interpreting": "الترجمة الشفوية", "services.interpretingDetail": "المهام الرسمية",
  "hero.credential": "مترجم محلف لدى محكمة الاستئناف بتونس", "hero.titleBefore": "وثائقكم مترجمة،", "hero.titleAccent": "مصادق عليها", "hero.titleAfter": "ومختومة رسمياً.", "hero.description": "الشهادات ووثائق الحالة المدنية والعقود والأحكام… أرسلوا وثيقتكم، احصلوا على عرض سعر واستلموا ترجمتكم الرسمية عن بعد.", "hero.discover": "اكتشف خدماتنا", "hero.status": "الصفة", "hero.statusValue": "مترجم ومترجم شفوي محلف", "hero.languages": "اللغات", "hero.languagesValue": "الفرنسية · العربية · الإنجليزية", "hero.payment": "الدفع", "hero.paymentValue": "50٪ عند الطلب و50٪ عند التسليم", "hero.source": "الوثيقة الأصلية", "hero.certified": "ترجمة مصادق عليها", "hero.birth": "مضمون ولادة", "hero.compliant": "مطابقة وموقعة", "hero.seal": "تم وضع الختم الرسمي", "hero.unlocked": "يفتح بعد دفع الرصيد",
  "stats.languages": "لغات العمل", "stats.payment": "الدفع على مرحلتين", "stats.paymentDetail": "تسبقة ثم الرصيد عند التسليم", "stats.steps": "مراحل متابعة عبر الإنترنت", "stats.stepsDetail": "من الإيداع إلى التنزيل", "stats.compliance": "مطابقة مصادق عليها", "stats.complianceDetail": "ختم وإمضاء على كل وثيقة",
  "home.servicesEyebrow": "خدماتنا", "home.servicesTitle": "ترجمات رسمية لكل إجراءاتكم", "home.servicesDescription": "ترجمات محلفة ومختومة موجهة للإدارات والجامعات والسفارات والمحاكم.", "home.priceNote": "يتحدد السعر حسب اللغة وعدد الصفحات والآجال ودرجة التعقيد.", "home.allServices": "عرض جميع خدماتنا",
  "workflow.eyebrow": "كيف تتم العملية", "workflow.title": "دفع آمن وبسيط على مرحلتين", "workflow.description": "تدفعون 50٪ لبدء الترجمة. يُسلّم الملف النهائي مقفلاً ويصبح قابلاً للتنزيل فور دفع الرصيد.", "workflow.step1Title": "أرسلوا الوثيقة", "workflow.step1Desc": "حمّلوا الملف وحددوا اللغة والآجال المطلوبة.", "workflow.step2Title": "استلموا عرض السعر", "workflow.step2Desc": "يُحتسب السعر ويصادق عليه المترجم.", "workflow.step3Title": "ادفعوا التسبقة", "workflow.step3Desc": "50٪ عند الطلب لبدء العمل.", "workflow.step4Title": "الترجمة والتسليم", "workflow.step4Desc": "يضع المترجم الملف المصادق عليه في فضائكم.", "workflow.step5Title": "الرصيد والتنزيل", "workflow.step5Desc": "ادفعوا الـ50٪ المتبقية لفتح الملف فوراً.", "workflow.deposit": "تسبقة 50٪", "workflow.locked": "مقفل", "workflow.unlocked": "مفتوح",
  "statement.quote": "الترجمة المحلفة تُلزم إمضائي ومسؤوليتي المهنية. تتم مراجعة كل وثيقة وختمها وتسليمها بالدقة نفسها، سواء كانت مضمون ولادة أو حكماً موجهاً إلى محكمة أجنبية.", "statement.role": "مترجم ومترجم شفوي محلف لدى محكمة الاستئناف بتونس",
  "cta.badge": "عرض سعر مجاني · دون التزام", "cta.title": "وثيقتكم تستحق ترجمة معتمدة لدى الإدارات.", "cta.contact": "اتصل بنا",
  "service.from": "ابتداءً من {price} د.ت/صفحة", "service.quote": "حسب عرض السعر", "service.order": "اطلب",
  "footer.certified": "ترجمات مصادق عليها", "footer.certifiedDetail": "ختم وإمضاء رسميان", "footer.private": "وثائق سرية", "footer.privateDetail": "تخزين خاص ووصول آمن", "footer.tracking": "متابعة عبر الإنترنت", "footer.trackingDetail": "من الطلب إلى التنزيل", "footer.description": "ترجمات قانونية مصادق عليها بالعربية والفرنسية والإنجليزية للأفراد والمؤسسات.", "footer.quote": "اطلب عرض سعر", "footer.navigation": "التصفح", "footer.clientArea": "فضاء الحريف", "footer.newOrder": "طلب جديد", "footer.dashboard": "لوحة المتابعة", "footer.track": "متابعة طلب", "footer.documents": "وثائقي", "footer.rights": "جميع الحقوق محفوظة.", "footer.security": "السرية · دفع آمن · وثائق محمية",
  "auth.tracking": "متابعة كل مرحلة في الوقت الفعلي", "auth.documents": "وصول آمن إلى وثائقكم", "auth.payment": "دفع تدريجي على مرحلتين", "auth.secureNote": "بالمواصلة تدخلون إلى فضاء آمن مخصص لمتابعة ترجماتكم.",
  "common.email": "البريد الإلكتروني", "common.password": "كلمة المرور", "common.phone": "الهاتف", "common.optional": "اختياري",
  "login.eyebrow": "فضاء الحريف", "login.sideTitle": "تابعوا طلب الترجمة من عرض السعر إلى التنزيل.", "login.sideSubtitle": "كل مرحلة — التسبقة والترجمة والرصيد وفتح الملف — ظاهرة في الوقت الفعلي.", "login.secure": "دخول آمن", "login.welcome": "مرحباً", "login.noAccount": "ليس لديكم حساب؟", "login.create": "إنشاء حساب", "login.submit": "تسجيل الدخول", "login.loading": "جارٍ الدخول…", "login.error": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "register.eyebrow": "إنشاء حساب", "register.sideTitle": "حساب واحد لجميع طلبات الترجمة.", "register.sideSubtitle": "أرسلوا وثائقكم وادفعوا التسبقة وتابعوا الترجمة ثم نزّلوا الملفات المصادق عليها بعد دفع الرصيد.", "register.personal": "فضاء شخصي", "register.existing": "لديكم حساب؟", "register.login": "تسجيل الدخول", "register.firstName": "الاسم", "register.lastName": "اللقب", "register.submit": "إنشاء حسابي", "register.loading": "جارٍ إنشاء الحساب…", "register.passwordHint": "10 أحرف على الأقل",
};

Object.assign(fr, {
  "page.about.eyebrow": "Le cabinet", "page.about.title": "Maître Makram Arfaoui, traducteur & interprète assermenté", "page.about.description": "Traducteur assermenté près la Cour d’appel de Tunis, au service des particuliers, entreprises, administrations et institutions judiciaires.", "page.about.introTitle": "Un interlocuteur unique, du dépôt à la livraison", "page.about.p1": "J’interviens en français, arabe, anglais et italien pour traduire les documents officiels liés aux démarches administratives, judiciaires, académiques et notariales.", "page.about.p2": "Chaque traduction est certifiée conforme à l’original, revêtue du cachet et de la signature du traducteur assermenté.", "page.about.p3": "J’assure également des missions d’interprétariat assermenté : mariages mixtes, audiences, actes notariés et rendez-vous administratifs.", "page.about.practice": "En pratique", "page.about.jurisdiction": "Juridiction", "page.about.court": "Cour d’appel de Tunis", "page.about.workingLanguages": "Langues de travail", "page.about.office": "Cabinet", "page.about.commitments": "Nos engagements", "page.about.commitmentsTitle": "Ce qui encadre chaque traduction", "page.about.rigor": "Rigueur", "page.about.rigorDesc": "Chaque traduction est relue et comparée au document source avant certification.", "page.about.confidentiality": "Confidentialité", "page.about.confidentialityDesc": "Vos documents personnels sont traités et stockés avec le niveau de protection requis.", "page.about.official": "Reconnaissance officielle", "page.about.officialDesc": "Des traductions assermentées, cachetées et signées pour vos démarches officielles.", "page.about.deadlines": "Délais tenus", "page.about.deadlinesDesc": "Le délai annoncé au devis est suivi en ligne et respecté.", "page.about.question": "Une traduction à faire certifier ?",
  "page.services.eyebrow": "Nos services", "page.services.title": "Traductions juridiques assermentées, par type de document", "page.services.description": "Chaque traduction est certifiée conforme, cachetée et signée pour vos démarches officielles.", "page.services.missing": "Votre document n’est pas dans la liste ?", "page.services.missingDesc": "Nous traduisons la plupart des documents officiels. Déposez votre fichier ou contactez-nous pour recevoir un devis avant tout engagement.",
  "page.contact.title": "Une question avant de commander ?", "page.contact.description": "Appelez-nous, écrivez-nous ou passez au cabinet. Pour une traduction, déposez votre document afin de recevoir rapidement un devis en ligne.", "page.contact.office": "Cabinet", "page.contact.ready": "Prêt à faire traduire votre document ?", "page.contact.readyDesc": "Déposez votre fichier, indiquez la langue et le délai souhaités : un devis vous sera communiqué avant tout engagement.",
  "page.faq.title": "Questions fréquentes", "page.faq.description": "Tout ce qu’il faut savoir avant de commander une traduction assermentée.", "page.faq.other": "Une autre question ?", "page.faq.otherDesc": "Contactez-nous directement, nous vous répondrons rapidement.",
  "page.articles.eyebrow": "Conseils & actualités", "page.articles.title": "Comprendre vos démarches de traduction", "page.articles.description": "Guides pratiques, actualités et réponses du cabinet pour préparer vos documents officiels.", "page.articles.empty": "Aucun article publié pour l’instant.", "page.articles.read": "Lire l’article", "page.article.eyebrow": "Article du cabinet", "page.article.all": "Tous les articles", "page.article.published": "Publié le {date}",
});

Object.assign(en, {
  "page.about.eyebrow": "The firm", "page.about.title": "Maître Makram Arfaoui, sworn translator & interpreter", "page.about.description": "Sworn translator at the Tunis Court of Appeal, serving individuals, businesses, authorities and judicial institutions.", "page.about.introTitle": "One point of contact, from upload to delivery", "page.about.p1": "I work in French, Arabic, English and Italian on official documents for administrative, judicial, academic and notarial procedures.", "page.about.p2": "Every translation is certified against the original, stamped and signed by the sworn translator.", "page.about.p3": "I also provide sworn interpreting for mixed marriages, hearings, notarial deeds and administrative appointments.", "page.about.practice": "In practice", "page.about.jurisdiction": "Jurisdiction", "page.about.court": "Tunis Court of Appeal", "page.about.workingLanguages": "Working languages", "page.about.office": "Office", "page.about.commitments": "Our commitments", "page.about.commitmentsTitle": "The standards behind every translation", "page.about.rigor": "Accuracy", "page.about.rigorDesc": "Every translation is reviewed against the source before certification.", "page.about.confidentiality": "Confidentiality", "page.about.confidentialityDesc": "Your personal documents are handled and stored with appropriate protection.", "page.about.official": "Official recognition", "page.about.officialDesc": "Sworn, stamped and signed translations for official procedures.", "page.about.deadlines": "Reliable deadlines", "page.about.deadlinesDesc": "The quoted deadline is tracked online and respected.", "page.about.question": "Need a certified translation?",
  "page.services.eyebrow": "Our services", "page.services.title": "Sworn legal translations by document type", "page.services.description": "Every translation is certified, stamped and signed for your official procedures.", "page.services.missing": "Is your document not listed?", "page.services.missingDesc": "We translate most official documents. Upload your file or contact us to receive a quote before committing.",
  "page.contact.title": "A question before ordering?", "page.contact.description": "Call, email or visit the office. For a translation, upload your document to quickly receive an online quote.", "page.contact.office": "Office", "page.contact.ready": "Ready to have your document translated?", "page.contact.readyDesc": "Upload your file and select the language and deadline. You will receive a quote before any commitment.",
  "page.faq.title": "Frequently asked questions", "page.faq.description": "Everything you need to know before ordering a sworn translation.", "page.faq.other": "Another question?", "page.faq.otherDesc": "Contact us directly and we will reply promptly.",
  "page.articles.eyebrow": "Advice & news", "page.articles.title": "Understand your translation procedures", "page.articles.description": "Practical guides, news and answers from the firm to prepare your official documents.", "page.articles.empty": "No articles have been published yet.", "page.articles.read": "Read the article", "page.article.eyebrow": "Firm article", "page.article.all": "All articles", "page.article.published": "Published on {date}",
});

Object.assign(it, {
  "page.about.eyebrow": "Lo studio", "page.about.title": "Maître Makram Arfaoui, traduttore e interprete giurato", "page.about.description": "Traduttore giurato presso la Corte d’appello di Tunisi per privati, imprese, amministrazioni e istituzioni giudiziarie.", "page.about.introTitle": "Un unico referente, dal caricamento alla consegna", "page.about.p1": "Lavoro in francese, arabo, inglese e italiano su documenti ufficiali per pratiche amministrative, giudiziarie, accademiche e notarili.", "page.about.p2": "Ogni traduzione è certificata conforme all’originale, timbrata e firmata dal traduttore giurato.", "page.about.p3": "Svolgo anche incarichi di interpretariato giurato per matrimoni misti, udienze, atti notarili e appuntamenti amministrativi.", "page.about.practice": "In pratica", "page.about.jurisdiction": "Giurisdizione", "page.about.court": "Corte d’appello di Tunisi", "page.about.workingLanguages": "Lingue di lavoro", "page.about.office": "Studio", "page.about.commitments": "I nostri impegni", "page.about.commitmentsTitle": "Gli standard di ogni traduzione", "page.about.rigor": "Precisione", "page.about.rigorDesc": "Ogni traduzione viene verificata sul documento originale prima della certificazione.", "page.about.confidentiality": "Riservatezza", "page.about.confidentialityDesc": "I documenti personali sono trattati e conservati con la dovuta protezione.", "page.about.official": "Riconoscimento ufficiale", "page.about.officialDesc": "Traduzioni giurate, timbrate e firmate per le pratiche ufficiali.", "page.about.deadlines": "Tempi rispettati", "page.about.deadlinesDesc": "La scadenza indicata nel preventivo è tracciata online e rispettata.", "page.about.question": "Avete bisogno di una traduzione certificata?",
  "page.services.eyebrow": "I nostri servizi", "page.services.title": "Traduzioni giuridiche giurate per tipo di documento", "page.services.description": "Ogni traduzione è certificata, timbrata e firmata per le vostre pratiche ufficiali.", "page.services.missing": "Il vostro documento non è nell’elenco?", "page.services.missingDesc": "Traduciamo la maggior parte dei documenti ufficiali. Caricate il file o contattateci per un preventivo senza impegno.",
  "page.contact.title": "Una domanda prima di ordinare?", "page.contact.description": "Telefonate, scrivete o venite in studio. Per una traduzione, caricate il documento e riceverete rapidamente un preventivo online.", "page.contact.office": "Studio", "page.contact.ready": "Pronti a tradurre il vostro documento?", "page.contact.readyDesc": "Caricate il file e indicate lingua e tempi: riceverete un preventivo prima di qualsiasi impegno.",
  "page.faq.title": "Domande frequenti", "page.faq.description": "Tutto ciò che occorre sapere prima di ordinare una traduzione giurata.", "page.faq.other": "Un’altra domanda?", "page.faq.otherDesc": "Contattateci direttamente e risponderemo rapidamente.",
  "page.articles.eyebrow": "Consigli e novità", "page.articles.title": "Comprendere le pratiche di traduzione", "page.articles.description": "Guide pratiche, novità e risposte dello studio per preparare i documenti ufficiali.", "page.articles.empty": "Nessun articolo pubblicato.", "page.articles.read": "Leggi l’articolo", "page.article.eyebrow": "Articolo dello studio", "page.article.all": "Tutti gli articoli", "page.article.published": "Pubblicato il {date}",
});

Object.assign(ar, {
  "page.about.eyebrow": "المكتب", "page.about.title": "الأستاذ مكرم العرفاوي، مترجم ومترجم شفوي محلف", "page.about.description": "مترجم محلف لدى محكمة الاستئناف بتونس لفائدة الأفراد والمؤسسات والإدارات والجهات القضائية.", "page.about.introTitle": "مخاطب واحد من إيداع الوثيقة إلى التسليم", "page.about.p1": "أعمل بالعربية والفرنسية والإنجليزية والإيطالية لترجمة الوثائق الرسمية المتعلقة بالإجراءات الإدارية والقضائية والجامعية والعدلية.", "page.about.p2": "تتم مطابقة كل ترجمة بالأصل وختمها وإمضاؤها من المترجم المحلف.", "page.about.p3": "أوفر أيضاً الترجمة الشفوية المحلفة للزواج المختلط والجلسات والعقود العدلية والمواعيد الإدارية.", "page.about.practice": "معلومات عملية", "page.about.jurisdiction": "المرجع القضائي", "page.about.court": "محكمة الاستئناف بتونس", "page.about.workingLanguages": "لغات العمل", "page.about.office": "المكتب", "page.about.commitments": "التزاماتنا", "page.about.commitmentsTitle": "معايير نعتمدها في كل ترجمة", "page.about.rigor": "الدقة", "page.about.rigorDesc": "تتم مراجعة كل ترجمة ومقارنتها بالوثيقة الأصلية قبل المصادقة.", "page.about.confidentiality": "السرية", "page.about.confidentialityDesc": "تُعالج وثائقكم الشخصية وتُحفظ بالحماية اللازمة.", "page.about.official": "الاعتراف الرسمي", "page.about.officialDesc": "ترجمات محلفة ومختومة وموقعة لإجراءاتكم الرسمية.", "page.about.deadlines": "احترام الآجال", "page.about.deadlinesDesc": "يُتابع الأجل المذكور في عرض السعر عبر الإنترنت ويتم احترامه.", "page.about.question": "هل تحتاجون إلى ترجمة مصادق عليها؟",
  "page.services.eyebrow": "خدماتنا", "page.services.title": "ترجمات قانونية محلفة حسب نوع الوثيقة", "page.services.description": "كل ترجمة مطابقة للأصل ومختومة وموقعة لإجراءاتكم الرسمية.", "page.services.missing": "وثيقتكم غير موجودة في القائمة؟", "page.services.missingDesc": "نترجم أغلب الوثائق الرسمية. أرسلوا الملف أو اتصلوا بنا للحصول على عرض سعر دون التزام.",
  "page.contact.title": "لديكم سؤال قبل الطلب؟", "page.contact.description": "اتصلوا بنا هاتفياً أو عبر البريد أو زوروا المكتب. للترجمة، أرسلوا الوثيقة لتحصلوا سريعاً على عرض سعر عبر الإنترنت.", "page.contact.office": "المكتب", "page.contact.ready": "هل أنتم مستعدون لترجمة وثيقتكم؟", "page.contact.readyDesc": "أرسلوا الملف وحددوا اللغة والآجال، وستحصلون على عرض سعر قبل أي التزام.",
  "page.faq.title": "الأسئلة الشائعة", "page.faq.description": "كل ما تحتاجون إلى معرفته قبل طلب ترجمة محلفة.", "page.faq.other": "لديكم سؤال آخر؟", "page.faq.otherDesc": "اتصلوا بنا مباشرة وسنجيبكم في أقرب وقت.",
  "page.articles.eyebrow": "نصائح وأخبار", "page.articles.title": "فهم إجراءات الترجمة", "page.articles.description": "أدلة عملية وأخبار وإجابات من المكتب لإعداد وثائقكم الرسمية.", "page.articles.empty": "لا توجد مقالات منشورة حالياً.", "page.articles.read": "اقرأ المقال", "page.article.eyebrow": "مقال من المكتب", "page.article.all": "كل المقالات", "page.article.published": "نشر بتاريخ {date}",
});

Object.assign(fr, {
  "partners.eyebrow": "Références & partenaires", "partners.title": "Des relations de confiance, visibles et vérifiables", "partners.description": "Cabinets, entreprises et institutions qui font appel à notre expertise linguistique.", "partners.fallbackEyebrow": "Domaines d'intervention", "partners.fallbackTitle": "Des traductions adaptées à chaque interlocuteur officiel", "partners.institution1": "Administrations", "partners.institution2": "Tribunaux", "partners.institution3": "Ambassades & consulats", "partners.institution4": "Universités", "partners.institution5": "Notaires & entreprises",
});
Object.assign(en, {
  "partners.eyebrow": "References & partners", "partners.title": "Trusted relationships, clearly presented", "partners.description": "Firms, companies and institutions that rely on our language expertise.", "partners.fallbackEyebrow": "Areas of practice", "partners.fallbackTitle": "Translations prepared for every official recipient", "partners.institution1": "Public authorities", "partners.institution2": "Courts", "partners.institution3": "Embassies & consulates", "partners.institution4": "Universities", "partners.institution5": "Notaries & companies",
});
Object.assign(it, {
  "partners.eyebrow": "Referenze e partner", "partners.title": "Rapporti di fiducia, presentati con trasparenza", "partners.description": "Studi, imprese e istituzioni che si affidano alla nostra competenza linguistica.", "partners.fallbackEyebrow": "Ambiti di intervento", "partners.fallbackTitle": "Traduzioni adatte a ogni interlocutore ufficiale", "partners.institution1": "Amministrazioni", "partners.institution2": "Tribunali", "partners.institution3": "Ambasciate e consolati", "partners.institution4": "Università", "partners.institution5": "Notai e imprese",
});
Object.assign(ar, {
  "partners.eyebrow": "المراجع والشركاء", "partners.title": "علاقات ثقة واضحة وموثوقة", "partners.description": "مكاتب ومؤسسات تعتمد على خبرتنا اللغوية.", "partners.fallbackEyebrow": "مجالات التدخل", "partners.fallbackTitle": "ترجمات مهيأة لكل جهة رسمية", "partners.institution1": "الإدارات", "partners.institution2": "المحاكم", "partners.institution3": "السفارات والقنصليات", "partners.institution4": "الجامعات", "partners.institution5": "العدول والمؤسسات",
});

Object.assign(fr, {
  "order.eyebrow": "Demande de traduction", "order.title": "Obtenez votre devis en quelques minutes", "order.subtitle": "Déposez votre document et précisez votre besoin. Aucun paiement n’est demandé avant la validation du devis.", "order.stepNeed": "Votre besoin", "order.stepContact": "Vos coordonnées", "order.stepQuote": "Devis & suivi", "order.needHint": "Type de document, langues et délai", "order.service": "Service demandé", "order.sourceLanguage": "Langue du document", "order.targetLanguage": "Langue souhaitée", "order.pages": "Nombre de pages", "order.deadline": "Délai souhaité", "order.sourceDocument": "Document source", "order.privateFile": "Votre fichier reste privé et sécurisé", "order.fileHint": "PDF, JPEG ou PNG — 20 Mo maximum", "order.contactHint": "Votre espace de suivi sera créé automatiquement", "order.fullName": "Nom complet", "order.accountPassword": "Mot de passe de votre espace", "order.existing": "Déjà client ?", "order.loginHint": "Connectez-vous pour conserver le même espace.", "order.summary": "Récapitulatif", "order.translation": "Traduction", "order.volume": "Volume", "order.initialEstimate": "Estimation initiale", "order.estimateNote": "Le devis final tient compte du délai et de la complexité. Vous le validerez avant tout paiement.", "order.receiveQuote": "Recevoir mon devis", "order.sending": "Envoi en cours…", "order.creating": "Création et envoi…", "order.noPayment": "Aucun paiement immédiat", "order.confidential": "Documents confidentiels", "order.fullTracking": "Suivi complet dans votre espace", "order.noServices": "Aucun service disponible pour le moment.", "order.contactUs": "Contactez-nous", "order.langFrench": "Français", "order.langArabic": "Arabe", "order.langEnglish": "Anglais", "order.sameLanguage": "La langue source et la langue cible doivent être différentes.", "order.fileRequired": "Merci de déposer votre document.", "file.change": "Changer", "file.remove": "Retirer le fichier", "file.choose": "Cliquez pour choisir un fichier", "file.drop": "ou glissez-le ici",
});
Object.assign(en, {
  "order.eyebrow": "Translation request", "order.title": "Get your quote in a few minutes", "order.subtitle": "Upload your document and describe your needs. No payment is required before you approve the quote.", "order.stepNeed": "Your needs", "order.stepContact": "Your details", "order.stepQuote": "Quote & tracking", "order.needHint": "Document type, languages and deadline", "order.service": "Requested service", "order.sourceLanguage": "Document language", "order.targetLanguage": "Target language", "order.pages": "Number of pages", "order.deadline": "Requested deadline", "order.sourceDocument": "Source document", "order.privateFile": "Your file remains private and secure", "order.fileHint": "PDF, JPEG or PNG — 20 MB maximum", "order.contactHint": "Your tracking area will be created automatically", "order.fullName": "Full name", "order.accountPassword": "Account password", "order.existing": "Already a client?", "order.loginHint": "Sign in to keep using the same account.", "order.summary": "Summary", "order.translation": "Translation", "order.volume": "Volume", "order.initialEstimate": "Initial estimate", "order.estimateNote": "The final quote reflects the deadline and complexity. You approve it before any payment.", "order.receiveQuote": "Get my quote", "order.sending": "Sending…", "order.creating": "Creating account and sending…", "order.noPayment": "No immediate payment", "order.confidential": "Confidential documents", "order.fullTracking": "Full tracking in your account", "order.noServices": "No services are currently available.", "order.contactUs": "Contact us", "order.langFrench": "French", "order.langArabic": "Arabic", "order.langEnglish": "English", "order.sameLanguage": "Source and target languages must be different.", "order.fileRequired": "Please upload your document.", "file.change": "Change", "file.remove": "Remove file", "file.choose": "Click to choose a file", "file.drop": "or drag it here",
});
Object.assign(it, {
  "order.eyebrow": "Richiesta di traduzione", "order.title": "Ricevete il preventivo in pochi minuti", "order.subtitle": "Caricate il documento e indicate le vostre esigenze. Nessun pagamento è richiesto prima dell’approvazione del preventivo.", "order.stepNeed": "Le vostre esigenze", "order.stepContact": "I vostri dati", "order.stepQuote": "Preventivo e tracking", "order.needHint": "Tipo di documento, lingue e tempi", "order.service": "Servizio richiesto", "order.sourceLanguage": "Lingua del documento", "order.targetLanguage": "Lingua desiderata", "order.pages": "Numero di pagine", "order.deadline": "Tempi desiderati", "order.sourceDocument": "Documento originale", "order.privateFile": "Il file resta privato e protetto", "order.fileHint": "PDF, JPEG o PNG — massimo 20 MB", "order.contactHint": "La vostra area di tracking sarà creata automaticamente", "order.fullName": "Nome completo", "order.accountPassword": "Password dell’area personale", "order.existing": "Già clienti?", "order.loginHint": "Accedete per conservare lo stesso spazio.", "order.summary": "Riepilogo", "order.translation": "Traduzione", "order.volume": "Volume", "order.initialEstimate": "Stima iniziale", "order.estimateNote": "Il preventivo finale tiene conto dei tempi e della complessità. Lo approverete prima del pagamento.", "order.receiveQuote": "Ricevi il preventivo", "order.sending": "Invio…", "order.creating": "Creazione e invio…", "order.noPayment": "Nessun pagamento immediato", "order.confidential": "Documenti riservati", "order.fullTracking": "Tracking completo nell’area personale", "order.noServices": "Nessun servizio disponibile al momento.", "order.contactUs": "Contattaci", "order.langFrench": "Francese", "order.langArabic": "Arabo", "order.langEnglish": "Inglese", "order.sameLanguage": "La lingua di partenza e quella di arrivo devono essere diverse.", "order.fileRequired": "Caricate il documento.", "file.change": "Cambia", "file.remove": "Rimuovi file", "file.choose": "Clicca per scegliere un file", "file.drop": "o trascinalo qui",
});
Object.assign(ar, {
  "order.eyebrow": "طلب ترجمة", "order.title": "احصلوا على عرض السعر خلال دقائق", "order.subtitle": "أرسلوا الوثيقة وحددوا حاجتكم. لا يُطلب أي دفع قبل الموافقة على عرض السعر.", "order.stepNeed": "حاجتكم", "order.stepContact": "بياناتكم", "order.stepQuote": "عرض السعر والمتابعة", "order.needHint": "نوع الوثيقة واللغات والآجال", "order.service": "الخدمة المطلوبة", "order.sourceLanguage": "لغة الوثيقة", "order.targetLanguage": "اللغة المطلوبة", "order.pages": "عدد الصفحات", "order.deadline": "الأجل المطلوب", "order.sourceDocument": "الوثيقة الأصلية", "order.privateFile": "يبقى ملفكم خاصاً ومؤمناً", "order.fileHint": "PDF أو JPEG أو PNG — بحد أقصى 20 ميغابايت", "order.contactHint": "سيتم إنشاء فضاء المتابعة آلياً", "order.fullName": "الاسم الكامل", "order.accountPassword": "كلمة مرور فضائكم", "order.existing": "لديكم حساب؟", "order.loginHint": "سجلوا الدخول للاحتفاظ بالفضاء نفسه.", "order.summary": "الملخص", "order.translation": "الترجمة", "order.volume": "الحجم", "order.initialEstimate": "التقدير الأولي", "order.estimateNote": "يراعي عرض السعر النهائي الآجال ودرجة التعقيد. توافقون عليه قبل أي دفع.", "order.receiveQuote": "الحصول على عرض السعر", "order.sending": "جارٍ الإرسال…", "order.creating": "جارٍ إنشاء الحساب والإرسال…", "order.noPayment": "لا يوجد دفع فوري", "order.confidential": "وثائق سرية", "order.fullTracking": "متابعة كاملة في فضائكم", "order.noServices": "لا توجد خدمات متاحة حالياً.", "order.contactUs": "اتصلوا بنا", "order.langFrench": "الفرنسية", "order.langArabic": "العربية", "order.langEnglish": "الإنجليزية", "order.sameLanguage": "يجب أن تختلف لغة المصدر عن اللغة المطلوبة.", "order.fileRequired": "يرجى إرسال الوثيقة.", "file.change": "تغيير", "file.remove": "إزالة الملف", "file.choose": "اضغطوا لاختيار ملف", "file.drop": "أو اسحبوه إلى هنا",
});

Object.assign(fr, { "delay.standard": "Standard (5-7 jours)", "delay.express": "Express (48 h)", "delay.urgent": "Urgent (24 h)" });
Object.assign(en, { "delay.standard": "Standard (5-7 days)", "delay.express": "Express (48h)", "delay.urgent": "Urgent (24h)" });
Object.assign(it, { "delay.standard": "Standard (5-7 giorni)", "delay.express": "Express (48 ore)", "delay.urgent": "Urgente (24 ore)" });
Object.assign(ar, { "delay.standard": "عادي (5-7 أيام)", "delay.express": "سريع (48 ساعة)", "delay.urgent": "عاجل (24 ساعة)" });

Object.assign(fr, {
  "brand.latin": "Maître Makram Arfaoui", "brand.arabic": "الأستاذ مكرم العرفاوي", "brand.shortName": "Makram Arfaoui",
  "contact.phonePrimary": "(+216) 22 200 170", "contact.phoneSecondary": "(+216) 51 100 036", "contact.email": "contact@makramarfaoui.com", "contact.addressLine1": "17 Rue de Marseille", "contact.addressLine2": "Tunis 1001, Tunisie",
  "hero.sourceSample": "الشهادة الأصلية", "hero.stampRing": "• TRADUCTEUR ASSERMENTÉ • TUNIS •", "hero.stampCenter": "CERTIFIÉ CONFORME", "statement.name": "Makram Arfaoui", "testimonials.eyebrow": "Avis clients", "testimonials.title": "Ce qu’en disent nos clients", "footer.copyright": "© {year} Maître Makram Arfaoui. Tous droits réservés.",
});
Object.assign(en, {
  "brand.latin": "Maître Makram Arfaoui", "brand.arabic": "الأستاذ مكرم العرفاوي", "brand.shortName": "Makram Arfaoui",
  "contact.phonePrimary": "(+216) 22 200 170", "contact.phoneSecondary": "(+216) 51 100 036", "contact.email": "contact@makramarfaoui.com", "contact.addressLine1": "17 Rue de Marseille", "contact.addressLine2": "Tunis 1001, Tunisia",
  "hero.sourceSample": "Original certificate", "hero.stampRing": "• SWORN TRANSLATOR • TUNIS •", "hero.stampCenter": "CERTIFIED TRUE COPY", "statement.name": "Makram Arfaoui", "testimonials.eyebrow": "Client reviews", "testimonials.title": "What our clients say", "footer.copyright": "© {year} Maître Makram Arfaoui. All rights reserved.",
});
Object.assign(it, {
  "brand.latin": "Maître Makram Arfaoui", "brand.arabic": "الأستاذ مكرم العرفاوي", "brand.shortName": "Makram Arfaoui",
  "contact.phonePrimary": "(+216) 22 200 170", "contact.phoneSecondary": "(+216) 51 100 036", "contact.email": "contact@makramarfaoui.com", "contact.addressLine1": "17 Rue de Marseille", "contact.addressLine2": "Tunisi 1001, Tunisia",
  "hero.sourceSample": "Certificato originale", "hero.stampRing": "• TRADUTTORE GIURATO • TUNISI •", "hero.stampCenter": "COPIA CERTIFICATA", "statement.name": "Makram Arfaoui", "testimonials.eyebrow": "Recensioni", "testimonials.title": "Cosa dicono i nostri clienti", "footer.copyright": "© {year} Maître Makram Arfaoui. Tutti i diritti riservati.",
});
Object.assign(ar, {
  "brand.latin": "Maître Makram Arfaoui", "brand.arabic": "الأستاذ مكرم العرفاوي", "brand.shortName": "مكرم العرفاوي",
  "contact.phonePrimary": "(+216) 22 200 170", "contact.phoneSecondary": "(+216) 51 100 036", "contact.email": "contact@makramarfaoui.com", "contact.addressLine1": "17 نهج مرسيليا", "contact.addressLine2": "تونس 1001، تونس",
  "hero.sourceSample": "الشهادة الأصلية", "hero.stampRing": "• مترجم محلف • تونس •", "hero.stampCenter": "مطابق للأصل", "statement.name": "مكرم العرفاوي", "testimonials.eyebrow": "آراء الحرفاء", "testimonials.title": "آراء حرفائنا", "footer.copyright": "© {year} الأستاذ مكرم العرفاوي. جميع الحقوق محفوظة.",
});

export const DICTIONARIES: Record<Locale, Dictionary> = {
  fr: { ...fr, ...getAppDictionary("fr"), ...getAdminDictionary("fr"), ...getLegalDictionary("fr") },
  ar: { ...ar, ...getAppDictionary("ar"), ...getAdminDictionary("ar"), ...getLegalDictionary("ar") },
  en: { ...en, ...getAppDictionary("en"), ...getAdminDictionary("en"), ...getLegalDictionary("en") },
  it: { ...it, ...getAppDictionary("it"), ...getAdminDictionary("it"), ...getLegalDictionary("it") },
};

/** Locale de formatage (dates, nombres) associée à chaque langue du site. */
export function getDateLocale(locale: Locale): string {
  return { fr: "fr-FR", ar: "ar-TN", en: "en-GB", it: "it-IT" }[locale];
}

export function translate(locale: Locale, key: TranslationKey, values?: Record<string, string | number>, overrides?: Dictionary): string {
  let value = overrides?.[key] ?? DICTIONARIES[locale][key] ?? fr[key] ?? key;
  if (values) {
    for (const [name, replacement] of Object.entries(values)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}
