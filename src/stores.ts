import { readable, writable, type Readable, type Writable } from "svelte/store";

import { getObjectInfoUrl, patchLibrary } from "./lib/api";
import type { NodeLibrary } from "./lib/comfy";
import type { GalleryItem } from "./lib/gallery";
import type { WorkflowItem } from "./lib/workflow";

export const infoMessage: Writable<string | undefined> = writable();
export const errorMessage: Writable<string | undefined> = writable(
  undefined,
  (set) => {
    infoMessage.subscribe(() => set(undefined));
  },
);

export const serverHost: Writable<string> = writable("127.0.0.1:8188");

export const library: Readable<NodeLibrary> = readable<NodeLibrary>(
  {},
  (set) => {
    serverHost.subscribe((host) => {
      fetch(getObjectInfoUrl(host))
        .then((resp) => {
          if (!resp.ok) throw new Error("Failed to fetch node library");
          return resp.json();
        })
        .then((resp) => {
          patchLibrary(resp);
          set(resp);
        });
    });
  },
);

export const gallery: Writable<Record<string, GalleryItem>> = writable({});

export const workflow: Writable<WorkflowItem[]> = writable([]);
