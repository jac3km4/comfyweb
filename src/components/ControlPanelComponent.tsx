import { memo, useState } from 'react'
import { ArrowsPointingInIcon } from '@heroicons/react/24/outline'
import { GalleryContainer, NodePickerContainer, QueueContainer, WorkflowPageContainer } from '../containers'

type Tab = 'Queue' | 'Gallery' | 'Nodes' | 'Workflow'

interface PanelState {
  activeTab: Tab
  minimized: boolean
}

interface Props {
  promptError?: string
  onSubmit: () => Promise<void>
}

const TABS: Tab[] = ['Queue', 'Gallery', 'Nodes', 'Workflow']

function ControlPanelComponent({ onSubmit, promptError }: Props): JSX.Element {
  const [{ activeTab, minimized }, setState] = useState<PanelState>({
    activeTab: 'Queue',
    minimized: false,
  })

  return (
    <>
      {promptError !== undefined ? (
        <div className="error-popup p-1 text-sm rounded-md bg-stone-900 border-2 border-stone-400 text-red-500">
          {promptError}
        </div>
      ) : (
        <></>
      )}
      <div
        style={{ width: '60vw' }}
        className="drop-shadow-lg rounded-md bg-stone-900 border-2 border-stone-400 flex flex-col overflow-hidden"
      >
        <PanelTabs tabs={TABS} active={activeTab} onTabChange={(tab) => setState((st) => ({ ...st, activeTab: tab }))}>
          <button
            className="absolute bg-teal-800 px-2 left-2 py-0.5 mx-0.5 cursor-pointer"
            onClick={() => {
              void onSubmit()
            }}
          >
            Enqueue
          </button>
          <ArrowsPointingInIcon
            className="h-5 w-5 mx-1 text-blue-500 self-center cursor-pointer"
            onClick={() => setState((st) => ({ ...st, minimized: !st.minimized }))}
          />
        </PanelTabs>
        {minimized ? (
          <></>
        ) : (
          <div className="h-80 flex">
            {minimized ? (
              <></>
            ) : activeTab === 'Queue' ? (
              <QueueContainer />
            ) : activeTab === 'Gallery' ? (
              <GalleryContainer />
            ) : activeTab === 'Nodes' ? (
              <NodePickerContainer />
            ) : (
              <WorkflowPageContainer />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default memo(ControlPanelComponent)

interface PanelTabsProps<T> {
  tabs: T[]
  active: T
  onTabChange: (tab: T) => void
  children: JSX.Element[]
}

function PanelTabs<T extends string>({ tabs, active, onTabChange, children }: PanelTabsProps<T>): JSX.Element {
  return (
    <div className="flex flex-row justify-end border-b-2 bg-stone-800 border-stone-400 px-2 rounded-t-md">
      {tabs.map((t) => (
        <PanelTab key={t} label={t} isActive={t === active} onClick={() => onTabChange(t)} />
      ))}
      {children}
    </div>
  )
}

interface PanelTabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function PanelTab({ label, isActive, onClick }: PanelTabProps): JSX.Element {
  const bgClasses = isActive ? ['bg-stone-700'] : ['bg-stone-800']
  const defaultClasses = ['px-2', 'py-0.5', 'mx-0.5', 'cursor-pointer']
  return (
    <div className={defaultClasses.concat(bgClasses).join(' ')} onClick={onClick}>
      {label}
    </div>
  )
}
