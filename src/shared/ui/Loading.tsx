/** Estado de carregamento centralizado (sem spinner) — só a mensagem. */
export function Loading({ label = "Carregando, aguarde…" }: { label?: string }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  );
}
