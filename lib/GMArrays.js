// ------------------------------------------------------------
// file: src\GMArray-main.js

function GMArray (sourceArray)
{
	this.elements = sourceArray || []
	this.onlyPushIfNew = false
}

GMArray.prototype.clear = function ()
{
	this.elements.length = 0
	return this
}

GMArray.prototype.isEmpty = function ()
{
	return this.elements.length === 0
}

GMArray.prototype.length = function ()
{
	return this.elements.length
}

GMArray.prototype.setLength = function (length)
{
	this.elements.length = length
	return this
}

GMArray.prototype.push = function ()
{
	var elementsToPush = convertArgumentsToArray.apply (null,arguments)

	if (this.onlyPushIfNew)
		return this.pushIfNew (elementsToPush)

	for (var c = 0; c < elementsToPush.length; c ++)
		this.elements.push (elementsToPush [c])

	return this
}

GMArray.prototype.pushIfNew = function ()
{
	var elementsToPush = convertArgumentsToArray.apply (null,arguments)

	for (var c = 0; c < elementsToPush.length; c ++)
	{
		var newElement = elementsToPush [c]

		if (!this.contains (newElement))
			this.elements.push (newElement)
	}

	return this
}

GMArray.prototype.add = function ()
{
	return this.push.apply (this,arguments)
}

GMArray.prototype.addIfNew = function ()
{
	return this.pushIfNew.apply (this,arguments)
}

GMArray.prototype.remove = function (value)
{
	var i = this.elements.indexOf (value)

	if (i > -1)
		this.elements.splice (i,1)
}

GMArray.prototype.removeIndex = function (index)
{
	this.elements.splice (index,1)
}

GMArray.prototype.indexOf = function (value)
{
	return this.elements.indexOf (value)
}

GMArray.prototype.contains = function (value)
{
	return this.elements.indexOf (value) !== -1
}

GMArray.prototype.containsAnyOf = function ()
{
	var values = convertArgumentsToArray.apply (null,arguments)
	if (values.length === 0) return false

	for (var c = 0; c < values.length; c ++)
	{
		if (this.contains (values [c]))
			return true
	}

	return false
}

GMArray.prototype.containsAllOf = function ()
{
	var values = convertArgumentsToArray.apply (null,arguments)
	if (values.length === 0) return false

	for (var c = 0; c < values.length; c ++)
	{
		if (!this.contains (values [c]))
			return false
	}

	return true
}

GMArray.prototype.reverseInPlace = function ()
{
	gmArrays.reverseInPlace (this.elements)
	return this
}

GMArray.prototype.reverseAsClone = function ()
{
	var clone = this.clone ()
	return clone.reverseInPlace ()
}

GMArray.prototype.clone = function ()
{
	var clone = new GMArray (this.elements)

	copyProperties (this,clone)

	return clone
}

GMArray.prototype.findObject = function (propertyName,propertyValue,options)
{
	return findObjectInArray (this.elements,propertyName,propertyValue,options)
}

GMArray.prototype.findObjects = function (propertyName,propertyValue,options)
{
	return findObjectsInArray (this.elements,propertyName,propertyValue,options)
}

// end of file: src\GMArray-main.js

// ------------------------------------------------------------
// file: src\GMArray-morphs.js

GMArray.prototype.add = function ()
{
	return this.push.apply (this,arguments)
}

GMArray.prototype.addIfNew = function ()
{
	return this.pushIfNew.apply (this,arguments)
}

GMArray.prototype.isNotEmpty = function ()
{
	return !this.isEmpty ()
}

GMArray.prototype.delete = function (element)
{
	return this.remove (element)
}

GMArray.prototype.deleteIndex = function (index)
{
	return this.removeIndex (index)
}

// end of file: src\GMArray-morphs.js

// ------------------------------------------------------------
// file: src\GMArrays-global.js

var gmArrays = new GMArrays ()

function newGMArray (sourceArray)
{
	return gmArrays.newGMArray (sourceArray)
}

function isGMArray (value)
{
	return gmArrays.isGMArray (value)
}

// end of file: src\GMArrays-global.js

// ------------------------------------------------------------
// file: src\GMArrays-main.js

function GMArrays ()
{
}

GMArrays.prototype.newGMArray = function (sourceArray)
{
	var gmArray = new GMArray (sourceArray)

	return gmArray
}

