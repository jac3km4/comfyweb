import { memo } from 'react'
import { getBackendUrl } from '../config'
import { type GalleryItem } from '../types'

interface Props {
  gallery: GalleryItem[]
  onPreviewImage: (idx: number) => void
}

function GalleryComponent({ gallery, onPreviewImage }: Props): JSX.Element {
  return gallery.length === 0 ? (
    <div className="m-auto w-full text-center text-stone-500">Nothing here yet!</div>
  ) : (
    <>
      <div className="p-1 h-full w-full flex flex-col flex-wrap content-start overflow-x-scroll">
        {gallery
          .map(({ image }, i) => (
            <img
              key={image}
              width="146px"
              className="p-1 rounded-xl drop-shadow-md cursor-pointer"
              src={getBackendUrl(`/view/${image}`)}
              onClick={() => onPreviewImage(i)}
            />
          ))
          .reverse()}
      </div>
    </>
  )
}

export default memo(GalleryComponent)
