import { create } from 'zustand'
import {
  type Edge,
  type Node,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  type XYPosition,
} from 'reactflow'
import { createPrompt, deleteFromQueue, getQueue, getWidgetLibrary as getWidgets, sendPrompt } from './client'
import {
  type GalleryItem,
  type QueueItem,
  type Connection,
  type NodeId,
  type NodeInProgress,
  type PropertyKey,
  SDNode,
  type Widget,
  type WidgetKey,
} from './types'
import {
  retrieveLocalWorkflow,
  saveLocalWorkflow,
  writeWorkflowToFile,
  type PersistedGraph,
  type PersistedNode,
} from './persistence'
import { NODE_IDENTIFIER } from './components/NodeComponent'

export type OnPropChange = (node: NodeId, property: PropertyKey, value: any) => void

export interface AppState {
  counter: number
  clientId?: string
  widgets: Record<WidgetKey, Widget>
  graph: Record<NodeId, SDNode>
  nodes: Node[]
  edges: Edge[]
  nodeInProgress?: NodeInProgress
  promptError?: string
  queue: QueueItem[]
  gallery: GalleryItem[]
  previewedImageIndex?: number
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onPropChange: OnPropChange
  onAddNode: (widget: Widget, node?: SDNode, pos?: XYPosition, key?: number) => void
  onDeleteNode: (id: NodeId) => void
  onDuplicateNode: (id: NodeId) => void
  onSubmit: () => Promise<void>
  onDeleteFromQueue: (id: number) => Promise<void>
  onInit: () => Promise<void>
  onLoadWorkflow: (persisted: PersistedGraph) => void
  onSaveWorkflow: () => void
  onPersistLocal: () => void
  onNewClientId: (id: string) => void
  onQueueUpdate: () => Promise<void>
  onNodeInProgress: (id: NodeId, progress: number) => void
  onImageSave: (id: NodeId, images: string[]) => void
  onPreviewImage: (id: number) => void
  onPreviewImageNavigate: (next: boolean) => void
  onHideImagePreview: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  counter: 0,
  widgets: {},
  graph: {},
  nodes: [],
  edges: [],
  queue: [],
  gallery: [],
  onNodesChange: (changes) => {
    set((st) => ({ nodes: applyNodeChanges(changes, st.nodes) }))
  },
  onEdgesChange: (changes) => {
    set((st) => ({ edges: applyEdgeChanges(changes, st.edges) }))
  },
  onConnect: (connection) => {
    set((st) => ({ edges: addEdge(connection, st.edges) }))
  },
  onPropChange: (id, key, val) => {
    set((state) => {
      state.graph[id].fields[key] = val
      return state
    })
  },
  onPersistLocal: () => {
    saveLocalWorkflow(AppState.asPersisted(get()))
  },
  onAddNode: (widget, node, position, key) => {
    const state = get()
    const nextKey = key !== undefined ? Math.max(key, state.counter + 1) : state.counter + 1

    const id = nextKey.toString()
    const maxZ = state.nodes
      .map((n) => n.zIndex ?? 0)
      .concat([0])
      .reduce((a, b) => Math.max(a, b))
    const item = {
      id,
      data: widget,
      position: position ?? { x: 0, y: 0 },
      type: NODE_IDENTIFIER,
      zIndex: maxZ + 1,
    }
    state.onNodesChange([{ type: 'add', item }])

    set((st) => {
      if (node !== undefined) {
        st.graph[id] = node
      } else {
        st.graph[id] = SDNode.fromWidget(widget)
      }
      return { ...st, counter: nextKey }
    })
  },
  onDeleteNode: (id) => {
    const state = get()
    // delete state.graph[id] // should work but currently buggy
    state.onNodesChange([{ type: 'remove', id }])
  },
  onDuplicateNode: (id) => {
    const state = get()
    const item = state.graph[id]
    const node = state.nodes.find((n) => n.id === id)
    const position = node?.position
    const moved = position !== undefined ? { ...position, y: position.y + 100 } : undefined
    state.onAddNode(state.widgets[item.widget], item, moved)
  },
  onSubmit: async () => {
    const state = get()
    const connections = AppState.getValidConnections(state)
    const res = await sendPrompt(createPrompt(state.graph, state.widgets, connections, state.clientId))
    set({ promptError: res.error })
  },
  onDeleteFromQueue: async (id) => {
    await deleteFromQueue(id)
    await get().onQueueUpdate()
  },
  onInit: async () => {
    setInterval(() => get().onPersistLocal(), 5000)

    const widgets = await getWidgets()
    set({ widgets })
    get().onLoadWorkflow(retrieveLocalWorkflow() ?? { data: {}, connections: [] })
  },
  onLoadWorkflow: (workflow) => {
    const st = get()
    st.nodes = []
    st.edges = []
    st.counter = 0
    // st.graph = {} // should work but currently buggy
    for (const [key, node] of Object.entries(workflow.data)) {
      const widget = st.widgets[node.value.widget]
      st.onAddNode(widget, node.value, node.position, parseInt(key))
    }
    for (const connection of workflow.connections) {
      st.onConnect(connection)
    }
  },
  onSaveWorkflow: () => {
    writeWorkflowToFile(AppState.asPersisted(get()))
  },
  onNewClientId: (id) => {
    set({ clientId: id })
  },
  onQueueUpdate: async () => {
    const state = get()
    const history = await getQueue()
    // hacky way of getting the queue
    const queue = history.queue_running
      .concat(history.queue_pending)
      .filter(([i, id, graph, client]) => client.client_id === state.clientId)
      .map(([i, id, graph]) => {
        const prompts = Object.entries(graph).flatMap(([id, node]) =>
          node.class_type === 'CLIPTextEncode' && node.inputs.text !== undefined ? [node.inputs.text] : []
        )
        return { id, prompts }
      })
    set({ queue })
  },
  onNodeInProgress: (id, progress) => {
    set({ nodeInProgress: { id, progress } })
  },
  onImageSave: (id, images) => {
    set((st) => {
      st.graph[id].images = images
      return { ...st, gallery: st.gallery.concat(images.map((image) => ({ image }))) }
    })
  },
  onPreviewImage: (index) => {
    set({ previewedImageIndex: index })
  },
  onPreviewImageNavigate: (next) => {
    set((st) => {
      if (st.previewedImageIndex === undefined) {
        return {}
      }
      const idx = next ? st.previewedImageIndex - 1 : st.previewedImageIndex + 1
      return idx < 0 || idx === st.gallery.length ? {} : { previewedImageIndex: idx }
    })
  },
  onHideImagePreview: () => {
    set({ previewedImageIndex: undefined })
  },
}))

export const AppState = {
  getValidConnections(state: AppState): Connection[] {
    return state.edges.flatMap((e) =>
      e.sourceHandle !== undefined && e.sourceHandle !== null && e.targetHandle !== undefined && e.targetHandle !== null
        ? [{ source: e.source, sourceHandle: e.sourceHandle, target: e.target, targetHandle: e.targetHandle }]
        : []
    )
  },
  asPersisted(state: AppState): PersistedGraph {
    const data: Record<NodeId, PersistedNode> = {}
    for (const node of state.nodes) {
      const value = state.graph[node.id]
      if (value !== undefined) {
        data[node.id] = { value, position: node.position }
      }
    }

    return {
      data,
      connections: AppState.getValidConnections(state),
    }
  },
}
