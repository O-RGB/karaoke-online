import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai_Looped } from "next/font/google";
import AllowSound from "@/components/tools/allow-sound";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-thai",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Next Karaoke",
  manifest: "/manifest.json",
  description:
    "คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม",
  openGraph: {
    type: "website",
    title: "Next Karaoke คาราโอเกะออนไลน์",
    description:
      "คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม",
    images: "https://next-karaoke.vercel.app/cover.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXTAMP – โปรแกรมเล่นเพลงสำหรับนักดนตรี",
    description:
      "คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม",
    images: "https://next-karaoke.vercel.app/cover.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/js-synthesizer/libfluidsynth-2.4.6.js"></script>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Karaoke" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#000000" />
      </head>

      <body className={`${notoSansThai.className} antialiased relative`}>
        <AllowSound>{children}</AllowSound>
      </body>
    </html>
  );
}
