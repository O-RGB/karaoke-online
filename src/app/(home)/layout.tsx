import type { Metadata, Viewport } from "next";
import "../globals.css";
import AllowSound from "@/components/tools/allow-sound";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <script src="/js-synthesizer/libfluidsynth-2.3.0.js"></script>
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
        {/*         
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.ico" sizes="48x48" />
        <link rel="icon" type="image/x-icon" href="./icon.ico" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/icon-mid?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        /> */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="google" content="notranslate" />
      </head>

      <body className={`relative p-2.5 bg-slate-500 `}>
        <AllowSound>{children}</AllowSound>
      </body>
    </html>
  );
}
