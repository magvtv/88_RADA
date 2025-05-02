import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { ThemeProvider } from "@/components/ui/theme-provider";
// import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RADA",
  description: "Resilient Action for Disaster Awareness",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
