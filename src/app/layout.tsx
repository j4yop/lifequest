import type { Metadata, Viewport } from "next";
import { Silkscreen, Atkinson_Hyperlegible, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Silkscreen({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const bodySans = Atkinson_Hyperlegible({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const numsMono = VT323({
  variable: "--font-nums-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lifequest.vercel.app"),
  title: {
    default: "Life Quest — Turn Your Life Into an RPG",
    template: "%s · Life Quest",
  },
  description:
    "Complete real-world quests, level up six character attributes, build streaks, and earn gold in the guild shop. A full-stack gamified productivity RPG.",
  keywords: [
    "gamified productivity",
    "habit tracker RPG",
    "life RPG",
    "quest tracker",
    "level up habits",
  ],
  openGraph: {
    title: "Life Quest — Turn Your Life Into an RPG",
    description:
      "Complete real-world quests, level up, build streaks, and earn gold. Your chores, finally worth doing.",
    type: "website",
    siteName: "Life Quest",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life Quest — Turn Your Life Into an RPG",
    description:
      "Complete real-world quests, level up, build streaks, and earn gold in the guild shop.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ece1c3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${bodySans.variable} ${numsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-field text-ink">
        {children}
      </body>
    </html>
  );
}
