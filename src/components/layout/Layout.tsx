import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      
      <MobileTabBar />
    </div>
  );
}