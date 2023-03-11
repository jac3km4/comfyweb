import { memo } from 'react'
import { type PersistedGraph, readWorkflowFromFile } from '../persistence'

interface Props {
  onLoadWorkflow: (persisted: PersistedGraph) => void
  onSaveWorkflow: () => void
}

function WorkflowPageComponent({ onLoadWorkflow, onSaveWorkflow }: Props): JSX.Element {
  return (
    <div className="py-3">
      <label className="p-1 m-2 cursor-pointer bg-stone-800 rounded-md cursor-pointer">
        Load workflow
        <input type="file" className="hidden" onChange={(ev) => readWorkflowFromFile(ev, onLoadWorkflow)}></input>
      </label>
      <div className="p-1 m-2 cursor-pointer bg-stone-800 rounded-md cursor-pointer" onClick={onSaveWorkflow}>
        Save workflow
      </div>
    </div>
  )
}

export default memo(WorkflowPageComponent)
