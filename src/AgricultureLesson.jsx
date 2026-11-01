import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import AgricultureDiagram from './AgricultureDiagram.jsx'
import { agriculturePhotos,agricultureScenes } from './agriculture.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './agriculture.css'
function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="agriculture-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function AgricultureLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.agriculture_lesson,c=l.field_context,e=l.indian_case_study,props={Heading,narration}
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const bullets=items=><ul>{items.map((v,i)=><li key={i} data-narration-content>{v}</li>)}</ul>
  const photos=(section,stepId=null)=>agriculturePhotos(fact,section,stepId).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/>)
  const scenes=agricultureScenes(fact)
  return <div className="physics-lesson agriculture-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <p className="physics-note" data-narration-content>{l.identity.scope}</p>
      {l.identity.local_names.length>0&&<p data-narration-content>Also known as {l.identity.local_names.join(', ')}.</p>}
      <h3 data-narration-content>{l.opening_scenario.title}</h3>{text(l.opening_scenario.experience)}{l.opening_scenario.question!==l.question&&text(l.opening_scenario.question)}
      <div className="agriculture-explanation"><h3>The simple explanation</h3>{text(l.central_idea)}</div>
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
    </Section>
    <Section {...props} id="agriculture-context" title="Where this idea applies">
      <dl className="agriculture-context"><div><dt data-narration-content>Used for</dt><dd>{text(c.purpose)}</dd></div>{c.crops.length>0&&<div><dt data-narration-content>Crops or farming systems</dt><dd data-narration-content>{c.crops.join(', ')}</dd></div>}{c.when_it_matters&&<div><dt data-narration-content>When it matters</dt><dd>{text(c.when_it_matters)}</dd></div>}<div><dt data-narration-content>Indian connection</dt><dd>{text(c.indian_connection)}</dd></div></dl>
      {c.growing_conditions.length>0&&<><h3>Growing conditions</h3><dl>{c.growing_conditions.map((item,i)=><div key={i}><dt data-narration-content>{item.title}</dt><dd>{text(item.explanation)}</dd></div>)}</dl></>}
      <p className="agriculture-context-limit" data-narration-content>{c.applicability_limits}</p>{photos('context')}
      {l.key_terms.length>0&&<details className="physics-details"><summary>A few useful words</summary><dl>{l.key_terms.map(t=><div key={t.term}><dt data-narration-content>{t.term}</dt><dd>{text(t.meaning)}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="agriculture-process" title="Follow what happens">
      {l.diagram&&<AgricultureDiagram diagram={l.diagram} steps={l.process_steps}/>}
      <ol className="agriculture-process">{l.process_steps.map(s=><li key={s.id} id={`agriculture-step-${s.id}`} tabIndex={-1}><h3 data-narration-content>{s.title}</h3>{text(s.action)}<p data-narration-content><strong>What changes:</strong> {s.what_changes}</p>{text(s.why_it_matters)}<p className="agriculture-observe" data-narration-content><strong>What to notice:</strong> {s.what_to_notice}</p><h4 data-narration-content>This depends on</h4>{bullets(s.conditions)}{photos('process',s.id)}</li>)}</ol>{photos('process')}
    </Section>
    <Section {...props} id="agriculture-case" title={e.title}>
      <p className="physics-note" data-narration-content>{e.kind==='research_example'?'A research example':'A documented practice'} · {e.place} · {e.time_context}</p>
      {e.crops.length>0&&<p data-narration-content>Crops or systems: {e.crops.join(', ')}.</p>}
      <h3 data-narration-content>{e.practice}</h3>{text(e.explanation)}{text(e.connection)}{photos('case')}
      <h3>What the example shows</h3>{text(e.outcome)}<h3>What it does not establish</h3>{text(e.limits)}
      {l.measurements.length>0&&<details className="physics-details"><summary>Look at the measurements</summary>{l.measurements.map(m=><div className="agriculture-measurement" key={m.id}><h3 data-narration-content>{m.label}</h3><p data-narration-content><strong>{m.kind==='illustrative'?'Illustrative value':'Reported value'}</strong> · {new Intl.NumberFormat('en',{maximumFractionDigits:6}).format(m.value)} {m.unit}</p><p data-narration-content>Basis: {m.basis}</p>{text(m.explanation)}{(m.place||m.period||m.as_of)&&<p className="physics-note" data-narration-content>{[m.place,m.period].filter(Boolean).join(' · ')}{m.as_of&&<> · Context dated <time dateTime={m.as_of}>{m.as_of}</time></>}</p>}</div>)}</details>}
    </Section>
    <Section {...props} id="agriculture-tradeoffs" title="Benefits, effort and trade-offs">
      {l.benefits_and_tradeoffs.map((b,i)=><div className="agriculture-explanation" key={i}><h3 data-narration-content>{b.benefit}</h3>{text(b.explanation)}<div className="agriculture-tradeoff"><div><h4 data-narration-content>What it requires</h4>{bullets(b.requirements)}</div><div><h4 data-narration-content>Costs and limits</h4>{text(b.costs_and_limits)}</div></div></div>)}{photos('tradeoffs')}
    </Section>
    <Section {...props} id="agriculture-limits" title="What changes the outcome?">
      {l.conditions_and_limits.map((v,i)=><div className="agriculture-explanation" key={i}><h3 data-narration-content>{v.title}</h3>{text(v.explanation)}</div>)}{photos('limits')}
      {l.misconceptions.map((v,i)=><div className="agriculture-explanation" key={i}><h3 data-narration-content>{v.belief}</h3>{text(v.correction)}{text(v.explanation)}</div>)}
      {l.optional_depth.length>0&&<div className="agriculture-explanation"><h3>A little more detail</h3>{l.optional_depth.map((v,i)=><details className="physics-details" key={i}><summary>{v.title}</summary>{text(v.explanation)}</details>)}</div>}
    </Section>
    {scenes.length>0&&<Section {...props} id="agriculture-photographs" title="See the idea in the field"><CountryCarousel images={scenes} label="Photographs of the farming concept and its setting" onOpenImage={onOpenImage}/></Section>}
    <Section {...props} id="agriculture-check" title="Check your understanding">{l.knowledge_checks.map((v,i)=><div className="physics-check" key={i}><h3 data-narration-content>{v.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(v.answer)}{text(v.explanation)}</details></div>)}</Section>
    <Section {...props} id="remember" title="Keep the main idea">{bullets(l.takeaways)}<div className="physics-next"><h3>Keep exploring</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('agriculture',topic)}>{topic}</Link></li>)}</ul></div></Section>
  </div>
}
