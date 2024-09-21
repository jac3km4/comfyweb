import type { DeepReadonly } from "ts-essentials";
import type { ImageOutput, NodeTypeId, PromptId } from "./comfy";
import type { WorkflowItem } from "./workflow";

export type RetrieveImageUrl = (
  image: Readonly<ImageOutput>,
  key?: string,
) => string;

export interface GalleryItem {
  id: PromptId;
  type: GalleryItemType;
  workflow: WorkflowItem[];
}

export interface QueuedItem extends GalleryItem {
  current: number;
  max: number;
  nodeId?: string;
}

export interface ExecutedItem extends GalleryItem {
  images?: ImageOutput[];
}

export interface FailedItem extends GalleryItem {
  errorMessage: string;
  errorType: string;
  nodeTypeId: NodeTypeId;
}

export enum GalleryItemType {
  Queued,
  Executed,
  Failed,
}

export namespace GalleryItem {
  export function newQueued(
    id: PromptId,
    workflow: WorkflowItem[],
    current: number = 0,
    max: number = Number.MAX_VALUE,
    nodeId?: string,
  ): QueuedItem {
    return {
      id,
      type: GalleryItemType.Queued,
      workflow,
      current,
      max,
      nodeId,
    };
  }

  export function isQueued(item: GalleryItem): item is QueuedItem;
  export function isQueued(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<QueuedItem>;

  export function isQueued(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<QueuedItem> {
    return item.type === GalleryItemType.Queued;
  }

  export function newExecuted(
    id: PromptId,
    pipeline: WorkflowItem[],
    images?: ImageOutput[],
  ): ExecutedItem {
    return {
      id,
      type: GalleryItemType.Executed,
      workflow: pipeline,
      images,
    };
  }

  export function isExecuted(item: GalleryItem): item is ExecutedItem;
  export function isExecuted(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<ExecutedItem>;

  export function isExecuted(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<ExecutedItem> {
    return item.type === GalleryItemType.Executed;
  }

  export function newFailed(
    id: PromptId,
    workflow: WorkflowItem[],
    errorMessage: string,
    errorType: string,
    nodeTypeId: NodeTypeId,
  ): FailedItem {
    return {
      id,
      type: GalleryItemType.Failed,
      workflow,
      errorMessage,
      errorType,
      nodeTypeId,
    };
  }

  export function isFailed(item: GalleryItem): item is FailedItem;
  export function isFailed(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<FailedItem>;

  export function isFailed(
    item: DeepReadonly<GalleryItem>,
  ): item is DeepReadonly<FailedItem> {
    return item.type === GalleryItemType.Failed;
  }
}
