import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import TechnologyDiagram from './TechnologyDiagram.jsx'
import { technologyParts,technologyPhotos,technologyScenes } from './technology.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './technology.css'
function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="technology-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function TechnologyLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.technology_lesson,s=l.system_model,e=l.worked_example,props={Heading,narration}
  const parts=new Map(technologyParts(s).map(p=>[p.id,p]))
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const bullets=items=><ul>{items.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>
  const photos=section=>technologyPhotos(fact,section).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/> )
  const scenes=technologyScenes(fact)
  const partList=items=><dl className="technology-parts">{items.map(p=><div id={`technology-part-${p.id}`} tabIndex={-1} key={p.id}><dt data-narration-content>{p.name}</dt><dd>{text(p.role||p.explanation)}</dd></div>)}</dl>
  return <div className="physics-lesson technology-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="technology-setting"><div><dt>Domain</dt><dd data-narration-content>{l.identity.domain}</dd></div><div><dt>Scope</dt><dd data-narration-content>{l.identity.scope}</dd></div></dl>
      {l.version_context&&<aside className="technology-version"><h3>Applies to {l.version_context.system} {l.version_context.version}</h3>{text(l.version_context.scope)}<p className="physics-note" data-narration-content>Context dated <time dateTime={l.version_context.as_of}>{l.version_context.as_of}</time>.</p></aside>}
      <h3>{l.opening_scenario.title}</h3>{text(l.opening_scenario.experience)}{l.opening_scenario.question!==l.question&&text(l.opening_scenario.question)}
      <h3>The problem it solves</h3>{text(l.problem.what_is_hard)}{text(l.problem.why_it_matters)}
      <h3>The simple explanation</h3>{text(l.central_idea)}<ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
    </Section>
    <Section {...props} id="technology-system" title="Meet the system">
      <div className="technology-input-output"><div><h3>What goes in</h3>{partList(s.inputs)}</div><div><h3>What comes out</h3>{partList(s.outputs)}</div></div>
      <h3>The parts and their jobs</h3>{partList(s.components)}{photos('system')}
    </Section>
    <Section {...props} id="technology-walkthrough" title="Follow what happens">
      {l.diagram&&<TechnologyDiagram diagram={l.diagram} system={s}/>}
      <ol className="technology-walkthrough">{l.walkthrough.map(step=><li key={step.id}><h3>{step.title}</h3>{text(step.what_happens)}<p className="technology-notice" data-narration-content><strong>What changes:</strong> {step.what_changes}</p><ul className="technology-component-links" aria-label="System parts in this step">{step.component_ids.map(id=><li key={id}><a href={`#technology-part-${id}`}>{parts.get(id).name}</a></li>)}</ul></li>)}</ol>{photos('walkthrough')}
    </Section>
    <Section {...props} id="technology-example" title={e.title}>
      <p className="physics-note" data-narration-content>{e.kind==='illustrative'?'An illustrative example, not an executed test or measured result.':'An example described by the cited source.'}</p>
      <h3>Starting conditions</h3>{bullets(e.starting_conditions)}<h3>What happens</h3><ol>{e.actions.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ol>{photos('example')}
      <h3>The outcome</h3>{text(e.outcome)}{text(e.explanation)}{e.limits.length>0&&<><h3>What this example leaves out</h3>{bullets(e.limits)}</>}
    </Section>
    <Section {...props} id="technology-tradeoffs" title="What it gains, and what it costs">
      {l.tradeoffs.map((item,i)=><div className="technology-explanation" key={i}><h3>{item.benefit}</h3><dl className="technology-tradeoff"><div><dt>Cost or constraint</dt><dd>{text(item.cost)}</dd></div><div><dt>When it matters</dt><dd>{text(item.when_it_matters)}</dd></div></dl></div>)}{photos('tradeoffs')}
      {l.failure_modes.length>0&&<div className="technology-explanation"><h3>When the system struggles</h3>{l.failure_modes.map((item,i)=><div key={i}><h4>{item.symptom}</h4>{text(item.cause)}{text(item.what_it_shows)}</div>)}</div>}
    </Section>
    <Section {...props} id="technology-practical" title="Connect it to everyday use">
      {l.practical_implications.map((item,i)=><div className="technology-explanation" key={i}><h3>{item.title}</h3>{text(item.explanation)}</div>)}{photos('implications')}
      {l.misconceptions.map((item,i)=><div className="technology-explanation" key={i}><h3>{item.belief}</h3>{text(item.correction)}{text(item.explanation)}</div>)}
      {l.optional_depth.length>0&&<div className="technology-explanation"><h3>A little more detail</h3>{l.optional_depth.map((item,i)=><details className="physics-details" key={i}><summary>{item.title}</summary>{text(item.explanation)}</details>)}</div>}
    </Section>
    {scenes.length>0&&<Section {...props} id="technology-photographs" title="A closer look at the technology">{scenes.length===1?<Photo image={scenes[0]} onOpenImage={onOpenImage}/>:<CountryCarousel images={scenes} label="Photographs of this technology and its parts" onOpenImage={onOpenImage}/>}</Section>}
    <Section {...props} id="technology-check" title="Check your understanding">
      {l.knowledge_checks.map((item,i)=><div className="physics-check" key={i}><h3 data-narration-content>{item.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(item.answer)}{text(item.explanation)}</details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep the main idea">
      {bullets(l.takeaways)}{l.related_topics.length>0&&<div className="physics-next"><h3>Explore another system</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('technology',topic)}>{topic}</Link></li>)}</ul></div>}
    </Section>
  </div>
}
