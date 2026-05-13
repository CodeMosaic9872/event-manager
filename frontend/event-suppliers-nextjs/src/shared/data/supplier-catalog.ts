/** Mock catalog for public marketplace / landing flows (wire to API later). */

export type SupplierSummary = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  location: string;
  rating: string;
  imageUrl?: string;
  /** Wide hero strip behind avatar */
  coverImageUrl?: string;
  /** Main headline on profile (may differ from card name — design reference) */
  profileHeadline?: string;
  profileSubtitle?: string;
  locationLine?: string;
  aboutTitle?: string;
  aboutBody?: string;
  gallery?: string[];
  reviewScore?: number;
  reviewCount?: number;
  reviews?: Array<{
    id: string;
    author: string;
    dateLabel: string;
    body: string;
    badgeLabel?: string;
  }>;
  /** Compact cards in “You might also be interested in” */
  similar?: SupplierSummary[];
};

const u = (path: string) => path;

export const SUPPLIER_LIST: SupplierSummary[] = [
  {
    id: "1",
    name: "צילום ארד לאירועים",
    subtitle: "צילום והפקה",
    description:
      "תיעוד רגעים קסומים עם עדשה אמנותית וציוד קולנועי מהמתקדמים בשוק.",
    location: "כל הארץ",
    rating: "4.6",
    imageUrl: "/avatars/1.jpg",
    coverImageUrl: u("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=600&fit=crop"),
  },
  {
    id: "2",
    name: "גן החלומות בחווה",
    subtitle: "אולם אירועים",
    description:
      "מרחב אירועים עתידני המשלב יוקרה, טכנולוגיה מתקדמת ועיצוב עוצר נשימה.",
    location: "מרכז | הרצליה",
    rating: "4.1",
    imageUrl: "/avatars/2.jpg",
    coverImageUrl: u("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&h=600&fit=crop"),
  },
  {
    id: "3",
    name: "DJ אלון פרי",
    subtitle: "מוזיקה והפקה",
    description: "דיג'יי מקצועי לאירועים בלתי נשכחים עם ציוד מתקדם וסאונד חזק.",
    location: "כל הארץ | דרום | צפון",
    rating: "4.3",
    imageUrl: "/avatars/3.jpg",
    coverImageUrl: u("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=600&fit=crop"),
    profileHeadline: "DJ Galaxy — חוויה קסומה",
    profileSubtitle: "שירותי דיג'יי ובידור",
    locationLine: "תל אביב, ישראל",
  },
  {
    id: "4",
    name: "Skyline אירועים",
    subtitle: "הפקה",
    description: "הפקה מלאה ברמה פרימיום לאירועים פרטיים ועסקיים עם ביצוע ללא פשרות.",
    location: "תל אביב | מרכז",
    rating: "4.8",
    imageUrl: "/avatars/4.jpg",
    coverImageUrl: u("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&h=600&fit=crop"),
  },
  {
    id: "5",
    name: "מאיה סטודיו לפרחים",
    subtitle: "עיצוב",
    description: "עיצוב פרחים וקונספטים לסטים שמתאימים לכל אווירת אירוע.",
    location: "צפון | השרון",
    rating: "4.4",
    imageUrl: "/avatars/5.jpg",
    coverImageUrl: u("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=600&fit=crop"),
  },
];

const byId = Object.fromEntries(SUPPLIER_LIST.map((s) => [s.id, s])) as Record<string, SupplierSummary>;

export function getSupplierById(id: string): SupplierSummary | undefined {
  return byId[id];
}

const galleryDefault = (seed: string) => [
  u(`https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=600&fit=crop&${seed}=1`),
  u(`https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&h=600&fit=crop&${seed}=2`),
  u(`https://images.unsplash.com/photo-1571266028243-95c6f9f0f8d6?w=900&h=600&fit=crop&${seed}=3`),
  u(`https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&h=600&fit=crop&${seed}=4`),
  u(`https://images.unsplash.com/photo-1506157786151-b8491531f063?w=900&h=600&fit=crop&${seed}=5`),
  u(`https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&h=600&fit=crop&${seed}=6`),
];

function buildProfile(base: SupplierSummary): SupplierSummary {
  const headline = base.profileHeadline ?? base.name;
  const sub = base.profileSubtitle ?? base.subtitle;
  const loc = base.locationLine ?? base.location.split("|")[0]?.trim() ?? base.location;
  const aboutBody =
    base.id === "3"
      ? "ל־DJ Galaxy יותר מעשור של ניסיון בעולם האירועים. אנחנו מתמחים ביצירת אווירה ייחודית המותאמת בדיוק לאופי האירוע שלכם — מחתונות יוקרתיות ועד מסיבות פרטיות ואירועי חברות. המוזיקה שלנו היא לב האירוע, ואנחנו כאן כדי להפוך כל רגע לבלתי נשכח."
      : `${base.name} מביאים צוות מנוסה ותכנון קפדני לכל הפקה. אנחנו מתאימים תאורה, סאונד ואווירה למטרות שלכם — כדי שהאורחים יזכרו את החוויה גם אחרי שהאורות יורדים.`;

  const reviews =
    base.id === "3"
      ? [
          {
            id: "r1",
            author: "אבי השירים",
            dateLabel: "לפני שבועיים",
            body: "פשוט מדהים! המוזיקה בדיוק מה שרצינו והבר היה מלא כל הלילה. ממליץ בחום!",
            badgeLabel: "🔥",
          },
          {
            id: "r2",
            author: "נועם לוי",
            dateLabel: "לפני חודש",
            body: "מקצוען אמיתי. ידע לקרוא את הקהל בצורה מושלמת. האירוע של החברה שלנו לא היה אותו דבר בלעדיו.",
            badgeLabel: "N",
          },
        ]
      : [
          {
            id: "r1",
            author: "לקוח אירוע",
            dateLabel: "לאחרונה",
            body: "ביצוע מושלם ותקשורת מצוינת מההתחלה ועד הסוף.",
            badgeLabel: "★",
          },
          {
            id: "r2",
            author: "מנהל הפקה",
            dateLabel: "חודש שעבר",
            body: "צוות מקצועי ביותר — נשמח להזמין שוב.",
            badgeLabel: "P",
          },
        ];

  const similarPool = SUPPLIER_LIST.filter((s) => s.id !== base.id);
  const similar = similarPool.slice(0, 8);

  return {
    ...base,
    profileHeadline: headline,
    profileSubtitle: sub,
    locationLine: loc,
    aboutTitle: "קצת עלינו",
    aboutBody,
    gallery: base.gallery ?? galleryDefault(base.id),
    reviewScore: base.reviewScore ?? Number(base.rating),
    reviewCount: base.reviewCount ?? 128,
    reviews,
    similar,
  };
}

export function getSupplierProfile(id: string): SupplierSummary | undefined {
  const row = getSupplierById(id);
  if (!row) return undefined;
  return buildProfile(row);
}
