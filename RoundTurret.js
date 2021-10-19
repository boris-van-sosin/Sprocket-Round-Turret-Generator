function EulerToQuaternion(yaw, pitch, roll)
{
	let qx = Math.sin(roll/2) * Math.cos(pitch/2) * Math.cos(yaw/2) + Math.cos(roll/2) * Math.sin(pitch/2) * Math.sin(yaw/2);
	let qy = Math.cos(roll/2) * Math.sin(pitch/2) * Math.cos(yaw/2) - Math.sin(roll/2) * Math.cos(pitch/2) * Math.sin(yaw/2);
	let qz = Math.cos(roll/2) * Math.cos(pitch/2) * Math.sin(yaw/2) + Math.sin(roll/2) * Math.sin(pitch/2) * Math.cos(yaw/2);
	let qw = Math.cos(roll/2) * Math.cos(pitch/2) * Math.cos(yaw/2) - Math.sin(roll/2) * Math.sin(pitch/2) * Math.sin(yaw/2);
	return [qx, qy, qz, qw];
}

function AxisAngleToQuaternion(axis, angle)
{
	let qx = axis[0] * Math.sin(angle/2);
	let qy = axis[1] * Math.sin(angle/2);
	let qz = axis[2] * Math.sin(angle/2);
	let qw = Math.cos(angle/2);
	return [qx, qy, qz, qw];
}

function Cross(va, vb)
{
	return [va[1] * vb[2] - va[2] * vb[1], va[2] * vb[0] - va[0] * vb[2], va[0] * vb[1] - va[1] * vb[0]];
}

function Dot(va, vb)
{
	return va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2];
}

function Normalized(v)
{
	let norm = Math.sqrt(Dot(v,v));
	return [v[0] / norm, v[1] / norm, v[2] / norm];
}

function MatMult(Ma, Mb)
{
	var Mres = [[0,0,0] , [0,0,0] , [0,0,0]];
	
	for (let i = 0; i < 3; ++i)
	{
		for (let j = 0; j < 3; ++j)
		{
			for (let k = 0; k < 3; ++k)
			{
				Mres[i][j] += Ma[i][k] * Mb[k][j];
			}
		}
	}
	
	return Mres;
}

function Rx(t)
{
	return [[1, 0, 0],[0, Math.cos(t), -Math.sin(t)],[0, Math.sin(t), Math.cos(t)]];
}

function Ry(t)
{
	return [[Math.cos(t), 0, -Math.sin(t)],[0, 1, 0],[Math.sin(t), 0, Math.cos(t)]];
}

function Rz(t)
{
	return [[Math.cos(t), -Math.sin(t), 0],[Math.sin(t), Math.cos(t), 0],[0, 0, 1]];
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

const panelWidth = 0.4; // measured in-game
const panelHeight = 0.25;

function Dome(rDome, hFactor, hAngles, numSamples, offset = [0.0, 0.0, 0.0], extendedPanels = false)
{
	// Sample the angles radially:
	let angles = DivideInterval(0, Math.PI * 2, numSamples);
	
	// Compute the angle at which the radius is largest"
	var maxRAngle = 0.0;
	for (let p in hAngles)
	{
		if (Math.abs(hAngles[p] - (Math.PI / 2)) < Math.abs(maxRAngle - (Math.PI / 2)))
		{
			maxRAngle = hAngles[p];
		}
	}
	
	// Compute the radius of the sphere required to produce the dome radius:
	let rFactorAtMaxRHeight = Math.sin(maxRAngle);
	let r = rDome / rFactorAtMaxRHeight;
	
	// Compute Z offset at max dome radius:
	let globalZOffset = r * hFactor * Math.cos(maxRAngle);
	//console.log("global Z offset=" + globalZOffset);
	
	let offsetX = offset[0], offsetY = offset[1], offsetZ = offset[2] - globalZOffset;
	var res = [];
	for (let p in hAngles)
	{
		let rFactorAtHeight = Math.sin(hAngles[p]);
		let rAtHeight = r * rFactorAtHeight;
		let requiredSegLen = 2 * Math.sin(Math.PI / numSamples) * rAtHeight;
		let scaleAtH = requiredSegLen / panelWidth;
		//console.log("r=" + r + " rAtHeight=" + rAtHeight +" arcLength=" + (rAtHeight * 2.0 * Math.PI / numSamples) + " requiredSegLen=" + requiredSegLen + " scale=" + scaleAtH);
		let zOffsetAtHeight = panelHeight * scaleAtH * 0.5 * rFactorAtHeight;
		//console.log("z offset=" + zOffsetAtHeight);
		for (let t in angles)
		{
			let sphereX = Math.cos(angles[t]) * Math.sin(hAngles[p]);
			let sphereY = Math.sin(angles[t]) * Math.sin(hAngles[p]);
			let sphereZ = Math.cos(hAngles[p]);
			
			let xOffsetAtHeight = -(panelHeight * scaleAtH) * 0.5 * Math.cos(angles[t]) * Math.cos(hAngles[p]);;
			let yOffsetAtHeight = -(panelHeight * scaleAtH) * 0.5 * Math.sin(angles[t]) * Math.cos(hAngles[p]);;
			//console.log("xy offset=(" + xOffsetAtHeight + "," + yOffsetAtHeight + ") test=" + (xOffsetAtHeight*xOffsetAtHeight+yOffsetAtHeight*yOffsetAtHeight));
			
			let x = r * sphereX + offsetX + xOffsetAtHeight;
			let y = r * sphereY + offsetY + yOffsetAtHeight;
			let z = hFactor * r * sphereZ + offsetZ + zOffsetAtHeight;
			
			//let ptNormal = [sphereX,sphereY,sphereZ];
			//let rotAxis = Normalized(Cross(ptNormal, [0,0,1]));
			//let rotAngle = Math.acos(Dot(ptNormal,[0,0,1]) / Math.sqrt(Dot(ptNormal,ptNormal)));
			//console.log("Axis-angle = " + rotAxis + " " + rotAngle + " Q="+AxisAngleToQuaternion(rotAxis, rotAngle));
			
			if (!extendedPanels)
			{
				//was: res.push([[x,y,z],[0, Math.PI * 0.5 - angles[t], hAngles[p]], scaleAtH]);
				res.push([[x,y,z],[-hAngles[p], -angles[t], 0], scaleAtH]);
			}
			else
			{
				res.push([[x,y,z],[0, Math.PI * 0.5 - angles[t], Math.PI * 1.5 + hAngles[p]], scaleAtH]);
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
