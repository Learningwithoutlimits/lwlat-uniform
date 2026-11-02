import type { Metadata } from "next";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "@fontsource/source-sans-3/latin-700.css";
import "@fontsource/source-sans-3/latin-900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LwLAT Staff Uniform Shop",
  description: "Learning without Limits Academy Trust staff uniform ordering.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en-GB"><body className="brand-font">
    <div className="backdrop" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <circle cx="1350" cy="120" r="420"/><circle cx="1350" cy="120" r="560"/><circle className="ring-green" cx="1350" cy="120" r="700"/>
        <circle cx="120" cy="1020" r="380"/><circle cx="120" cy="1020" r="520"/>
      </svg>
    </div>
    {children}
  </body></html>;
}
