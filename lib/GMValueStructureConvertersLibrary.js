function ResolvedNamedValuesFromArray ()
{
	this.fromArray = null
	this.resolvedElementIndexes = []
	this.unresolvedElementIndexes = []
	this.allElementsResolved = false
	this.allValuesResolved = false
	this.resolvedValues = {}
	this.unresolvedValues = {}
}

function resolveNamedValuesFromArray (fromArray,namedValues)
{
	var rnv = new ResolvedNamedValuesFromArray ()
	rnv.fromArray = fromArray
	var value
	var valueResolved
	var resolvedElementCount = 0

	rnv.allValuesResolved = true // until proven otherwise
	for (var namedValueProperty in namedValues)
	{
		var namedValueParams = namedValues [namedValueProperty]

		if (namedValueParams.resolvedFromFunctionArgumentObject)
		{
			value = namedValueParams.valueResolvedFromFunctionArgumentObject
			valueResolved = true
			resolvedElementCount ++
			if (isDefined (namedValueParams.index) && typeof namedValueParams.index === 'number')
				rnv.resolvedElementIndexes.push (namedValueParams.index)
		}
		else
		{
			value = undefined
			valueResolved = false

			if (typeof namedValueParams == 'string')
			{
				if (isIndexAllUnresolved (namedValueParams))
					resolveValueForAllUnresolvedElements ()
				continue
			}

			if (isDefined (namedValueParams.index))
			{
				if (typeof namedValueParams.index === 'number')
				{
					if (namedValueParams.index < rnv.fromArray.length)
						resolveValue (namedValueParams.index)
				}
				else if (typeof namedValueParams.index === 'string')
				{
					if (isIndexAllUnresolved (namedValueParams.index))
						resolveValueForAllUnresolvedElements ()
				}
			}
		}

		if (valueResolved)
			rnv.resolvedValues [namedValueProperty] = value
		else
		{
			rnv.unresolvedValues [namedValueProperty] = value
			rnv.allValuesResolved = false
		}
	}

	console.log (resolvedElementCount,rnv.fromArray.length)
	rnv.allElementsResolved = (rnv.resolvedElementIndexes.length == rnv.fromArray.length)
	if (!rnv.allElementsResolved)
	{
		for (var c = 0; c < rnv.fromArray.length; c ++)
		{
			if (rnv.resolvedElementIndexes.indexOf (c) === -1)
				rnv.unresolvedElementIndexes.push (c)
		}
	}

	console.log (rnv)
	return rnv

	function resolveValue (elementIndex)
	{
		if (rnv.resolvedElementIndexes.indexOf (elementIndex) > -1) return
		value = rnv.fromArray [elementIndex]
		valueResolved = true
		resolvedElementCount ++
		rnv.resolvedElementIndexes.push (elementIndex)
	}

	function resolveValueForAllUnresolvedElements ()
	{
		value = []
		for (var c = 0; c < rnv.fromArray.length; c ++)
		{
			if (rnv.resolvedElementIndexes.indexOf (c) > -1) continue

			value.push (rnv.fromArray [c])
			valueResolved = true
			resolvedElementCount ++
			rnv.resolvedElementIndexes.push (c)
		}
	}

	function isIndexAllUnresolved (index)
	{
		var indexStr = PrepareString (index,[psTrim,psLowerCase,psRemoveSpaces])
		var p1 = ['all','allunresolved','unresolved','allremaining','remaining']
		var p2 = ['','elements','arguments','indexes']

		for (var c2 = 0; c2 < p2.length; c2 ++)
		{
			var p3 = [].concat (p1);
			for (var c3 = 0; c3 < p3.length; c3 ++)
				p3 [c3] = p3 [c3] + p2 [c2]

			if (p3.indexOf (indexStr) > -1)
				return true
		}
		return false
	}

}

function ResolvedFunctionArguments ()
{
	this.argumentsAsArray = null
	this.resolvedArgumentIndexes = []
	this.unresolvedArgumentIndexes = []
	this.allArgumentsResolved = false
	this.allValuesResolved = false
	this.resolvedValues = {}
	this.unresolvedValues = {}
	this.resolvedNamedValuesFromArray = null
}

function ResolvedFunctionArgumentsObject ()
{
}

function resolveFunctionArgumentsObject (functionArgumentsObject)
{
	var result = new ResolvedFunctionArgumentsObject ()
	copyProperties (functionArgumentsObject,result)
	return result
}

function resolveFunctionArguments (functionArguments,namedValues)
{
	var functionArgumentsArray = convertArgumentsToArray (functionArguments)
	if (!isObjectOfType (functionArguments,ResolvedFunctionArgumentsObject) && !isDefined (namedValues))
		return functionArgumentsArray

	var resolvedFunctionArguments = new ResolvedFunctionArguments ()

	var namedValuesToResolveFromArray = {}
	copyProperties (namedValues,namedValuesToResolveFromArray)
	for (var c = 0; c < functionArgumentsArray.length; c ++)
	{
		var functionArgumentsObject = functionArgumentsArray [c]
		if (!isObjectOfType (functionArgumentsObject,ResolvedFunctionArgumentsObject))
			continue

		for (var namedValueProperty in functionArgumentsObject)
		{
			if (!namedValuesToResolveFromArray.hasOwnProperty (namedValueProperty))
				namedValuesToResolveFromArray [namedValueProperty] = {}

			var namedValue = namedValuesToResolveFromArray [namedValueProperty]
			namedValue.resolvedFromFunctionArgumentObject = true
			namedValue.valueResolvedFromFunctionArgumentObject = functionArgumentsObject [namedValueProperty]
		}
	}

	var resolvedNamedValuesFromArray = resolveNamedValuesFromArray (functionArgumentsArray,namedValuesToResolveFromArray)

	resolvedFunctionArguments.resolvedNamedValuesFromArray = resolvedNamedValuesFromArray
	resolvedFunctionArguments.argumentsAsArray = resolvedNamedValuesFromArray.fromArray
	resolvedFunctionArguments.resolvedArgumentIndexes = resolvedNamedValuesFromArray.resolvedElementIndexes
	resolvedFunctionArguments.unresolvedArgumentIndexes = resolvedNamedValuesFromArray.unresolvedElementIndexes
	resolvedFunctionArguments.allArgumentsResolved = resolvedNamedValuesFromArray.allElementsResolved
	resolvedFunctionArguments.allValuesResolved = resolvedNamedValuesFromArray.allValuesResolved
	resolvedFunctionArguments.resolvedValues = resolvedNamedValuesFromArray.resolvedValues
	resolvedFunctionArguments.unresolvedValues = resolvedNamedValuesFromArray.unresolvedValues

	return resolvedFunctionArguments
}

