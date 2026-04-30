import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Yoga Maps — Conecta con tu práctica",
    template: "%s | Yoga Maps",
  },
  description:
    "Conectamos estudiantes con profesores de yoga. Encuentra clases, retiros y sesiones de armonización cerca de ti.",
  keywords: [
    "yoga",
    "clases de yoga",
    "profesores de yoga",
    "retiros",
    "meditación",
    "bienestar",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        {/* Soft background image overlay */}
        <div className="fixed inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
