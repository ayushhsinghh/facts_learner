import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleImages from './ArticleImages.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { drinksPhotos,drinksScenes,drinksHistoryNotes,drinksView } from './drinks.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './drinks.css'
function Section({id,title,Heading,narration,children}){
 const ref=useRef(null)
 return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Photo({image,onOpenImage,compact=false,onFail}){
 const [failed,setFailed]=useState(false)
 if(failed)return null
 return <figure className={`drinks-photo${compact?' drinks-photo-compact':''}`}><button type="button" aria-label={`Enlarge photograph: ${image.caption}`} onClick={()=>onOpenImage(image)}><img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>{setFailed(true);onFail?.(image.url)}}/></button><figcaption>{!compact&&image.caption}<PhotoCredit credit={image.credit}/></figcaption></figure>
}
const relationships={documented_change:'A documented change',continuing_tradition:'A continuing tradition',contemporary_alternative:'A contemporary alternative'}
export default function DrinksLesson({fact,narration,Heading,MarkdownContent,onOpenImage}){
 const l=fact.drinks_lesson,r=l.recipe,props={Heading,narration},scenes=drinksScenes(fact),historyNotes=drinksHistoryNotes(fact),view=drinksView(fact)
 const third=l.content_version===3
 const [failedPhotos,setFailedPhotos]=useState(()=>new Set())
 const imagesFor=(section,entry=null)=>drinksPhotos(fact,section,entry).filter(image=>!failedPhotos.has(image.url))
 const failPhoto=url=>setFailedPhotos(previous=>new Set([...previous,url]))
 const text=v=>v?<MarkdownContent narration={narration} standalone={false}>{v}</MarkdownContent>:null
 const bullets=items=><ul>{items.map((p,i)=><li key={i} data-narration-content>{p}</li>)}</ul>
 const photos=(section,entry=null,compact=false)=>{const images=imagesFor(section,entry);return compact?<div className="drinks-thumbnails">{images.map(image=><Photo onFail={failPhoto} compact key={image.url} image={image} onOpenImage={onOpenImage}/>)}</div>:images.length>2?<CountryCarousel images={images} label={`Photographs for ${section}`} onOpenImage={onOpenImage}/>:<div className={images.length===2?'drinks-photo-pair':undefined}>{images.map(image=><Photo onFail={failPhoto} key={image.url} image={image} onOpenImage={onOpenImage}/>)}</div>}
 const exploreGroup=(entries,title)=>entries.length>0&&<div className="drinks-explore-group"><h3 data-narration-content>{title}</h3>{entries.map(p=>{
  const section=third?'explore':'variations',hasImage=imagesFor(section,p.id).length>0
  return <div className={`drinks-explore-entry${hasImage?' has-photo':''}`} key={p.id}><div><h4 data-narration-content>{p.name}</h4><p className="physics-note" data-narration-content>{p.place}{p.relationship==='documented_influence'?' · Documented influence':''}</p>{text(p.description)}
   {p.ingredients.length>0&&<p data-narration-content><strong>Made with:</strong> {p.ingredients.join(', ')}</p>}
   {p.preparation&&<><h5 data-narration-content>How it is made</h5>{text(p.preparation)}</>}
   {p.taste_difference&&<><h5 data-narration-content>How it compares</h5>{text(p.taste_difference)}</>}
   {text(p.connection)}{p.development&&<><h5 data-narration-content>Its story</h5>{text(p.development)}</>}
   <Link className="drinks-explore-link" to={archiveUrl('drinks',p.name)}>Find {p.name} in the archive</Link>
  </div>{hasImage&&<div>{photos(section,p.id)}</div>}</div>
 })}</div>
 return <div className="physics-lesson drinks-lesson">
  <Section {...props} id="drinks-opening" title={view.opening.heading}>{text(view.opening.introduction)}<p className="physics-goal" data-narration-content>{view.opening.question}</p></Section>
  <Section {...props} id="overview" title="Meet the drink">
   <dl className="drinks-essentials">{[['Origin and region',l.identity.country_names.join(', ')+' · '+l.identity.region],['Drink',l.identity.drink_type.replaceAll('_',' ')],['Alcohol',l.identity.alcohol_status.replaceAll('_',' ')]].map(([key,v])=><div key={key}><dt data-narration-content>{key}</dt><dd data-narration-content>{v}</dd></div>)}</dl>
   {l.identity.local_names.length>0&&<p className="physics-note" data-narration-content>{l.identity.local_names.join(' · ')}</p>}
   {view.distinction&&<details className="physics-details"><summary>What makes it distinctive</summary>{text(view.distinction)}</details>}
   <ArticleImages fact={fact} placement="overview" onOpenImage={onOpenImage}/>{photos('overview')}
   <h3 id="drinks-flavour" data-narration-content>Its character</h3><dl className="drinks-sensory">{['flavour','aroma','texture','finish','serving_temperature'].map(key=><div key={key}><dt data-narration-content>{key.replaceAll('_',' ')}</dt><dd>{text(l.sensory_profile[key])}</dd></div>)}</dl>
   <h3 data-narration-content>What each ingredient brings</h3>{l.ingredients.map(p=>{const hasImage=imagesFor('ingredients',p.id).length>0;return <div className={`drinks-ingredient${hasImage?' has-photo':''}`} key={p.id}>{hasImage&&photos('ingredients',p.id,true)}<div><h4 data-narration-content>{p.name}</h4>{text(p.role)}{text(p.effect)}</div></div>})}{photos('ingredients')}
   {l.identity.strength_context&&<details className="physics-details"><summary>Alcohol strength</summary>{text(l.identity.strength_context)}</details>}
  </Section>
  <Section {...props} id="drinks-origin" title="The story behind the drink">{text(l.origin.account)}{text(view.culture)}{photos('origin')}
   {l.history.length>0&&<ol className="drinks-history">{l.history.map(h=><li key={h.id}><p className="drinks-period" data-narration-content>{h.period}</p><div><h3 data-narration-content>{h.event}</h3>{text(h.why_it_changed)}</div></li>)}</ol>}{photos('history')}
   {historyNotes.length>0&&<details className="physics-details"><summary>About the history</summary>{historyNotes.map((p,i)=><div key={i}>{historyNotes.length>1&&<h3 data-narration-content>{p.title}</h3>}{text(p.text)}</div>)}</details>}
  </Section>
  <Section {...props} id="drinks-method" title="How it is made—and what has changed">{text(view.making.introduction)}
   <ol className="drinks-process">{view.making.stages.map(p=><li key={p.id}><h3 data-narration-content>{p.title}</h3>{text(p.action)}{text(p.why_it_matters)}<p className="drinks-cue" data-narration-content><strong>What to notice:</strong> {p.what_to_notice}</p>{photos('method',p.id)}</li>)}</ol>{photos('method')}
   {view.making.comparisons.length>0&&<div className="drinks-method-comparisons"><h3 data-narration-content>Different approaches, different results</h3>{view.making.comparisons.map(p=><div className="drinks-method-change" key={p.id}><h4 data-narration-content>{p.aspect}</h4>{p.relationship&&<p className="physics-note" data-narration-content>{relationships[p.relationship]}</p>}<div className="drinks-comparison"><div><h5 data-narration-content>{p.relationship==='contemporary_alternative'?'The established method':'Earlier or established'}</h5>{text(p.earlier_or_standard)}</div><div><h5 data-narration-content>{p.relationship==='contemporary_alternative'?'Another way to make it':'Today'}</h5>{text(p.today_or_alternative)}</div></div><h5 data-narration-content>The effect in the glass</h5>{text(p.effect)}</div>)}</div>}
   {!third&&<>{photos('historical_making')}{photos('modern_making')}</>}
   <h3 data-narration-content>What defines the drink</h3>{bullets(view.making.defining_features)}
   {view.making.details.length>0&&<details className="physics-details"><summary>More about the preparation</summary>{view.making.details.map(p=><div className="drinks-detail" key={p.title}><h3 data-narration-content>{p.title}</h3>{text(p.context)}<h4 data-narration-content>Tools</h4>{bullets(p.equipment)}<h4 data-narration-content>The result</h4>{text(p.result)}</div>)}</details>}
  </Section>
  {l.science.length>0&&<Section {...props} id="drinks-science" title="The science behind it">{l.science.map(p=><div className="drinks-detail" key={p.id}><h3 data-narration-content>{p.title}</h3><p className="physics-goal" data-narration-content>{p.mechanism}</p>{text(p.explanation)}<p className="drinks-cue" data-narration-content><strong>Notice this:</strong> {p.observable_cue}</p>{p.limits&&<details className="physics-details"><summary>When this explanation applies</summary>{text(p.limits)}</details>}{l.science_focus_id===p.id&&<ArticleImages fact={fact} slot="how_it_works" onOpenImage={onOpenImage}/>} {photos('science',p.id)}</div>)}{photos('science')}</Section>}
  <Section {...props} id="drinks-recipe" title="Make it in India"><h3 data-narration-content>{r.title}</h3>{text(r.adaptation_notes)}<p className="physics-note" data-narration-content>{{home_mixed:'Home preparation',serving_adaptation:'Serving adaptation',alcohol_free_interpretation:'Alcohol-free version'}[r.preparation_type]}{r.preparation_type!=='alcohol_free_interpretation'&&<> · {r.alcohol_status==='non_alcoholic'?'Alcohol-free':'Contains alcohol'}</>}</p>
   <dl className="drinks-essentials">{[['Servings',r.servings],['Preparation',`${r.prep_minutes} min`],...(r.cook_minutes?[['Cooking',`${r.cook_minutes} min`]]:[]),...(r.rest_minutes?[['Resting',`${r.rest_minutes} min`]]:[])].map(([key,v])=><div key={key}><dt data-narration-content>{key}</dt><dd data-narration-content>{v}</dd></div>)}</dl>
   {r.allergens.length>0&&<><h3 data-narration-content>Ingredients to check</h3>{bullets(r.allergens)}</>}{r.safety_notes.length>0&&bullets(r.safety_notes)}
   <div className="drinks-recipe-grid"><div><h3 data-narration-content>What you need</h3><ul className="drinks-ingredients">{r.ingredients.map(p=><li key={p.id}><strong data-narration-content>{p.amount} {p.unit}</strong><div data-narration-content>{p.name}<small>{p.household_measure!==`${p.amount} ${p.unit}`&&`${p.household_measure} · `}{p.preparation}</small><small>{p.role}{p.contains_alcohol?' · Contains alcohol':''}</small></div></li>)}</ul><h4 data-narration-content>Equipment</h4>{bullets(r.equipment)}</div><div><h3 data-narration-content>The method</h3><ol className="drinks-process">{r.steps.map((p,i)=><li key={i}><h4 data-narration-content>{p.title}</h4>{text(p.instruction)}<p className="physics-note" data-narration-content>{p.time_guidance}</p><p data-narration-content>{p.doneness_cue}</p></li>)}</ol></div></div>
   {r.substitutions.length>0&&<div className="drinks-detail"><h3 data-narration-content>Indian pantry alternatives</h3>{r.substitutions.map((p,i)=><div key={i}><h4 data-narration-content>{r.ingredients.find(x=>x.id===p.ingredient_id).name} → {p.substitute}</h4><p data-narration-content>{p.quantity}</p>{text(p.effect)}</div>)}</div>}
   <details className="physics-details"><summary>How this differs from the traditional preparation</summary>{text(r.traditional_preparation)}</details>
   {photos('recipe')}
  </Section>
  <Section {...props} id="drinks-variations" title="Variations and drinks to explore">
   {exploreGroup(view.explore.filter(p=>p.relationship==='variation'),'Variations')}
   {exploreGroup(view.explore.filter(p=>p.relationship!=='variation'),'Related drinks')}
   {photos('explore')}{!third&&photos('variations')}
   {view.related.length>0&&<div className="physics-next"><h3 data-narration-content>Find more discoveries</h3><ul>{view.related.map(name=><li key={name}><Link to={archiveUrl('drinks',name)}>{name}</Link></li>)}</ul></div>}
  </Section>
  <Section {...props} id="drinks-serving" title="Serving, pairings, and adjustments"><h3 data-narration-content>Glassware and temperature</h3>{text(l.serving_context.glassware)}<h3 data-narration-content>Pairings and customs</h3>{text(l.serving_context.pairing_and_customs)}{l.identity.alcohol_status!=='non_alcoholic'&&l.serving_context.alcohol_free_option&&<><h3 data-narration-content>Alcohol-free version</h3>{text(l.serving_context.alcohol_free_option)}</>}{text(l.serving_context.practical_notes)}{photos('serving')}
   <details className="physics-details"><summary>Adjust the result</summary>{l.troubleshooting.map((p,i)=><div className="drinks-detail" key={i}><h3 data-narration-content>{p.problem}</h3>{text(p.cause)}{text(p.fix)}</div>)}</details>
  </Section>
  {scenes.length>0&&<Section {...props} id="drinks-photographs" title="A closer look at the drink"><CountryCarousel images={scenes} label="Photographs of the drink and its setting" onOpenImage={onOpenImage}/></Section>}
  <Section {...props} id="drinks-check" title="Key takeaways and questions">{bullets(l.takeaways)}{l.knowledge_checks.map((p,i)=><div className="drinks-detail" key={i}><h3 data-narration-content>{p.question}</h3><details className="physics-details"><summary>Reveal answer</summary>{text(p.answer)}{text(p.explanation)}</details></div>)}</Section>
 </div>
}
