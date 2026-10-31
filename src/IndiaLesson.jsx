import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import { indiaPhotos,indiaScenes } from './india.js'
import CountryCarousel from './CountryCarousel.jsx'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './india.css'

function Section({ id, title, Heading, narration, children }) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Bullets({items}) {return <ul>{items.map((item,index)=><li key={index} data-narration-content>{item}</li>)}</ul>}
function TopicPhoto({image,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="india-topic-photo"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}>
    <img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
  </button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function IndiaLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.india_lesson, props={Heading,narration}
  const scenes=indiaScenes(fact)
  const body=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const photos=sectionId=>indiaPhotos(fact,sectionId).map(image=><TopicPhoto key={image.url} image={image} onOpenImage={onOpenImage}/> )
  return <div className="physics-lesson india-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="india-setting"><div><dt>Where</dt><dd data-narration-content>{l.region}</dd></div><div><dt>When</dt><dd data-narration-content>{l.period}</dd></div><div><dt>Topic area</dt><dd data-narration-content>{l.theme.replaceAll('_',' & ')}</dd></div></dl>
      <h3>{l.opening_story.title}</h3>{body(l.opening_story.story)}{body(l.opening_story.question)}{photos('opening')}
      <h3>The short answer</h3>{body(l.central_idea)}
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>
    </Section>
    <Section {...props} id="india-background" title="A little context">
      {body(l.background.explanation)}
      {l.background.key_terms.length>0&&<dl className="india-terms">{l.background.key_terms.map(item=><div key={item.term}><dt data-narration-content>{item.term}</dt><dd data-narration-content>{item.meaning}</dd></div>)}</dl>}
      {photos('background')}
    </Section>
    <div id="india-explanation">{l.chapters.map(chapter=><Section {...props} key={chapter.id} id={`india-chapter-${chapter.id}`} title={chapter.title}>
      {body(chapter.explanation)}{photos(chapter.id)}<Bullets items={chapter.details}/>
      <h3>A concrete example</h3>{body(chapter.example)}<h3>Why this matters</h3>{body(chapter.why_it_matters)}
    </Section>)}</div>
    <Section {...props} id="india-case-study" title={l.case_study.title}>
      <p className="physics-note" data-narration-content>{l.case_study.place}</p>{body(l.case_study.story)}{photos('case-study')}
      <h3>What this shows</h3>{body(l.case_study.what_it_shows)}
    </Section>
    {scenes.length>0&&<Section {...props} id="india-photographs" title="See the story in photographs">
      <CountryCarousel images={scenes} label="Photographs connected to this India topic" onOpenImage={onOpenImage}/>
    </Section>}
    {l.timeline.length>0&&<Section {...props} id="india-timeline" title="How the story changed">
      <ol className="india-timeline">{l.timeline.map((event,index)=><li key={index}><p className="physics-note" data-narration-content>{event.period}</p><h3>{event.event}</h3>{body(event.significance)}</li>)}</ol>
    </Section>}
    <Section {...props} id="india-connections" title="The bigger picture">
      {body(l.wider_connections.explanation)}<Bullets items={l.wider_connections.examples}/>{photos('connections')}
      {l.nuances.map((item,index)=><div className="india-nuance" key={index}><h3>{item.idea}</h3>{body(item.clarification)}</div>)}
    </Section>
    <Section {...props} id="india-check" title="Check your understanding">
      {l.knowledge_checks.map((check,index)=><div className="physics-check" key={index}><h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{body(check.answer)}{body(check.explanation)}</details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas">
      <Bullets items={l.takeaways}/>{l.related_topics.length>0&&<div className="physics-next"><h3>Follow your curiosity</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('india',topic)}>{topic}</Link></li>)}</ul></div>}
    </Section>
  </div>
}
