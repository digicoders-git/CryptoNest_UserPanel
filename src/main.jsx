import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import App from "./App.jsx";
import realWalletService from "./services/realWalletService.js";

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize wallet service
console.log('🚀 Initializing wallet service...');
realWalletService.initialize();

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={realWalletService.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>,
);
