import ReactMarkdown from 'react-markdown'
import { SourceLinks } from './Evidence.jsx'
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

function TrainingGuide({ guide, fact }) {
  const exercises = asList(guide.exercises)
  return <>
    <div className="wellness-guide training-guide">
      <Text>{guide.goal}</Text>
      <dl className="training-facts">{[
        ['Level', guide.level], ['Time', typeof guide.duration_minutes === 'number' ? `${guide.duration_minutes} minutes` : null],
        ['Equipment', asList(guide.equipment).join(', ')], ['Frequency', guide.frequency],
      ].filter(([, value]) => value).map(([label, value]) => <div key={label} data-narration-content><dt>{label}</dt><dd> {value}</dd></div>)}</dl>
      {asList(guide.safety_notes).length > 0 && <aside className="wellness-notice"><h3>Before you start</h3><Tips items={guide.safety_notes} /></aside>}
      {asList(guide.warm_up).length > 0 && <div className="training-prep"><h3>Warm up</h3><Steps items={guide.warm_up} /></div>}
      {exercises.length > 0 && <div className="training-movements"><h3>Exercise details</h3><p className="wellness-note">Open a movement for instructions, easier options, and progression.</p>
      {exercises.map((exercise, i) => <details className="training-exercise" key={`${exercise.name}-${i}`}>
        <summary><h4 className="training-exercise-title" data-narration-content><span>{exercise.name}</span> <small>{[exercise.sets && `${exercise.sets} sets`, exercise.reps, typeof exercise.rest_seconds === 'number' && `${exercise.rest_seconds}s rest`].filter(Boolean).join(' · ')}</small></h4><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 8 5 5 5-5" /></svg></summary>
        <div className="training-exercise-content">
        <Steps items={exercise.steps} /><SourceLinks sourceIds={exercise.source_ids} fact={fact} />
        <dl className="exercise-options">{exercise.easier_option && <div data-narration-content><dt>Make it easier</dt><dd> {exercise.easier_option}</dd></div>}{exercise.progression && <div data-narration-content><dt>Build from here</dt><dd> {exercise.progression}</dd></div>}</dl>
        </div>
      </details>)}</div>}
      {!exercises.length && <p>This guide focuses on the topic rather than a workout routine.</p>}
      {asList(guide.cool_down).length > 0 && <div className="training-prep"><h3>Cool down</h3><Steps items={guide.cool_down} /></div>}
      {guide.recovery && <div className="training-prep"><h3>Rest and recovery</h3><Text>{guide.recovery}</Text></div>}
    </div>
  </>
}

function NutritionGuide({ guide, fact }) {
  const foods = asList(guide.food_items)
  return <div className="wellness-guide nutrition-guide">
    <div className="nutrition-goal"><Text>{guide.goal}</Text></div>
    {asList(guide.meal_plan).length > 0 && <div className="meal-examples"><h3>Familiar meal ideas</h3><p className="wellness-note">Illustrative combinations, not a complete daily meal plan.</p>{guide.meal_plan.map((meal, i) => <div className="meal-example" key={i}><h4>{meal.meal}</h4><div><strong>{asList(meal.foods).join(' + ')}</strong><p>{meal.portion}</p><Text>{meal.why}</Text></div></div>)}</div>}
    {asList(guide.swaps).length > 0 && <div className="food-swaps"><h3>Small changes to try</h3>{guide.swaps.map((swap, i) => <div key={i}><p><span>{swap.instead_of}</span><span aria-hidden="true"> → </span><strong>{swap.try_this}</strong></p><Text>{swap.reason}</Text></div>)}</div>}
    {asList(guide.practical_tips).length > 0 && <div className="training-prep"><h3>Make it work at home</h3><Tips items={guide.practical_tips} /></div>}
    {asList(guide.limitations).length > 0 && <aside className="wellness-notice"><h3>Keep in mind</h3><Tips items={guide.limitations} /></aside>}
    {foods.length > 0 && <section className="nutrition-labels" id="nutrition-labels" aria-label="Nutrition labels">
      <h3>Nutrition labels</h3>
      <p className="wellness-note">Open a food to see its approximate nutrition per listed portion. Recipes, ingredients, and cooking oil change these values. A dash means unavailable.</p>
      <div className="nutrition-label-list">{foods.map((food, i) => <details className="nutrition-label" key={`${food.name}-${i}`}>
        <summary>
          <span className="nutrition-label-title" data-narration-content><strong>{food.name || 'Food'}</strong>{food.portion && <> <span>{food.portion}</span></>}</span>
          <svg className="nutrition-label-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 8 5 5 5-5" /></svg>
        </summary>
        <div className="nutrition-label-content">
          {food.preparation && <div className="nutrition-preparation"><h4>Preparation & assumptions</h4><Text>{food.preparation}</Text></div>}
          <dl className="nutrition-values">{[
            ['energy_kcal', 'Energy', 'kcal'], ['protein_g', 'Protein', 'g'], ['carbs_g', 'Carbohydrates', 'g'],
            ['fat_g', 'Fat', 'g'], ['fiber_g', 'Fibre', 'g'],
          ].map(([key, label, unit]) => <div key={key} data-narration-content><dt>{label}</dt><dd> {nutrientValue(food[key])}<span> {unit}</span></dd></div>)}</dl>
          {asList(food.key_micronutrients).length > 0 && <div className="nutrition-micronutrients"><h4>Vitamins & minerals</h4><Tips items={food.key_micronutrients} /></div>}
          <SourceLinks sourceIds={food.source_ids} fact={fact} />
        </div>
      </details>)}</div>
    </section>}
  </div>
}

export function WellnessContent({ fact }) {
  return <>
    {fact.training_guide && <TrainingGuide guide={fact.training_guide} fact={fact} />}
    {fact.nutrition_guide && <NutritionGuide guide={fact.nutrition_guide} fact={fact} />}
  </>
}
