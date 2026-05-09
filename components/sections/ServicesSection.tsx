"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/constants";
import {
  ICONS,
  type IconName,
  ArrowIcon,
  CheckIcon,
} from "@/components/sections/services/Icons";

import "@/components/sections/services/styles.css";
import "@/components/sections/services/services-base.css";
import "@/components/sections/services/services-v2.css";

// ─────────────────────────────────────────────────────────────────────
// Data — Elite Barbershop services (verbatim from design handoff)
// ─────────────────────────────────────────────────────────────────────

type Service = {
  id: string;
  num: string;
  title: string;
  icon: IconName;
  copy: string;
  feats: string[];
  price: number;
  star?: boolean;
  drink?: boolean;
};

const ESSENTIAL_SERVICES: Service[] = [
  {
    id: "coupe-adulte",
    num: "01",
    title: "Coupe Adulte",
    icon: "scissors",
    copy: "Coupe façonnée avec expertise. Un style qui dure toute la semaine.",
    feats: ["Consultation de style", "Coupe ciseaux + tondeuse", "Fini lavage et coiffage"],
    price: 40,
    star: true,
    drink: true,
  },
  {
    id: "coupe-barbe",
    num: "02",
    title: "Coupe + Barbe",
    icon: "razor",
    copy:
      "La transformation complète. Coupe précise, barbe tracée au rasoir, finition impeccable.",
    feats: ["Coupe complète", "Barbe tracée au rasoir", "Cire de finition"],
    price: 50,
    drink: true,
  },
  {
    id: "coupe-enfant",
    num: "03",
    title: "Coupe Enfant",
    icon: "child",
    copy: "Coupe adaptée aux jeunes. Rapide, confortable, professionnel.",
    feats: ["12 ans et moins", "Approche patiente", "Style sur mesure"],
    price: 30,
    drink: true,
  },
  {
    id: "tour-oreille",
    num: "04",
    title: "Tour d'Oreille",
    icon: "ear",
    copy: "Le détail qui change tout. Contours nets et précis entre les coupes.",
    feats: ["Contours rasoir", "Nuque + tempes", "Finition rapide"],
    price: 20,
    drink: true,
  },
];

const COMBO_SERVICE: Service = {
  id: "barbe-oreille",
  num: "05",
  title: "Barbe & Tour d'Oreille",
  icon: "beard",
  copy:
    "Finition totale. Barbe tracée au rasoir et contours nets pour un look complet.",
  feats: [
    "Boisson offerte",
    "Tour d'oreille",
    "Barbe avec tracé au rasoir",
    "Cire de finition",
  ],
  price: 25,
  drink: true,
};

const VIP_INCLUSIONS = [
  "Consultation privée 15 min",
  "Coupe complète sur mesure",
  "Barbe tracée au rasoir",
  "Soin chaud serviette",
  "Boisson premium incluse",
];

// ─────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────

function Price({ amount }: { amount: number }) {
  return (
    <span className="price">
      <span className="price-currency">$</span>
      <span className="price-amount">{amount}</span>
      <span className="price-suffix">CAD</span>
    </span>
  );
}