GMArrays.prototype.isGMArray = function (value)
{
	return isObjectOfType (value,GMArray)
}

GMArrays.prototype.clone = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.clone ()
	else
		return [].concat (arrayOrGMArray)
}

GMArrays.prototype.clear = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		arrayOrGMArray.clear ()
	else
		arrayOrGMArray.length = 0
	
	return arrayOrGMArray
}

GMArrays.prototype.reverseInPlace = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		arrayOrGMArray.reverseInPlace ()
	else
		arrayOrGMArray.reverse ()
	
	return arrayOrGMArray
}

GMArrays.prototype.reverseAsClone = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.reverseAsClone ()
	else
	{
		var result = this.clone (arrayOrGMArray)
		result.reverse ()
		return result
	}
}

GMArrays.prototype.isEmpty = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.isEmpty ()
	else
		return arrayOrGMArray.length === 0
}

GMArrays.prototype.resolveToArray = function (arrayOrGMArray)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.elements
	else
		return arrayOrGMArray
}

GMArrays.prototype.containsElement = function (arrayOrGMArray,element)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.contains (element)
	else
		return arrayOrGMArray.indexOf (element) > -1
}

GMArrays.prototype.pushElement = function (arrayOrGMArray,element,opOnlyIfNew)
{
	var onlyIfNew = opOnlyIfNew === undefined ? false : opOnlyIfNew

	if (onlyIfNew && this.containsElement (arrayOrGMArray,element))
		return

	if (this.isGMArray (arrayOrGMArray))
		arrayOrGMArray.push (element)
	else
		arrayOrGMArray.push (element)
}

GMArrays.prototype.pushElementIfNew = function (arrayOrGMArray,element)
{
	return this.pushElement (arrayOrGMArray,element)
}

GMArrays.prototype.removeElement = function (arrayOrGMArray,element)
{
	if (this.isGMArray (arrayOrGMArray))
		arrayOrGMArray.remove (element)
	else
	{
		var i = arrayOrGMArray.indexOf (element)

		if (i > -1)
			arrayOrGMArray.splice (i,1)
	}
}

GMArrays.prototype.removeElementIndex = function (arrayOrGMArray,elementIndex)
{
	if (this.isGMArray (arrayOrGMArray))
		arrayOrGMArray.removeIndex (elementIndex)
	else
		arrayOrGMArray.splice (elementIndex,1)
}

GMArrays.prototype.removeElements = function (arrayOrGMArray,elements)
{
	for (var c = 0; c < elements.length; c ++)
		this.removeElement (arrayOrGMArray,elements [c])
}

GMArrays.prototype.findObject = function (arrayOrGMArray,propertyName,propertyValue,options)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.findObject (propertyName,propertyValue,options)
	else
		return findObjectInArray (arrayOrGMArray,propertyName,propertyValue,options)
}

GMArrays.prototype.findObjects = function (arrayOrGMArray,propertyName,propertyValue,options)
{
	if (this.isGMArray (arrayOrGMArray))
		return arrayOrGMArray.findObjects (propertyName,propertyValue,options)
	else
		return findObjectsInArray (arrayOrGMArray,propertyName,propertyValue,options)
}

GMArrays.prototype.convertValueToArray = function (value,convertCSV)
{
	var array

	if (gmValues.isArray (value))
		array = value
	else
	{
		if (convertCSV && typeof value === 'string')
			array = value.split (',')
		else
			array = this.convertValuesToArray (value)
	}

	return array
}

GMArrays.prototype.convertValuesToArray = function (/* values */)
{
    return this.convertArgumentsToArray.apply (null,arguments)
}

GMArrays.prototype.convertArgumentsToArray = function (/* arguments */)
{
    var args = Array.prototype.slice.call (arguments)
    if (args.length == 0) return []
    if (args.length == 1 && isArray (args [0])) return args [0]

    return args
}

GMArrays.prototype.convertValueToGMArray = function (value)
{
	return this.convertArgumentsToGMArray (value)
}

GMArrays.prototype.convertArgumentsToGMArray = function ()
{
	var args = this.convertArgumentsToArray (arguments)

	var gmArray = this.newGMArray (args)

    return gmArray
}

