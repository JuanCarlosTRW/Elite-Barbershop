export const BUSINESS = {
  legalName: "Elite Barbershop by Hadi",
  shortName: "Elite Barbershop",
  founder: "Hadi",
  foundedYear: 2024,
  address: {
    street: "3871 Blvd. Saint-Martin O",
    locality: "Laval",
    region: "QC",
    postalCode: "H7T 1B2",
    country: "CA",
    full: "3871 Blvd. Saint-Martin O, Laval, QC H7T 1B2",
  },
  geo: {
    latitude: 45.5831,
    longitude: -73.7863,
  },
  phone: {
    display: "(514) 206-1606",
    raw: "+15142061606",
    href: "tel:+15142061606",
  },
  email: {
    address: "Elitebyhadi@hotmail.com",
    href: "mailto:Elitebyhadi@hotmail.com",
  },
  hours: {
    fr: "Lundi-Dimanche, 10h00-20h00",
    en: "Monday-Sunday, 10:00 AM - 8:00 PM",
    structured: {
      open: "10:00",
      close: "20:00",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ] as const,
    },
  },
  ratings: {
    average: 4.9,
    count: 462,
    customers: 4514,
  },
  social: {
    instagram: "https://www.instagram.com/elitebyhadi/",
    tiktok: "https://www.tiktok.com/@elitebyhadi",
  },
  booking: {
    url: "https://book.squareup.com/appointments/0agg17673kvch2/location/LTEDMEDD1QWJ9/services",
  },
  domain: "elitebyhadi.com",
  url: "https://elitebyhadi.com",
  gbpUrl:
    "https://www.google.com/maps?q=3871+Blvd.+Saint-Martin+O,+Laval,+QC+H7T+1B2",
} as const;

export const ASSETS = {
  logoPng:
    "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/952dd5bb-dd1d-4201-99a0-13d818502763_1.png?v=1753454442",
  heroVideoMp4:
    "https://cdn.shopify.com/videos/c/o/v/c076bfd4a43443fda6b02f6ce2071e4b.mp4",
  heroFallbackGif:
    "https://cdn.shopify.com/s/files/1/0624/6059/2222/files/hero_preview_high_quality_1.gif?v=1754092329",
} as const;

export const NEIGHBORHOODS_LAVAL = [
  "Sainte-Rose",
  "Chomedey",
  "Saint-Vincent-de-Paul",
  "Pont-Viau",
  "Auteuil",
  "Duvernay",
] as const;

export const SLOGANS = {
  fr: "Votre look, notre passion.",
  en: "Your look, our passion.",
} as const;

export const HERO_HEADLINE = {
  fr: "L'expérience barbershop réinventée",
  en: "The ultimate barbershop experience",
} as const;

export const FOOTER_TAGLINE = {
  fr: "Depuis 2024, Elite Barbershop est le maître du style masculin à Laval",
  en: "Since 2024, Elite Barbershop has been the master of men's style in Laval",
} as const;

export const SIGNATURE_QUOTE = {
  fr: { quote: "Votre look, notre passion.", attribution: "Hadi, Fondateur" },
  en: { quote: "Your look, our passion.", attribution: "Hadi, Founder" },
} as const;
