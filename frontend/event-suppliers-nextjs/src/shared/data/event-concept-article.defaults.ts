import type { EventConceptArticle } from "@/shared/types/event-concept-article";

/** Full article body matching the pool-villa Figma; hero is merged per slug in `getEventConceptArticle`. */
export const eventConceptArticleDefaults: Omit<EventConceptArticle, "slug" | "hero"> = {
  visionTitle: "The vision and atmosphere",
  visionParagraphs: [
    "The concept of a private villa pool party offers the perfect combination of a luxurious event and a relaxed atmosphere. The event begins in the late afternoon with refreshing cocktails by the pool, and continues into the night with decorative lighting, immersive music and a customized chef's menu.",
    "The design focuses on shades of deep blue and bold orange touches to create an impressive contrast. The use of luxurious garden furniture, pampering lounge areas and lighting that sinks into the water create an unparalleled hospitality space. Every detail has been carefully chosen - from the branding on the cocktail glasses to the precise sound that surrounds the floating dance floor.",
  ],
  quote:
    '"Our goal was to create a complete disconnect from the everyday. We wanted guests to feel like they were on a luxury vacation on the Riviera, but with the personal and warm touch of a private event."',
  specs: [
    { label: "Estimated budget", value: "₪150k - 250k", icon: "wallet" },
    { label: "Number of guests", value: "80 - 150", icon: "users" },
    { label: "Location type", value: "Private villa / beach", icon: "map-pin" },
    { label: "Recommended season", value: "Summer / Spring", icon: "clock" },
  ],
  map: {
    imageSrc:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&auto=format&fit=crop",
    imageAlt: "Map preview near the coast",
    recommendedArea: "Herzliya Pituach",
  },
  teamTitle: "The supplier team",
  team: [
    {
      name: "Villa 'Blue Bay'",
      specialty: "Event complex",
      imageSrc: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=80&auto=format&fit=crop",
      imageAlt: "Luxury villa exterior",
      profileHref: "#",
    },
    {
      name: "Chef Idan Levy",
      specialty: "Catering chef",
      imageSrc: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80&auto=format&fit=crop",
      imageAlt: "Chef portrait",
      profileHref: "#",
    },
    {
      name: "DJ Ofir Ram",
      specialty: "Music and atmosphere",
      imageSrc: "https://images.unsplash.com/photo-1571266028243-e4733b0f91d1?w=200&q=80&auto=format&fit=crop",
      imageAlt: "DJ at decks",
      profileHref: "#",
    },
  ],
  galleryTitle: "Moments Gallery",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80&auto=format&fit=crop",
      alt: "Guests by the pool",
    },
    {
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80&auto=format&fit=crop",
      alt: "Evening table setting",
    },
    {
      src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&auto=format&fit=crop",
      alt: "Celebration details",
    },
    {
      src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80&auto=format&fit=crop",
      alt: "Outdoor lounge",
    },
    {
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop",
      alt: "Pool floats and decor",
    },
    {
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&auto=format&fit=crop",
      alt: "Guests enjoying the pool",
    },
  ],
};

export const eventConceptArticleDefaultHero: EventConceptArticle["hero"] = {
  badgeLabel: "Selected concept",
  title: "Luxurious pool party at the villa",
  subtitle: "An exclusive experience that combines luxury, water and a free atmosphere under the open sky.",
  imageSrc:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80&auto=format&fit=crop",
  imageAlt: "Luxurious poolside dining at dusk",
};
