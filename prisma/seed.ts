// Krea — Seed script
// Run with: bun run prisma/seed.ts
// (or: bun run db:seed)
//
// Creates realistic French data for the Krea marketplace: 1 admin,
// 6 creators with ebooks + chapters (real prose), 10 buyers, ~40 orders,
// ~25 reviews, payouts, coupons, and platform stats.

import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth-crypto";
import { slugify, genRef } from "../src/lib/format";

type Plan = "FREE" | "PRO" | "PREMIUM";
const planCommission: Record<Plan, number> = { FREE: 25, PRO: 15, PREMIUM: 10 };

const COVER_PALETTE = ["#1F4A2E", "#5DBE8A", "#C8553D", "#697E6E", "#FFD86B"];

// ───────────────────────── Creators ─────────────────────────────────
interface CreatorSeed {
  name: string;
  email: string;
  country: string;
  phone: string;
  bio: string;
  plan: Plan;
  verified: boolean;
  walletBalance: number;
  tagline?: string;
  bannerColor?: string;
  // ── Creator site ──
  siteName?: string;
  siteEnabled?: boolean;
  siteThemePreset?: string; // foret | ocean | terre | nuit | soleil | minimal
  siteFontPreset?: string;  // merienda | playfair | poppins | serif
  siteLayout?: string;      // magazine | boutique | editorial
  siteHero?: string;
  siteHeroSub?: string;
  siteFooterText?: string;
  siteSocial?: string; // JSON string
}

const CREATORS: CreatorSeed[] = [
  {
    name: "Aïcha Diallo",
    email: "aicha@krea.africa",
    country: "SN",
    phone: "+221 77 123 45 67",
    bio: "Coach en entrepreneuriat féminin à Dakar. Auteur de 3 guides pratiques pour les femmes qui entreprennent en Afrique de l'Ouest.",
    tagline: "L'entrepreneuriat féminin, sans excuses.",
    bannerColor: "#8B3A2F",
    plan: "PRO",
    verified: true,
    walletBalance: 184500,
    siteName: "Aïcha Diallo",
    siteEnabled: true,
    siteThemePreset: "terre",
    siteFontPreset: "playfair",
    siteLayout: "boutique",
    siteHero: "Transformez votre ambition en entreprise rentable",
    siteHeroSub: "Des guides pratiques pour les femmes qui entreprennent en Afrique. Sans jargon, sans bla-bla — que de l'action.",
    siteFooterText: "© 2025 Aïcha Diallo · Dakar, Sénégal",
    siteSocial: JSON.stringify({ instagram: "@aicha.diallo", whatsapp: "+221771234567", email: "contact@aicha-diallo.com" }),
  },
  {
    name: "Christian Okafor",
    email: "christian@krea.africa",
    country: "NG",
    phone: "+234 803 111 2222",
    bio: "Pasteur et auteur chrétien de Lagos. Mes livres accompagnent les croyants dans la prière, la foi et la vie de couple.",
    tagline: "Marcher par la foi, pas par la vue.",
    bannerColor: "#1A1A2E",
    plan: "PREMIUM",
    verified: true,
    walletBalance: 342000,
    siteName: "Christian Okafor Ministries",
    siteEnabled: true,
    siteThemePreset: "nuit",
    siteFontPreset: "serif",
    siteLayout: "editorial",
    siteHero: "Nourrissez votre foi, une page à la fois",
    siteHeroSub: "Des livres de prière, de méditation et de couple pour grandir spirituellement chaque jour.",
    siteFooterText: "© 2025 Christian Okafor Ministries · Lagos, Nigeria",
    siteSocial: JSON.stringify({ facebook: "ChristianOkaforMin", youtube: "@cofm", email: "hello@cofm.org" }),
  },
  {
    name: "Mariam Touré",
    email: "mariam@krea.africa",
    country: "CI",
    phone: "+225 07 88 99 00",
    bio: "Chef cuisinière à Abidjan. Je partage les recettes traditionnelles ivoiriennes et africaines modernisées pour la famille.",
    tagline: "La cuisine africaine, modernisée.",
    bannerColor: "#C9482B",
    plan: "PRO",
    verified: true,
    walletBalance: 96500,
    siteName: "Cuisine avec Mariam",
    siteEnabled: true,
    siteThemePreset: "soleil",
    siteFontPreset: "poppins",
    siteLayout: "magazine",
    siteHero: "Les saveurs de l'Afrique dans votre cuisine",
    siteHeroSub: "Recettes traditionnelles et modernes, testées et approuvées pour toute la famille.",
    siteFooterText: "© 2025 Cuisine avec Mariam · Abidjan, Côte d'Ivoire",
    siteSocial: JSON.stringify({ instagram: "@cuisine.avec.mariam", tiktok: "@mariam.cuisine", email: "contact@cuisine-mariam.com" }),
  },
  {
    name: "Junior Mbarga",
    email: "junior@krea.africa",
    country: "CM",
    phone: "+237 6 99 11 22 33",
    bio: "Développeur full-stack et formateur à Douala. J'enseigne le web, le mobile et le freelance aux jeunes camerounais.",
    tagline: "Code, freelance, liberté.",
    bannerColor: "#0F4C5C",
    plan: "PREMIUM",
    verified: true,
    walletBalance: 378000,
    siteName: "Junior Mbarga",
    siteEnabled: true,
    siteThemePreset: "ocean",
    siteFontPreset: "poppins",
    siteLayout: "magazine",
    siteHero: "Apprends à coder. Deviens freelance. Sois libre.",
    siteHeroSub: "Des ebooks concrets pour les jeunes Africains qui veulent vivre du code — sans passer 4 ans en école.",
    siteFooterText: "© 2025 Junior Mbarga · Douala, Cameroun",
    siteSocial: JSON.stringify({ twitter: "@junior_mbarga", linkedin: "junior-mbarga", youtube: "@juniorcodes", email: "hello@junior-mbarga.dev" }),
  },
  {
    name: "Fatou Bensouda",
    email: "fatou@krea.africa",
    country: "CM",
    phone: "+237 6 77 44 55 66",
    bio: "Romancière et nouvelliste de Yaoundé. Mes récits explorent l'amour, la famille et la mémoire africaine contemporaine.",
    plan: "FREE",
    verified: false,
    walletBalance: 15200,
  },
  {
    name: "Ibrahima Sarr",
    email: "ibrahima@krea.africa",
    country: "SN",
    phone: "+221 70 222 33 44",
    bio: "Consultant en développement personnel et mindset. J'aide les jeunes Africains à construire une discipline de fer.",
    tagline: "La discipline change tout.",
    bannerColor: "#1F4A2E",
    plan: "PRO",
    verified: true,
    walletBalance: 87300,
    siteName: "Discipline de Fer",
    siteEnabled: true,
    siteThemePreset: "foret",
    siteFontPreset: "merienda",
    siteLayout: "editorial",
    siteHero: "Construisez une discipline de fer",
    siteHeroSub: "Le mindset et les méthodes pour transformer vos ambitions en réalités — une journée à la fois.",
    siteFooterText: "© 2025 Discipline de Fer · Dakar, Sénégal",
    siteSocial: JSON.stringify({ twitter: "@ibra_sarr", instagram: "@disciplinedefer", whatsapp: "+221702223344" }),
  },
];

// ───────────────────────── Ebooks ──────────────────────────────────
interface ChapterSeed {
  title: string;
  content: string;
}
interface EbookSeed {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  coverColor: string;
  coverUrl?: string;
  featured?: boolean;
  isBestseller?: boolean;
  deviceLimit: number;
  chapters: ChapterSeed[];
}

