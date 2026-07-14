import { useState } from "react";

/**
 * Assets da Catedral. Se os arquivos reais existirem em `public/`
 * (catedral-logo.png / catedral-bus.png) eles são usados; senão, cai no
 * fallback vetorial abaixo. Basta soltar os PNG/SVG na pasta public/.
 */
const LOGO_URL = `${import.meta.env.BASE_URL}catedral-logo.png`;
const BUS_URL = `${import.meta.env.BASE_URL}catedral-bus.jpg`;

export function CatedralLogo() {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src={LOGO_URL}
        alt="Catedral"
        onError={() => setFailed(true)}
        style={{ height: 58, width: "auto", display: "block", marginLeft: -4 }}
      />
    );
  }

  // Fallback vetorial (swoosh + wordmark)
  return (
    <svg height="34" viewBox="0 0 210 44" role="img" aria-label="Catedral" fill="none">
      <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M5 8 Q9 27 19 37" />
        <path d="M12 6 Q15 25 20 37" />
        <path d="M20 4 Q20 20 20.5 37" />
        <path d="M28 6 Q25 25 21 37" />
        <path d="M35 8 Q31 27 22 37" />
      </g>
      <text
        x="48"
        y="31"
        fill="#fff"
        fontFamily="Archivo, sans-serif"
        fontSize="25"
        fontWeight="800"
        letterSpacing="1.5"
      >
        CATEDRAL
      </text>
    </svg>
  );
}

export function BusMark() {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src={BUS_URL}
        alt="Ônibus Catedral"
        onError={() => setFailed(true)}
        style={{ display: "block", width: "100%", margin: "16px 0 -2px" }}
      />
    );
  }

  // Fallback vetorial
  return (
    <div style={{ margin: "18px -22px -2px", opacity: 0.9 }}>
      <svg viewBox="0 0 402 96" width="100%" role="img" aria-label="Ônibus Catedral">
        <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.5">
          <rect x="70" y="26" width="262" height="46" rx="12" fill="rgba(255,255,255,.10)" />
          <line x1="70" y1="44" x2="332" y2="44" />
          <rect x="86" y="32" width="34" height="14" rx="3" fill="rgba(255,255,255,.18)" stroke="none" />
          <rect x="128" y="32" width="34" height="14" rx="3" fill="rgba(255,255,255,.18)" stroke="none" />
          <rect x="170" y="32" width="34" height="14" rx="3" fill="rgba(255,255,255,.18)" stroke="none" />
          <rect x="212" y="32" width="34" height="14" rx="3" fill="rgba(255,255,255,.18)" stroke="none" />
          <rect x="254" y="32" width="34" height="14" rx="3" fill="rgba(255,255,255,.18)" stroke="none" />
        </g>
        <circle cx="120" cy="74" r="12" fill="#1A1410" />
        <circle cx="120" cy="74" r="5" fill="rgba(255,255,255,.5)" />
        <circle cx="282" cy="74" r="12" fill="#1A1410" />
        <circle cx="282" cy="74" r="5" fill="rgba(255,255,255,.5)" />
      </svg>
    </div>
  );
}
