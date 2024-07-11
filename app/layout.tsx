import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import SubNavbar from './components/SubNavbar';
import SessionProvider from './SessionProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InstaCommerce",
  description: "Ecommerce MarketPlace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
