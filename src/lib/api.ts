import * as R from "remeda";

import {
  NodeInputSchema,
  type ImageOutput,
  type LinkTypeId,
  type NodeLibrary,
  type PromptNodeInfo,
  type PromptRequest,
  type Workflow,
} from "./comfy";
import {
  generateGraphMetadata,
  WorkflowStep,
  type GraphMetadata,
} from "./workflow";

export const clientId = R.randomString(8);

export function getImageUrl(host: string, image: ImageOutput): string {
  return `http://${host}/api/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}&rand=${Math.random()}`;
}

export function getPromptRequestUrl(host: string): string {
  return `http://${host}/api/prompt`;
}

export function getQueueRequestUrl(host: string): string {
  return `http://${host}/api/queue`;
}

export function getInterruptRequestUrl(host: string): string {
  return `http://${host}/api/interrupt`;
}

export function getObjectInfoUrl(host: string): string {
  return `http://${host}/api/object_info`;
}

export function getWsUrl(host: string): string {
  return `ws://${host}/ws?clientId=${clientId}`;
}

export function createComfyWorkflow(graph: GraphMetadata): Workflow {
  return {
    nodes: graph.nodes.map(([node]) => node),
    links: graph.edges.map((edge) => [
      edge.id,
      edge.source,
      edge.sourceSlot,
      edge.target,
      edge.targetSlot,
    ]),
  };
}

export function createPromptRequest(
  graph: GraphMetadata,
  steps?: WorkflowStep[],
): PromptRequest {
  const workflow = createComfyWorkflow(graph);

  const prompt: Record<string, PromptNodeInfo> = {};

  for (const [node, item] of graph.nodes) {
    let inputs: Record<string, any> = {};
    if (WorkflowStep.isNode(item)) {
      inputs = R.clone(item.form);
    } else if (WorkflowStep.isPrimitive(item)) {
      inputs = { value: item.value };
    }

    for (const input of node.inputs ?? []) {
      const index = R.sortedIndexWith(
        graph.edges,
        (edge) => edge.id < input.link,
      );
      const edge = graph.edges[index];
      inputs[input.name] = [edge.source.toString(), edge.sourceSlot];
    }
    prompt[node.id.toString()] = {
      inputs,
      class_type: node.type,
    };
  }

  return {
    client_id: clientId,
    prompt,
    extra_data: {
      extra_pnginfo: {
        workflow,
        steps,
      },
    },
  };
}

export function patchLibrary(library: NodeLibrary) {
  for (const node of Object.values(library)) {
    for (const [name, schema] of Object.entries(node.input.required)) {
      if (
        NodeInputSchema.isLink(schema) &&
        name == "positive" &&
        schema[0] === "CONDITIONING"
      ) {
        schema[0] = "POSITIVE_CONDITIONING" as LinkTypeId;
      } else if (
        NodeInputSchema.isLink(schema) &&
        name == "negative" &&
        schema[0] === "CONDITIONING"
      ) {
        schema[0] = "NEGATIVE_CONDITIONING" as LinkTypeId;
      }
    }
  }
}
