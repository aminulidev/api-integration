import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AuraStore | Premium CRUD Dashboard",
  description: "A state-of-the-art inventory management dashboard built with Next.js 15, Shadcn UI, TanStack Query v5, Zustand, and nuqs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} antialiased font-sans`}
    >
      <body className="flex flex-col bg-slate-50/50 text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-600">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
