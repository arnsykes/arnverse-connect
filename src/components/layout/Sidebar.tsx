import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Settings,
  Globe,
  TrendingUp,
  Bookmark,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const primaryNavItems = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Search, href: "/search", label: "Search" },
  { icon: TrendingUp, href: "/explore", label: "Explore" },
  { icon: MessageCircle, href: "/inbox", label: "Inbox", badge: 5 },
  { icon: Globe, href: "/chatroom", label: "Chatroom" }
];

const secondaryNavItems = [
  { icon: User, href: "/profile", label: "Profile" },
  { icon: Bookmark, href: "/saved", label: "Saved" },
  { icon: Users, href: "/groups", label: "Groups" },
  { icon: Settings, href: "/settings", label: "Settings" }
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavItem = ({ icon: Icon, href, label, badge }: any) => {
    const isActive = location.pathname === href;
    
    return (
      <NavLink
        to={href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20 hover-glow" 
            : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
        {!isCollapsed && (
          <>
            <span className="font-medium">{label}</span>
            {badge && (
              <Badge className="ml-auto cosmic-gradient border-0 text-white text-xs">
                {badge}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className={cn(
      "hidden md:flex flex-col h-full glass-strong border-r border-border/50 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Create Button */}
      <div className="p-4">
        <Button 
          asChild
          className={cn(
            "w-full cosmic-gradient border-0 neon-glow hover:scale-105 transition-transform",
            isCollapsed && "px-0"
          )}
        >
          <NavLink to="/create" className="flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5 text-white" />
            {!isCollapsed && <span className="text-white font-medium">Create Post</span>}
          </NavLink>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8">
        <div className="space-y-1">
          {primaryNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="space-y-1">
          <div className={cn("px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", isCollapsed && "hidden")}>
            Personal
          </div>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className={cn("glass rounded-lg p-3", isCollapsed && "hidden")}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full cosmic-gradient p-0.5">
              <div className="h-full w-full rounded-full bg-surface flex items-center justify-center text-sm font-medium">
                A
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">@arnverse_user</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}