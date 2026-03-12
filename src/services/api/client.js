import axios from "axios";
import { getAccessToken } from "@/contexts/authStorage";
import { appConfig } from "@/config/runtimeConfig";

const client = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

client.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default client;
