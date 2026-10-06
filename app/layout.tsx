import "./globals.css";

export const metadata = {
  title: "Veylo Networks",
  description: "Connect. Build. Grow.",
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