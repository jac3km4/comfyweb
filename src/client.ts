import {
  Input,
  type Connection,
  type NodeId,
  type PropertyKey,
  type SDNode,
  type Widget,
  type WidgetKey,
} from './types'

interface PromptRequest {
  client_id?: string
  prompt: Record<NodeId, Node>
}

interface PromptResponse {
  error?: string
}

interface Node {
  class_type: WidgetKey
  inputs: Record<PropertyKey, any>
}

interface Queue {
  queue_running: QueueItem[]
  queue_pending: QueueItem[]
}

type QueueItem = [number, number, Record<NodeId, Node>, { client_id?: string }]

type History = Record<string, HistoryItem>

interface HistoryItem {
  prompt: QueueItem
  outputs: Record<NodeId, Record<PropertyKey, any>>
}

export async function getWidgetLibrary(): Promise<Record<string, Widget>> {
  return await fetch('/object_info').then(async (r) => await r.json())
}

export async function getQueue(): Promise<Queue> {
  return await fetch('/queue').then(async (r) => await r.json())
}

export async function deleteFromQueue(id: number): Promise<void> {
  await fetch('/queue', {
    method: 'POST',
    body: JSON.stringify({ delete: [id] }),
  })
}

export async function getHistory(): Promise<History> {
  return await fetch('/history').then(async (r) => await r.json())
}

export async function sendPrompt(prompt: PromptRequest): Promise<PromptResponse> {
  const resp = await fetch('/prompt', {
    method: 'POST',
    body: JSON.stringify(prompt),
  })
  const error = resp.status !== 200 ? await resp.text() : undefined
  return { error }
}

export function createPrompt(
  graph: Record<string, SDNode>,
  widgets: Record<string, Widget>,
  connections: Connection[],
  clientId?: string
): PromptRequest {
  const prompt: Record<NodeId, Node> = {}

  for (const [id, node] of Object.entries(graph)) {
    const inputs = { ...node.fields }
    for (const [property, value] of Object.entries(inputs)) {
      const input = widgets[node.widget].input.required[property]
      if (Input.isInt(input) && input[1].randomizable === true && value === -1) {
        inputs[property] = Math.random() * Number.MAX_SAFE_INTEGER
      }
    }

    prompt[id] = {
      class_type: node.widget,
      inputs,
    }
  }

  for (const edge of connections) {
    const source = graph[edge.source]
    if (source === undefined) {
      continue
    }
    const outputIndex = widgets[source.widget].output.findIndex((f) => f === edge.sourceHandle)
    prompt[edge.target].inputs[edge.targetHandle] = [edge.source, outputIndex]
  }

  return { prompt, client_id: clientId }
}
