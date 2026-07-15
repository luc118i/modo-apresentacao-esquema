import { useState } from "react";
import type { Esquema } from "@/shared/models/esquema";
import type { Ponto } from "@/shared/models/ponto";
import { config } from "@/config";
import { buildRoteiro, LEGEND, type RoteiroStop } from "../../lib/roteiro";
import { RoteiroHeader } from "./RoteiroHeader";
import { RoteiroTimeline } from "./RoteiroTimeline";
import { ShareButton } from "./ShareButton";
import { AjusteButton } from "./AjusteButton";
import { AjustePontoModal } from "./AjustePontoModal";
import { AjudaGestoBanner } from "./AjudaGestoBanner";

type Props = { esquema: Esquema; pontos: Ponto[]; lastUpdated: string | null };

export function RoteiroCard({ esquema, pontos, lastUpdated }: Props) {
  const vm = buildRoteiro(esquema, pontos);
  const dataAtualizacao = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;
  const [pontoAjuste, setPontoAjuste] = useState<RoteiroStop | null>(null);
  // Sem persistência: o banner volta a aparecer a cada esquema novo (a página
  // remonta por causa da `key` em RoteiroPage), só some dentro desta visita.
  const [ajudaVisivel, setAjudaVisivel] = useState(true);
  const tituloEsquema = `${vm.sentido.toUpperCase()} ${vm.origem} → ${vm.destino} · Saída ${vm.saida}`;

  function handleAjustarPonto(stop: RoteiroStop) {
    setAjudaVisivel(false);
    setPontoAjuste(stop);
  }

  return (
    <>
      <div
        style={{
          width: 402,
          maxWidth: "100%",
          margin: "0 auto",
          background: "#F6F1EC",
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.04)",
        }}
      >
      <RoteiroHeader vm={vm} />

      {/* Stats */}
      <div style={{ padding: "18px 18px 4px" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #EEE6DD", borderRadius: 16, padding: "15px 18px" }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, color: "#1A1410", lineHeight: 1 }}>
            {vm.totalParadas}
          </div>
          <div style={{ width: 1, height: 30, background: "#EEE6DD" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#9A8E82", letterSpacing: 0.2, lineHeight: 1.3 }}>
            Paradas neste
            <br />
            roteiro
          </div>
        </div>
      </div>

      <AjudaGestoBanner visivel={ajudaVisivel} onFechar={() => setAjudaVisivel(false)} />

      <RoteiroTimeline vm={vm} onAjustarPonto={handleAjustarPonto} />

      {/* Legenda */}
      <div style={{ padding: "4px 18px 10px" }}>
        <div style={{ background: "#fff", border: "1px solid #EEE6DD", borderRadius: 16, padding: "14px 16px" }}>
          <LegendGroup title="Tipos de local" items={[
            { label: "Rodoviária", dot: "#C2410C" },
            { label: "Ponto de apoio", dot: "#8A7B6C" },
          ]} />
          <div style={{ height: 12 }} />
          <LegendGroup title="Operação no ponto" items={LEGEND} />
        </div>
      </div>

      {/* Compartilhar + Solicitar ajuste */}
      <div style={{ padding: "4px 18px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
        <ShareButton
          title={`${vm.origem} → ${vm.destino} · Roteiros Catedral`}
          text={`Roteiro Operacional ${vm.sentido.toUpperCase()} · ${vm.origem} → ${vm.destino} · Saída ${vm.saida}`}
        />
        <AjusteButton titulo={tituloEsquema} />
      </div>

      {/* Rodapé */}
      <div style={{ padding: "2px 18px 26px", textAlign: "center" }}>
        <div style={{ fontSize: 10.5, fontWeight: 500, color: "#B7A99B", lineHeight: 1.5 }}>
          Roteiro Operacional · {vm.origem.toUpperCase()} × {vm.destino.toUpperCase()} · {vm.saida}
          <br />
          Viação Catedral
        </div>
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #EEE6DD",
            fontSize: 11.5,
            fontWeight: 600,
            color: "#9A8E82",
            lineHeight: 1.7,
          }}
        >
          {dataAtualizacao && (
            <>
              Planilha atualizada em {dataAtualizacao}
              <br />
            </>
          )}
          <span style={{ fontWeight: 500 }}>Feito por</span>{" "}
          <a
            href={config.credit.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#C2410C", fontWeight: 600, textDecoration: "none" }}
          >
            {config.credit.name}
          </a>
        </div>
      </div>
      </div>

      {pontoAjuste && (
        <AjustePontoModal
          stop={pontoAjuste}
          tituloEsquema={tituloEsquema}
          onClose={() => setPontoAjuste(null)}
        />
      )}
    </>
  );
}

function LegendGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; dot: string }[];
}) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#B7A99B", textTransform: "uppercase", marginBottom: 9 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
        {items.map((lg) => (
          <div key={lg.label} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: lg.dot, display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4A4038" }}>{lg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
