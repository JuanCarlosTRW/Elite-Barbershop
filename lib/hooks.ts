"use client";

import { useEffect, useRef } from "react";

const TOUCH_REGEX = /iPhone|iPad|iPod|Android/i;

/**
 * Body scroll lock with desktop / touch differentiation.
 *
 * Desktop: position:fixed + saved scrollY + scrollbar-width compensation
 *   (avoids scrollbar disappearance jump and reflow).
 * Touch:  overflow:hidden on html + body
 *   (avoids iOS Safari rubber-band jump caused by position:fixed).
 *
 * Mirrors the existing brand site implementation.
 */
export function useBodyScrollLock(locked: boolean) {
  const savedYRef = useRef(0);
  const savedPadRef = useRef("");
  const wasLockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const docEl = document.documentElement;
    const body = document.body;
    const isTouch = TOUCH_REGEX.test(navigator.userAgent);

    if (locked && !wasLockedRef.current) {
      savedYRef.current = window.pageYOffset || 0;
      savedPadRef.current = getComputedStyle(body).paddingRight;

      if (!isTouch) {
        const scrollbarWidth = window.innerWidth - docEl.clientWidth;
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `calc(${savedPadRef.current} + ${scrollbarWidth}px)`;
        }
        body.style.position = "fixed";
        body.style.top = `-${savedYRef.current}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
      } else {
        docEl.style.overflow = "hidden";
        body.style.overflow = "hidden";
      }

      body.classList.add("menu-open");
      wasLockedRef.current = true;
    } else if (!locked && wasLockedRef.current) {
      const wasIsTouch = TOUCH_REGEX.test(navigator.userAgent);

      docEl.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = savedPadRef.current || "";
      body.classList.remove("menu-open");

      if (!wasIsTouch) {
        // Instant — prevents `scroll-behavior:smooth` from animating a long restore
        window.scrollTo({ top: savedYRef.current || 0, behavior: "instant" });
      }

      wasLockedRef.current = false;
    }
  }, [locked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!wasLockedRef.current) return;
      const docEl = document.documentElement;
      const body = document.body;
      docEl.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = savedPadRef.current || "";
      body.classList.remove("menu-open");
    };
  }, []);
}

/**
 * Intercept anchor clicks (#hash, /#hash) and smooth-scroll with header offset.
 * Also handles initial-load #hash with a 300ms delay (lets layout settle).
 */
export function useSmoothHashScroll(offset = 80) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onClick = (e: MouseEvent) => {
      // Find anchor in click path
      const path = e.composedPath ? e.composedPath() : [];
      const anchor = (path.find(
        (el) => (el as HTMLElement).tagName === "A"
      ) as HTMLAnchorElement | undefined) ??
        (e.target as HTMLElement).closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Native CSS handles same-page hash scrolling (scroll-behavior: smooth
      // on <html> + per-target scroll-margin-top in globals.css), so we only
      // need to handle bare "#hash" / "/#hash" links that browsers wouldn't
      // otherwise pick up via a normal Link navigation.
      const isHash = href.startsWith("#") || href.startsWith("/#");
      if (!isHash) return;

      const cleanHref = href.replace("/#", "#");
      const target = document.querySelector(cleanHref);
      if (!target) return;

      e.preventDefault();
      const y =
        (target as HTMLElement).getBoundingClientRect().top +
        window.pageYOffset -
        offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [offset]);

  // Initial hash on page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const t = setTimeout(() => {
      const target = document.querySelector(hash);
      if (!target) return;
      const y =
        (target as HTMLElement).getBoundingClientRect().top +
        window.pageYOffset -
        offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 300);
    return () => clearTimeout(t);
  }, [offset]);
}

/** Close menu on ESC key while open. */
export function useEscapeClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
}

/** Close menu on viewport orientation change. */
export function useOrientationClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onOrient = () => onClose();
    window.addEventListener("orientationchange", onOrient);
    return () => window.removeEventListener("orientationchange", onOrient);
  }, [isOpen, onClose]);
}
