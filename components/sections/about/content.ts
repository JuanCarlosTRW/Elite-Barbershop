export type AboutTextBlock = {
  type: "textblock";
  imagePosition: "left" | "right" | "center";
  image?: string;
  imageAlt?: string;
  title_fr: string;
  title_en: string;
  text_fr: string;
  text_en: string;
};

export type AboutQuoteBlock = {
  type: "quote";
  quote_fr: string;
  quote_en: string;
};

export type AboutHeroBlock = {
  type: "heroblock";
  title_fr: string;
  title_en: string;
  text_fr: string;
  text_en: string;
  hero_image?: string;
};

export type AboutBlock = AboutTextBlock | AboutQuoteBlock | AboutHeroBlock;

// No top hero banner on the About page — matches the live design.
export const ABOUT_HERO_IMAGE: string | null = null;

export const ABOUT_BLOCKS: AboutBlock[] = [
  {
    type: "textblock",
    imagePosition: "center",
    title_fr: "Notre Histoire",
    title_en: "Our Story",
    text_fr:
      "Elite Barbershop est né d'une vision ambitieuse : offrir une expérience de soins masculins sans compromis, alliant précision technique, raffinement et véritable sens de l'hospitalité. Fondé en 2024 par Hadi, maître barbier avec plus de dix ans d'expérience, le salon s'est rapidement imposé comme une destination incontournable à Laval. Dès le premier jour, Elite Barbershop a su séduire une clientèle fidèle et exigeante, captivée par l'excellence constante de ses services. Plus de 400 clients ont déjà laissé des avis 5 étoiles, confirmant le statut d'Elite comme l'un des barbershops les plus respectés du Québec. Chaque membre de l'équipe partage la même obsession du détail et du service irréprochable. Ici, chaque rendez-vous est bien plus qu'une simple coupe : c'est un rituel de confiance, une expérience haut de gamme pensée pour révéler la meilleure version de vous-même.",
    text_en:
      "Elite Barbershop was born from an ambitious vision: to offer an uncompromising men's grooming experience that pairs technical precision, refinement, and a true sense of hospitality. Founded in 2024 by Hadi — a master barber with more than ten years of experience — the shop quickly became a destination of choice in Laval. From day one, Elite Barbershop has earned a loyal and demanding clientele, captivated by the consistent excellence of its services. More than 400 clients have already left 5-star reviews, confirming Elite's status as one of the most respected barbershops in Quebec. Every member of the team shares the same obsession with detail and impeccable service. Here, every appointment is far more than a simple cut — it's a ritual of confidence, a premium experience designed to reveal the best version of yourself.",
  },
  {
    type: "textblock",
    imagePosition: "right",
    image:
      "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/Facelab_2025-08-18_06-28-56.jpg?v=1755567059",
    imageAlt: "Hadi — Founder of Elite Barbershop",
    title_fr: "Hadi",
    title_en: "Hadi",
    text_fr:
      "Avec dix années d'expérience dans son art, Hadi maîtrise son métier à la perfection. À seulement 25 ans, il s'est déjà forgé une solide réputation grâce à sa précision, son sens du style et la qualité haut de gamme de ses services. Avant de lancer Elite Barbershop en 2024, il a perfectionné son savoir-faire dans certains des meilleurs barbershops, gagnant la fidélité d'une clientèle exigeante. Son engagement envers l'excellence se reflète dans ses avis 5 étoiles, faisant de lui l'un des barbiers les plus respectés de l'industrie.",
    text_en:
      "With ten years of experience in his craft, Hadi has mastered his trade to perfection. At just 25, he has already built a solid reputation thanks to his precision, his sense of style, and the premium quality of his services. Before launching Elite Barbershop in 2024, he honed his skills in some of the finest barbershops, earning the loyalty of a demanding clientele. His commitment to excellence is reflected in his 5-star reviews, making him one of the most respected barbers in the industry.",
  },
  {
    type: "textblock",
    imagePosition: "left",
    image:
      "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/IMG_9439.jpg?v=1755567060",
    imageAlt: "Evan — Master Barber at Elite Barbershop",
    title_fr: "Evan",
    title_en: "Evan",
    text_fr:
      "Evan, barbier hautement qualifié avec plus de 5 années d'expérience, est reconnu pour son souci du détail et son engagement envers l'excellence. Son expertise et son approche personnalisée incarnent les standards les plus élevés de l'expérience Elite Barbershop.",
    text_en:
      "Evan, a highly skilled barber with more than 5 years of experience, is recognized for his attention to detail and his commitment to excellence. His expertise and personalized approach embody the highest standards of the Elite Barbershop experience.",
  },
  {
    type: "quote",
    quote_fr: "« Votre look, notre passion. »",
    quote_en: "“Your look, our passion.”",
  },
];

export const GALLERY_IMAGES: string[] = [
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/elite-barbershop-laval-interior.webp?v=1775016997",
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/4.jpg?v=1753454380",
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/3.jpg?v=1753454379",
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/DSC09256.jpg?v=1753454379",
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/DSC09289.jpg?v=1753454377",
  "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/2.jpg?v=1753454380",
];
