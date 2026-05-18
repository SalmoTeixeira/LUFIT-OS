import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCProvider } from "@/providers/trpc";
import { HashRouter } from "react-router-dom";
import { StoreProvider } from "@/contexts/StoreContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </TRPCProvider>
      </QueryClientProvider>
    </HashRouter>
  </StrictMode>
);
