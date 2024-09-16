<script lang="ts">
    import {
        Toggle,
        Input,
        NumberInput,
        Select,
        Label,
        Textarea,
    } from "flowbite-svelte";

    import { NodeInputSchema } from "../lib/comfy";

    export let fields: Record<string, any>;
    export let schema: Record<string, NodeInputSchema>;
</script>

<div class="grid grid-flow-row grid-cols-[1fr_4fr] gap-2">
    {#each Object.entries(schema) as [name, input] (name)}
        <Label class="text-left my-auto">{name.replaceAll("_", " ")}</Label>
        {#if NodeInputSchema.isBool(input)}
            <Toggle size="small" bind:checked={fields[name]} />
        {:else if NodeInputSchema.isInt(input)}
            <Input
                type="number"
                step={input[1].step ?? 1}
                min={input[1].min}
                max={input[1].max}
                size="sm"
                bind:value={fields[name]}
            />
        {:else if NodeInputSchema.isFloat(input)}
            <Input
                type="number"
                step={input[1].step}
                min={input[1].min}
                max={input[1].max}
                size="sm"
                bind:value={fields[name]}
            />
        {:else if (NodeInputSchema.isString(input) && name === "prompt") || name == "positive"}
            <Textarea class="min-h-48" size="sm" bind:value={fields[name]} />
        {:else if NodeInputSchema.isString(input)}
            <Input type="text" size="sm" bind:value={fields[name]} />
        {:else if NodeInputSchema.isList(input)}
            <Select
                size="sm"
                items={input[0].map((name) => ({ value: name, name }))}
                bind:value={fields[name]}
            />
        {/if}
    {/each}
</div>
