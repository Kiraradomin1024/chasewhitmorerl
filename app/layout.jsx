import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import VisitorWhisper from "@/components/VisitorWhisper";

export const metadata = {
  title: "Chase Whitmore",
  description: "À l'intérieur de sa tête.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain vignette min-h-screen">
        <AuthProvider>
          <Nav />
          <VisitorWhisper />
          <main className="relative z-10 pt-11 pb-7">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
