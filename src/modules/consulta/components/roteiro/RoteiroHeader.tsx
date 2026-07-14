import type { RoteiroViewModel } from "../../lib/roteiro";
import { BusMark, CatedralLogo } from "./assets";

export function RoteiroHeader({ vm }: { vm: RoteiroViewModel }) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(160deg,#FF8A1E 0%,#F55807 70%)",
        padding: "30px 22px 0",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CatedralLogo />
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: 0.92,
            textAlign: "right",
            lineHeight: 1.35,
          }}
        >
          Roteiro
          <br />
          Operacional
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 22,
          background: "rgba(0,0,0,.16)",
          border: "1px solid rgba(255,255,255,.25)",
          padding: "6px 12px 6px 10px",
          borderRadius: 999,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.5,
            background: "#fff",
            color: "#F55807",
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {vm.sentido.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: "#fff" }}>
          {vm.origem} → {vm.destino}
        </span>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, letterSpacing: -0.5 }}>
          {vm.origem}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 6px" }}>
        <div style={{ width: 26, height: 2, background: "rgba(255,255,255,.6)" }} />
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, opacity: 0.9 }}>PARA</div>
        <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.6)" }} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, letterSpacing: -0.5 }}>
        {vm.destino}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <Pill>
          <span
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }}
          />
          Saída {vm.saida}
        </Pill>
        {vm.ufOrigem && vm.ufDestino && (
          <Pill>
            {vm.ufOrigem} → {vm.ufDestino}
          </Pill>
        )}
      </div>

      <BusMark />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "rgba(255,255,255,.18)",
        border: "1px solid rgba(255,255,255,.28)",
        padding: "7px 12px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
