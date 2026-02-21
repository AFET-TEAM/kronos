import { PUBLIC_API_URL } from "$env/static/public";

// API URL - Environment variable'dan gelir, yoksa localhost
export const API_URL = PUBLIC_API_URL || "https://api-kronos.afet.team";

export const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
