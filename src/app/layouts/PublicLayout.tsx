import type { ReactNode } from "react";
import { ArrowLeft, Route } from "lucide-react";
import { useHeaderState } from "@/app/HeaderSlot";
import { GlobalLoadingBar } from "@/shared/ui/GlobalLoadingBar";
import { UpdateBanner } from "@/modules/consulta/components/UpdateBanner";
import { cn } from "@/shared/lib/cn";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { back, title, transparent } = useHeaderState();

  return (
    <div className="min-h-screen bg-bg">
      <GlobalLoadingBar />
      <header
        className={cn(
          "sticky top-0 z-20 h-14 border-b border-border",
          transparent ? "bg-bg/80 backdrop-blur" : "bg-bg",
        )}
      >
        <div className="mx-auto flex h-full max-w-2xl items-center gap-2.5 px-4">
          {back && (
            <button
              onClick={back}
              aria-label="Voltar"
              className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface text-text-muted transition duration-100 hover:bg-surface-hover hover:text-text active:scale-90 active:bg-primary-soft active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="size-4.5" />
            </button>
          )}

          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-white">
            <Route className="size-4" />
          </span>
          <span
            className={`text-sm font-semibold tracking-tight ${title ? "hidden sm:inline" : ""}`}
          >
            Roteiros Catedral
          </span>

          {title && (
            <>
              <span className="hidden text-text-subtle sm:inline">·</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-text-muted">
                {title}
              </span>
            </>
          )}
        </div>
      </header>
      <UpdateBanner />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
