import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "./router";
import { createQueryClient } from "./query-client";

export function App() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