GMArrays.prototype.getRandomElement = function (array)
{
	if (this.isEmpty (array))
		return null

    return array [Math.floor (Math.random () * array.length)]
}

GMArrays.prototype.containsDuplicateElements = function (array)
{
    for (var c = 0; c < array.length - 1; c ++)
    {
        if (array.indexOf (array [c],c + 1) > -1)
            return true
    }
    return false
}

GMArrays.prototype.areArraysEqual = function (arrays,opMustElementsBeInSameOrder)
{
    if (!arrays || !arrays.length)
        return false

    if (arrays.length === 1)
    	return true

    var rootArray = arrays [0]

	for (var c = 1; c < arrays.length; c ++)
	{
		if (arrays [c].length !== rootArray.length)
			return false
	}

	var mustElementsBeInSameOrder = opMustElementsBeInSameOrder === undefined ? true : opMustElementsBeInSameOrder

    if (mustElementsBeInSameOrder)
    {
		for (var cArray = 1; cArray < arrays.length; cArray ++)
		{
			var array = arrays [cArray]

			for (var c = 0; c < array.length; c ++)
			{
				if (array [c] !== rootArray [c])
					return false
			}
		}
		return true
    }
    else
    	return this.getIntersection (arrays).length === rootArray.length
}

GMArrays.prototype.getIntersection = function (arrays)
{
    if (!arrays || !arrays.length)
        return []

    if (arrays.length === 1)
    	return this.clone (arrays [0])

    var intersection = []
    var rootArray = arrays [0]

    for (var cElement = 0; cElement < rootArray.length; cElement ++)
    {
        var element = rootArray [cElement]
        var elementInAllArrays = true

	    for (var cArray = 1; cArray < arrays.length; cArray ++)
	    {
	        var array = arrays [cArray]

	        if (array.indexOf (element) < 0)
	        {
	        	elementInAllArrays = false
	        	break
	        }
	    }

	    // check if element already exists as there may be duplicate elements in an array
	    if (elementInAllArrays && intersection.indexOf (element) < 0)
	    	intersection.push (element)
	}

    return intersection
}

GMArrays.prototype.getUnion = function (arrays)
{
    if (!arrays || !arrays.length)
        return []

    if (arrays.length === 1)
    	return this.clone (arrays [0])

    var union = this.clone (arrays [0])

    for (var cArray = 1; cArray < arrays.length; cArray ++)
    {
        var array = arrays [cArray]

        for (var cElement = 0; cElement < array.length; cElement ++)
        {
            var element = array [cElement];

            if (union.indexOf (element) < 0)
            	union.push (element)
        }
    }

    return union
}

GMArrays.prototype.getDifference = function (arrays)
{
	// returns an array of all elements in the first array that do not appear in any subsequent arrays

    if (!arrays || !arrays.length)
        return []

    if (arrays.length === 1)
    	return []

	var difference = []
    var rootArray = arrays [0]

	for (var c = 0; c < rootArray.length; c ++)
	{
		var element = rootArray [c]
		var elementFoundInAnyArray = false

		for (var cArray = 1; cArray < arrays.length; cArray ++)
		{
			if (arrays [cArray].indexOf (element) > -1)
			{
				elementFoundInAnyArray = true
				break
			}
		}

		if (!elementFoundInAnyArray)
			difference.push (rootArray [c])
	}

	return difference
}

GMArrays.prototype.getSymmetricDifference = function (arrays)
{
	// returns an array of all elements that only appear in one of the arrays

    if (!arrays || !arrays.length)
        return []

    if (arrays.length === 1)
    	return []

	var difference = []

	for (var cArray1 = 0; cArray1 < arrays.length; cArray1 ++)
	{
		var array1 = arrays [cArray1]

		for (var c = 0; c < array1.length; c ++)
		{
			var element = array1 [c]
			var elementFoundInAnyArray = false

			for (var cArray2 = 0; cArray2 < arrays.length; cArray2 ++)
			{
				if (cArray2 === cArray1) continue

				var array2 = arrays [cArray2]

				if (array2.indexOf (element) > -1)
				{
					elementFoundInAnyArray = true
					break
				}

			}

			if (!elementFoundInAnyArray)
				difference.push (element)
		}
	}

	return difference
}

