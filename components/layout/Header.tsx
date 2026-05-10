"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useSmoothHashScroll } from "@/lib/hooks";
import { ASSETS, BUSINESS } from "@/lib/constants";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Anchor #hash interception with 80px offset
  useSmoothHashScroll(80);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 10));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Smart logo click — already on home → smooth-scroll to top
  const onLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    {
      href: { pathname: "/" as const, hash: "services" },
      label: t("services"),
    },
    { href: "/about" as const, label: t("about") },
    { href: "/franchise" as const, label: t("franchise") },
  ];

  return (
    <>
      <header
        className={`elite-header-minimal fixed top-0 left-0 w-full z-[9999] transition-[background-color,backdrop-filter,box-shadow] duration-400 ease-[var(--ease-snappy)] ${
          scrolled
            ? "scrolled bg-black/[0.92] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
        style={{ padding: "32px 28px" }}
      >
        <div className="elite-header-inner logo-centered relative w-full flex items-center justify-between">
          {/* Burger LEFT (3 horizontal bars) */}
          <button
            type="button"
            id="burger"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="burger-btn flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-2 -ml-2 z-[10001]"
          >
            <span className="block w-7 h-[3px] bg-white rounded-sm transition-transform duration-300" />
            <span className="block w-7 h-[3px] bg-white rounded-sm transition-opacity duration-300" />
            <span className="block w-7 h-[3px] bg-white rounded-sm transition-transform duration-300" />
          </button>

          {/* Logo absolute center — hidden default, fades in on scroll */}
          <div className="logo-container absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] flex items-center justify-center">
            <Link
              href="/"
              id="logo-link"
              onClick={onLogoClick}
              aria-label="Elite Barbershop"
              className="pointer-events-auto inline-flex"
            >
              <Image
                src={ASSETS.logoPng}
                alt="Elite Barbershop"
                width={180}
                height={180}
                priority
                unoptimized
                className={`header-logo logo-img select-none transition-[opacity,transform] duration-[400ms] ease-[var(--ease-snappy)] w-[110px] h-[110px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] ${
                  scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
                style={{
                  filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))",
                }}
              />
            </Link>
          </div>

          {/* Phone link — absolute top-right, text+icon desktop / icon-only mobile */}
          <a
            href={BUSINESS.phone.href}
            aria-label={`Appeler Elite Barbershop by Hadi au ${BUSINESS.phone.display}`}
            className="header-phone absolute top-[26px] right-[28px] z-[10002] inline-flex items-center gap-2.5 font-semibold no-underline text-[color:var(--color-gold-400)] hover:text-[color:var(--color-gold-200)] hover:-translate-y-px transition-[opacity,transform,color] duration-200"
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            <svg
              className="icon-phone w-[22px] h-[22px] sm:w-[22px] sm:h-[22px] max-sm:w-[26px] max-sm:h-[26px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 1h2a2 2 0 0 1 2 1.72 c.14 1.06.38 2.09.72 3.09a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l2-1.34a2 2 0 0 1 2.11-.11 c1 .34 2.03.58 3.09.72A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="phone-text hidden sm:inline">
              {BUSINESS.phone.display}
            </span>
          </a>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        navLinks={navLinks}
      />
    </>
  );
}
