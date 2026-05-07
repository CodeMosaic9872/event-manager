export type SavedSupplierDemo = {
  name: string;
  subtitle: string;
  description: string;
  location: string;
  rating: string;
  imageUrl: string;
};

export const savedSuppliersDemo: SavedSupplierDemo[] = [
  {
    name: "Arad Event Photography",
    subtitle: "Photography and production",
    description:
      "Documenting magical moments with an artistic lens and the most advanced cinematic equipment.",
    location: "The whole country",
    rating: "4.6",
    imageUrl: "/avatars/1.jpg",
  },
  {
    name: "Dream event garden on the farm",
    subtitle: "Event hall",
    description:
      "A futuristic event space that combines luxury, advanced technology and breathtaking design.",
    location: "Center | Herzliya",
    rating: "4.1",
    imageUrl: "/avatars/2.jpg",
  },
  {
    name: "DJ Alon Perry",
    subtitle: "Music and production",
    description: "Professional DJ for unforgettable events with advanced equipment and powerful sound.",
    location: "All of Israel | South | North",
    rating: "4.3",
    imageUrl: "/avatars/3.jpg",
  },
];
