import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QAH Material Testing | MPW BARMM",
  description: "Material quality testing monitoring and evidence registry",
  icons: {
    icon: "/mpw-logo.png",
    apple: "/mpw-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
