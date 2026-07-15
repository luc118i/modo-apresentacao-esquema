import { useRef } from "react";

const EDGE_ZONE_PX = 24;
const SWIPE_THRESHOLD_PX = 70;
const MAX_CROSS_AXIS_RATIO = 0.5;

/**
 * Gestos de navegação mobile: arrastar da borda esquerda pra voltar, arrastar
 * pra baixo (a partir do topo da página) pra ir pra tela inicial.
 */
export function useEdgeGestures(onSwipeBack: (() => void) | undefined, onSwipeHome: () => void) {
  const start = useRef<{ x: number; y: number; fromEdge: boolean; fromTop: boolean } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = {
      x: t.clientX,
      y: t.clientY,
      fromEdge: t.clientX <= EDGE_ZONE_PX,
      fromTop: window.scrollY <= 0,
    };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;

    if (s.fromEdge && dx > SWIPE_THRESHOLD_PX && Math.abs(dy) < dx * MAX_CROSS_AXIS_RATIO) {
      onSwipeBack?.();
      return;
    }
    if (s.fromTop && dy > SWIPE_THRESHOLD_PX && Math.abs(dx) < dy * MAX_CROSS_AXIS_RATIO) {
      onSwipeHome();
    }
  }

  return { onTouchStart, onTouchEnd };
}
