import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Credit-weighted GPA and CGPA calculator and academic record tracker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans text-navy-900 antialiased">{children}</body>
    </html>
  );
}
