import App from "./App.svelte";
import { spawnWebSocketListener } from "./lib/ws";
import { serverHost } from "./stores";

const app = new App({
  target: document.body,
});

serverHost.subscribe((host) => {
  const listener = spawnWebSocketListener(host);
  return () => listener.close();
});

export default app;
