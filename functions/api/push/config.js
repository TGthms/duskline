import {configured,json} from '../../_lib/push/common.js';
export function onRequestGet({env}) {return json({available:configured(env),publicKey:configured(env)?env.VAPID_PUBLIC_KEY:null,countries:['US'],maxPlaces:5,pollMinutes:1,retentionDays:90});}
