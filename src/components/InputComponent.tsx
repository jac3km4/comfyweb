import { memo, useReducer } from 'react'
import { Input } from '../types'

interface InputProps {
  value: any
  name: string
  input: Input
  onChange: (val: any) => void
}

function InputComponent({ value, name, input, onChange }: InputProps): JSX.Element {
  const [state, dispatch] = useReducer((state: any, update: any) => {
    onChange(update)
    return update
  }, value)

  if (Input.isList(input)) {
    return (
      <Labelled name={name}>
        <select className="grow text-right nodrag" value={state} onChange={(ev) => dispatch(ev.target.value)}>
          {input[0].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </Labelled>
    )
  }
  if (Input.isBool(input)) {
    return (
      <Labelled name={name}>
        <input
          type="checkbox"
          className="grow text-right nodrag"
          value={state}
          onChange={(ev) => dispatch(ev.target.checked)}
        />
      </Labelled>
    )
  }
  if (Input.isInt(input)) {
    return (
      <Labelled name={name}>
        <input
          type="number"
          className="grow text-right nodrag"
          value={state}
          onChange={(ev) => dispatch(ev.target.valueAsNumber)}
        />
      </Labelled>
    )
  }
  if (Input.isFloat(input)) {
    return (
      <Labelled name={name}>
        <input
          type="number"
          className="grow text-right nodrag"
          value={state}
          onChange={(ev) => dispatch(ev.target.valueAsNumber)}
        />
      </Labelled>
    )
  }
  if (Input.isString(input)) {
    const args = input[1]
    if (args.multiline === true) {
      return (
        <textarea
          style={{ height: 128, width: 260, resize: 'none' }}
          className="px-1 grow nodrag"
          value={state}
          onChange={(ev) => dispatch(ev.target.value)}
        />
      )
    }
    return (
      <Labelled name={name}>
        <input
          type="text"
          className="grow text-right nodrag"
          value={state}
          onChange={(ev) => dispatch(ev.target.value)}
        />
      </Labelled>
    )
  }
  return <></>
}

export default memo(InputComponent)

function Labelled({ name, children }: { name: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="flex w-full justify-between">
      <span className="pr-2">{name}</span>
      {children}
    </div>
  )
}
