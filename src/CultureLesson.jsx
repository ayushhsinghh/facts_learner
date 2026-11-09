import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { culturePhotos,cultureScenes } from './culture.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './culture.css'
function Section({id,title,Heading,narration,children}){
 const ref=useRef(null)
 return <section className="physics-section" id={id} ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage,onFailure}){
 const [failed,setFailed]=useState(false)
 if(failed)return null
 return <figure className="culture-photo"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>{setFailed(true);onFailure(image.url)}}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
const relationship={documented_contact:'Documented contact',shared_roots:'Shared roots',comparison:'A comparison'}
export default function CultureLesson({fact,narration,Heading,MarkdownContent,onOpenImage}){
 const l=fact.culture_lesson,props={Heading,narration},[failed,setFailed]=useState(()=>new Set())
 const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
 const images=(section,entry=null)=>culturePhotos(fact,section,entry).filter(p=>!failed.has(p.url))
 const photos=(section,entry=null)=>{const items=images(section,entry);return items.length>2?<CountryCarousel images={items} label={`Photographs for ${section.replaceAll('_',' ')}`} onOpenImage={onOpenImage}/>:<div className={items.length===2?'culture-photo-pair':undefined}>{items.map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage} onFailure={url=>setFailed(old=>new Set([...old,url]))}/>)}</div>}
 const scenes=cultureScenes(fact)
 return <div className="physics-lesson culture-lesson">
  <Section {...props} id="overview" title={l.opening.heading}>{text(l.opening.scene)}<p className="physics-goal" data-narration-content>{l.opening.question}</p>
   <dl className="culture-essentials">{[['Heartland',l.identity.heartland],['People',l.identity.peoples.join(', ')],['Languages',l.identity.languages.join(', ')]].map(([label,value])=><div key={label}><dt data-narration-content>{label}</dt><dd data-narration-content>{value}</dd></div>)}</dl>
   {l.identity.local_names.length>0&&<p data-narration-content>{l.identity.local_names.join(' · ')}</p>}{text(l.identity.scope)}
   <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
   {l.key_terms.length>0&&<details className="physics-details"><summary>Words you will meet</summary><dl>{l.key_terms.map(p=><div key={p.term}><dt data-narration-content>{p.term}</dt><dd>{text(p.meaning)}</dd></div>)}</dl></details>}
  </Section>
  <Section {...props} id="culture-origins" title="A place, a history, a way of life"><h3 data-narration-content>{l.origins.heartland}</h3>{text(l.origins.climate_and_terrain)}{text(l.origins.adaptation)}{photos('origins')}
   <h3 data-narration-content>How the culture took shape</h3><p className="physics-note" data-narration-content>{l.origins.time_context}</p>{text(l.origins.historical_origins)}
   {l.milestones.length>0&&<ol className="culture-history">{l.milestones.map(p=><li key={p.id}><span data-narration-content>{p.period}</span><div>{text(p.event)}{text(p.significance)}</div></li>)}</ol>}
  </Section>
  <Section {...props} id="culture-daily-life" title="Daily life, then and now">{text(l.daily_life.introduction)}
   {l.daily_life.comparisons.map(p=><div className="culture-entry" key={p.id}><h3 data-narration-content>{p.domain}</h3><p className="physics-note" data-narration-content>{p.historical_context}</p><div className="culture-comparison"><div><h4 data-narration-content>Historically</h4>{text(p.then)}</div><div><h4 data-narration-content>Today</h4>{text(p.now)}</div></div><p data-narration-content><strong>What changed:</strong> {p.why_changed}</p><p className="physics-note" data-narration-content>{p.who_and_where}</p>{photos('daily_life',p.id)}</div>)}{photos('daily_life')}
  </Section>
  <Section {...props} id="culture-worldview" title="Ideas that shape everyday choices">{text(l.worldview.introduction)}
   {l.worldview.concepts.map(p=><div className="culture-entry" key={p.id}><h3 data-narration-content>{p.term}{p.local_term&&p.local_term!==p.term&&<> · {p.local_term}</>}</h3>{text(p.meaning)}<p data-narration-content><strong>In daily life:</strong> {p.everyday_example}</p>{text(p.scope)}{photos('worldview',p.id)}</div>)}
   <h3 data-narration-content>Understanding the etiquette</h3><dl>{l.worldview.etiquette.map(p=><div key={p.id}><dt data-narration-content>{p.situation}</dt><dd>{text(p.practice)}{text(p.reason)}<p className="physics-note" data-narration-content>{p.context}</p>{photos('worldview',p.id)}</dd></div>)}</dl>{photos('worldview')}
  </Section>
  <Section {...props} id="culture-markers" title="See, taste, hear, and celebrate">
   {l.markers.map(p=><div className={`culture-marker culture-marker-${p.kind}${images('markers',p.id).length?' has-photo':''}`} key={p.id}><div><h3 data-narration-content>{p.name}</h3><p className="physics-note" data-narration-content>{p.place_or_community}</p>{text(p.description)}{text(p.meaning)}<p data-narration-content><strong>How people experience it:</strong> {p.experience}</p>{text(p.today)}</div><div>{photos('markers',p.id)}</div></div>)}{photos('markers')}
  </Section>
  <Section {...props} id="culture-india" title="Connections with India">{text(l.india_connections.introduction)}{l.india_connections.connections.map(p=><div className="culture-entry" key={p.id}><h3 data-narration-content>{p.title}</h3><p className="culture-relationship" data-narration-content>{relationship[p.relationship]}</p>{text(p.explanation)}<p data-narration-content><strong>An Indian connection:</strong> {p.indian_example}</p>{text(p.distinction)}{photos('india',p.id)}</div>)}{photos('india')}</Section>
  <Section {...props} id="culture-explanation" title={l.why_custom.title}>{text(l.why_custom.custom)}{text(l.why_custom.explanation)}<dl className="culture-drivers">{l.why_custom.drivers.map(p=><div key={p.id}><dt data-narration-content>{p.factor}</dt><dd>{text(p.effect)}{photos('explanation',p.id)}</dd></div>)}</dl>
   <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage}/>{text(l.why_custom.what_it_explains)}{l.why_custom.limits&&<details className="physics-details"><summary>More about this explanation</summary>{text(l.why_custom.limits)}</details>}{photos('explanation')}
  </Section>
  <Section {...props} id="culture-spread" title="How the culture travels">{text(l.spread.introduction)}<div className="culture-pathways">{l.spread.pathways.map(p=><div className="culture-entry" key={p.id}><h3 data-narration-content>{p.destination}</h3><p className="physics-note" data-narration-content>{p.period}</p>{text(p.route)}<p data-narration-content><strong>What changed:</strong> {p.what_changed}</p><p data-narration-content><strong>What continues:</strong> {p.what_continues}</p>{photos('spread',p.id)}</div>)}</div>
   <h3 data-narration-content>Influences you may recognise</h3>{l.spread.influences.map(p=><div className="culture-entry" key={p.id}><h4 data-narration-content>{p.name}</h4>{text(p.example)}{text(p.connection)}{photos('spread',p.id)}</div>)}{photos('spread')}
  </Section>
  <Section {...props} id="culture-living" title="A living culture, many experiences">{text(l.living_culture.introduction)}{l.living_culture.variations.map(p=><div className="culture-entry" key={p.id}><h3 data-narration-content>{p.community_or_region}</h3>{text(p.difference)}{text(p.explanation)}{photos('living',p.id)}</div>)}{photos('living')}</Section>
  {scenes.length>0&&<Section {...props} id="culture-photographs" title="A closer look at the culture"><CountryCarousel images={scenes} label="Photographs of the culture and its setting" onOpenImage={onOpenImage}/></Section>}
  <Section {...props} id="remember" title="What to take with you"><ul>{l.takeaways.map(p=><li data-narration-content key={p}>{p}</li>)}</ul>{l.knowledge_checks.map((p,i)=><div className="physics-check" key={i}><h3 data-narration-content>{p.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(p.answer)}{text(p.explanation)}</details></div>)}<div className="physics-next"><h3 data-narration-content>Keep exploring</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('culture',topic)}>{topic}</Link></li>)}</ul></div></Section>
 </div>
}
