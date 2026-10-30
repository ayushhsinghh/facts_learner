import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import { LAW_TYPES, lawSourceKind, lawStatus } from './indianLaws.js'
import { displayLegalDate } from './constitution.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './indianLaws.css'

function Text({ children }) { return children ? <p data-narration-content>{children}</p> : null }
function Bullets({ items }) { return <ul>{items.map((item, i) => <li key={i} data-narration-content>{item}</li>)}</ul> }
function Section({ id, title, Heading, narration, children }) {
  const ref = useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Example({ item }) {
  return <><h3>{item.title}</h3><Text>{item.situation}</Text><ol className="physics-reasoning">{item.reasoning_steps.map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol>
    <h4>What this illustrates</h4><Text>{item.implications}</Text><h4>Limits of this example</h4><Text>{item.limits}</Text></>
}
export default function IndianLawLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const l = fact.indian_law_lesson, props = { narration, Heading }
  const markdown = value => <MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  return <div className="physics-lesson indian-law-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <p className="physics-note" data-narration-content>{l.legal_area}</p>
      <div className="law-scenario"><h3>{l.opening_scenario.title}</h3>{markdown(l.opening_scenario.situation)}<Text>{l.opening_scenario.question}</Text></div>
    </Section>
    <Section {...props} id="law-rule" title="The rule in plain language">
      {markdown(l.plain_rule.explanation)}
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage} />
      {l.key_terms.length > 0 && <details className="physics-details"><summary>Words used in this lesson</summary><dl>{l.key_terms.map((term, i) => <div key={i}><dt data-narration-content>{term.term}</dt><dd data-narration-content>{term.definition}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="law-applies" title="When the rule applies">
      <h3>Where and who</h3><Text>{l.applicability.jurisdiction}</Text><Bullets items={l.applicability.who_it_concerns} />
      <h3>Dates that matter</h3><Text>{l.applicability.relevant_dates}</Text>
      <h3>Conditions</h3><Bullets items={l.applicability.conditions} />
      {l.applicability.exceptions.length > 0 && <><h3>Exceptions and qualifications</h3><Bullets items={l.applicability.exceptions} /></>}
      <h3>Keep these limits in mind</h3><Bullets items={l.applicability.limits} />
      <ArticleImages fact={fact} placement="limits" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="law-explanation" title={LAW_TYPES[l.lesson_type]}>
      <ol className="physics-explanation">{l.explanation_steps.map(step => <li key={step.id}><h3>{step.title}</h3>{markdown(step.explanation)}</li>)}</ol>
      <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="law-example" title="Work through a situation">
      <p className="physics-note" data-narration-content>A hypothetical example</p><Example item={l.worked_example} />
      {l.contrast_example && <div className="law-contrast"><h3>Change one important fact</h3><Example item={l.contrast_example} /></div>}
      <ArticleImages fact={fact} placement="example" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="law-confusions" title="Ideas that are easy to mix up">
      {l.common_confusions.map((item, i) => <div className="law-confusion" key={i}><h3>{item.confusion}</h3><Text>{item.clarification}</Text></div>)}
    </Section>
    <Section {...props} id="law-detail" title="The legal basis and more context">
      <p className="physics-note" data-narration-content>The explanations are paraphrases. Sources are listed at the bottom. Legal accuracy and current applicability have not been independently checked.</p>
      {l.legal_basis.map(basis => <details className="physics-details" key={basis.id}><summary>{basis.instrument} ({basis.year}) · {basis.reference}</summary>
        <h3>{basis.title}</h3><p className="physics-note" data-narration-content>{lawSourceKind(basis.source_kind)} · {lawStatus(basis.status)}. Status is supplied by the article, not a live legal check.</p>
        {basis.commencement_date && <Text>Commencement date supplied: {displayLegalDate(basis.commencement_date)}.</Text>}
        <h4>Plain-language explanation</h4>{markdown(basis.plain_meaning)}<h4>Legal effect</h4><Text>{basis.legal_effect}</Text>
      </details>)}
      {l.case_note && <details className="physics-details"><summary>{l.case_note.name}</summary>
        <p className="physics-note" data-narration-content>{l.case_note.court} · {l.case_note.citation} · {displayLegalDate(l.case_note.decision_date)}</p>
        <h3>The question</h3><Text>{l.case_note.question}</Text><h3>The court’s decision</h3><Text>{l.case_note.decision}</Text><h3>Why it matters</h3><Text>{l.case_note.significance}</Text><h4>Limits</h4><Text>{l.case_note.limits}</Text>
      </details>}
      {l.law_changes.length > 0 && <details className="physics-details"><summary>How the law changed</summary><ol className="law-changes">{l.law_changes.map((item, i) => <li key={i}>
        <p className="physics-note" data-narration-content>{displayLegalDate(item.date)} · {lawStatus(item.status)}</p><h3>{item.label}</h3><Text>{item.change}</Text><Text>{item.significance}</Text>
      </li>)}</ol></details>}
      {l.commentary.map((item, i) => <details className="physics-details" key={`commentary-${i}`}><summary>Commentary: {item.title}</summary>{markdown(item.explanation)}<h4>Limits of this commentary</h4><Text>{item.limits}</Text></details>)}
      {l.deeper_detail.map((item, i) => <details className="physics-details" key={`detail-${i}`}><summary>{item.title}</summary>{markdown(item.explanation)}</details>)}
    </Section>
    <Section {...props} id="law-check" title="Check your understanding">
      <p className="physics-note">Think it through, then reveal the answer. Nothing is scored or saved.</p>
      {l.knowledge_checks.map(check => <div className="physics-check" key={check.id}><h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{check.answer}</Text><Text>{check.explanation}</Text></details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas"><Bullets items={l.takeaways} />
      {l.related_concepts.length > 0 && <div className="physics-next"><h3>Explore a connected idea</h3><ul>{l.related_concepts.map(topic => <li key={topic}><Link to={archiveUrl('indian_laws', topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches the Indian Laws archive; a matching article may not be available yet.</p></div>}
    </Section>
  </div>
}
