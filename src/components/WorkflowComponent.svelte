<script lang="ts">
    import * as R from "remeda";
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";

    import { NodeInputSchema, type NodeLibrary } from "../lib/comfy";
    import { WorkflowStep, type WorkflowItem } from "../lib/workflow";

    import WorkflowStepComponent from "./WorkflowStepComponent.svelte";

    export let items: WorkflowItem[];
    export let library: NodeLibrary;
    const flipDurationMs = 200;

    function handleUpdate(updated: WorkflowItem[]) {
        items = updated;
    }

    function handleDelete(i: number) {
        items.splice(i, 1);
    }

    function createStepProps(
        step: WorkflowStep,
        library: NodeLibrary,
    ): {
        header: string;
        tooltip: string;
        fields: Record<string, any>;
        schema: Record<string, NodeInputSchema>;
    } {
        if (WorkflowStep.isNode(step)) {
            const type = library[step.nodeType];
            const schema = R.mapValues<Record<string, any>, NodeInputSchema>(
                step.form,
                (_, key) =>
                    key === "control_after_generate"
                        ? [["fixed", "increment", "decrement", "randomize"]]
                        : (type.input.required?.[key] ??
                              type.input.optional?.[key])!,
            );
            return {
                header: step.nodeType,
                tooltip: type.description,
                fields: step.form,
                schema,
            };
        } else if (WorkflowStep.isPrimitive(step)) {
            return {
                header: "Primitive",
                tooltip: `Primitive node of type ${step.outputType}`,
                fields: step,
                schema: { value: [step.outputType] },
            };
        } else if (WorkflowStep.isShift(step)) {
            return {
                header: `Shift ${step.outputType.toLowerCase()}`,
                tooltip: `Shifts the the buffer of ${step.outputType}`,
                fields: step,
                schema: { count: ["INT", {}] },
            };
        } else if (WorkflowStep.isAggregate(step)) {
            const schema: Record<string, NodeInputSchema> = {};
            for (const node of step.nodes) {
                for (const from in node.formMapping) {
                    const to = node.formMapping[from];
                    const type = library[node.type].input.required?.[from];
                    if (type !== undefined) schema[to] = type;
                }
            }
            return {
                header: step.name,
                tooltip: step.description,
                fields: step.form,
                schema,
            };
        } else {
            throw "unreachable";
        }
    }
</script>

{#if items.length === 0}
    <div class="mx-4 my-4 text-center text-xs text-zinc-600">
        You can drag an image or a workflow generated with ComfyUI on the page
        to get started. You can also load a template by clicking 'Add' ->
        'Workflow Template' and then picking something from the list.
    </div>
{:else}
    <section
        use:dndzone={{ items, flipDurationMs }}
        on:consider={(ev) => handleUpdate(ev.detail.items)}
        on:finalize={(ev) => handleUpdate(ev.detail.items)}
    >
        {#each items as item, idx (item.id)}
            <div
                class="border-zinc-700 last:border-b-2"
                animate:flip={{ duration: flipDurationMs }}
            >
                <WorkflowStepComponent
                    {...createStepProps(item.step, library)}
                    bind:expanded={item.expanded}
                    on:delete={() => handleDelete(idx)}
                />
            </div>
        {/each}
    </section>
{/if}
