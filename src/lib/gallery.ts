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

  export function isQueued(
    item: DeepReadonly<GalleryItem>,
  ): item is QueuedItem {
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

  export function isCompleted(
    item: DeepReadonly<GalleryItem>,
  ): item is ExecutedItem {
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

  export function isFailed(
    item: DeepReadonly<GalleryItem>,
  ): item is FailedItem {
    return item.type === GalleryItemType.Failed;
  }
}
