import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tabs = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Search, href: "/search", label: "Search" },
  { icon: Plus, href: "/create", label: "Create" },
  { icon: MessageCircle, href: "/inbox", label: "Inbox" },
  { icon: User, href: "/profile", label: "Profile" }
];

export function MobileTabBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-border/50 px-2 py-2">
        <nav className="flex items-center justify-around">
          {tabs.map(({ icon: Icon, href, label }) => {
            const isActive = location.pathname === href;
            
            if (label === "Create") {
              return (
                <Button
                  key={href}
                  size="sm"
                  className="cosmic-gradient rounded-xl h-12 w-12 p-0 neon-glow"
                  asChild
                >
                  <NavLink to={href}>
                    <Icon className="h-5 w-5 text-white" />
                  </NavLink>
                </Button>
              );
            }
            
            return (
              <NavLink
                key={href}
                to={href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "neon-glow")} />
                <span className="text-xs mt-1 font-medium">{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}