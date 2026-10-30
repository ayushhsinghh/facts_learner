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
  if(credit?.provider==='unsplash') {
    const values=['url','source_url','license_url','author_url'].map(key=>safeSourceUrl(credit[key]))
    if(values.some(value=>!value)||!text(credit.author)||!text(credit.title)||!text(credit.description)||credit.license!=='Unsplash License')return null
    if(new URL(values[0]).hostname!=='images.unsplash.com'||values.slice(1).some(value=>new URL(value).hostname!=='unsplash.com'))return null
    if(new URL(values[2]).pathname!=='/license')return null
    return {...credit,url:values[0],source_url:values[1],license_url:values[2],author_url:values[3]}
  }
  if (!credit || !text(credit.author) || !text(credit.title) || !text(credit.description)
    || !/^(?:Public domain|CC0|CC BY(?:-SA)? [1-4]\.0)$/.test(credit.license)) return null
  const url = safeSourceUrl(credit.url), source = safeSourceUrl(credit.source_url), license = safeSourceUrl(credit.license_url)
  if (!url || !source || !license) return null
  if (!['upload.wikimedia.org','thumb.wikimedia.org'].includes(new URL(url).hostname) || new URL(source).hostname !== 'commons.wikimedia.org'
    || !['creativecommons.org','www.creativecommons.org'].includes(new URL(license).hostname)) return null
  return {...credit,url,source_url:source,license_url:license}
}
export function countryAsset(fact,key) {
  const url=safeSourceUrl(fact?.images?.[key]), credit=fact?.image_credits?.[key]
  if(!url||credit?.url!==url)return null
  if(fact.country_media?.version===2&&['cover','overview','how_it_works','explanation_2'].includes(key)&&credit.kind==='generated')
    return {url,credit,generated:true,alt:credit.description||'Generated country illustration',caption:credit.title||'Country illustration'}
  const photo=countryPhoto(credit)
  return photo?{url,credit:photo,generated:false,alt:photo.description,caption:photo.title}:null
}
export function countryGallery(fact) {
  const groups=fact?.country_photo_galleries||{}, seen=new Set(), result=[]
  const values=[...Object.values(groups).flatMap(v=>Array.isArray(v)?v:[]),...COUNTRY_PHOTO_KEYS.map(k=>fact?.image_credits?.[k])]
  for(const value of values){const photo=countryPhoto(value);if(!photo||seen.has(photo.source_url))continue;seen.add(photo.source_url);result.push({url:photo.url,credit:photo,alt:photo.description,caption:photo.title})}
  return result
}
export function countryScenes(fact) {
  return countryGallery(fact).filter(item=>item.credit.provider==='unsplash')
}
export function countrySubjectPhoto(fact,kind,index,subject) {
  const group=fact?.country_photo_galleries?.[`country_${kind}_${index}`]
  if(!Array.isArray(group))return null
  const photo=group.map(countryPhoto).find(item=>item&&item.provider!=='unsplash'&&item.subject_kind===kind&&item.subject===subject)
  return photo?{url:photo.url,credit:photo,alt:photo.description,caption:photo.title}:null
}
export function countryVisualCandidates(fact,purpose='cover') {
  if(fact?.article_type!=='country_profile')return []
  const keys=purpose==='overview'?['overview','cover']:['cover','overview']
  const seen=new Set()
  return [...keys.map(k=>countryAsset(fact,k)).filter(Boolean),...countryScenes(fact),...countryGallery(fact),
    {url:'/maps/country-fallback.svg',credit:{kind:'fallback'},alt:'World map artwork',caption:'World map artwork'}]
    .filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true})
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
