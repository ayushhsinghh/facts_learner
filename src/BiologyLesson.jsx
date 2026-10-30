import { useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import { SourceLinks } from './Evidence.jsx'
import { archiveUrl } from './navigation.js'
import { BIOLOGY_TYPES, biologyDiagramLayout } from './biology.js'
import { list } from './physics.js'
import './physics.css'
import './biology.css'

function Text({ children }) { return children ? <p data-narration-content>{children}</p> : null }
function Bullets({ items }) { return <ul>{list(items).map((item, i) => <li key={i} data-narration-content>{item}</li>)}</ul> }
function Sources({ item, fact }) { return <SourceLinks sourceIds={item?.source_ids} fact={fact} /> }
function Section({ id, title, Heading, narration, children }) {
  const ref = useRef(null)
  return <section id={id} className="physics-section" ref={ref}>
    <Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading>
    <div className="physics-section-body">{children}</div>
  </section>
}

export function BiologyDiagram({ diagram, fact }) {
  const marker = useId().replaceAll(':', '')
  const layout = biologyDiagramLayout(diagram)
  if (!layout) return <Text>{diagram?.description}</Text>
  return <figure className="biology-diagram">
    <h3>{diagram.title}</h3>
    <svg viewBox="0 0 640 300" aria-hidden="true" focusable="false">
      <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7" fill="none" stroke="currentColor" /></marker></defs>
      {layout.edges.map((edge, i) => {
        const dx = edge.to.x - edge.from.x, dy = edge.to.y - edge.from.y, length = Math.hypot(dx, dy)
        const directed = !edge.relationship_type || ['procedure', 'causal'].includes(edge.relationship_type)
        return <line key={i} x1={edge.from.x + dx / length * 24} y1={edge.from.y + dy / length * 24} x2={edge.to.x - dx / length * 28} y2={edge.to.y - dy / length * 28} strokeDasharray={edge.relationship_type === 'association' ? '6 4' : undefined} markerEnd={directed ? `url(#${marker})` : undefined} />
      })}
      {layout.nodes.map((node, i) => <g key={node.id}><circle cx={node.x} cy={node.y} r="22" /><text x={node.x} y={node.y} dy=".35em" textAnchor="middle">{i + 1}</text></g>)}
    </svg>
    <ol className="biology-diagram-key">{layout.nodes.map(node => <li key={node.id} data-narration-content><strong>{node.label}</strong><span>{node.detail}</span></li>)}</ol>
    <div className="biology-relationships"><h4>Read the connections</h4><ul>{layout.edges.map((edge, i) => <li key={i} data-narration-content><strong>{edge.from.label} {['association', 'conceptual'].includes(edge.relationship_type) ? 'and' : '→'} {edge.to.label}:</strong> {edge.relationship}</li>)}</ul></div>
    <figcaption><Text>{diagram.caption}</Text><Sources item={diagram} fact={fact} /></figcaption>
    <details className="physics-details"><summary>Diagram description and limits</summary><Text>{diagram.description}</Text><Bullets items={diagram.limitations} /></details>
  </figure>
}
export default function BiologyLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const lesson = fact.biology_lesson, type = BIOLOGY_TYPES[lesson.lesson_type]
  const props = { narration, Heading }
  const markdown = value => <MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  return <div className="physics-lesson biology-lesson">
    <Section {...props} id="overview" title={lesson.question}>
      <p className="physics-goal" data-narration-content>{lesson.learning_goal}</p>{markdown(fact.summary)}
      <dl className="biology-context">{[['Organism or system', lesson.context.organism], ['Scale', lesson.context.biological_scale], ['Where', lesson.context.location]].map(([term, value]) => <div key={term} data-narration-content><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
      <h3>Conditions that matter</h3><Bullets items={lesson.context.conditions} />
    </Section>
    <Section {...props} id="biology-idea" title="The big idea">{markdown(lesson.big_idea.explanation)}
      {lesson.big_idea.analogy && <aside className="physics-analogy"><h3>A way to picture it</h3><Text>{lesson.big_idea.analogy}</Text><h4>Where the comparison stops</h4><Text>{lesson.big_idea.analogy_limit}</Text></aside>}
      <Sources item={lesson.big_idea} fact={fact} />
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage} />
      {list(lesson.key_terms).length > 0 && <details className="physics-details"><summary>Words used in this lesson</summary><dl>{lesson.key_terms.map((term, i) => <div key={i} data-narration-content><dt>{term.term}</dt><dd>{term.definition}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="biology-players" title="Meet the key players"><dl className="biology-players">{lesson.key_players.map(player => <div key={player.id}><dt data-narration-content>{player.name}</dt><dd data-narration-content>{player.role}</dd><Sources item={player} fact={fact} /></div>)}</dl></Section>
    {lesson.diagram && <Section {...props} id="biology-diagram" title="See the connections"><BiologyDiagram diagram={lesson.diagram} fact={fact} /></Section>}
    <Section {...props} id="biology-explanation" title={type.title}>
      <ol className="physics-explanation">{lesson.explanation_steps.map(step => <li key={step.id}><h3>{step.title}</h3>{markdown(step.explanation)}
        <p className="physics-note" data-narration-content>Involved: {step.player_ids.map(id => lesson.key_players.find(player => player.id === id)?.name).filter(Boolean).join(', ')}</p><Sources item={step} fact={fact} /></li>)}</ol>
      <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="biology-example" title="Work through an example"><h3>{lesson.worked_example.title}</h3><Text>{lesson.worked_example.situation}</Text>
      <ol className="physics-reasoning">{list(lesson.worked_example.reasoning_steps).map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol>
      <div className="physics-result"><h4>What happens</h4><Text>{lesson.worked_example.outcome}</Text><Text>{lesson.worked_example.interpretation}</Text></div><Sources item={lesson.worked_example} fact={fact} />
      <ArticleImages fact={fact} placement="example" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="biology-change" title="Change one condition"><h3>{lesson.change_scenario.question}</h3>
      <h4>The change</h4><Text>{lesson.change_scenario.changed_condition}</Text><h4>What we expect</h4><Text>{lesson.change_scenario.expected_effect}</Text>
      <h4>Why</h4><Text>{lesson.change_scenario.explanation}</Text><h4>Limits of this prediction</h4><Text>{lesson.change_scenario.limitations}</Text><Sources item={lesson.change_scenario} fact={fact} />
    </Section>
    <Section {...props} id="biology-misconceptions" title="An easy mistake to make">{lesson.misconceptions.map((item, i) => <div className="physics-misconception" key={i}><h3>{item.belief}</h3><Text>{item.correction}</Text><Text>{item.explanation}</Text><Sources item={item} fact={fact} /></div>)}</Section>
    <Section {...props} id="biology-evidence" title="What supports the explanation">
      {lesson.evidence_and_limits.evidence.map((item, i) => <div className="biology-evidence" key={i}><h3>Observation {i + 1}</h3><Text>{item.observation}</Text><p className="physics-note" data-narration-content>Evidence type: {item.evidence_type}</p><h4>How it supports the idea</h4><Text>{item.explanation}</Text><Sources item={item} fact={fact} /></div>)}
      <aside className="physics-assumptions"><h3>Where this explanation applies</h3><Bullets items={lesson.evidence_and_limits.scope_limits} />
        {list(lesson.evidence_and_limits.uncertainties).length > 0 && <><h4>What remains uncertain</h4><Bullets items={lesson.evidence_and_limits.uncertainties} /></>}
      </aside>
      <p className="physics-note">Source links are supplied with the article. They do not indicate independent scientific review.</p>
      <ArticleImages fact={fact} placement="limits" onOpenImage={onOpenImage} />
      {lesson.deeper_detail.map((item, i) => <details className="physics-details" key={i}><summary>{item.title}</summary>{markdown(item.explanation)}<Sources item={item} fact={fact} /></details>)}
    </Section>
    <Section {...props} id="biology-check" title="Check your understanding"><p className="physics-note">Think it through, then open the answer. Nothing is scored or saved.</p>
      {lesson.knowledge_checks.map(check => <div className="physics-check" key={check.id}><h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{check.answer}</Text><Text>{check.explanation}</Text></details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas"><Bullets items={lesson.takeaways} />
      {list(lesson.related_concepts).length > 0 && <div className="physics-next"><h3>Explore a connected idea</h3><ul>{lesson.related_concepts.map(topic => <li key={topic}><Link to={archiveUrl('biology', topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches the Biology archive; a matching article may not be available yet.</p></div>}
    </Section>
  </div>
}