function BookButton({
  children,
  className = "btn-book",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("services");
  return (
    <a
      href={BUSINESS.booking.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children ?? (
        <>
          {t("book")} <ArrowIcon />
        </>
      )}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Reveal-on-scroll (IntersectionObserver, 12% threshold)
// ─────────────────────────────────────────────────────────────────────

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section";
  className?: string;
  style?: React.CSSProperties;
};

function Reveal({
  children,
  delay = 0,
  as = "div",
  className = "",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Service Card
// ─────────────────────────────────────────────────────────────────────

function ServiceCard({ s, idx }: { s: Service; idx: number }) {
  const Icon = ICONS[s.icon];
  const t = useTranslations("services");
  return (
    <Reveal delay={idx * 100} className={`card ${s.star ? "card--star" : ""}`}>
      <span className="card-num-watermark" aria-hidden="true">{s.num}</span>
      {s.star && (
        <span className="badge-popular">
          <span className="star">★</span>
          {t("popular")}
        </span>
      )}
      <span className="card-num">{s.num}</span>
      {s.drink && (
        <span className="badge-drink" title={t("drink")}>
          <span>{t("drink")}</span>
        </span>
      )}
      <div className="card-icon">
        <Icon />
      </div>
      <h3 className="card-title">{s.title}</h3>
      <p className="card-copy">{s.copy}</p>
      <ul className="card-feats">
        {s.feats.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="card-foot">
        <Price amount={s.price} />
        <BookButton />
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────
// VIP Spotlight Hero
// ─────────────────────────────────────────────────────────────────────

function VipSpotlight({
  spotlightRef,
}: {
  spotlightRef: React.RefObject<HTMLElement | null>;
}) {
  const Crown = ICONS.crown;
  return (
    <section className="spotlight" ref={spotlightRef}>
      <span className="spotlight-eyebrow">
        <span className="rule"></span>
        Tier II · Premium
        <span className="rule"></span>
      </span>

      <article className="vip-hero">
        <span className="corner tl"></span>
        <span className="corner tr"></span>
        <span className="corner bl"></span>
        <span className="corner br"></span>

        <span className="vip-hero-badge">
          <span className="dot"></span>
          Disponibilité limitée
        </span>

        <div className="vip-hero-crown">
          <Crown />
        </div>

        <h2 className="vip-hero-title">
          L&apos;expérience <em>VIP</em>
        </h2>
        <p className="vip-hero-copy">
          L&apos;expérience ultime. Consultation personnalisée, transformation totale,
          expertise exclusive. Pour ceux qui veulent le meilleur.
        </p>

        <ul className="vip-hero-incl">
          {VIP_INCLUSIONS.map((item) => (
            <li key={item}>
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="vip-hero-price">
          <span className="price-currency">$</span>
          <span className="price-amount">100</span>
        </div>
        <div className="vip-hero-duration">/ 75 minutes</div>
        <div className="vip-hero-compare">
          <span className="vip-rule"></span>
          <em>
            Standard&nbsp;: 50&nbsp;$ / 45&nbsp;min · VIP&nbsp;: 1&nbsp;h&nbsp;15
            d&apos;attention dédiée
          </em>
          <span className="vip-rule"></span>
        </div>

        <BookButton className="btn-vip-hero">
          <>Réserver le VIP <ArrowIcon /></>
        </BookButton>

        <div className="vip-hero-foot">
          Sur réservation · <span>Maximum 4 par semaine</span>
        </div>
      </article>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// After-Hours
// ─────────────────────────────────────────────────────────────────────

function AfterHours() {
  const Moon = ICONS.moon;
  return (
    <Reveal as="section" className="after-grid">
      <div className="card after">
        <div>
          <span className="after-tag">Sur demande</span>
          <div className="card-icon">
            <Moon />
          </div>
        </div>
        <div>
          <h3 className="after-title">Service après fermeture</h3>
          <p className="after-copy">
            Pour la dernière minute ou une préférence privée. Disponibilité exclusive
            certains soirs. Appelez pour réserver.
          </p>
          <p className="after-availability">
            <span className="avail-dot" aria-hidden="true"></span>
            Habituellement&nbsp;<strong>21h–23h</strong>, du mardi au samedi · réservation 24&nbsp;h à
            l&apos;avance.
          </p>
        </div>
        <div className="after-foot">
          <a href={BUSINESS.phone.href} className="after-phone">
            <span className="lbl">Appeler</span>
            {BUSINESS.phone.display}
          </a>
          <BookButton />
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Welcome Banner — first-visit 15% offer
// ─────────────────────────────────────────────────────────────────────

function WelcomeBanner() {
  return (
    <Reveal as="section" className="welcome welcome-v2">
      <span className="corner tl"></span>
      <span className="corner tr"></span>
      <span className="corner bl"></span>
      <span className="corner br"></span>

      <div className="welcome-v2-discount">
        <span className="welcome-v2-pct">15</span>
        <span className="welcome-v2-pct-sym">%</span>
        <span className="welcome-v2-pct-lbl">de rabais</span>
      </div>

      <div className="welcome-v2-body">
        <span className="welcome-v2-tag">
          <span className="dot"></span>
          Nouvelle clientèle · Welcome offer
        </span>
        <h2 className="welcome-v2-title">
          Première visite ?<br />
          <em>Bienvenue chez nous.</em>
        </h2>
        <p className="welcome-v2-copy">
          Consultation complète pour comprendre votre style et type de cheveux,
          plus 15&nbsp;% de rabais sur votre première coupe. Découvrez pourquoi
          les clients reviennent.
        </p>
        <ul className="welcome-v2-incl">
          <li>
            <CheckIcon />
            <span>Consultation de style personnalisée</span>
          </li>
          <li>
            <CheckIcon />
            <span>Analyse cheveux et visage</span>
          </li>
          <li>
            <CheckIcon />
            <span>15&nbsp;% automatique au paiement</span>
          </li>
        </ul>
      </div>

      <div className="welcome-v2-cta">
        <BookButton className="btn-vip-hero">
          <>Réserver ma première visite <ArrowIcon /></>
        </BookButton>
        <a href={BUSINESS.phone.href} className="welcome-v2-phone">
          <span className="lbl">Ou appelez</span>
          {BUSINESS.phone.display}
        </a>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────────

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLElement>(null);
  const [vipActive, setVipActive] = useState(false);
  const t = useTranslations("services");

  // VIP active when 40%+ of spotlight is in view
  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setVipActive(entry.isIntersecting && entry.intersectionRatio >= 0.4),
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-play card icon animations every 3s — adds .auto-play for ~900ms per
  // tick, with a small per-card stagger so they don't all fire in unison.
  // Pauses when the user hovers a card and respects prefers-reduced-motion.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const PERIOD = 3000;
    const HOLD = 900;
    const STAGGER = 140;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".card")
    );
    if (!cards.length) return;

    const timeouts: number[] = [];
    const tick = () => {
      cards.forEach((card, i) => {
        const t1 = window.setTimeout(() => {
          if (!card.matches(":hover")) card.classList.add("auto-play");
        }, i * STAGGER);
        const t2 = window.setTimeout(() => {
          card.classList.remove("auto-play");
        }, i * STAGGER + HOLD);
        timeouts.push(t1, t2);
      });
    };

    // Kick off shortly after mount, then every PERIOD.
    const startDelay = window.setTimeout(tick, 700);
    const id = window.setInterval(tick, PERIOD);

    return () => {
      window.clearTimeout(startDelay);
      window.clearInterval(id);
      timeouts.forEach((t) => window.clearTimeout(t));
      cards.forEach((c) => c.classList.remove("auto-play"));
    };
  }, []);

  return (
    <div
      id="services"
      className={`elite-services-root ${vipActive ? "vip-active" : ""}`}
      data-screen-label="Services Section v2"
    >
      <main
        ref={sectionRef}
        className={`section section-v2 theme-gold ${
          vipActive ? "vip-active" : ""
        }`}
      >
        {/* Section header — dimmable */}
        <header className="s-head s-head--minimal dimmable">
          <Reveal>
            <span className="s-eyebrow">{t("eyebrow")}</span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="s-title">{t("title")}</h1>
          </Reveal>
        </header>

        {/* Tier I — essentiels */}
        <div className="dimmable">
          <Reveal>
            <div className="tier-row">
              <span className="tier-num">I</span>
              <span>{t("tier1")}</span>
              <span className="tier-line"></span>
              <span>{t("tier1Count")}</span>
            </div>
          </Reveal>

          <div className="core-grid">
            {ESSENTIAL_SERVICES.map((s, i) => (
              <ServiceCard key={s.id} s={s} idx={i} />
            ))}
          </div>

          <Reveal>
            <div className="combo-divider">
              <span className="rule"></span>
              <span className="combo-divider-label">{t("comboLabel")}</span>
              <span className="rule"></span>
            </div>
          </Reveal>
          <div className="combo-grid">
            <ServiceCard s={COMBO_SERVICE} idx={0} />
          </div>
        </div>

        {/* Tier II — VIP Spotlight (NOT dimmable) */}
        <VipSpotlight spotlightRef={spotlightRef} />

        {/* Tier III & IV — dimmable */}
        <div className="dimmable">
          <Reveal>
            <div className="tier-row">
              <span className="tier-num">III</span>
              <span>{t("tier3")}</span>
              <span className="tier-line"></span>
              <span>{t("tier3Note")}</span>
            </div>
          </Reveal>
          <AfterHours />

          <Reveal>
            <div className="tier-row" style={{ marginTop: "72px" }}>
              <span className="tier-num">IV</span>
              <span>{t("tier4")}</span>
              <span className="tier-line"></span>
              <span>{t("tier4Note")}</span>
            </div>
          </Reveal>
          <WelcomeBanner />
        </div>
      </main>
    </div>
  );
}
