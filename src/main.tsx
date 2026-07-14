import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Providers } from "@/app/providers";
import { HeaderProvider } from "@/app/HeaderSlot";
import { router } from "@/app/router";
import "@/styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <HeaderProvider>
        <RouterProvider router={router} />
      </HeaderProvider>
    </Providers>
  </StrictMode>,
);
