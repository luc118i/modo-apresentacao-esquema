import { useRef, useState } from "react";

const LONG_PRESS_MS = 500;
/** Cancela o long-press se o dedo se mover mais que isso (evita disparo durante scroll). */
const MOVE_TOLERANCE_PX = 10;

/**
 * Handlers de toque-e-segure (touch + mouse) pra anexar num elemento via
 * `{...handlers}`. `pressing` liga durante o hold — dá pra usar pra mostrar um
 * indicador visual (progresso, escala etc.) enquanto o usuário segura.
 */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [pressing, setPressing] = useState(false);

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
    setPressing(false);
  }

  function begin(x: number, y: number) {
    start.current = { x, y };
    setPressing(true);
    timer.current = setTimeout(() => {
      setPressing(false);
      onLongPress();
    }, LONG_PRESS_MS);
  }

  function move(x: number, y: number) {
    if (!start.current) return;
    const dx = x - start.current.x;
    const dy = y - start.current.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clear();
  }

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: (e: React.MouseEvent) => begin(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: clear,
    onMouseLeave: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  return { handlers, pressing };
}

export const LONG_PRESS_DURATION_MS = LONG_PRESS_MS;
