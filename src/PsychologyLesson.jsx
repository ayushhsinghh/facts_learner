import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import { SourceLinks } from './Evidence.jsx'
import { BiologyDiagram } from './BiologyLesson.jsx'
import { archiveUrl } from './navigation.js'
import { PSYCHOLOGY_TYPES, psychologyDiagram, studyNumber, studyYear } from './psychology.js'
import { list } from './physics.js'
import './physics.css'
import './psychology.css'

function Text({ children }) { return children ? <p data-narration-content>{children}</p> : null }
function Bullets({ items }) { return <ul>{list(items).map((item, i) => <li key={i} data-narration-content>{item}</li>)}</ul> }
function Sources({ item, fact }) { return <SourceLinks sourceIds={item?.source_ids} fact={fact} /> }
function Section({ id, title, Heading, narration, children }) {
  const ref = useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}

const designNames = { randomized_experiment: 'Randomized experiment', nonrandomized_experiment: 'Nonrandomized experiment', observational: 'Observational study', review: 'Research review', meta_analysis: 'Meta-analysis: a combined analysis of studies' }
const replicationNames = { consistent: 'Repeat-study findings described as consistent', mixed: 'Repeat-study findings described as mixed', limited: 'Limited repeat-study evidence', not_assessed: 'Replication not assessed for this article' }

