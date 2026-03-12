import axios from "axios";
import { getAccessToken } from "@/contexts/authStorage";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

client.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default client;
