import axios from "axios";
import { config } from "@/config";

/**
 * Cliente HTTP para a API do Apps Script (usado quando VITE_API_URL existir).
 * Nenhum componente importa isto direto — só os Services.
 */
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 15_000,
});
