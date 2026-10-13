import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://veylonetworks2026.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Veylo Networks | Connect. Build. Grow.",
  description:
    "Join Veylo Networks. Connect with entrepreneurs, build your professional network, message members, follow businesses and explore global business news.",
  applicationName: "Veylo Networks",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Veylo Networks",
    title: "Veylo Networks | Connect. Build. Grow.",
    description:
      "One network. Endless connections. Create a free Veylo account to connect, collaborate and grow.",
    locale: "en_IE",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Official Veylo Networks logo — Connect. Build. Grow.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veylo Networks | Connect. Build. Grow.",
    description: "Connect with people. Build your professional network. Grow.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "192x192" }],
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
