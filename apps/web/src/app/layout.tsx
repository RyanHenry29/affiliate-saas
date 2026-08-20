import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AffiliateOS — Automação de marketing de afiliados",
    template: "%s | AffiliateOS",
  },
  description:
    "Painel operacional para grupos de achadinhos: captura de ofertas via APIs oficiais, segmentação por nicho e disparo automático para WhatsApp e Telegram.",
  keywords: ["afiliados", "marketing", "automação", "whatsapp", "telegram", "ofertas", "achadinhos", "shopee", "amazon", "aliexpress"],
  authors: [{ name: "AffiliateOS" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AffiliateOS",
    title: "AffiliateOS — Automação de marketing de afiliados",
    description: "Painel operacional para grupos de achadinhos: captura de ofertas via APIs oficiais, segmentação por nicho e disparo automático para WhatsApp e Telegram.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AffiliateOS - Painel operacional para afiliados",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AffiliateOS — Automação de marketing de afiliados",
    description: "Painel operacional para grupos de achadinhos: captura de ofertas via APIs oficiais, segmentação por nicho e disparo automático para WhatsApp e Telegram.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