GMArrays.prototype.doesAContainAllElementsOfB = function (a,b)
{
	if (a.length < b.length)
		return false

	for (var c = 0; c < b.length; c ++)
	{
		if (a.indexOf (b [c]) < 0)
			return false
	}

	return true
}

GMArrays.prototype.filterArray = function (array,filter)
{
	if (gmValues.isDefinedAndNotNull (filter))
	{
		if (typeof filter === 'string')
		{
			var filterFunction = function (item)
			{
				// allow filter code to refer to item as 'object', 'element'
				var object = element = item

				// allow filter code to access properties directly
				// so 'item.enabled' can be expressed as just 'enabled'
				for (p in item)
					this [p] = item [p]

				return eval (filter)
			}

			return array.filter (filterFunction)
		}
		else if (typeof filter === 'function')
			return array.filter (filter)
		else
			return undefined
	}
	else
		return array
}

GMArrays.prototype.findElementUsingFilter = function (array,filter)
{
	var results = this.filterArray (array,filter)
	if (results.length)
		return results [0]
	else
		return null
}

GMArrays.prototype.sortArray = function (array,direction,propertyOrProperties)
{

}

GMArrays.prototype.split = function (pString,opOptions)
{
	var options = {
		separator: ',',
		trimStrings: true,
		omitEmptyStrings: true,
		processStringFunction: undefined
	}
	if (pOptions)
		gmObjects.copyCommonProperties (pOptions,options)

	var results = pString.split (options.separator)

	for (var c = results.length - 1; c >= 0; c --)
	{
		var item = results [c]

		if (options.trimStrings)
			item = gmStrings.trim (item)

		if (options.omitEmptyStrings && gmStrings.isEmpty (item))
		{
			gmArrays.deleteElementIndex (c)
			continue
		}

		if (options.processStringFunction)
			item = options.processStringFunction (item)

		results [c] = item
	}


	return results
}

// end of file: src\GMArrays-main.js

// ------------------------------------------------------------
// file: src\GMArrays-morphs.js

GMArrays.prototype.isNotEmpty = function (arrayOrGMArray)
{
	return !this.isEmpty (arrayOrGMArray)
}

GMArrays.prototype.containsElements = function (arrayOrGMArray,elements)
{
	return this.doesAContainAllElementsOfB (arrayOrGMArray,elements)
}

GMArrays.prototype.pushElements = function (arrayOrGMArray,elements,opOnlyIfNew)
{
	for (var c = 0; c < elements.length; c ++)
		this.pushElement (arrayOrGMArray,elements [c],opOnlyIfNew)
}

GMArrays.prototype.pushElementsIfNew = function (arrayOrGMArray,elements)
{
	for (var c = 0; c < elements.length; c ++)
		this.pushElementIfNew (arrayOrGMArray,elements [c])
}

GMArrays.prototype.remove = 
GMArrays.prototype.delete = 
GMArrays.prototype.deleteElement = function (arrayOrGMArray,element)
{
	return this.removeElement (arrayOrGMArray,element)
}

GMArrays.prototype.deleteElements = function (arrayOrGMArray,elements)
{
	return this.removeElements (arrayOrGMArray,elements)
}

GMArrays.prototype.removeIndex = 
GMArrays.prototype.deleteIndex = 
GMArrays.prototype.deleteElementIndex = function (arrayOrGMArray,elementIndex)
{
	return this.removeElementIndex (arrayOrGMArray,elementIndex)
}

GMArrays.prototype.mergeArrays = function (arrays)
{
	return this.getUnion (arrays)
}

GMArrays.prototype.getCommonElements = function (arrays)
{
	return this.getIntersection (arrays)
}

GMArrays.prototype.getCombinedElements = function (arrays)
{
	return this.getUnion (arrays)
}

GMArrays.prototype.getElementsInAButNotInB = function (a,b)
{
	return this.getDifference ([a,b])
}

GMArrays.prototype.getDifferenceBetweenAAndB = function (a,b)
{
	return this.getDifference ([a,b])
}

GMArrays.prototype.valueToArray = function (value,convertCSV)
{
	return this.convertValueToArray (value,convertCSV)
}

// end of file: src\GMArrays-morphs.js

// ------------------------------------------------------------
// file: tests\GMArraysTests.js

gmAddTestSuite ({
	name: 'gmArrays',
	enabled: true,
	variables: {},
	preTestFunction: undefined,
	postTestFunction: undefined
})

