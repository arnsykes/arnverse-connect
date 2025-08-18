import { useState } from "react";
import { Moon, Sun, Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="cosmic-gradient rounded-xl p-2">
            <div className="h-6 w-6 rounded-md bg-white/20" />
          </div>
          <h1 className="text-2xl font-bold cosmic-gradient bg-clip-text text-transparent">
            ARNVERSE
          </h1>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ARNVERSE..."
              className="w-full pl-10 pr-4 py-2 glass rounded-lg border-0 focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile search */}
          <Button variant="ghost" size="icon" className="md:hidden hover-glow">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hover-glow relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs cosmic-gradient border-0">
              3
            </Badge>
          </Button>

          {/* Add Content */}
          <Button variant="ghost" size="icon" className="hover-glow">
            <Plus className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hover-glow"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Profile */}
          <div className="h-8 w-8 rounded-full cosmic-gradient p-0.5">
            <div className="h-full w-full rounded-full bg-surface flex items-center justify-center text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}