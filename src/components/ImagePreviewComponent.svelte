<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { Modal } from "flowbite-svelte";

    import type { ImageOutput } from "../lib/comfy";
    import type { RetrieveImageUrl } from "../lib/gallery";

    export let image: Readonly<ImageOutput> | undefined;
    export let getImageUrl: RetrieveImageUrl;

    const dispatch = createEventDispatcher<{
        navigate: "next" | "prev";
        close: void;
    }>();

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") {
            dispatch("navigate", "prev");
        } else if (event.key === "ArrowRight") {
            dispatch("navigate", "next");
        }
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<Modal
    open={image !== undefined}
    autoclose
    size="xl"
    bodyClass="flex flex-row justify-center"
    on:close={() => dispatch("close")}
>
    {#if image !== undefined}
        <img alt={image.filename} src={getImageUrl(image)} />
    {/if}
</Modal>
