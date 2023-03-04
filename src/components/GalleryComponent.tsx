import { memo } from 'react'
import { type GalleryItem } from '../types'

interface Props {
  gallery: GalleryItem[]
}

function GalleryComponent({ gallery }: Props): JSX.Element {
  return gallery.length === 0 ? (
    <div className="m-auto w-full text-center text-stone-500">Nothing here yet!</div>
  ) : (
    <div className="p-1 h-full w-full flex flex-col flex-wrap content-start overflow-x-scroll">
      {gallery.map(({ image }) => (
        <img
          key={image}
          width="148px"
          className="p-1 rounded-xl drop-shadow-md cursor-pointer"
          src={`http://127.0.0.1:8188/view/${image}`}
          onClick={() => window.open(`http://127.0.0.1:8188/view/${image}`)}
        />
      ))}
    </div>
  )
}

export default memo(GalleryComponent)