const EBOOKS: Record<string, EbookSeed[]> = {
  // Aïcha Diallo — Business
  "Aïcha Diallo": [
    {
      title: "Entreprendre au Féminin en Afrique",
      subtitle: "Du premier capital au premier million de FCFA",
      description:
        "Un guide complet pour les femmes africaines qui veulent lancer une activité rentable sans abandonner leur famille. Mobile Money, réseaux sociaux, financement, gestion du temps : tout est décortiqué avec des exemples concrets tirés du terrain dakarois.",
      category: "Business",
      price: 7500,
      compareAtPrice: 12000,
      coverColor: "#C8553D",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/d8ac1f43e9ba.png",
      featured: true,
      isBestseller: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Le mindset de l'entrepreneure africaine",
          content:
            "## Oser, malgré tout\n\nDans nos familles, on nous dit souvent qu'une femme doit d'abord penser au foyer. C'est vrai — mais **penser au foyer ne veut pas dire renoncer à ses rêves**. Entreprendre au féminin en Afrique, c'est apprendre à porter deux mondes en même temps : celui de la maison et celui du marché.\n\n### Les 3 freins à déconstruire\n\n1. **La peur du jugement** — Votre entourage ne comprendra pas toujours. Tant mieux. Cela veut dire que vous sortez du cadre.\n2. **Le syndrome de l'impostrice** — Vous n'avez pas besoin d'un MBA pour vendre un bon attiéké ou un service de conseil. Vous avez besoin d'un client.\n3. **La culpabilité** — Une mère qui travaille n'abandonne pas ses enfants. Elle leur offre un modèle.\n\n> « L'argent que tu gagnes toi-même est le seul qui ne te trahira jamais. »\n\n### Exercice\n\nPrenez une feuille. Écrivez la phrase : *« Je mérite de gagner ma vie en faisant ce que j'aime. »* Lisez-la à voix haute, chaque matin, pendant 21 jours. Vous serez surprise de la transformation.",
        },
        {
          title: "Trouver une idée qui se vend",
          content:
            "## L'idée ne tombe pas du ciel\n\nBeaucoup de femmes attendent « l'idée du siècle ». C'est une erreur. Les meilleures idées viennent d'un **constat simple** : quelque chose vous agace, vous semble mal fait, trop cher, ou inaccessible.\n\n### Méthode des 3 cercles\n\nDessinez trois cercles qui se croisent :\n\n- Ce que vous savez faire (compétence)\n- Ce que les gens autour de vous réclament (marché)\n- Ce qui peut être payé en Mobile Money dès aujourd'hui (exécutable)\n\nÀ l'intersection se trouve votre **première offre**.\n\n### Exemples réels\n\n- **Awa, Dakar** : elle notait que ses collègues n'avaient pas le temps de cuisiner le soir. Elle a lancé un service de plats à emporter livrés par WhatsApp. Aujourd'hui : 80 clients/jour.\n- **Nafi, Thiès** : elle cousait pour ses enfants. On lui a demandé de coudre pour d'autres. Elle a fait 350 000 F de chiffre d'affaires en 3 mois.\n\n> Ne cherchez pas l'idée. Cherchez la **douleur** que vous pouvez soulager.",
        },
        {
          title: "Le Mobile Money, votre première banque",
          content:
            "## Recevoir, envoyer, épargner — sans compte bancaire\n\nLe Mobile Money (Orange Money, Wave, MTN MoMo) a changé la donne pour les entrepreneures africaines. En quelques minutes, vous pouvez :\n\n- Recevoir un paiement d'un client à 22h\n- Payer un fournisseur à 6h du matin\n- Mettre de côté 1 000 F par jour sans y penser\n\n### Les bons réflexes\n\n1. **Ayez deux numéros** : un pour la maison, un pour l'activité. Cela change tout psychologiquement.\n2. **Épargnez dès la réception** — Dès qu'un paiement entre, transférez 10 % vers un compte « épargne » que vous ne touchez pas.\n3. **Gardez un historique** — Screenshots, carnets, exports. Quand vous demanderez un crédit, ces preuves vaudront de l'or.\n\n### Le piège\n\nLe Mobile Money donne l'illusion de l'argent facile. **Ne dépensez pas ce que vous n'avez pas converti en revenu.** Une recharge de 5 000 F le soir n'est pas un salaire.",
        },
        {
          title: "Vendre sur WhatsApp",
          content:
            "## Votre catalogue tient dans une discussion\n\nWhatsApp n'est pas qu'une messagerie. C'est votre **boutique**, votre **SAV** et votre **réseau commercial** réunis.\n\n### Structure d'un profil vendeur\n\n- **Photo** : votre logo ou un de vos produits (pas votre selfie)\n- **Statut** : précis — *« Livraison attiéké-poisson à Dakar, commande avant 11h »*\n- **Catalogue** : photos nettes, prix en FCFA, délai de livraison\n\n### Les 5 messages qui vendent\n\n1. Le message d'accueil (automatisé mais humain)\n2. La preuve sociale (photo d'un client heureux)\n3. L'offre limitée (ce soir seulement)\n4. Le suivi de commande\n5. Le remerciement + demande d'avis\n\n> Une cliente qui reçoit un message perso après sa commande a 4 fois plus de chances de racheter. **Le SAV, c'est du marketing.**",
        },
        {
          title: "Financer sa croissance",
          content:
            "## Quand demander de l'argent — et à qui\n\nLe financement n'est pas une urgence, c'est un **levier**. On ne lève des fonds que lorsqu'on a déjà prouvé qu'on sait gagner de l'argent sans.\n\n### Les 4 sources en Afrique de l'Ouest\n\n1. **La famille** — la moins chère, la plus dangereuse. Mettez tout par écrit.\n2. **Le tontine** — idéal pour les premières machines. Tournez-vous entre 5 et 10 femmes de confiance.\n3. **Le microcrédit** (PAMECAS, ACEP) — taux élevé mais accessible.\n4. **Les programmes d'accompagnement** (Tony Elumelu, Janngo, Awore) — ils apportent argent + réseau + formation.\n\n### La règle d'or\n\nN'empruntez jamais pour **consommer**. Empruntez uniquement pour **acheter quelque chose qui produira plus que le coût du crédit**.\n\n> Une machine à coudre à 250 000 F qui vous permet de livrer 50 commandes/mois supplémentaires est un investissement. Un téléphone neuf à 350 000 F pour « voir les messages plus vite » n'en est pas un.",
        },
      ],
    },
    {
      title: "Les Clés du Marketing WhatsApp",
      subtitle: "Transformer une discussion en vente",
      description:
        "WhatsApp est devenu le canal n°1 de vente en Afrique. Ce livre décode les techniques des vendeurs qui en font un véritable système commercial : catalogue, statuts, sondages, groupes, automatisations.",
      category: "Business",
      price: 5000,
      coverColor: "#5DBE8A",
      deviceLimit: 3,
      chapters: [
        {
          title: "Pourquoi WhatsApp gagne",
          content:
            "## Le canal le plus intime\n\nEn Afrique, WhatsApp n'est pas une option, c'est **l'outil de base**. Tout le monde l'a. Tout le monde l'ouvre. Le client potentiel passe en moyenne **3 heures par jour** dans l'application.\n\n### Les chiffres qui comptent\n\n- 90 % des messages WhatsApp sont lus dans les 5 minutes\n- Le taux de réponse est 5x supérieur à l'email\n- Un client WhatsApp convertit 2x plus qu'un client Instagram\n\n> Votre client n'est pas sur votre site web. Il est sur WhatsApp. À vous d'aller le chercher là où il se trouve.",
        },
        {
          title: "Construire son catalogue",
          content:
            "## Une vitrine dans la poche\n\nLe catalogue WhatsApp Business n'est pas optionnel. C'est votre **vitrine permanente**. Un client qui arrive à 2h du matin doit pouvoir voir vos produits, leurs prix et passer commande.\n\n### Les règles du catalogue qui vend\n\n1. **Photo** : fond neutre, lumière naturelle, un seul produit par image\n2. **Titre** : clair et court — *« Robe wax taille M »* plutôt que *« Belle robe »*\n3. **Prix** : toujours en FCFA, jamais « contacter pour prix »\n4. **Description** : matière, taille, délai, zone de livraison\n\n> Un catalogue bien rempli peut générer 30 % de vos ventes pendant que vous dormez.",
        },
        {
          title: "Les statuts, votre réseau d'influence",
          content:
            "## Le statut n'est pas une story\n\nBeaucoup confondent statut WhatsApp et story Instagram. C'est une erreur. Le statut WhatsApp est **plus personnel**, **plus regardé** et **plus puissant** pour vendre.\n\n### Types de statuts qui fonctionnent\n\n- **Coulisses** : montrer comment vous emballez, cuisinez, cousez\n- **Preuve sociale** : captures de messages de clients satisfaits\n- **Offre flash** : « Aujourd'hui seulement »\n- **Sondage** : faites participer votre audience\n- **Tutoriel** : apprenez quelque chose en 30 secondes\n\n### Fréquence idéale\n\n3 à 5 statuts par jour. Pas plus. Vous voulez rester présent sans saturer.\n\n> Les statuts les plus regardés ne sont pas les plus beaux. Ce sont les plus **vrais**.",
        },
        {
          title: "Les groupes, un double tranchant",
          content:
            "## Vendre en groupe sans être insupportable\n\nUn groupe WhatsApp peut être une mine d'or ou un enfer. Tout dépend de la **discipline** que vous imposez.\n\n### Les 5 règles du groupe sain\n\n1. **Un thème** : un groupe = un sujet (ex : « Promos Robes Wax »)\n2. **Horaires** : pas de messages après 21h ni avant 7h\n3. **Pas de spam** : 2 messages par jour max du vendeur\n4. **Modération** : retirez les hors-sujet sans négocier\n5. **Valeur avant vente** : 1 message de valeur pour 1 message de vente\n\n> Un groupe de 200 membres disciplinés vaut mieux que 5 groupes de 1000 où personne ne lit.",
        },
      ],
    },
    {
      title: "Gérer son Argent au Quotidien",
      subtitle: "Budget, épargne et investissement pour la famille africaine",
      description:
        "Un manuel de finance personnelle pensé pour les réalités africaines : tontines, soutien familial, dépenses imprévues, fêtes et cérémonies. Sans jargon, sans culpabiliser.",
      category: "DevPerso",
      price: 4500,
      compareAtPrice: 7000,
      coverColor: "#697E6E",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/095bb4e33381.jpg",
      deviceLimit: 3,
      chapters: [
        {
          title: "Comprendre où va votre argent",
          content:
            "## Le trou noir du budget\n\nLa plupart des familles africaines ne savent pas où passe 40 % de leur argent. Ce n'est pas parce qu'elles dépensent mal. C'est parce qu'elles **ne mesurent pas**.\n\n### La règle des 3 bacs\n\nÀ la fin du mois, divisez vos revenus en 3 bacs :\n\n1. **Bac Survie** (50 %) — loyer, nourriture, transport, scolarité\n2. **Bac Futur** (30 %) — épargne, investissement, formation\n3. **Bac Plaisir** (20 %) — fêtes, sorties, petits luxes\n\n### Le carnet de bord\n\nPendant 30 jours, notez **chaque dépense**, même 100 F. Vous découvrirez des fuites invisibles : les taxis en plus, les crédits d'appel, les cadeaux de dernière minute.\n\n> Ce que l'on mesure s'améliore. Ce que l'on ignore s'aggrave.",
        },
        {
          title: "La tontine, outil de richesse",
          content:
            "## Plus puissante que la banque\n\nLa tontine existe depuis des siècles en Afrique. Bien utilisée, elle peut vous faire passer d'un salaire instable à un véritable capital.\n\n### Les 3 formes de tontine\n\n1. **Tontine de consommation** — tour mensuel, on partage la cagnotte\n2. **Tontine d'épargne** — on ne touche pas l'argent, on le met en commun pour un projet\n3. **Tontine d'investissement** — l'argent est prêté à un membre pour lancer un business, avec remboursement et intérêts\n\n### Règle d'or\n\nNe participez qu'à une tontine dont vous **connaissez personnellement tous les membres**. Et ne prenez jamais le tour en premier si vous n'avez pas un plan pour rembourser.\n\n> La tontine a fait sortir plus d'Africains de la pauvreté que toutes les banques réunies.",
        },
        {
          title: "Le soutien familial, sans se ruiner",
          content:
            "## Dire non, sans trahir\n\nEn Afrique, on ne dit pas « non » à la famille. Mais on peut dire **« pas maintenant »** ou **« pas cette somme »**.\n\n### La règle du pourcentage\n\nFixez un **plafond mensuel** de soutien familial : 10 % de vos revenus maximum. Au-delà, c'est votre avenir que vous sacrifiez.\n\n### Les 4 phrases magiques\n\n1. *« Je veux t'aider, mais ce mois-ci je peux donner X. »*\n2. *« Je ne peux pas en argent, mais je peux en temps. »*\n3. *« Donnons ensemble avec les frères et sœurs. »*\n4. *« Je t'aide une fois. Pour la suite, trouvons une solution durable. »*\n\n> Aider sa famille ne doit pas vous empêcher de construire la vôtre.",
        },
        {
          title: "Investir son premier million",
          content:
            "## Au-delà de l'épargne\n\nQuand vous avez réussi à mettre côté 1 000 000 F, la question change. Il ne s'agit plus de *garder*, mais de *faire fructifier*.\n\n### Les 4 voies accessibles\n\n1. **L'immobilier locatif** — un studio loué rapporte 50 à 80 000 F/mois\n2. **Le commerce en gros** — acheter à Côte d'Ivoire, revendre au Mali\n3. **L'agriculture moderne** — un hectare d'arachide peut rapporter 800 000 F/saison\n4. **Les obligations du Trésor** — sûres, 5 à 7 % par an, accessible dès 100 000 F\n\n### Le piège\n\nNe mettez jamais 100 % de votre capital dans un seul projet. La règle : **70 % sûr, 20 % moyen, 10 % risqué**.\n\n> Le premier million est le plus dur. Le deuxième est plus facile — parce que vous avez appris.",
        },
      ],
    },
  ],

  // Christian Okafor — Spiritual
  "Christian Okafor": [
    {
      title: "Prier dans la Foi",
      subtitle: "30 jours pour retrouver le dialogue avec Dieu",
      description:
        "Un guide spirituel pour celles et ceux qui sentent leur prière devenue routinière. 30 méditations quotidiennes, des Écritures, des prières et des témoignages vécus pour raviver la flamme de la foi.",
      category: "Spiritual",
      price: 6000,
      compareAtPrice: 9000,
      coverColor: "#1F4A2E",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/fc3df01ac58a.jpg",
      featured: true,
      isBestseller: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Jour 1 — Revenir à Dieu",
          content:
            "## Le premier pas du retour\n\nIl n'y a pas de distance que Dieu ne puisse traverser. Il n'y a pas de silence qu'il ne puisse briser. Mais il attend **votre premier pas**.\n\n### La prière du retour\n\n*« Seigneur, je reviens. Non pas parce que je le mérite, mais parce que ta miséricorde m'appelle. Lave-moi, restaure-moi, conduis-moi. Au nom de Jésus. Amen. »*\n\n### Lecture du jour\n\n> « Revenez à moi, et je reviendrai à vous, dit l'Éternel des armées. » — Malachie 3:7\n\n### Action\n\nPrenez 10 minutes aujourd'hui. Asseyez-vous dans le silence. Dites simplement : *« Me voici. »* Et écoutez.",
        },
        {
          title: "Jour 7 — Prier avec les Écritures",
          content:
            "## La Bible n'est pas un livre, c'est un dialogue\n\nQuand vous lisez la Parole, vous n'êtes pas seul. **L'Esprit parle à travers le texte.** Chaque verset peut devenir une prière vivante.\n\n### Méthode LECTIO\n\n1. **Lectio** — lisez lentement un passage court\n2. **Meditatio** — méditez un mot qui ressort\n3. **Oratio** — parlez à Dieu à partir de ce mot\n4. **Contemplatio** — restez en silence, accueillez\n\n### Exemple\n\nPsaume 23 : *« L'Éternel est mon berger. »*\n\n- *Lectio* : lire trois fois\n- *Meditatio* : le mot « berger »\n- *Oratio* : *« Seigneur, sois mon berger aujourd'hui. Conduis-moi. »*\n- *Contemplatio* : 5 minutes de silence\n\n> La Parole n'est pas une information. C'est une **nourriture**. Mangez-la lentement.",
        },
        {
          title: "Jour 14 — Prier dans la nuit",
          content:
            "## Quand Dieu semble silencieux\n\nIl y a des nuits où la prière semble cogner contre un plafond de plomb. Vous priez, vous pleurez, vous attendez. Et rien. **Rien.**\n\n### Le silence n'est pas l'absence\n\nDieu se tait parfois. Mais il n'est jamais absent. Le silence est une **école**. Il vous apprend à croire sans voir, à aimer sans comprendre.\n\n### Les 3 anges du silence\n\n1. **L'ange de la purification** — il brûle ce qui n'est pas de Dieu en vous\n2. **L'ange de la patience** — il vous apprend à attendre le moment de Dieu\n3. **L'ange de la foi pure** — il vous donne de croire quand il n'y a plus de preuves\n\n> « Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? » — Jésus lui-même a crié cela. Et le Père n'a pas répondu. Mais le dimanche est venu.",
        },
        {
          title: "Jour 21 — Prier en langues",
          content:
            "## Le langage de l'Esprit\n\nLa prière en langues est un don. Mais elle est aussi une **discipline**. On la reçoit. On la cultive. On l'entretient.\n\n### Comment la recevoir\n\n1. Demandez-la simplement — *« Esprit Saint, prie en moi. »*\n2. Ouvrez la bouche — Dieu ne forcera pas vos lèvres\n3. Laissez sortir les premiers sons, même s'ils vous semblent étranges\n4. Persévérez — 5 minutes par jour pendant 21 jours\n\n### Les bienfaits\n\n- Votre esprit prie quand votre intelligence ne sait plus quoi dire\n- Vous édifiez votre foi intérieure\n- Vous brisez les blocages spirituels\n\n> « Celui qui parle en langues s'édifie lui-même. » — 1 Corinthiens 14:4",
        },
        {
          title: "Jour 30 — Vivre en prière",
          content:
            "## La prière n'est plus un moment, c'est une vie\n\nAprès 30 jours, vous n'avez pas fini. Vous **commencez**. La prière n'est plus une activité parmi d'autres. Elle devient la **respiration** de vos journées.\n\n### Les 7 piliers d'une vie de prière\n\n1. **Le matin** — offrir la journée avant de la vivre\n2. **Le midi** — remercier pour ce qui est déjà venu\n3. **Le soir** — passer la journée en revue avec Dieu\n4. **Les repas** — bénir ce qui nourrit\n5. **Les décisions** — consulter avant d'agir\n6. **Les tentations** — crier avant de tomber\n7. **Les joies** — chanter avant de dormir\n\n> Une vie de prière n'est pas une vie sans problèmes. C'est une vie où **Dieu marche avec vous** à travers les problèmes.\n\n### La bénédiction finale\n\n*« Que le Seigneur te bénisse et te garde. Qu'il fasse luire son visage sur toi. Qu'il te donne la paix. Au nom du Père, du Fils et du Saint-Esprit. Amen. »*",
        },
      ],
    },
    {
      title: "Le Mariage Chrétien en Afrique",
      subtitle: "Construire un foyer qui résiste",
      description:
        "Un livre franc sur les défis du mariage chrétien en Afrique moderne : beaux-parents, finances du couple, intimité, spiritualité commune. Pour les jeunes couples et ceux qui les accompagnent.",
      category: "Spiritual",
      price: 8000,
      compareAtPrice: 11000,
      coverColor: "#5DBE8A",
      deviceLimit: 3,
      chapters: [
        {
          title: "Quitter, attacher, devenir une chair",
          content:
            "## Les 3 mouvements bibliques\n\nGenèse 2:24 pose le principe : *« C'est pourquoi l'homme quittera son père et sa mère, et s'attachera à sa femme, et ils deviendront une seule chair. »*\n\nTrois verbes. Trois mouvements. Trois conditions pour que le mariage tienne.\n\n### 1. Quitter\n\nQuitter ne veut pas dire abandonner. Cela veut dire **redéfinir la priorité**. Votre conjoint devient votre première famille humaine. Avant vos parents.\n\n### 2. S'attacher\n\nS'attacher, c'est construire délibérément une **alliance**. Pas seulement un sentiment. Une décision renouvelée chaque jour.\n\n### 3. Devenir une chair\n\nL'intimité sexuelle, mais aussi : **projets communs, comptes communs, visions communes.** On ne devient une chair qu'en se livrant l'un à l'autre sans réserve.\n\n> Beaucoup de mariages africains échouent non par manque d'amour, mais parce que le « quitter » n'a jamais été fait.",
        },
        {
          title: "Les beaux-parents, alliés ou ennemis ?",
          content:
            "## Le défi le plus tabou\n\nEn Afrique, la belle-mère n'est pas un personnage secondaire. Elle peut être la **pieuvre** qui étouffe un foyer, ou la **colonne** qui le soutient. Tout dépend de comment on la positionne.\n\n### Les 3 limites à poser\n\n1. **La limite géographique** — ne pas vivre dans la concession familiale les 2 premières années\n2. **La limite financière** — pas de transfert d'argent aux parents sans accord du conjoint\n3. **La limite de l'intimité** — les problèmes du couple ne sortent pas du couple\n\n### Honorer sans obéir\n\nLa Bible dit d'honorer ses parents. Elle ne dit pas de leur obéir toute la vie. À partir du mariage, votre **obéissance** est due à Dieu et à votre conjoint.\n\n> Honorer ses parents, c'est les respecter. Ce n'est pas leur laisser diriger votre mariage.",
        },
        {
          title: "L'argent dans le couple",
          content:
            "## Le sujet le plus explosif\n\n80 % des disputes conjugales en Afrique portent sur l'argent. Pas parce qu'il manque. Mais parce qu'il n'est **jamais parlé**.\n\n### Les 3 comptes\n\n1. **Compte maison** — loyer, courses, électricité (50/50 ou selon revenus)\n2. **Compte projets** — épargne pour la construction, la voiture, les études\n3. **Compte personnel** — ce que chacun garde pour ses besoins privés\n\n### La transparence absolue\n\n- Pas de compte caché\n- Pas de crédit familial sans accord écrit\n- Pas de don aux parents sans consultation\n\n> L'argent n'est pas tabou dans un mariage chrétien. C'est un **outil de couple**. Si vous ne pouvez pas en parler, vous ne pouvez pas le gérer.",
        },
        {
          title: "L'intimité sexuelle",
          content:
            "## Le don de Dieu, le silence de l'Église\n\nL'Église africaine parle peu de sexualité. Et quand elle le fait, c'est pour lister les interdits. Mais la Bible est **luxuriante** sur le sujet. Le Cantique des Cantiques est un poème érotique béni par Dieu.\n\n### Les 4 piliers de l'intimité chrétienne\n\n1. **La disponibilité** — *« Ne vous privez point l'un de l'autre »* (1 Cor 7:5)\n2. **La tendresse** — pas de violence, pas de mépris, pas de chantage\n3. **La fréquence** — un couple qui ne couche plus ensemble depuis 6 mois est en danger\n4. **La prière commune** — priez ensemble avant l'intimité, cela change tout\n\n### Le piège du taux zéro\n\nBeaucoup de couples chrétiens tombent dans l'abstinence involontaire. La fatigue, les enfants, le stress. **Reconstruisez l'intimité comme on reconstruit un muscle** : 10 minutes par jour de présence, 1 fois par semaine de tendresse, 1 week-end par trimestre de retraite à deux.\n\n> Le lit conjugal est un **autel**. Ce qui s'y passe n'est pas secondaire. C'est central.",
        },
      ],
    },
  ],

  // Mariam Touré — Cuisine
  "Mariam Touré": [
    {
      title: "La Cuisine Ivoirienne de Mariam",
      subtitle: "50 recettes de l'attiéké au foutou",
      description:
        "Le livre de référence pour réussir les plats emblématiques de Côte d'Ivoire. Recettes pas à pas, secrets de grand-mère, astuces de chef. Pour débutants et gourmands.",
      category: "Cuisine",
      price: 6500,
      compareAtPrice: 9000,
      coverColor: "#FFD86B",
      featured: true,
      isBestseller: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "L'attiéké parfait",
          content:
            "## Le plat national\n\nL'attiéké, on le mange à Abidjan à toute heure. Petit-déjeuner, déjeuner, dîner, voire en snack à 22h. Mais un **bon** attiéké, c'est rare. La différence ? La **texture**, le **goût** et l'**accompagnement**.\n\n### Ingrédients (4 personnes)\n\n- 500 g d'attiéké frais\n- 1 oignon émincé\n- 2 tomates en dés\n- 1 cube Maggi\n- 1 c. à soupe d'huile\n- Poisson grillé ou poulet braisé\n- Piment (optionnel)\n\n### Méthode\n\n1. **Étuvée** — Placez l'attiéké dans un couscoussier. Faites cuire 10 minutes à la vapeur. Il va gonfler.\n2. **Égrainer** — À la fourchette, séparez les grains. Ajoutez 1 c. d'huile et le cube émietté.\n3. **Re-vapeur** — 5 minutes de plus.\n4. **Garnir** — Oignon, tomate, poisson, piment.\n\n### Le secret de Mariam\n\nAjoutez 1 cuillère à soupe de **lait de coco** pendant la seconde vapeur. Ça change tout.\n\n> Un attiéké bien fait ne se mange pas. Il se **déguste**.",
        },
        {
          title: "Le foutou banane",
          content:
            "## La science du pilon\n\nLe foutou n'est pas une recette. C'est un **art**. Et comme tout art, il y a des règles.\n\n### Ingrédients\n\n- 4 bananes plantains mûres mais fermes\n- 200 g de manioc cuit\n- 1 c. à café de sel\n- Sauce graine ou sauce arachide\n\n### Méthode\n\n1. **Cuire** — Bananes épluchées et manioc dans l'eau salée, 25 minutes\n2. **Piler** — Dans un mortier, écrasez banane + manioc ensemble. Le geste : frappez, relevez, tournez.\n3. **Façonner** — Formez une boule lisse, sans grumeaux\n\n### Les 3 erreurs à éviter\n\n1. Trop d'eau → foutou collant\n2. Pas assez de pilonnage → foutou granuleux\n3. Banane trop mûre → goût sucré\n\n> Le foutou se mange avec les doigts, trempé dans la sauce. Pas de fourchette. **Pas de honte.**",
        },
        {
          title: "Le sauce graine",
          content:
            "## La reine des sauces\n\nLa sauce graine (ou sauce palava) traverse toute l'Afrique de l'Ouest. Chaque pays, chaque famille, a sa version. Voici celle de Mariam, apprise de sa grand-mère à Bouaké.\n\n### Ingrédients (6 personnes)\n\n- 500 g de graines de palme (écrasées)\n- 300 g de viande de bœuf\n- 200 g de poisson fumé\n- 2 oignons\n- 4 tomates\n- 1 c. de pâte de crevettes\n- 100 g de crevettes séchées\n- Huile de palme\n- Piment, sel, cube\n\n### Méthode\n\n1. **Bouillir les graines** — 1h jusqu'à ce qu'elles soient tendres. Écraser, tamiser, jeter les fibres.\n2. **Cuire les viandes** — Bœuf + poisson fumé avec oignon, cube, sel. 30 minutes.\n3. **Assembler** — Ajoutez la pâte de graines, les crevettes, la pâte de crevettes, les tomates mixées.\n4. **Mijoter** — 45 minutes à feu doux. Ajoutez l'huile de palme en fin.\n\n### Le secret\n\nUne feuille de **spinach** (épinard local) en fin de cuisson donne la couleur sombre et le goût profond.\n\n> La sauce graine est meilleure le lendemain. Préparez-la la veille.",
        },
        {
          title: "Le braisé de poulet",
          content:
            "## Le street food ivoirien\n\nLe poulet braisé d'Abidjan a une réputation mondiale. Mais le réussir chez soi demande de la technique.\n\n### Ingrédients (marinade)\n\n- 1 poulet fermier découpé\n- 4 oignons mixés\n- 1 tête d'ail\n- 1 morceau de gingembre\n- 2 c. de pâte de crevettes\n- 1 c. de moutarde\n- Jus de 2 citrons\n- Cube, sel, piment\n- Huile pour badigeonner\n\n### Méthode\n\n1. **Mariner 24h** — minimum 4h, idéal la nuit\n2. **Griller** — barbecue ou four à 220°C, 30 minutes côté peau, 20 minutes côté chair\n3. **Badigeonner** — Mélange huile + marinade filtrée, toutes les 10 minutes\n4. **Repos** — Laissez reposer 5 minutes avant de servir\n\n### L'accompagnement\n\nAttiéké + oignon-tomate-cube-piment. Le combo parfait.\n\n> Le vrai braisé a la peau **croustillante** et la chair **juteuse**. Si l'inverse, vous avez raté quelque chose.",
        },
      ],
    },
    {
      title: "Pâtisserie Africaine Moderne",
      subtitle: "Verrines, gâteaux et mignardises aux saveurs locales",
      description:
        "Réconcilier la pâtisserie française et les saveurs africaines : gâteau à l'arachide, tarte au mangue, macaron à l'hibiscus. Pour pâtissiers en herbe et professionnels.",
      category: "Cuisine",
      price: 7000,
      coverColor: "#C8553D",
      deviceLimit: 3,
      chapters: [
        {
          title: "Le gâteau à l'arachide",
          content:
            "## L'humble devient noble\n\nL'arachide est le fruit le plus sous-estimé d'Afrique. Transformé en gâteau, il devient somptueux.\n\n### Ingrédients\n\n- 200 g de beurre d'arachide pur\n- 150 g de sucre\n- 3 œufs\n- 100 g de farine\n- 1 sachet de levure\n- 50 g d'arachides concassées\n\n### Méthode\n\n1. Fouettez beurre d'arachide + sucre\n2. Ajoutez œufs un à un\n3. Incorporez farine + levure\n4. Versez dans un moule beurré\n5. Parsemez d'arachides concassées\n6. Four à 170°C, 35 minutes\n\n### Le secret\n\nUtilisez un beurre d'arachide **sans sucre ajouté**. Le sucre du gâteau suffit. Et ajoutez 1 pincée de fleur de sel sur le dessus avant cuisson.",
        },
        {
          title: "La tarte à la mangue",
          content:
            "## Quand la mangue devient reine\n\nLa mangue africaine (variété Brooke, Kent, Amélie) est l'une des meilleures du monde. En tarte, elle rivalise avec n'importe quel fruit français.\n\n### La pâte sablée\n\n- 200 g de farine\n- 100 g de beurre froid\n- 60 g de sucre glace\n- 1 œuf\n- 1 pincée de sel\n\nMélangez du bout des doigts. Reposez 1h au frais. Fonçage. Cuisson à blanc 15 min à 180°C.\n\n### La crème pâtissière à la mangue\n\n- 3 jaunes d'œufs\n- 80 g de sucre\n- 30 g de Maïzena\n- 250 ml de lait\n- Purée de 2 mangues mûres\n\nFaites épaissir à feu doux. Coulez sur la pâte. Garnissez de tranches de mangue fraîche.\n\n### Le glaçage\n\nNappage abricot + 1 c. de rhum. Brillant et gourmand.",
        },
        {
          title: "Macarons à l'hibiscus",
          content:
            "## Le bissap dans un macaron\n\nL'hibiscus (bissap, oseille de Guinée) donne une couleur magenta et une acidité parfaite pour les macarons.\n\n### Coques (30 macarons)\n\n- 200 g de poudre d'amandes\n- 200 g de sucre glace\n- 150 g de blancs d'œufs (vieillis 24h)\n- 200 g de sucre semoule\n- 50 ml d'eau\n- Colorant rouge naturel\n\n### Ganache bissap\n\n- 100 g de chocolat blanc\n- 50 ml de crème\n- 2 c. de bissap concentré\n\nMacaronez. Pochez. Croûtez 30 min. Cuisson 12 min à 150°C.\n\n> Le bissap acidulé tranche parfaitement avec le sucre de la coque. C'est un macaron **adulte**, pas enfantin.",
        },
      ],
    },
    {
      title: "Cuisine Rapide pour Mamans Actives",
      subtitle: "20 repas en moins de 30 minutes",
      description:
        "La cuisine ne doit pas être une corvée de 2 heures. Voici 20 repas équilibrés, savoureux, prêts en moins de 30 minutes, avec des ingrédients africains accessibles.",
      category: "Cuisine",
      price: 4000,
      coverColor: "#5DBE8A",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/e41b77bb6257.jpg",
      deviceLimit: 3,
      chapters: [
        {
          title: "Le riz sauté express",
          content:
            "## 15 minutes, grand plaisir\n\nLe riz sauté est le sauveur des soirs de semaine. Il utilise le **riz de la veille**, les **légumes qui traînent** et une poêle.\n\n### Ingrédients (4 pers.)\n\n- 4 tasses de riz cuit (froid)\n- 2 carottes en dés\n- 1 oignon\n- 100 g de petits pois\n- 2 œufs\n- 100 g de crevettes ou de poulet\n- 3 c. de sauce soja\n- 2 c. d'huile\n\n### Méthode (15 min)\n\n1. Sauter œufs brouillés, réserver\n2. Sauter viande + légumes 5 min\n3. Ajouter riz, soja, œufs\n4. Mélanger 3 min\n\n### Variantes\n\n- Ananas + curry → version sucrée-salée\n- Piment + gingembre → version africaine\n",
        },
        {
          title: "Le sandwich poulet-avocat",
          content:
            "## 10 minutes pour un festin\n\nLe sandwich est sous-estimé. Bien fait, il vaut un repas.\n\n### Ingrédients\n\n- 4 tranches de pain de mie complet\n- 200 g de poulet grillé\n- 1 avocat mûr\n- 2 tomates\n- Salade, oignon rouge\n- Sauce : mayo + moutarde + citron\n\n### Méthode\n\n1. Toastez le pain\n2. Écrasez l'avocat + citron + sel\n3. Montez : pain → avocat → poulet → tomate → salade → sauce → pain\n4. Coupez en deux\n\n> La clé : un avocat **bien mûr**. Tout le reste est accessoire.",
        },
      ],
    },
  ],

  // Junior Mbarga — Tech & Digital
  "Junior Mbarga": [
    {
      title: "Devenir Freelance en Afrique",
      subtitle: "Du premier client à 500 000 F/mois",
      description:
        "Le guide pratique pour les jeunes Africains qui veulent vivre du freelancing digital : web, design, rédaction, formation. Stratégies, plateformes, paiement, fiscalité.",
      category: "Tech",
      price: 9000,
      compareAtPrice: 13000,
      coverColor: "#1F4A2E",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/066c47a49095.jpg",
      featured: true,
      isBestseller: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Pourquoi le freelance, pourquoi maintenant",
          content:
            "## La ruée vers l'or digital\n\nEn 2024, le freelance digital est l'opportunité économique la plus importante en Afrique. Pourquoi ?\n\n### Les 4 raisons\n\n1. **Internet a baissé** — 4G partout, fibre dans les grandes villes\n2. **Les paiements ont explosé** — Wave, Orange Money, Paystack, Flutterwave\n3. **La demande mondiale explose** — les entreprises cherchent des talents abordables\n4. **La barrière de la langue se lève** — l'anglais n'est plus un obstacle avec les outils IA\n\n### Combien ça rapporte ?\n\nUn développeur junior camerounais facture 15 à 30 €/heure sur Malt, Upwork, Toptal. Soit 250 000 à 500 000 F par mois, en travaillant depuis Douala.\n\nUn rédacteur web facture 5 à 15 € pour 1000 mots. Une formation vidéo : 20 à 100 € l'heure.\n\n> Le freelance n'est pas un side-hustle. C'est une **carrière**. Traitez-le comme telle.",
        },
        {
          title: "Choisir sa niche",
          content:
            "## Spécialiste vs généraliste\n\nLe freelance généraliste est mort. Aujourd'hui, **les clients cherchent des experts**. Un « développeur web » vaut 15 €/h. Un « développeur Shopify pour marques de cosmétiques » vaut 60 €/h.\n\n### La matrice niche\n\n|               | Forte demande | Faible demande |\n|---------------|---------------|----------------|\n| Peu de concur | Or            | Risqué         |\n| Beaucoup      | OK            | À éviter       |\n\nVisez le quart « Or » : une niche où il y a de la demande et peu de concurrents.\n\n### Exemples de niches rentables en 2024\n\n- **Développement** : Shopify, Webflow, intégrations Stripe\n- **Design** : UI mobile fintech, packaging cosmétiques\n- **Rédaction** : SEO juridique, fiches produits e-commerce\n- **Marketing** : TikTok ads mode, Instagram ads restauration\n- **Vidéo** : montage YouTube éducatif, formation corporate\n\n### L'exercice\n\nÉcrivez votre positionnement en 1 phrase : *« J'aide [cible] à [résultat] grâce à [compétence]. »*\n\nEx : *« J'aide les marques de mode africaines à doubler leurs ventes en ligne grâce à des boutiques Shopify optimisées. »*\n\n> Une niche, ce n'est pas se limiter. C'est se **distinguer**.",
        },
        {
          title: "Trouver ses 3 premiers clients",
          content:
            "## Le mur du débutant\n\nLe problème n°1 du freelance débutant : **personne ne le connaît**. Voici la méthode pour casser ce mur en 30 jours.\n\n### Méthode 3×3\n\n**3 canaux actifs** :\n1. **LinkedIn** — publiez 3x/semaine sur votre niche\n2. **Upwork / Malt** — 5 candidatures par jour\n3. **WhatsApp** — contactez 10 connaissances par semaine\n\n**3 offres d'entrée** :\n1. **Audit gratuit** — 30 min pour montrer votre expertise\n2. **Mini-prestation** — 30 à 50 € pour un livrable rapide\n3. **Forfait découverte** — 200 € pour un projet pilote\n\n**3 preuves sociales** :\n1. **Témoignage** — même gratuit, demandez un avis\n2. **Étude de cas** — décrivez le problème, la solution, le résultat\n3. **Portfolio** — 3 exemples visuels de votre travail\n\n### Le secret\n\nLes 3 premiers clients ne paient pas vraiment. Ils **construisent votre réputation**. Offrez plus que ce qui est promis. Demandez des recommandations.\n\n> Un client satisfait vous en amène 3. Un client déçu vous en coûte 10.",
        },
        {
          title: "Facturer en dollars, payer en FCFA",
          content:
            "## L'avantage de change\n\nLe freelance africain a un **avantage compétitif massif** : le coût de la vie. 30 €/h qui semblent peu en France sont **18 000 F** au Cameroun — un excellent revenu.\n\n### Recevoir de l'argent depuis l'étranger\n\n1. **Payoneer** — idéal pour Upwork, Toptal, Fiverr\n2. **Wise** — frais bas, carte physique\n3. **Geegpay** — solution africaine dédiée aux freelances\n4. **Stripe Atlas** — pour créer une LLC US (avancé)\n\n### Convertir en FCFA\n\n- **Wave** — transfert international activé dans plusieurs pays\n- **Yellow Card** — crypto stable (USDT) → FCFA\n- **Binance P2P** — rapide mais surveillé fiscalement\n\n### Le piège fiscal\n\nEn Côte d'Ivoire, Cameroun, Sénégal : vous devez **déclarer vos revenus**. Les auto-entrepreneurs paient 1 à 3 % du CA. C'est peu. Mais l'amende pour non-déclaration est lourde.\n\n> L'argent qui entre doit être **propre**. Déclarez. Vous dormirez mieux.",
        },
        {
          title: "Construire son personal brand",
          content:
            "## Devenu inévitable\n\nLe freelance qui réussit à long terme n'est pas celui qui cherche des clients. C'est celui que les clients **viennent trouver**.\n\n### Les 3 piliers d'une marque personnelle\n\n1. **LinkedIn** — 3 posts par semaine, 1 vidéo par semaine\n2. **Newsletter** — 1 email par semaine à 500 abonnés\n3. **Portfolio public** — site web + GitHub / Behance\n\n### Le contenu qui marche\n\n- **Études de cas** — *« Comment j'ai aidé X à atteindre Y »*\n- **Coulisses** — *« Ma semaine en tant que freelance à Douala »*\n- **Tutoriels** — *« Comment configurer Shopify en 30 min »*\n- **Opinions** — *« Pourquoi je refuse certains clients »*\n\n### L'engrenage\n\n- Mois 1-3 : 0 client, beaucoup de contenu\n- Mois 4-6 : 1-2 clients entrants par mois\n- Mois 7-12 : file d'attente, sélection, hausse des tarifs\n- Année 2 : vous êtes une référence dans votre niche\n\n> Le personal brand ne se construit pas en un mois. Mais après 12 mois, **votre carrière est transformée**.",
        },
      ],
    },
    {
      title: "Apprendre le Web avec Next.js",
      subtitle: "Du HTML au déploiement en 14 jours",
      description:
        "Une formation complète pour débutants : HTML, CSS, JavaScript, React, Next.js, déploiement. Avec un projet réel à construire chaque jour.",
      category: "Tech",
      price: 10000,
      compareAtPrice: 15000,
      coverColor: "#5DBE8A",
      featured: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Jour 1 — Les bases du web",
          content:
            "## Comment fonctionne internet\n\nAvant de coder, comprenons. Quand vous tapez `krea.africa` dans votre navigateur, voici ce qui se passe en 200 millisecondes :\n\n1. Le navigateur demande au DNS : *« Quelle est l'IP de krea.africa ? »*\n2. Le DNS répond : *« 185.199.108.153 »*\n3. Le navigateur envoie une requête HTTP GET à cette IP\n4. Le serveur renvoie un fichier HTML\n5. Le navigateur lit le HTML, demande les CSS et JS\n6. Il affiche la page\n\n### Les 3 langages du web\n\n- **HTML** — la structure (le squelette)\n- **CSS** — le style (les vêtements)\n- **JavaScript** — le comportement (les muscles)\n\n### Exemple\n\n```html\n<h1>Bonjour l'Afrique</h1>\n```\n\n```css\nh1 { color: #5DBE8A; font-size: 48px; }\n```\n\n```js\ndocument.querySelector('h1').addEventListener('click', () => alert('Krea!'))\n```\n\n> Comprendre le web, c'est 80 % du métier. Le code n'est que la mise en œuvre.",
        },
        {
          title: "Jour 3 — CSS et Flexbox",
          content:
            "## La mise en page qui fait sens\n\nFlexbox est la solution moderne aux problèmes historiques du CSS. Avec 6 propriétés, vous réglez 90 % des mises en page.\n\n### Le container\n\n```css\n.container {\n  display: flex;\n  justify-content: center; /* horizontal */\n  align-items: center;     /* vertical */\n  gap: 16px;\n  flex-wrap: wrap;\n}\n```\n\n### Les enfants\n\n```css\n.child {\n  flex: 1;       /* grandit pour remplir */\n  min-width: 200px;\n}\n```\n\n### Layout classique\n\n- Header → `display: flex; justify-content: space-between`\n- Cards → `flex: 1; min-width: 280px`\n- Centered hero → `justify-content: center; align-items: center; min-height: 100vh`\n\n> Si vous maîtrisez Flexbox + Grid, vous n'avez plus besoin de Bootstrap jamais.",
        },
        {
          title: "Jour 7 — React, le jeu change",
          content:
            "## Le composant, l'unité de base\n\nReact a transformé le développement web en 2013. Son idée : **tout est composant**. Un bouton est un composant. Une carte est un composant. Une page est un composant.\n\n### Un composant simple\n\n```jsx\nfunction Welcome({ name }) {\n  return <h1>Bonjour {name} !</h1>;\n}\n```\n\n### Avec état\n\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clics : {count}\n    </button>\n  );\n}\n```\n\n### Les 3 règles\n\n1. **Un composant = une responsabilité**\n2. **L'état descend, les événements remontent**\n3. **Pas de mutation directe** — utilisez `setX(newVal)`\n\n> Une fois que vous pensez « composant », vous ne pouvez plus revenir en arrière.",
        },
        {
          title: "Jour 10 — Next.js, le full-stack",
          content:
            "## Pourquoi Next.js\n\nNext.js est aujourd'hui le framework React n°1. Il ajoute à React :\n\n- **Routing** automatique par fichiers\n- **SSR** (Server-Side Rendering) pour le SEO\n- **API Routes** — backend et frontend dans le même projet\n- **Image optimization** intégrée\n- **Déploiement** en 1 clic sur Vercel\n\n### Créer une app\n\n```bash\nnpx create-next-app@latest mon-app\ncd mon-app\nnpm run dev\n```\n\n### Une page\n\n```tsx\n// app/page.tsx\nexport default function Home() {\n  return <h1>Bonjour Krea</h1>;\n}\n```\n\n### Une API route\n\n```ts\n// app/api/hello/route.ts\nexport async function GET() {\n  return Response.json({ message: 'Bonjour' });\n}\n```\n\n> Next.js rend possible ce qui était impossible hier : un développeur seul peut lancer un SaaS complet en un week-end.",
        },
        {
          title: "Jour 14 — Déployer en production",
          content:
            "## De local à mondial\n\nVotre application tourne sur `localhost:3000`. Il faut maintenant l'envoyer sur le web. En 2024, c'est devenu **ridiculement simple**.\n\n### Vercel (recommandé)\n\n1. Poussez votre code sur GitHub\n2. Connectez votre repo sur vercel.com\n3. Cliquez « Deploy »\n4. Votre app est en ligne sur `mon-app.vercel.app` en 90 secondes\n\n### Custom domain\n\nAchetez un domaine (Namecheap, GoDaddy). Ajoutez-le dans Vercel. Configurez les DNS. En 24h, votre app est sur `mon-app.com`.\n\n### Les 3 vérifications finales\n\n1. **HTTPS activé** — Vercel le fait automatiquement\n2. **Variables d'environnement** — DB, secrets, API keys\n3. **Build de production** — testez `npm run build` en local\n\n### La fierté\n\nQuand votre première application est en ligne, accessible depuis n'importe quel téléphone en Afrique, en Europe, en Asie — **vous avez changé de dimension**.\n\n> Un développeur qui n'a jamais déployé en production n'est pas un développeur. Déployez tôt, déployez souvent.",
        },
      ],
    },
    {
      title: "L'IA pour les Entrepreneurs Africains",
      subtitle: "ChatGPT, Claude et les outils qui changent tout",
      description:
        "L'intelligence artificielle n'est plus un luxe. Ce livre montre comment les entrepreneurs africains peuvent l'utiliser dès aujourd'hui pour gagner du temps, créer du contenu et automatiser leur business.",
      category: "Tech",
      price: 8500,
      coverColor: "#697E6E",
      deviceLimit: 3,
      chapters: [
        {
          title: "Ce que l'IA peut — et ne peut pas — faire",
          content:
            "## Démystifier\n\nL'IA générative (ChatGPT, Claude, Gemini) est **incroyable** et **limitée** à la fois. Comprendre les deux faces vous évite de vous tromper.\n\n### Ce que l'IA fait très bien\n\n- **Rédaction** — emails, posts, descriptions produits\n- **Idéation** — brainstorming, plans, listes\n- **Traduction** — anglais/français, multilingue\n- **Code** — fragments, debugging, explications\n- **Synthèse** — résumés de longs documents\n\n### Ce que l'IA fait mal\n\n- **Véracité** — elle peut inventer (hallucinations)\n- **Créativité profonde** — imitation, pas innovation\n- **Décisions critiques** — médicales, juridiques\n- **Données récentes** — sauf si connectée au web\n\n### La règle\n\nL'IA est un **assistant**, pas un remplaçant. Vous restez responsable de tout ce qu'elle produit.\n\n> « L'IA ne prendra pas votre travail. Un entrepreneur qui utilise l'IA prendra votre marché. »",
        },
        {
          title: "10 prompts qui changent votre semaine",
          content:
            "## Le bon prompt, c'est 80 % du résultat\n\nUn prompt vague donne un résultat vague. Un prompt précis donne un résultat utilisable. Voici 10 prompts à copier-coller.\n\n### 1. Email de relance\n\n> *« Écris un email de relance professionnel pour un client qui n'a pas répondu à ma proposition de [SUJET] depuis 5 jours. Ton : poli mais ferme. 100 mots max. »*\n\n### 2. Description produit\n\n> *« Rédige une description de 80 mots pour [PRODUIT] avec : 1 accroche, 3 bénéfices, 1 CTA. Style chaleureux, africain moderne. »*\n\n### 3. Plan de contenu\n\n> *« Donne-moi 12 idées de posts LinkedIn pour un freelance [MÉTIER] qui veut attirer des clients [CIBLE]. Format titre + 1 ligne. »*\n\n### 4. Réunion efficace\n\n> *« Propose un ordre du jour de 30 minutes pour une réunion sur [SUJET] avec [PARTICIPANTS]. Inclut objectifs, timing, decisions à prendre. »*\n\n### 5. Email commercial\n\n> *« Écris un cold email de 120 mots pour proposer mes services de [SERVICE] à [CIBLE]. Structure : problème, solution, preuve, CTA. »*\n\n> Gardez ces prompts dans un document. Personnalisez-les. C'est votre **bibliothèque de productivité**.",
        },
        {
          title: "Créer du contenu à la chaîne",
          content:
            "## Le système 1→10→100\n\nUn entrepreneur qui produit 1 contenu original peut, grâce à l'IA, le transformer en 10, puis 100.\n\n### La méthode\n\n1. **Pilier** — écrivez 1 article de fond (1500 mots) ou tournez 1 vidéo de 10 minutes\n2. **Déclinaisons** — demandez à l'IA de produire :\n   - 5 posts LinkedIn\n   - 3 carrousels Instagram\n   - 10 threads Twitter/X\n   - 1 newsletter\n   - 1 script vidéo court\n3. **Diffusion** — publiez sur 4 plateformes avec.Buffer ou Hootsuite\n\n### Les outils complémentaires\n\n- **Claude** pour l'écriture longue (meilleur style français)\n- **ChatGPT** pour les formats courts et le code\n- **ElevenLabs** pour transformer texte → audio\n- **HeyGen** pour transformer texte → vidéo\n- **Canva** pour les visuels\n\n### Le piège\n\nL'IA produit du contenu **générique** si vous lui demandez simplement. Pour vous démarquer :\n- Donnez-lui votre **voix** (écrivez 3 paragraphes de vous, demandez à l'IA de l'imiter)\n- Donnez-lui vos **histoires** vécues\n- Demandez-lui des **angles inhabituels**\n\n> Le contenu générique est invisible. Le contenu **personnel amplifié par l'IA** est imbattable.",
        },
      ],
    },
  ],

  // Fatou Bensouda — Romance
  "Fatou Bensouda": [
    {
      title: "Les Racines du Silence",
      subtitle: "Roman",
      description:
        "Dans un village du Centre-Cameroun,三 générations de femmes se taisent. Jusqu'au jour où Nenne, 17 ans, refuse l'union arrangée. Un roman sur la mémoire, la révolte et la liberté.",
      category: "Romance",
      price: 5500,
      compareAtPrice: 8000,
      coverColor: "#C8553D",
      featured: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Chapitre 1 — Le matin où tout a basculé",
          content:
            "## Nenne\n\nLe matin où ma mère est venue m'annoncer que je serais la troisième femme de M. Ousmanou, j'avais les mains pleines de farine. Je préparais le beignet pour mes petits frères. Le soleil n'était pas encore haut, et déjà, dans la concession, les poules fuyaient comme si elles savaient.\n\n— Assieds-toi, Nenne.\n\nMa mère ne m'appelait jamais par mon prénom le matin. D'habitude, c'était « la fille » ou « viens m'aider ». Quand elle disait Nenne, c'était que quelque chose allait se casser.\n\nJe n'ai pas posé la cuillère. Je n'ai pas essuyé mes mains. Je suis restée debout, face à elle, dans la petite cuisine de banco, et j'ai attendu.\n\n— Ousmanou a payé la dot. Tu partiras samedi.\n\nIl y a eu un silence. Pas un silence doux. Un silence dur, comme un mur. Je me souviens avoir compté les fissures du sol. Trois, comme mes sœurs aînées. Elles aussi, étaient parties un samedi. Elles aussi, n'avaient pas dit non.\n\nMais moi, Nenne, fille cadette des femmes silencieuses de Ngoumou, ce samedi-là, je n'allais pas partir.\n\n— Non.\n\nLe mot est sorti sans que je le décide. Il est sorti comme un cri, mais tout bas. Ma mère a levé les yeux. Elle n'était pas en colère. Elle avait peur.\n\n— Tu ne peux pas dire non, Nenne.\n\n— Je viens de le faire.\n\nEt le silence, ce silence qui avait bâti notre famille depuis trois générations, ce silence-là venait de se fissurer.",
        },
        {
          title: "Chapitre 2 — La mémoire des femmes",
          content:
            "## Mère-grand\n\nMa grand-mère, Mama Eding, avait quatre-vingts ans et des mains qui tremblaient. Mais sa voix, elle, ne tremblait pas.\n\n— Assieds-toi, petite.\n\nJe me suis assise à ses pieds, sur le banc de bois sous le manguier. Elle tournait entre ses doigts un collier de perles noires que je n'avais jamais vu.\n\n— Ce collier, c'est ta grand-mère qui me l'a donné. Et sa mère avant elle. Chaque femme de notre sang l'a porté.\n\n— Et toi, Mama ? Tu l'as porté ?\n\nElle n'a pas répondu tout de suite. Elle a regardé le manguier, comme si elle y cherchait un visage.\n\n— Je l'ai porté le jour où ton grand-père m'a prise. J'avais quatorze ans. Je ne savais pas ce qu'on attendait de moi. Ce collier, on me l'a mis au cou, et j'ai compris qu'il ne partirait plus.\n\n— Tu aurais voulu dire non ?\n\nMama Eding a souri. Un sourire lent, sans joie.\n\n— On ne nous a jamais appris ce mot, Nenne. Pas une seule femme de notre lignée ne l'a prononcé. Jusqu'à toi.\n\nElle m'a pris la main. Ses doigts étaient froids.\n\n— Si tu dis non, et que tu tiens, tu casses quelque chose en nous. Pas une mauvaise chose. Mais quelque chose de vieux. Quelque chose qui nous a tenues debout, même si c'était sur des jambes tremblantes.\n\n— Et après ?\n\n— Après, tu marches. Toute seule d'abord. Et puis d'autres marcheront derrière toi.\n\nElle m'a mis le collier dans la main. Il était lourd, plus lourd qu'il n'avait l'air.\n\n— Garde-le. Un jour, tu le donneras à celle qui viendra après toi. Mais cette fois, ce sera elle qui choisira.",
        },
        {
          title: "Chapitre 3 — Le départ",
          content:
            "## Le samedi\n\nLe samedi est arrivé trop vite. Trop lentement.\n\nLa veille, mon père n'a pas mangé. Il s'est assis sous l'avocatier, seul, et il a fumé cigarette après cigarette. Quand je suis passée près de lui avec le repas du soir, il n'a pas levé les yeux.\n\n— Tu shames la famille, Nenne.\n\nCe n'était pas une accusation. C'était une plainte. Mon père, homme bon mais faible, homme qui avait dit oui toute sa vie, ne pouvait pas comprendre que je dise non.\n\n— Papa, est-ce que tu aurais voulu dire non, parfois ?\n\nIl n'a pas répondu. Il a juste écrasé sa cigarette.\n\nLe samedi matin, je suis partie avant le lever du jour. J'ai pris un petit sac : deux pagnes, un cahier, un stylo, le collier de perles noires. J'ai laissé sur la table un mot : *« Je reviendrai. Mais pas comme on le voulait. »*\n\nLa route de Yaoundé est longue à pied. Quatre heures. Mais à l'aube, la terre est fraîche, et les pensées sont nettes.\n\nJe suis arrivée à la gare de Mbankomo alors que le soleil devenait dur. Un camion de bananes m'a prise en stop. Le chauffeur, un homme âgé, ne m'a posé aucune question. Il m'a simplement dit :\n\n— Si tu fuis quelque chose, ne regarde pas en arrière. Le regard est lourd. Il te fait revenir.\n\nJe n'ai pas regardé en arrière.\n\nEt Yaoundé, quand je l'ai vue au loin, étalée sur ses sept collines, m'a semblé un pays entier. Un pays où, peut-être, une femme pouvait marcher sans qu'on lui rappelle le poids du silence.",
        },
        {
          title: "Chapitre 4 — Yaoundé, ville de béton",
          content:
            "## La tante\n\nMa tante Mireille habitait à Mvog-Mbi, dans une maison en bande derrière la pharmacie. Elle ne m'avait vue que deux fois dans ma vie — à l'enterrement de mon grand-père, et au baptême de mon petit frère. Mais ma mère m'avait dit : *« Si un jour tu es perdue, va chez Mireille. »*\n\nJ'ai frappé. Elle a ouvert. Elle portait un pagne noué sur la poitrine, un chiffon sur la tête. Elle ne m'a pas demandé pourquoi j'étais là. Elle m'a juste prise dans ses bras.\n\n— Nenne. Tu es venue.\n\n— Tante Mireille, maman m'a dit que...\n\n— Je sais pourquoi tu es là. Entre.\n\nSa maison sentait le ndolè et le savon noir. Deux enfants jouaient par terre. Sur le mur, une photo : mon oncle, mort il y a dix ans.\n\n— Tu peux rester, Nenne. Mais ici, on se lève tôt et on travaille. Pas de place pour les rêveuses.\n\n— Je ne suis pas rêveuse. Je suis venue pour devenir quelqu'un.\n\nElle m'a regardée longuement. Et elle a souri — un vrai sourire, le premier qu'on me donnait depuis une semaine.\n\n— Ta mère, à ton âge, disait la même chose. Elle a oublié.\n\n— Moi, je n'oublierai pas.\n\n— On verra. En attendant, lave-toi les mains. Le ndolè est prêt.",
        },
      ],
    },
    {
      title: "Sous le Ciel de Dakar",
      subtitle: "Nouvelles",
      description:
        "Cinq nouvelles qui explorent l'amour moderne au Sénégal : rencontres en ligne, retours au pays, mariages mixtes, amours cachées. Tender, drôle, parfois cruel.",
      category: "Romance",
      price: 4500,
      coverColor: "#FFD86B",
      deviceLimit: 3,
      chapters: [
        {
          title: "Le WhatsApp de minuit",
          content:
            "## Nouvelle 1\n\nFatou ne dormait jamais avant minuit. Pas par insomnie. Par habitude. À minuit, Modou lui envoyait un message. Tous les soirs depuis trois mois. Un message. Pas deux. Pas un appel. Juste un message.\n\n— Tu dors ?\n\nEt elle répondait :\n\n— Pas encore.\n\nEt ils parlaient. De tout. De rien. De la chaleur à Dakar, du cousin qui venait d'arriver de France, du taxi qui avait failli les écraser tous les deux la semaine dernière, devant le marché Sandaga.\n\nFatou avait 28 ans. Elle travaillait à la BCIE, gagnait 450 000 F par mois, habitait seule à Sacré-Cœur 3. Modou avait 32 ans, était chauffeur de taxi, gagnait 200 000 F les bons mois. Ils s'étaient rencontrés sur une application de rencontre que Fatou avait installée « pour voir ».\n\n— Tu viens ce soir ?\n\nLa question de Modou, ce soir-là, était différente. Pas la même que d'habitude. D'habitude, il demandait : *« On se voit quand ? »* Ce soir, il disait : *« Tu viens ? »*\n\nFatou savait ce que ça voulait dire. Ça voulait dire : viens chez moi. Ça voulait dire : on ne sera plus seulement deux écrans.\n\nElle a regardé sa chambre. Le lit bien fait. Le pyjama plié. La bouteille d'eau à demi vide. Tout était en ordre. Tout, sauf sa décision.\n\n— Modou, je...\n\n— Tu n'es pas obligée.\n\nCinq mots. Et tout a basculé. Parce que c'étaient cinq mots qu'aucun homme ne lui avait jamais dits. Tous les autres avaient supposé. Demandé. Insisté. Modou, lui, disait : *tu n'es pas obligée.*\n\nFatou a mis son manteau. Elle a pris un taxi. Elle est arrivée à Médina à 0h47. Modou l'attendait dehors, en t-shirt, les pieds nus.\n\n— Tu es venue.\n\n— Je suis venue.\n\nEt ce soir-là, pour la première fois de sa vie, Fatou a eu l'impression qu'un homme ne la prenait pas, mais l'accueillait.",
        },
        {
          title: "Le retour d'Aminata",
          content:
            "## Nouvelle 2\n\nAminata est revenue de Paris un mardi de mars. Elle portait un manteau gris, des bottes noires, et un parfum trop fort pour Dakar. La chaleur l'a frappée comme un mur dès qu'elle est sortie de l'avion.\n\nDix ans. Dix ans qu'elle n'était pas revenue.\n\nSon père l'attendait à l'aéroport. Il avait vieilli. Ses cheveux étaient tout blancs. Il ne portait plus son boubou de dimanche, juste un vieux pull en laine trop chaud.\n\n— Papa.\n\n— Aminata.\n\nIls ne se sont pas embrassés. Ce n'était pas dans leurs habitudes. Ils se sont regardés. Et le regard disait tout ce que les mots ne pouvaient pas.\n\nSur le parking, une voiture attendait. Pas la vieille Peugeot 504 de son enfance. Une neuve, grise, silencieuse.\n\n— Tu as changé de voiture ?\n\n— C'est ton cousin qui me la prête. Pour toi.\n\n— Pour moi ?\n\n— Pour que tu sois à l'aise. Pour que tu restes.\n\nAminata a fermé les yeux. Elle savait. Son père n'avait jamais accepté qu'elle parte. Dix ans de silence, ponctués de quelques coups de téléphone courts. Et maintenant, ce geste : une voiture empruntée, pour la retenir.\n\n— Papa, je ne reste qu'une semaine.\n\n— Je sais.\n\nMais le ton disait le contraire. Et Aminata, en montant dans la voiture silencieuse, a compris que cette semaine allait être la plus longue de sa vie.",
        },
      ],
    },
  ],

  // Ibrahima Sarr — DevPerso
  "Ibrahima Sarr": [
    {
      title: "Discipline de Fer",
      subtitle: "21 jours pour reprendre le contrôle de votre vie",
      description:
        "Un programme de 21 jours pour construire une discipline de fer. Pour les jeunes Africains qui veulent arrêter de procrastiner et enfin réaliser leurs projets.",
      category: "DevPerso",
      price: 6000,
      compareAtPrice: 9000,
      coverColor: "#1F4A2E",
      coverUrl: "https://sfile.chatglm.cn/images-ppt/f92c14e84126.jpg",
      isBestseller: true,
      deviceLimit: 3,
      chapters: [
        {
          title: "Jour 1 — La promesse",
          content:
            "## Le contrat avec soi\n\nLa discipline ne commence pas par une action. Elle commence par une **parole**. Une parole donnée à soi-même.\n\n### Le problème\n\nVous vous êtes promis mille choses : me coucher tôt, courir, lire, ne plus fumer. Et vous avez tenu mille fois. Puis abandonné mille et une fois. Pourquoi ? Parce que la promesse n'était pas **écrite**.\n\n### L'exercice du jour 1\n\nPrenez un cahier. Une page blanche. En haut, écrivez la date. Puis cette phrase :\n\n> *« Moi, [votre nom], m'engage pour les 21 prochains jours à [votre objectif], quoi qu'il arrive. »*\n\nSignez. Datez.\n\n### Les 5 objectifs autorisés\n\nChoisissez **un seul**. Pas deux. Pas trois. Un.\n\n1. Me lever à 5h tous les matins\n2. Faire 30 min d'exercice par jour\n3. Lire 20 pages par jour\n4. Ne pas utiliser les réseaux avant 12h\n5. Écrire 500 mots par jour\n\n> La discipline est un muscle. On ne soulève pas 100 kg le premier jour. On commence par 5. Puis 10. Puis 20.",
        },
        {
          title: "Jour 5 — La règle des 2 minutes",
          content:
            "## Quand tu n'as pas envie\n\nLe matin du 5e jour, vous n'aurez pas envie. C'est inévitable. Le cerveau va chercher des excuses : *il pleut, j'ai mal au genou, j'ai beaucoup à faire, je commence demain.*\n\n### La règle d'or\n\nQuand vous n'avez pas envie, dites-vous : *« Je le fais juste 2 minutes. »*\n\n- 2 minutes de course → souvent, ça devient 20\n- 2 minutes de lecture → souvent, ça devient 30\n- 2 minutes d'écriture → souvent, ça devient 500 mots\n\n### Pourquoi ça marche\n\nLe cerveau résiste au **démarrage**, pas à la **continuation**. Une fois lancé, l'élan fait le reste.\n\n### L'engagement minimum\n\nSi vraiment, après 2 minutes, vous voulez arrêter : arrêtez. Mais **montez sur la machine**. Touchez la barre. Ouvrez le cahier. Asseyez-vous à la table.\n\n> 80 % du travail, c'est de commencer. Les 2 minutes vous donnent les 80 %.",
        },
        {
          title: "Jour 10 — Le piège des réseaux",
          content:
            "## Le vol du temps\n\nLes réseaux sociaux ne volent pas votre temps par accident. Ils sont **conçus** pour ça. Des ingénieurs à 200 000 $ par an passent leurs journées à trouver comment vous faire scroller 30 secondes de plus.\n\n### Les chiffres\n\n- Temps moyen sur les réseaux en Afrique : **4h12 par jour**\n- Soit **1 530 heures par an**\n- Soit **64 jours par an**\n- Soit **6 mois de vie active tous les 5 ans**\n\n### La méthode 3-2-1\n\n- **3 zones sans téléphone** : lit, table de repas, toilettes\n- **2 plages autorisées** : 12h-12h30 et 18h-19h\n- **1 application à supprimer** : celle qui vous coûte le plus de temps\n\n### Le test du matin\n\nNe touchez pas à votre téléphone pendant la **première heure** de la journée. Si vous tenez 7 jours, vous avez gagné. Votre cerveau vous appartiendra à nouveau.\n\n> Le téléphone est un outil. Pas un maître. Reprenez la main.",
        },
        {
          title: "Jour 15 — L'allié du corps",
          content:
            "## Le corps est la machine\n\nVous pouvez avoir la meilleure volonté du monde. Si votre corps est épuisé, mal nourri, mal dormi, vous échouerez. La discipline commence par le **corps**.\n\n### Les 3 piliers physiques\n\n1. **Sommeil** — 7h minimum, coucher avant 23h\n2. **Nourriture** — moins de sucre, plus de protéines, plus d'eau\n3. **Mouvement** — 30 min par jour, marche incluse\n\n### Le secret des grands\n\nTous les hommes disciplinés de l'histoire avaient un rituel matinal :\n\n- **Marcus Aurélius** écrivait à l'aube\n- **Toni Morrison** écrivait avant le lever du soleil\n- **Mahatma Gandhi** marchait 8 km chaque matin\n\n### Votre rituel\n\nÀ 5h du matin (ou l'heure que vous avez choisie) :\n\n1. Verre d'eau (1 min)\n2. 20 pompes / 20 squats (5 min)\n3. Douche froide (2 min)\n4. 10 minutes de silence ou prière\n5. 30 minutes de travail sur votre objectif\n\n> Le corps qui se lève tôt devient un corps qui **décide**. Le corps qui dort tard devient un corps qui **subit**.",
        },
        {
          title: "Jour 21 — La nouvelle normalité",
          content:
            "## Vous avez changé\n\n21 jours. Vous l'avez fait. Le matin du 21e jour, vous vous levez à 5h sans réveil. Vous avez envie de courir. Vous trouvez bizarre de ne pas lire vos 20 pages.\n\n### Ce qui s'est passé\n\nEn 21 jours, votre cerveau a créé de nouvelles connexions. Une habitude commence à se former. Elle n'est pas encore « gravée dans le marbre » — il faut 66 jours en moyenne pour ça. Mais **le virage est pris**.\n\n### Les 3 changements visibles\n\n1. **Énergie** — vous êtes moins fatigué, plus clair\n2. **Confiance** — vous savez que vous pouvez tenir une promesse\n3. **Temps** — vous avez récupéré 1 à 2 heures par jour\n\n### La suite\n\nMaintenant que vous avez une habitude, **ajoutez-en une autre**. Une seule. Pendant 21 jours supplémentaires.\n\n- Si vous avez réussi le lever à 5h → ajoutez 30 min de lecture\n- Si vous avez réussi 30 min d'exercice → ajoutez la méditation\n- Si vous avez réussi 500 mots/jour → ajoutez le sommeil à 22h\n\n### La promesse finale\n\nReprenez votre cahier. À la page du jour 1, lisez votre promesse. Puis ajoutez en dessous :\n\n> *« J'ai tenu. Le 21e jour, je suis toujours là. Je ne suis plus celui qui promet. Je suis celui qui fait. »*\n\n> La discipline n'est pas une punition. C'est une **liberté**. La liberté d'être celui que vous vouliez être.",
        },
      ],
    },
    {
      title: "L'Art de Communiquer",
      subtitle: "Parler, écouter, convaincre",
      description:
        "La communication est la compétence n°1 dans la vie comme en affaires. Ce livre vous donne les outils pour parler en public, négocier, gérer les conflits, et vous faire écouter.",
      category: "DevPerso",
      price: 5500,
      coverColor: "#5DBE8A",
      deviceLimit: 3,
      chapters: [
        {
          title: "L'écoute, la compétence oubliée",
          content:
            "## 80 % de la communication\n\nTout le monde veut apprendre à parler. Personne ne veut apprendre à écouter. Pourtant, **les meilleurs communicateurs sont les meilleurs auditeurs**.\n\n### Les 3 niveaux d'écoute\n\n1. **Écoute passive** — vous laissez l'autre parler en pensant à autre chose\n2. **Écoute active** — vous reformulez, vous posez des questions\n3. **Écoute profonde** — vous écoutez ce qui n'est pas dit : le ton, les silences, le corps\n\n### L'exercice\n\nDans votre prochaine conversation, **ne parlez pas pendant 5 minutes**. Posez des questions. Reformulez. Hochez la tête. Vous serez choqué de ce que vous apprendrez.\n\n> Les gens ne se souviennent pas de ce que vous avez dit. Ils se souviennent de **comment vous les avez fait se sentir**. Et rien ne fait mieux se sentir qu'être vraiment écouté.",
        },
        {
          title: "Parler en public sans peur",
          content:
            "## La peur n°1\n\nLa glossophobie — peur de parler en public — touche 75 % des humains. Plus que la peur de la mort, disait Jerry Seinfeld. Cela veut dire qu'à un enterrement, on préfère être dans le cercueil plutôt que de faire l'éloge funèbre.\n\n### Les 3 causes de la peur\n\n1. **Peur du jugement** — ils vont me trouver nul\n2. **Peur de l'oubli** — je vais bloquer\n3. **Peur du silence** — je ne sais pas quoi dire\n\n### Les remèdes\n\n1. **Préparer** — pas un script mot à mot, mais une structure (3 points clés)\n2. **Respirer** — 4 secondes inspire, 7 retient, 8 expire. Baisse le rythme cardiaque\n3. **Regarder** — trouver 3 visages bienveillants dans la salle, parler à eux\n\n### La règle du 7-38-55\n\n- **7 %** de votre impact = vos mots\n- **38 %** = votre voix (ton, rythme, volume)\n- **55 %** = votre corps (posture, gestes, regard)\n\n> Si vous dites « je suis confiant » avec une voix tremblante et un regard fuyant, votre public entend « je suis terrifié ». Le corps parle plus fort que la bouche.",
        },
        {
          title: "Négocier comme un pro",
          content:
            "## Tout est négociation\n\nQue vous demandiez une augmentation, achetiez une voiture, ou convainquiez votre enfant de manger ses légumes — **vous négociez**. La question n'est pas *si* vous négociez, mais *comment*.\n\n### Les 4 principes (méthode Harvard)\n\n1. **Séparez les personnes du problème** — ne attaquez pas l'autre\n2. **Concentrez-vous sur les intérêts, pas les positions** — demandez « pourquoi »\n3. **Inventez des options gagnant-gagnant** — sortez du tout-ou-rien\n4. **Exigez des critères objectifs** — prix du marché, normes légales\n\n### L'erreur n°1\n\nLa plupart des gens négocient comme s'il s'agissait d'une bataille. Ils veulent **gagner**. Mais une négociation gagnée par l'autre est une négociation ratée : il ne voudra plus jamais traiter avec vous.\n\n### L'astuce du silence\n\nQuand l'autre a fait une offre, **ne répondez pas tout de suite**. Comptez 5 secondes. Le silence est inconfortable. Souvent, l'autre va **améliorer son offre** juste pour combler le vide.\n\n> Le bon négociateur ne cherche pas à gagner. Il cherche à ce que **l'autre veuille revenir**.",
        },
        {
          title: "Gérer les conflits",
          content:
            "## Le conflit n'est pas un échec\n\nLe conflit est **inévitable** dès qu'il y a deux humains. Ce n'est pas le conflit qui détruit les relations — c'est la **mauvaise gestion** du conflit.\n\n### Les 5 stratégies (Thomas-Kilmann)\n\n1. **Compétition** — je gagne, tu perds (utile en urgence)\n2. **Collaboration** — on gagne tous les deux (idéal mais long)\n3. **Compromis** — on perd un peu chacun (rapide)\n4. **Évitement** — on retire (utile pour les sujets mineurs)\n5. **Accommodation** — je perds, tu gagnes (pour préserver la relation)\n\nAucune n'est « bonne » ou « mauvaise » en soi. Chacune a son contexte.\n\n### La phrase magique\n\nDans un conflit qui s'enlise, dites :\n\n> *« Aide-moi à comprendre. »*\n\nCette phrase désarme. Elle ne dit pas « tu as tort ». Elle dit « je veux t'écouter ». Et souvent, l'autre redescend.\n\n### La règle de fin\n\nUn conflit bien géré renforce la relation. Un conflit mal géré — même « gagné » — la détruit. **Visez la relation, pas la victoire.**",
        },
      ],
    },
  ],
};

