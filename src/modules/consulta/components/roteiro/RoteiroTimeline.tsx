import { Clock, Timer } from "lucide-react";
import { LONG_PRESS_DURATION_MS, useLongPress } from "@/shared/hooks/useLongPress";
import { TAGS, type RoteiroStop, type RoteiroViewModel, type TipoLocal } from "../../lib/roteiro";

const TIPO_STYLE: Record<TipoLocal, { bg: string; color: string }> = {
  Rodoviária: { bg: "#FFF1E8", color: "#C2410C" },
  "Ponto de apoio": { bg: "#F1EAE1", color: "#8A7B6C" },
};

type Props = { vm: RoteiroViewModel; onAjustarPonto: (stop: RoteiroStop) => void };

export function RoteiroTimeline({ vm, onAjustarPonto }: Props) {
  return (
    <div style={{ padding: "18px 18px 12px" }}>
      <style>{`
        @keyframes ajustar-fill { from { width: 0%; } to { width: 100%; } }
      `}</style>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1410", letterSpacing: -0.2 }}>
          Itinerário
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#B7A99B" }}>
          {vm.totalParadas} paradas
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {vm.stops.map((stop, i) => (
          <StopRow key={`${stop.ord}-${i}`} stop={stop} showTop={i > 0} onAjustar={() => onAjustarPonto(stop)} />
        ))}
        <DestinationRow city={vm.destino} uf={vm.ufDestino} />
      </div>
    </div>
  );
}

function StopRow({
  stop,
  showTop,
  onAjustar,
}: {
  stop: RoteiroStop;
  showTop: boolean;
  onAjustar: () => void;
}) {
  const tipo = TIPO_STYLE[stop.tipoLocal];
  const { handlers, pressing } = useLongPress(onAjustar);
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ position: "relative", width: 40, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        {showTop && (
          <div style={{ position: "absolute", top: 0, height: 21, width: 2.5, background: "#E7DDD3", left: "50%", transform: "translateX(-50%)" }} />
        )}
        <div style={{ position: "absolute", top: 21, bottom: 0, width: 2.5, background: "#E7DDD3", left: "50%", transform: "translateX(-50%)" }} />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: stop.origin ? "#F55807" : "#fff",
            border: `2.5px solid ${stop.origin ? "#F55807" : "#F2B98C"}`,
            color: stop.origin ? "#fff" : "#C2410C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          {stop.ord}
        </div>
      </div>

      <div style={{ flex: 1, paddingBottom: 16 }}>
        <div
          {...handlers}
          style={{
            position: "relative",
            background: "#fff",
            border: `1px solid ${pressing ? "#F2B98C" : "#EEE6DD"}`,
            borderRadius: 16,
            padding: "13px 14px",
            overflow: "hidden",
            touchAction: "pan-y",
            WebkitUserSelect: "none",
            userSelect: "none",
            transform: pressing ? "scale(0.98)" : "scale(1)",
            transition: "transform 150ms ease, border-color 150ms ease",
          }}
        >
          {pressing && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: 3,
                background: "#F55807",
                animation: `ajustar-fill ${LONG_PRESS_DURATION_MS}ms linear forwards`,
              }}
            />
          )}
          {/* Cidade - UF */}
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              color: "#1A1410",
              lineHeight: 1.15,
              letterSpacing: -0.2,
              textDecoration: stop.vetado ? "line-through" : "none",
            }}
          >
            {stop.cidade}
          </div>

          {/* Tipo do local (+ nome do ponto de apoio, quando houver) */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: tipo.color, background: tipo.bg, padding: "3px 9px", borderRadius: 999 }}>
              {stop.tipoLocal}
            </span>
            {stop.place && (
              <span style={{ fontSize: 11.5, fontWeight: 500, color: "#9A8E82" }}>{stop.place}</span>
            )}
          </div>

          {/* Horário de sessão + permanência, rotulados */}
          {(stop.horaComercial || stop.minLabel) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 11 }}>
              {stop.horaComercial && (
                <Info icon={<Clock size={13} color="#C2410C" />} label="Sessão" value={stop.horaComercial} strong />
              )}
              {stop.minLabel && (
                <Info icon={<Timer size={12} color="#9A8E82" />} label="Permanência" value={stop.minLabel} />
              )}
            </div>
          )}

          {/* Tipos de operação neste ponto */}
          {stop.tags.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11, paddingTop: 11, borderTop: "1px solid #F3EDE6" }}
            >
              {stop.tags.map((key) => {
                const tag = TAGS[key];
                return (
                  <div
                    key={key}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: tag.bg, color: tag.c }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: tag.dot, display: "inline-block" }} />
                    {tag.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  strong = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {icon}
      <span style={{ fontSize: 10.5, fontWeight: 600, color: "#B7A99B", textTransform: "uppercase", letterSpacing: 0.3 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: strong ? 14 : 12,
          fontWeight: strong ? 800 : 600,
          color: strong ? "#1A1410" : "#6b6157",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </span>
  );
}

function DestinationRow({ city, uf }: { city: string; uf: string }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ position: "relative", width: 40, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 0, height: 21, width: 2.5, background: "#E7DDD3", left: "50%", transform: "translateX(-50%)" }} />
        <div
          style={{ position: "relative", zIndex: 1, width: 42, height: 42, borderRadius: "50%", background: "#1A1410", display: "flex", alignItems: "center", justifyContent: "center", color: "#F88C45", fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}
        >
          Fim
        </div>
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ background: "#1A1410", borderRadius: 16, padding: "14px 16px", color: "#fff" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#F88C45", textTransform: "uppercase" }}>
            Destino final
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 3, letterSpacing: -0.2 }}>
            {city}
            {uf ? `, ${uf}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
