import { Navigation, MobileNavigation } from "@/components/ui/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex md:w-60 md:flex-shrink-0">
        <Navigation />
      </aside>
      <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      <MobileNavigation />
    </div>
  );
}
