"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { BookingCTA } from "@/components/ui/BookingCTA";
import { ASSETS } from "@/lib/constants";

export function Hero() {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const fallback = fallbackRef.current;
    if (!video) return;

    const reveal = () => {
      video.style.opacity = "1";
      if (fallback) fallback.style.opacity = "0";
    };

    const tryPlay = async () => {
      try {
        await video.play();
        reveal();
      } catch {
        // Autoplay blocked — fallback GIF stays visible.
      }
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener("canplaythrough", tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplaythrough", tryPlay);
    };
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative w-full h-screen h-dvh min-h-[640px] flex flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Video / fallback layer */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={fallbackRef}
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-[600ms]"
          style={{
            backgroundImage: `url(${ASSETS.heroFallbackGif})`,
            opacity: 1,
          }}
          aria-hidden
        />
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover anim-slow-zoom transition-opacity duration-[600ms]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          style={{ opacity: 0 }}
        >
          <source src={ASSETS.heroVideoMp4} type="video/mp4" />
        </video>
      </div>

      {/* Content stack — overlays removed: video plays natural with no tint */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl">
        <div className="anim-logo-fade-in flex flex-col items-center">
          <Image
            src={ASSETS.logoPng}
            alt="Elite Barbershop"
            width={420}
            height={420}
            priority
            unoptimized
            sizes="(max-width: 768px) 80vw, 420px"
            className="select-none"
            style={{ width: "80vw", maxWidth: "420px", height: "auto" }}
          />
        </div>

        <h1
          className="font-soria text-white anim-fade-in-up mt-6 text-4xl md:text-5xl lg:text-[3.4rem]"
          style={{
            fontWeight: 400,
            letterSpacing: "-0.005em",
            lineHeight: 1.08,
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          {t("hero.title")}
        </h1>

        <p
          className="anim-fade-in-up-delay-1 mt-4 text-[color:var(--color-ink-secondary)] uppercase text-sm md:text-base"
          style={{
            fontFamily: "var(--font-body), system-ui, sans-serif",
            letterSpacing: "var(--tracking-editorial)",
            fontWeight: 300,
            textShadow: "0 0 14px rgba(0,0,0,0.5)",
          }}
        >
          {t("hero.slogan")}
        </p>

        <div className="anim-fade-in-buttons mt-10 flex flex-wrap items-center justify-center gap-4">
          <BookingCTA variant="pill" size="md">
            {t("nav.book")}
          </BookingCTA>
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#below-hero"
        aria-label={t("hero.scrollHint")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-[color:var(--color-gold-300)] hover:text-[color:var(--color-gold-50)] transition-colors duration-300"
        style={{
          animation: "fadeInUp 1.5s ease-out 1.6s forwards",
          opacity: 0,
        }}
      >
        <span
          className="block animate-pulse"
          style={{ animationDuration: "2.6s" }}
        >
          <ChevronDown size={28} strokeWidth={1.25} />
        </span>
      </a>
    </section>
  );
}
