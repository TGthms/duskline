import {senderConfigured,preferences,places} from '../../../functions/_lib/push/common.js';
import {claim,finish} from '../../../functions/_lib/push/store.js';
import {sendPush} from '../../../functions/_lib/push/transport.js';
import {fetchAlerts,deliveryKey,eligible,payload} from '../../../functions/_lib/push/alerts.js';
import {migrateLegacy} from '../../../functions/_lib/push/migrate.js';
// Independent delivery leases and stable notification tags bound crash retries.
export async function poll(env,{now=Date.now(),fetcher=fetch,sender=sendPush}={}){
  if(!senderConfigured(env))throw new Error('push_not_configured');
  const db=env.PUSH_DB,run=await db.prepare(`INSERT INTO push_scheduler(name,cursor,lease_until) VALUES ('poll','',?) ON CONFLICT(name) DO UPDATE SET lease_until=excluded.lease_until WHERE lease_until<=? RETURNING cursor`).bind(now+120000,now).first();
  if(!run)return {busy:true};let cursor=run.cursor,count=0,failures=0;const grids=new Map(),started=Date.now();
  try{await migrateLegacy(env,now);let rows=(await db.prepare('SELECT * FROM push_subscriptions WHERE id>? AND expires_at>? ORDER BY id LIMIT 50').bind(cursor,now).all()).results;
    if(!rows.length&&cursor){cursor='';rows=(await db.prepare('SELECT * FROM push_subscriptions WHERE expires_at>? ORDER BY id LIMIT 50').bind(now).all()).results;}
    for(const row of rows){if(Date.now()-started>40000)break;let error='';
      try{const prefs=preferences(JSON.parse(row.preferences_json)),locations=places(JSON.parse(row.locations_json));let dead=false;
        for(const place of locations){if(Date.now()-started>40000)break;const point=place.lat+','+place.lon;if(!grids.has(point))grids.set(point,fetchAlerts(place,fetcher,now));
          const alerts=await grids.get(point);
          for(const alert of alerts){if(Date.now()-started>40000)break;if(!eligible(alert,prefs,now))continue;const key=await deliveryKey(alert,place,prefs),lease=await claim(db,row.id,key,'alert',Date.now());if(!lease)continue;
            try{const ttl=Math.floor((alert.expires-Date.now())/1000);if(ttl<=0)continue;
              const status=await sender({endpoint:row.endpoint,keys:JSON.parse(row.keys_json)},payload(alert,place,key),env,{ttl,urgency:alert.urgency==='Immediate'?'high':'normal',fetcher});
              if(status===410||status===404){await db.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(row.id).run();dead=true;break;}
              const accepted=status>=200&&status<300;await finish(db,row.id,key,accepted?'accepted':'failed',accepted?'':'push_'+status,lease.attempts);if(!accepted)error='push_'+status;
            }catch{await finish(db,row.id,key,'failed','transport_error',lease.attempts);error='transport_error';}}
          if(dead)break;}
      }catch(e){error=/^nws_\d+$|^nws_invalid$/.test(e.message)?e.message:'check_failed';}
      if(error){failures++;console.warn('push_subscription_check_failed',{code:error});}
      if(!row.last_checked_at || now-row.last_checked_at>=300000 || (row.last_error||'')!==error)
        await db.prepare('UPDATE push_subscriptions SET last_checked_at=?,last_error=? WHERE id=?').bind(Date.now(),error||null,row.id).run();cursor=row.id;count++;}
    await db.batch([db.prepare('DELETE FROM push_subscriptions WHERE expires_at<=?').bind(now),db.prepare('DELETE FROM push_deliveries WHERE created_at<?').bind(now-7*86400000),db.prepare('DELETE FROM push_limits WHERE expires_at<?').bind(now)]);
  }finally{await db.prepare("UPDATE push_scheduler SET cursor=?,lease_until=0 WHERE name='poll'").bind(cursor).run();}
  console.log('push_poll_complete',{checked:count,failures});return {checked:count,failures};
}
