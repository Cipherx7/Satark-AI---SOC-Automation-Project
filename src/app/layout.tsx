import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOC Alert Intelligence Dashboard",
  description: "AI-Powered Security Operations Center — Real-time threat detection, intelligent log analysis, and incident response",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
