import { TrashIcon } from '@heroicons/react/24/outline'
import { memo } from 'react'
import { type QueueItem } from '../types'

interface Props {
  queue: QueueItem[]
  onDeleteFromQueue: (id: number) => Promise<void>
}

function QueueComponent({ queue, onDeleteFromQueue }: Props): JSX.Element {
  return queue.length === 0 ? (
    <div className="m-auto w-full text-center text-stone-500">Nothing to do!</div>
  ) : (
    <div className="overflow-y-scroll w-full">
      {queue.reverse().map((it, i) => (
        <div className="p-1 bg-stone-800 odd:bg-stone-900" key={i}>
          {i + 1}. {it.prompts.length === 0 ? 'no prompt' : it.prompts.join(' ')}
          {i !== 0 ? (
            <TrashIcon
              className="inline h-5 w-5 mx-1 text-red-500 align-text-bottom cursor-pointer"
              onClick={() => {
                void onDeleteFromQueue(it.id)
              }}
            />
          ) : (
            <></>
          )}
        </div>
      ))}
    </div>
  )
}

export default memo(QueueComponent)
