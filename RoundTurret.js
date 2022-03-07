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

function QuaternionMult(q1, q2)
{
	let qx = q1[0]*q2[3] + q1[1]*q2[2] - q1[2]*q2[1] + q1[3]*q2[0];
	let qy = -q1[0]*q2[2] + q1[1]*q2[3] + q1[2]*q2[0] + q1[3]*q2[1];
	let qz = q1[0]*q2[1] - q1[1]*q2[0] + q1[2]*q2[3] + q1[3]*q2[2];
	let qw = -q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2] + q1[3]*q2[3];
	return [qx, qy, qz, qw];
}

function QuaternionInv(q)
{
	let invNorm = 1.0 / (q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
	return [-q[0]*invNorm, -q[1]*invNorm, -q[2]*invNorm, q[3]*invNorm];
}

function RotateByQuaternion(q, v)
{
	return QuaternionMult(q, QuaternionMult([v[0], v[1], v[2], 1], QuaternionInv(q)));
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
	if (norm > 1e-5)
	{
		return [v[0] / norm, v[1] / norm, v[2] / norm];
	}
	else
	{
		return [0, 0, 0];
	}
}

function AxisAngleFromTo(v1, v2)
{
	let v1N = Normalized(v1);
	let v2N = Normalized(v2);
	let axis = Cross(v1N, v2N);
	let angle = Math.acos(Dot(v1N, v2N));
	return [axis, angle];
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

//const panelWidth = 0.4; // measured in-game
//const panelHeight = 0.25;

function Dome(rDome, hAngles, numSamples, panelSz, from = 0, to = 2*Math.PI, orientationVariant = 0)
{
	if (hAngles == null || hAngles.length == 0)
	{
		return [];
	}
	
	let panelWidth = panelSz[0], panelHeight = panelSz[1];
	
	// Sample the angles radially:
	let angles = DivideInterval(from, to, numSamples, Math.abs(Math.abs(to-from) - Math.PI*2) > 1e-5);
	
	var res = [];
	var currH = 0.0;
	var currR = rDome;
	for (let p in hAngles)
	{
		let requiredSegLen = 2 * Math.sin(Math.PI / numSamples) * currR;
		let scaleAtH = requiredSegLen / panelWidth;
		//console.log("r=" + rDome + " currR=" + currR +" arcLength=" + (currR * 2.0 * Math.PI / numSamples) + " requiredSegLen=" + requiredSegLen + " scale=" + scaleAtH);
		let zOffsetAtHeight = panelHeight * scaleAtH * 0.5 * Math.sin(hAngles[p]);
		let xyOffsetAtHeight = -(panelHeight * scaleAtH) * 0.5 * Math.cos(hAngles[p]);
		let scaledDepth = panelSz[2] * scaleAtH;
		//console.log("z offset=" + zOffsetAtHeight);
		for (let t in angles)
		{
			let sphereX = Math.cos(angles[t]);
			let sphereY = Math.sin(angles[t]);
			
			let xOffsetAtHeight = xyOffsetAtHeight * Math.cos(angles[t]);
			let yOffsetAtHeight = xyOffsetAtHeight * Math.sin(angles[t]);
			//console.log("xy offset=(" + xOffsetAtHeight + "," + yOffsetAtHeight + ") test=" + (xOffsetAtHeight*xOffsetAtHeight+yOffsetAtHeight*yOffsetAtHeight));
			
			let x = currR * sphereX + xOffsetAtHeight;
			let y = currR * sphereY + yOffsetAtHeight;
			let z = currH + zOffsetAtHeight;
			
			var q = EulerToQuaternion(0, 0, 0);
			var rotatedOffsetX = 0, rotatedOffsetY = 0, rotatedOffsetZ = 0;
			if (orientationVariant == 0 || (![0,1,2,3].includes(orientationVariant)))
			{
				q = EulerToQuaternion(-hAngles[p], -angles[t], 0);
			}
			else if (orientationVariant == 1)
			{
				let q1 = EulerToQuaternion(Math.PI * 0.5 - angles[t], 0, -Math.PI * 0.5);
				let q2 = EulerToQuaternion(0, 0, hAngles[p] + Math.PI * 0.0);
				q = QuaternionMult(q1, q2);
				let rotatedOffset = RotateByQuaternion(q, [0, 0, -scaledDepth]);
				//console.log([0,0,1], " -> ", RotateByQuaternion(q,[0,0,1]));
				rotatedOffsetX = rotatedOffset[0];
				rotatedOffsetY = rotatedOffset[2];
				rotatedOffsetZ = rotatedOffset[1];
			}
			else if (orientationVariant == 2)
			{
				let q1 = EulerToQuaternion(0, Math.PI * 0.5 - angles[t], 0);
				let q2 = EulerToQuaternion(0, 0, Math.PI * 0.5 - hAngles[p]);
				q = QuaternionMult(q1, q2);
				let rotatedOffset = RotateByQuaternion(q, [0, 0, -scaledDepth]);
				//console.log([0,0,-scaledDepth], " -> ", RotateByQuaternion(q,[0,0,-scaledDepth]));
				rotatedOffsetX = rotatedOffset[0];
				rotatedOffsetY = rotatedOffset[2];
				rotatedOffsetZ = rotatedOffset[1];
			}
			else if (orientationVariant == 3)
			{
				let q1 = EulerToQuaternion(0, Math.PI * 1.5 - angles[t], 0);
				let q2 = EulerToQuaternion(0, 0, Math.PI * 0.5 - hAngles[p]);
				q = QuaternionMult(q1, q2);
				let rotatedOffset = RotateByQuaternion(q, [0, 0, -scaledDepth]);
				//console.log([0,0,-scaledDepth], " -> ", RotateByQuaternion(q,[0,0,-scaledDepth]));
				rotatedOffsetX = rotatedOffset[0];
				rotatedOffsetY = rotatedOffset[2];
				rotatedOffsetZ = rotatedOffset[1];
			}
			
			res.push([[x + rotatedOffsetX, y + rotatedOffsetY, z + rotatedOffsetZ], q, scaleAtH]);
		}
		currH += 2 * zOffsetAtHeight;
		currR += 2 * xyOffsetAtHeight;
	}
	
	return res;
}

function ConvertToSprocketOne(xyz, baseQuaternion, offset = [0, 0, 0], axis = [0, 0, 1], cid = 1, scale = 1.0, structElem = "0049b3cd2772cfb43917eb41078e1d01")
{
	// Start flipping y and z here.
	var axisAngle;
	//console.log(axis);
	if (!(Math.abs(axis[0]) < 1e-5 && Math.abs(axis[1]) < 1e-5 && Math.abs(axis[2] + 1) < 1e-5))
	{
		axisAngle =  AxisAngleFromTo([0, 1, 0], [axis[0], axis[2], axis[1]]);
	}
	else
	{
		axisAngle =  [[1, 0, 0], Math.PI];
	}
	//console.log(axisAngle);
	let rotation = AxisAngleToQuaternion(axisAngle[0], axisAngle[1]);
	let quaternion = QuaternionMult(rotation, baseQuaternion);
	let xyzRotated = RotateByQuaternion(rotation, [xyz[0], xyz[2], xyz[1]]);
	//console.log("rotation: " + rotation);
	//console.log(xyz + " rotated to " + xyzRotated);
	let x = xyzRotated[0] + offset[0], y = xyzRotated[1] + offset[2], z = xyzRotated[2] + offset[1];
	let res = { "T":[x, y, z, quaternion[0], quaternion[1], quaternion[2], quaternion[3], scale, 0.0], "REF": structElem, "CID": cid, "DAT": [] };
	return res;
}

function ConvertToSprocketAll(comps, offset = [0, 0, 0], axis = [0, 0, 1], cid = 1, scale = 1.0, structElem = "0049b3cd2772cfb43917eb41078e1d01")
{
	var res = [];
	let noiseMagnitude = 1e-3;
	for (let i in comps)
	{
		let noise = 1 + (i % 2) * noiseMagnitude;
		let curr = ConvertToSprocketOne(comps[i][0], comps[i][1], offset, axis, cid, scale * comps[i][2] * noise, structElem);
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
		try
		{
		  jsonData = JSON.parse("[" + txt + "]");
		  if (jsonData.length > 0 && typeof jsonData[0] != 'object')
		  {
			  return [[], false];
		  }
		  return [jsonData, false];
		}
		catch(err)
		{
			return [[], false];
		}
	}
}

function StripPanels(jsonTxt, panelsToStrip, cid = 1)
{
	// Try to load the JSON data first without and then with []
	let parsedData = TankDataAsJSON(jsonTxt);
	let usedBlueprint = parsedData[1];
	let jsonData = parsedData[0];
	let elemsList = usedBlueprint ? jsonData["ext"] : jsonData;
	
	console.log("elemsList.length=" + elemsList.length);
	let newElemsList = elemsList.filter(x => !(x["CID"] == cid &&  panelsToStrip.includes(x["REF"])));
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

function GetPoint(points, idx)
{
	return [points[idx * 3], points[idx * 3 + 1], points[idx * 3 + 2]];
}

function RefMinus(points, va, vb)
{
	let pt1 = GetPoint(points, va), pt2 = GetPoint(points, vb);
	return [pt1[0] - pt2[0], pt1[1] - pt2[1], pt1[2] - pt2[2]];
}

function LineLineIntersect1(ln1Start, ln1End, ln2Start, ln2End)
{
	let vec1 = [ln1End[0] - ln1Start[0], ln1End[1] - ln1Start[1], ln1End[2] - ln1Start[2]],
		vec2 = [ln2End[0] - ln2Start[0], ln2End[1] - ln2Start[1], ln2End[2] - ln2Start[2]];
	let coNormal = Normalized(Cross(vec1, vec2));
	if (Math.abs(coNormal[0]) < 1e-5 && Math.abs(coNormal[1]) < 1e-5 && Math.abs(coNormal[2]) < 1e-5)
	{
		return null;
	}
	let	planeN1 = Normalized(Cross(vec1, coNormal)),
		planeN2 = Normalized(Cross(vec2, coNormal)),
		plane1 = [planeN1[0], planeN1[1], planeN1[2], -Dot(planeN1, ln1Start)],
		plane2 = [planeN2[0], planeN2[1], planeN2[2], -Dot(planeN2, ln2Start)];
	let dot1 = Dot(planeN2, vec1),
		t1 = (-plane2[3] - Dot(ln1Start, plane2)) / dot1,
		dot2 = Dot(planeN1, vec2),
		t2 = (-plane1[3] - Dot(ln2Start, plane1)) / dot2;
	let resPt1 = [ln1Start[0] + t1 * vec1[0], ln1Start[1] + t1 * vec1[1], ln1Start[2] + t1 * vec1[2]],
		resPt2 = [ln2Start[0] + t2 * vec2[0], ln2Start[1] + t2 * vec2[1], ln2Start[2] + t2 * vec2[2]];
	let ptDistTest = [Math.abs(resPt1[0] - resPt2[0]), Math.abs(resPt1[1] - resPt2[1]), Math.abs(resPt1[2] - resPt2[2])];
	let eps = 1e-5
	if (ptDistTest[0] < eps && ptDistTest[2] < eps && ptDistTest[2] < eps)
	{
		return [0.5*resPt1[0] + 0.5*resPt2[0], 0.5*resPt1[1] + 0.5*resPt2[1], 0.5*resPt1[2] + 0.5*resPt2[2]];
	}
	else
	{
		return null;
	}
}

function PolygonOffsetInside(points, face, amount)
{
	let faceVec1 = RefMinus(points, face[1], face[0]), faceVec2 = RefMinus(points, face[2], face[1]);
	let faceN = Normalized(Cross(faceVec1, faceVec2));
	console.log("Face normal: " + faceN);
	for (let i = 0; i < face.length - 1; ++i)
	{
		//console.log(GetPoint(points, face[i]) + " -> " + GetPoint(points, face[i + 1]));
		let currPt1 = GetPoint(points, face[i]),
			currPt2 = GetPoint(points, face[i + 1]),
			currEdgeVec = [currPt2[0] - currPt1[0], currPt2[1] - currPt1[1], currPt2[2] - currPt1[2]],
			currEdgeBiNormal = Normalized(Cross(faceN, currEdgeVec)),
			currOffsetPt1 = [currPt1[0] + amount * currEdgeBiNormal[0], currPt1[1] + amount * currEdgeBiNormal[1], currPt1[2] + amount * currEdgeBiNormal[2]],
			currOffsetPt2 = [currPt2[0] + amount * currEdgeBiNormal[0], currPt2[1] + amount * currEdgeBiNormal[1], currPt2[2] + amount * currEdgeBiNormal[2]];
		console.log("Edge (" + currPt1 + " -> " + currPt2 + ") offset to (" + currOffsetPt1 + " -> " + currOffsetPt2 + ")");
		let prevEdge = [face[(i + face.length - 2) % face.length], face[(i + face.length - 1) % face.length]], nextEdge = [face[(i + 1) % face.length], face[(i + 2) % face.length]];
		console.log("Prev edge: " + prevEdge + " (" + GetPoint(points, prevEdge[0]) + " -> " + GetPoint(points, prevEdge[1]) + ")");
		console.log("Next edge: " + nextEdge + " (" + GetPoint(points, nextEdge[0]) + " -> " + GetPoint(points, nextEdge[1]) + ")");
		let inter1 = LineLineIntersect1(currOffsetPt1, currOffsetPt2, GetPoint(points, prevEdge[0]), GetPoint(points, prevEdge[1])),
			inter2 = LineLineIntersect1(currOffsetPt1, currOffsetPt2, GetPoint(points, nextEdge[0]), GetPoint(points, nextEdge[1]));
		console.log("Intersection with prev: " + inter1);
		console.log("Intersection with next: " + inter2);
	}
}