// ───────────────────────── Buyers ──────────────────────────────────
const BUYERS = Array.from({ length: 10 }, (_, i) => ({
  name: [
    "Awa Ndiaye",
    "Koffi Brou",
    "Esther Kamga",
    "Moussa Ba",
    "Grace Adeyemi",
    "Patrice Yapi",
    "Rama Sow",
    "David Eze",
    "Christelle Mfoumou",
    "Yacine Fall",
  ][i],
  email: `buyer${i + 1}@krea.africa`,
  country: ["SN", "CI", "CM", "SN", "NG", "CI", "SN", "NG", "CM", "SN"][i],
}));

const PAYMENT_METHODS = ["MTN", "ORANGE", "WAVE", "CARD"] as const;
const REVIEW_COMMENTS = [
  "Un livre qui a changé ma vision des choses. Je recommande vivement !",
  "Très bien écrit, pratique et concret. Exactement ce que je cherchais.",
  "Excellent rapport qualité-prix. Les exemples sont très pertinents.",
  "J'ai appliqué les conseils dès le premier chapitre. Résultats au rendez-vous.",
  "L'auteur connaît son sujet. À lire absolument pour les entrepreneurs.",
  "Simple, clair, efficace. Pas de blabla inutile.",
  "Une vraie pépite. Je l'ai offert à toute mon équipe.",
  "Quelques longueurs mais le contenu vaut le détour.",
  "Inspirant et motivant. Je me suis mis en action immédiatement.",
  "Le meilleur investissement de mon année.",
  null,
  null,
];

