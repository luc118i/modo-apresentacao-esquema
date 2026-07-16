import axios from "axios";
import { config } from "@/config";

/**
 * Cliente HTTP para a API do Apps Script (usado quando VITE_API_URL existir).
 * Nenhum componente importa isto direto — só os Services.
 */
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  // Apps Script "esfria" depois de um tempo sem uso — a primeira chamada
  // depois de um tempo parado pode demorar bem mais que uma chamada normal.
  // 30s + retry (ver queryClient.ts) evita mostrar erro por causa disso.
  timeout: 30_000,
});
