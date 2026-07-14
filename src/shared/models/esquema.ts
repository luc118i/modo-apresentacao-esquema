import { z } from "zod";

export const sentidoSchema = z.enum(["Ida", "Volta"]);
export type Sentido = z.infer<typeof sentidoSchema>;

export const esquemaSchema = z.object({
  id: z.number(),
  nomeLinha: z.string(),
  codLinha: z.string().nullable().default(null),
  horario: z.string(),
  sentido: sentidoSchema,
});

export type Esquema = z.infer<typeof esquemaSchema>;
