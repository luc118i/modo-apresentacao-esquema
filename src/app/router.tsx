import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { LinhaSearchPage } from "@/modules/consulta/pages/LinhaSearchPage";
import { EsquemaPickerPage } from "@/modules/consulta/pages/EsquemaPickerPage";
import { RoteiroPage } from "@/modules/consulta/pages/RoteiroPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicLayout>
        <LinhaSearchPage />
      </PublicLayout>
    ),
  },
  {
    path: "/linha/:linhaKey",
    element: (
      <PublicLayout>
        <EsquemaPickerPage />
      </PublicLayout>
    ),
  },
  {
    // Link próprio por esquema (slug legível, ex.: BAGO0053051-1730-ida) — pensado pra compartilhar direto.
    path: "/esquema/:slug",
    element: (
      <PublicLayout>
        <RoteiroPage />
      </PublicLayout>
    ),
  },
]);
