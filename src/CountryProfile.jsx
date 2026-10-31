import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CountryMap from './CountryMap.jsx'
import CountryCarousel from './CountryCarousel.jsx'
import { CountrySubjectImage } from './CountryMedia.jsx'
import PhotoCredit from './PhotoCredit.jsx'
import ArticleImages from './ArticleImages.jsx'
import { countryScenes, displayCountryStat } from './country.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './country.css'

function Text({children}) {return children?String(children).split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index} data-narration-content>{paragraph}</p>):null}
function Bullets({items}) {return <ul>{items.map((v,i)=><li key={i} data-narration-content>{v}</li>)}</ul>}
function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function TopicDetails({item}) {return <>{Array.isArray(item.details)&&item.details.length>0&&<Bullets items={item.details}/>} {item.example&&<div className="country-topic-example"><h4>A concrete example</h4><Text>{item.example}</Text></div>}</>}
function Stories({items,fact,kind,onOpenImage}) {return items.map((item,index)=><div className="country-story country-topic-article" key={item.title}>
  <h3>{item.title}</h3><Text>{item.explanation}</Text>
  {fact&&kind&&<CountrySubjectImage fact={fact} kind={kind} index={index} subject={item.photo_subject||item.title} onOpenImage={onOpenImage}/>}
  <TopicDetails item={item}/><Text>{item.why_it_matters}</Text>
</div>)}
export function CountryFlag({identity,large=false,onOpenImage}) {
  const [failed,setFailed]=useState(false)
  const url=`https://flagcdn.com/${large?'w640':'w320'}/${identity.iso2.toLowerCase()}.png`
  if(failed)return <span className="physics-note">Flag unavailable</span>
  const image=<img className={large?"country-explained-flag":"country-hero-flag"} src={url} alt={`Flag of ${identity.name}`} onError={()=>setFailed(true)} />
  return large&&onOpenImage?<button type="button" className="country-flag-image" aria-label={`Enlarge flag of ${identity.name}`} onClick={()=>onOpenImage({url,alt:`Flag of ${identity.name}`,credit:{kind:'flag'}})}>{image}</button>:image
}
export default function CountryProfile({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const p=fact.country_profile,i=p.identity,props={Heading,narration}
  const photos=placement=><ArticleImages fact={fact} placement={placement} onOpenImage={onOpenImage} />
  return <div className="physics-lesson country-profile">
    <Section {...props} id="overview" title={`Meet ${i.name}`}>
      <MarkdownContent narration={narration} standalone={false}>{fact.summary||p.introduction.central_idea}</MarkdownContent>
      <h3>What you will learn</h3><Bullets items={p.introduction.learning_goals} />
      <details className="physics-details country-contents"><summary>Explore all sections</summary>
        <nav aria-label="All country sections">{[['country-essentials','The essentials'],['country-location','Map and geography'],['country-life','Everyday life'],['country-history','History'],['country-world','World influence'],['country-places','Places'],...(countryScenes(fact).length?[['country-photographs','Photographs']]:[]),['country-people','People'],['country-surprises','Surprises'],['country-check','Check understanding']].map(([id,title])=><a key={id} href={`#${id}`}>{title}</a>)}</nav>
      </details>
      {photos('overview')}
    </Section>
    <Section {...props} id="country-essentials" title="The essentials">
      <dl className="country-essentials country-essentials-primary">
        <div><dt>Capital{ i.capitals.length>1?'s':''}</dt><dd data-narration-content>{i.capitals.join(', ')||'Not supplied'}</dd></div>
        <div><dt>Currency</dt><dd data-narration-content>{i.currencies.map(c=>`${c.name} (${c.code}${c.symbol?`, ${c.symbol}`:''})`).join('; ')||'Not supplied'}</dd></div>
        <div><dt>Languages</dt><dd><span data-narration-content>{i.official_languages.slice(0,3).join(', ')||'Not supplied'}</span>{i.official_languages.length>3&&<details className="country-language-list"><summary>All {i.official_languages.length} languages</summary><Text>{i.official_languages.slice(3).join(', ')}</Text></details>}</dd></div>
        <div><dt>Population</dt><dd data-narration-content>{displayCountryStat(p.essentials.population)}</dd></div>
        <div><dt>Local names</dt><dd data-narration-content>{i.local_names.join(' · ')||'Not supplied'}</dd></div>
        <div><dt>Area</dt><dd data-narration-content>{Number.isFinite(i.area_km2)?`${new Intl.NumberFormat('en').format(i.area_km2)} km²`:'Not supplied'}</dd></div>
      </dl>
      <div className="country-time-zones"><h3>Time zones</h3><Text>{p.essentials.time_zones.explanation}</Text></div>
      <details className="physics-details"><summary>Data dates and scope</summary>
        <p data-narration-content>Official name: {i.official_name}</p><Text>{p.essentials.population.scope}</Text>
        <p className="physics-note">Names, capitals, currencies, language lists and area use a country-data snapshot retrieved on {p.data_context?.snapshot_date||'2026-10-30'}. A listed language is not necessarily legally official. Retrieval does not establish when every entry last changed. Population uses its stated measurement year.</p>
      </details>
      <section className="country-flag-explainer"><h3>Understand the flag</h3><figure><CountryFlag identity={i} large onOpenImage={onOpenImage}/><figcaption>Flag of {i.name}<PhotoCredit credit={{kind:'flag'}}/></figcaption></figure><div><Text>{p.flag.description}</Text><Text>{p.flag.symbolism}</Text></div></section>
    </Section>
    <Section {...props} id="country-location" title="Find it in the world">
      <CountryMap identity={i} waters={p.geography.seas} /><Text>{p.geography.location_explanation}</Text>
      <h3>The landscape</h3><Bullets items={p.geography.landscapes} />
      <details className="physics-details"><summary>Cities to recognise · {p.geography.major_cities.length}</summary>
        {p.geography.major_cities.map((c,n)=><div className="country-story country-illustrated-story" key={n}><div><h4>{c.name}</h4><Text>{c.significance}</Text><TopicDetails item={c}/></div><CountrySubjectImage fact={fact} kind="cities" index={n} subject={c.name} onOpenImage={onOpenImage}/></div>)}
      </details>
      {photos('geography')}
    </Section>
    <Section {...props} id="country-life" title="People and everyday life">
      <Stories items={p.everyday_life} fact={fact} kind="culture" onOpenImage={onOpenImage}/>
      {p.essentials.spoken_languages.length>0&&<details className="physics-details"><summary>Language roles and regional use</summary>{p.essentials.spoken_languages.map((l,n)=><div key={n}><h3>{l.name}</h3><p className="physics-note" data-narration-content>{l.role.replaceAll('_',' ')}</p><Text>{l.explanation}</Text></div>)}</details>}
      {photos('everyday')}
    </Section>
    <Section {...props} id="country-history" title="How it became this country">
      <ol className="country-timeline">{p.history_milestones.map((e,n)=><li key={n}><span className="country-date" data-narration-content>{e.date_label}</span><div><h3>{e.event}</h3><Text>{e.significance}</Text></div></li>)}</ol>
    </Section>
    <Section {...props} id="country-world" title="Its influence on the world">
      <Stories items={p.global_contributions} fact={fact} kind="contributions" onOpenImage={onOpenImage}/><h3>Products and industries</h3><Stories items={p.products_and_industries} fact={fact} kind="products" onOpenImage={onOpenImage}/>{photos('contributions')}
    </Section>
    <Section {...props} id="country-places" title="Places worth understanding">
      {p.notable_places.map((place,n)=><div className="country-story country-illustrated-story" key={place.name}><div><h3>{place.name}</h3><p className="physics-note" data-narration-content>{place.location}</p><Text>{place.explanation}</Text><TopicDetails item={place}/><Text>{place.why_it_matters}</Text></div><CountrySubjectImage fact={fact} kind="places" index={n} subject={place.name} onOpenImage={onOpenImage}/></div>)}{photos('places')}
    </Section>
    {(countryScenes(fact).length>0||fact.country_media?.photo_ranking_version===1)&&<Section {...props} id="country-photographs" title="Scenes from the country">
      {countryScenes(fact).length>0?<CountryCarousel fact={fact} onOpenImage={onOpenImage}/>
        :<p role="status">{['insufficient','completed'].includes(fact.photo_selection?.status)?'Not enough relevant photographs are available for this country.':'Photographs are being selected. You can keep reading while they arrive.'}</p>}
    </Section>}
    <Section {...props} id="country-people" title="People and their contributions">
      {p.notable_people.map((person,n)=><div className="country-story country-illustrated-story" key={person.name}><div><h3>{person.name}</h3><p className="physics-note" data-narration-content>{person.field}</p><Text>{person.connection}</Text><Text>{person.contribution}</Text><TopicDetails item={person}/><Text>{person.context}</Text></div><CountrySubjectImage fact={fact} kind="people" index={n} subject={person.name} onOpenImage={onOpenImage}/></div>)}{photos('people')}
    </Section>
    <Section {...props} id="country-surprises" title="Look a little closer">
      <h3>A first surprise</h3><Text>{p.introduction.surprising_fact}</Text>
      <Stories items={p.surprising_facts} />{photos('curiosity')}
      <h3>Common misunderstandings</h3>{p.common_misunderstandings.map((item,n)=><div className="country-story" key={n}><h4>{item.misunderstanding}</h4><Text>{item.explanation}</Text></div>)}
    </Section>
    <Section {...props} id="country-check" title="What will you remember?">
      <p className="physics-goal" data-narration-content>{p.introduction.central_idea}</p>
      <Bullets items={p.takeaways} />
      {p.knowledge_checks.map((q,n)=><div className="physics-check" key={n}><h3 data-narration-content>{q.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{q.answer}</Text><Text>{q.explanation}</Text></details></div>)}
      <details className="physics-details"><summary>Article details</summary>
        <dl className="country-essentials">
          {fact.key_year&&<div><dt>Year highlighted in this article</dt><dd>{fact.key_year}</dd></div>}
          {fact.generated_at&&!Number.isNaN(Date.parse(fact.generated_at))&&<div><dt>Discovered</dt><dd>{new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(new Date(fact.generated_at))}</dd></div>}
          {fact.fun_rating!=null&&<div><dt>Generated curiosity rating</dt><dd>{fact.fun_rating}/10</dd></div>}
          {fact.content_freshness&&<div><dt>Content label</dt><dd>{fact.content_freshness}</dd></div>}
        </dl><p className="physics-note">Curiosity and freshness are article labels, not measurements of the country.</p>
      </details>
      <h3>Keep your curiosity going</h3><Bullets items={p.curiosity_questions} />
      <ul className="country-next">{p.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('country',topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches existing country discoveries; a matching article may not be available yet.</p>
    </Section>
  </div>
}