var testPeople = [
	{name: 'joe', gender: 'male', age: 30, employed: false},
	{name: 'mike', gender: 'male', age: 40, employed: true},
	{name: 'bob', gender: 'male', age: 50, employed: false},
	{name: 'charlie', gender: 'male', age: 60, employed: true},
	{name: 'lisa', gender: 'female', age: 30, employed: true},
	{name: 'jane', gender: 'female', age: 40, employed: false},
	{name: 'mary', gender: 'female', age: 50, employed: true},
	{name: 'margaret', gender: 'female', age: 60, employed: false}
]

/*
usage:
	gmAddTest ('',testFunction,testVariables(optional))
	testFunction is passed the following arguments: test,variables,testSuiteVariables
	test passes if testFunction returns undefined
	test fails if testFunction returns anything other than undefined

templates:
	gmAddTest ('',function () {})
	gmAddTest ('',function (test) {})
	gmAddTest ('',function (test,variables,testSuiteVariables) {})
	gmAddTest ('',function (test,variables,testSuiteVariables) {},{})

*/

gmAddTest ('',function (test) {
	var empty = []
	var a = [1,2,3,4,5]
	var b = [1,2,3,4]
	var c = [1,2,3]
	var d = [1,2,3,4,5,6]
	var e = [2,3,4,5,6,7]
	var f = [1,2]
	var g = [3,4]
	var h = [5,6]
	var i = [5,6]
	var j = [6,5]

	test.assert (gmArrays.areArraysEqual ([h,i],true))
	test.assert (gmArrays.areArraysEqual ([h,i],false))
	test.assert (gmArrays.areArraysEqual ([i,j],false))
	test.assert (!gmArrays.areArraysEqual ([i,j],true))
	test.assert (!gmArrays.areArraysEqual ([i,empty],true))
	test.assert (gmArrays.areArraysEqual ([empty,empty],true))

	test.assert (gmArrays.areArraysEqual ([gmArrays.getIntersection ([a,b,c,d,e]),[2,3]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getIntersection ([f,g,h]),[]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getIntersection ([a,b,c,d,e,empty]),[]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getIntersection ([a]),[1,2,3,4,5]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getIntersection ([empty,empty,empty]),[]]),false)

	test.assert (gmArrays.areArraysEqual ([gmArrays.getUnion ([f,g,h]),[1,2,3,4,5,6]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getUnion ([c,f]),[1,2,3]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getUnion ([c]),[1,2,3]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getUnion ([c]),[1,2,3]]),false)
	test.assert (gmArrays.areArraysEqual ([gmArrays.getUnion ([empty,empty,empty]),[]]),false)

	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([d,c]),[4,5,6]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([d,d]),[]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([f,g,h]),[1,2]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([d,c,f,g,b]),[5,6]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([c,d]),[]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getDifference ([empty,empty,empty]),[]]))


	test.assert (gmArrays.areArraysEqual ([gmArrays.getSymmetricDifference ([f,g,h]),[1,2,3,4,5,6]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getSymmetricDifference ([b,f,e]),[5,6,7]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getSymmetricDifference ([d,empty]),[1,2,3,4,5,6]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getSymmetricDifference ([b,f,e,empty]),[5,6,7]]))
	test.assert (gmArrays.areArraysEqual ([gmArrays.getSymmetricDifference ([empty,empty,empty]),[]]))


	test.assert (gmArrays.doesAContainAllElementsOfB (d,a))
	test.assert (!gmArrays.doesAContainAllElementsOfB (a,d))
	test.assert (gmArrays.doesAContainAllElementsOfB (a,empty))
	test.assert (!gmArrays.doesAContainAllElementsOfB (empty,a))
	test.assert (gmArrays.doesAContainAllElementsOfB (empty,empty))

})

gmAddTest ('',function (test) {
	var filteredPeople = gmArrays.filterArray (testPeople,function (person) {return person.age >= 50})
	console.log (filteredPeople)

	var filteredPeople = gmArrays.filterArray (testPeople,'age >= 50')
	console.log (filteredPeople)

	var filteredPeople = gmArrays.filterArray (testPeople,'age >= 40 && employed')
	console.log (filteredPeople)

})

// end of file: tests\GMArraysTests.js

