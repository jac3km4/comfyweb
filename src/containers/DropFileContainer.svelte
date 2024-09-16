<script lang="ts">
    import {
        loadFromDataTransfer,
        WorkflowItem,
        WorkflowLoadError,
        WorkflowLoadRequestError,
    } from "../lib/workflow";
    import { errorMessage, library, workflow } from "../stores";

    async function handleDrop(event: DragEvent) {
        if (event.dataTransfer) {
            try {
                const steps = await loadFromDataTransfer(
                    event.dataTransfer,
                    $library,
                );
                if (steps) {
                    workflow.set(
                        steps.map((step) => WorkflowItem.fromStep(step)),
                    );
                }
            } catch (error) {
                if (error instanceof WorkflowLoadRequestError) {
                    errorMessage.set(
                        `Could not load workflow from file: ${error.message}`,
                    );
                } else if (error instanceof WorkflowLoadError) {
                    errorMessage.set(
                        `Failed to create a workflow from file: ${error.message}`,
                    );
                } else {
                    console.error(error);
                }
            }
        }
    }
</script>

<svelte:window on:drop|preventDefault={handleDrop} on:dragover|preventDefault />
