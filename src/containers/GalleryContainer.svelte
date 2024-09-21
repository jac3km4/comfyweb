<script lang="ts">
    import * as R from "remeda";
    import type { DeepReadonly } from "ts-essentials";

    import {
        getImageUrl,
        getInterruptRequestUrl,
        getQueueRequestUrl,
    } from "../lib/api";
    import type { QueueDeleteRequest } from "../lib/comfy";
    import { GalleryItem, type ExecutedItem } from "../lib/gallery";
    import { errorMessage, gallery, workflow, serverHost } from "../stores";

    import GalleryComponent from "../components/GalleryComponent.svelte";
    import ImagePreviewComponent from "../components/ImagePreviewComponent.svelte";

    let openImageId: [string, number] | undefined = undefined;

    $: items = R.reverse(Object.values($gallery));
    $: openImage =
        openImageId !== undefined
            ? ($gallery[openImageId[0]] as ExecutedItem)?.images?.[
                  openImageId[1]
              ]
            : undefined;

    function handleOpenImage(id: string, index: number) {
        openImageId = [id, index];
    }

    function handleLoad(item: DeepReadonly<GalleryItem>) {
        workflow.set(item.workflow.map((it) => R.clone(it)));
    }

    async function handleDelete(item: DeepReadonly<GalleryItem>) {
        if (GalleryItem.isQueued(item)) {
            if (item.nodeId !== undefined) {
                const resp = await fetch(getInterruptRequestUrl($serverHost), {
                    method: "POST",
                });
                if (!resp.ok) {
                    errorMessage.set("Failed to interrupt the workflow");
                    console.error(resp);
                }
            } else {
                const req: QueueDeleteRequest = {
                    delete: [item.id],
                };
                const resp = await fetch(getQueueRequestUrl($serverHost), {
                    body: JSON.stringify(req),
                    method: "POST",
                });
                if (!resp.ok) {
                    errorMessage.set("Failed to delete the item from queue");
                    console.error(resp);
                }
            }
        }

        gallery.update((state) => {
            delete state[item.id];
            return state;
        });
    }

    function handleNavigatePreview(dir: "prev" | "next") {
        if (openImageId === undefined) return;
        const [itemId, imageIdx] = openImageId;
        let itemIdx = items.findIndex((item) => item.id === itemId);
        if (itemIdx === -1) return;
        const item = items[itemIdx];
        if (!GalleryItem.isExecuted(item) || item.images === undefined) return;

        if (dir === "prev") {
            if (itemIdx === 0 && imageIdx === 0) return;

            if (imageIdx === 0) {
                let prevItem = items[--itemIdx];
                for (
                    ;
                    !GalleryItem.isExecuted(prevItem) ||
                    prevItem.images === undefined;
                    prevItem = items[--itemIdx]
                ) {
                    if (itemIdx === 0) return;
                }
                openImageId = [prevItem.id, prevItem.images.length - 1];
            } else {
                openImageId = [itemId, imageIdx - 1];
            }
        } else {
            if (
                itemIdx === items.length - 1 &&
                imageIdx === item.images.length - 1
            ) {
                return;
            }

            if (imageIdx === item.images.length - 1) {
                let nextItem = items[++itemIdx];
                for (
                    ;
                    !GalleryItem.isExecuted(nextItem) ||
                    nextItem.images === undefined;
                    nextItem = items[++itemIdx]
                ) {
                    if (itemIdx === items.length - 1) return;
                }
                openImageId = [nextItem.id, 0];
            } else {
                openImageId = [itemId, imageIdx + 1];
            }
        }
    }
</script>

<GalleryComponent
    {items}
    getImageUrl={(img, key) => getImageUrl($serverHost, img, key)}
    on:openImage={(ev) => handleOpenImage(ev.detail.id, ev.detail.index)}
    on:deleteItem={(ev) => handleDelete(ev.detail)}
    on:loadItem={(ev) => handleLoad(ev.detail)}
/>
<ImagePreviewComponent
    image={openImage}
    getImageUrl={(img, key) => getImageUrl($serverHost, img, key)}
    on:navigate={(ev) => handleNavigatePreview(ev.detail)}
    on:close={() => (openImageId = undefined)}
/>
