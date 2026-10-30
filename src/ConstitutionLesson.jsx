import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import { SourceLinks } from './Evidence.jsx'
import { BiologyDiagram } from './BiologyLesson.jsx'
import { biologyDiagramLayout } from './biology.js'
import { archiveUrl } from './navigation.js'
import { CONSTITUTION_TYPES, constitutionDiagram, verifiedExcerpt, displayLegalDate, OFFICIAL_EDITION_URL } from './constitution.js'
import { list } from './physics.js'
import './physics.css'
import './constitution.css'

function Text({ children }) { return children ? <p data-narration-content>{children}</p> : null }
function Bullets({ items }) { return <ul>{list(items).map((item, i) => <li key={i} data-narration-content>{item}</li>)}</ul> }
function Sources({ item, fact }) { return <SourceLinks sourceIds={item?.source_ids} fact={fact} /> }
function Section({ id, title, Heading, narration, children }) {
  const ref = useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}

const sourceKinds = { constitutional_text: 'Constitutional provision', judgment: 'Judicial interpretation', amendment: 'Constitutional amendment', ordinary_law: 'Ordinary law' }
const provisionKinds = { fundamental_right: 'Fundamental right', directive_principle: 'Directive principle', fundamental_duty: 'Fundamental duty', institutional_rule: 'Institutional rule', procedure: 'Constitutional procedure', other: 'Constitutional provision' }

export function ConstitutionDiagram({ diagram, fact }) {
  const mapped = constitutionDiagram(diagram)
  if (diagram?.type !== 'before_after' || !biologyDiagramLayout(mapped)) return <BiologyDiagram diagram={mapped} fact={fact} />
  return <figure className="constitution-comparison"><h3>{diagram.title}</h3>
    <div className="constitution-comparison-panes">{diagram.nodes.map(node => <section key={node.id}><h4 data-narration-content>{node.label}</h4><Text>{node.detail}</Text></section>)}</div>
    {diagram.edges.map((edge, i) => <Text key={i}>{edge.relationship}</Text>)}
    <figcaption><Text>{diagram.caption}</Text><Sources item={diagram} fact={fact} /></figcaption>
    <details className="physics-details"><summary>Comparison description and limits</summary><Text>{diagram.description}</Text><Bullets items={diagram.limitations} /></details>
  </figure>
}

