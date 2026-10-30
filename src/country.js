import { safeSourceUrl } from './evidence.js'
export const COUNTRY_PHOTO_KEYS = ['cover','overview','how_it_works','explanation_2','explanation_3','explanation_4','explanation_5','explanation_6']
const text = v => typeof v === 'string' && v.trim().length > 0
const texts = v => Array.isArray(v) && v.every(text)
const entries = (v, keys) => Array.isArray(v) && v.every(x => x && keys.every(k => text(x[k])))
export function hasCountryProfile(fact) {
  const p = fact?.country_profile, i = p?.identity
  return Boolean(fact?.category === 'country' && fact.schema_version === '2.0' && fact.article_type === 'country_profile'
    && /^[A-Z]{2}$/.test(i?.iso2) && text(i?.name) && text(i?.official_name) && texts(i.local_names)
    && texts(i.capitals) && texts(i.official_languages) && texts(i.neighbour_names)
    && entries(i.currencies,['name','code']) && Array.isArray(i.coordinates) && i.coordinates.length === 2
    && i.coordinates.every(Number.isFinite) && Math.abs(i.coordinates[0]) <= 90 && Math.abs(i.coordinates[1]) <= 180
    && text(p.introduction?.central_idea) && text(p.introduction?.surprising_fact) && texts(p.introduction.learning_goals)
    && text(p.geography?.location_explanation) && texts(p.geography.seas) && texts(p.geography.landscapes) && entries(p.geography.major_cities,['name','significance'])
    && p.essentials?.population && text(p.essentials.population.scope) && text(p.essentials.time_zones?.explanation)
    && entries(p.essentials.spoken_languages,['name','role','explanation']) && text(p.flag?.description) && text(p.flag.symbolism)
    && ['everyday_life','global_contributions','products_and_industries','surprising_facts'].every(k=>entries(p[k],['title','explanation','why_it_matters']))
    && entries(p.history_milestones,['date_label','event','significance']) && entries(p.notable_places,['name','kind','location','explanation','why_it_matters'])
    && entries(p.notable_people,['name','field','connection','contribution','context'])
    && entries(p.common_misunderstandings,['misunderstanding','explanation']) && entries(p.knowledge_checks,['question','answer','explanation'])
    && texts(p.takeaways) && texts(p.curiosity_questions) && texts(p.related_topics))
}
export function countryPhoto(credit) {
  if (!credit || !text(credit.author) || !text(credit.title) || !text(credit.description)
    || !/^(?:Public domain|CC0|CC BY(?:-SA)? [1-4]\.0)$/.test(credit.license)) return null
  const url = safeSourceUrl(credit.url), source = safeSourceUrl(credit.source_url), license = safeSourceUrl(credit.license_url)
  if (!url || !source || !license) return null
  if (!['upload.wikimedia.org','thumb.wikimedia.org'].includes(new URL(url).hostname) || new URL(source).hostname !== 'commons.wikimedia.org'
    || !['creativecommons.org','www.creativecommons.org'].includes(new URL(license).hostname)) return null
  return {...credit,url,source_url:source,license_url:license}
}
export function displayCountryStat(stat) {
  return typeof stat?.value === 'number' && Number.isFinite(stat.value) && stat.value > 0 && Number.isInteger(stat.year)
    ? `${new Intl.NumberFormat('en',{maximumFractionDigits:0}).format(stat.value)} (${stat.year})` : 'Not supplied'
}
const wrap = lon => ((lon + 180) % 360 + 360) % 360 - 180
export function mapPoint(lon, lat, center = 0) { return [wrap(lon-center)+180,90-lat] }
export function mapPath(geometry, center=0) {
  const polygons = geometry?.type === 'MultiPolygon' ? geometry.coordinates : geometry?.type === 'Polygon' ? [geometry.coordinates] : []
  return polygons.flatMap(polygon=>polygon.map(ring=>{
    let previous=null
    const points=ring.map(([lon,lat])=>{
      let [x,y]=mapPoint(lon,lat,center)
      if(previous!==null){while(x-previous>180)x-=360;while(x-previous < -180)x+=360}
      previous=x;return [x,y]
    })
    // Close continuous polygons, then repeat across the seam. SVG clips the copies to the view.
    // Breaking a filled ring with M would close it diagonally and cut wedges through Russia/Fiji.
    return [-360,0,360].map(shift=>points.map(([x,y],n)=>`${n===0?'M':'L'}${(x+shift).toFixed(2)},${y.toFixed(2)}`).join(' ')+'Z').join(' ')
  })).join(' ')
}
