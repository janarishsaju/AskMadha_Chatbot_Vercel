import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalChrome from "@/components/ConditionalChrome";
import AnimatedBackground from "@/components/AnimatedBackground";
import { AuthProvider } from "@/lib/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Ask Madha - Catholic Spiritual Companion",
    template: "%s | Ask Madha",
  },
  description:
    "Ask Madha is your AI Catholic spiritual companion by Madha TV. Sign up, log in, and chat with an AI agent to explore Scripture, ask questions, and grow in faith.",
  keywords: [
    "Ask Madha",
    "Catholic AI",
    "Bible AI",
    "AI Bible chat",
    "Catholic app",
    "Bible questions",
    "scripture assistant",
    "Madha TV",
    "Catholic spiritual companion",
  ],
  authors: [{ name: "Madha TV" }],
  creator: "Madha TV",
  metadataBase: new URL("https://askmadha.app"),
  openGraph: {
    title: "Ask Madha - Catholic Spiritual Companion",
    description:
      "Chat with an AI agent trained in Catholic theology. Get answers, insights, and guidance from Scripture.",
    url: "https://askmadha.app",
    siteName: "Ask Madha",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Madha - Catholic Spiritual Companion",
    description:
      "Chat with an AI agent trained in Catholic theology. Get answers, insights, and guidance from Scripture.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnimatedBackground />
        <AuthProvider>
          <ConditionalChrome>{children}</ConditionalChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
