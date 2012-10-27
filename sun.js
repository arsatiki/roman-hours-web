__EXACT_EPOCH = 2451545.009;
var __TAU = 2 * Math.PI;

function dsin(d) { return Math.sin(__TAU * d / 360);}
function dcos(d) { return Math.cos(__TAU * d / 360);}


function julian(u) {
	return u / 86400000 + 2440587.5;
}

function timestamp(j) {
	return (j - 2440587.5) * 86400000;
}

function compute_period(latitude, longitude) {
	var now = Date.now();
	var today = Math.round(julian(now) - __EXACT_EPOCH + longitude / 360);
	var cycle;
	var start, end;
	
	cycle = crossings(today, latitude, longitude);

	if (now < cycle.rise) {
		end = cycle.rise;
		cycle = crossings(today - 1,  latitude, longitude);
		start = cycle.set;
	} else if (now < cycle.set) {
		start = cycle.rise;
		end = cycle.set;
	} else {
		start = cycle.set;
		cycle = crossings(today + 1, latitude, longitude);
		end = cycle.rise;
	}
	return {start: start, duration: end - start}
}

function crossings(t, lat, lon) {
	var noon = t + __EXACT_EPOCH - lon / 360;
	var M = (357.5291 + 0.98560028 * (noon - 2451545)) % 360;
	var C = 1.9148 * dsin(M) + 0.0200 * dsin(2*M) + 0.0003 * dsin(3*M);
	var l = (M + 102.9372 + C + 180) % 360;
	
	var transit = noon + 0.0053 * dsin(M) - 0.0069 * dsin(2*l);
	
	var d = Math.asin(dsin(l) * dsin(23.45));
	var num = dsin(-0.83) - dsin(lat) * Math.sin(d);
	var den = dcos(lat) * Math.cos(d);
	var w = Math.acos(num/den);
	
	return {rise: timestamp(transit - w / __TAU), 
		set: timestamp(transit + w / __TAU)};
}