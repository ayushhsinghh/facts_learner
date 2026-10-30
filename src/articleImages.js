const slots = ['overview', 'how_it_works', 'explanation_2', 'explanation_3', 'myth_visual', 'truth_visual']
const defaultPlacement = { overview:'overview', how_it_works:'explanation', explanation_2:'example', explanation_3:'limits', myth_visual:'explanation', truth_visual:'explanation' }

export function overviewImage(fact) {
  const images = fact?.images || {}
  return images.overview || images.history || images.myth_visual || images.cover || null
}

export function articleImages(fact, { slot, placement } = {}) {
  const details = Array.isArray(fact?.image_details) ? fact.image_details : []
  const legacy = ['physics_lesson','biology_lesson','psychology_lesson','constitution_lesson'].map(key => fact?.[key]?.supporting_image).find(Boolean)
  return slots.flatMap(key => {
    const url = fact?.images?.[key] || (key === 'overview' ? fact?.images?.history : null)
    if (!url || (slot && slot !== key)) return []
    const item = details.find(item => item?.slot === key) || (legacy?.slot === key ? legacy : {})
    const position = item.placement || defaultPlacement[key]
    if (placement && placement !== position) return []
    return [{slot:key,url,placement:position,alt:item.alt || `${fact.topic || 'Article'}: ${key === 'overview' ? 'overview' : 'explanatory illustration'}`,caption:item.caption || ''}]
  })
}
