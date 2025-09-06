import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import { MainLayout } from "./components/Layout/MainLayout";
import ClientHome from "./pages/ClientHome";
import Dashboard from "./pages/Dashboard";
import Billboards from "./pages/Billboards";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import PricingList from "./pages/PricingList";
import Contracts from "./pages/Contracts";
import Users from "./pages/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* صفحة العملاء الرئيسية */}
          <Route path="/" element={<ClientHome />} />
          {/* صفحة الدخول/التسجيل */}
          <Route path="/auth" element={<Auth />} />
          
          {/* لوحة تحكم الأدمن */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/billboards" element={<ProtectedRoute requireAdmin><MainLayout><Billboards /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><MainLayout><Bookings /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><MainLayout><Users /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute requireAdmin><MainLayout><PricingList /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة التقارير قيد التطوير</h2></div></MainLayout></ProtectedRoute>} />
          <Route path="/admin/contracts" element={<ProtectedRoute requireAdmin><MainLayout><Contracts /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة الإعدادات قيد التطوير</h2></div></MainLayout></ProtectedRoute>} />
          
          {/* الصفحات القديمة للتوافق */}
          <Route path="/billboards" element={<MainLayout><Billboards /></MainLayout>} />
          <Route path="/bookings" element={<MainLayout><Bookings /></MainLayout>} />
          <Route path="/users" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة المستخدمين قيد التطوير</h2></div></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><PricingList /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة التقارير قيد التطوير</h2></div></MainLayout>} />
          <Route path="/contracts" element={<MainLayout><Contracts /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة الإعدادات قيد التطوير</h2></div></MainLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
