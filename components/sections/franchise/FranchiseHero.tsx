"use client";

import { Globe } from "@/components/sections/franchise/Globe";

type FranchiseHeroProps = {
  locale: "fr" | "en";
};

export function FranchiseHero({ locale }: FranchiseHeroProps) {
  const isFr = locale === "fr";

  const title = isFr
    ? "Ouvrez Votre Propre Elite Barbershop"
    : "Open Your Own Elite Barbershop";

  const tagline = isFr
    ? "Luxe. Loyauté. Leadership."
    : "Luxury. Loyalty. Leadership.";

  const lead = isFr
    ? "Apportez l'expérience Elite dans votre ville."
    : "Bring the Elite experience to your city.";

  const body = isFr
    ? "Elite Barbershop est bien plus qu'une simple coupe de cheveux, c'est un style de vie. Avec un modèle d'affaires éprouvé, un branding haut de gamme et un service inégalé, vous avez aujourd'hui l'opportunité d'ouvrir votre propre Elite Barbershop et d'apporter cette excellence à votre communauté."
    : "Elite Barbershop is far more than a haircut — it's a way of life. With a proven business model, premium branding, and an unmatched standard of service, you now have the opportunity to open your own Elite Barbershop and bring this excellence to your community.";

  const journey = isFr
    ? "Commencez votre parcours en tant que franchisé dès aujourd'hui"
    : "Begin your journey as a franchisee today";

  const expansion = isFr
    ? "Expansion mondiale en cours"
    : "Worldwide expansion underway";

  return (
    <section className="franchise-grain relative min-h-screen overflow-hidden pt-[140px] md:pt-[180px] pb-24">
      {/* Decorative corner marks */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="franchise-corner top-5 left-5 border-l border-t" />
        <div className="franchise-corner top-5 right-5 border-r border-t" />
        <div className="franchise-corner bottom-5 left-5 border-l border-b" />
        <div className="franchise-corner bottom-5 right-5 border-r border-b" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-10 flex flex-col items-center text-center">
        {/* Title */}
        <h1
          className="fade-up font-soria font-normal text-[40px] leading-[1.05] md:text-[68px] md:leading-[1.02] tracking-[-0.005em] text-[#f5efe0]"
          style={{ animationDelay: "0.25s" }}
        >
          {title}
        </h1>

        {/* Hairline gold rule */}
        <div
          className="fade-up mt-7 md:mt-9 h-px w-16 bg-gradient-to-r from-transparent via-[#B68B3C] to-transparent"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Tagline (gold) */}
        <p
          className="fade-up mt-7 md:mt-8 font-cormorant italic font-light text-xl md:text-2xl gold-text-bright tracking-[0.01em]"
          style={{ animationDelay: "0.7s" }}
        >
          {tagline}
        </p>

        {/* Globe */}
        <div
          className="fade-in relative w-full flex items-center justify-center mt-10 md:mt-12"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="globe-mount globe-illuminated">
            {/* Animated illumination halo — replaces the old orange particle fog */}
            <span className="globe-aura globe-aura--inner" aria-hidden="true" />
            <span className="globe-aura globe-aura--outer" aria-hidden="true" />
            <span className="globe-ring" aria-hidden="true" />
            <Globe particles={false} />
          </div>
        </div>

        {/* Lead */}
        <p
          className="fade-up mt-10 md:mt-14 font-jost font-medium text-[16px] md:text-[18px] tracking-[-0.005em] text-[#f5efe0]"
          style={{ animationDelay: "1.15s" }}
        >
          {lead}
        </p>

        {/* Body paragraph */}
        <p
          className="fade-up mt-5 md:mt-6 max-w-2xl font-jost font-light text-[14px] md:text-[15.5px] leading-[1.85] text-[#cfc6b3]"
          style={{ animationDelay: "1.3s" }}
        >
          {body}
        </p>

        {/* Journey italic */}
        <p
          className="fade-up mt-12 md:mt-16 max-w-xl font-cormorant italic font-light text-[18px] md:text-[20px] leading-[1.5] text-[#e8e1cf]"
          style={{ animationDelay: "1.5s" }}
        >
          {journey}
        </p>

        {/* Expansion caption (gold) */}
        <div
          className="fade-up mt-5 md:mt-6 font-jost text-[11px] md:text-[12px] uppercase tracking-[0.34em] gold-text-bright"
          style={{ animationDelay: "1.65s" }}
        >
          {expansion}
        </div>
      </div>
    </section>
  );
}
