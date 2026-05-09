import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Soria — premium display face used on the largest editorial headlines
const soria = localFont({
  src: "../../public/fonts/soria-font.ttf",
  variable: "--font-soria",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    default: "Elite Barbershop · Laval",
    template: "%s · Elite Barbershop",
  },
  description: "Luxe. Loyauté. Leadership. Le barbier de référence à Laval.",
  metadataBase: new URL("https://elitebyhadi.com"),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${spaceGrotesk.variable} ${soria.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[color:var(--color-surface-1)]">
        <NextIntlClientProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <ConditionalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