export default function ConstitutionLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const lesson = fact.constitution_lesson, scenario = lesson.opening_scenario
  const props = { narration, Heading }
  const markdown = value => <MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  return <div className="physics-lesson constitution-lesson">
    <Section {...props} id="overview" title={lesson.question}>
      <p className="physics-goal" data-narration-content>{lesson.learning_goal}</p>
      <div className="constitution-scenario"><h3>{scenario.title}</h3>{markdown(scenario.situation)}<Text>{scenario.question}</Text></div>
    </Section>
    <Section {...props} id="constitution-idea" title="The idea in plain language">{markdown(lesson.big_idea.explanation)}<Sources item={lesson.big_idea} fact={fact} />
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage} />
      {lesson.key_terms.length > 0 && <details className="physics-details"><summary>Words used in this lesson</summary><dl>{lesson.key_terms.map((item, i) => <div key={i}><dt data-narration-content>{item.term}</dt><dd data-narration-content>{item.definition}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="constitution-basis" title="Where the idea comes from">
      {lesson.constitutional_basis.map(basis => {
        const excerpt = verifiedExcerpt(basis)
        return <section className="constitution-provision" key={basis.id}>
          <h3>{basis.reference}: {basis.title}</h3><p className="physics-note" data-narration-content>{sourceKinds[basis.source_kind]} · {provisionKinds[basis.provision_type]}{basis.part_or_schedule ? ` · ${basis.part_or_schedule}` : ''}</p>
          <h4>Plain-language explanation</h4>{markdown(basis.plain_meaning)}<h4>What kind of effect it has</h4><Text>{basis.legal_effect}</Text><Sources item={basis} fact={fact} />
          <details className="physics-details"><summary>Read the constitutional text</summary>
            {excerpt ? <><p className="physics-note">Excerpt matched to the official edition dated {displayLegalDate(basis.text_verification.edition_date)}.</p>
              <blockquote className="constitution-excerpt"><Text>{excerpt}</Text></blockquote><p className="physics-note">Text comparison completed: {displayLegalDate(basis.text_verification.checked_at)}. This is an excerpt, not necessarily the entire provision.</p></>
              : <Text>No exact excerpt has been matched for this reference. The explanation above is a paraphrase.</Text>}
            <a href={OFFICIAL_EDITION_URL} target="_blank" rel="noreferrer">Open the official constitutional edition</a>
          </details>
        </section>
      })}
      <aside className="constitution-source-context"><h3>About the source edition</h3>
        <Text>{lesson.source_context?.edition_date ? `Text matching uses the edition dated ${displayLegalDate(lesson.source_context.edition_date)}.` : 'The source edition has not been supplied for text matching.'}</Text>
        <Text>Matching wording does not confirm later amendments or judgments. The article generation date is not a legal verification date.</Text>
      </aside>
    </Section>
    <Section {...props} id="constitution-explanation" title={CONSTITUTION_TYPES[lesson.lesson_type].title}>
      <ol className="physics-explanation">{lesson.explanation_steps.map(step => <li key={step.id}><h3>{step.title}</h3>{markdown(step.explanation)}
        <p className="physics-note" data-narration-content>Relevant provision: {step.basis_ids.map(id => lesson.constitutional_basis.find(basis => basis.id === id)?.reference).filter(Boolean).join(', ')}</p><Sources item={step} fact={fact} /></li>)}</ol>
      {lesson.diagram && <div className="constitution-map"><ConstitutionDiagram diagram={lesson.diagram} fact={fact} /></div>}
      <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="constitution-example" title="Work through a situation"><h3>{lesson.worked_example.title}</h3><Text>{lesson.worked_example.situation}</Text>
      <ol className="physics-reasoning">{list(lesson.worked_example.reasoning_steps).map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol>
      <div className="physics-result"><h4>What the example illustrates</h4><Text>{lesson.worked_example.outcome}</Text></div>
      <h4>Limits of this example</h4><Text>{lesson.worked_example.limits}</Text><Sources item={lesson.worked_example} fact={fact} />
      <ArticleImages fact={fact} placement="example" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="constitution-limits" title="Who it concerns—and its limits">
      <h3>Who it concerns</h3><Bullets items={lesson.scope_and_limits.who_it_concerns} /><h3>Conditions that matter</h3><Bullets items={lesson.scope_and_limits.conditions} />
      {list(lesson.scope_and_limits.exceptions).length > 0 && <><h3>Qualifications and exceptions</h3><Bullets items={lesson.scope_and_limits.exceptions} /></>}
      <aside className="physics-assumptions"><h3>Keep these limits in mind</h3><Bullets items={lesson.scope_and_limits.limits} /></aside><Sources item={lesson.scope_and_limits} fact={fact} />
      <ArticleImages fact={fact} placement="limits" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="constitution-confusions" title="Ideas that are easy to mix up">{lesson.common_confusions.map((item, i) => <div className="constitution-confusion" key={i}><h3>{item.confusion}</h3><Text>{item.clarification}</Text><Sources item={item} fact={fact} /></div>)}</Section>
    {(lesson.case_note || lesson.amendment_timeline.length > 0 || lesson.deeper_detail.length > 0) && <Section {...props} id="constitution-context" title="A little more context">
      {lesson.case_note && <details className="physics-details"><summary>{lesson.case_note.name}</summary>
        <p className="physics-note" data-narration-content>{lesson.case_note.court} · {lesson.case_note.citation} · Decision date: {displayLegalDate(lesson.case_note.decision_date)}</p>
        <h3>The question</h3><Text>{lesson.case_note.question}</Text><h3>The decision</h3><Text>{lesson.case_note.decision}</Text><h3>Why it matters</h3><Text>{lesson.case_note.significance}</Text><h4>Limits</h4><Text>{lesson.case_note.limits}</Text><Sources item={lesson.case_note} fact={fact} />
      </details>}
      {lesson.amendment_timeline.length > 0 && <details className="physics-details"><summary>How the provision changed</summary><ol className="constitution-timeline">{lesson.amendment_timeline.map((item, i) => <li key={i}>
        <time dateTime={item.date || undefined} data-narration-content>{displayLegalDate(item.date)}</time><h3>{item.label}</h3><Text>{item.change}</Text><Text>{item.significance}</Text><Sources item={item} fact={fact} />
      </li>)}</ol></details>}
      {lesson.deeper_detail.map((item, i) => <details className="physics-details" key={i}><summary>{item.title}</summary>{markdown(item.explanation)}<Sources item={item} fact={fact} /></details>)}
    </Section>}
    <Section {...props} id="constitution-check" title="Check your understanding"><p className="physics-note">Think it through, then open the answer. Nothing is scored or saved.</p>
      {lesson.knowledge_checks.map(check => <div className="physics-check" key={check.id}><h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{check.answer}</Text><Text>{check.explanation}</Text></details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas"><Bullets items={lesson.takeaways} />
      {list(lesson.related_concepts).length > 0 && <div className="physics-next"><h3>Explore a connected idea</h3><ul>{lesson.related_concepts.map(topic => <li key={topic}><Link to={archiveUrl('indian_constitution',topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches the Constitution archive; a matching article may not be available yet.</p></div>}
    </Section>
  </div>
}
