import { articleImages } from './articleImages.js'
import './articleImages.css'

export default function ArticleImages({ fact, slot, placement, onOpenImage }) {
  return articleImages(fact, {slot,placement}).map(item => <figure className="article-illustration" key={item.slot}>
    <button type="button" aria-label={`Enlarge image: ${item.alt}`} onClick={() => onOpenImage(item)}>
      <img src={item.url} alt={item.alt} loading="lazy" decoding="async" />
    </button>
    {item.caption && <figcaption data-narration-content>{item.caption}</figcaption>}
  </figure>)
}
