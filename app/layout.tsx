import type { Metadata } from "next";
import { Cormorant_Garamond, IM_Fell_English, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const imFellEnglish = IM_Fell_English({
  variable: "--font-im-fell-english",
  subsets: ["latin"],
  weight: "400",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Parleen Kaur",
  description: "Parleen Kaur - Hero and About experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${imFellEnglish.variable} ${cormorantGaramond.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
