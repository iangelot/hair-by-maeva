import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StoreProvider } from "@/context/StoreContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hair By Maeva | Luxury Hairstylist Based in Chicago, IL",
  description:
    "Official Booking Site for Hair By Maeva — Luxury hairstylist based in Chicago, IL. Knotless braids, French curls, twists, and protective hairstyles.",
  openGraph: {
    title: "Hair By Maeva | Luxury Hairstylist Based in Chicago, IL",
    description: "Official Booking Site for Hair By Maeva — Chicago, IL",
    siteName: "Hair By Maeva",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <StoreProvider>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
