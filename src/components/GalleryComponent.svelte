<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type DeepReadonly } from "ts-essentials";

    import type { ImageOutput, PromptId } from "../lib/comfy";
    import { GalleryItem, type RetrieveImageUrl } from "../lib/gallery";

    import GalleryItemComponent from "./GalleryItemComponent.svelte";

    export let items: GalleryItem[] = [];
    export let getImageUrl: RetrieveImageUrl;

    const dispatch = createEventDispatcher<{
        openImage: { id: PromptId; index: number };
        deleteItem: DeepReadonly<GalleryItem>;
        loadItem: DeepReadonly<GalleryItem>;
    }>();
</script>

<div
    class="flex flex-row flex-wrap content-start items-stretch w-full p-2 overflow-y-scroll dotted-bg"
>
    {#each items as item (item.id)}
        <div class="p-1.5 w-56 min-h-32">
            <GalleryItemComponent
                {item}
                {getImageUrl}
                on:open={(ev) =>
                    dispatch("openImage", {
                        id: item.id,
                        index: ev.detail.index,
                    })}
                on:delete={() => dispatch("deleteItem", item)}
                on:load={() => dispatch("loadItem", item)}
            />
        </div>
    {/each}
</div>

<style>
    .dotted-bg {
        --dot-bg: theme("colors.zinc.900");
        --dot-color: theme("colors.zinc.600");
        --dot-size: 1px;
        --dot-space: 22px;
        background:
            linear-gradient(
                    90deg,
                    var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
                    transparent 1%
                )
                center / var(--dot-space) var(--dot-space),
            linear-gradient(
                    var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
                    transparent 1%
                )
                center / var(--dot-space) var(--dot-space),
            var(--dot-color);
    }
</style>
