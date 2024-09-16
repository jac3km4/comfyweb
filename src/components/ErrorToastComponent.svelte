<script lang="ts">
    import { slide } from "svelte/transition";

    import { Toast } from "flowbite-svelte";
    import { CloseCircleSolid } from "flowbite-svelte-icons";

    export let error: string | undefined = undefined;
    export let timeout: number;

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
            error = undefined;
        }
    }
</script>

<Toast
    color="red"
    class="fixed max-w-96 left-0 right-0 top-4 mx-auto z-10 border-2 border-gray-700 rounded-md shadow"
    transition={slide}
    toastStatus={error !== undefined}
    on:close={() => (error = undefined)}
>
    <svelte:fragment slot="icon"><CloseCircleSolid /></svelte:fragment>
    <div class="text-sm" use:onMount>{error}</div>
    <div class="text-xs my-1">Closing in {counter}s...</div>
</Toast>
