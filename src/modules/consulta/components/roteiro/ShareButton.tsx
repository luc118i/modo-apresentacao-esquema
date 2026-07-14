import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/** Copia via Clipboard API; se o navegador negar (mais antigo/restrito), cai no fallback do textarea + execCommand. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Compartilha a URL atual (Web Share API no mobile; copia o link no resto). */
export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // usuário cancelou o compartilhamento — não é erro
      }
      return;
    }

    if (!(await copyToClipboard(url))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar esquema"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        background: copied ? "#FBEFE4" : "#FFF1E8",
        border: "1px solid #F2B98C",
        borderRadius: 14,
        padding: "13px 16px",
        fontSize: 13.5,
        fontWeight: 700,
        color: "#C2410C",
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={16} /> : <Share2 size={15} />}
      {copied ? "Link copiado!" : "Compartilhar este roteiro"}
    </button>
  );
}
