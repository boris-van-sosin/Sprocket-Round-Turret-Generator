function EulerToQuaternion(yaw, pitch, roll)
{
	let qx = Math.sin(roll/2) * Math.cos(pitch/2) * Math.cos(yaw/2) - Math.cos(roll/2) * Math.sin(pitch/2) * Math.sin(yaw/2);
	let qy = Math.cos(roll/2) * Math.sin(pitch/2) * Math.cos(yaw/2) + Math.sin(roll/2) * Math.cos(pitch/2) * Math.sin(yaw/2);
	let qz = Math.cos(roll/2) * Math.cos(pitch/2) * Math.sin(yaw/2) - Math.sin(roll/2) * Math.sin(pitch/2) * Math.cos(yaw/2);
	let qw = Math.cos(roll/2) * Math.cos(pitch/2) * Math.cos(yaw/2) + Math.sin(roll/2) * Math.sin(pitch/2) * Math.sin(yaw/2);
	return [qx, qy, qz, qw];
}

function DivideInterval(start, end, samples, inclusive = false)
{
	let interval = (end - start) / samples;
	var res = [];
	var curr = start;
	let samplesFixed = inclusive ? samples + 1 : samples;
	for (let i = 0; i < samplesFixed; i++)
	{
		res.push(curr);
		curr += interval;
	}
	return res;
}

function Dome(r, hFactor, hAngles, numSamples, offset = [0.0, 0.0, 0.0])
{
	let angles = DivideInterval(0, Math.PI * 2, numSamples);
	let offsetX = offset[0], offsetY = offset[1], offsetZ = offset[2];
	var res = [];
	for (let p in hAngles) {
		for (let t in angles) {
			let roll  = Math.cos(t) * Math.cos(p);
			let yaw   = Math.sin(t) * Math.cos(p);
			let pitch = Math.sin(p);
			let x = r * roll + offsetX;
			let y = r * yaw + offsetY;
			let z = hFactor * pitch + offsetZ;
			res.push([[x,y,z],[yaw,pitch,roll]]);
		}
	}
	
	return res;
}
