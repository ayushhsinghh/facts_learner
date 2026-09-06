import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { fetchCategories, fetchHistory, getFactStatus, startFact } from './api.js'

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

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7M4 4v4.7h4.7M12 7.5V12l3 2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

const MARKDOWN_ELEMENTS = [
  'p', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]

function normalizeMarkdown(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\\t/g, '\t')
    .trim()
}

function MarkdownHeading({ children }) {
  return <h4 className="markdown-heading">{children}</h4>
}

function MarkdownLink({ href = '', children, ...props }) {
  const external = /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  )
}

const MARKDOWN_COMPONENTS = {
  h1: MarkdownHeading,
  h2: MarkdownHeading,
  h3: MarkdownHeading,
  h4: MarkdownHeading,
  h5: MarkdownHeading,
  h6: MarkdownHeading,
  a: MarkdownLink,
}

function MarkdownContent({ children }) {
  return (
    <ReactMarkdown
      allowedElements={MARKDOWN_ELEMENTS}
      unwrapDisallowed
      components={MARKDOWN_COMPONENTS}
    >
      {normalizeMarkdown(children)}
    </ReactMarkdown>
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

const historyDate = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatCategory(value) {
  if (!value) return 'Fact'
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function HistoryDialog({
  dialogRef,
  facts,
  state,
  error,
  hasMore,
  onClose,
  onSelect,
  onRetry,
  onLoadMore,
}) {
  return (
    <dialog
      className="history-dialog"
      ref={dialogRef}
      aria-labelledby="history-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="history-panel">
        <header className="history-header">
          <div>
            <h2 id="history-title">Previously discovered</h2>
            <p>Facts already waiting in the index.</p>
          </div>
          <button type="button" className="history-close" onClick={onClose} aria-label="Close previous facts">
            <CloseIcon />
          </button>
        </header>

        <div className="history-content">
          {state === 'loading' && (
            <div className="history-loading" role="status">
              <span aria-hidden="true" />
              <p>Opening the previous pages…</p>
            </div>
          )}

          {state === 'error' && (
            <div className="history-message" role="alert">
              <p>{error || 'The previous facts could not be opened.'}</p>
              <button type="button" onClick={onRetry}>Try again</button>
            </div>
          )}

          {state === 'ready' && facts.length === 0 && (
            <div className="history-message">
              <p>No facts have been discovered yet.</p>
              <button type="button" onClick={onClose}>Start the first search</button>
            </div>
          )}

          {facts.length > 0 && (
            <ol className="history-list">
              {facts.map((item, index) => {
                const generatedAt = item.generated_at ? new Date(item.generated_at) : null
                const readableDate = generatedAt && !Number.isNaN(generatedAt.valueOf())
                  ? historyDate.format(generatedAt)
                  : 'Earlier discovery'
                return (
                  <li key={`${item.generated_at || index}-${item.topic || 'fact'}`}>
                    <button type="button" onClick={() => onSelect(item)}>
                      <span className="history-item-meta">
                        <span>{formatCategory(item.category)}</span>
                        <time dateTime={item.generated_at || undefined}>{readableDate}</time>
                      </span>
                      <strong>{item.topic || 'Untitled discovery'}</strong>
                      {item.headline_fact && <p>{item.headline_fact}</p>}
                      <span className="history-item-arrow"><ArrowIcon /></span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {facts.length > 0 && (
          <footer className="history-footer">
            <span>{facts.length} {facts.length === 1 ? 'fact' : 'facts'} shown</span>
            {hasMore && (
              <button type="button" onClick={onLoadMore} disabled={state === 'loading-more'}>
                {state === 'loading-more' ? 'Opening more…' : 'Load more'}
              </button>
            )}
            {error && state === 'ready' && <span role="alert">{error}</span>}
          </footer>
        )}
      </div>
    </dialog>
  )
}

function Meta({ fact }) {
  const generatedAt = fact.generated_at ? new Date(fact.generated_at) : null
  const readableDate = generatedAt && !Number.isNaN(generatedAt.valueOf())
    ? historyDate.format(generatedAt)
    : null
  const values = [
    ['Year', fact.key_year],
    ['Reading', fact.read_time_seconds ? `${Math.max(1, Math.round(fact.read_time_seconds / 60))} min` : null],
    ['Level', fact.difficulty_level],
    ['Curiosity', fact.fun_rating ? `${fact.fun_rating}/10` : null],
    ['Region', fact.region],
    ['Discovered', readableDate],
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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}

function ReadingBlock({ title, text, children }) {
  if (!text && !children) return null
  return (
    <div className="reading-block">
      {title && <h3>{title}</h3>}
      {text && <MarkdownContent>{text}</MarkdownContent>}
      {children}
    </div>
  )
}

function Disclosure({ title, description, children, open = false }) {
  return (
    <details className="disclosure" open={open}>
      <summary>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className="disclosure-mark"><ChevronIcon /></span>
      </summary>
      <div className="disclosure-content">{children}</div>
    </details>
  )
}

function FactView({ fact, categoryName, onReset }) {
  const articleRef = useRef(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const [copyStatus, setCopyStatus] = useState('idle')
  const breakdown = fact.in_depth_breakdown || {}
  const storyText = fact.detailed_explanation
  const mechanicsText = fact.core_mechanics || fact.how_it_works
  const technicalText = breakdown.scientific_or_technical_detail
  const hasContext = Boolean(storyText || fact.history || fact.why_it_matters)
  const hasMechanics = Boolean(
    mechanicsText || technicalText || breakdown.key_mechanisms_or_types?.length
    || breakdown.step_by_step_process?.length,
  )
  const hasWorld = Boolean(
    breakdown.real_world_application || fact.impact_on_india
    || fact.cultural_significance || fact.global_comparison,
  )
  const hasSurprises = Boolean(
    breakdown.fascinating_trivia?.length || fact.common_misconceptions?.length
    || fact.visual_suggestion,
  )
  const hasExplore = hasContext || hasMechanics || hasWorld || hasSurprises
  const hasTaxonomy = fact.tags?.length > 0 || fact.related_categories?.length > 0

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(normalizeMarkdown(fact.share_text))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    window.setTimeout(() => setCopyStatus('idle'), 2200)
  }

  useEffect(() => {
    let frame
    const updateProgress = () => {
      const article = articleRef.current
      if (!article) return
      const start = article.offsetTop
      const distance = Math.max(1, article.scrollHeight - window.innerHeight)
      const next = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
      setReadingProgress(next)
    }
    const onScroll = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateProgress)
    }
    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <article className="fact-view" ref={articleRef}>
      <nav className="fact-nav" aria-label="Fact controls">
        <a href="#fact-top" className="fact-wordmark"><span aria-hidden="true" />Unknown Index</a>
        <span className="fact-category">
          {fact.emoji_icon && <span className="fact-emoji" aria-hidden="true">{fact.emoji_icon}</span>}
          {categoryName}
        </span>
        <button type="button" onClick={onReset}>Search another topic</button>
        <span className="reading-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${readingProgress})` }} />
        </span>
      </nav>

      <header className="fact-hero" id="fact-top">
        <h1>{fact.topic}</h1>
        <p>{fact.headline_fact}</p>
        <Meta fact={fact} />
      </header>

      <nav className="reading-nav" aria-label="On this page">
        <span>Read</span>
        <a href="#overview">Overview</a>
        {hasExplore && <a href="#explore">Explore deeper</a>}
        {fact.timeline?.length > 0 && <a href="#timeline">Timeline</a>}
        {fact.learning_takeaways?.length > 0 && <a href="#remember">Remember</a>}
      </nav>

      <div className="fact-body">
        <section className="fact-overview" id="overview">
          <h2>The short version</h2>
          <MarkdownContent>{fact.summary || fact.headline_fact}</MarkdownContent>
        </section>

        {fact.did_you_know && (
          <aside className="did-you-know">
            <h2>Did you know?</h2>
            <div><MarkdownContent>{fact.did_you_know}</MarkdownContent></div>
          </aside>
        )}

        {(fact.quote || fact.key_figure || fact.key_stat) && (
          <aside className="fact-signal">
            {fact.quote && <blockquote>“{fact.quote}”</blockquote>}
            {(fact.key_figure || fact.key_stat) && (
              <dl>
                {fact.key_figure && <div><dt>Key figure</dt><dd>{fact.key_figure}</dd></div>}
                {fact.key_stat && <div><dt>Key statistic</dt><dd>{fact.key_stat}</dd></div>}
              </dl>
            )}
          </aside>
        )}

        {hasExplore && (
          <section className="explore-section" id="explore">
            <div className="section-intro">
              <h2>Explore deeper</h2>
              <p>Open only the parts you want to follow.</p>
            </div>
            <div className="disclosure-list">
              {hasContext && (
                <Disclosure title="The story and its significance" description="Background, origins, and why this matters">
                  <ReadingBlock title="The full story" text={storyText} />
                  <ReadingBlock title="How it began" text={fact.history} />
                  <ReadingBlock title="Why it matters" text={fact.why_it_matters} />
                </Disclosure>
              )}
              {hasMechanics && (
                <Disclosure title="How it works" description="Mechanisms, variants, and step-by-step detail">
                  <ReadingBlock text={mechanicsText} />
                  <ReadingBlock title="Technical detail" text={technicalText} />
                  {breakdown.key_mechanisms_or_types?.length > 0 && (
                    <ReadingBlock title="Mechanisms and types">
                      <ul>{breakdown.key_mechanisms_or_types.map((item) => <li key={item}>{item}</li>)}</ul>
                    </ReadingBlock>
                  )}
                  {breakdown.step_by_step_process?.length > 0 && (
                    <ReadingBlock title="The process">
                      <ol className="process-list">{breakdown.step_by_step_process.map((item) => <li key={item}>{item}</li>)}</ol>
                    </ReadingBlock>
                  )}
                </Disclosure>
              )}
              {hasWorld && (
                <Disclosure title="In the world" description="Applications, regions, and cultural context">
                  <ReadingBlock title="Real-world application" text={breakdown.real_world_application} />
                  <ReadingBlock title="Impact on India" text={fact.impact_on_india} />
                  <ReadingBlock title="Cultural significance" text={fact.cultural_significance} />
                  <ReadingBlock title="Global comparison" text={fact.global_comparison} />
                </Disclosure>
              )}
              {hasSurprises && (
                <Disclosure title="Surprises and misconceptions" description="The details that are easy to miss">
                  {breakdown.fascinating_trivia?.length > 0 && (
                    <ReadingBlock title="Unexpected details">
                      <ul>{breakdown.fascinating_trivia.map((item) => <li key={item}>{item}</li>)}</ul>
                    </ReadingBlock>
                  )}
                  {fact.common_misconceptions?.length > 0 && (
                    <ReadingBlock title="Common misconceptions">
                      <ul>{fact.common_misconceptions.map((item) => <li key={item}>{item}</li>)}</ul>
                    </ReadingBlock>
                  )}
                  <ReadingBlock title="Picture the idea" text={fact.visual_suggestion} />
                </Disclosure>
              )}
            </div>
          </section>
        )}

        {fact.timeline?.length > 0 && (
          <section className="timeline-section" id="timeline">
            <div className="section-intro">
              <h2>Across time</h2>
              <p>The moments that shaped this story.</p>
            </div>
            <ol className="timeline-track">{fact.timeline.map((item) => (
              <li key={`${item.year}-${item.event}`}>
                <span className="timeline-node" aria-hidden="true" />
                <time>{item.year}</time>
                <p>{item.event}</p>
              </li>
            ))}</ol>
          </section>
        )}

        {fact.learning_takeaways?.length > 0 && (
          <section className="takeaway-section" id="remember">
            <div className="section-intro">
              <h2>Keep these with you</h2>
              <p>The essential ideas, distilled.</p>
            </div>
            <ul>{fact.learning_takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        {hasTaxonomy && (
          <section className="fact-taxonomy" aria-label="Fact classification">
            {fact.tags?.length > 0 && (
              <div>
                <h2>Filed under</h2>
                <ul>{fact.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </div>
            )}
            {fact.related_categories?.length > 0 && (
              <div>
                <h2>Related subjects</h2>
                <ul>{fact.related_categories.map((category) => <li key={category}>{formatCategory(category)}</li>)}</ul>
              </div>
            )}
          </section>
        )}

        {fact.share_text && (
          <section className="share-section">
            <div>
              <h2>Pass it on</h2>
              <p>{normalizeMarkdown(fact.share_text)}</p>
            </div>
            <button type="button" onClick={copyShareText}>
              <CopyIcon />
              <span>{copyStatus === 'copied' ? 'Copied' : copyStatus === 'error' ? 'Copy failed' : 'Copy fact'}</span>
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copyStatus === 'copied' ? 'Fact copied to clipboard.' : copyStatus === 'error' ? 'Could not copy the fact.' : ''}
            </span>
          </section>
        )}

        {fact.sources_or_references?.length > 0 && (
          <details className="source-section">
            <summary>Sources and references <span>{fact.sources_or_references.length}</span></summary>
            <ul>{fact.sources_or_references.map((source) => <li key={source}>{source}</li>)}</ul>
          </details>
        )}

        <footer className="fact-end">
          <span aria-hidden="true" />
          <p>Curiosity is better when it continues.</p>
          <button type="button" onClick={onReset}>Discover another fact <ArrowIcon /></button>
        </footer>
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
  const [historyFacts, setHistoryFacts] = useState([])
  const [historyState, setHistoryState] = useState('idle')
  const [historyError, setHistoryError] = useState('')
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const requestRef = useRef(null)
  const historyRequestRef = useRef(null)
  const historyDialogRef = useRef(null)

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

  useEffect(() => () => {
    requestRef.current?.abort()
    historyRequestRef.current?.abort()
  }, [])

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

  async function loadHistory(append = false) {
    historyRequestRef.current?.abort()
    const controller = new AbortController()
    historyRequestRef.current = controller
    setHistoryState(append ? 'loading-more' : 'loading')
    setHistoryError('')

    try {
      const result = await fetchHistory({
        limit: 20,
        skip: append ? historyFacts.length : 0,
        signal: controller.signal,
      })
      setHistoryFacts((current) => append ? [...current, ...result.facts] : result.facts)
      setHistoryHasMore(result.facts.length === 20)
      setHistoryState('ready')
    } catch (requestError) {
      if (requestError.name === 'AbortError') return
      setHistoryError(requestError.message || 'The previous facts could not be opened.')
      setHistoryState(append && historyFacts.length ? 'ready' : 'error')
    }
  }

  function openHistory() {
    if (!historyDialogRef.current?.open) historyDialogRef.current?.showModal()
    if (historyState === 'idle') loadHistory()
  }

  function closeHistory() {
    historyDialogRef.current?.close()
  }

  function selectHistoryFact(item) {
    setSelectedId(item.category || '')
    setFact(item)
    setError('')
    setStatus('completed')
    closeHistory()
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <button type="button" className="history-trigger" onClick={openHistory}>
              <HistoryIcon />
              <span>Browse previous discoveries</span>
              <ArrowIcon />
            </button>
            {categoryState === 'fallback' && <p className="quiet-note">The live index is unavailable, so a smaller collection is shown.</p>}
            {error && <div className="error-message" role="alert"><strong>The search went dark.</strong><span>{error}</span></div>}
          </section>
        )}
      </div>

      <footer className="site-footer">
        <span>Generated when you ask</span>
        <span>No account required.</span>
      </footer>

      <HistoryDialog
        dialogRef={historyDialogRef}
        facts={historyFacts}
        state={historyState}
        error={historyError}
        hasMore={historyHasMore}
        onClose={closeHistory}
        onSelect={selectHistoryFact}
        onRetry={() => loadHistory(false)}
        onLoadMore={() => loadHistory(true)}
      />
    </main>
  )
}
