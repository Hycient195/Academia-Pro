import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../lib/ReduxProvider";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Academia Pro - Super Admin Dashboard",
  description: "Comprehensive school management platform for administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="classic"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'classic', 'system']}
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
