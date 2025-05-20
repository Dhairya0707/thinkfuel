import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./authcontext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThinkFuel",
  description: "The Powerhouse for Startup Ideas. Organize. Analyze. Ignite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link
          rel="preload"
          href="/_next/static/chunks/webpack.js"
          as="script"
        /> */}
        {/* <link rel="preload" href="/_next/static/chunks/main.js" as="script" /> */}
        {/* <link
          rel="preload"
          href="/_next/static/chunks/pages/_app.js"
          as="script"
        /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>

        <Toaster
          toastOptions={{
            classNames: {
              description: "!text-popover-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
