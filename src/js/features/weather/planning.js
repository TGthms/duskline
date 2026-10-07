'use strict';
/* Forecast planning uses model hours, never promises minute-level rain timing. */
(function (global) {
  const W=global.DusklineWeather;
  if (!W) return;
  function rainWindow(hourly,stamp,now) {
    const times=hourly.time || [],probabilities=hourly.precipitation_probability || [],amounts=hourly.precipitation || [];
    let start=null,end=null,peak=0,total=0,hasAmount=false;
    for(let i=0;i<times.length;i++) {
      const at=stamp(times[i]);
      if(!Number.isFinite(at) || at<now || at>=now+24*3600000) continue;
      const raw=probabilities[i],probability=raw == null || raw === '' ? NaN : Number(raw);
      if(!Number.isFinite(probability) || probability<40) {if(start != null) break;continue;}
      if(start == null) start=at;
      end=Math.min(at+3600000,now+24*3600000);peak=Math.max(peak,probability);
      if(amounts[i] != null && amounts[i] !== '' && Number.isFinite(Number(amounts[i]))) {total+=Number(amounts[i]);hasAmount=true;}
    }
    return start == null ? null : {start,end,peak,amount:hasAmount?total:null};
  }
  W.planning={rainWindow};
})(window);
