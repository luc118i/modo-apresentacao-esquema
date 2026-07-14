import { config } from "@/config";

type Props = { lastUpdated: string | null };

/** Crédito + data da última atualização da planilha — mesmo padrão do rodapé do roteiro. */
export function AppFooter({ lastUpdated }: Props) {
  const data = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div className="mt-2 border-t border-border pt-4 text-center text-xs text-text-subtle">
      {data && (
        <>
          Planilha atualizada em {data}
          <br />
        </>
      )}
      Feito por{" "}
      <a
        href={config.credit.url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary hover:underline"
      >
        {config.credit.name}
      </a>
    </div>
  );
}
