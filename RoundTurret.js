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

function Dome(r, hFactor, hAngles, numSamples, offset = [0.0, 0.0, 0.0], extendedPanels = false)
{
	let angles = DivideInterval(0, Math.PI * 2, numSamples);
	let offsetX = offset[0], offsetY = offset[1], offsetZ = offset[2];
	var res = [];
	for (let p in hAngles) {
		let rFactorAtHeight = Math.sin(hAngles[p]);
		for (let t in angles) {
			let sphereX = Math.cos(angles[t]) * Math.sin(hAngles[p]);
			let sphereY = Math.sin(angles[t]) * Math.sin(hAngles[p]);
			let sphereZ = Math.cos(hAngles[p]);
			let x = r * sphereX + offsetX;
			let y = r * sphereY + offsetY;
			let z = hFactor * r * sphereZ + offsetZ;
			if (!extendedPanels)
			{
				res.push([[x,y,z],[0, Math.PI * 0.5 - angles[t], hAngles[p]], rFactorAtHeight]);
			}
			else
			{
				res.push([[x,y,z],[0, Math.PI * 0.5 - angles[t], Math.PI * 1.5 + hAngles[p]], rFactorAtHeight]);
			}
		}
	}
	
	return res;
}

function ConvertToSprocketOne(xyz, eulers, scale = 1.0, structElem = "0049b3cd2772cfb43917eb41078e1d01")
{
	let x = xyz[0], y = xyz[1], z = xyz[2];
	let quaternion = EulerToQuaternion(eulers[0], eulers[1], eulers[2]);
	let res = { "T":[x, z, y, quaternion[0], quaternion[1], quaternion[2], quaternion[3], scale, 0.0], "REF": structElem, "CID": 1, "DAT": [] };
	return res;
}

function ConvertToSprocketAll(comps, scale = 1.0, structElem = "0049b3cd2772cfb43917eb41078e1d01")
{
	var res = [];
	for (let i in comps)
	{
		let curr = ConvertToSprocketOne(comps[i][0], comps[i][1], scale * comps[i][2], structElem);
		res.push(curr);
	}
	return res;
}
