import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ApolloWrapper } from "@/components/apollo-wrapper";
import { Toaster } from "sonner";
import "./globals.css";
import "./marketplace.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriMarket — Bloomverd",
  description: "Trade crop trends, buy farms, fund harvests and hold crop-backed coins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${hanken.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ApolloWrapper>
            <div className="v2-root">
              {children}
            </div>
            <Toaster richColors position="bottom-right" />
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
