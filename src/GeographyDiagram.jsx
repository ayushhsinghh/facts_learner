import { useId } from 'react'
import { validGeographyDiagram,geographyConnectionLabels } from './geography.js'
function lines(value,max=20) {const result=[''];for(const word of value.split(' ').flatMap(w=>w.match(new RegExp(`.{1,${max}}`,'gu'))||[])){const i=result.length-1;if(result[i]&&result[i].length+word.length>max)result.push(word);else result[i]+=(result[i]?' ':'')+word}return result}
export default function GeographyDiagram({diagram:d}) {
  const arrow=useId().replaceAll(':',''),titleId=useId(),descId=useId()
  if(!d||!validGeographyDiagram(d))return null
  const nodes=d.nodes.map(n=>({...n,x:60+n.x*680,y:35+n.y*270})),byId=new Map(nodes.map(n=>[n.id,n]))
  const connectionLabels=geographyConnectionLabels(nodes,d.connections)
  return <figure className="geography-diagram"><h3>{d.title}</h3>
    {d.type!=='comparison'&&<p className="physics-note geography-diagram-hint">Scroll sideways to see the whole diagram.</p>}
    {d.type==='comparison'?<div className="geography-comparison">{d.comparisons.map((item,i)=><div key={i}><h4>{item.label}</h4><p className="physics-note" data-narration-content>{item.conditions}</p><p data-narration-content>{item.explanation}</p></div>)}</div>:<div className="geography-diagram-scroll" tabIndex={0} role="region" aria-label={`${d.title}: scroll horizontally to view the whole diagram`}><svg viewBox="0 0 800 410" role="img" aria-labelledby={titleId} aria-describedby={descId}>
      <title id={titleId}>{d.title}</title><desc id={descId}>{d.description} {d.connections.map(e=>`${byId.get(e.from_id).label}: ${e.label}: ${byId.get(e.to_id).label}.`).join(' ')}</desc>
      <defs><marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 7 4 1 7" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs>
      {d.type==='cross_section'&&<path className="geography-terrain" d={`M60 380 ${d.profile.map(p=>`L${60+p.x*680} ${370-p.height*240}`).join(' ')} L740 380 Z`}/>}
      {d.connections.map((e,i)=>{const a=byId.get(e.from_id),b=byId.get(e.to_id),dx=b.x-a.x,dy=b.y-a.y,scale=Math.min(.49,100/Math.max(1,Math.abs(dx)),38/Math.max(1,Math.abs(dy))),label=connectionLabels[i];return <g key={i}><line className="geography-diagram-arrow" x1={a.x+dx*scale} y1={a.y+dy*scale} x2={b.x-dx*scale} y2={b.y-dy*scale} markerEnd={`url(#${arrow})`}/>{label&&<text className="geography-relationship" x={label.x} y={label.y} textAnchor="middle">{lines(e.label,24).map((s,j)=><tspan key={j} x={label.x} dy={j?16:0}>{s}</tspan>)}</text>}</g>})}
      {nodes.map(n=><g key={n.id} className="geography-diagram-node"><rect x={n.x-96} y={n.y-34} width="192" height="68" rx="4"/><text x={n.x} y={n.y-(lines(n.label).length-1)*10+5} textAnchor="middle">{lines(n.label).map((s,i)=><tspan key={i} x={n.x} dy={i?20:0}>{s}</tspan>)}</text></g>)}
    </svg></div>}
    <figcaption data-narration-content>{d.caption}{d.type==='cross_section'?' Conceptual cross-section, not to scale.':''}</figcaption>
    {d.connections.length>0&&<ul className="geography-connections">{d.connections.map((e,i)=><li key={i} data-narration-content>{byId.get(e.from_id).label} → {byId.get(e.to_id).label}: {e.label}.</li>)}</ul>}
    {nodes.length>0&&<dl className="geography-diagram-key">{nodes.map(n=><div key={n.id}><dt>{n.label}</dt><dd data-narration-content>{n.detail}</dd></div>)}</dl>}
    <details className="physics-details"><summary>Diagram description and assumptions</summary><p data-narration-content>{d.description}</p>{d.assumptions.length>0&&<ul>{d.assumptions.map((item,i)=><li key={i} data-narration-content>{item}</li>)}</ul>}</details>
  </figure>
}
