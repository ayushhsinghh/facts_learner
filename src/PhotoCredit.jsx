import { useEffect, useId, useRef, useState } from 'react'
import { countryPhoto } from './country.js'
import './photoCredit.css'

export default function PhotoCredit({ credit }) {
  const id=useId(),root=useRef(null),panel=useRef(null),trigger=useRef(null),timer=useRef(null),pinned=useRef(false),[open,setOpen]=useState(false)
  const native=typeof HTMLElement!=='undefined'&&'showPopover' in HTMLElement.prototype
  const generated=credit?.kind==='generated',fallback=credit?.kind==='fallback',flag=credit?.kind==='flag',item=countryPhoto(credit)
  const clear=()=>{clearTimeout(timer.current)}
  const place=()=>{
    if(!panel.current||!trigger.current)return
    const anchor=trigger.current.getBoundingClientRect(),box=panel.current.getBoundingClientRect(),gap=8,edge=16
    if(anchor.bottom<0||anchor.top>innerHeight){if(native&&panel.current.matches(':popover-open'))panel.current.hidePopover();pinned.current=false;setOpen(false);return}
    const left=Math.max(edge,Math.min(innerWidth-box.width-edge,anchor.right-box.width))
    const top=anchor.top-box.height-gap>=edge?anchor.top-box.height-gap:Math.max(edge,Math.min(innerHeight-box.height-edge,anchor.bottom+gap))
    panel.current.style.left=`${left}px`;panel.current.style.top=`${top}px`
  }
  const show=()=>{
    clear()
    if(native&&!panel.current.matches(':popover-open'))panel.current.showPopover()
    setOpen(true);if(native)place()
  }
  const hide=()=>{
    clear();pinned.current=false
    if(native&&panel.current?.matches(':popover-open'))panel.current.hidePopover()
    setOpen(false)
  }
  const leave=()=>{
    clear();timer.current=setTimeout(()=>{
      if(!pinned.current&&!root.current?.matches(':focus-within')&&!panel.current?.matches(':hover'))hide()
    },160)
  }
  useEffect(()=>()=>clearTimeout(timer.current),[])
  useEffect(()=>{
    if(!open)return
    place()
    window.addEventListener('resize',place)
    window.addEventListener('scroll',place,true)
    return ()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true)}
  },[open])
  if(!generated&&!fallback&&!flag&&!item)return null
  return <span className="photo-credit" ref={root}
    onPointerEnter={event=>{if(event.pointerType==='mouse')show()}} onPointerLeave={leave}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))hide()}}>
    <button className="photo-credit-trigger" type="button" ref={trigger} aria-label={generated?'Image credits: AI illustration':'Image credits'} aria-expanded={open} aria-controls={id}
      popoverTarget={native?id:undefined} popoverTargetAction="show"
      onClick={event=>{if(pinned.current&&open){event.preventDefault();hide()}else{pinned.current=true;show()}}}>
      {generated&&<span className="photo-credit-ai">AI</span>}
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 7.5v.5"/></svg>
    </button>
    <span id={id} ref={panel} className={`photo-credit-panel${native?'':' is-fallback'}`} popover={native?'auto':undefined} hidden={!native&&!open} role="group" aria-label="Image credits"
      onToggle={event=>{const visible=event.currentTarget.matches(':popover-open');setOpen(visible);if(!visible)pinned.current=false}}
      onPointerEnter={clear} onPointerLeave={leave}>
      <span className="photo-credit-panel-heading"><strong>Image credits</strong><button type="button" className="photo-credit-close" aria-label="Close image credits" onClick={()=>{hide();trigger.current?.focus({preventScroll:true})}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></span>
      {generated?<span>AI-generated illustration · Not a documentary photograph</span>:fallback?<span>World map artwork · Natural Earth</span>:flag?<span>Flag image · <a href="https://flagpedia.net/" target="_blank" rel="noopener noreferrer">Flagpedia</a> / FlagCDN</span>:item.provider==='unsplash'?<span>Photo by <a href={item.author_url} target="_blank" rel="noopener noreferrer">{item.author}</a> on <a href={item.source_url} target="_blank" rel="noopener noreferrer">Unsplash</a><br/><a href={item.license_url} target="_blank" rel="noopener noreferrer">Unsplash License</a></span>:<span>Image by {item.author}<br/><a href={item.source_url} target="_blank" rel="noopener noreferrer">Original image</a> · <a href={item.license_url} target="_blank" rel="noopener noreferrer">{item.license}</a></span>}
    </span>
  </span>
}
