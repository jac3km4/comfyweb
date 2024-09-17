export type NodeId = number & { [NodeIdSym]: never };
declare const NodeIdSym: unique symbol;

export type NodeTypeId = string & { [NodeTypeIdSym]: never };
declare const NodeTypeIdSym: unique symbol;

export type LinkId = number & { [LinkIdSym]: never };
declare const LinkIdSym: unique symbol;

export type SlotId = number & { [SlotIdSym]: never };
declare const SlotIdSym: unique symbol;

export type LinkTypeId = string & { [LinkTypeIdSym]: never };
declare const LinkTypeIdSym: unique symbol;

export type PromptId = string & { [PromptIdSym]: never };
declare const PromptIdSym: unique symbol;

export type Link = [LinkId, NodeId, SlotId, NodeId, SlotId];

export interface Workflow {
  links: Link[];
  nodes: Node[];
}

export interface Node {
  id: NodeId;
  order: number;
  type: NodeTypeId;
  inputs?: NodeInput[];
  outputs?: NodeOutput[];
  widgets_values?: any[];
}

export namespace Node {
  export interface Primitive extends Node {
    inputs: undefined;
    outputs: [NodeOutput];
    widgets_values: [any, PrimitiveControl];
  }

  export function isPrimitive(node: Node): node is Primitive {
    return node.type === "PrimitiveNode";
  }
}

export interface NodeInput {
  name: string;
  type: LinkTypeId;
  link: LinkId;
}

export interface NodeOutput {
  name: string;
  type: LinkTypeId;
  links?: LinkId[];
  slot_index?: SlotId;
}

export type NodeLibrary = Record<NodeTypeId, NodeType>;

export interface NodeType {
  name: NodeTypeId;
  description: string;
  category: string;
  input: {
    required?: Record<string, NodeInputSchema>;
    optional?: Record<string, NodeInputSchema>;
  };
  input_order: {
    required?: string[];
    optional?: string[];
  };
  output: LinkTypeId[];
  output_node: boolean;
}

export type NodeInputSchema =
  | NodeInputSchema.Primitive<keyof NodeInputSchema.Primitives>
  | [string[]]
  | [LinkTypeId];

export type PrimitiveControl = "fixed" | "randomized" | "increment";

export namespace NodeInputSchema {
  export type Primitive<K extends keyof Primitives> = [K, Primitives[K][1]];

  export interface Primitives {
    BOOL: [boolean, BoolProps];
    INT: [number, NumberProps<number>];
    FLOAT: [number, NumberProps<number>];
    STRING: [string, StringProps];
  }

  export interface NumberProps<A> {
    default?: A;
    min?: A;
    max?: A;
    step?: A;
  }

  export interface StringProps {
    multiline?: boolean;
    dynamic_prompt?: boolean;
  }

  export interface BoolProps {
    default?: boolean;
  }

  export function isBool(i: NodeInputSchema): i is Primitive<"BOOL"> {
    return i[0] === "BOOL";
  }

  export function isInt(i: NodeInputSchema): i is Primitive<"INT"> {
    return i[0] === "INT";
  }

  export function isFloat(i: NodeInputSchema): i is Primitive<"FLOAT"> {
    return i[0] === "FLOAT";
  }

  export function isString(i: NodeInputSchema): i is Primitive<"STRING"> {
    return i[0] === "STRING";
  }

  export function isList(i: NodeInputSchema): i is [string[]] {
    return Array.isArray(i[0]);
  }

  export function isLink(i: NodeInputSchema): i is [LinkTypeId] {
    return !(isBool(i) || isInt(i) || isFloat(i) || isString(i) || isList(i));
  }
}

export interface PromptRequest {
  client_id: string;
  extra_data?: { extra_pnginfo: { workflow: Workflow } & any };
  prompt: Record<string, PromptNodeInfo>;
}

export interface PromptNodeInfo {
  class_type: NodeTypeId;
  inputs: Record<string, any>;
}

export interface QueueDeleteRequest {
  delete: PromptId[];
}

export interface PromptResponse {
  prompt_id: PromptId;
  number: number;
  node_errors: Record<NodeId, string>;
}

export interface PromptError {
  error: {
    type: string;
    message: string;
    details: string;
  };
  node_errors?: Record<
    string,
    {
      class_type: string;
      errors: { type: string; message: string }[];
    }
  >;
}

export interface Message<T> {
  type:
    | "status"
    | "progress"
    | "execution_start"
    | "execution_cached"
    | "execution_error"
    | "executing"
    | "executed"
    | "execution_success";
  data: T;
}

export interface StatusMessage {
  status: {
    exec_info: {
      queue_remaining: number;
    };
  };
}

export interface ProgressMessage {
  value: number;
  max: number;
  prompt_id: PromptId;
  node?: string;
}

export interface ExecutionStartMessage {
  prompt_id: PromptId;
  timestamp: number;
}

export interface ExecutionCachedMessage {
  prompt_id: PromptId;
  timestamp: number;
}

export interface ExecutionErrorMessage {
  prompt_id: PromptId;
  node_id: string;
  node_type: NodeTypeId;
  exception_message: string;
  exception_type: string;
  traceback: string[];
  timestamp: number;
}

export interface ExecutingMessage {
  prompt_id: PromptId;
  node: string;
}

export interface ExecutedMessage {
  prompt_id: PromptId;
  node: string;
  output: {
    images?: ImageOutput[];
  };
}

export interface ExecutionSuccessMessage {
  prompt_id: PromptId;
  timestamp: number;
}

export namespace Message {
  export function isStatus(m: Message<any>): m is Message<StatusMessage> {
    return m.type === "status";
  }

  export function isProgress(m: Message<any>): m is Message<ProgressMessage> {
    return m.type === "progress";
  }

  export function isExecutionStart(
    m: Message<any>,
  ): m is Message<ExecutionStartMessage> {
    return m.type === "execution_start";
  }

  export function isExecutionCached(
    m: Message<any>,
  ): m is Message<ExecutionCachedMessage> {
    return m.type === "execution_cached";
  }

  export function isExecutionError(
    m: Message<any>,
  ): m is Message<ExecutionErrorMessage> {
    return m.type === "execution_error";
  }

  export function isExecuting(m: Message<any>): m is Message<ExecutingMessage> {
    return m.type === "executing";
  }

  export function isExecuted(m: Message<any>): m is Message<ExecutedMessage> {
    return m.type === "executed";
  }

  export function isExecutionSuccess(
    m: Message<any>,
  ): m is Message<ExecutionSuccessMessage> {
    return m.type === "execution_success";
  }
}

export interface ImageOutput {
  filename: string;
  subfolder: string;
  type: string;
}
