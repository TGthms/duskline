'use strict';
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

function classify(files,{event='pull_request',forceFull=false}={}) {
  const shared=files.some(file=>/^(src\/js\/core\/|src\/js\/(boot|app|sw-register|duskline-controls)\.js$|src\/js\/features\/weather\/(app|navigation|modal|haptics|shell)\.js$|sw\.js$|playwright\.config\.js$|\.github\/workflows\/|tools\/test-scope\.js$)/.test(file));
  const surface=files.some(file=>/^(src\/css\/|index\.html$|assets\/(?:fonts|icons|duskline)|e2e\/visual)/.test(file));
  const ui=surface || files.some(file=>/^src\/js\/features\/weather\/(product|primary-alerts|charts|forecast-sheet|sky|map|alerts|aqi)\.js$/.test(file));
  const locale=files.some(file=>/^src\/js\/data\/(?:weather-|i18n|duskline-locales|legal)/.test(file));
  const runtime=forceFull || files.some(file=>/^(functions\/(?:_lib\/push\/|api\/push\/)|workers\/alert-poller\/|src\/js\/features\/weather\/push-notifications\.js$|package(?:-lock)?\.json$|_routes\.json$|tools\/check-push-runtime\.js$)/.test(file));
  const browser=forceFull || runtime || shared || ui || locale || files.some(file=>/^(src\/js\/|e2e\/|functions\/api\/international-alerts\.js$|manifest\.webmanifest$|_headers$|_redirects$|_routes\.json$|tools\/static-server\.js$)/.test(file));
  const full=forceFull || shared || event==='push';
  const patterns=['@core'];
  if(files.some(file=>/\/map\.js$/.test(file))) patterns.push('map|geograph|bounds|raster|atlas');
  if(files.some(file=>/\/(data|aqi|aqi-math|charts|forecast-sheet|planning|product|primary-alerts|city-refresh|snapshots)\.js$/.test(file))) patterns.push('forecast|AQI|air quality|air-quality|NWS|weather|primary|hourly|rain|precipitation');
  if(runtime) patterns.push('notification|push');
  if(files.some(file=>/alerts\.js$/.test(file))) patterns.push('alert|warning|CAP|NWS');
  if(locale) patterns.push('language|locale|French|Chinese|greeting|RTL|translations');
  const changedTests=files.some(file=>/^e2e\/.+\.spec\.js$/.test(file));
  return {full,browser,runtime,visual:forceFull || shared || ui,localeSweep:full || locale,
    grep:full || surface || changedTests?'.':patterns.join('|')};
}

if(require.main===module) {
  const event=process.env.GITHUB_EVENT_NAME || 'pull_request';
  let payload={},files=[],forceFull=event==='workflow_dispatch';
  try {
    if(process.env.GITHUB_EVENT_PATH) payload=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
    const base=payload.pull_request?.base?.sha || payload.before || 'HEAD^';
    if(/^0+$/.test(base)) forceFull=true;
    else files=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  } catch(error) {forceFull=true;}
  const scope=classify(files,{event,forceFull});
  if(process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,Object.entries(scope).map(([key,value])=>key+'='+value).join('\n')+'\n');
  process.stdout.write(JSON.stringify({files,...scope},null,2)+'\n');
}
module.exports={classify};
