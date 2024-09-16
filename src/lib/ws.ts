import { getWsUrl } from "./api";
import { Message } from "./comfy";
import { GalleryItem } from "./gallery";
import { errorMessage, gallery } from "../stores";

export function spawnWebSocketListener(host: string): WebSocket {
  const ws = new WebSocket(getWsUrl(host));

  ws.addEventListener("open", () => {
    console.log("Connected to the websocket");
  });

  ws.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (Message.isProgress(payload)) {
      gallery.update((state) => {
        const existing = state[payload.data.prompt_id];
        if (existing !== undefined) {
          state[payload.data.prompt_id] = GalleryItem.newQueued(
            existing.id,
            existing.workflow,
            payload.data.value,
            payload.data.max,
            payload.data.node,
          );
        }
        return state;
      });
    } else if (Message.isExecuting(payload)) {
      gallery.update((state) => {
        const existing = state[payload.data.prompt_id];
        if (existing !== undefined && GalleryItem.isQueued(existing)) {
          existing.nodeId = payload.data.node;
        }
        return state;
      });
    } else if (Message.isExecuted(payload)) {
      gallery.update((state) => {
        const existing = state[payload.data.prompt_id];
        if (existing !== undefined) {
          state[payload.data.prompt_id] = GalleryItem.newExecuted(
            existing.id,
            existing.workflow,
            payload.data.output?.images,
          );
        }
        return state;
      });
    } else if (Message.isExecutionError(payload)) {
      gallery.update((state) => {
        const existing = state[payload.data.prompt_id];
        if (existing !== undefined) {
          state[payload.data.prompt_id] = GalleryItem.newFailed(
            existing.id,
            existing.workflow,
            payload.data.exception_message,
            payload.data.exception_type,
            payload.data.node_type,
          );
        }
        return state;
      });
    }
  });

  ws.addEventListener("close", () => {
    errorMessage.set(
      "Disconnected from websocket. Check if the ComfyUI server is running and refresh the page.",
    );
  });

  return ws;
}
