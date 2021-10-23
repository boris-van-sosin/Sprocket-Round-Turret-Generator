function ParseParenthesesInner(s, res, depth, openToken="(", closeToken=")")
{
	let idxOpen = s.indexOf("(");
	let idxClose = s.indexOf(")");
	//console.log("Starting with s=\"" + s + "\" res=" + res);
	if (idxOpen != -1 || idxClose != -1)
	{
		let opening = (idxClose == -1 || (idxOpen != -1 && idxOpen < idxClose));
		let cutIdx = opening ? idxOpen : idxClose;
		
		//console.log((opening ? "Opening" : "Closing") + " depth=" + depth);
		let beforeCut = s.slice(0, cutIdx).trim();
		var curr = [];
		if (beforeCut.length > 0)
		{
			curr = [beforeCut];
			for (let i = 0; i < depth; ++i)
			{
				curr = [curr];
			}
			//console.log("Will add: " + curr);
		}
		
		let nextDepth = opening ? depth + 1 : depth - 1;
		
		return ParseParenthesesInner(s.slice(cutIdx + 1, s.length), res.concat(curr), nextDepth, openToken, closeToken);
	}
	else
	{
		//console.log("Will add: " + s);
		let curr = s.trim();
		if (curr.length > 0)
		{
			return res.concat([curr]);
		}
		else
		{
			return res;
		}
	}
}

function ParseParentheses(s, openToken="(", closeToken=")")
{
	return ParseParenthesesInner(s, [], 0);
}

function ParseIntVecList(s)
{
	let tokens = ParseParentheses(s);
	var vecs = [];
	for (let i in tokens)
	{
		let t = tokens[i];
		//console.log(Array.isArray(t));
		if (Array.isArray(t))
		{
			for (let j in t)
				{
					if (Array.isArray(t[j]))
					{
						return null;
					}
				let currValues = t[j].split(",");
				var currVec = [];
				for (let k in currValues)
				{
					if (currValues[k].trim().length > 0)
					{
						currVec.push(parseInt(currValues[k].trim()));
					}
				}
				vecs.push(currVec);
			}
		}
		else
		{
			let currValues = t.split(",");
			for (let j in currValues)
			{
				if (currValues[j].trim().length > 0)
				{
					vecs.push(parseInt(currValues[j].trim()));
				}
			}
		}
	}
	return vecs;
}
