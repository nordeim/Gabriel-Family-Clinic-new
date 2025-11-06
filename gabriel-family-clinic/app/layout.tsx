import type { Metadata } from "next";
import "./globals.css";
import { healthcareMetadata, organizationSchema, localBusinessSchema } from "@/lib/seo/metadata";
import { injectStructuredData } from "@/lib/seo/structured-data";

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export const metadata: Metadata = {
  ...healthcareMetadata,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-SG" className="scroll-smooth">
      <body className="antialiased bg-neutral-50 text-neutral-900 min-h-screen">
        {/* Healthcare Organization Structured Data */}
        {injectStructuredData([organizationSchema, localBusinessSchema])}
        
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="skip-link focus-accessible"
        >
          Skip to main content
        </a>
        
        {/* Main application content */}
        <div id="root">
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
