import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import Descontos from "./pages/Descontos";
import Metas from "./pages/Metas";
import Jarvis from "./pages/Jarvis";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/descontos" element={<Descontos />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/objecoes" element={<Objecoes />} />
          <Route path="/jarvis" element={<Jarvis />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
