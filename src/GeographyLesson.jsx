import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import GeographyMap from './GeographyMap.jsx'
import GeographyDiagram from './GeographyDiagram.jsx'
import { geographyPhotos,geographyScenes } from './geography.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './geography.css'
function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="geography-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></button><figcaption>{image.credit?.popular_pick&&<span>Popular on Unsplash · </span>}{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function GeographyLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.geography_lesson,c=l.case_study,props={Heading,narration}
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const photos=section=>geographyPhotos(fact,section).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/> )
  const bullets=items=><ul>{items.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>
  const scenes=geographyScenes(fact),caseLocation=l.location_context.locations.find(p=>p.id===c.location_id)
  return <div className="physics-lesson geography-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="geography-setting"><div><dt>Region</dt><dd data-narration-content>{l.identity.region}</dd></div><div><dt>Scale</dt><dd data-narration-content>{l.identity.scale}</dd></div></dl>
      <h3>{l.opening_observation.title}</h3>{text(l.opening_observation.observation)}<p className="geography-notice" data-narration-content>{l.opening_observation.what_to_notice}</p>
      <h3>The short explanation</h3>{text(l.central_idea)}{photos('overview')}
    </Section>
    <Section {...props} id="geography-location" title="Find it in the landscape">
      {text(l.location_context.explanation)}
      {l.map?<GeographyMap map={l.map} locations={l.location_context.locations}/>:<dl>{l.location_context.locations.map(p=><div key={p.id}><dt>{p.name}</dt><dd data-narration-content>{p.explanation}</dd></div>)}</dl>}
      {l.location_context.spatial_relationships.length>0&&<><h3>The relationships to notice</h3>{bullets(l.location_context.spatial_relationships)}</>}{photos('location')}
    </Section>
    <Section {...props} id="geography-process" title="Understand what happens">
      {l.key_terms.length>0&&<details className="physics-details geography-terms"><summary>A few useful terms</summary><dl>{l.key_terms.map((item,i)=><div key={i}><dt>{item.term}</dt><dd data-narration-content>{item.meaning}</dd></div>)}</dl></details>}
      {l.explanation_steps.map(step=><div className="geography-explanation" key={step.id}><h3>{step.title}</h3>{text(step.explanation)}<p className="geography-notice" data-narration-content><strong>What you can notice:</strong> {step.observable_effect}</p></div>)}
      {l.diagram&&<GeographyDiagram diagram={l.diagram}/>}<ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('process')}
    </Section>
    <Section {...props} id="geography-example" title={c.title}>
      <p className="physics-note" data-narration-content>{caseLocation.name}</p>{text(c.observation)}{photos('case-study')}{text(c.explanation)}<h3>What this example shows</h3>{text(c.what_it_shows)}<h3>What can change</h3>{text(c.variability)}
    </Section>
    {l.human_connections.length>0&&<Section {...props} id="geography-people" title="People and the landscape">
      {l.human_connections.map((item,i)=><div className="geography-explanation" key={i}><h3>{item.title}</h3>{text(item.explanation)}</div>)}{photos('connections')}
    </Section>}
    {(l.variations.length>0||l.misconceptions.length>0||l.limits.length>0)&&<Section {...props} id="geography-differences" title="Notice the differences">
      {l.variations.map((item,i)=><div className="geography-explanation" key={i}><h3>{item.title}</h3><p className="physics-note" data-narration-content>{item.conditions}</p>{text(item.difference)}</div>)}{photos('variations')}
      {l.misconceptions.map((item,i)=><div className="geography-explanation" key={i}><h3>{item.belief}</h3>{text(item.correction)}{text(item.explanation)}</div>)}
      {l.limits.length>0&&<div className="geography-explanation"><h3>Where this explanation has limits</h3>{bullets(l.limits)}</div>}
    </Section>}
    {scenes.length>0&&<Section {...props} id="geography-photographs" title="See the landscape more closely">{scenes.length===1?<Photo image={scenes[0]} onOpenImage={onOpenImage}/>:<CountryCarousel images={scenes} label="Photographs of this geographic feature and its examples" onOpenImage={onOpenImage}/>}</Section>}
    <Section {...props} id="geography-check" title="Check your understanding">
      {l.knowledge_checks.map((item,i)=><div className="physics-check" key={i}><h3 data-narration-content>{item.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(item.answer)}{text(item.explanation)}</details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas">
      {bullets(l.takeaways)}{l.related_topics.length>0&&<div className="physics-next"><h3>Explore a related question</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('geography',topic)}>{topic}</Link></li>)}</ul></div>}
    </Section>
  </div>
}
