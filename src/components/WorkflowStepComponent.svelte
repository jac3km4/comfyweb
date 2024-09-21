<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { DeepReadonly } from "ts-essentials";

    import { Tooltip } from "flowbite-svelte";
    import { QuestionCircleSolid, TrashBinSolid } from "flowbite-svelte-icons";

    import type { NodeInputSchema } from "../lib/comfy";

    import WorkflowFormComponent from "./WorkflowFormComponent.svelte";

    export let header: string;
    export let fields: Record<string, any>;
    export let schema: DeepReadonly<Record<string, NodeInputSchema>>;
    export let tooltip: string | undefined = undefined;
    export let expanded = false;

    let containsFields = Object.keys(fields).length > 0;

    const dispatcher = createEventDispatcher<{ delete: void }>();
</script>

<div
    class="flex flex-row items-center shadow-inner shadow-zinc-900/40 bg-zinc-800 border-zinc-700 border-t-2 p-1"
    class:border-b-2={expanded && containsFields}
    on:click={() => (expanded = !expanded)}
    role="presentation"
>
    <span class="font-bold flex-1 text-center">{header}</span>
    <QuestionCircleSolid class="hover:cursor-pointer" />
    <Tooltip>{tooltip || header}</Tooltip>
    <TrashBinSolid
        class="fill-red-500 hover:fill-red-300 hover:cursor-pointer"
        withEvents
        on:click={() => dispatcher("delete")}
    />
</div>
{#if expanded && containsFields}
    <div class="py-2 px-3">
        <WorkflowFormComponent {fields} {schema} />
    </div>
{/if}
