import { XMarkIcon } from '@heroicons/react/24/outline'
import { memo, useState } from 'react'
import Modal from 'react-modal'
import { getBackendUrl } from '../config'
import { type GalleryItem } from '../types'

interface Props {
  gallery: GalleryItem[]
}

function GalleryComponent({ gallery }: Props): JSX.Element {
  const [imagePopup, setImagePopup] = useState<string | undefined>(undefined)
  const hidePopup: () => void = () => setImagePopup(undefined)

  return gallery.length === 0 ? (
    <div className="m-auto w-full text-center text-stone-500">Nothing here yet!</div>
  ) : (
    <>
      <div className="p-1 h-full w-full flex flex-col flex-wrap content-start overflow-x-scroll">
        {gallery.reverse().map(({ image }) => (
          <img
            key={image}
            width="146px"
            className="p-1 rounded-xl drop-shadow-md cursor-pointer"
            src={getBackendUrl(`/view/${image}`)}
            onClick={() => setImagePopup(image)}
          />
        ))}
      </div>
      <Modal
        className="fixed inset-2 max-w-full max-h-full"
        isOpen={imagePopup !== undefined}
        onRequestClose={hidePopup}
      >
        <img
          className="max-w-full max-h-full m-auto"
          src={imagePopup !== undefined ? getBackendUrl(`/view/${imagePopup}`) : undefined}
        ></img>
        <XMarkIcon className="absolute top-1 right-1 h-8 w-8 text-red-500 cursor-pointer" onClick={hidePopup} />
      </Modal>
    </>
  )
}

export default memo(GalleryComponent)
