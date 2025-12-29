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
};

export const metadata: Metadata = {
  title: "Next Karaoke",
  manifest: "/manifest.json",
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

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Next Karaoke คาราโอเกะออนไลน์" />
        <meta
          property="og:description"
          content="คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม"
        />
        <meta
          property="og:image"
          content="https://next-karaoke.vercel.app/cover.png"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://next-karaoke.vercel.app/cover.png"
        />
        <meta
          property="twitter:title"
          content="NEXTAMP – โปรแกรมเล่นเพลงสำหรับนักดนตรี"
        />
        <meta
          property="twitter:description"
          content="คาราโอเกะออนไลน์ด้วยเทคโนโลยี MIDI และ SoundFont เล่นได้ทันทีผ่านเบราว์เซอร์ ไม่ต้องติดตั้งโปรแกรม"
        />
        <meta
          property="twitter:image"
          content="https://next-karaoke.vercel.app/cover.png"
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
