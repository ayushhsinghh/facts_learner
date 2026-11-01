import { useEffect, useId, useRef, useState } from 'react'
import { economicNumber } from './economics.js'
export function EconomicProvenance({ value }) {
  return <div className="economics-provenance" data-narration-content>
    <p><strong>{value.kind === 'illustrative' ? 'Illustrative example' : 'Observed data'}</strong> — {value.description}</p>
    {(value.period || value.geography || value.as_of) && <p>{[value.geography, value.period].filter(Boolean).join(' · ')}{value.as_of && <> · Context dated <time dateTime={value.as_of}>{value.as_of}</time></>}</p>}
  </div>
}
export default function EconomicsDiagram({ diagram: d }) {
  const scrollRef = useRef(null), [overflow, setOverflow] = useState(false)
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const measure = () => setOverflow(node.scrollWidth > node.clientWidth + 1)
    const observer = new ResizeObserver(measure)
    observer.observe(node); measure()
    return () => observer.disconnect()
  }, [d])
  const axisNumber = value => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  const uid = useId(), colors = ['var(--signal-strong)', 'var(--paper)', 'var(--muted)'], dashes = ['', '8 5', '2 5']
  const values = d.series.flatMap(s => s.values), min = Math.min(0, ...values), max = Math.max(0, ...values)
  const span = max - min || 1, y = v => 245 - (v - min) / span * 205
  const x = i => 70 + i / Math.max(1, d.labels.length - 1) * 530
  return <figure className="economics-diagram" aria-labelledby={`${uid}-title`}>
    <h3 id={`${uid}-title`}>{d.title}</h3><EconomicProvenance value={d.provenance}/>
    {d.type === 'comparison' ? <><p data-narration-content>{d.comparison_basis}</p><div className="economics-comparisons">{d.comparisons.map(c => <div key={c.name}><h4 data-narration-content>{c.name}</h4><p data-narration-content>{c.approach}</p><dl>{[['Benefit', c.benefit], ['Cost or constraint', c.cost], ['Depends on', c.conditions]].map(([label, value]) => <div key={label}><dt data-narration-content>{label}</dt><dd data-narration-content>{value}</dd></div>)}</dl></div>)}</div></> : <>
      <p className="economics-axis-label" data-narration-content>{d.x_label} · {d.unit}</p>
      {d.type === 'bar' ? <div className="economics-bars">{d.labels.map((label, i) => <div className="economics-bar-group" key={label}><h4 data-narration-content>{label}</h4>{d.series.map((s, j) => <div className="economics-bar-row" key={s.name}><span data-narration-content>{s.name}</span><div className="economics-bar-track" aria-hidden="true"><span className="economics-zero" style={{ left: `${-min / span * 100}%` }}/><span className="economics-bar-fill" style={{ left: `${(Math.min(0, s.values[i]) - min) / span * 100}%`, width: `${Math.abs(s.values[i]) / span * 100}%`, background: colors[j] }}/></div><span className="economics-bar-value" data-narration-content>{economicNumber(s.values[i])} {d.unit}</span></div>)}</div>)}</div> : <>
        {overflow && <p className="economics-scroll-hint">Scroll the chart sideways to see every label.</p>}
        <div className="economics-chart-scroll" ref={scrollRef} tabIndex={overflow ? 0 : -1} role="region" aria-label={`${d.title}. Scrollable chart; exact values are in the table below.`}>
          <svg className="economics-line-chart" viewBox="0 0 680 320" role="img" aria-labelledby={`${uid}-title ${uid}-description`}>
            <desc id={`${uid}-description`}>{d.description} Exact values appear in the expandable data table below.</desc>
            <path d={`M70 40V245H620 M70 ${y(0)}H620`} className="economics-chart-axis"/>
            {[max, min].filter((v, i, a) => a.indexOf(v) === i).map(v => <text key={v} x="60" y={y(v) + 5} textAnchor="end">{axisNumber(v)}</text>)}
            {d.series.map((s, j) => <g key={s.name} style={{ color: colors[j] }}><polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={dashes[j]}/>{s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="currentColor"/>)}</g>)}
            {d.labels.map((label, i) => <text key={label} x={x(i)} y="265" transform={`rotate(25 ${x(i)} 265)`}>{label.length > 15 ? `${label.slice(0, 14)}…` : label}</text>)}
          </svg>
        </div>
        <ul className="economics-legend">{d.series.map((s, j) => <li key={s.name}><svg viewBox="0 0 40 10" aria-hidden="true"><path d="M0 5H40" stroke={colors[j]} strokeWidth="2" strokeDasharray={dashes[j]}/></svg>{s.name}</li>)}</ul>
      </>}
      <details className="physics-details"><summary>View exact values</summary><div className="economics-table-scroll" tabIndex={0} role="region" aria-label="Chart data"><table><caption>{d.x_label}. Values in {d.unit}.</caption><thead><tr><th scope="col">{d.x_label}</th>{d.series.map(s => <th key={s.name} scope="col">{s.name}</th>)}</tr></thead><tbody>{d.labels.map((label, i) => <tr key={label}><th scope="row" data-narration-content>{label}</th>{d.series.map(s => <td key={s.name} data-narration-content>{economicNumber(s.values[i])}</td>)}</tr>)}</tbody></table></div></details>
    </>}
    <figcaption data-narration-content>{d.caption}</figcaption><p data-narration-content>{d.description}</p>
    {d.assumptions.length > 0 && <details className="physics-details"><summary>What this figure assumes</summary><ul>{d.assumptions.map(a => <li key={a} data-narration-content>{a}</li>)}</ul></details>}
  </figure>
}
