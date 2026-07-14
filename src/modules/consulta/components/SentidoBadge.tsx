import { ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import type { Sentido } from "@/shared/models/esquema";

export function SentidoBadge({ sentido }: { sentido: Sentido }) {
  const isIda = sentido === "Ida";
  return (
    <Badge tone={isIda ? "ida" : "volta"}>
      {isIda ? <ArrowRight className="size-3" /> : <ArrowLeft className="size-3" />}
      {sentido}
    </Badge>
  );
}
