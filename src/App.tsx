import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import ClientHome from "./pages/ClientHome";
import Dashboard from "./pages/Dashboard";
import Billboards from "./pages/Billboards";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import PricingList from "./pages/PricingList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* صفحة العملاء الرئيسية */}
          <Route path="/" element={<ClientHome />} />
          
          {/* لوحة تحكم الأدمن */}
          <Route path="/admin" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/admin/billboards" element={<MainLayout><Billboards /></MainLayout>} />
          <Route path="/admin/bookings" element={<MainLayout><Bookings /></MainLayout>} />
          <Route path="/admin/users" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة المستخدمين قيد التطوير</h2></div></MainLayout>} />
          <Route path="/admin/pricing" element={<MainLayout><PricingList /></MainLayout>} />
          <Route path="/admin/reports" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة التقارير قيد التطوير</h2></div></MainLayout>} />
          <Route path="/admin/contracts" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة العقود قيد التطوير</h2></div></MainLayout>} />
          <Route path="/admin/settings" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة الإعدادات قيد التطوير</h2></div></MainLayout>} />
          
          {/* الصفحات القديمة للتوافق */}
          <Route path="/billboards" element={<MainLayout><Billboards /></MainLayout>} />
          <Route path="/bookings" element={<MainLayout><Bookings /></MainLayout>} />
          <Route path="/users" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة المستخدمين قيد التطوير</h2></div></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><PricingList /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة التقارير قيد التطوير</h2></div></MainLayout>} />
          <Route path="/contracts" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة العقود قيد التطوير</h2></div></MainLayout>} />
          <Route path="/settings" element={<MainLayout><div className="p-8 text-center"><h2 className="text-2xl font-bold text-muted-foreground">صفحة الإعدادات قيد التطوير</h2></div></MainLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
