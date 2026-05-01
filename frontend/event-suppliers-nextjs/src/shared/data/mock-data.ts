import { Supplier } from "@/shared/types";

export const suppliers: Supplier[] = [
  {
    id: "1",
    businessName: "DJ רן לוי",
    category: "מוזיקה",
    subcategory: "DJ",
    city: "תל אביב",
    rating: 4.8,
    tags: ["חתונה", "אירוע עסקי", "אנגלית"],
    phone: "050-1234567",
    whatsapp: "https://wa.me/972501234567",
    description: "דיג׳יי לאירועים פרטיים ועסקיים עם ציוד מלא והנחיה.",
  },
  {
    id: "2",
    businessName: "קייטרינג תמר",
    category: "אוכל",
    subcategory: "קייטרינג חלבי",
    city: "ירושלים",
    rating: 4.6,
    tags: ["כשר", "מהדרין", "טבעוני"],
    phone: "052-7654321",
    whatsapp: "https://wa.me/972527654321",
    description: "קייטרינג מותאם אישית לאירועים עד 500 משתתפים.",
  },
];

export const eventCategoryMap: Record<string, string[]> = {
  חתונה: ["DJ", "קייטרינג חלבי", "צילום סטילס"],
  "אירוע עסקי": ["DJ", "מערכות סאונד", "צילום וידאו"],
  "יום הולדת": ["DJ", "מתנפחים", "מפעיל לילדים"],
};
