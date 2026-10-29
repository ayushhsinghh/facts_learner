import katex from 'katex'
import 'katex/dist/katex.min.css'

export default function PhysicsMath({ equation }) {
  let markup
  try {
    markup = katex.renderToString(String(equation.formula_latex || '').slice(0, 2000), {
      displayMode: true, throwOnError: true, trust: false, strict: 'error',
      output: 'htmlAndMathml', maxExpand: 100, maxSize: 10,
    })
  } catch {
    return <p className="physics-equation-fallback">{equation.spoken_formula || equation.meaning}</p>
  }
  // Only KaTeX-generated markup reaches this boundary; model HTML is never rendered.
  return <div className="physics-equation" dangerouslySetInnerHTML={{ __html: markup }} />
}
