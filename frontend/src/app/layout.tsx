import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "../context/AccessibilityContext"

import Navbar from '@/components/ui/Navbar'  // works because it's the default export

// Atkinson Hyperlegible was designed by the Braille Institute for low-vision
// readers: look-alike characters (I l 1, O 0, b d) are deliberately distinct.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "ELDR - Accessible Marketplace for Elders/Seniors",
  description: "An accessible online marketplace designed for older New Zealanders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={atkinson.variable}>
    <body>
      <AccessibilityProvider>
        <Navbar />
        {children}
      </AccessibilityProvider>
    </body>
    </html>
  );
}
