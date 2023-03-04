import ReactFlow, { Background, BackgroundVariant, Controls, Panel } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { useAppStore } from '../store'
import { NODE_IDENTIFIER } from './NodeComponent'

import 'reactflow/dist/style.css'
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket'
import { Message } from '../types'
import { ControlPanelContainer, NodeContainer } from '../containers'

const nodeTypes = { [NODE_IDENTIFIER]: NodeContainer }

export default function App(): JSX.Element {
  WsController()

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowContainer></FlowContainer>
      <WsController />
    </div>
  )
}

function FlowContainer(): JSX.Element {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onInit } = useAppStore(
    (st) => ({
      nodes: st.nodes,
      edges: st.edges,
      onNodesChange: st.onNodesChange,
      onEdgesChange: st.onEdgesChange,
      onConnect: st.onConnect,
      onInit: st.onInit,
    }),
    shallow
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodeTypes={nodeTypes}
      deleteKeyCode={['Delete']}
      disableKeyboardA11y={true}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={() => {
        void onInit()
      }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
      <Panel position="bottom-center">
        <ControlPanelContainer />
      </Panel>
    </ReactFlow>
  )
}

function WsController(): JSX.Element {
  const { clientId, nodeIdInProgress, onNewClientId, onQueueUpdate, onNodeInProgress, onImagePreview } = useAppStore(
    (st) => ({
      clientId: st.clientId,
      nodeIdInProgress: st.nodeInProgress?.id,
      onNewClientId: st.onNewClientId,
      onQueueUpdate: st.onQueueUpdate,
      onNodeInProgress: st.onNodeInProgress,
      onImagePreview: st.onImageSave,
    }),
    shallow
  )

  useWebSocket(`ws://${window.location.host}/ws`, {
    onMessage: (ev) => {
      const msg = JSON.parse(ev.data)
      if (Message.isStatus(msg)) {
        if (msg.data.sid !== undefined && msg.data.sid !== clientId) {
          onNewClientId(msg.data.sid)
        }
        void onQueueUpdate()
      } else if (Message.isExecuting(msg)) {
        if (msg.data.node !== undefined) {
          onNodeInProgress(msg.data.node, 0)
        } else if (nodeIdInProgress !== undefined) {
          onNodeInProgress(nodeIdInProgress, 0)
        }
      } else if (Message.isProgress(msg)) {
        if (nodeIdInProgress !== undefined) {
          onNodeInProgress(nodeIdInProgress, msg.data.value / msg.data.max)
        }
      } else if (Message.isExecuted(msg)) {
        const images = msg.data.output.images
        if (Array.isArray(images)) {
          onImagePreview(msg.data.node, images)
        }
      }
    },
  })
  return <></>
}
