import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { fashionPhotos,fashionScenes } from './fashion.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './fashion.css'

function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage,onFailure}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="fashion-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>{setFailed(true);onFailure?.(image.url)}}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function FashionLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.fashion_lesson,g=l.practical_guide,props={Heading,narration}
  const [failedPhotos,setFailedPhotos]=useState(()=>new Set())
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const photos=section=>fashionPhotos(fact,section).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/> )
  const recognitionPhotos=fashionPhotos(fact,'recognition').filter(p=>!failedPhotos.has(p.url))
  const bullets=items=><ul>{items.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>
  const careItem=(item,i)=><div className="fashion-care-item" key={i}><h3>{item.action}</h3>{text(item.reason)}<p className="physics-note" data-narration-content>{item.limits}</p></div>
  const scenes=fashionScenes(fact)
  return <div className="physics-lesson fashion-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="fashion-identity"><div><dt>Region</dt><dd data-narration-content>{l.identity.region}</dd></div><div><dt>Period</dt><dd data-narration-content>{l.identity.period}</dd></div><div><dt>Local name</dt><dd data-narration-content>{l.identity.local_name}</dd></div></dl>
      {text(l.introduction.explanation)}{text(l.introduction.why_it_matters)}{photos('overview')}
    </Section>
    <Section {...props} id="fashion-recognition" title="Look closely">
      <div className={`fashion-recognition${recognitionPhotos.length?' has-photograph':''}`}>
        {recognitionPhotos.length>0&&<div className="fashion-recognition-image">{recognitionPhotos.map(image=><div key={image.url}><Photo image={image} onOpenImage={onOpenImage} onFailure={url=>setFailedPhotos(current=>new Set([...current,url]))}/>{image.credit.feature_id&&<a className="fashion-feature-link" href={`#fashion-feature-${image.credit.feature_id}`}>Read about this detail</a>}</div>)}</div>}
        <div className="fashion-feature-list">{l.recognition_guide.map(feature=><div id={`fashion-feature-${feature.id}`} key={feature.id}><h3>{feature.feature}</h3>{text(feature.where_to_look)}{text(feature.why_it_matters)}{feature.comparison&&<p className="physics-note" data-narration-content>{feature.comparison}</p>}</div>)}</div>
      </div><ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>
    </Section>
    <Section {...props} id="fashion-context" title="The story behind it">
      {text(l.origin_and_context.explanation)}{text(l.origin_and_context.uncertainty)}
      {l.origin_and_context.deeper_history&&<details className="physics-details"><summary>Explore the history</summary>{text(l.origin_and_context.deeper_history)}</details>}
    </Section>
    <Section {...props} id="fashion-making" title="Materials and construction">
      {l.materials.map((item,i)=><div className="fashion-explanation" key={i}><h3>{item.name}</h3><p className="physics-note" data-narration-content>Material type: {item.material_type}</p>{text(item.role)}{text(item.tradeoffs)}</div>)}{photos('materials')}
      {l.construction.map((item,i)=><div className="fashion-explanation" key={i}><h3>{item.title}</h3>{text(item.explanation)}<p className="fashion-observation" data-narration-content><strong>What you can notice:</strong> {item.visible_effect}</p></div>)}{photos('construction')}
    </Section>
    {l.wearing_properties.length>0&&<Section {...props} id="fashion-feel" title="How it feels and behaves">
      <dl className="fashion-properties">{l.wearing_properties.map((item,i)=><div key={i}><dt>{item.property}</dt><dd>{text(item.explanation)}<p className="physics-note" data-narration-content>{item.depends_on}</p></dd></div>)}</dl>
    </Section>}
    {g&&<Section {...props} id="fashion-practical" title={['garment','accessory'].includes(l.subject_type)?'Wearing it in everyday life':'How it is used'}>
      {text(g.introduction)}{[['Ways to wear it',g.wearing_suggestions],['Where you will find it',g.use_examples],['Fit and movement',g.fit_and_movement],['Climate and comfort',g.climate_considerations],['Cultural context',g.cultural_considerations]].filter(([,items])=>items.length>0).map(([title,items])=><div className="fashion-explanation" key={title}><h3>{title}</h3>{bullets(items)}</div>)}{photos('practical')}
    </Section>}
    {l.care.length>0&&<Section {...props} id="fashion-care" title="Care starts with the actual item">
      <p className="fashion-observation" data-narration-content>Follow the item's care label and the maker's instructions. Fibre, blends, finishes and construction can change the right approach.</p>
      {l.care.slice(0,2).map(careItem)}{l.care.length>2&&<details className="physics-details"><summary>More care considerations</summary>{l.care.slice(2).map(careItem)}</details>}
    </Section>}
    {(l.variations.length>0||l.misconceptions.length>0)&&<Section {...props} id="fashion-differences" title="Variations and common misunderstandings">
      {l.variations.map((item,i)=><div className="fashion-explanation" key={i}><h3>{item.name}</h3><p className="physics-note" data-narration-content>{item.region_or_period}</p>{text(item.difference)}</div>)}{photos('variations')}
      {l.misconceptions.map((item,i)=><div className="fashion-explanation" key={i}><h3>{item.belief}</h3>{text(item.correction)}{text(item.explanation)}</div>)}
    </Section>}
    {scenes.length>0&&<Section {...props} id="fashion-photographs" title="More views, more details">{scenes.length===1?<Photo image={scenes[0]} onOpenImage={onOpenImage}/>:<CountryCarousel images={scenes} label="Photographs of this fashion subject and its details" onOpenImage={onOpenImage}/>}</Section>}
    <Section {...props} id="remember" title="What to notice next time">
      {bullets(l.takeaways)}{l.related_topics.length>0&&<div className="physics-next"><h3>Explore related topics</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('fashion',topic)}>{topic}</Link></li>)}</ul></div>}
    </Section>
  </div>
}
