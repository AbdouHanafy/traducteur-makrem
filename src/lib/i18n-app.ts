import type { Locale } from "@/lib/i18n";

/**
 * Textes de l'espace client et des écrans partagés (compte, commande, paiement). Format
 * compact : [fr, ar, en, it]. Les clés `app.*` sont éditables depuis
 * /admin/site-content (groupe « Espace client »).
 */
type Row = readonly [fr: string, ar: string, en: string, it: string];

const ROWS: Record<string, Row> = {
  // Navigation / coque de l'espace connecté
  "app.nav.dashboard": ["Tableau de bord", "لوحة التحكم", "Dashboard", "Pannello di controllo"],
  "app.nav.groupTranslations": ["Mes traductions", "ترجماتي", "My translations", "Le mie traduzioni"],
  "app.nav.orders": ["Mes commandes", "طلباتي", "My orders", "I miei ordini"],
  "app.nav.documents": ["Mes documents", "مستنداتي", "My documents", "I miei documenti"],
  "app.nav.groupHelp": ["Aide & compte", "المساعدة والحساب", "Help & account", "Aiuto e account"],
  "app.nav.support": ["Aide & contact", "المساعدة والتواصل", "Help & contact", "Aiuto e contatti"],
  "app.nav.account": ["Mon compte", "حسابي", "My account", "Il mio account"],
  "app.nav.newOrder": ["Nouvelle commande", "طلب جديد", "New order", "Nuovo ordine"],
  "app.shell.closeMenu": ["Fermer le menu", "إغلاق القائمة", "Close menu", "Chiudi il menu"],
  "app.shell.openMenu": ["Ouvrir le menu", "فتح القائمة", "Open menu", "Apri il menu"],
  "app.shell.navigation": ["Navigation", "التنقل", "Navigation", "Navigazione"],
  "app.shell.backoffice": ["Back-office", "لوحة الإدارة", "Back office", "Back office"],
  "app.shell.mySpace": ["Mon espace", "فضائي", "My space", "Il mio spazio"],
  "app.shell.admin": ["Administration", "الإدارة", "Administration", "Amministrazione"],
  "app.shell.clientSpace": ["Espace client", "فضاء الحريف", "Client area", "Area clienti"],
  "app.shell.viewSite": ["Voir le site", "عرض الموقع", "View site", "Vedi il sito"],
  "app.shell.logout": ["Se déconnecter", "تسجيل الخروج", "Log out", "Esci"],
  "app.loading": ["Chargement", "جارٍ التحميل", "Loading", "Caricamento"],

  // Statuts de commande (partagés par les écrans client)
  "app.status.DEMANDE": ["Demande reçue", "تم استلام الطلب", "Request received", "Richiesta ricevuta"],
  "app.status.DEVIS_A_VALIDER": ["Devis à valider", "عرض سعر بانتظار الموافقة", "Quote to approve", "Preventivo da approvare"],
  "app.status.EN_ATTENTE_ACOMPTE": ["Acompte à régler", "دفعة مقدّمة مطلوبة", "Deposit due", "Acconto da pagare"],
  "app.status.ACOMPTE_PAYE": ["Acompte réglé", "تم دفع المقدّم", "Deposit paid", "Acconto pagato"],
  "app.status.EN_TRADUCTION": ["En traduction", "قيد الترجمة", "Being translated", "In traduzione"],
  "app.status.TRADUCTION_TERMINEE": ["Traduction terminée", "اكتملت الترجمة", "Translation completed", "Traduzione completata"],
  "app.status.FICHIER_EN_ATTENTE_DE_SOLDE": ["Solde à régler", "الرصيد مطلوب", "Balance due", "Saldo da pagare"],
  "app.status.SOLDE_PAYE": ["Solde réglé", "تم دفع الرصيد", "Balance paid", "Saldo pagato"],
  "app.status.TELECHARGEABLE": ["Document disponible", "المستند متاح", "Document available", "Documento disponibile"],
  "app.status.TERMINEE": ["Terminée", "منتهية", "Completed", "Completato"],
  "app.status.ANNULEE": ["Annulée", "ملغاة", "Cancelled", "Annullato"],

  // Tableau de bord client
  "app.dash.welcome": ["Bienvenue dans votre espace", "مرحبًا بكم في فضائكم", "Welcome to your space", "Benvenuto nel tuo spazio"],
  "app.dash.hello": ["Bonjour {name},", "مرحبًا {name}،", "Hello {name},", "Buongiorno {name},"],
  "app.dash.intro": ["Suivez vos traductions, validez vos devis et récupérez vos documents certifiés depuis un seul endroit.", "تابعوا ترجماتكم ووافقوا على عروض الأسعار واستلموا مستنداتكم المصادق عليها من مكان واحد.", "Track your translations, approve your quotes and collect your certified documents from one place.", "Segui le tue traduzioni, approva i preventivi e ritira i documenti certificati da un unico posto."],
  "app.dash.request": ["Demander une traduction", "طلب ترجمة", "Request a translation", "Richiedi una traduzione"],
  "app.dash.statActive": ["Commandes actives", "الطلبات النشطة", "Active orders", "Ordini attivi"],
  "app.dash.statActiveNote": ["en cours de traitement", "قيد المعالجة", "being processed", "in lavorazione"],
  "app.dash.statAction": ["Action requise", "إجراء مطلوب", "Action required", "Azione richiesta"],
  "app.dash.statActionNote": ["à valider ou à régler", "للموافقة أو للدفع", "to approve or pay", "da approvare o pagare"],
  "app.dash.statUpToDate": ["vous êtes à jour", "كل شيء محدَّث", "you are up to date", "sei in regola"],
  "app.dash.statReady": ["Documents prêts", "مستندات جاهزة", "Documents ready", "Documenti pronti"],
  "app.dash.statReadyNote": ["disponibles au téléchargement", "متاحة للتحميل", "available to download", "disponibili al download"],
  "app.dash.recent": ["Commandes récentes", "الطلبات الأخيرة", "Recent orders", "Ordini recenti"],
  "app.dash.recentSub": ["L’avancement de vos dernières demandes", "تقدّم آخر طلباتكم", "Progress of your latest requests", "Avanzamento delle tue ultime richieste"],
  "app.dash.seeAll": ["Tout voir", "عرض الكل", "See all", "Vedi tutto"],
  "app.dash.noOrders": ["Aucune commande", "لا توجد طلبات", "No orders", "Nessun ordine"],
  "app.dash.noOrdersHint": ["Votre première demande ne prend que quelques minutes.", "طلبكم الأول لا يستغرق سوى دقائق.", "Your first request only takes a few minutes.", "La tua prima richiesta richiede solo pochi minuti."],
  "app.dash.actionText": ["La commande {reference} attend votre intervention pour continuer.", "الطلب {reference} ينتظر تدخلكم للمتابعة.", "Order {reference} is waiting for you to continue.", "L’ordine {reference} attende un tuo intervento per proseguire."],
  "app.dash.openOrder": ["Ouvrir la commande", "فتح الطلب", "Open the order", "Apri l’ordine"],
  "app.dash.allGood": ["Tout est à jour", "كل شيء محدَّث", "Everything is up to date", "Tutto in regola"],
  "app.dash.allGoodText": ["Aucune validation ni aucun paiement n’attend votre intervention.", "لا توجد موافقة أو دفعة تنتظر تدخلكم.", "No approval or payment is waiting for you.", "Nessuna approvazione o pagamento attende un tuo intervento."],
  "app.dash.helpTitle": ["Besoin d’aide ?", "هل تحتاجون إلى مساعدة؟", "Need help?", "Hai bisogno di aiuto?"],
  "app.dash.helpText": ["Le cabinet vous accompagne pour toute question sur une commande ou un document.", "المكتب معكم للإجابة عن أي سؤال حول طلب أو مستند.", "The firm is here to help with any question about an order or a document.", "Lo studio ti assiste per qualsiasi domanda su un ordine o un documento."],
  "app.dash.contactFirm": ["Contacter le cabinet", "التواصل مع المكتب", "Contact the firm", "Contatta lo studio"],

  // Liste des commandes / documents
  "app.orders.eyebrow": ["Mes traductions", "ترجماتي", "My translations", "Le mie traduzioni"],
  "app.orders.title": ["Mes commandes", "طلباتي", "My orders", "I miei ordini"],
  "app.orders.subtitle": ["Consultez l’avancement, les paiements et les documents de chaque dossier.", "اطّلعوا على تقدّم كل ملف ودفعاته ومستنداته.", "Check the progress, payments and documents of each file.", "Consulta l’avanzamento, i pagamenti e i documenti di ogni pratica."],
  "app.orders.empty": ["Aucune commande pour l'instant.", "لا توجد طلبات حاليًا.", "No orders yet.", "Nessun ordine per ora."],
  "app.files.eyebrow": ["Documents sécurisés", "مستندات مؤمَّنة", "Secure documents", "Documenti protetti"],
  "app.files.title": ["Mes documents", "مستنداتي", "My documents", "I miei documenti"],
  "app.files.subtitle": ["Retrouvez vos fichiers sources et vos traductions certifiées.", "تجدون هنا ملفاتكم الأصلية وترجماتكم المصادق عليها.", "Find your source files and your certified translations.", "Ritrova i tuoi file originali e le tue traduzioni certificate."],
  "app.files.empty": ["Aucun fichier pour l'instant.", "لا توجد ملفات حاليًا.", "No files yet.", "Nessun file per ora."],
  "app.files.viewOrder": ["Voir la commande", "عرض الطلب", "View order", "Vedi l’ordine"],
  "app.files.source": ["Document source — {name}", "المستند الأصلي — {name}", "Source document — {name}", "Documento originale — {name}"],
  "app.files.translated": ["Traduction certifiée — {name}", "الترجمة المصادق عليها — {name}", "Certified translation — {name}", "Traduzione certificata — {name}"],
  "app.files.locked": ["Traduction verrouillée — solde à régler", "الترجمة مقفلة — الرصيد مطلوب", "Translation locked — balance due", "Traduzione bloccata — saldo da pagare"],

  // Aide
  "app.support.eyebrow": ["Nous sommes disponibles", "نحن في خدمتكم", "We are available", "Siamo a tua disposizione"],
  "app.support.title": ["Aide & contact", "المساعدة والتواصل", "Help & contact", "Aiuto e contatti"],
  "app.support.intro": ["Un souci avec une commande, un paiement ou votre document ? Contactez directement le cabinet — pensez à indiquer la référence de votre commande (ex. CMD-2026-XXXXXXXX).", "مشكلة في طلب أو دفعة أو مستند؟ تواصلوا مباشرة مع المكتب مع ذكر مرجع طلبكم (مثال: CMD-2026-XXXXXXXX).", "A problem with an order, a payment or your document? Contact the firm directly — remember to mention your order reference (e.g. CMD-2026-XXXXXXXX).", "Un problema con un ordine, un pagamento o il tuo documento? Contatta direttamente lo studio indicando il riferimento dell’ordine (es. CMD-2026-XXXXXXXX)."],
  "app.support.also": ["Vous pouvez aussi consulter :", "يمكنكم أيضًا الاطلاع على:", "You can also check:", "Puoi anche consultare:"],
  "app.support.faqLink": ["la FAQ", "الأسئلة الشائعة", "the FAQ", "le FAQ"],
  "app.support.contactLink": ["la page contact", "صفحة الاتصال", "the contact page", "la pagina contatti"],

  // Aperçu verrouillé / accès fichier
  "app.locked.badge": ["Document protégé", "مستند محمي", "Protected document", "Documento protetto"],
  "app.locked.title": ["Traduction prête et verrouillée", "الترجمة جاهزة ومقفلة", "Translation ready and locked", "Traduzione pronta e bloccata"],
  "app.locked.text": ["Le contenu du fichier final n’est jamais transmis avant la confirmation du paiement du solde.", "لا يُرسَل محتوى الملف النهائي قبل تأكيد دفع الرصيد.", "The content of the final file is never sent before the balance payment is confirmed.", "Il contenuto del file finale non viene mai inviato prima della conferma del pagamento del saldo."],
  "app.locked.footer": ["Le téléchargement sera activé automatiquement après confirmation serveur du paiement.", "سيُفعَّل التحميل تلقائيًا بعد تأكيد الدفع من الخادم.", "Download will be enabled automatically once the server confirms the payment.", "Il download sarà attivato automaticamente dopo la conferma del pagamento da parte del server."],
  "app.access.notReady": ["Aucun fichier", "لا يوجد ملف", "No file", "Nessun file"],
  "app.access.notReadyTitle": ["La traduction finale n'a pas encore été déposée.", "لم يتم إيداع الترجمة النهائية بعد.", "The final translation has not been uploaded yet.", "La traduzione finale non è ancora stata caricata."],
  "app.access.locked": ["Verrouillé", "مقفل", "Locked", "Bloccato"],
  "app.access.lockedTitle": ["Le client ne peut pas accéder au fichier avant la confirmation complète du solde.", "لا يستطيع الحريف الوصول إلى الملف قبل تأكيد الرصيد كاملًا.", "The client cannot access the file before the balance is fully confirmed.", "Il cliente non può accedere al file prima della conferma completa del saldo."],
  "app.access.unlocked": ["Déverrouillé", "مفتوح", "Unlocked", "Sbloccato"],
  "app.access.unlockedTitle": ["Le paiement est confirmé et le client peut télécharger le fichier.", "تم تأكيد الدفع ويمكن للحريف تحميل الملف.", "Payment is confirmed and the client can download the file.", "Il pagamento è confermato e il cliente può scaricare il file."],

  // Détail d'une commande
  "app.order.source": ["Document source", "المستند الأصلي", "Source document", "Documento originale"],
  "app.order.download": ["Télécharger {name}", "تحميل {name}", "Download {name}", "Scarica {name}"],
  "app.order.noDocument": ["Aucun document.", "لا يوجد مستند.", "No document.", "Nessun documento."],
  "app.order.translation": ["Traduction certifiée", "الترجمة المصادق عليها", "Certified translation", "Traduzione certificata"],
  "app.order.notYet": ["Le traducteur n'a pas encore déposé le fichier final.", "لم يودع المترجم الملف النهائي بعد.", "The translator has not uploaded the final file yet.", "Il traduttore non ha ancora caricato il file finale."],
  "app.order.downloadCertified": ["Télécharger le fichier certifié", "تحميل الملف المصادق عليه", "Download the certified file", "Scarica il file certificato"],
  "app.order.payment": ["Paiement", "الدفع", "Payment", "Pagamento"],
  "app.order.total": ["Total", "المجموع", "Total", "Totale"],
  "app.order.advance": ["Acompte (50%)", "المقدّم (50%)", "Deposit (50%)", "Acconto (50%)"],
  "app.order.balance": ["Solde (50%)", "الرصيد (50%)", "Balance (50%)", "Saldo (50%)"],
  "app.order.paid": ["payé", "مدفوع", "paid", "pagato"],
  "app.order.acceptQuote": ["Accepter le devis", "قبول عرض السعر", "Accept the quote", "Accetta il preventivo"],
  "app.order.payAdvance": ["Payer l'acompte ({amount} TND)", "دفع المقدّم ({amount} د.ت)", "Pay the deposit ({amount} TND)", "Paga l’acconto ({amount} TND)"],
  "app.order.payBalance": ["Payer le solde ({amount} TND)", "دفع الرصيد ({amount} د.ت)", "Pay the balance ({amount} TND)", "Paga il saldo ({amount} TND)"],
  "app.order.tracking": ["Suivi", "التتبّع", "Tracking", "Tracciamento"],
  "app.order.pagesOne": ["{count} page", "{count} صفحة", "{count} page", "{count} pagina"],
  "app.order.pagesMany": ["{count} pages", "{count} صفحات", "{count} pages", "{count} pagine"],
  "app.order.errAccept": ["Impossible d'accepter le devis.", "تعذّر قبول عرض السعر.", "Unable to accept the quote.", "Impossibile accettare il preventivo."],
  "app.order.errPay": ["Impossible de lancer le paiement.", "تعذّر بدء الدفع.", "Unable to start the payment.", "Impossibile avviare il pagamento."],

  // Paiement (bac à sable)
  "app.pay.sandbox": ["Bac à sable paiement — sandbox", "بيئة تجريبية للدفع", "Payment sandbox", "Sandbox di pagamento"],
  "app.pay.titleAdvance": ["Paiement de l'acompte", "دفع المقدّم", "Deposit payment", "Pagamento dell’acconto"],
  "app.pay.titleBalance": ["Paiement du solde", "دفع الرصيد", "Balance payment", "Pagamento del saldo"],
  "app.pay.order": ["Commande {reference}", "الطلب {reference}", "Order {reference}", "Ordine {reference}"],
  "app.pay.cardNumber": ["Numéro de carte", "رقم البطاقة", "Card number", "Numero della carta"],
  "app.pay.cardHolder": ["Titulaire de la carte", "صاحب البطاقة", "Cardholder", "Titolare della carta"],
  "app.pay.expiry": ["Expiration", "تاريخ الانتهاء", "Expiry", "Scadenza"],
  "app.pay.processing": ["Traitement en cours…", "جارٍ المعالجة…", "Processing…", "Elaborazione in corso…"],
  "app.pay.submit": ["Payer {amount} TND", "دفع {amount} د.ت", "Pay {amount} TND", "Paga {amount} TND"],
  "app.pay.cancel": ["Annuler", "إلغاء", "Cancel", "Annulla"],
  "app.pay.declined": ["Paiement refusé par la banque (simulation — carte de test 4000 0000 0000 0002).", "رفض البنك عملية الدفع (محاكاة — بطاقة الاختبار 4000 0000 0000 0002).", "Payment declined by the bank (simulation — test card 4000 0000 0000 0002).", "Pagamento rifiutato dalla banca (simulazione — carta di prova 4000 0000 0000 0002)."],
  "app.pay.notConfirmed": ["Le paiement n'a pas pu être confirmé.", "تعذّر تأكيد الدفع.", "The payment could not be confirmed.", "Non è stato possibile confermare il pagamento."],
  "app.pay.testEnv": ["Environnement de test — aucune banque réelle n'est appelée ; un vrai prestataire de paiement remplacera cet écran en production.", "بيئة اختبار — لا يتم الاتصال بأي بنك حقيقي؛ سيحلّ مزوّد دفع فعلي محلّ هذه الشاشة في الإنتاج.", "Test environment — no real bank is contacted; a real payment provider will replace this screen in production.", "Ambiente di prova — nessuna banca reale viene contattata; in produzione questa schermata sarà sostituita da un vero fornitore di pagamenti."],
  "app.pay.testCards": ["Carte 4242 4242 4242 4242 → paiement accepté · 4000 0000 0000 0002 → paiement refusé (simulation).", "البطاقة 4242 4242 4242 4242 ← دفع مقبول · 4000 0000 0000 0002 ← دفع مرفوض (محاكاة).", "Card 4242 4242 4242 4242 → payment accepted · 4000 0000 0000 0002 → payment declined (simulation).", "Carta 4242 4242 4242 4242 → pagamento accettato · 4000 0000 0000 0002 → pagamento rifiutato (simulazione)."],

  // Compte
  "app.account.eyebrow": ["Sécurité & identité", "الأمان والهوية", "Security & identity", "Sicurezza e identità"],
  "app.account.title": ["Mon compte", "حسابي", "My account", "Il mio account"],
  "app.account.subtitle": ["Consultez vos informations et sécurisez votre accès.", "اطّلعوا على معلوماتكم وأمّنوا دخولكم.", "Review your details and secure your access.", "Consulta i tuoi dati e proteggi il tuo accesso."],
  "app.account.info": ["Informations", "المعلومات", "Information", "Informazioni"],
  "app.account.changePassword": ["Changer mon mot de passe", "تغيير كلمة المرور", "Change my password", "Cambia la mia password"],
  "app.account.changeHint": ["Vous pouvez modifier le mot de passe défini lors de votre commande à tout moment.", "يمكنكم تغيير كلمة المرور المحددة عند الطلب في أي وقت.", "You can change the password set when you ordered at any time.", "Puoi modificare in qualsiasi momento la password impostata durante l’ordine."],
  "app.account.current": ["Mot de passe actuel", "كلمة المرور الحالية", "Current password", "Password attuale"],
  "app.account.new": ["Nouveau mot de passe", "كلمة المرور الجديدة", "New password", "Nuova password"],
  "app.account.newHint": ["10 caractères minimum", "10 أحرف على الأقل", "10 characters minimum", "Minimo 10 caratteri"],
  "app.account.confirm": ["Confirmer le nouveau mot de passe", "تأكيد كلمة المرور الجديدة", "Confirm the new password", "Conferma la nuova password"],
  "app.account.submit": ["Modifier le mot de passe", "تغيير كلمة المرور", "Change password", "Modifica la password"],
  "app.account.saving": ["Modification…", "جارٍ التغيير…", "Updating…", "Modifica in corso…"],
  "app.account.mismatch": ["Les deux mots de passe ne correspondent pas.", "كلمتا المرور غير متطابقتين.", "The two passwords do not match.", "Le due password non coincidono."],
  "app.account.wrong": ["Mot de passe actuel incorrect.", "كلمة المرور الحالية غير صحيحة.", "Current password is incorrect.", "La password attuale non è corretta."],
  "app.account.failed": ["Impossible de modifier le mot de passe.", "تعذّر تغيير كلمة المرور.", "Unable to change the password.", "Impossibile modificare la password."],
  "app.account.success": ["Mot de passe modifié avec succès.", "تم تغيير كلمة المرور بنجاح.", "Password changed successfully.", "Password modificata con successo."],

  // Erreurs communes (inscription, commande)
  "app.err.CONSENT_REQUIRED": ["Vous devez accepter les conditions générales et la politique de confidentialité.", "يجب قبول الشروط العامة وسياسة الخصوصية.", "You must accept the terms of sale and the privacy policy.", "Devi accettare le condizioni generali e l’informativa sulla privacy."],
  "app.err.RATE_LIMITED": ["Trop de tentatives. Réessayez dans quelques minutes.", "محاولات كثيرة. أعيدوا المحاولة بعد بضع دقائق.", "Too many attempts. Please try again in a few minutes.", "Troppi tentativi. Riprova tra qualche minuto."],
  "app.err.PAYLOAD_TOO_LARGE": ["Fichier trop volumineux (20 Mo maximum).", "الملف كبير جدًا (20 ميغابايت كحد أقصى).", "File too large (20 MB maximum).", "File troppo grande (massimo 20 MB)."],
  "app.err.emailExists": ["Un compte existe déjà avec cette adresse email.", "يوجد حساب بهذا البريد الإلكتروني مسبقًا.", "An account already exists with this email address.", "Esiste già un account con questo indirizzo email."],
  "app.err.emailExistsLogin": ["Un compte existe déjà avec cette adresse email. Connectez-vous puis réessayez.", "يوجد حساب بهذا البريد الإلكتروني مسبقًا. سجّلوا الدخول ثم أعيدوا المحاولة.", "An account already exists with this email address. Log in and try again.", "Esiste già un account con questo indirizzo email. Accedi e riprova."],
  "app.err.generic": ["Une erreur est survenue. Réessayez.", "حدث خطأ. أعيدوا المحاولة.", "An error occurred. Please try again.", "Si è verificato un errore. Riprova."],
  "app.err.accountCreate": ["Impossible de créer le compte. Vérifiez les informations.", "تعذّر إنشاء الحساب. تحقّقوا من المعلومات.", "Unable to create the account. Check the information.", "Impossibile creare l’account. Verifica i dati."],
  "app.err.UNAUTHENTICATED": ["Vous devez être connecté.", "يجب تسجيل الدخول.", "You must be logged in.", "Devi effettuare l’accesso."],
  "app.err.INVALID_DATA": ["Données invalides.", "بيانات غير صالحة.", "Invalid data.", "Dati non validi."],
  "app.err.SAME_LANGUAGE": ["Les langues source et cible doivent être différentes.", "يجب أن تختلف لغة المصدر عن لغة الهدف.", "The source and target languages must be different.", "La lingua di origine e quella di destinazione devono essere diverse."],
  "app.err.FILE_REQUIRED": ["Document source requis.", "المستند الأصلي مطلوب.", "Source document required.", "Documento originale richiesto."],
  "app.err.INVALID_SERVICE": ["Service invalide.", "خدمة غير صالحة.", "Invalid service.", "Servizio non valido."],
  "app.err.INVALID_DELAY": ["Délai invalide.", "أجل غير صالح.", "Invalid deadline.", "Scadenza non valida."],
  "app.err.FILE_EMPTY": ["Fichier vide.", "الملف فارغ.", "Empty file.", "File vuoto."],
  "app.err.FILE_TOO_LARGE": ["Fichier trop volumineux (20 Mo maximum).", "الملف كبير جدًا (20 ميغابايت كحد أقصى).", "File too large (20 MB maximum).", "File troppo grande (massimo 20 MB)."],
  "app.err.FILE_BAD_TYPE": ["Format de fichier non supporté (PDF, JPEG ou PNG uniquement).", "صيغة الملف غير مدعومة (PDF أو JPEG أو PNG فقط).", "Unsupported file format (PDF, JPEG or PNG only).", "Formato di file non supportato (solo PDF, JPEG o PNG)."],

  // SEO : titres et descriptions des pages publiques
  "seo.services.title": ["Nos services", "خدماتنا", "Our services", "I nostri servizi"],
  "seo.services.description": ["Traductions juridiques assermentées : actes d'état civil, diplômes, contrats, documents judiciaires, immigration, interprétariat.", "ترجمات قانونية محلّفة: وثائق الحالة المدنية، الشهادات، العقود، الوثائق القضائية، الهجرة، الترجمة الفورية.", "Sworn legal translations: civil-status records, diplomas, contracts, court documents, immigration, interpreting.", "Traduzioni giuridiche giurate: atti di stato civile, diplomi, contratti, documenti giudiziari, immigrazione, interpretariato."],
  "seo.faq.title": ["Questions fréquentes", "الأسئلة الشائعة", "Frequently asked questions", "Domande frequenti"],
  "seo.faq.description": ["Prix, délais, paiement en deux temps, confidentialité : les réponses aux questions les plus fréquentes sur la traduction assermentée.", "الأسعار والآجال والدفع على مرحلتين والسرية: أجوبة عن أكثر الأسئلة شيوعًا حول الترجمة المحلّفة.", "Prices, deadlines, two-step payment, confidentiality: answers to the most common questions about sworn translation.", "Prezzi, tempi, pagamento in due fasi, riservatezza: le risposte alle domande più frequenti sulla traduzione giurata."],
  "seo.articles.title": ["Articles & actualités", "مقالات وأخبار", "Articles & news", "Articoli e notizie"],
  "seo.articles.description": ["Actualités et articles du cabinet de Maître Makram Arfaoui, traducteur assermenté à Tunis.", "أخبار ومقالات مكتب الأستاذ مكرم العرفاوي، المترجم المحلّف بتونس.", "News and articles from the firm of Maître Makram Arfaoui, sworn translator in Tunis.", "Notizie e articoli dello studio di Maître Makram Arfaoui, traduttore giurato a Tunisi."],
  "seo.contact.title": ["Contact", "اتصل بنا", "Contact", "Contatti"],
  "seo.contact.description": ["Téléphone, email et adresse du cabinet de Maître Makram Arfaoui à Tunis.", "الهاتف والبريد الإلكتروني وعنوان مكتب الأستاذ مكرم العرفاوي بتونس.", "Phone, email and address of the firm of Maître Makram Arfaoui in Tunis.", "Telefono, email e indirizzo dello studio di Maître Makram Arfaoui a Tunisi."],
  "seo.about.title": ["À propos", "من نحن", "About", "Chi siamo"],
  "seo.about.description": ["Maître Makram Arfaoui, traducteur et interprète assermenté près la Cour d'appel de Tunis.", "الأستاذ مكرم العرفاوي، مترجم وترجمان محلّف لدى محكمة الاستئناف بتونس.", "Maître Makram Arfaoui, sworn translator and interpreter at the Tunis Court of Appeal.", "Maître Makram Arfaoui, traduttore e interprete giurato presso la Corte d’appello di Tunisi."],
  "seo.register.title": ["Créer un compte", "إنشاء حساب", "Create an account", "Crea un account"],
  "seo.login.title": ["Connexion", "تسجيل الدخول", "Log in", "Accedi"],
  "seo.order.title": ["Commander une traduction", "طلب ترجمة", "Order a translation", "Ordina una traduzione"],
  "seo.home.description": ["Traducteur et interprète assermenté à Tunis. Traductions juridiques certifiées commandées et suivies en ligne : actes d'état civil, diplômes, contrats, documents judiciaires.", "مترجم وترجمان محلّف بتونس. ترجمات قانونية مصادق عليها تُطلب وتُتابع عبر الإنترنت: وثائق الحالة المدنية، الشهادات، العقود، الوثائق القضائية.", "Sworn translator and interpreter in Tunis. Certified legal translations ordered and tracked online: civil-status records, diplomas, contracts, court documents.", "Traduttore e interprete giurato a Tunisi. Traduzioni giuridiche certificate ordinate e seguite online: atti di stato civile, diplomi, contratti, documenti giudiziari."],

  // Libellés d'accessibilité
  "app.aria.mainNav": ["Navigation principale", "التنقل الرئيسي", "Main navigation", "Navigazione principale"],
  "app.aria.mobileNav": ["Navigation mobile", "التنقل على الهاتف", "Mobile navigation", "Navigazione mobile"],
  "app.aria.prevReview": ["Avis précédent", "الرأي السابق", "Previous review", "Recensione precedente"],
  "app.aria.nextReview": ["Avis suivant", "الرأي التالي", "Next review", "Recensione successiva"],
};

const LOCALE_INDEX: Record<Locale, number> = { fr: 0, ar: 1, en: 2, it: 3 };

export function getAppDictionary(locale: Locale): Record<string, string> {
  const index = LOCALE_INDEX[locale];
  return Object.fromEntries(Object.entries(ROWS).map(([key, row]) => [key, row[index]]));
}
