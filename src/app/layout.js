import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SwiftLink",
  description: "A PayRoll app for Tax Practitioners",
  icons: {
    icon: "/SwiftLink.png", // Using PNG instead of favicon.ico
    shortcut: "/SwiftLink.png",
    apple: "/SwiftLink.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  keywords: [
    "payroll",
    "tax practitioners",
    "financial management",
    "business solutions",
    "SwiftLink",
  ],
  authors: [
    {
      name: "SwiftLink Team",
      url: "https://swiftlink.com/about",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
