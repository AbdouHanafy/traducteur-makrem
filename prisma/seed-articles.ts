/**
 * Articles d'exemple (informatifs et généraux) — à remplacer ou modifier depuis /admin/articles.
 * Insérés une seule fois, seulement si la table est vide.
 */
export interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  translations: Record<"ar" | "en" | "it", { title: string; excerpt: string; body: string }>;
}

const BASE_ARTICLES: SeedArticle[] = [
  {
    slug: "qu-est-ce-qu-une-traduction-assermentee",
    title: "Qu’est-ce qu’une traduction assermentée ?",
    excerpt: "Une traduction assermentée est réalisée par un traducteur habilité, qui la certifie conforme à l’original. Voici quand elle est exigée.",
    body: "Une traduction assermentée (ou certifiée) est une traduction réalisée par un traducteur habilité à attester qu’elle est fidèle au document d’origine. Elle porte son cachet et sa signature.\n\nElle est généralement demandée par les administrations, les tribunaux, les universités, les consulats et les notaires, lorsqu’un document officiel doit être présenté dans une autre langue.\n\nActes d’état civil, diplômes, jugements, contrats, relevés de notes ou casiers judiciaires sont des exemples courants. Avant de commander, vérifiez toujours auprès de l’organisme destinataire s’il exige une traduction certifiée et sous quelle forme.",
    translations: {
      ar: {
        title: "ما هي الترجمة المحلّفة؟",
        excerpt: "الترجمة المحلّفة ينجزها مترجم مخوَّل يشهد بمطابقتها للأصل. إليكم الحالات التي تُطلب فيها.",
        body: "الترجمة المحلّفة (أو المصدّقة) هي ترجمة ينجزها مترجم مخوَّل يشهد بأنها مطابقة للوثيقة الأصلية، وتحمل ختمه وتوقيعه.\n\nتطلبها عادةً الإدارات والمحاكم والجامعات والقنصليات والموثّقون عندما يجب تقديم وثيقة رسمية بلغة أخرى.\n\nمن الأمثلة الشائعة: عقود الحالة المدنية والشهادات والأحكام القضائية والعقود وكشوف الأعداد وصحيفة السوابق العدلية. قبل الطلب، تأكدوا دائمًا لدى الجهة المعنية مما إذا كانت تشترط ترجمة مصدّقة وبأي شكل.",
      },
      en: {
        title: "What is a sworn translation?",
        excerpt: "A sworn translation is produced by an authorised translator who certifies it matches the original. Here is when it is required.",
        body: "A sworn (or certified) translation is carried out by an authorised translator who attests that it is faithful to the original document. It bears their stamp and signature.\n\nIt is usually requested by administrations, courts, universities, consulates and notaries whenever an official document must be presented in another language.\n\nCivil status records, diplomas, judgments, contracts, transcripts and criminal record extracts are common examples. Before ordering, always check with the receiving body whether it requires a certified translation and in what form.",
      },
      it: {
        title: "Che cos’è una traduzione giurata?",
        excerpt: "La traduzione giurata è eseguita da un traduttore abilitato che ne attesta la conformità all’originale. Ecco quando è richiesta.",
        body: "Una traduzione giurata (o certificata) è eseguita da un traduttore abilitato che attesta la sua fedeltà al documento originale. Reca il suo timbro e la sua firma.\n\nViene in genere richiesta da amministrazioni, tribunali, università, consolati e notai quando un documento ufficiale deve essere presentato in un’altra lingua.\n\nAtti di stato civile, diplomi, sentenze, contratti, certificati di voti e casellari giudiziali sono esempi comuni. Prima di ordinare, verifica sempre presso l’ente destinatario se richiede una traduzione certificata e in quale forma.",
      },
    },
  },
  {
    slug: "documents-a-fournir-pour-une-traduction-certifiee",
    title: "Documents à fournir pour une traduction certifiée",
    excerpt: "Une bonne préparation fait gagner du temps : voici comment fournir un document lisible et complet.",
    body: "Pour obtenir une traduction fiable dans les meilleurs délais, fournissez un document complet, net et lisible.\n\nUn scan en couleur ou une photo bien cadrée suffit, à condition que tous les tampons, mentions manuscrites et signatures soient visibles. Pensez à envoyer le recto et le verso lorsque les deux comportent du texte.\n\nIndiquez le pays de destination, l’organisme qui recevra la traduction et l’usage prévu : ces informations permettent d’adapter la présentation et de vérifier les exigences de légalisation ou d’apostille.\n\nEnfin, vérifiez l’orthographe des noms propres, surtout s’ils s’écrivent différemment selon les langues.",
    translations: {
      ar: {
        title: "الوثائق المطلوبة لترجمة مصدّقة",
        excerpt: "التحضير الجيد يوفّر الوقت: إليكم كيفية تقديم وثيقة واضحة وكاملة.",
        body: "للحصول على ترجمة موثوقة في أقرب الآجال، قدّموا وثيقة كاملة وواضحة ومقروءة.\n\nيكفي مسح ضوئي ملوّن أو صورة جيدة الإطار، بشرط أن تكون جميع الأختام والملاحظات المكتوبة بخط اليد والتوقيعات ظاهرة. لا تنسوا إرسال الوجه والظهر إذا كان كلاهما يحتوي على نص.\n\nحدّدوا البلد المقصود والجهة التي ستتسلم الترجمة والغرض منها، فهذه المعلومات تتيح تكييف الصياغة والتحقق من شروط التصديق أو الأبوستيل.\n\nوأخيرًا، تحققوا من كتابة الأسماء الشخصية، خاصة إذا كانت تُكتب بشكل مختلف بين اللغات.",
      },
      en: {
        title: "Documents to provide for a certified translation",
        excerpt: "Good preparation saves time: here is how to supply a clear and complete document.",
        body: "To get a reliable translation as quickly as possible, provide a complete, sharp and legible document.\n\nA colour scan or a well-framed photo is enough, as long as every stamp, handwritten note and signature is visible. Remember to send both sides when both carry text.\n\nState the destination country, the body that will receive the translation and the intended use: this lets us adapt the layout and check any legalisation or apostille requirements.\n\nFinally, double-check the spelling of proper names, especially when they are written differently from one language to another.",
      },
      it: {
        title: "Documenti da fornire per una traduzione certificata",
        excerpt: "Una buona preparazione fa risparmiare tempo: ecco come fornire un documento chiaro e completo.",
        body: "Per ottenere una traduzione affidabile nei tempi più brevi, fornisci un documento completo, nitido e leggibile.\n\nBasta una scansione a colori o una foto ben inquadrata, purché tutti i timbri, le note manoscritte e le firme siano visibili. Ricorda di inviare fronte e retro quando entrambi contengono testo.\n\nIndica il paese di destinazione, l’ente che riceverà la traduzione e l’uso previsto: queste informazioni permettono di adattare l’impaginazione e di verificare eventuali requisiti di legalizzazione o apostille.\n\nInfine, controlla l’ortografia dei nomi propri, soprattutto se si scrivono in modo diverso da una lingua all’altra.",
      },
    },
  },
  {
    slug: "legalisation-et-apostille-comprendre-la-difference",
    title: "Légalisation et apostille : quelle différence ?",
    excerpt: "Deux formalités souvent confondues. Un repère simple pour savoir laquelle concerne votre document.",
    body: "La légalisation et l’apostille servent toutes deux à faire reconnaître l’authenticité d’un document public à l’étranger, mais elles ne s’appliquent pas de la même manière.\n\nL’apostille est une formalité simplifiée prévue par la Convention de La Haye : elle s’applique entre les pays qui en sont signataires. La légalisation, plus longue, concerne les échanges avec les pays qui n’ont pas adhéré à cette convention.\n\nLes règles varient selon le pays de départ, le pays de destination et le type de document. Renseignez-vous auprès de l’autorité destinataire avant de lancer vos démarches, afin d’éviter des allers-retours inutiles.",
    translations: {
      ar: {
        title: "التصديق والأبوستيل: ما الفرق؟",
        excerpt: "إجراءان يُخلط بينهما كثيرًا. مرجع بسيط لمعرفة أيهما يخص وثيقتكم.",
        body: "يُستخدم التصديق والأبوستيل كلاهما للاعتراف بصحة وثيقة رسمية في الخارج، لكنهما لا يُطبَّقان بالطريقة نفسها.\n\nالأبوستيل إجراء مبسّط تنص عليه اتفاقية لاهاي ويُطبَّق بين الدول الموقّعة عليها. أما التصديق فهو أطول ويخص التعامل مع الدول التي لم تنضم إلى هذه الاتفاقية.\n\nتختلف القواعد حسب بلد المنشأ وبلد الوجهة ونوع الوثيقة. استفسروا لدى الجهة المستقبِلة قبل بدء الإجراءات لتفادي التنقلات غير الضرورية.",
      },
      en: {
        title: "Legalisation and apostille: what is the difference?",
        excerpt: "Two formalities that are often confused. A simple guide to which one applies to your document.",
        body: "Legalisation and apostille both serve to have the authenticity of a public document recognised abroad, but they do not apply in the same way.\n\nThe apostille is a simplified formality under the Hague Convention and applies between countries that have signed it. Legalisation, which takes longer, concerns exchanges with countries that have not joined the convention.\n\nRules vary depending on the country of origin, the country of destination and the type of document. Check with the receiving authority before starting, to avoid unnecessary back-and-forth.",
      },
      it: {
        title: "Legalizzazione e apostille: qual è la differenza?",
        excerpt: "Due formalità spesso confuse. Una guida semplice per capire quale riguarda il tuo documento.",
        body: "La legalizzazione e l’apostille servono entrambe a far riconoscere all’estero l’autenticità di un documento pubblico, ma non si applicano allo stesso modo.\n\nL’apostille è una formalità semplificata prevista dalla Convenzione dell’Aia e si applica tra i paesi firmatari. La legalizzazione, più lunga, riguarda gli scambi con i paesi che non hanno aderito alla convenzione.\n\nLe regole variano in base al paese di partenza, al paese di destinazione e al tipo di documento. Informati presso l’autorità destinataria prima di avviare le pratiche, per evitare spostamenti inutili.",
      },
    },
  },
];

import { EXTRA_ARTICLES } from "./seed-articles-extra";

export const SEED_ARTICLES: SeedArticle[] = [...BASE_ARTICLES, ...EXTRA_ARTICLES];