export default function PsychologyLesson({ fact, narration, Heading, MarkdownContent, onOpenImage }) {
  const lesson = fact.psychology_lesson, scenario = lesson.opening_scenario
  const props = { narration, Heading }
  const markdown = value => <MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  return <div className="physics-lesson psychology-lesson">
    <Section {...props} id="overview" title={lesson.question}>
      <p className="physics-goal" data-narration-content>{lesson.learning_goal}</p>
      <div className="psychology-scenario"><h3>{scenario.title}</h3>{markdown(scenario.situation)}<Text>{scenario.question}</Text></div>
      {scenario.prediction && <div className="psychology-prediction"><h3>Make a prediction</h3><Text>{scenario.prediction.prompt}</Text>
        <details className="physics-details"><summary>Explore the explanation</summary><Text>{scenario.prediction.reveal}</Text><Text>{scenario.prediction.explanation}</Text></details>
      </div>}
    </Section>
    <Section {...props} id="psychology-idea" title="The big idea"><h3>{lesson.big_idea.name}</h3>{markdown(lesson.big_idea.explanation)}<Sources item={lesson.big_idea} fact={fact} />
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage} />
      {lesson.key_terms.length > 0 && <details className="physics-details"><summary>Words used in this lesson</summary><dl>{lesson.key_terms.map((item, i) => <div key={i}><dt data-narration-content>{item.term}</dt><dd data-narration-content>{item.definition}</dd></div>)}</dl></details>}
    </Section>
    <Section {...props} id="psychology-explanation" title={PSYCHOLOGY_TYPES[lesson.lesson_type].title}>
      <ol className="physics-explanation">{lesson.explanation_steps.map(step => <li key={step.id}><h3>{step.title}</h3>{markdown(step.explanation)}<Sources item={step} fact={fact} /></li>)}</ol>
      {lesson.diagram && <div className="psychology-map"><BiologyDiagram diagram={psychologyDiagram(lesson.diagram)} fact={fact} />
        {lesson.diagram.edges?.some(edge => edge.relationship_type === 'association') && <p className="physics-note" data-narration-content>Dashed connections show association, not established causation.</p>}
      </div>}
      <ArticleImages fact={fact} placement="explanation" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="psychology-example" title="Work through a situation"><h3>{lesson.worked_example.title}</h3><Text>{lesson.worked_example.situation}</Text>
      <ol className="physics-reasoning">{list(lesson.worked_example.reasoning_steps).map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol>
      <div className="physics-result"><h4>The outcome</h4><Text>{lesson.worked_example.outcome}</Text><Text>{lesson.worked_example.interpretation}</Text></div><Sources item={lesson.worked_example} fact={fact} />
      <ArticleImages fact={fact} placement="example" onOpenImage={onOpenImage} />
    </Section>
    <Section {...props} id="psychology-evidence" title="What the evidence shows">
      {lesson.evidence.map((item, i) => <section className="psychology-study" key={i}><h3>{item.title}</h3><Text>{item.finding}</Text>
        <p className="physics-note" data-narration-content>{designNames[item.research_design]} · {item.inference === 'association' ? 'Association; this does not establish causation' : item.inference === 'causal' ? 'Causal interpretation; assess the design and its limits below' : 'Descriptive finding'}</p>
        <h4>What this can mean</h4><Text>{item.interpretation}</Text>
        {item.causal_justification && <><h4>Basis for the causal interpretation</h4><Text>{item.causal_justification}</Text></>}
        <h4>Who and where</h4><Text>{item.study_notes.participants}</Text><Text>{item.study_notes.setting}</Text>
        <h4>Important limits</h4><Bullets items={item.study_notes.limitations} /><Sources item={item} fact={fact} />
        <details className="physics-details"><summary>Study methods and reported numbers</summary>
          <dl className="psychology-study-meta">{[['Authors',item.study_notes.authors || 'Not reported'],['Publication year',studyYear(item.study_notes.year)],['Sample size',studyNumber(item.study_notes.sample_size)]].map(([term,value]) => <div key={term}><dt data-narration-content>{term}</dt><dd data-narration-content>{value}</dd></div>)}</dl>
          <h4>How the study works</h4><Text>{item.study_notes.method}</Text>
          {item.statistics.map((stat, j) => <div className="psychology-statistic" key={j}><h4>{stat.label}</h4><Text>{typeof stat.value === 'number' ? `${stat.value} ${stat.unit}` : 'Not reported'}</Text><Text>{stat.interpretation}</Text><Sources item={stat} fact={fact} /></div>)}
        </details>
      </section>)}
      <div className="psychology-replication"><h3>{replicationNames[lesson.replication.status]}</h3><Text>{lesson.replication.summary}</Text><Sources item={lesson.replication} fact={fact} /></div>
      <p className="physics-note">The article supplies these references. Source links and evidence labels do not indicate independent verification.</p>
    </Section>
    <Section {...props} id="psychology-alternatives" title="What else could explain it?">{lesson.alternative_explanations.map((item, i) => <div className="psychology-alternative" key={i}><h3>{item.title}</h3><Text>{item.explanation}</Text><h4>How to tell the explanations apart</h4><Text>{item.how_to_distinguish}</Text><Sources item={item} fact={fact} /></div>)}</Section>
    <Section {...props} id="psychology-limits" title="Where the explanation applies">
      <h3>People and populations</h3><Bullets items={lesson.boundary_conditions.populations} /><h3>Situations and contexts</h3><Bullets items={lesson.boundary_conditions.contexts} />
      <aside className="physics-assumptions"><h3>Limits to keep in mind</h3><Bullets items={lesson.boundary_conditions.limitations} />
        {list(lesson.boundary_conditions.uncertainties).length > 0 && <><h4>What remains uncertain</h4><Bullets items={lesson.boundary_conditions.uncertainties} /></>}
      </aside>
      {lesson.deeper_detail.map((item, i) => <details className="physics-details" key={i}><summary>{item.title}</summary>{markdown(item.explanation)}<Sources item={item} fact={fact} /></details>)}
    </Section>
    <ArticleImages fact={fact} placement="limits" onOpenImage={onOpenImage} />
    <Section {...props} id="psychology-application" title="Use the idea carefully">{lesson.practical_application.map((item, i) => <div className="psychology-application" key={i}><h3>{item.suggestion}</h3><Text>{item.reasoning}</Text><h4>What this does not promise</h4><Text>{item.limitations}</Text><Sources item={item} fact={fact} /></div>)}</Section>
    <Section {...props} id="psychology-check" title="Check your understanding"><p className="physics-note">Think it through, then open the answer. Nothing is scored or saved.</p>
      {lesson.knowledge_checks.map(check => <div className="physics-check" key={check.id}><h3 data-narration-content>{check.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{check.answer}</Text><Text>{check.explanation}</Text></details></div>)}
    </Section>
    <Section {...props} id="remember" title="Keep these ideas"><Bullets items={lesson.takeaways} />
      {list(lesson.related_concepts).length > 0 && <div className="physics-next"><h3>Explore a connected idea</h3><ul>{lesson.related_concepts.map(topic => <li key={topic}><Link to={archiveUrl('psychology',topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches the Psychology archive; a matching article may not be available yet.</p></div>}
    </Section>
  </div>
}
