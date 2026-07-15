import { useState } from "react";
import { Send, X } from "lucide-react";
import { abrirWhatsappAjuste } from "../../lib/ajuste";
import type { RoteiroStop } from "../../lib/roteiro";

const MOTIVOS = [
  "Horário errado",
  "Local incorreto",
  "Ordem errada",
  "Remover parada",
  "Permanência errada",
];

type Props = {
  stop: RoteiroStop;
  tituloEsquema: string;
  onClose: () => void;
};

/** Bottom sheet aberto por toque-e-segure numa parada — pede o motivo do ajuste e manda pro WhatsApp. */
export function AjustePontoModal({ stop, tituloEsquema, onClose }: Props) {
  const [motivo, setMotivo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  const podeEnviar = motivo != null || mensagem.trim().length > 0;

  function handleEnviar() {
    const linhas = [
      `Solicitação de ajuste — ${tituloEsquema}`,
      `Parada ${stop.ord}: ${stop.cidade}${stop.place ? ` (${stop.place})` : ""}`,
      motivo ? `Motivo: ${motivo}` : null,
      mensagem.trim() || null,
      window.location.href,
    ].filter((l): l is string => !!l);
    abrirWhatsappAjuste(linhas.join("\n"));
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(26,20,16,0.45)",
        display: "flex",
        alignItems: "flex-end",
        animation: "ajuste-overlay-in 180ms ease",
      }}
    >
      <style>{`
        @keyframes ajuste-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ajuste-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "ajuste-sheet-in 220ms cubic-bezier(0.32, 0.72, 0, 1)",
          width: "100%",
          maxWidth: 402,
          margin: "0 auto",
          background: "#F6F1EC",
          borderRadius: "22px 22px 0 0",
          padding: "16px 18px calc(18px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -20px 50px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#E7DDD3", margin: "0 auto 14px" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#B7A99B", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Ajustar parada {stop.ord}
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#1A1410", marginTop: 2 }}>
              {stop.cidade}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              display: "grid",
              placeItems: "center",
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "1px solid #EEE6DD",
              background: "#fff",
              color: "#8A7B6C",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
          {MOTIVOS.map((m) => {
            const ativo = motivo === m;
            return (
              <button
                key={m}
                onClick={() => setMotivo(ativo ? null : m)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: `1px solid ${ativo ? "#F55807" : "#EEE6DD"}`,
                  background: ativo ? "#FFF1E8" : "#fff",
                  color: ativo ? "#C2410C" : "#4A4038",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={2}
          placeholder="Detalhes (opcional)…"
          style={{
            width: "100%",
            resize: "vertical",
            border: "1px solid #EEE6DD",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1A1410",
            boxSizing: "border-box",
            marginTop: 12,
          }}
        />

        <button
          onClick={handleEnviar}
          disabled={!podeEnviar}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: podeEnviar ? "#25D366" : "#D7D0C8",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 12,
            cursor: podeEnviar ? "pointer" : "not-allowed",
          }}
        >
          <Send size={14} />
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  );
}
