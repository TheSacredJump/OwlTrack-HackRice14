import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans } from '@next/font/google'
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const ibm = IBM_Plex_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700'], // Specify the weights you need
  subsets: ['latin'],     // Specify the subsets you need
  display: 'swap',        // Improves performance
});

export const metadata: Metadata = {
  title: "OwlTrack - Ensure your Future",
  description: "AI-Powered course planner for your academic journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${ibm.className} bg-navy text-milk antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
