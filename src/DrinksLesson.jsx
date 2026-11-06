import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { drinksPhotos,drinksScenes,hasDrinksOpening } from './drinks.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './drinks.css'
function Section({id,title,Heading,narration,children}){
 const ref=useRef(null)
 return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage}){
 const [failed,setFailed]=useState(false)
 if(failed)return null
 return <figure className="drinks-photo"><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/></button><figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
export default function DrinksLesson({fact,narration,Heading,MarkdownContent,onOpenImage}){
 const l=fact.drinks_lesson,r=l.recipe,props={Heading,narration},scenes=drinksScenes(fact)
 const text=v=><MarkdownContent narration={narration} standalone={false}>{v}</MarkdownContent>
 const bullets=items=><ul>{items.map((p,i)=><li key={i} data-narration-content>{p}</li>)}</ul>
 const photos=(section,entry=null)=>{const images=drinksPhotos(fact,section,entry);return images.length>2?<CountryCarousel images={images} label={`Photographs for ${section}`} onOpenImage={onOpenImage}/>:images.map(image=><Photo key={image.url} image={image} onOpenImage={onOpenImage}/>)}
 return <div className="physics-lesson drinks-lesson">
  {hasDrinksOpening(fact)&&<Section {...props} id="drinks-opening" title={l.opening_hook.heading}>
   {text(l.opening_hook.introduction)}{text(l.opening_hook.intriguing_detail)}
   <p className="physics-goal" data-narration-content>{l.opening_hook.bridge_question}</p>
  </Section>}
  <Section {...props} id="overview" title={l.question}><p className="physics-goal" data-narration-content>{l.learning_goal}</p>
   <dl className="drinks-essentials">{[['Origin and region',l.identity.country_names.join(', ')+' · '+l.identity.region],['Drink',l.identity.drink_type.replaceAll('_',' ')],['Alcohol',l.identity.alcohol_status.replaceAll('_',' ')]].map(([key,v])=><div key={key}><dt data-narration-content>{key}</dt><dd data-narration-content>{v}</dd></div>)}</dl>
   {l.identity.local_names.length>0&&<p className="physics-note" data-narration-content>{l.identity.local_names.join(' · ')}</p>}{text(l.introduction.explanation)}
   <h3 data-narration-content>What makes it different</h3>{text(l.introduction.what_makes_it_unique)}<h3 data-narration-content>Its place in everyday life</h3>{text(l.introduction.cultural_role)}<p className="physics-note" data-narration-content>{l.identity.strength_context}</p>
   <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{!fact.images?.overview&&photos('overview')}
  </Section>
  <Section {...props} id="drinks-origin" title="A place, a name, a story">{text(l.origin.account)}<p className="physics-note" data-narration-content>{l.origin.evidence_and_uncertainty}</p>{photos('origin')}
   <ol className="drinks-history">{l.history.map(h=><li key={h.id}><p className="drinks-period" data-narration-content>{h.period}</p><div><h3 data-narration-content>{h.event}</h3>{text(h.why_it_changed)}</div></li>)}</ol>{photos('history')}
  </Section>
  <Section {...props} id="drinks-method" title="From tradition to today">
   {l.production_evolution ? <div className="drinks-evolution">{[['historical','Historical making','historical_making'],['modern','Modern making','modern_making']].map(([era,title,section])=>{const p=l.production_evolution[era];return <div key={era} className="drinks-era"><h3 data-narration-content>{title}</h3>{text(p.context)}{photos(section)}<h4 data-narration-content>Tools</h4>{bullets(p.equipment)}<ol className="drinks-process">{p.steps.map((step,index)=><li key={index}>{text(step)}</li>)}</ol><h4 data-narration-content>The result in the glass</h4>{text(p.result)}</div>})}</div> : <div className="drinks-comparison">{[['Earlier methods',l.then_and_now.earlier_method],['Modern methods',l.then_and_now.modern_method]].map(([title,v])=><div key={title}><h3 data-narration-content>{title}</h3>{text(v)}</div>)}</div>}
   <div className="drinks-comparison"><div><h3 data-narration-content>What changed</h3>{text(l.then_and_now.what_changed)}</div><div><h3 data-narration-content>What remains</h3>{text(l.then_and_now.what_remains)}</div></div><h3 data-narration-content>Details that shape the drink</h3>
   <ol className="drinks-process">{l.production_steps.map(p=><li key={p.id}><h3 data-narration-content>{p.title}</h3>{text(p.explanation)}<p className="physics-note" data-narration-content>{p.what_to_notice}</p>{photos('method',p.id)}</li>)}</ol>{photos('method')}
  </Section>
  <Section {...props} id="drinks-flavour" title="Understand the glass"><dl className="drinks-sensory">{['flavour','aroma','texture','finish','serving_temperature'].map(key=>[key,l.sensory_profile[key]]).map(([key,v])=><div key={key}><dt data-narration-content>{key.replaceAll('_',' ')}</dt><dd>{text(v)}</dd></div>)}</dl>
   {l.ingredients.map(p=><div className="drinks-detail" key={p.id}><h3 data-narration-content>{p.name}</h3>{text(p.role)}{text(p.effect)}{photos('ingredients',p.id)}</div>)}{photos('ingredients')}
  </Section>
  {l.science.length>0&&<Section {...props} id="drinks-science" title="The science in the mix">{l.science.map(p=><div className="drinks-detail" key={p.id}><h3 data-narration-content>{p.title}</h3><p className="physics-goal" data-narration-content>{p.mechanism}</p>{text(p.explanation)}<p className="drinks-cue" data-narration-content><strong>Notice this:</strong> {p.observable_cue}</p>{text(p.limits)}{l.science_focus_id===p.id&&<ArticleImages fact={fact} slot="how_it_works" onOpenImage={onOpenImage}/>} {photos('science',p.id)}</div>)}{photos('science')}</Section>}
  <Section {...props} id="drinks-recipe" title="Make a version in India"><h3 data-narration-content>{r.title}</h3>{text(r.adaptation_notes)}<p className="physics-note" data-narration-content>{{home_mixed:'Home preparation',serving_adaptation:'Serving adaptation',alcohol_free_interpretation:'Alcohol-free interpretation'}[r.preparation_type]} · {r.alcohol_status==='non_alcoholic'?'Alcohol-free':'Contains alcohol'}</p>
   <dl className="drinks-essentials">{[['Servings',r.servings],['Preparation',`${r.prep_minutes} min`],...(r.cook_minutes?[['Cooking',`${r.cook_minutes} min`]]:[]),...(r.rest_minutes?[['Resting',`${r.rest_minutes} min`]]:[])].map(([key,v])=><div key={key}><dt data-narration-content>{key}</dt><dd data-narration-content>{v}</dd></div>)}</dl>
   {r.allergens.length>0&&<><h3 data-narration-content>Ingredients to check</h3>{bullets(r.allergens)}</>}{r.safety_notes.length>0&&bullets(r.safety_notes)}
   <div className="drinks-recipe-grid"><div><h3 data-narration-content>What you need</h3><ul className="drinks-ingredients">{r.ingredients.map(p=><li key={p.id}><strong data-narration-content>{p.amount} {p.unit}</strong><div data-narration-content>{p.name}<small>{p.household_measure!==`${p.amount} ${p.unit}`&&`${p.household_measure} · `}{p.preparation}</small><small>{p.role}{p.contains_alcohol?' · Contains alcohol':''}</small></div></li>)}</ul><h4 data-narration-content>Equipment</h4>{bullets(r.equipment)}</div><div><h3 data-narration-content>The method</h3><ol className="drinks-process">{r.steps.map((p,i)=><li key={i}><h4 data-narration-content>{p.title}</h4>{text(p.instruction)}<p className="physics-note" data-narration-content>{p.time_guidance}</p><p data-narration-content>{p.doneness_cue}</p></li>)}</ol></div></div>
   {r.substitutions.length>0&&<div className="drinks-detail"><h3 data-narration-content>Indian pantry alternatives</h3>{r.substitutions.map((p,i)=><div key={i}><h4 data-narration-content>{r.ingredients.find(x=>x.id===p.ingredient_id).name} → {p.substitute}</h4><p data-narration-content>{p.quantity}</p>{text(p.effect)}</div>)}</div>}
   <details className="physics-details"><summary>How this differs from the traditional preparation</summary>{text(r.traditional_preparation)}</details>
   {photos('recipe')}
  </Section>
  <Section {...props} id="drinks-variations" title="How the drink travels">{l.variations.map(p=><div className="drinks-detail" key={p.id}><h3 data-narration-content>{p.name}</h3><p className="physics-note" data-narration-content>{p.place}</p>{text(p.difference)}{photos('variations',p.id)}<h4 data-narration-content>Why this version developed</h4>{text(p.how_it_developed)}<p className="physics-note" data-narration-content>{p.evidence_and_uncertainty}</p></div>)}{photos('variations')}
  </Section>
  <Section {...props} id="drinks-serving" title="Serve it with context"><h3 data-narration-content>Glassware and temperature</h3>{text(l.serving_context.glassware)}{text(l.serving_context.pairing_and_customs)}{l.serving_context.alcohol_free_option&&<><h3 data-narration-content>An alcohol-free direction</h3>{text(l.serving_context.alcohol_free_option)}</>}{text(l.serving_context.practical_notes)}{photos('serving')}
   <details className="physics-details"><summary>Adjust the result</summary>{l.troubleshooting.map((p,i)=><div className="drinks-detail" key={i}><h3 data-narration-content>{p.problem}</h3>{text(p.cause)}{text(p.fix)}</div>)}</details>
  </Section>
  {scenes.length>0&&<Section {...props} id="drinks-photographs" title="A closer look at the drink"><CountryCarousel images={scenes} label="Photographs of the drink and its setting" onOpenImage={onOpenImage}/></Section>}
  <Section {...props} id="drinks-check" title="Keep the idea">{l.knowledge_checks.map((p,i)=><div className="drinks-detail" key={i}><h3 data-narration-content>{p.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(p.answer)}{text(p.explanation)}</details></div>)}{bullets(l.takeaways)}<div className="physics-next"><h3 data-narration-content>Another glass, another story</h3><ul>{l.related_drinks.map(p=><li key={p}><Link to={archiveUrl('drinks',p)}>{p}</Link></li>)}</ul></div></Section>
 </div>
}
