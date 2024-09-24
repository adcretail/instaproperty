import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SubNavbar from './components/SubNavbar';
import SessionProvider from './SessionProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InstaProperty - India's Leading Real Estate Platform for Buying, Selling, and Renting",
  description: "InstaProperty is India's leading real estate platform that offers a completely free marketplace for buying, selling, and renting properties. Connect property owners directly with buyers and renters without any commissions or middlemen. Find the best deals on homes, apartments, commercial properties, and plots across India.",
  
  // Adding more meta tags for SEO
  keywords: "real estate, buy property, rent property, sell property, India real estate, property marketplace, free real estate platform, commercial properties, plots for sale, apartments, homes, rent without broker, sell property without commission",
  
  // Open Graph meta tags for better sharing on social media
  openGraph: {
    type: "website",
    url: "https://www.instaproperty.org",
    title: "InstaProperty - India's Leading Free Real Estate Marketplace",
    description: "InstaProperty allows property owners to connect directly with buyers and renters across India. No commissions, no middlemen—just the best deals on properties.",
    images: [
      {
        url: "https://www.instaproperty.org/public/banner.jpg",
        width: 1200,
        height: 630,
        alt: "InstaProperty Banner - Best Real Estate Marketplace in India",
      }
    ],
    siteName: "InstaProperty",
  },

  // Canonical URL for SEO optimization
  alternates: {
    canonical: "https://www.instaproperty.org",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for SEO */}
        <meta name="author" content="InstaProperty Team" />
        <meta name="robots" content="index, follow" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#0d6efd" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          <SubNavbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
