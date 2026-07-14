import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type HeaderState = { back?: () => void; title?: string; transparent?: boolean };

// Contextos separados: quem só ESCREVE (páginas) assina o setter estável e não
// re-renderiza quando o estado muda — evita re-render desnecessário da página.
const HeaderStateCtx = createContext<HeaderState>({});
const HeaderSetCtx = createContext<Dispatch<SetStateAction<HeaderState>>>(() => {});

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeaderState>({});
  return (
    <HeaderSetCtx.Provider value={setState}>
      <HeaderStateCtx.Provider value={state}>{children}</HeaderStateCtx.Provider>
    </HeaderSetCtx.Provider>
  );
}

/** Lido pelo layout para montar o app bar contextual. */
export function useHeaderState(): HeaderState {
  return useContext(HeaderStateCtx);
}

/**
 * A página informa o conteúdo contextual do nav (voltar + título). O `back` fica
 * num ref para o efeito depender só do `title`; `setState` é estável.
 */
export function useSetHeader(
  back: (() => void) | undefined,
  title: string | undefined,
  transparent = false,
) {
  const setState = useContext(HeaderSetCtx);
  const backRef = useRef(back);
  backRef.current = back;

  useEffect(() => {
    const apply = (t: string | undefined) =>
      setState((prev) => {
        const nextTitle = t || undefined;
        // Bail-out: nada muda quando título é igual → evita re-render que
        // interrompe a animação de entrada do AnimatePresence.
        if (prev.title === nextTitle && prev.transparent === transparent) return prev;
        return {
          back: nextTitle ? () => backRef.current?.() : undefined,
          title: nextTitle,
          transparent,
        };
      });
    apply(title);
    return () => apply(undefined);
  }, [setState, title, transparent]);
}
