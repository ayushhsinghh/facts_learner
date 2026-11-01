import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import NatureDiagram from './NatureDiagram.jsx'
import { naturePhotos,natureScenes } from './nature.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './nature.css'
function Section({id,title,Heading,narration,children}){
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage,onFailure}){
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="nature-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>{setFailed(true);onFailure?.(image.url)}}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption>{image.credit.feature_id&&<a className="nature-photo-feature" href={`#nature-ref-feature-${image.credit.feature_id}`}>Read the feature explanation</a>}</figure>
}
function Recognition({lesson,images,onOpenImage,text}){
  const [failed,setFailed]=useState(()=>new Set()),visible=images.filter(p=>!failed.has(p.url))
  const scales={unaided:'Visible without tools',close_up:'Close-up view',microscopic:'Microscopic view'}
  return <div className={`nature-recognition${visible.length?' has-photo':''}`}>
    {visible.length>0&&<div className="nature-recognition-photos">{visible.map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage} onFailure={url=>setFailed(old=>new Set([...old,url]))}/>)}</div>}
    <div>{lesson.recognition_features.map(f=><div className="nature-feature" key={f.id} id={`nature-ref-feature-${f.id}`} tabIndex={-1}><h3 data-narration-content>{f.name}</h3><p className="physics-note" data-narration-content>{scales[f.viewing_scale]}</p>{text(f.what_to_look_for)}<p data-narration-content><strong>What it means:</strong> {f.meaning}</p>{text(f.connection)}</div>)}</div>
  </div>
}
export default function NatureLesson({fact,narration,Heading,MarkdownContent,onOpenImage}){
  const l=fact.nature_lesson,c=l.observation_context,e=l.real_world_example,a=l.notice_it_yourself,v=l.conservation_context,props={Heading,narration}
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const bullets=items=><ul>{items.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>
  const photos=section=>naturePhotos(fact,section).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/>)
  const scenes=natureScenes(fact)
  return <div className="physics-lesson nature-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p><p className="physics-note" data-narration-content>{l.identity.scope}</p>
      {(l.identity.common_names.length>0||l.identity.scientific_name)&&<p data-narration-content>{l.identity.common_names.join(', ')}{l.identity.scientific_name&&<> <i>{l.identity.scientific_name}</i></>}</p>}
      <h3 data-narration-content>{l.opening_observation.title}</h3>{text(l.opening_observation.scene)}{l.opening_observation.question!==l.question&&text(l.opening_observation.question)}
      <div className="nature-explanation"><h3 data-narration-content>The short explanation</h3>{text(l.central_idea)}</div>
      <p className="physics-note" data-narration-content>Scientific context: {l.explanation_status.explanation}</p>
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
      <dl className="nature-context">{[['Where to notice it',c.where],['When to notice it',c.when],['Size and scale',c.size_context],['Time and duration',c.time_context]].filter(([,value])=>value).map(([label,value])=><div key={label}><dt data-narration-content>{label}</dt><dd>{text(value)}</dd></div>)}</dl>
      {c.conditions.length>0&&<><h3 data-narration-content>Conditions that matter</h3>{bullets(c.conditions)}</>}{text(c.variability)}
      {v&&<aside className="nature-conservation"><h3 data-narration-content>Conservation context</h3><dl>{[['Status',v.status],['Assessment system',v.system],['Geographic scope',v.scope],['Assessment date',v.assessed_on]].map(([label,value])=><div key={label}><dt data-narration-content>{label}</dt><dd data-narration-content>{value}</dd></div>)}</dl></aside>}
      {l.key_terms.length>0&&<details className="physics-details"><summary>A few useful words</summary><dl>{l.key_terms.map(t=><div key={t.term}><dt data-narration-content>{t.term}</dt><dd>{text(t.meaning)}</dd></div>)}</dl></details>}
    </Section>
    {l.recognition_features.length>0&&<Section {...props} id="nature-recognition" title="Look more closely"><Recognition lesson={l} images={naturePhotos(fact,'recognition')} onOpenImage={onOpenImage} text={text}/></Section>}
    <Section {...props} id="nature-explanation" title="Follow what happens">
      {l.diagram&&<NatureDiagram diagram={l.diagram} lesson={l}/>}
      <ol className="nature-steps">{l.explanation_steps.map(s=><li key={s.id} id={`nature-ref-step-${s.id}`} tabIndex={-1}><h3 data-narration-content>{s.title}</h3>{text(s.explanation)}<p data-narration-content><strong>What changes:</strong> {s.what_changes}</p><p className="physics-note" data-narration-content>{s.evidence_note}</p><h4 data-narration-content>This depends on</h4>{bullets(s.conditions)}</li>)}</ol>{photos('explanation')}
    </Section>
    {l.natural_connections.length>0&&<Section {...props} id="nature-connections" title="Connect it to its surroundings">{l.natural_connections.map(n=><div className="nature-explanation" key={n.id} id={`nature-ref-connection-${n.id}`} tabIndex={-1}><h3 data-narration-content>{n.title}</h3><p className="nature-relationship" data-narration-content>{n.relationship}</p>{text(n.explanation)}<p className="physics-note" data-narration-content>{n.scale_or_conditions}</p></div>)}{photos('connections')}</Section>}
    <Section {...props} id="nature-example" title={e.title}>
      <p className="physics-note" data-narration-content>{[e.subject,e.place,e.time_context].filter(Boolean).join(' · ')}</p>
      {e.scientific_name&&<p data-narration-content><i>{e.scientific_name}</i></p>}
      <h3 data-narration-content>What is observed</h3>{text(e.observation)}<h3 data-narration-content>How it connects</h3>{text(e.explanation)}{text(e.connection)}{photos('example')}
      <h3 data-narration-content>What this example does not establish</h3>{text(e.limits)}
      {l.measurements.length>0&&<details className="physics-details"><summary>Look at the measurements</summary>{l.measurements.map(m=><div className="nature-measurement" key={m.id}><h3 data-narration-content>{m.label}</h3><p data-narration-content><strong>{m.kind==='illustrative'?'Illustrative value':'Reported value'}</strong> · {new Intl.NumberFormat('en',{maximumFractionDigits:6}).format(m.value)} {m.unit}</p><p data-narration-content>Basis: {m.basis}</p>{text(m.explanation)}{(m.place||m.period||m.as_of)&&<p className="physics-note" data-narration-content>{[m.place,m.period,m.as_of].filter(Boolean).join(' · ')}</p>}</div>)}</details>}
    </Section>
    {a&&<Section {...props} id="nature-observation" title={a.title}><p className="physics-note" data-narration-content>{a.mode==='photo_comparison'?'A photo comparison':'An everyday observation'}</p>{text(a.setting)}{a.care_note&&<p className="nature-care-note" data-narration-content>{a.care_note}</p>}<ol>{a.steps.map((s,i)=><li key={i} data-narration-content>{s}</li>)}</ol><h3 data-narration-content>What to notice</h3>{text(a.what_to_notice)}<h3 data-narration-content>What you can conclude</h3>{text(a.can_conclude)}<h3 data-narration-content>What you cannot conclude</h3>{text(a.cannot_conclude)}{photos('observation')}</Section>}
    <Section {...props} id="nature-limits" title="What varies, and what remains uncertain?">
      {l.variation_and_limits.map((v,i)=><div className="nature-explanation" key={i}><h3 data-narration-content>{v.title}</h3>{text(v.explanation)}</div>)}
      {l.misconceptions.map((v,i)=><div className="nature-explanation" key={i}><h3 data-narration-content>{v.belief}</h3>{text(v.correction)}{text(v.explanation)}</div>)}
      {l.optional_depth.length>0&&<div className="nature-explanation"><h3 data-narration-content>A little more detail</h3>{l.optional_depth.map((v,i)=><details className="physics-details" key={i}><summary>{v.title}</summary>{text(v.explanation)}</details>)}</div>}
    </Section>
    {scenes.length>0&&<Section {...props} id="nature-photographs" title="See the idea in nature"><CountryCarousel images={scenes} label="Photographs of the natural subject and its setting" onOpenImage={onOpenImage}/></Section>}
    <Section {...props} id="nature-check" title="Check your understanding">{l.knowledge_checks.map((v,i)=><div className="physics-check" key={i}><h3 data-narration-content>{v.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(v.answer)}{text(v.explanation)}</details></div>)}</Section>
    <Section {...props} id="remember" title="Keep the main idea">{bullets(l.takeaways)}<div className="physics-next"><h3 data-narration-content>Look for another connection</h3><ul>{l.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('nature',topic)}>{topic}</Link></li>)}</ul></div></Section>
  </div>
}
