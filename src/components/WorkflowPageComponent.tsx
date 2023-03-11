import { memo } from 'react'
import { type PersistedGraph, readWorkflowFromFile } from '../persistence'

interface Props {
  onLoadWorkflow: (persisted: PersistedGraph) => void
  onSaveWorkflow: () => void
}

function WorkflowPageComponent({ onLoadWorkflow, onSaveWorkflow }: Props): JSX.Element {
  return (
    <div className="py-4">
      <label className="p-2 m-4 cursor-pointer bg-stone-800 hover:bg-stone-700 rounded-md cursor-pointer">
        Load workflow
        <input type="file" className="hidden" onChange={(ev) => readWorkflowFromFile(ev, onLoadWorkflow)}></input>
      </label>
      <div
        className="p-2 m-4 cursor-pointer bg-stone-800 hover:bg-stone-700 rounded-md cursor-pointer"
        onClick={onSaveWorkflow}
      >
        Save workflow
      </div>
    </div>
  )
}

export default memo(WorkflowPageComponent)
