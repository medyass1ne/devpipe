import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/ModalProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevPipe",
  description: "Syndicate your releases everywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-text-main">
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
