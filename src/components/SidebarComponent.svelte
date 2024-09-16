<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { Button, Input, Label, TabItem, Tabs } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";

    import { type NodeLibrary } from "../lib/comfy";
    import { createPickerTree, PickerValue } from "../lib/picker";
    import { WorkflowItem, WorkflowStep } from "../lib/workflow";

    import TreeDropdownComponent from "./TreeDropdownComponent.svelte";
    import WorkflowComponent from "./WorkflowComponent.svelte";

    export let workflow: WorkflowItem[];
    export let library: NodeLibrary;
    export let serverHost: string;

    const dispatch = createEventDispatcher<{
        enqueue: WorkflowItem[];
        saveWorkflow: WorkflowItem[];
        saveAsComfyUIWorkflow: WorkflowItem[];
    }>();

    function onDropdownSelect(value: PickerValue) {
        if (PickerValue.isNode(value)) {
            workflow = [
                ...workflow,
                WorkflowItem.fromStep(
                    WorkflowStep.newNodeWithType(value.nodeType),
                    true,
                ),
            ];
        } else if (PickerValue.isAggregate(value)) {
            workflow = [...workflow, WorkflowItem.fromStep(value.step, true)];
        } else if (PickerValue.isWorkflowTemplate(value)) {
            workflow = value.steps.map((step) =>
                WorkflowItem.fromStep(step, true),
            );
        }
    }
</script>

<div class="w-[568px] h-full flex flex-col border-r-2 border-zinc-700">
    <Tabs tabStyle="underline" contentClass="overflow-y-scroll">
        <TabItem open title="Workflow">
            <WorkflowComponent bind:items={workflow} {library} />
        </TabItem>
        <TabItem title="Manage">
            <div class="p-4 grid grid-cols-1 gap-2">
                <Button
                    color="light"
                    on:click={() => dispatch("saveWorkflow", workflow)}
                >
                    Save workflow
                </Button>
                <Button
                    color="light"
                    on:click={() => dispatch("saveAsComfyUIWorkflow", workflow)}
                >
                    Save as ComfyUI workflow
                </Button>

                <h2 class="mt-4">Settings</h2>
                <Label for="url">ComfyUI server host</Label>
                <Input id="url" type="text" bind:value={serverHost} />
            </div>
        </TabItem>

        <div class="flex flex-row flex-1 align-middle justify-end">
            <Button color="light" size="sm" class="my-2 mr-1">
                Add
                <ChevronDownOutline class="ms-2" />
            </Button>
            <TreeDropdownComponent
                tree={createPickerTree(library)}
                on:select={(ev) => onDropdownSelect(ev.detail)}
            />
            <Button
                class="my-2 mr-1"
                size="sm"
                color="purple"
                on:click={() => dispatch("enqueue", workflow)}
            >
                Enqueue
            </Button>
        </div>
    </Tabs>
</div>
