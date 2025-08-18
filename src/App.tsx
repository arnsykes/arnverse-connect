import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Feed /></Layout>} />
          <Route path="/search" element={<Layout><Search /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/profile/:username" element={<Layout><Profile /></Layout>} />
          <Route path="/create" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Create Post</h1><p className="text-muted-foreground mt-2">Upload feature coming soon!</p></div></Layout>} />
          <Route path="/inbox" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Messages</h1><p className="text-muted-foreground mt-2">DM feature coming soon!</p></div></Layout>} />
          <Route path="/explore" element={<Layout><Search /></Layout>} />
          <Route path="/chatroom" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Public Chatroom</h1><p className="text-muted-foreground mt-2">Community chat coming soon!</p></div></Layout>} />
          <Route path="/settings" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Settings panel coming soon!</p></div></Layout>} />
          <Route path="/saved" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Saved Posts</h1><p className="text-muted-foreground mt-2">Your saved content will appear here!</p></div></Layout>} />
          <Route path="/groups" element={<Layout><div className="text-center py-20"><h1 className="text-2xl font-bold">Groups</h1><p className="text-muted-foreground mt-2">Group management coming soon!</p></div></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
