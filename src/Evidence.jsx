import { citedSources, legacyReferences, legacyReferenceParts, sourceRecords } from './evidence.js'

function SourceLinks({ sourceIds, fact }) {
  const sources = citedSources(sourceIds, sourceRecords(fact))
  if (!sources.length) return null
  return <span className="claim-source-links">Sources: {sources.map((source, index) => (
    <span key={source.id}>{index > 0 && '; '}{source.url
      ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
      : <span>{source.title} (link unavailable)</span>}</span>
  ))}</span>
}

export function referenceCount(fact) {
  return sourceRecords(fact).length + legacyReferences(fact).length
}

export function EvidenceReferences({ fact }) {
  const sources = sourceRecords(fact)
  const claims = (Array.isArray(fact.claim_citations) ? fact.claim_citations : [])
    .filter((item) => item && typeof item.claim === 'string' && citedSources(item.source_ids, sources).length)
  return <div className="evidence-references">
    <p className="source-note">{fact.article_type === 'country_profile' ? 'Narrative references are supplied by the model and have not been independently checked. Data and visual provenance is listed separately.' : 'These references are supplied by the model. The application has not independently checked them.'}</p>
    {fact.article_type === 'country_profile' && <p className="source-note">Flag and map assets come from Flagpedia and Natural Earth. Country identity data uses a snapshot of mledoze/countries, retrieved 30 October 2026. <a href="/maps/country-data.json" download>Download the adapted country data</a> · <a href="/maps/COUNTRY_DATA_LICENSE.txt">ODbL licence</a>. Photographs retain their individual source and licence credits. Snapshot retrieval does not establish current accuracy.</p>}
    {claims.length > 0 && <>
      <h4>Claims and their sources</h4>
      <ul>{claims.map((item, index) => <li key={index} data-narration-content>
        <p>{item.claim}</p><SourceLinks sourceIds={item.source_ids} fact={fact} />
      </li>)}</ul>
    </>}
    {sources.length > 0 && <ul>{sources.map((source) => <li key={source.id} data-narration-content>
      {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a> : source.title}
      {(source.author || source.published_date) && <span> — {[source.author, source.published_date].filter((value) => typeof value === 'string' && value).join(', ')}</span>}
      {!source.url && <span> (link unavailable)</span>}
    </li>)}</ul>}
    {legacyReferences(fact).length > 0 && <ul>{legacyReferences(fact).map((text, index) => <li key={index} data-narration-content>
      {legacyReferenceParts(text).map((part, i) => part.url
        ? <span key={i}><a href={part.url} target="_blank" rel="noopener noreferrer">{part.label}</a>{part.suffix}</span>
        : <span key={i}>{part.text}</span>)}
    </li>)}</ul>}
  </div>
}

export function ImageStatus({ fact }) {
  const state = fact.image_generation
  if (!state || state.status === 'completed' || state.status === 'not_requested') return null
  return <p className="source-note" role="status">{state.status === 'processing'
    ? 'Illustrations are still being prepared.'
    : state.status === 'partial' ? 'Some illustrations could not be prepared.' : 'Illustrations could not be prepared.'}</p>
}
