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
  title: {
    template: "%s | DevPipe",
    default: "DevPipe - Write once. Syndicate everywhere.",
  },
  description: "DevPipe is a tool for open-source maintainers to draft, format, and publish release notes to GitHub, Dev.to, Hashnode, and Reddit simultaneously.",
  applicationName: 'DevPipe',
  openGraph: {
    title: "DevPipe",
    description: "Write once. Syndicate everywhere. AI-powered release notes.",
    url: "https://devpipe.yessindevs.me",
    siteName: "DevPipe",
    locale: "en_US",
    type: "website",
  },
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
