import { XMarkIcon } from '@heroicons/react/24/outline'
import { memo, useEffect } from 'react'
import ReactModal from 'react-modal'
import { getBackendUrl } from '../config'

interface Props {
  image?: string
  onHideImagePreview: () => void
  onPreviewImageNavigate: (next: boolean) => void
}

function ImageViewComponent({ image, onHideImagePreview, onPreviewImageNavigate }: Props): JSX.Element {
  const keyHandler: (ev: KeyboardEvent) => void = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowRight') {
      onPreviewImageNavigate(true)
    } else {
      onPreviewImageNavigate(false)
    }
  }

  useEffect(() => {
    if (image !== undefined) {
      document.addEventListener('keydown', keyHandler)
      return () => document.removeEventListener('keydown', keyHandler)
    }
  })

  return (
    <ReactModal
      className="fixed inset-2 max-w-full max-h-full"
      isOpen={image !== undefined}
      onRequestClose={onHideImagePreview}
    >
      <div className="w-full h-full">
        <img
          className="max-w-full max-h-full m-auto"
          src={image !== undefined ? getBackendUrl(`/view/${image}`) : undefined}
        ></img>
        <XMarkIcon
          className="absolute top-1 right-1 h-8 w-8 text-red-500 cursor-pointer"
          onClick={onHideImagePreview}
        />
      </div>
    </ReactModal>
  )
}

export default memo(ImageViewComponent)
