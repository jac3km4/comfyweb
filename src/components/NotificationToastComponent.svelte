<script lang="ts">
    import { slide } from "svelte/transition";

    import { Toast } from "flowbite-svelte";
    import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";

    export let message: string | undefined = undefined;
    export let timeout: number;
    export let type: "error" | "info";

    let timer: number | undefined;
    let counter: number = timeout;

    function onMount(el: HTMLElement) {
        counter = timeout;
        setTimeout(onTick, 1000);
    }

    function onTick() {
        if (--counter > 0) {
            clearTimeout(timer);
            timer = setTimeout(onTick, 1000);
        } else {
            message = undefined;
        }
    }
</script>

<Toast
    color={type === "error" ? "red" : "blue"}
    class="fixed max-w-96 left-0 right-0 top-4 mx-auto z-10 border-2 border-gray-700 rounded-md shadow"
    transition={slide}
    toastStatus={message !== undefined}
    on:close={() => (message = undefined)}
>
    <svelte:fragment slot="icon">
        {#if type === "error"}
            <CloseCircleSolid />
        {:else}
            <CheckCircleSolid />
        {/if}
    </svelte:fragment>
    <div class="text-sm" use:onMount>{message}</div>
    <div class="text-xs my-1">Closing in {counter}s...</div>
</Toast>
