import {hash} from './common.js';
const ranks={extreme:3,severe:2,moderate:1,minor:0,unknown:0};
export function category(event){
  if(/tornado|thunderstorm|hurricane|tropical|typhoon|storm surge/i.test(event))return 'storm';
  if(/flood|tsunami/i.test(event))return 'flood';
  if(/snow|blizzard|ice|freez|winter|wind chill|cold/i.test(event))return 'winter';
  if(/heat|hot/i.test(event))return 'heat';if(/wind|gale/i.test(event))return 'wind';return 'other';
}
export function quietNow(quiet,now=Date.now()){
  if(!quiet.enabled||quiet.start===quiet.end)return false;
  const p=new Intl.DateTimeFormat('en-GB',{timeZone:quiet.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const time=p.find(x=>x.type==='hour').value+':'+p.find(x=>x.type==='minute').value;
  return quiet.start<quiet.end?time>=quiet.start&&time<quiet.end:time>=quiet.start||time<quiet.end;
}
export function normalizeAlert(feature,now=Date.now()){
  const p=feature?.properties||{},id=p.id||feature?.id,expires=Date.parse(p.ends||p.expires);
  if(!id||p.status!=='Actual'||!['Alert','Update'].includes(p.messageType)||!Number.isFinite(expires)||expires<=now||Date.parse(p.effective||p.sent)>now)return null;
  const vtec=p.parameters?.VTEC?.[0]?.match(/\/[OTEX]\.\w+\.([A-Z0-9]+)\.([A-Z]+)\.([A-Z])\.(\d+)\./);
  const incident=vtec?[new Date(p.sent||now).getUTCFullYear(),...vtec.slice(1)].join(':'):p.references?.[0]?.identifier||id;
  return {id,incident,event:String(p.event||'Weather alert'),severity:String(p.severity||'Unknown').toLowerCase(),urgency:p.urgency||'',certainty:p.certainty||'',headline:String(p.headline||p.event||'').replace(/\s+/g,' ').trim(),instruction:String(p.instruction||'').replace(/\s+/g,' ').trim(),expires};
}
export async function deliveryKey(alert,place,prefs){
  const content=prefs.updates?[alert.event,alert.severity,alert.urgency,alert.certainty,alert.headline,alert.instruction].join('|'):'initial';
  return hash([place.lat,place.lon,alert.incident,content].join('|'));
}
export function eligible(alert,prefs,now=Date.now()){
  return ranks[alert.severity]>=ranks[prefs.severity]&&(prefs.categories.includes('all')||prefs.categories.includes(category(alert.event)))&&(!quietNow(prefs.quiet,now)||alert.severity==='extreme'&&prefs.quiet.overrideExtreme);
}
export async function fetchAlerts(place,fetcher=fetch,now=Date.now()){
  const url=new URL('https://api.weather.gov/alerts/active');url.searchParams.set('point',place.lat.toFixed(2)+','+place.lon.toFixed(2));url.searchParams.set('status','actual');url.searchParams.set('message_type','alert,update');
  const res=await fetcher(url,{headers:{Accept:'application/geo+json','User-Agent':'duskline-alerts/2.0 (https://dusklineweather.pages.dev)'},signal:AbortSignal.timeout(8000)});
  if(!res.ok){await res.body?.cancel();throw new Error('nws_'+res.status);}
  const data=await res.json();if(!Array.isArray(data.features))throw new Error('nws_invalid');return data.features.map(f=>normalizeAlert(f,now)).filter(Boolean);
}
export function payload(alert,place,key){
  const url=new URL('https://dusklineweather.pages.dev/');for(const field of ['lat','lon','name','tz','country_code'])url.searchParams.set(field,place[field]);url.searchParams.set('alert',alert.id);
  return {title:place.name+' · '+alert.event,body:alert.headline.slice(0,240),tag:'duskline-'+key,data:{url:'.'+url.pathname+url.search,alertId:alert.id,expiresAt:alert.expires,location:place.name}};
}
