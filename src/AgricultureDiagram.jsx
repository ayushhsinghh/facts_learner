import { useId } from 'react'
export default function AgricultureDiagram({diagram:d,steps}) {
  const uid=useId(),byId=new Map(steps.map(s=>[s.id,s])),layers=new Map(d.layers.map(l=>[l.id,l]))
  const refs=ids=><ul className="agriculture-diagram-links">{ids.map(id=><li key={id}><a href={`#agriculture-step-${id}`}>{byId.get(id).title}</a></li>)}</ul>
  return <figure className="agriculture-diagram" aria-labelledby={`${uid}-title`}>
    <h3 id={`${uid}-title`} data-narration-content>{d.title}</h3>
    {d.type==='process'&&<ol className="agriculture-path">{d.process_step_ids.map(id=><li key={id}><a href={`#agriculture-step-${id}`}>{byId.get(id).title}</a><p data-narration-content>{byId.get(id).what_changes}</p></li>)}</ol>}
    {d.type==='seasonal'&&<ol className="agriculture-season">{d.season_stages.map(s=><li key={s.id}><p className="physics-note" data-narration-content>{s.timing}</p><h4 data-narration-content>{s.title}</h4><p data-narration-content>{s.what_to_notice}</p>{refs(s.process_step_ids)}</li>)}</ol>}
    {d.type==='cross_section'&&<><p className="physics-note" data-narration-content>Conceptual layers, shown from top to bottom. Not to scale.</p><div className="agriculture-layers">{d.layers.map(l=><div className="agriculture-layer" id={`agriculture-layer-${l.id}`} tabIndex={-1} key={l.id}><div><h4 data-narration-content>{l.name}</h4><p className="physics-note" data-narration-content>{l.material}</p></div><p data-narration-content>{l.explanation}</p></div>)}</div>{d.connections.length>0&&<dl className="agriculture-relationships">{d.connections.map(e=><div key={`${e.from_id}/${e.to_id}`}><dt data-narration-content><a href={`#agriculture-layer-${e.from_id}`}>{layers.get(e.from_id).name}</a> to <a href={`#agriculture-layer-${e.to_id}`}>{layers.get(e.to_id).name}</a>: {e.label}</dt><dd data-narration-content>{e.explanation}</dd></div>)}</dl>}</>}
    {d.type==='comparison'&&<><p data-narration-content>{d.comparison_basis}</p><div className="agriculture-comparison">{d.comparisons.map(c=><div key={c.name}><h4 data-narration-content>{c.name}</h4><p data-narration-content>{c.approach}</p><dl>{[['Possible benefit',c.benefit],['Limit',c.limitation],['Depends on',c.conditions]].map(([label,value])=><div key={label}><dt data-narration-content>{label}</dt><dd data-narration-content>{value}</dd></div>)}</dl></div>)}</div></>}
    <figcaption data-narration-content>{d.caption}</figcaption><p data-narration-content>{d.description}</p>
    {d.assumptions.length>0&&<details className="physics-details"><summary>What this diagram leaves out</summary><ul>{d.assumptions.map(a=><li key={a} data-narration-content>{a}</li>)}</ul></details>}
  </figure>
}
