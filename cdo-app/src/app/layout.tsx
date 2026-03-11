import type { Metadata } from "next";
import "./globals.css";
import { Navigation, MobileNavigation } from "@/components/ui/navigation";

export const metadata: Metadata = {
  title: "CDO Path - Career Growth Engine",
  description:
    "Your personalized daily briefing and career development app for becoming a Chief Data Officer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen">
          <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
            <Navigation />
          </aside>
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
          <MobileNavigation />
        </div>
      </body>
    </html>
  );
}
