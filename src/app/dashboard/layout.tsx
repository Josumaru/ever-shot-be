import { AppSidebar } from "@/components/app-sidebar";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b border-border">
              <SidebarTrigger />
              <div className="ml-auto flex items-center gap-2">
                <LocaleToggle />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex flex-1 flex-col p-4 sm:p-6 min-h-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
