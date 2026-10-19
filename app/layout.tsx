import type { Metadata } from "next";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-600.css";
import "@fontsource/open-sans/latin-700.css";
import "@fontsource/open-sans/latin-800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LwLAT Staff Uniform Shop",
  description: "Learning without Limits Academy Trust staff uniform ordering.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body className="open-sans-font">{children}</body></html>;
}
