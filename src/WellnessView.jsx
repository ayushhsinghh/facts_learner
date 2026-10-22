import { useEffect, useId, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { SourceLinks } from './Evidence.jsx'
import { fetchExercises, fetchExercise, exerciseVideoUrl } from './api.js'
import { asList, nutrientValue } from './wellness.js'
import './wellness.css'

function Text({ children }) {
  if (typeof children !== 'string' || !children.trim()) return null
  return <ReactMarkdown components={{ p: ({ children }) => <p data-narration-content>{children}</p>, li: ({ children }) => <li data-narration-content>{children}</li>, a: ({ href, children }) => /^https?:\/\//i.test(href || '')
    ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span> }}>{children.replace(/\\n/g, '\n')}</ReactMarkdown>
}

function Steps({ items }) {
  const steps = asList(items)
  return steps.length ? <ol className="wellness-steps">{steps.map((step, i) => <li key={i} data-narration-content>{step}</li>)}</ol> : null
}

function Tips({ items }) {
  const tips = asList(items)
  return tips.length ? <ul className="wellness-tips">{tips.map((tip, i) => <li key={i} data-narration-content>{tip}</li>)}</ul> : null
}

function ExerciseDemo({ query: initialQuery }) {
  const id = useId()
  const [query, setQuery] = useState(initialQuery || '')
  const [state, setState] = useState({ status: 'idle', results: [] })
  const [selected, setSelected] = useState(null)
  const [videoIndex, setVideoIndex] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const controllerRef = useRef(null)
  useEffect(() => () => controllerRef.current?.abort(), [])

  async function search(event) {
    event.preventDefault()
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setSelected(null)
    setState({ status: 'loading', results: [] })
    try {
      const data = await fetchExercises(query.trim(), controller.signal)
      if (!controller.signal.aborted) setState({ status: 'ready', results: data.results || [] })
    } catch (error) {
      if (!controller.signal.aborted) setState({ status: 'error', results: [], error: error.message })
    }
  }

  async function choose(item) {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState((previous) => ({ ...previous, status: 'loading-detail', error: '' }))
    setSelected(null)
    try {
      const detail = await fetchExercise(item.id, controller.signal)
      if (controller.signal.aborted) return
      setSelected(detail)
      setVideoIndex(0)
      setVideoFailed(false)
      setState((previous) => ({ ...previous, status: 'ready' }))
    } catch (error) {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, status: 'error', error: error.message }))
    }
  }

  const videos = asList(selected?.videos)
  const video = videos[videoIndex]
  return <div className="exercise-demo">
    <form onSubmit={search}>
      <label htmlFor={id}>Find a MuscleWiki demonstration</label>
      <div className="exercise-search"><input id={id} value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} maxLength={100} required placeholder="Try squat or push up" />
        <button type="submit" disabled={query.trim().length < 2 || state.status === 'loading'}>Find exercise</button></div>
    </form>
    <p className="wellness-note">Choose the movement that matches. A search result may use different equipment or technique.</p>
    {state.status.startsWith('loading') && <p role="status">{state.status === 'loading' ? 'Finding demonstrations…' : 'Opening the exercise…'}</p>}
    {state.error && <p role="alert">{state.error} Try the search again.</p>}
    {state.status === 'ready' && !state.results.length && <p role="status">No matching demonstrations. Try another name. Traditional movements may be absent from this catalog.</p>}
    {state.results.length > 0 && <div className="exercise-results" aria-label="Matching exercises">{state.results.map((item) => (
      <button key={item.id} type="button" aria-pressed={selected?.id === item.id} onClick={() => choose(item)}>
        <strong>{item.name}</strong><span>{[item.equipment, item.difficulty].filter(Boolean).join(' · ')}</span>
      </button>
    ))}</div>}
    {selected && <div className="exercise-player">
      <h4>{selected.name}</h4>
      <p>{asList(selected.primary_muscles).join(' · ')}</p>
      {videos.length > 1 && <label className="video-view-select">Demonstration view<select value={videoIndex} onChange={(event) => { setVideoIndex(Number(event.target.value)); setVideoFailed(false) }}>
        {videos.map((clip, i) => <option key={clip.index} value={i}>{[clip.gender, clip.angle].filter(Boolean).join(' · ')}</option>)}
      </select></label>}
      {video && !videoFailed && <video key={`${selected.id}-${video.index}-${retry}`} controls playsInline preload="none" src={exerciseVideoUrl(video.path)} onError={() => setVideoFailed(true)} aria-label={`${selected.name} demonstration`} />}
      {videoFailed && <div role="alert"><p>This video could not play. Provider access or usage limits may affect playback.</p><button type="button" onClick={() => { setVideoFailed(false); setRetry((value) => value + 1) }}>Retry video</button></div>}
      {!videos.length && <p>No playable video is available for this exercise.</p>}
      <Steps items={selected.steps} />
      <a href="https://musclewiki.com" target="_blank" rel="noopener noreferrer">Exercise demonstrations and instructions by MuscleWiki</a>
    </div>}
  </div>
}

