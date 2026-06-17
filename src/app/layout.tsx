import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/ui/theme-provider";
import ReactQueryProvider from "../providers/react-query-provider";
import { SerwistProvider } from "./serwist";
import { StatusThemeScript } from "../components/status-theme-script";
import { ThemeColorSync } from "../components/status-theme-color-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const APP_NAME = "T1 classes";
const APP_DEFAULT_TITLE = "T1 classes";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";
export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  initialScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0a" />

        <StatusThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
      >
        <ReactQueryProvider>
          <NextTopLoader showSpinner={false} />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <ThemeColorSync />
            <SerwistProvider swUrl="/serwist/sw.js">
              <div className="min-h-dvh px-safe pb-safe pt-safe">
                {children}
              </div>
            </SerwistProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster position="top-right" richColors visibleToasts={5} />
      </body>
    </html>
  );
}
