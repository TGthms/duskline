'use strict';
// Frozen pre-optimization CPU kernel from 181a697; benchmark only, never shipped to the app.
function selectedDataValue(point, layer, index) {
  if (!point || !point.hourly) return null;
  var key = layer === 'temperature' ? 'temperature_2m'
    : layer === 'precipitation' ? 'precipitation_probability' : 'wind_speed_10m';
  var series = point.hourly[key] || [];
  var value = series[index];
  return value == null || !Number.isFinite(Number(value)) ? null : Number(value);
}

function palette(layer, value) {
  if (!Number.isFinite(value)) return [0, 0, 0, 0];
  var stops;
  if (layer === 'temperature') {
    stops = [[-20, [64, 98, 202, 185]], [-5, [56, 156, 221, 190]], [8, [76, 202, 201, 188]],
      [18, [173, 222, 113, 194]], [28, [255, 199, 70, 202]], [40, [235, 86, 68, 210]]];
  } else if (layer === 'precipitation') {
    if (value < 8) return [0, 0, 0, 0];
    stops = [[8, [109, 203, 255, 72]], [25, [50, 176, 241, 120]], [50, [63, 122, 232, 165]],
      [75, [91, 83, 207, 190]], [100, [153, 78, 214, 210]]];
  } else {
    if (value < 2) return [0, 0, 0, 0];
    stops = [[2, [73, 176, 217, 75]], [6, [79, 205, 183, 130]], [12, [190, 218, 97, 175]],
      [18, [255, 167, 72, 198]], [26, [228, 80, 95, 214]]];
  }
  if (value <= stops[0][0]) return stops[0][1];
  if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (var i = 0; i < stops.length - 1; i++) {
    var left = stops[i], right = stops[i + 1];
    if (value < left[0] || value > right[0]) continue;
    var mix = (value - left[0]) / (right[0] - left[0]);
    return left[1].map(function (channel, channelIndex) {
      return Math.round(channel + (right[1][channelIndex] - channel) * mix);
    });
  }
  return [0, 0, 0, 0];
}

function interpolatedValue(grid, x, y, layer, hourIndex) {
  var weighted = 0;
  var weightSum = 0;
  for (var i = 0; i < grid.geometry.points.length; i++) {
    var point = grid.geometry.points[i];
    var value = selectedDataValue(point, layer, hourIndex);
    if (value == null) continue;
    var dx = x - point.x;
    var dy = y - point.y;
    var distance = dx * dx + dy * dy;
    if (distance < 0.00001) return value;
    var weight = 1 / (distance * distance);
    weighted += value * weight;
    weightSum += weight;
  }
  return weightSum > 0 ? weighted / weightSum : null;
}
function renderPixels(grid,layer,hour,width,height,target) {
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const color=palette(layer,interpolatedValue(grid,x/(width-1),y/(height-1),layer,hour));
    target.set(color,(y*width+x)*4);
  }
  return target;
}
module.exports={renderPixels};