function TrainingGuide({ guide, fact }) {
  const exercises = asList(guide.exercises)
  return <>
    <div className="wellness-guide">
      <Text>{guide.goal}</Text>
      <dl className="training-facts">{[
        ['Level', guide.level], ['Time', typeof guide.duration_minutes === 'number' ? `${guide.duration_minutes} minutes` : null],
        ['Equipment', asList(guide.equipment).join(', ')], ['Frequency', guide.frequency],
      ].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {asList(guide.safety_notes).length > 0 && <aside className="wellness-notice"><h3>Before you start</h3><Tips items={guide.safety_notes} /></aside>}
      {asList(guide.warm_up).length > 0 && <div className="training-prep"><h3>Warm up</h3><Steps items={guide.warm_up} /></div>}
      {exercises.map((exercise, i) => <section className="training-exercise" key={`${exercise.name}-${i}`}>
        <div className="training-exercise-title"><h3>{exercise.name}</h3><p>{[exercise.sets && `${exercise.sets} sets`, exercise.reps, typeof exercise.rest_seconds === 'number' && `${exercise.rest_seconds}s rest`].filter(Boolean).join(' · ')}</p></div>
        <Steps items={exercise.steps} /><SourceLinks sourceIds={exercise.source_ids} fact={fact} />
        <dl className="exercise-options">{exercise.easier_option && <div><dt>Make it easier</dt><dd>{exercise.easier_option}</dd></div>}{exercise.progression && <div><dt>Build from here</dt><dd>{exercise.progression}</dd></div>}</dl>
        <details className="wellness-disclosure"><summary>See the movement</summary><ExerciseDemo query={exercise.search_query || exercise.name} /></details>
      </section>)}
      {!exercises.length && <p>This guide focuses on the topic rather than a workout routine.</p>}
      {asList(guide.cool_down).length > 0 && <div className="training-prep"><h3>Cool down</h3><Steps items={guide.cool_down} /></div>}
      {guide.recovery && <div className="training-prep"><h3>Rest and recovery</h3><Text>{guide.recovery}</Text></div>}
    </div>
  </>
}

function NutritionGuide({ guide, fact }) {
  const foods = asList(guide.food_items)
  return <div className="wellness-guide nutrition-guide">
    <Text>{guide.goal}</Text>
    {foods.length > 0 && <>
      <p className="wellness-note">Approximate nutrition per listed portion. Recipes, ingredients, and cooking oil change these values. A dash means unavailable.</p>
      <div className="nutrition-table-scroll" role="region" aria-label="Food nutrition comparison" tabIndex={0}><table className="nutrition-table">
        <caption>Indian foods, one portion at a time</caption>
        <thead><tr><th scope="col">Food & portion</th><th scope="col">Energy<br />(kcal)</th><th scope="col">Protein<br />(g)</th><th scope="col">Carbs<br />(g)</th><th scope="col">Fat<br />(g)</th><th scope="col">Fibre<br />(g)</th></tr></thead>
        <tbody>{foods.map((food, i) => <tr key={i}><th scope="row"><strong>{food.name}</strong><span>{food.portion}</span><small>{food.preparation}</small><SourceLinks sourceIds={food.source_ids} fact={fact} /></th>
          {['energy_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g'].map((key) => <td key={key}>{nutrientValue(food[key])}</td>)}</tr>)}</tbody>
      </table></div>
      {foods.some((food) => asList(food.key_micronutrients).length) && <details className="wellness-disclosure"><summary>Vitamins and minerals</summary><ul>{foods.filter((food) => asList(food.key_micronutrients).length).map((food, i) => <li key={i}><strong>{food.name}:</strong> {food.key_micronutrients.join(', ')}</li>)}</ul></details>}
    </>}
    {asList(guide.meal_plan).length > 0 && <div className="meal-examples"><h3>Familiar meal ideas</h3><p className="wellness-note">Illustrative combinations, not a complete daily meal plan.</p>{guide.meal_plan.map((meal, i) => <div className="meal-example" key={i}><h4>{meal.meal}</h4><div><strong>{asList(meal.foods).join(' + ')}</strong><p>{meal.portion}</p><Text>{meal.why}</Text></div></div>)}</div>}
    {asList(guide.swaps).length > 0 && <div className="food-swaps"><h3>Small changes to try</h3>{guide.swaps.map((swap, i) => <div key={i}><p><span>{swap.instead_of}</span><span aria-hidden="true"> → </span><strong>{swap.try_this}</strong></p><Text>{swap.reason}</Text></div>)}</div>}
    {asList(guide.practical_tips).length > 0 && <div className="training-prep"><h3>Make it work at home</h3><Tips items={guide.practical_tips} /></div>}
    {asList(guide.limitations).length > 0 && <aside className="wellness-notice"><h3>Keep in mind</h3><Tips items={guide.limitations} /></aside>}
  </div>
}

export function WellnessContent({ fact }) {
  return <>
    {fact.training_guide && <TrainingGuide guide={fact.training_guide} fact={fact} />}
    {fact.nutrition_guide && <NutritionGuide guide={fact.nutrition_guide} fact={fact} />}
  </>
}
