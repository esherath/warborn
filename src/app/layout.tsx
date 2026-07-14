import type { Metadata } from "next";
import { Alegreya, Cinzel } from "next/font/google";
import { OpeningCinematic } from "@/components/opening-cinematic";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const medievalDisplay = Cinzel({ subsets: ["latin"], variable: "--font-medieval", weight: ["400", "600", "700"] });
const medievalBody = Alegreya({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Warborn — MMORPG",
  description: "The official Warborn portal. Create your account, download the game, and join the battle.",
};

function AmbientEmbers() {
  return <div className="ambient-embers" aria-hidden="true">
    {Array.from({ length: 16 }, (_, index) => <span key={index} />)}
  </div>;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale} data-scroll-behavior="smooth" className={`${medievalDisplay.variable} ${medievalBody.variable}`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('warborn:intro-seen')==='1')document.documentElement.dataset.warbornIntro='seen'}catch(e){}" }} /></head>
    <body><AmbientEmbers /><OpeningCinematic />{children}</body>
  </html>;
}
