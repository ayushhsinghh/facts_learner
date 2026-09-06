import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchCategories, getFactStatus, startFact } from './api.js'

const FALLBACK_CATEGORIES = [
  { id: 'space', name: 'Space' },
  { id: 'history', name: 'History' },
  { id: 'science', name: 'Science' },
  { id: 'nature', name: 'Nature' },
  { id: 'food', name: 'Food' },
  { id: 'india', name: 'India' },
]

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="arc arc-one" />
      <span className="arc arc-two" />
      <span className="arc arc-three" />
      <span className="star-map"><i /><i /><i /><i /><i /><i /><i /></span>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function SearchForm({ categories, selectedId, setSelectedId, onSubmit, loading }) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <label htmlFor="category">Choose a topic</label>
      <div className="search-control">
        <select
          id="category"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={loading}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <span className="select-mark" aria-hidden="true" />
      </div>
      <button type="submit" disabled={!selectedId || loading}>
        <span>Find me a fact</span>
        <ArrowIcon />
      </button>
    </form>
  )
}

function SearchRitual({ categoryName, elapsed }) {
  const message = elapsed < 12
    ? 'Opening the index'
    : elapsed < 28
      ? 'Following the references'
      : 'Arranging what matters'

  return (
    <section className="search-ritual">
      <div className="orbital-loader" aria-hidden="true">
        <span className="orbit orbit-one"><i /></span>
        <span className="orbit orbit-two"><i /></span>
        <span className="orbit orbit-three"><i /></span>
        <span className="signal-core" />
      </div>
      <h1>Searching through <em>{categoryName}</em></h1>
      <div className="search-time">
        <span role="status" aria-live="polite">{message}</span>
        <span aria-hidden="true">{String(elapsed).padStart(2, '0')} seconds elapsed</span>
        <span>Most discoveries take 35–50 seconds</span>
      </div>
    </section>
  )
}

