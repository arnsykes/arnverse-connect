import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import Chatroom from "./pages/Chatroom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Feed /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <Layout><Explore /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <Layout><Search /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/inbox" element={
            <ProtectedRoute>
              <Layout><Inbox /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/chatroom" element={
            <ProtectedRoute>
              <Layout><Chatroom /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;