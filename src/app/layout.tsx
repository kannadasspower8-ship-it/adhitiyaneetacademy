import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import RootLayoutClient from "./RootLayoutClient";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adhithya NEET Academy | Premium NEET Coaching in Erode",
  description: "Secure your MBBS seat with Adhithya NEET Academy in Erode. Elite weekend programs, repeater batches, crash courses, and comprehensive test series with expert guidance.",
  metadataBase: new URL("https://adhityaneetacademy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Adhithya NEET Academy | Premium NEET Coaching in Erode",
    description: "Secure your MBBS seat with Adhithya NEET Academy. Weekend programs, repeater batches, test batches, and crash courses with expert faculty and proven results.",
    url: "https://adhityaneetacademy.com",
    siteName: "Adhithya NEET Academy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adhithya NEET Academy Erode Campus Logo and Branding Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adhithya NEET Academy | Premium NEET Coaching in Erode",
    description: "Elite weekend programs, repeater batches, crash courses, and comprehensive test series with expert guidance.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth font-sans">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
