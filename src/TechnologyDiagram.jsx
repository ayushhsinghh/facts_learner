import { Fragment,useEffect,useRef,useState } from 'react'
import { technologyParts,validTechnologyDiagram } from './technology.js'
export default function TechnologyDiagram({diagram:d,system}) {
  const flowRef=useRef(null),[overflow,setOverflow]=useState(false)
  useEffect(()=>{
    const element=flowRef.current
    if(!element||typeof ResizeObserver==='undefined')return
    const check=()=>setOverflow(element.scrollWidth>element.clientWidth+1)
    const observer=new ResizeObserver(check);observer.observe(element);if(element.firstElementChild)observer.observe(element.firstElementChild);check()
    return()=>observer.disconnect()
  },[d])
  if(!d||!validTechnologyDiagram(d,system))return null
  const parts=new Map(technologyParts(system).map(p=>[p.id,p]))
  return <figure className="technology-diagram"><h3>{d.title}</h3>
    {d.type==='flow'&&overflow&&<p className="physics-note">Scroll sideways to follow the full path.</p>}
    {d.type==='flow'&&<div className="technology-flow-scroll" ref={flowRef} role="region" aria-label={d.title} tabIndex={0}><div className="technology-flow">
      {d.node_ids.map((id,i)=><Fragment key={id}>
        <div className="technology-flow-node"><a href={`#technology-part-${id}`}>{parts.get(id).name}</a><span>{parts.get(id).kind}</span></div>
        {i<d.node_ids.length-1&&<div className="technology-flow-links">{d.connections.filter(e=>(e.from_id===id&&e.to_id===d.node_ids[i+1])||(e.to_id===id&&e.from_id===d.node_ids[i+1])).map((e,j)=><div key={j} className="technology-flow-link">
          <svg viewBox="0 0 100 24" aria-hidden="true"><path d={e.from_id===id?'M3 12H95M87 4 95 12 87 20':'M97 12H5M13 4 5 12 13 20'} fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
          <p data-narration-content><span className="sr-only">{parts.get(e.from_id).name} to {parts.get(e.to_id).name}: </span><strong>{e.label}</strong><span className="sr-only">. </span><span className="technology-flow-payload">{e.what_moves}</span></p>
        </div>)}</div>}
      </Fragment>)}
    </div></div>}
    {d.type==='layers'&&<div className="technology-layers">{d.layers.map(layer=><div className="technology-layer" id={`technology-layer-${layer.id}`} tabIndex={-1} key={layer.id}><h4 data-narration-content>{layer.title}</h4><p data-narration-content>{layer.role}</p><ul className="technology-component-links">{layer.component_ids.map(id=><li key={id}><a href={`#technology-part-${id}`}>{parts.get(id).name}</a></li>)}</ul>{layer.depends_on_ids.length>0&&<p className="technology-dependencies">Depends on: {layer.depends_on_ids.map((id,i)=><Fragment key={id}>{i>0?', ':''}<a href={`#technology-layer-${id}`}>{d.layers.find(l=>l.id===id).title}</a></Fragment>)}</p>}</div>)}</div>}
    {d.type==='comparison'&&<><p className="technology-notice" data-narration-content>{d.comparison_basis}</p><div className="technology-comparison">{d.comparisons.map((item,i)=><div key={i}><h4 data-narration-content>{item.name}</h4><p data-narration-content>{item.approach}</p><dl><div><dt>Strength</dt><dd data-narration-content>{item.strength}</dd></div><div><dt>Limitation</dt><dd data-narration-content>{item.limitation}</dd></div></dl></div>)}</div></>}
    <figcaption data-narration-content>{d.caption}</figcaption>
    <details className="physics-details"><summary>Diagram description and assumptions</summary><p data-narration-content>{d.description}</p>{d.assumptions.length>0&&<ul>{d.assumptions.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>}</details>
  </figure>
}
