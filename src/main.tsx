import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Providers } from "@/app/providers";
import { HeaderProvider } from "@/app/HeaderSlot";
import { router } from "@/app/router";
import "@/styles/global.css";

/**
 * Abre a tela de boot (ver index.html) em duas metades pros lados, tipo o
 * splash do X, revelando o app já pintado por baixo — só remove do DOM
 * depois da transição (com um fallback por timeout, caso o transitionend
 * não dispare por algum motivo).
 */
function dismissBootLoading() {
  const el = document.getElementById("boot-loading");
  if (!el) return;
  const remove = () => el.remove();
  el.addEventListener("transitionend", remove, { once: true });
  setTimeout(remove, 900);
  el.classList.add("boot-loading--opening");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <HeaderProvider>
        <RouterProvider router={router} />
      </HeaderProvider>
    </Providers>
  </StrictMode>,
);

// Duplo rAF: garante que o app já pintou pelo menos um frame antes de abrir
// a tela de boot, pra não revelar um vão em branco no meio da transição.
requestAnimationFrame(() => requestAnimationFrame(dismissBootLoading));
