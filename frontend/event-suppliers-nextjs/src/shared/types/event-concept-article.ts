export type EventConceptArticleSpecIcon = "wallet" | "users" | "map-pin" | "clock";

export type EventConceptArticleSpec = {
  label: string;
  value: string;
  icon: EventConceptArticleSpecIcon;
};

export type EventConceptArticleTeamMember = {
  name: string;
  specialty: string;
  imageSrc: string;
  imageAlt: string;
  profileHref: string;
};

export type EventConceptArticleGalleryImage = {
  src: string;
  alt: string;
};

export type EventConceptArticle = {
  slug: string;
  hero: {
    badgeLabel: string;
    title: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
  };
  visionTitle: string;
  visionParagraphs: string[];
  quote: string;
  specs: EventConceptArticleSpec[];
  map: {
    imageSrc: string;
    imageAlt: string;
    recommendedArea: string;
  };
  teamTitle: string;
  team: EventConceptArticleTeamMember[];
  galleryTitle: string;
  gallery: EventConceptArticleGalleryImage[];
};
