<script lang="ts">
    import * as R from "remeda";

    import {
        createComfyWorkflow,
        createPromptRequest,
        getPromptRequestUrl,
    } from "../lib/api";
    import { type PromptError, type PromptResponse } from "../lib/comfy";
    import { GalleryItem } from "../lib/gallery";
    import {
        generateGraphMetadata,
        WorkflowGenerateError,
        WorkflowItem,
        WorkflowStep,
    } from "../lib/workflow";
    import {
        library,
        workflow,
        gallery,
        errorMessage,
        serverHost,
    } from "../stores";

    import SidebarComponent from "../components/SidebarComponent.svelte";

    async function handleEnqueue(items: WorkflowItem[]) {
        const steps = items.map((item) => item.step);
        try {
            const graph = generateGraphMetadata(steps, $library);
            const req = createPromptRequest(graph, steps);
            const res = await fetch(getPromptRequestUrl($serverHost), {
                body: JSON.stringify(req),
                method: "POST",
            });
            if (res.ok) {
                const data = (await res.json()) as PromptResponse;
                gallery.update((state) => {
                    const item = GalleryItem.newQueued(
                        data.prompt_id,
                        R.clone(items),
                    );
                    state[data.prompt_id] = item;
                    return state;
                });
                workflow.update((items) => {
                    for (const { step } of items) {
                        performControlAfterGenerate(step);
                    }
                    return items;
                });
            } else {
                const error: PromptError = await res.json();
                errorMessage.set(formatPromptError(error));
            }
        } catch (error) {
            if (error instanceof WorkflowGenerateError) {
                errorMessage.set(
                    `Could not generate a graph: ${error.message}`,
                );
            } else if (error instanceof Error) {
                errorMessage.set(`Could not send request: ${error.message}`);
            } else {
                console.error(error);
            }
        }
    }

    function handleSaveWorkflow(items: WorkflowItem[]) {
        downloadJson(items.map((item) => item.step));
    }

    function handleSaveAsComfyUIWorkflow(items: WorkflowItem[]) {
        const steps = items.map((item) => item.step);
        const graph = generateGraphMetadata(steps, $library);
        downloadJson(createComfyWorkflow(graph));
    }

    function handleShowError(error: string) {
        errorMessage.set(error);
    }

    function performControlAfterGenerate(step: WorkflowStep) {
        if (WorkflowStep.isNode(step)) {
            if (
                step.form.seed !== undefined &&
                step.form.control_after_generate
            ) {
                switch (step.form.control_after_generate) {
                    case "increment":
                        step.form.seed++;
                        break;
                    case "decrement":
                        step.form.seed--;
                        break;
                    case "randomize":
                        step.form.seed = randomInteger(
                            0,
                            Number.MAX_SAFE_INTEGER,
                        );
                        break;
                }
            }
        }
    }

    function formatPromptError(error: PromptError): string {
        let message = `${error.error.message}. `;
        for (const [, e] of Object.entries(error.node_errors ?? {})) {
            message += `${e.class_type}: ${e.errors.map((e) => e.message).join(", ")}. `;
        }
        return message;
    }

    function randomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function downloadJson(data: any) {
        const file = new Blob([JSON.stringify(data)], {
            type: "application/json",
        });
        const saver = document.createElement("a");
        const href = (saver.href = URL.createObjectURL(file));
        saver.download = "workflow.json";

        const body = document.body;
        body.appendChild(saver);
        saver.click();

        setTimeout(() => {
            document.body.removeChild(saver);
            window.URL.revokeObjectURL(href);
        }, 0);
    }
</script>

<SidebarComponent
    bind:workflow={$workflow}
    bind:serverHost={$serverHost}
    library={$library}
    on:enqueue={(ev) => handleEnqueue(ev.detail)}
    on:saveWorkflow={(ev) => handleSaveWorkflow(ev.detail)}
    on:saveAsComfyUIWorkflow={(ev) => handleSaveAsComfyUIWorkflow(ev.detail)}
    on:showError={(ev) => handleShowError(ev.detail)}
/>
