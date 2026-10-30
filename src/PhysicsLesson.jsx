import { lazy, Suspense, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import { archiveUrl } from './navigation.js'
import { list, graphGeometry, validDiagram, calculationLines } from './physics.js'
import './physics.css'

const PhysicsMath = lazy(() => import('./PhysicsMath.jsx'))

function Paragraph({ children }) {
  return children ? <p data-narration-content>{children}</p> : null
}
function Bullets({ items }) {
  return <ul>{list(items).map((item, index) => <li key={index} data-narration-content>{item}</li>)}</ul>
}
function Section({ id, title, narration, Heading, children, className = '' }) {
  const ref = useRef(null)
  return <section className={`physics-section ${className}`} id={id} ref={ref}>
    <Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading>
    <div className="physics-section-body">{children}</div>
  </section>
}


export function PhysicsDiagram({ diagram, fact }) {
  const markerId = useId().replaceAll(':', '')
  if (!validDiagram(diagram)) return diagram?.description ? <Paragraph>{diagram.description}</Paragraph> : null
  const graph = diagram.type === 'graph' ? graphGeometry(diagram) : null
  const isSequence = ['comparison', 'energy_flow'].includes(diagram.type)
  return <figure className="physics-diagram">
    <h3>{diagram.title}</h3>
    {!isSequence && <svg viewBox="0 0 640 330" aria-hidden="true" focusable="false">
      <defs><marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7" fill="none" stroke="currentColor" /></marker></defs>
      {diagram.type === 'force' && <>
        <rect className="physics-object" x="280" y="125" width="80" height="80" rx="4" />
        {diagram.vectors.map((v, i) => <g key={i} className={`physics-line physics-line-${i % 2}`}>
          <line x1="320" y1="165" x2={320 + v.x * 205} y2={165 - v.y * 115} markerEnd={`url(#${markerId})`} />
          <text x={320 + v.x * 228} y={165 - v.y * 137} textAnchor="middle" dy={Math.abs(v.y) < .1 ? -12 : 5}>F{i + 1}</text>
        </g>)}
      </>}
      {diagram.type === 'ray' && diagram.rays.map((ray, i) => <g key={i} className={`physics-line physics-line-${i % 2}`}>
        <line x1={60 + ray.x1 * 520} y1={280 - ray.y1 * 230} x2={60 + ray.x2 * 520} y2={280 - ray.y2 * 230} markerEnd={`url(#${markerId})`} />
      </g>)}
      {graph && <>
        <path className="physics-axis" d="M70 45V272H590" />
        <polyline className="physics-plot" points={graph.points.map(p => `${p.x},${p.y}`).join(' ')} />
        {graph.points.map((p, i) => <circle className="physics-data-point" key={i} cx={p.x} cy={p.y} r="3" />)}
        <text x="325" y="318" textAnchor="middle">{diagram.x_label} ({diagram.x_unit})</text>
        <text transform="translate(17 160) rotate(-90)" textAnchor="middle">{diagram.y_label} ({diagram.y_unit})</text>
        <text x="70" y="292" textAnchor="middle">{graph.xMin}</text><text x="580" y="292" textAnchor="middle">{graph.xMax}</text>
        <text x="60" y="272" textAnchor="end">{graph.yMin}</text><text x="60" y="52" textAnchor="end">{graph.yMax}</text>
      </>}
    </svg>}
    {isSequence && <ol className="physics-diagram-key">{diagram.items.map((item, i) => <li key={i} data-narration-content><strong>{item.label}</strong><span>{item.detail}</span></li>)}</ol>}
    {diagram.type === 'force' && <ul className="physics-vector-key">{diagram.vectors.map((item, i) => <li key={i} data-narration-content>F{i + 1}: {item.label}</li>)}</ul>}
    {diagram.type === 'ray' && <ol className="physics-vector-key">{diagram.rays.map((item, i) => <li key={i} data-narration-content>{item.label}</li>)}</ol>}
    <figcaption><Paragraph>{diagram.caption}</Paragraph></figcaption>
    {list(diagram.assumptions).length > 0 && <div className="physics-assumptions"><h4>What this diagram assumes</h4><Bullets items={diagram.assumptions} /></div>}
    <details className="physics-details"><summary>{isSequence ? 'More context' : 'Diagram description'}{graph && ' & data'}</summary><Paragraph>{diagram.description}</Paragraph>
      {graph && <div className="physics-table-scroll" tabIndex={0} role="region" aria-label="Graph data"><table><caption>{diagram.title}: plotted values</caption><thead><tr><th>{diagram.x_label} ({diagram.x_unit})</th><th>{diagram.y_label} ({diagram.y_unit})</th></tr></thead><tbody>{diagram.points.map((p, i) => <tr key={i}><td>{p.x}</td><td>{p.y}</td></tr>)}</tbody></table></div>}
    </details>
  </figure>
}

function Mathematics({ equations, fact }) {
  const [open, setOpen] = useState(false)
  return <details className="physics-details physics-maths" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>The mathematics <span>Optional · symbols, units, and derivations</span></summary>
    {list(equations).map((equation, i) => <section key={i} className="physics-equation-block">
      <h3>{equation.title}</h3>
      {open && <Suspense fallback={<Paragraph>{equation.spoken_formula}</Paragraph>}><PhysicsMath equation={equation} /></Suspense>}
      <Paragraph>{equation.spoken_formula}</Paragraph><Paragraph>{equation.meaning}</Paragraph>
      <dl className="physics-symbols">{list(equation.symbols).map(symbol => <div key={symbol.id} data-narration-content><dt>{symbol.symbol}</dt><dd>{symbol.meaning} <span>({symbol.unit})</span></dd></div>)}</dl>
      <h4>When this equation applies</h4><Bullets items={equation.assumptions} />
      {list(equation.derivation_steps).length > 0 && <details className="physics-details"><summary>Follow the derivation</summary><ol>{equation.derivation_steps.map((step, j) => <li key={j} data-narration-content>{step}</li>)}</ol></details>}

    </section>)}
  </details>
}

export default function PhysicsLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const lesson = fact.physics_lesson
  const sectionProps = { narration, Heading }
  const example = lesson.worked_example
  return <div className="physics-lesson">
    <Section {...sectionProps} id="overview" title={lesson.question} className="physics-opening">
      <p className="physics-goal" data-narration-content>{lesson.learning_goal}</p>
      <MarkdownContent narration={narration} standalone={false}>{fact.summary}</MarkdownContent>
      {(list(lesson.prerequisites).length > 0 || list(lesson.key_terms).length > 0) && <details className="physics-details"><summary>A little background <span>Concepts and words used in this lesson</span></summary>
        {list(lesson.prerequisites).length > 0 && <><h3>Before you begin</h3><dl>{lesson.prerequisites.map((item, i) => <div key={i} data-narration-content><dt>{item.term}</dt><dd>{item.explanation}</dd></div>)}</dl></>}
        {list(lesson.key_terms).length > 0 && <><h3>Words to know</h3><dl>{lesson.key_terms.map((item, i) => <div key={i} data-narration-content><dt>{item.term}</dt><dd>{item.definition} {item.relevance}</dd></div>)}</dl></>}
      </details>}
    </Section>
    <Section {...sectionProps} id="physics-idea" title="The basic idea">
      <MarkdownContent narration={narration} standalone={false}>{lesson.intuition.explanation}</MarkdownContent>
      {lesson.intuition.analogy && <aside className="physics-analogy"><h3>A way to picture it</h3><Paragraph>{lesson.intuition.analogy}</Paragraph><h4>Where the comparison stops</h4><Paragraph>{lesson.intuition.analogy_limit}</Paragraph></aside>}

      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage} />
    </Section>
    {lesson.diagram && <Section {...sectionProps} id="physics-diagram" title="See the idea"><PhysicsDiagram diagram={lesson.diagram} fact={fact} /></Section>}
    <Section {...sectionProps} id="physics-explanation" title="Why it happens">
      <ol className="physics-explanation">{list(lesson.explanation_steps).map((step, i) => <li key={step.id || i}>
        <h3>{step.title}</h3><MarkdownContent narration={narration} standalone={false}>{step.explanation}</MarkdownContent>
      </li>)}</ol>
      <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage} />
    </Section>
    <Section {...sectionProps} id="physics-example" title="Work through an example">
      <h3>{example.question}</h3><Bullets items={example.starting_conditions} />
      {list(example.givens).length > 0 && <dl className="physics-givens">{example.givens.map(item => <div key={item.id} data-narration-content><dt>{item.meaning} ({item.symbol})</dt><dd>{item.value} {item.unit}</dd></div>)}</dl>}
      <ol className="physics-reasoning">{list(example.reasoning_steps).map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol>
      {list(example.calculations).length > 0 && <details className="physics-details"><summary>Show the numerical steps</summary><ol>{calculationLines(example).map(calc => <li key={calc.id} data-narration-content><strong>{calc.explanation}</strong><p>{calc.expression}</p></li>)}</ol></details>}
      <div className="physics-result"><h4>The result</h4><Paragraph>{example.result}</Paragraph><Paragraph>{example.interpretation}</Paragraph></div>
      {fact.physics_validation?.arithmetic_checked && <p className="physics-note">Numerical steps checked for arithmetic and SI dimensions. This does not independently verify the physical model.</p>}

      <ArticleImages fact={fact} placement="example" onOpenImage={onOpenImage} />
      {list(lesson.mathematics).length > 0 && <Mathematics equations={lesson.mathematics} fact={fact} />}
    </Section>
    {list(lesson.misconceptions).length > 0 && <Section {...sectionProps} id="physics-misconceptions" title="An easy mistake to make">
      {lesson.misconceptions.map((item, i) => <div className="physics-misconception" key={i}><h3>{item.belief}</h3><Paragraph>{item.correction}</Paragraph><Paragraph>{item.explanation}</Paragraph></div>)}
    </Section>}
    <Section {...sectionProps} id="physics-limits" title="Use the idea—and know its limits">
      {list(lesson.applications).map((item, i) => <div className="physics-application" key={i}><h3>{item.title}</h3><Paragraph>{item.explanation}</Paragraph></div>)}
      <aside className="physics-assumptions"><h3>Where the model stops</h3><Bullets items={lesson.model_limits} /></aside>
      <ArticleImages fact={fact} placement="limits" onOpenImage={onOpenImage} />
    </Section>
    <Section {...sectionProps} id="physics-check" title="Check your understanding">
      <p className="physics-note">Think it through first. Then open the answer. Nothing is scored or saved.</p>
      {list(lesson.knowledge_checks).map((check, i) => <div className="physics-check" key={check.id || i}>
        <h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer & explanation</summary><Paragraph>{check.answer}</Paragraph><Paragraph>{check.explanation}</Paragraph>
          {check.misconception && <Paragraph>{check.misconception}</Paragraph>}
        </details>
      </div>)}
    </Section>
    <Section {...sectionProps} id="remember" title="Keep this idea" className="physics-takeaways"><Bullets items={lesson.takeaways} />
      {list(lesson.related_concepts).length > 0 && <div className="physics-next"><h3>Explore a connected idea</h3><ul>{lesson.related_concepts.map((topic, i) => <li key={i}><Link to={archiveUrl('physics', topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches the Physics archive; a matching article may not be available yet.</p></div>}
    </Section>
  </div>
}
