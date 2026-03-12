import io from "socket.io-client";
import { appConfig } from "@/config/runtimeConfig";

const socket = io(appConfig.wsUrl || undefined, {
  path: appConfig.wsPath,
});

export default socket;
