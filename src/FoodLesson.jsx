import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { foodPhotos,foodScenes } from './food.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './food.css'

function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  if(failed)return null
  return <figure className="food-photograph"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function FoodLesson({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const l=fact.food_lesson,r=l.recipe,n=l.nutrition_context,props={Heading,narration}
  const text=value=><MarkdownContent narration={narration} standalone={false}>{value}</MarkdownContent>
  const photos=section=>foodPhotos(fact,section).map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/> )
  const bullets=items=><ul>{items.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>
  const scenes=foodScenes(fact)
  return <div className="physics-lesson food-lesson">
    <Section {...props} id="overview" title={l.question}>
      <p className="physics-goal" data-narration-content>{l.learning_goal}</p>
      <dl className="food-identity"><div><dt>From</dt><dd data-narration-content>{l.identity.region}{l.identity.country_names.length>0&&` · ${l.identity.country_names.join(', ')}`}</dd></div><div><dt>Local name</dt><dd data-narration-content>{l.identity.local_name}</dd></div><div><dt>Food</dt><dd data-narration-content>{l.identity.food_type}</dd></div></dl>
      {text(l.introduction.explanation)}<h3>How people enjoy it</h3>{text(l.introduction.how_it_is_served)}
      <h3>Why it is worth knowing</h3>{text(l.introduction.why_it_is_interesting)}
      <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
    </Section>
    <Section {...props} id="food-context" title="The story behind the food">
      {text(l.origin_and_context.explanation)}{text(l.origin_and_context.regional_variation)}{text(l.origin_and_context.uncertainty)}{photos('context')}
    </Section>
    <Section {...props} id="food-taste" title="What does it taste like?">
      <dl className="food-sensory">{Object.entries({Flavour:l.sensory_profile.flavour,Aroma:l.sensory_profile.aroma,Texture:l.sensory_profile.texture,Heat:l.sensory_profile.heat,'Serving temperature':l.sensory_profile.serving_temperature}).map(([key,value])=><div key={key}><dt>{key}</dt><dd data-narration-content>{value}</dd></div>)}</dl>{photos('taste')}
    </Section>
    <Section {...props} id="food-science" title="What makes it work?">
      <div className="food-explanations">{l.key_ingredients.map((item,i)=><div key={i}><h3>{item.name}</h3>{text(item.role)}{text(item.effect_on_taste)}</div>)}</div>
      {l.food_science.map((item,i)=><div className="food-mechanism" key={i}><h3>{item.title}</h3>{text(item.explanation)}<p className="food-kitchen-cue" data-narration-content><strong>In the kitchen:</strong> {item.kitchen_cue}</p></div>)}{photos('science')}
    </Section>
    <Section {...props} id="food-recipe" title="Make it in your kitchen">
      <h3>{r.title}</h3>{text(r.adaptation_notes)}
      <dl className="food-recipe-meta">{[['Serves',r.servings],['Prep',`${r.prep_minutes} min`],['Cook',`${r.cook_minutes} min`],['Rest',`${r.rest_minutes} min`]].map(([key,value])=><div key={key}><dt>{key}</dt><dd data-narration-content>{value}</dd></div>)}</dl>
      <div className="food-allergens"><h3>Allergens</h3><p data-narration-content>{r.allergens.length?r.allergens.join('; '):'No allergens identified in this recipe. Check ingredient labels and substitutions.'}</p></div>
      {r.safety_notes.length>0&&<div className="food-safety"><h3>Before you cook</h3>{bullets(r.safety_notes)}</div>}
      <h3>Equipment</h3>{bullets(r.equipment)}
      <h3>The traditional preparation</h3>{text(r.traditional_preparation)}
      <div className="food-recipe-layout"><div><h3>Ingredients</h3><ul className="food-ingredients">{r.ingredients.map(item=><li key={item.id} data-narration-content><strong>{item.amount} {item.unit}</strong><span>{item.name}<small>{item.household_measure} · {item.preparation}</small><small>{item.role}</small></span></li>)}</ul>
        {r.substitutions.length>0&&<div className="food-substitutions"><h3>Indian-kitchen substitutes</h3>{r.substitutions.map((item,i)=><div key={i}><h4>{r.ingredients.find(x=>x.id===item.ingredient_id)?.name} → {item.substitute}</h4><p data-narration-content>{item.quantity}</p>{text(item.effect)}</div>)}</div>}
      </div><div><h3>Method</h3><ol className="food-method">{r.steps.map((step,i)=><li key={i}><h4>{step.title}</h4>{text(step.instruction)}<p className="physics-note" data-narration-content>{step.time_guidance}</p><p className="food-kitchen-cue" data-narration-content><strong>Look for:</strong> {step.doneness_cue}</p></li>)}</ol></div></div>
      {photos('recipe')}
    </Section>
    <Section {...props} id="food-meal" title="How it fits into a meal">
      {text(n.explanation)}{text(n.tradeoffs)}{text(n.portion_context)}
      <details className="physics-details food-nutrition"><summary>Nutrition details</summary>
        <p data-narration-content>{n.serving_basis}</p>
        {n.estimate_status==='estimated'?<><p className="physics-note" data-narration-content>Estimated values. Ingredients, brands and preparation change the result.</p><dl className="food-nutrients">{n.nutrients.map((item,i)=><div key={i}><dt>{item.name}</dt><dd data-narration-content>{item.amount} {item.unit}</dd></div>)}</dl></>:<p data-narration-content>Reliable nutrition estimates are not available for this preparation.</p>}
        {n.assumptions.length>0&&<><h3>Basis and assumptions</h3>{bullets(n.assumptions)}</>}
      </details>
      {l.serving_ideas.map((item,i)=><div className="food-mechanism" key={i}><h3>{item.title}</h3>{text(item.explanation)}</div>)}{photos('serving')}
    </Section>
    <Section {...props} id="food-variations" title="Variations and useful fixes">
      {l.variations.map((item,i)=><div className="food-mechanism" key={i}><h3>{item.name}</h3><p className="physics-note" data-narration-content>{item.region}</p>{text(item.difference)}</div>)}
      <h3>When it does not turn out as expected</h3><dl className="food-troubleshooting">{l.troubleshooting.map((item,i)=><div key={i}><dt>{item.problem}</dt><dd>{text(item.cause)}{text(item.fix)}</dd></div>)}</dl>
    </Section>
    {scenes.length>0&&<Section {...props} id="food-photographs" title="A closer look at the food">{scenes.length===1?<Photo image={scenes[0]} onOpenImage={onOpenImage}/>:<CountryCarousel images={scenes} label="Photographs of this food and its preparation" onOpenImage={onOpenImage}/>}</Section>}
    <Section {...props} id="remember" title="Take this to the table">
      {bullets(l.takeaways)}{l.related_foods.length>0&&<div className="physics-next"><h3>Explore another food</h3><ul>{l.related_foods.map(name=><li key={name}><Link to={archiveUrl('food',name)}>{name}</Link></li>)}</ul></div>}
    </Section>
  </div>
}
