import "./globals.css";

export const metadata = {
  title: "SwiftLink",
  description: "A PayRoll app for Tax Practitioners",
  icons: {
    icon: "/SwiftLink.png",
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
      name: "Dhruv Mahyavanshi",
      url: "https://swiftlink0.vercel.app",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
