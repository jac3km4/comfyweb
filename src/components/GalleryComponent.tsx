import { memo, useState } from 'react'
import { getBackendUrl } from '../config'
import { type GalleryItem } from '../types'

interface Props {
  gallery: GalleryItem[]
  onPreviewImage: (idx: number) => void
  onLoadImageWorkflow: (image: string) => void
}

function GalleryComponent({ gallery, onPreviewImage, onLoadImageWorkflow }: Props): JSX.Element {
  return gallery.length === 0 ? (
    <div className="m-auto w-full text-center text-stone-500">Nothing here yet!</div>
  ) : (
    <>
      <div className="p-1 h-full w-full flex flex-col flex-wrap content-start overflow-x-scroll">
        {gallery
          .map(({ image }, i) => (
            <GalleryItem
              key={image}
              image={image}
              onView={() => onPreviewImage(i)}
              onLoadWorkflow={() => onLoadImageWorkflow(image)}
            />
          ))
          .reverse()}
      </div>
    </>
  )
}

function GalleryItem({
  image,
  onView,
  onLoadWorkflow,
}: {
  image: string
  onView: () => void
  onLoadWorkflow: () => void
}): JSX.Element {
  const [isHovered, setHovered] = useState(false)
  return (
    <div
      className="relative cursor-pointer"
      style={{ width: '146px', height: '146px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
    >
      <img key={image} className="absolute p-1 rounded-xl drop-shadow-md" src={getBackendUrl(`/view/${image}`)} />
      {isHovered ? (
        <div className="absolute w-full h-full flex flex-col items-center justify-center">
          <div className="p-1 m-1 bg-stone-800 hover:bg-stone-700 rounded-md" onClick={onView}>
            View
          </div>
          <div
            className="p-1 m-1 bg-stone-800 hover:bg-stone-700 rounded-md"
            onClick={(ev) => {
              ev.stopPropagation()
              onLoadWorkflow()
            }}
          >
            Load
          </div>
        </div>
      ) : undefined}
    </div>
  )
}

export default memo(GalleryComponent)
