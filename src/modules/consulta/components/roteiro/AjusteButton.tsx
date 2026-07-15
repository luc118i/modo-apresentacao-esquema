import { useState } from "react";
import { MessageSquareWarning, Send } from "lucide-react";
import { abrirWhatsappAjuste } from "../../lib/ajuste";

type Props = { titulo: string };

/** Abre um campo pra descrever um ajuste e manda pro WhatsApp junto com o link do roteiro. */
export function AjusteButton({ titulo }: Props) {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function handleEnviar() {
    const texto = `Solicitação de ajuste — ${titulo}\n\n${mensagem.trim()}\n\n${window.location.href}`;
    abrirWhatsappAjuste(texto);
    setAberto(false);
    setMensagem("");
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: "#fff",
          border: "1px solid #EEE6DD",
          borderRadius: 14,
          padding: "13px 16px",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#8A7B6C",
          cursor: "pointer",
        }}
      >
        <MessageSquareWarning size={15} />
        Solicitar ajuste
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #EEE6DD", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4A4038", marginBottom: 8 }}>
        O que precisa ser ajustado neste roteiro?
      </div>
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        autoFocus
        rows={3}
        placeholder="Descreva o ajuste necessário…"
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
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={() => {
            setAberto(false);
            setMensagem("");
          }}
          style={{
            padding: "9px 14px",
            borderRadius: 10,
            border: "1px solid #EEE6DD",
            background: "#fff",
            color: "#8A7B6C",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleEnviar}
          disabled={!mensagem.trim()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "9px 14px",
            borderRadius: 10,
            border: "none",
            background: mensagem.trim() ? "#25D366" : "#D7D0C8",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: mensagem.trim() ? "pointer" : "not-allowed",
          }}
        >
          <Send size={13} />
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  );
}
