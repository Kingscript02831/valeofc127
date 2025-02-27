
import "./App.css";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useTheme } from "next-themes";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import ChatHome from "./pages/ChatHome";
import Chat from "./pages/Chat";
import Index from "./pages/Index";

const queryClient = new QueryClient();

function App() {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme={theme as "light" | "dark" | undefined} position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatHome />} />
          <Route path="/chat/:chatId" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