// ───────────────────────── Helpers ─────────────────────────────────
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randInt(7, 22), randInt(0, 59), 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Krea seed — démarrage...\n");

  // ── Purge ──
  console.log("🧹 Nettoyage des données existantes...");
  await db.readerSession.deleteMany();
  await db.review.deleteMany();
  await db.license.deleteMany();
  await db.order.deleteMany();
  await db.coupon.deleteMany();
  await db.payout.deleteMany();
  await db.affiliateLink.deleteMany();
  await db.chapter.deleteMany();
  await db.ebook.deleteMany();
  await db.creator.deleteMany();
  await db.user.deleteMany();
  await db.platformStats.deleteMany();
  console.log("✓ Tables vidées\n");

  // ── Admin ──
  console.log("👑 Création de l'admin...");
  const admin = await db.user.create({
    data: {
      email: "admin@krea.africa",
      name: "Admin Krea",
      passwordHash: hashPassword("admin123"),
      role: "ADMIN",
      country: "CM",
    },
  });
  console.log(`  ✓ ${admin.email}\n`);

  // ── Creators ──
  console.log("✍️  Création des créateurs...");
  const creatorIds: { creator: any; user: any }[] = [];
  for (const c of CREATORS) {
    const user = await db.user.create({
      data: {
        email: c.email,
        name: c.name,
        passwordHash: hashPassword("creator123"),
        role: "CREATOR",
        phone: c.phone,
        country: c.country,
      },
    });
    let slug = slugify(c.name);
    while (await db.creator.findUnique({ where: { slug } })) {
      slug = `${slugify(c.name)}-${randInt(1000, 9999)}`;
    }
    const creator = await db.creator.create({
      data: {
        userId: user.id,
        slug,
        displayName: c.name,
        bio: c.bio,
        tagline: c.tagline ?? null,
        bannerColor: c.bannerColor ?? "#1F4A2E",
        plan: c.plan,
        commissionRate: planCommission[c.plan],
        verified: c.verified,
        walletBalance: c.walletBalance,
        totalSales: 0,
        totalRevenue: 0,
        // ── Creator site ──
        siteName: c.siteName ?? null,
        siteEnabled: c.siteEnabled ?? false,
        siteThemePreset: c.siteThemePreset ?? "foret",
        siteFontPreset: c.siteFontPreset ?? "merienda",
        siteLayout: c.siteLayout ?? "magazine",
        siteHero: c.siteHero ?? null,
        siteHeroSub: c.siteHeroSub ?? null,
        siteFooterText: c.siteFooterText ?? null,
        siteSocial: c.siteSocial ?? null,
      },
    });
    creatorIds.push({ creator, user });
    console.log(`  ✓ ${c.name} (${c.plan}, ${c.country})${c.siteEnabled ? " [SITE]" : ""}`);
  }
  console.log("");

  // ── Ebooks + chapters ──
  console.log("📚 Création des ebooks et chapitres...");
  const allEbooks: any[] = [];
  for (const { creator } of creatorIds) {
    const seeds = EBOOKS[creator.displayName] || [];
    for (const seed of seeds) {
      let slug = slugify(seed.title);
      while (await db.ebook.findUnique({ where: { slug } })) {
        slug = `${slugify(seed.title)}-${randInt(1000, 9999)}`;
      }
      const totalWords = seed.chapters.reduce(
        (s, ch) => s + ch.content.trim().split(/\s+/).filter(Boolean).length,
        0
      );
      const totalPages = Math.max(1, Math.ceil(totalWords / 350));
      const ebook = await db.ebook.create({
        data: {
          creatorId: creator.id,
          title: seed.title,
          slug,
          subtitle: seed.subtitle,
          description: seed.description,
          price: seed.price,
          compareAtPrice: seed.compareAtPrice || null,
          category: seed.category,
          coverUrl: seed.coverUrl || "",
          coverColor: seed.coverColor,
          deviceLimit: seed.deviceLimit,
          status: "PUBLISHED",
          featured: seed.featured || false,
          isBestseller: seed.isBestseller || false,
          publishedAt: daysAgo(randInt(20, 90)),
          pageCount: totalPages,
          wordCount: totalWords,
        },
      });
      let order = 0;
      for (const ch of seed.chapters) {
        const wc = ch.content.trim().split(/\s+/).filter(Boolean).length;
        await db.chapter.create({
          data: {
            ebookId: ebook.id,
            title: ch.title,
            content: ch.content,
            order: order++,
            wordCount: wc,
          },
        });
      }
      allEbooks.push(ebook);
      console.log(`  ✓ « ${seed.title} » (${seed.chapters.length} chap.)`);
    }
  }
  console.log(`  → ${allEbooks.length} ebooks au total\n`);

  // ── Buyers ──
  console.log("👥 Création des acheteurs...");
  const buyerUsers: any[] = [];
  for (const b of BUYERS) {
    const u = await db.user.create({
      data: {
        email: b.email,
        name: b.name,
        passwordHash: hashPassword("buyer123"),
        role: "BUYER",
        country: b.country,
      },
    });
    buyerUsers.push(u);
    console.log(`  ✓ ${b.name}`);
  }
  console.log("");

  // ── Orders + licenses ──
  console.log("🛒 Génération des commandes (~40)...");
  const ordersCount = 40;
  let platformRevenue = 0;
  let platformPayouts = 0;
  for (let i = 0; i < ordersCount; i++) {
    const buyer = pick(buyerUsers);
    const ebook = pick(allEbooks);
    const creator = await db.creator.findUnique({
      where: { id: ebook.creatorId },
    });
    if (!creator) continue;
    // skip if already owned
    const exists = await db.license.findFirst({
      where: { userId: buyer.id, ebookId: ebook.id },
    });
    if (exists) continue;
    const amount = ebook.price;
    const creatorEarning = Math.round(
      amount * (1 - creator.commissionRate / 100)
    );
    const platformFee = amount - creatorEarning;
    const createdAt = daysAgo(randInt(1, 60));
    const ref = genRef("KRE");
    const order = await db.order.create({
      data: {
        ref,
        buyerId: buyer.id,
        ebookId: ebook.id,
        amount,
        platformFee,
        creatorEarning,
        paymentMethod: pick(PAYMENT_METHODS),
        paymentStatus: "PAID",
        fulfillment: "DELIVERED",
        country: buyer.country,
        createdAt,
      },
    });
    await db.license.create({
      data: {
        userId: buyer.id,
        ebookId: ebook.id,
        orderId: order.id,
        accessType: "PERPETUAL",
        deviceLimit: ebook.deviceLimit,
        status: "ACTIVE",
        progress: randInt(0, 100),
        lastReadAt: Math.random() > 0.5 ? daysAgo(randInt(0, 5)) : null,
        createdAt,
      },
    });
    await db.ebook.update({
      where: { id: ebook.id },
      data: { salesCount: { increment: 1 } },
    });
    await db.creator.update({
      where: { id: creator.id },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: creatorEarning },
        walletBalance: { increment: creatorEarning },
      },
    });
    platformRevenue += amount;
  }
  console.log(`  ✓ ${ordersCount} commandes créées\n`);

  // ── Reviews ──
  console.log("⭐ Création des avis (~25)...");
  const reviewCount = 25;
  for (let i = 0; i < reviewCount; i++) {
    const buyer = pick(buyerUsers);
    const ebook = pick(allEbooks);
    const license = await db.license.findFirst({
      where: { userId: buyer.id, ebookId: ebook.id },
    });
    if (!license) continue;
    const existing = await db.review.findUnique({
      where: { userId_ebookId: { userId: buyer.id, ebookId: ebook.id } },
    });
    if (existing) continue;
    // mostly 4-5 stars, some 3
    const r = Math.random();
    const rating = r < 0.7 ? 5 : r < 0.92 ? 4 : 3;
    await db.review.create({
      data: {
        userId: buyer.id,
        ebookId: ebook.id,
        rating,
        comment: pick(REVIEW_COMMENTS),
        createdAt: daysAgo(randInt(0, 40)),
      },
    });
    // recompute aggregates
    const agg = await db.review.aggregate({
      where: { ebookId: ebook.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await db.ebook.update({
      where: { id: ebook.id },
      data: {
        ratingAvg: Math.round((agg._avg.rating || 0) * 10) / 10,
        ratingCount: agg._count.rating,
      },
    });
  }
  console.log(`  ✓ ${reviewCount} avis créés\n`);

  // ── Payouts ──
  console.log("💸 Création des retraits...");
  const payoutMethods = ["MTN", "ORANGE", "WAVE", "BANK"] as const;
  for (let i = 0; i < 4; i++) {
    const { creator } = creatorIds[i];
    const amount = randInt(20000, 80000);
    const fee = Math.max(200, Math.round(amount * 0.02));
    const status = i < 2 ? "PAID" : "PENDING";
    const payout = await db.payout.create({
      data: {
        ref: genRef("PAY"),
        creatorId: creator.id,
        amount,
        fee,
        method: pick(payoutMethods),
        status,
        createdAt: daysAgo(randInt(2, 25)),
      },
    });
    if (status === "PAID") platformPayouts += amount;
    console.log(
      `  ✓ ${creator.displayName} — ${amount} F (${status})`
    );
  }
  console.log("");

  // ── Creator site pages (custom subpages) ──
  console.log("📄 Création des pages de site créateur...");
  const sitePageSeeds: Record<string, { slug: string; title: string; content: string; order: number }[]> = {
    "Aïcha Diallo": [
      {
        slug: "mon-approche",
        title: "Mon approche",
        order: 1,
        content: "## Pourquoi je fais ça\n\nJe crois que les femmes africaines n'ont pas besoin de permission pour entreprendre. Elles ont besoin de **méthodes** et de **modèles** qui fonctionnent ici, pas de théories importées.\n\n## Ma méthode en 3 piliers\n\n1. **Clarifier** — trouver l'idée qui colle à vos compétences et à votre marché\n2. **Valider** — tester avec 10 vrais clients avant de construire\n3. **Scaler** — systématiser pour ne plus dépendre de votre temps\n\n## Mon parcours\n\nCoach depuis 7 ans, j'ai accompagné plus de 300 femmes à Dakar, Abidjan et Douala. Beaucoup sont passées de \"side hustle\" à entreprise à temps plein.",
      },
      {
        slug: "accompagnement",
        title: "Accompagnement",
        order: 2,
        content: "## Coaching individuel\n\nProgramme de 3 mois pour lancer votre activité. Réservé à 5 personnes par trimestre.\n\n## Ateliers de groupe\n\nUn samedi par mois à Dakar. 4 heures intensives sur un thème concret.\n\n## Mes ebooks\n\nTout commence par un livre. C'est le moins cher et le plus direct pour apprendre ma méthode.",
      },
    ],
    "Christian Okafor": [
      {
        slug: "ma-vision",
        title: "Ma vision",
        order: 1,
        content: "## Un ministère de l'écrit\n\nDepuis 2015, je mets par écrit ce que l'Esprit me donne pour l'Église. Chaque livre est prié, médité, testé dans ma propre vie avant d'être publié.\n\n## Pour qui ?\n\nPour le croyant qui veut grandir. Pour le couple qui veut durer. Pour le pasteur qui veut nourrir son assemblée.\n\n## Mes engagements\n\n- Des enseignements fondés sur la Parole\n- Un langage simple, accessible à tous\n- Des prières pratiques, pas de la théorie",
      },
    ],
    "Junior Mbarga": [
      {
        slug: "mes-formations",
        title: "Mes formations",
        order: 1,
        content: "## Par où commencer ?\n\nSi vous débutez : **Apprendre le Web avec Next.js**. C'est le socle.\n\nSi vous voulez monétiser : **L'IA pour les Entrepreneurs Africains**. C'est le levier.\n\n## Pourquoi mes ebooks marchent\n\nParce qu'ils sont écrits par un dev qui code tous les jours, pas un formateur en salle. Tout est testé en production.\n\n## Communauté\n\nRejoignez les 2 400+ jeunes qui apprennent avec moi sur WhatsApp.",
      },
    ],
  };
  for (const { creator } of creatorIds) {
    const pages = sitePageSeeds[creator.displayName];
    if (!pages) continue;
    for (const p of pages) {
      await db.sitePage.create({
        data: {
          creatorId: creator.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          order: p.order,
          showInNav: true,
          published: true,
        },
      });
    }
    console.log(`  ✓ ${creator.displayName} — ${pages.length} pages`);
  }
  console.log("");

  // ── Coupons ──
  console.log("🎟️  Création des coupons...");
  const couponSeeds = [
    { code: "KREA10", percentOff: 10 },
    { code: "BIENVENUE25", percentOff: 25 },
    { code: "RAMADAN15", percentOff: 15 },
  ];
  for (let i = 0; i < couponSeeds.length; i++) {
    const { creator } = creatorIds[i % creatorIds.length];
    await db.coupon.create({
      data: {
        code: couponSeeds[i].code,
        creatorId: creator.id,
        percentOff: couponSeeds[i].percentOff,
        maxRedemptions: 100,
        redeemed: randInt(0, 12),
        active: true,
        expiresAt: daysAgo(-30),
      },
    });
    console.log(`  ✓ ${couponSeeds[i].code} (-${couponSeeds[i].percentOff}%)`);
  }
  console.log("");

  // ── Platform stats ──
  console.log("📊 Mise à jour des statistiques plateforme...");
  const [creatorsCount, ebooksCount, buyersCount] = await Promise.all([
    db.creator.count(),
    db.ebook.count(),
    db.user.count({ where: { role: "BUYER" } }),
  ]);
  await db.platformStats.upsert({
    where: { id: "singleton" },
    update: {
      totalRevenue: platformRevenue,
      totalPayouts: platformPayouts,
      totalCreators: creatorsCount,
      totalEbooks: ebooksCount,
      totalReaders: buyersCount,
    },
    create: {
      id: "singleton",
      totalRevenue: platformRevenue,
      totalPayouts: platformPayouts,
      totalCreators: creatorsCount,
      totalEbooks: ebooksCount,
      totalReaders: buyersCount,
    },
  });
  console.log(
    `  ✓ Revenu total: ${platformRevenue.toLocaleString("fr-FR")} F | ` +
      `Retraits: ${platformPayouts.toLocaleString("fr-FR")} F | ` +
      `Créateurs: ${creatorsCount} | Ebooks: ${ebooksCount} | Acheteurs: ${buyersCount}\n`
  );

  console.log("✅ Seed terminé !\n");
  console.log("━━━ Comptes de test ━━━");
  console.log("Admin     : admin@krea.africa / admin123");
  console.log("Créateurs : {prenom}@krea.africa / creator123");
  console.log("Acheteurs : buyer{1-10}@krea.africa / buyer123");
}

main()
  .catch((err) => {
    console.error("❌ Erreur seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
