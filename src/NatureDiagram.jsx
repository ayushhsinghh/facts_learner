import { useId } from 'react'
import { natureReferences } from './nature.js'
export default function NatureDiagram({diagram:d,lesson}){
  const uid=useId(),refs=natureReferences(lesson),byId=new Map(d.nodes.map(n=>[n.id,n]))
  const record=n=>refs[n.ref_type].get(n.ref_id),label=n=>record(n).name||record(n).title
  const Path=d.type==='relationships'?'ul':'ol'
  const link=n=><a href={`#nature-ref-${n.ref_type}-${n.ref_id}`}>{label(n)}</a>
  return <figure className="nature-diagram" aria-labelledby={`${uid}-title`}>
    <h3 id={`${uid}-title`} data-narration-content>{d.title}</h3>
    {d.type==='comparison'?<><p data-narration-content>{d.comparison_basis}</p><div className="nature-comparison">{d.comparisons.map(c=><div key={c.name}><h4 data-narration-content>{c.name}</h4><p data-narration-content>{c.observation}</p><p data-narration-content>{c.explanation}</p><p className="physics-note" data-narration-content>Conditions: {c.conditions}</p></div>)}</div></>:<>
      {d.type==='labelled_structure'?<dl className="nature-structure">{d.nodes.map(n=><div key={n.id}><dt data-narration-content>{link(n)}</dt><dd data-narration-content>{n.explanation}</dd></div>)}</dl>:<Path className={`nature-path${d.type==='relationships'?' nature-network-nodes':''}`}>{d.nodes.map(n=><li key={n.id}><span data-narration-content>{link(n)}</span><p data-narration-content>{n.explanation}</p></li>)}</Path>}
      {d.type==='cycle'&&<p className="nature-cycle-return" data-narration-content><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9a7 7 0 1 1 0 8M5 3v6h6"/></svg>The sequence returns to {link(d.nodes[0])}.</p>}
      {d.edges.length>0&&<dl className="nature-relationships">{d.edges.map(e=><div key={`${e.from_id}/${e.to_id}`}><dt data-narration-content>{link(byId.get(e.from_id))} to {link(byId.get(e.to_id))}: {e.label}</dt><dd data-narration-content>{e.explanation}</dd></div>)}</dl>}
    </>}
    <figcaption data-narration-content>{d.caption}</figcaption><p data-narration-content>{d.description}</p>
    {d.assumptions.length>0&&<details className="physics-details"><summary>What this diagram leaves out</summary><ul>{d.assumptions.map(a=><li key={a} data-narration-content>{a}</li>)}</ul></details>}
  </figure>
}
