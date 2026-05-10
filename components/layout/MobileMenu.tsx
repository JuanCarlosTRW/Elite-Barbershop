"use client";

import { Link } from "@/i18n/navigation";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { SLOGANS } from "@/lib/constants";
import { useLocale } from "next-intl";
import {
  useBodyScrollLock,
  useEscapeClose,
  useOrientationClose,
} from "@/lib/hooks";

type MobileNavPathname =
  | "/"
  | "/services"
  | "/about"
  | "/barber-laval"
  | "/franchise"
  | "/contact";

type MobileNavHref =
  | MobileNavPathname
  | { pathname: MobileNavPathname; hash?: string };

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  navLinks: { href: MobileNavHref; label: string }[];
};

export function MobileMenu({ open, onClose, navLinks }: MobileMenuProps) {
  const locale = useLocale();

  useBodyScrollLock(open);
  useEscapeClose(open, onClose);
  useOrientationClose(open, onClose);

  return (
    <>
      {/* Black overlay (covers everything) */}
      <div
        aria-hidden
        className={`menu-overlay fixed inset-0 z-[9998] bg-black transition-opacity duration-[400ms] ease-[var(--ease-snappy)] ${
          open ? "opacity-[0.95] pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Fullscreen menu — opacity-only fade-in */}
      <nav
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`elite-mobile-menu fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center transition-opacity duration-[450ms] ease-out ${
          open ? "active opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          height: "100dvh",
          background: "linear-gradient(to bottom right, #000000, #111111)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          willChange: "opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      >
        {/* Close ✕ button */}
        <button
          type="button"
          id="close-menu"
          aria-label="Fermer le menu"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-7 right-7 text-[32px] leading-none bg-transparent border-0 cursor-pointer transition-[color,transform] duration-300"
          style={{
            color: "#FFD700",
            zIndex: 99999999,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-gold-400)";
            e.currentTarget.style.transform = "scale(1.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ✕
        </button>

        {/* Eyebrow slogan */}
        <span
          className="absolute top-10 left-1/2 -translate-x-1/2 text-[11px] uppercase"
          style={{
            color: "var(--color-gold-300)",
            fontFamily: "var(--font-body), system-ui, sans-serif",
            letterSpacing: "var(--tracking-editorial)",
            fontWeight: 500,
          }}
        >
          {SLOGANS[locale as "fr" | "en"]}
        </span>

        {/* Nav links — Cormorant, large, centered, gold hover */}
        <ul className="flex flex-col items-center gap-0 m-0 p-0 list-none">
          {navLinks.map(({ href, label }, idx) => {
            const isLast = idx === navLinks.length - 1;
            const key =
              typeof href === "string"
                ? href
                : `${href.pathname}#${href.hash ?? ""}`;
            return (
              <li key={key} className="my-7">
                <Link
                  href={href}
                  onClick={onClose}
                  className={`menu-link inline-block text-white no-underline transition-all duration-300 hover:-translate-y-0.5 ${
                    isLast ? "text-[1.9rem] uppercase" : "text-[2rem]"
                  }`}
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    fontWeight: 600,
                    letterSpacing: isLast ? "0.1em" : "0.04em",
                    color: isLast ? "var(--color-gold-400)" : "#fff",
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Minimal footer cluster — only the language switcher */}
        <div className="absolute bottom-10 inset-x-0 px-8 flex items-center justify-center">
          <LangSwitcher />
        </div>
      </nav>
    </>
  );
}

