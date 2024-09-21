import * as R from "remeda";
import type { DeepReadonly } from "ts-essentials";

import type { LinkTypeId, NodeLibrary, NodeType, NodeTypeId } from "./comfy";
import { WorkflowStep, type AggregateNodeStep } from "./workflow";
import templates from "../data/templates.json";

export interface PickerTree<A> {
  subtrees: Record<string, PickerTree<A>>;
  leaves: Record<string, A>;
}

export interface NodePickerValue {
  type: string;
}

export namespace NodePickerValue {
  export interface Node extends NodePickerValue {
    type: "node";
    nodeType: NodeType;
  }

  export interface Aggregate extends NodePickerValue {
    type: "aggregate";
    step: AggregateNodeStep;
  }

  export interface WorkflowTemplate extends NodePickerValue {
    type: "workflowTemplate";
    steps: WorkflowStep[];
  }

  export function isNode(value: DeepReadonly<NodePickerValue>): value is Node {
    return value.type === "node";
  }

  export function isAggregate(
    value: DeepReadonly<NodePickerValue>,
  ): value is Aggregate {
    return value.type === "aggregate";
  }

  export function isWorkflowTemplate(
    value: DeepReadonly<NodePickerValue>,
  ): value is WorkflowTemplate {
    return value.type === "workflowTemplate";
  }
}

export function createPickerTree(
  library: DeepReadonly<NodeLibrary>,
): DeepReadonly<PickerTree<NodePickerValue>> {
  return {
    subtrees: {
      "Comfy Node": createNodeTree(library),
      "Utility Step": {
        subtrees: {},
        leaves: R.mapToObj(aggregateNodes, (step) => [
          step.name,
          {
            type: "aggregate",
            step,
          },
        ]),
      },
      "Workflow Template": {
        subtrees: {},
        leaves: R.mapValues(templates, (template) => ({
          type: "workflowTemplate",
          steps: template,
        })),
      },
    },
    leaves: {},
  };
}

function createNodeTree(
  library: DeepReadonly<NodeLibrary>,
): DeepReadonly<PickerTree<NodePickerValue>> {
  const byCategory = R.groupBy(Object.values(library), (node) => node.category);
  const tree: PickerTree<NodePickerValue> = {
    subtrees: {},
    leaves: {},
  };

  for (const [category, nodes] of Object.entries(byCategory)) {
    const parts = category.split("/");
    let current = tree;

    for (const part of parts) {
      if (!current.subtrees[part]) {
        current.subtrees[part] = {
          subtrees: {},
          leaves: {},
        };
      }
      current = current.subtrees[part];
    }
    for (const node of nodes) {
      const value: DeepReadonly<NodePickerValue.Node> = {
        type: "node",
        nodeType: node,
      };
      current.leaves[node.name] = value;
    }
  }
  return tree;
}

const aggregateNodes: DeepReadonly<AggregateNodeStep[]> = [
  WorkflowStep.newAggregate(
    "Prompt",
    "Provides both positive and negative conditioning in a single step.",
    {
      positive: "",
      negative: "",
    },
    [
      {
        type: "CLIPTextEncode" as NodeTypeId,
        outputs: ["POSITIVE_CONDITIONING" as LinkTypeId],
        formMapping: { text: "positive" },
      },
      {
        type: "CLIPTextEncode" as NodeTypeId,
        outputs: ["NEGATIVE_CONDITIONING" as LinkTypeId],
        formMapping: { text: "negative" },
      },
    ],
  ),
  WorkflowStep.newAggregate(
    "Preview",
    "Performs VAEDecode and PreviewImage in a single step.",
    {},
    [
      {
        type: "VAEDecode" as NodeTypeId,
        outputs: ["IMAGE" as LinkTypeId],
        formMapping: {},
      },
      {
        type: "PreviewImage" as NodeTypeId,
        outputs: [],
        formMapping: {},
      },
    ],
  ),
];
