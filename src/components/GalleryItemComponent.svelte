<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { Alert, Card, Progressbar } from "flowbite-svelte";
    import { FileImportSolid, TrashBinSolid } from "flowbite-svelte-icons";

    import { GalleryItem } from "../lib/gallery";
    import type { WorkflowItem } from "../lib/workflow";
    import type { ImageOutput } from "../lib/comfy";

    export let item: GalleryItem;
    export let getImageUrl: (img: ImageOutput, key?: string) => string;

    const dispatch = createEventDispatcher<{
        open: { index: number };
        delete: void;
        load: void;
    }>();

    function generateDescription(items: WorkflowItem[]): string | undefined {
        const fields: string[] = ["prompt", "positive", "text"];

        for (const field of fields) {
            const result: any = items.find(
                (item) => (item.step as any).form?.[field],
            );
            if (result !== undefined) {
                return result.step.form[field];
            }
        }
    }
</script>

<Card class="h-full" padding="xs">
    <div class="flex flex-row-reverse">
        <TrashBinSolid
            class="fill-red-500 hover:fill-red-300 hover:cursor-pointer mr-0.5"
            withEvents
            on:click={() => dispatch("delete")}
        />
        <FileImportSolid
            class="fill-zinc-500 hover:fill-zinc-300 hover:cursor-pointer mr-0.5"
            withEvents
            on:click={() => dispatch("load")}
        />
    </div>
    {#if GalleryItem.isQueued(item)}
        <div class="h-full flex flex-col justify-center p-1">
            <span
                class="max-h-8 text-center overflow-hidden whitespace-break-spaces text-xs my-1.5"
            >
                {generateDescription(item.workflow) ?? "no description"}
            </span>
            <span class="text-xs text-center my-1">
                {#if item.nodeId}
                    Node {parseInt(item.nodeId) + 1}
                {:else}
                    In queue
                {/if}
            </span>
            <Progressbar
                progress={(item.current / item.max) * 100.0}
                animate
                color="indigo"
                size="h-4"
                labelInside={item.nodeId !== undefined}
            />
        </div>
    {:else if GalleryItem.isCompleted(item)}
        <div
            class={`grid grid-cols-${Math.ceil(Math.sqrt(item.images?.length ?? 0))}`}
        >
            {#each item.images ?? [] as image, index}
                <div class="p-1">
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img
                        class="shadow-sm shadow-zinc-900 rounded hover:cursor-pointer hover:brightness-125"
                        alt={image.filename}
                        src={getImageUrl(image, item.id)}
                        on:click={() => dispatch("open", { index })}
                    />
                </div>
            {/each}
        </div>
    {:else if GalleryItem.isFailed(item)}
        <div class="h-full flex flex-col justify-center p-1">
            <Alert color="red" class="text-xs">
                <span class="max-h-16 overflow-hidden">
                    Error at {item.nodeTypeId}: {item.errorMessage}
                </span>
            </Alert>
        </div>
    {/if}
</Card>
