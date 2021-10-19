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

function Dome(rDome, hAngles, numSamples, offset = [0.0, 0.0, 0.0], extendedPanels = false)
{
	if (hAngles == null || hAngles.length == 0)
	{
		return [];
	}
	
	// Sample the angles radially:
	let angles = DivideInterval(0, Math.PI * 2, numSamples);
	
	let offsetX = offset[0], offsetY = offset[1], offsetZ = offset[2];
	var res = [];
	var currH = 0.0;
	var currR = rDome;
	for (let p in hAngles)
	{
		let requiredSegLen = 2 * Math.sin(Math.PI / numSamples) * currR;
		let scaleAtH = requiredSegLen / panelWidth;
		//console.log("r=" + r + " rAtHeight=" + rAtHeight +" arcLength=" + (rAtHeight * 2.0 * Math.PI / numSamples) + " requiredSegLen=" + requiredSegLen + " scale=" + scaleAtH);
		let zOffsetAtHeight = panelHeight * scaleAtH * 0.5 * Math.sin(hAngles[p]);
		let xyOffsetAtHeight = -(panelHeight * scaleAtH) * 0.5 * Math.cos(hAngles[p]);
		//console.log("z offset=" + zOffsetAtHeight);
		for (let t in angles)
		{
			let sphereX = Math.cos(angles[t]);
			let sphereY = Math.sin(angles[t]);
			
			let xOffsetAtHeight = xyOffsetAtHeight * Math.cos(angles[t]);
			let yOffsetAtHeight = xyOffsetAtHeight * Math.sin(angles[t]);
			//console.log("xy offset=(" + xOffsetAtHeight + "," + yOffsetAtHeight + ") test=" + (xOffsetAtHeight*xOffsetAtHeight+yOffsetAtHeight*yOffsetAtHeight));
			
			let x = currR * sphereX + offsetX + xOffsetAtHeight;
			let y = currR * sphereY + offsetY + yOffsetAtHeight;
			let z = currH + offsetZ + zOffsetAtHeight;
			
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
		currH += 2 * zOffsetAtHeight;
		currR += 2 * xyOffsetAtHeight;
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

function TankDataAsJSON(txt)
{
	// Try to load the JSON data first without and then with []:
	var jsonData = {};
	var elemsList = null;
	var loaded = false;
	try {
	  jsonData = JSON.parse(txt);
	  elemsList = jsonData["ext"];
	  return [jsonData, true];
	}
	catch(err) {
	}
	
	if (!loaded)
	{
		try {
		  jsonData = JSON.parse("[" + txt + "]");
		  if (jsonData.length > 0 && typeof jsonData[0] != 'object')
		  {
			  return [[], false];
		  }
		  return [jsonData, false];
		}
		catch(err) {
			return [[], false];
		}
	}
}

function StripPanels(jsonTxt, panelsToStrip)
{
	// Try to load the JSON data first without and then with []
	let parsedData = TankDataAsJSON(jsonTxt);
	let usedBlueprint = parsedData[1];
	let jsonData = parsedData[0];
	let elemsList = usedBlueprint ? jsonData["ext"] : jsonData;
	
	console.log("elemsList.length=" + elemsList.length);
	let newElemsList = elemsList.filter(x => !(x["CID"] == 1 &&  panelsToStrip.includes(x["REF"])));
	console.log("newElemsList.length=" + newElemsList.length);
	if (usedBlueprint)
	{
		jsonData["ext"] = newElemsList;
		return [jsonData, true];
	}
	else
	{
		return [newElemsList, false];
	}
}
