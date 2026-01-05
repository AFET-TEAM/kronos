// API URL - Environment variable'dan gelir, yoksa localhost
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
