import { Hand } from "lucide-react";

type Props = { visivel: boolean; onFechar: () => void };

/**
 * Ensina o gesto de toque-e-segure pra quem nunca viu (motoristas, público
 * pouco familiarizado com apps). Ícone animado mostra a ação em loop —
 * a intenção é ensinar pelo movimento, sem depender só do texto.
 */
export function AjudaGestoBanner({ visivel, onFechar }: Props) {
  if (!visivel) return null;

  return (
    <div style={{ padding: "0 18px 4px" }}>
      <style>{`
        @keyframes ajuda-ping { 0% { transform: scale(0.6); opacity: 0.7; } 70% { transform: scale(1.9); opacity: 0; } 100% { opacity: 0; } }
        @keyframes ajuda-tap { 0%, 60% { transform: translateY(0); } 15% { transform: translateY(3px); } 100% { transform: translateY(0); } }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#FFF6EC",
          border: "1px solid #F6DDBE",
          borderRadius: 16,
          padding: "13px 14px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#F55807",
              animation: "ajuda-ping 1.6s ease-out infinite",
            }}
          />
          <span
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#F55807",
              color: "#fff",
              animation: "ajuda-tap 1.6s ease-in-out infinite",
            }}
          >
            <Hand size={17} />
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1410" }}>
            Achou um erro numa parada?
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#8A7B6C", marginTop: 2 }}>
            Toque e segure nela pra avisar.
          </div>
        </div>

        <button
          onClick={onFechar}
          style={{
            flexShrink: 0,
            padding: "9px 14px",
            borderRadius: 10,
            border: "1px solid #F6DDBE",
            background: "#fff",
            color: "#C2410C",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
