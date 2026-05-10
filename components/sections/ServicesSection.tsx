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
  /** Translation key under services.cards.* */
  id: "coupeAdulte" | "coupeBarbe" | "coupeEnfant" | "tourOreille" | "comboCard";
  num: string;
  icon: IconName;
  /** Number of feature bullets to render (matches f1..fN keys) */
  featCount: 3 | 4;
  price: number;
  star?: boolean;
  drink?: boolean;
};

const ESSENTIAL_SERVICES: Service[] = [
  { id: "coupeAdulte", num: "01", icon: "scissors", featCount: 3, price: 40, star: true, drink: true },
  { id: "coupeBarbe",  num: "02", icon: "razor",    featCount: 3, price: 50, drink: true },
  { id: "coupeEnfant", num: "03", icon: "child",    featCount: 3, price: 30, drink: true },
  { id: "tourOreille", num: "04", icon: "ear",      featCount: 3, price: 20, drink: true },
];

const COMBO_SERVICE: Service = {
  id: "comboCard",
  num: "05",
  icon: "beard",
  featCount: 4,
  price: 25,
  drink: true,
};

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
  const featKeys = Array.from({ length: s.featCount }, (_, i) => `f${i + 1}`);
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
      <h3 className="card-title">{t(`cards.${s.id}.title`)}</h3>
      <p className="card-copy">{t(`cards.${s.id}.copy`)}</p>
      <ul className="card-feats">
        {featKeys.map((k) => (
          <li key={k}>{t(`cards.${s.id}.${k}`)}</li>
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
  const t = useTranslations("services.vip");
  // titleTrail is optional (EN: "The VIP experience"; FR has just two parts)
  const titleTrail = t("titleTrail");
  return (
    <section className="spotlight" ref={spotlightRef}>
      <span className="spotlight-eyebrow">
        <span className="rule"></span>
        {t("tier")}
        <span className="rule"></span>
      </span>

      <article className="vip-hero">
        <span className="corner tl"></span>
        <span className="corner tr"></span>
        <span className="corner bl"></span>
        <span className="corner br"></span>

        <span className="vip-hero-badge">
          <span className="dot"></span>
          {t("badge")}
        </span>

        <div className="vip-hero-crown">
          <Crown />
        </div>

        <h2 className="vip-hero-title">
          {t("titleLead")} <em>{t("titleAccent")}</em>
          {titleTrail ? ` ${titleTrail}` : ""}
        </h2>
        <p className="vip-hero-copy">{t("copy")}</p>

        <ul className="vip-hero-incl">
          {(["incl1", "incl2", "incl3", "incl4", "incl5"] as const).map((k) => (
            <li key={k}>
              <CheckIcon />
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>

        <div className="vip-hero-price">
          <span className="price-currency">$</span>
          <span className="price-amount">100</span>
        </div>
        <div className="vip-hero-duration">{t("duration")}</div>
        <div className="vip-hero-compare">
          <span className="vip-rule"></span>
          <em>{t("compare")}</em>
          <span className="vip-rule"></span>
        </div>

        <BookButton className="btn-vip-hero">
          <>{t("cta")} <ArrowIcon /></>
        </BookButton>

        <div className="vip-hero-foot">
          {t("footPrefix")} · <span>{t("footHighlight")}</span>
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
  const t = useTranslations("services.after");
  return (
    <Reveal as="section" className="after-grid">
      <div className="card after">
        <div>
          <span className="after-tag">{t("tag")}</span>
          <div className="card-icon">
            <Moon />
          </div>
        </div>
        <div>
          <h3 className="after-title">{t("title")}</h3>
          <p className="after-copy">{t("copy")}</p>
          <p className="after-availability">
            <span className="avail-dot" aria-hidden="true"></span>
            {t("availability")}&nbsp;<strong>{t("availabilityHours")}</strong>,{" "}
            {t("availabilitySuffix")}
          </p>
        </div>
        <div className="after-foot">
          <a href={BUSINESS.phone.href} className="after-phone">
            <span className="lbl">{t("callLbl")}</span>
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
  const t = useTranslations("services.welcome");
  return (
    <Reveal as="section" className="welcome welcome-v2">
      <span className="corner tl"></span>
      <span className="corner tr"></span>
      <span className="corner bl"></span>
      <span className="corner br"></span>

      <div className="welcome-v2-discount" aria-label={`15% ${t("discountLabel")}`}>
        <div className="welcome-v2-pct-row">
          <span className="welcome-v2-pct">15</span>
          <span className="welcome-v2-pct-sym">%</span>
        </div>
        <span className="welcome-v2-pct-lbl">{t("discountLabel")}</span>
      </div>

      <div className="welcome-v2-body">
        <span className="welcome-v2-tag">
          <span className="dot"></span>
          {t("tag")}
        </span>
        <h2 className="welcome-v2-title">
          {t("titleLead")}
          <br />
          <em>{t("titleAccent")}</em>
        </h2>
        <p className="welcome-v2-copy">{t("copy")}</p>
        <ul className="welcome-v2-incl">
          {(["incl1", "incl2", "incl3"] as const).map((k) => (
            <li key={k}>
              <CheckIcon />
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="welcome-v2-cta">
        <BookButton className="btn-vip-hero">
          <>{t("cta")} <ArrowIcon /></>
        </BookButton>
        <a href={BUSINESS.phone.href} className="welcome-v2-phone">
          <span className="lbl">{t("callOr")}</span>
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
