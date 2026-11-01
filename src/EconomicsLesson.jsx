import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import EconomicsDiagram, { EconomicProvenance } from './EconomicsDiagram.jsx'
import { economicsPhotos, economicsScenes, economicNumber } from './economics.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './economics.css'
function Section({ id, title, Heading, narration, children }) {
  const ref = useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({ image, onOpenImage }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <figure className="economics-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={() => onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={() => setFailed(true)}/></button><figcaption>{image.credit?.popular_pick&&<span>Popular on Unsplash · </span>}{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function EconomicsLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const l = fact.economics_lesson, e = l.worked_example, m = l.mechanism, props = { Heading, narration }
  const actors = new Map(m.actors.map(a => [a.id, a]))
  const amounts = new Map([...e.values.map(v => [v.id, { ...v, amount: v.value }]), ...e.calculations.map(c => [c.id, { ...c, amount: c.result }])])
  const operations = { add: ['+', 'plus'], subtract: ['−', 'minus'], multiply: ['×', 'times'], divide: ['÷', 'divided by'] }
  const text = value => <MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const bullets = items => <ul>{items.map((item, i) => <li key={i} data-narration-content>{item}</li>)}</ul>
  const photos = section => economicsPhotos(fact, section).map(image => <Photo key={image.url} image={image} onOpenImage={onOpenImage}/>)
  const scenes = economicsScenes(fact)
  return <div className="physics-lesson economics-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="economics-setting">{[['Branch', l.identity.branch], ['Scope', l.identity.scope], ['Context', l.identity.geography]].map(([label, value]) => <div key={label}><dt data-narration-content>{label}</dt><dd data-narration-content>{value}</dd></div>)}</dl>
      <h3 data-narration-content>{l.opening_scenario.title}</h3>{text(l.opening_scenario.experience)}{l.opening_scenario.question !== l.question && text(l.opening_scenario.question)}
      <div className="economics-explanation"><h3>The short answer</h3>{text(l.central_idea)}</div>
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
      {l.key_terms.length > 0 && <details className="physics-details"><summary>A few useful words</summary><dl>{l.key_terms.map(t => <div key={t.term}><dt data-narration-content>{t.term}</dt><dd>{text(t.meaning)}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="economics-mechanism" title="Follow the change">
      <dl className="economics-actors">{m.actors.map(a => <div key={a.id} id={`economics-actor-${a.id}`} tabIndex={-1}><dt data-narration-content>{a.name}</dt><dd>{text(a.role)}</dd></div>)}</dl>
      <ol className="economics-sequence">{m.steps.map((s, i) => <li key={s.id}><h3 data-narration-content>{s.title}</h3><ul className="economics-actor-links" aria-label="People or groups in this step">{s.actor_ids.map(id => <li key={id}><a href={`#economics-actor-${id}`}>{actors.get(id).name}</a></li>)}</ul>{text(s.action)}<p data-narration-content><strong>What changes:</strong> {s.what_changes}</p><p data-narration-content><strong>{i === m.steps.length - 1 ? 'What this means:' : 'Why the next change can happen:'}</strong> {s.why_next}</p><div className="economics-conditions"><h4>This depends on</h4>{bullets(s.conditions)}</div></li>)}</ol>{photos('mechanism')}
    </Section>
    <Section {...props} id="economics-example" title={e.title}>
      <EconomicProvenance value={e.provenance}/><h3>Starting assumptions</h3>{bullets(e.assumptions)}
      {e.values.length > 0 && <dl className="economics-values">{e.values.map(v => <div key={v.id}><dt data-narration-content>{v.label}</dt><dd data-narration-content>{economicNumber(v.value)} <span>{v.unit}</span></dd></div>)}</dl>}
      {e.calculations.map(c => {const [a, b] = c.operand_ids.map(id => amounts.get(id)), [symbol, spoken] = operations[c.operation]; return <div className="economics-calculation" key={c.id}><h3 data-narration-content>{c.label}</h3><p className="economics-equation" aria-hidden="true">{economicNumber(a.amount)} {symbol} {economicNumber(b.amount)} = {economicNumber(c.result)} <span>{c.unit}</span></p><p className="physics-note" data-narration-content>{a.label}, {economicNumber(a.amount)} {a.unit}, {spoken} {b.label}, {economicNumber(b.amount)} {b.unit}, equals {economicNumber(c.result)} {c.unit}.</p>{text(c.explanation)}</div>})}
      <ol>{e.reasoning.map((r, i) => <li key={i} data-narration-content>{r}</li>)}</ol><div className="economics-outcome"><h3>What the example tells us</h3>{text(e.outcome)}{text(e.explanation)}</div>{photos('example')}
      <details className="physics-details"><summary>What this example leaves out</summary>{bullets(e.limits)}</details>
      {l.diagram && <EconomicsDiagram diagram={l.diagram}/>}
    </Section>
    {l.distributional_effects.length > 0 && <Section {...props} id="economics-effects" title="Different people, different effects">{l.distributional_effects.map(effect => <div className="economics-explanation" key={effect.actor_id}><h3><a href={`#economics-actor-${effect.actor_id}`}>{actors.get(effect.actor_id).name}</a></h3><dl className="economics-effects">{[['Possible benefit', effect.benefit], ['Cost or constraint', effect.cost], ['Over what period?', effect.time_horizon], ['Depends on', effect.conditions]].map(([label, value]) => <div key={label}><dt data-narration-content>{label}</dt><dd>{text(value)}</dd></div>)}</dl></div>)}{photos('effects')}</Section>}
    {l.real_world_case && <Section {...props} id="economics-case" title={l.real_world_case.title}><p className="physics-note" data-narration-content>{l.real_world_case.place} · {l.real_world_case.period}</p>{text(l.real_world_case.explanation)}{text(l.real_world_case.connection)}{photos('case')}<h3>What this case does not establish</h3>{text(l.real_world_case.limits)}</Section>}
    <Section {...props} id="economics-limits" title="What could change the result?">
      {l.conditions_and_limits.map((item, i) => <div className="economics-explanation" key={i}><h3>{item.title}</h3>{text(item.explanation)}</div>)}{photos('limits')}
      {l.misconceptions.map((item, i) => <div className="economics-explanation" key={i}><h3>{item.belief}</h3>{text(item.correction)}{text(item.explanation)}</div>)}
      {l.optional_depth.length > 0 && <div className="economics-explanation"><h3>A little more detail</h3>{l.optional_depth.map((item, i) => <details className="physics-details" key={i}><summary>{item.title}</summary>{text(item.explanation)}</details>)}</div>}
    </Section>
    {scenes.length > 0 && <Section {...props} id="economics-photographs" title="See the idea in everyday life">{scenes.length === 1 ? <Photo image={scenes[0]} onOpenImage={onOpenImage}/> : <CountryCarousel images={scenes} label="Photographs of the lesson’s settings and processes" onOpenImage={onOpenImage}/>}</Section>}
    <Section {...props} id="economics-check" title="Check your understanding">{l.knowledge_checks.map((item, i) => <div className="physics-check" key={i}><h3 data-narration-content>{item.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(item.answer)}{text(item.explanation)}</details></div>)}</Section>
    <Section {...props} id="remember" title="Keep the main idea">{bullets(l.takeaways)}<div className="physics-next"><h3>Keep exploring</h3><ul>{l.related_topics.map(topic => <li key={topic}><Link to={archiveUrl('economics', topic)}>{topic}</Link></li>)}</ul></div></Section>
  </div>
}