function Meta({ fact }) {
  const values = [
    ['Year', fact.key_year],
    ['Reading', fact.read_time_seconds ? `${Math.max(1, Math.round(fact.read_time_seconds / 60))} min` : null],
    ['Level', fact.difficulty_level],
    ['Curiosity', fact.fun_rating ? `${fact.fun_rating}/10` : null],
  ].filter(([, value]) => value)

  if (!values.length) return null
  return (
    <dl className="fact-meta">
      {values.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  )
}

function ProseSection({ title, text, children, className = '' }) {
  if (!text && !children) return null
  return (
    <section className={`prose-section ${className}`}>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </section>
  )
}

function FactView({ fact, categoryName, onReset }) {
  const breakdown = fact.in_depth_breakdown || {}

  return (
    <article className="fact-view">
      <nav className="fact-nav" aria-label="Fact controls">
        <span>{categoryName}</span>
        <button type="button" onClick={onReset}>Search another topic</button>
      </nav>

      <header className="fact-hero">
        <h1>{fact.topic}</h1>
        <p>{fact.headline_fact}</p>
        <Meta fact={fact} />
      </header>

      <div className="reading-line" aria-hidden="true"><span /></div>

      <div className="fact-body">
        <ProseSection title="In a minute" text={fact.summary} className="opening" />
        <ProseSection title="The deeper story" text={fact.detailed_explanation} />
        <ProseSection title="How it began" text={fact.history} />
        <ProseSection title="Why it matters" text={fact.why_it_matters} />
        <ProseSection title="How it works" text={fact.how_it_works} />
        <ProseSection title="Technical detail" text={breakdown.scientific_or_technical_detail} />
        <ProseSection title="In the real world" text={breakdown.real_world_application} />
        <ProseSection title="Impact on India" text={fact.impact_on_india} />
        <ProseSection title="Cultural significance" text={fact.cultural_significance} />

        {breakdown.key_mechanisms_or_types?.length > 0 && (
          <ProseSection title="Mechanisms and types">
            <ul>{breakdown.key_mechanisms_or_types.map((item) => <li key={item}>{item}</li>)}</ul>
          </ProseSection>
        )}
        {breakdown.fascinating_trivia?.length > 0 && (
          <ProseSection title="Unexpected details">
            <ul>{breakdown.fascinating_trivia.map((item) => <li key={item}>{item}</li>)}</ul>
          </ProseSection>
        )}
        {fact.common_misconceptions?.length > 0 && (
          <ProseSection title="Common misconceptions">
            <ul>{fact.common_misconceptions.map((item) => <li key={item}>{item}</li>)}</ul>
          </ProseSection>
        )}
        {breakdown.step_by_step_process?.length > 0 && (
          <ProseSection title="How the pieces move">
            <ol>{breakdown.step_by_step_process.map((item) => <li key={item}>{item}</li>)}</ol>
          </ProseSection>
        )}

        {fact.timeline?.length > 0 && (
          <section className="timeline-section">
            <h2>Across time</h2>
            <ol>{fact.timeline.map((item) => (
              <li key={`${item.year}-${item.event}`}><time>{item.year}</time><p>{item.event}</p></li>
            ))}</ol>
          </section>
        )}

        {fact.learning_takeaways?.length > 0 && (
          <section className="takeaway-section">
            <h2>What to remember</h2>
            <ul>{fact.learning_takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        {(fact.quote || fact.key_figure || fact.key_stat) && (
          <aside className="fact-aside">
            {fact.quote && <blockquote>“{fact.quote}”</blockquote>}
            <div>
              {fact.key_figure && <p><span>Key figure</span>{fact.key_figure}</p>}
              {fact.key_stat && <p><span>Key statistic</span>{fact.key_stat}</p>}
            </div>
          </aside>
        )}

        {fact.sources_or_references?.length > 0 && (
          <section className="source-section">
            <h2>References returned with this fact</h2>
            <ul>{fact.sources_or_references.map((source) => <li key={source}>{source}</li>)}</ul>
          </section>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const [categories, setCategories] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [categoryState, setCategoryState] = useState('loading')
  const [status, setStatus] = useState('idle')
  const [fact, setFact] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const requestRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    fetchCategories(controller.signal)
      .then((items) => {
        if (ignore) return
        setCategories(items.length ? items : FALLBACK_CATEGORIES)
        setCategoryState(items.length ? 'ready' : 'fallback')
      })
      .catch((requestError) => {
        if (ignore || requestError.name === 'AbortError') return
        setCategories(FALLBACK_CATEGORIES)
        setCategoryState('fallback')
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (status !== 'processing') return undefined
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => () => requestRef.current?.abort(), [])

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId),
    [categories, selectedId],
  )

  async function handleSearch(event) {
    event.preventDefault()
    if (!selectedId || status === 'processing') return

    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setStatus('processing')
    setError('')
    setFact(null)
    setElapsed(0)

    try {
      const job = await startFact(selectedId, controller.signal)
      if (!job?.job_id) throw new Error('The search began without a traceable job. Please try again.')

      while (!controller.signal.aborted) {
        await wait(4000, controller.signal)
        const result = await getFactStatus(job.job_id, controller.signal)

        if (result.status === 'completed') {
          if (!result.data?.fact) throw new Error('The search completed, but no readable fact returned.')
          setFact(result.data.fact)
          setStatus('completed')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        if (result.status === 'failed') {
          throw new Error(result.error || 'This search faded out before a fact could be found.')
        }
      }
    } catch (requestError) {
      if (requestError.name === 'AbortError') return
      setError(requestError.message || 'The unknown stayed quiet. Please try again.')
      setStatus('error')
    }
  }

  function reset() {
    requestRef.current?.abort()
    setStatus('idle')
    setFact(null)
    setError('')
    setElapsed(0)
  }

  if (status === 'completed' && fact) {
    return <FactView fact={fact} categoryName={selectedCategory?.name || fact.category} onReset={reset} />
  }

  return (
    <main className={`discovery-page is-${status}`}>
      <AmbientField />
      <header className="site-header">
        <a href="/" aria-label="Unknown Index home"><span />Unknown Index</a>
        <p>One fact at a time</p>
      </header>

      <div className="center-stage">
        {status === 'processing' ? (
          <SearchRitual categoryName={selectedCategory?.name || 'the unknown'} elapsed={elapsed} />
        ) : (
          <section className="discovery-intro">
            <h1>What are you curious about?</h1>
            <p>Choose a subject. We’ll search beyond the obvious and return with one fact worth keeping.</p>
            <SearchForm
              categories={categories}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onSubmit={handleSearch}
              loading={categoryState === 'loading'}
            />
            {categoryState === 'fallback' && <p className="quiet-note">The live index is unavailable, so a smaller collection is shown.</p>}
            {error && <div className="error-message" role="alert"><strong>The search went dark.</strong><span>{error}</span></div>}
          </section>
        )}
      </div>

      <footer className="site-footer">
        <span>Generated when you ask</span>
        <span>No account. No history.</span>
      </footer>
    </main>
  )
}
