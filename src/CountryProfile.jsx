import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CountryMap from './CountryMap.jsx'
import ArticleImages from './ArticleImages.jsx'
import { displayCountryStat } from './country.js'
import { archiveUrl } from './navigation.js'
import './physics.css'
import './country.css'

function Text({children}) {return children?<p data-narration-content>{children}</p>:null}
function Bullets({items}) {return <ul>{items.map((v,i)=><li key={i} data-narration-content>{v}</li>)}</ul>}
function Section({id,title,Heading,narration,children}) {
  const ref=useRef(null)
  return <section id={id} className="physics-section" ref={ref}><Heading narrationId={id} narration={narration} targetRef={ref}>{title}</Heading><div className="physics-section-body">{children}</div></section>
}
function Stories({items}) {return items.map((item,i)=><div className="country-story" key={i}><h3>{item.title}</h3><Text>{item.explanation}</Text><Text>{item.why_it_matters}</Text></div>)}
export function CountryFlag({identity}) {
  const [failed,setFailed]=useState(false)
  return failed?<span className="physics-note">Flag unavailable</span>:<img className="country-hero-flag" src={`https://flagcdn.com/w320/${identity.iso2.toLowerCase()}.png`} alt={`Flag of ${identity.name}`} onError={()=>setFailed(true)} />
}
export default function CountryProfile({fact,narration,Heading,MarkdownContent,onOpenImage}) {
  const p=fact.country_profile,i=p.identity,props={Heading,narration}
  const photos=placement=><ArticleImages fact={fact} placement={placement} onOpenImage={onOpenImage} />
  return <div className="physics-lesson country-profile">
    <Section {...props} id="overview" title={`Meet ${i.name}`}>
      <p className="physics-goal" data-narration-content>{p.introduction.central_idea}</p>
      <MarkdownContent narration={narration} standalone={false}>{fact.summary}</MarkdownContent>
      <h3>A first surprise</h3><Text>{p.introduction.surprising_fact}</Text>
      <details className="physics-details"><summary>What you will discover</summary><Bullets items={p.introduction.learning_goals} /></details>
      {photos('overview')}
    </Section>
    <Section {...props} id="country-location" title="Find it in the world">
      <CountryMap identity={i} /><Text>{p.geography.location_explanation}</Text>
      <dl className="country-essentials">
        <div><dt>Region</dt><dd data-narration-content>{[i.region,i.subregion].filter(Boolean).join(' · ')}</dd></div>
        <div><dt>Land neighbours</dt><dd data-narration-content>{i.neighbour_names.join(', ')||'No land neighbours listed in the snapshot'}</dd></div>
        <div><dt>Nearby seas</dt><dd data-narration-content>{p.geography.seas.join(', ')||'No nearby sea listed'}</dd></div>
      </dl>
      <h3>The landscape</h3><Bullets items={p.geography.landscapes} />
      <h3>Cities to recognise</h3>{p.geography.major_cities.map((c,n)=><div className="country-story" key={n}><h4>{c.name}</h4><Text>{c.significance}</Text></div>)}
      {photos('geography')}
    </Section>
    <Section {...props} id="country-essentials" title="The essentials">
      <dl className="country-essentials">
        <div><dt>Official name</dt><dd data-narration-content>{i.official_name}</dd></div>
        <div><dt>Capital{ i.capitals.length>1?'s':''}</dt><dd data-narration-content>{i.capitals.join(', ')||'Not supplied'}</dd></div>
        <div><dt>Currency</dt><dd data-narration-content>{i.currencies.map(c=>`${c.name} (${c.code}${c.symbol?`, ${c.symbol}`:''})`).join('; ')||'Not supplied'}</dd></div>
        <div><dt>Languages listed in the snapshot</dt><dd data-narration-content>{i.official_languages.join(', ')||'Not supplied'}</dd></div>
        <div><dt>Population</dt><dd data-narration-content>{displayCountryStat(p.essentials.population)}</dd><dd className="physics-note" data-narration-content>{p.essentials.population.scope}</dd></div>
        <div><dt>Area</dt><dd data-narration-content>{Number.isFinite(i.area_km2)?`${new Intl.NumberFormat('en').format(i.area_km2)} km²`:'Not supplied'}</dd></div>
      </dl>
      <p className="physics-note">Names, capitals, currencies, language lists and area use a country-data snapshot retrieved on 30 October 2026. A listed language is not necessarily legally official. Retrieval does not establish when every entry last changed. Population uses its stated measurement year.</p>
      <details className="physics-details"><summary>Local names and time zones</summary><Text>{i.local_names.join(' · ')||'Local names not supplied.'}</Text><Text>{p.essentials.time_zones.explanation}</Text></details>
      <details className="physics-details"><summary>Understand the flag</summary><Text>{p.flag.description}</Text><Text>{p.flag.symbolism}</Text><p className="physics-note">Flag asset: Flagpedia / flagcdn.com.</p></details>
    </Section>
    <Section {...props} id="country-life" title="People and everyday life">
      <Stories items={p.everyday_life} />
      {p.essentials.spoken_languages.length>0&&<details className="physics-details"><summary>Language roles and regional use</summary>{p.essentials.spoken_languages.map((l,n)=><div key={n}><h3>{l.name}</h3><p className="physics-note" data-narration-content>{l.role.replaceAll('_',' ')}</p><Text>{l.explanation}</Text></div>)}</details>}
      {photos('everyday')}
    </Section>
    <Section {...props} id="country-history" title="How it became this country">
      <ol className="country-timeline">{p.history_milestones.map((e,n)=><li key={n}><span className="country-date" data-narration-content>{e.date_label}</span><div><h3>{e.event}</h3><Text>{e.significance}</Text></div></li>)}</ol>
    </Section>
    <Section {...props} id="country-world" title="Its influence on the world">
      <Stories items={p.global_contributions} /><h3>Products and industries</h3><Stories items={p.products_and_industries} />{photos('contributions')}
    </Section>
    <Section {...props} id="country-places" title="Places worth understanding">
      {p.notable_places.map((place,n)=><div className="country-story" key={n}><h3>{place.name}</h3><p className="physics-note" data-narration-content>{place.location}</p><Text>{place.explanation}</Text><Text>{place.why_it_matters}</Text></div>)}{photos('places')}
    </Section>
    <Section {...props} id="country-people" title="People and their contributions">
      {p.notable_people.map((person,n)=><div className="country-story" key={n}><h3>{person.name}</h3><p className="physics-note" data-narration-content>{person.field}</p><Text>{person.connection}</Text><Text>{person.contribution}</Text><Text>{person.context}</Text></div>)}{photos('people')}
    </Section>
    <Section {...props} id="country-surprises" title="Look a little closer">
      <Stories items={p.surprising_facts} />{photos('curiosity')}
      <h3>Common misunderstandings</h3>{p.common_misunderstandings.map((item,n)=><div className="country-story" key={n}><h4>{item.misunderstanding}</h4><Text>{item.explanation}</Text></div>)}
    </Section>
    <Section {...props} id="country-check" title="What will you remember?">
      <Bullets items={p.takeaways} />
      {p.knowledge_checks.map((q,n)=><div className="physics-check" key={n}><h3 data-narration-content>{q.question}</h3><details className="physics-details"><summary>Reveal answer and explanation</summary><Text>{q.answer}</Text><Text>{q.explanation}</Text></details></div>)}
      <h3>Keep your curiosity going</h3><Bullets items={p.curiosity_questions} />
      <ul className="country-next">{p.related_topics.map(topic=><li key={topic}><Link to={archiveUrl('country',topic)}>{topic}</Link></li>)}</ul><p className="physics-note">Searches existing country discoveries; a matching article may not be available yet.</p>
    </Section>
  </div>
}
