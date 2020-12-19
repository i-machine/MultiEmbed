var arraySummaryTypes = ['totals','averages','min','max','counts'];

// ---------------------------------------------
// prototypes begin p.begin p.b pb
// ---------------------------------------------

if (typeof Array.prototype.isEmpty === 'undefined')
{
    Object.defineProperty (Array.prototype,'isEmpty',
    {
        enumerable: false,
        value: function () {
        	return (this.length == 0);
        }
    });
}

if (typeof Array.prototype.isNotEmpty === 'undefined')
{
    Object.defineProperty (Array.prototype,'isNotEmpty',
    {
        enumerable: false,
        value: function () {
            return (this.length > 0);
        }
    });
}

if (typeof Array.prototype.clear === 'undefined')
{
    Object.defineProperty (Array.prototype,'clear',
    {
        enumerable: false,
        value: function () {
            this.length = 0;
        }
    });
}

if (typeof Array.prototype.contains === 'undefined')
{
    Object.defineProperty (Array.prototype,'contains',
    {
        enumerable: false,
        value: function (pValue) {
        	return (this.indexOf (pValue) > -1);
        }
    });
}

if (typeof Array.prototype.doesNotContain === 'undefined')
{
    Object.defineProperty (Array.prototype,'doesNotContain',
    {
        enumerable: false,
        value: function (pValue) {
        	return (this.indexOf (pValue) == -1);
        }
    });
}

if (typeof Array.prototype.pushIfNew === 'undefined')
{
    Object.defineProperty (Array.prototype,'pushIfNew',
    {
        enumerable: false,
        value: function (pValue) {
        	if (!this.contains (pValue))
        		this.push (pValue);
        }
    });
}

if (typeof Array.prototype.deleteIfFound === 'undefined')
{
    Object.defineProperty (Array.prototype,'deleteIfFound',
    {
        enumerable: false,
        value: function (pValue) {
        	var tmpIndex = this.indexOf (pValue);
        	if (tmpIndex > -1)
        	this.splice (tmpIndex,1);
        }
    });
}

if (typeof Array.prototype.delete === 'undefined')
{
    Object.defineProperty (Array.prototype,'delete',
    {
        enumerable: false,
        value: function (pValue) {
        	this.deleteIfFound (pValue);
        }
    });
}

if (typeof Array.prototype.findObject === 'undefined')
{
    Object.defineProperty (Array.prototype,'findObject',
    {
        enumerable: false,
        value: function (pProperty,pValue,pOptions) {
            var Options = getOptionalValue (pOptions,{});

            Options.FindFirstObjectOnly = true;

    	    return this.findObjects (pProperty,pValue,Options);
        }
    });
}

if (typeof Array.prototype.findObjects === 'undefined')
{
    Object.defineProperty (Array.prototype,'findObjects',
    {
        enumerable: false,
        value: function (pProperty,pValue,pOptions) {
            var Options = getOptionalValue (pOptions,{});

            return findObjectsInArray (this,pProperty,pValue,Options);
        }
    });
}

if (typeof Array.prototype.findNamedObject === 'undefined')
{
    Object.defineProperty (Array.prototype,'findNamedObject',
    {
        enumerable: false,
        value: function (pName,pOptions) {
        	if (isNotDefined (pOptions))
        		pOptions = new this.findObjectOptionsObject ();

        	pOptions.findFirstObjectOnly = true;

    	    return this.findNamedObjects (pName,pOptions);
        }
    });
}

if (typeof Array.prototype.findNamedObjects === 'undefined')
{
    Object.defineProperty (Array.prototype,'findNamedObjects',
    {
        enumerable: false,
        value: function (pName,pOptions) {
        	if (isNotDefined (pOptions))
        		pOptions = new this.findObjectOptionsObject ();
        	var results = [];
        	var preparedStr = pName;
        	for (var cLevel = pOptions.compareStringsFromLevel; cLevel <= pOptions.compareStringsToLevel; cLevel++)
        	{
        		preparedStr = prepareString (preparedStr,cLevel);
        		for (var cObject = 0; cObject < this.length; cObject++)
        		{
        			var tmpObject = this [cObject];
        			if (results.contains (tmpObject))
        				continue;

        			var tmpName = tmpObject.getNameMatchingPreparedString (preparedStr,cLevel);
        			if (tmpName)
        			{
        				if (pOptions.findFirstObjectOnly)
        					return tmpObject;
        				else
        					results.push (tmpObject);
        			}
        		}
        	}

        	return null;
        }
    });
}

if (typeof Array.prototype.findObjectOptionsObject === 'undefined')
{
    Object.defineProperty (Array.prototype,'findObjectOptionsObject',
    {
        enumerable: false,
        value: function () {
        	this.findFirstObjectOnly = false;
        	this.compareStringsFromLevel = 0;
            this.compareStringsToLevel = psMax;
        }
    });
}

// ---------------------------------------------
// prototypes end p.end p.e pe
// functions begin f.begin f.b fb
// ---------------------------------------------

function isArray (Value)
{
    return (Value && Value.constructor && Value.constructor === Array);
}

function valueToArray (Value,ReturnNullIfEmptyOrNotDefined)
{
    var isArray = (Value && Value.constructor && Value.constructor === Array);

    if (isArray)
        return Value;

    var nullResult = (ReturnNullIfEmptyOrNotDefined ? null : []);
    var result = [];

    if (isNotDefined (Value))
        return nullResult;

    if (typeof Value === 'string')
    {
        if (emptyOrNotDefined (Value))
            return nullResult;

        result = Value.split (',');
        return result;
    }
    else
        result.push (Value);

    return result;
}

function getCopyOfArray (pArrayToCopy)
{
    return ([].concat (pArrayToCopy));
}

function indexOfStringInArray (LookupValue, SourceArray, Options)
{
    return findIndexOfStringInArray (LookupValue, SourceArray, Options)
}

function findIndexOfStringInArray (LookupValue, SourceArray, Options)
{
    Options = getOptionalValue (Options,{});
    Options.UseTokenizedStrings = getOptionalValue (Options.UseTokenizedStrings,true);

    if (Options.UseTokenizedStrings)
    {
        var tokenizedLookupValue = GetTokenizedVersionOf (LookupValue)
        for (var c = 0; c < SourceArray.length; c ++)
        {
            var tokenizedElement = GetTokenizedVersionOf (SourceArray [c])
            if (tokenizedElement === tokenizedLookupValue)
                return c
        }
        return -1
    }
    else
        return SourceArray.indexOf (LookupValue)
}

function findObjectInArray (SourceArray, LookupPropertyOrProperties, LookupValue, Options)
{
    Options = getOptionalValue (Options,{});

    Options.FindFirstObjectOnly = true;

    return findObjectsInArray (SourceArray, LookupPropertyOrProperties, LookupValue, Options);
}

function findObjectsInArray (SourceArray, LookupPropertyOrProperties, LookupValue, Options)
{
    function DoFind (UseTokenizedStrings)
    {
        var AnyObjectsFound = false;
        var FindValue = LookupValue;

        if (UseTokenizedStrings && typeof FindValue === 'string')
            FindValue = GetTokenizedVersionOf (FindValue);

        for (var cObject = 0; cObject < SourceArray.length; cObject++)
        {
            var tmpObject = SourceArray [cObject];

            if (Results.contains (tmpObject))
                continue;

            var DoesObjectMatchFindValue = false;

            for (var cProperty = 0; cProperty < LookupProperties.length; cProperty++)
            {
                var tmpVal = getObjectProperty (tmpObject,LookupProperties [cProperty]);

                if (tmpVal instanceof NameObject)
                {
                    if (tmpVal.MatchesString (FindValue))
                    {
                        DoesObjectMatchFindValue = true;
                        break;
                    }
                }
                else
                {
                    if (UseTokenizedStrings)
                    {
                        if (typeof tmpVal !== 'string')
                            continue;

                        tmpVal = GetTokenizedVersionOf (tmpVal);
                    }

                    if (tmpVal == FindValue)
                    {
                        DoesObjectMatchFindValue = true;
                        break;
                    }
                }
            }

            if (DoesObjectMatchFindValue)
            {
                AnyObjectsFound = true;

                Results.pushIfNew (tmpObject);

                if (Options.FindFirstObjectOnly)
                    return true;
            }
        }

        return AnyObjectsFound;
    }

    var LookupProperties = valueToArray (LookupPropertyOrProperties);

    Options = getOptionalValue (Options,{});
    Options.FindFirstObjectOnly = getOptionalValue (Options.FindFirstObjectOnly,false);
    Options.UseTokenizedStrings = getOptionalValue (Options.UseTokenizedStrings,true);

    var Results = [];

    var AnyObjectsFound = DoFind (false);

    if ((!AnyObjectsFound) && Options.UseTokenizedStrings && typeof LookupValue === 'string')
        AnyObjectsFound = DoFind (true);

    if (Options.FindFirstObjectOnly)
    {
        if (AnyObjectsFound)
            return Results [0];
        else
            return null;
    }
    else
        return Results;
}

function CustomSortOrderObject (Property,ValuesStr)
{
    this.Property = Property;
    this.Values = ValuesStr.split (',');
}

function sortByThisProperty (property,CustomSortOrdersArray)
{
    var sortOrder = 1;
    if (property && property.length)
    {
        if(property[0] === "-")
        {
            sortOrder = -1;
            property = property.substr(1);
        }
    }

    if (CustomSortOrdersArray)
    {
        var CustomSortOrder = findObjectInArray (CustomSortOrdersArray,'Property',property,{UseTokenizedStrings: false});
        if (CustomSortOrder)
        {
            return function (a,b) {
                if (property && property.length)
                {
                    var pa = a [property];
                    var pb = b [property];
                }
                else
                {
                    var pa = a;
                    var pb = b;
                }

                if (typeof pa == 'string')
                    pa = pa.toLowerCase ();

                if (typeof pb == 'string')
                    pb = pb.toLowerCase ();

                var CustomValueA = CustomSortOrder.Values.indexOf (pa);
                var CustomValueB = CustomSortOrder.Values.indexOf (pb);
                if (CustomValueA != -1 && CustomValueB != -1)
                {
                    var result = (CustomValueA < CustomValueB) ? -1 : (CustomValueA > CustomValueB) ? 1 : 0;
                    return result * sortOrder;
                }
                else
                {
                    if (pa == '' || parseFloat (pa) == 0){
                        if (isNaN (pb))
                            pa = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
                        else
                            pa = 999999999999999999;
                    }
                    if (pb == '' || parseFloat (pb) == 0){
                        if (isNaN (pa))
                            pb = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
                        else
                            pb = 999999999999999999;
                    }
                    var result = (pa < pb) ? -1 : (pa > pb) ? 1 : 0;
                    return result * sortOrder;
                }
            }
        }
    }
    return function (a,b) {
        if (property && property.length)
        {
            var pa = a [property];
            var pb = b [property];
        }
        else
        {
            var pa = a;
            var pb = b;
        }

        if (typeof pa == 'string')
            pa = pa.toLowerCase ();

        if (typeof pb == 'string')
            pb = pb.toLowerCase ();

        if (pa == '' || parseFloat (pa) == 0){
            if (isNaN (pb))
                pa = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
            else
                pa = 999999999999999999;
        }
        if (pb == '' || parseFloat (pb) == 0){
            if (isNaN (pa))
                pb = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
            else
                pb = 999999999999999999;
        }
        var result = (pa < pb) ? -1 : (pa > pb) ? 1 : 0;
        return result * sortOrder;
    }
}

function sortByThePropertiesInThisStr (PropertiesToSortBy,CustomSortOrdersArray)
{
    var tmpArray = PropertiesToSortBy.split (',');
    return sortByThePropertiesInThisArray (tmpArray,CustomSortOrdersArray);
}

function sortByThePropertiesInThisArray (PropertiesToSortBy,CustomSortOrdersArray)
{
    var tmpArray = PropertiesToSortBy;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = tmpArray.length;
        while(result === 0 && i < numberOfProperties) {
            result = sortByThisProperty (tmpArray [i],CustomSortOrdersArray)(obj1, obj2);
            i++;
        }
        return result;
    }
}

function sortArraysByLength (arrays,ascending)
{
    var result = [].concat (arrays)
    if (ascending)
        result.sort (function (a,b) {return a.length - b.length})
    else
        result.sort (function (a,b) {return b.length - a.length})

    return result
}

function deleteElementFromArray (ThisElement,FromThisArray)
{
    result = FromThisArray.slice (0);

    var index = FromThisArray.indexOf (ThisElement);
    if (index > -1)
        result.splice (index,1);
    return result;
}

function objectArrayToIndexArray (pObjectArray)
{
    var IndexArray = [];

    for (var c = 0; c < pObjectArray.length; c++)
    {
        var tmpObject = pObjectArray [c];

        IndexArray.push (tmpObject.Index);
    }

    return IndexArray;
}

function indexArrayToObjectArray (pIndexArray,pSourceObjectArray)
{
    var ObjectArray = [];

    for (var c = 0; c < pIndexArray.length; c++)
    {
        var tmpIndex = pIndexArray [c];

        var tmpObject = findObjectInArray (pSourceObjectArray,'Index',tmpIndex);

        if (tmpObject)
            ObjectArray.push (tmpObject);
    }

    return ObjectArray;
}

function ObjectValuePair (data,value)
{
    this.object = data;
    this.value = value;
}

function buildObjectValuePairsFromSourceArray (sourceArray,userParams)
/*
    builds an array of object-value pairs

    usage:
        sourceArray = [{name: 'jim'},{name: 'bob'}];
        userParams.propertyToUse = 'name';
        userParams.sortOrder = 1;
    returns:
        [{object: {bob}, value: 'bob'},{object: {jim}, value: 'jim'}];
*/

{
    var params = {};

    if (isDefined (userParams))
        copyProperties (userParams,params);

    params.returnObjectValuePairs = true;

    return buildFlatArrayFromSourceArray (sourceArray,params);
}

function buildFlatArrayFromSourceArray (sourceArray,userParams)
{
    var params = {};

    params.propertyIsNameObject = false;
    params.propertyToUse = undefined;
    params.sortOrder = undefined;
    params.addAllNamesInNameObject = false;
    params.returnObjectValuePairs = false;

    if (isDefined (userParams))
        copyProperties (userParams,params);

        function addResult (value)
        {
            if (params.returnObjectValuePairs)
            {
                var objectValuePair = new ObjectValuePair (sourceObject,value);
                results.push (objectValuePair);
            }
            else
                results.push (value);
        }

    var results = [];
    var sourceObject;

    for (var cEntry = 0; cEntry < sourceArray.length; cEntry ++)
    {
        sourceObject = sourceArray [cEntry];

        if (isDefined (params.propertyToUse))
        {
            var propertyValue = sourceObject [params.propertyToUse];

            if (params.propertyIsNameObject || propertyValue instanceof NameObject)
            {
                var nameObject = propertyValue;
                if (params.addAllNamesInNameObject)
                {
                    for (var cName = 0; cName < nameObject.Names.length; cName ++)
                    {
                        var name = nameObject.Names [cName];
                        addResult (name.Value);
                    }
                }
                else
                    addResult (nameObject.Name);
            }
            else
                addResult (propertyValue);
        }
        else
            addResult (sourceObject);
    }

    if (isDefined (params.sortOrder))
    {
        var sortStr = '';
        if (params.returnObjectValuePairs)
            sortStr = 'value';

        if (params.sortOrder < 0)
            sortStr = '-' + sortStr;

        results.sort (sortByThisProperty (sortStr));
    }

    return results;
}

function produceArraySummaryObject (userParams)
{
    var params = {};

    params.sourceArray = null;
    params.summaryType = 'totals'; // 'averages', 'counts'
    params.properties = [];
    params.excludeProperties = [];
    params.summaryProperties = [];
    params.defaultValueForNonProcessedProperties = undefined;
    params.totalsObject = null;
    params.countsObject = null;

    if (userParams)
        copyProperties (userParams,params);

    params.summaryType = params.summaryType.toLowerCase ();

    if (!params.sourceArray || params.sourceArray.length == 0)
        return null;


            function processArrayEntries (summaryObject,summaryType)
            {
                function processArrayEntry (entry)
                {
                    for (var cProperty = 0; cProperty < params.summaryProperties.length; cProperty ++)
                    {
                        var property = params.summaryProperties [cProperty];

                        if (summaryType != 'counts')
                        {
                            var entryPropertyValue = entry [property];

                            if (typeof entryPropertyValue == 'string')
                            {
                                if (entryPropertyValue.length && isNumeric (entryPropertyValue))
                                    entryPropertyValue = parseFloat (entryPropertyValue);
                                else
                                    continue;
                            }
                        }

                        switch (summaryType)
                        {
                            case 'totals':
                                summaryObject [property] += entryPropertyValue;
                                break;

                            case 'counts':
                                var countThisEntry = true;

                                if (countThisEntry)
                                    summaryObject [property] ++;
                                break;

                            case 'max':
                                if (firstEntry || entryPropertyValue > summaryObject [property])
                                    summaryObject [property] = entryPropertyValue;
                                break;

                            case 'min':
                                if (firstEntry || entryPropertyValue < summaryObject [property])
                                    summaryObject [property] = entryPropertyValue;
                                break;

                        }
                    }
                }

                var firstEntry = true;

                for (var cEntry = 0; cEntry < params.sourceArray.length; cEntry ++)
                {
                    var entry = params.sourceArray [cEntry];

                    processArrayEntry (entry);
                    firstEntry = false;
                }
            }

            function requireSummaryObject (existingSummaryObject,summaryType)
            {
                if (existingSummaryObject)
                    return existingSummaryObject;

                var result = {};
                result.summaryType = summaryType;

                setObjectPropertyValues (result,params.properties,params.defaultValueForNonProcessedProperties);
                setObjectPropertyValues (result,params.summaryProperties,0);

                switch (summaryType)
                {
                    case 'averages':
                        for (var cProperty = 0; cProperty < params.summaryProperties.length; cProperty ++)
                        {
                            var property = params.summaryProperties [cProperty];

                            var divisor = params.countsObject [property];

                            if (divisor == 0)
                                result [property] = 0;
                            else
                                result [property] = params.totalsObject [property] / divisor;
                        }
                        break;

                    default:
                        processArrayEntries (result,summaryType);
                }

                return result;
            }


    var exampleObject = params.sourceArray [0];

    params.properties = getNormalisedObjectProperties (exampleObject,{properties: params.properties, excludeProperties: params.excludeProperties});

    params.summaryProperties = getNormalisedObjectProperties (exampleObject,{properties: params.properties, excludeProperties: params.excludeProperties, propertyValueType: 'number'});

    var result = null;

    switch (params.summaryType)
    {
        case 'totals':
            params.totalsObject = requireSummaryObject (null,'totals');
            result = params.totalsObject;
            break;

        case 'averages':
            params.totalsObject = requireSummaryObject (params.totalsObject,'totals');
            params.countsObject = requireSummaryObject (params.countsObject,'counts');
            params.averagesObject = requireSummaryObject (null,'averages');
            result = params.averagesObject;
            break;

        default:
            result = requireSummaryObject (null,params.summaryType);
    }

    return result;
}

function getNormalisedArraySummaryTypes (summaryTypes)
{
    var result;

    if (summaryTypes && summaryTypes.length)
        result = summaryTypes;
    else
        result = arraySummaryTypes;

    return result;
}

function produceArraySummaryObjects (userParams)
{
    var params = {};

    params.summaryTypes = [];

    if (userParams)
        copyProperties (userParams,params);

    params.summaryTypes = getNormalisedArraySummaryTypes (params.summaryTypes);

    var results = [];

    for (var cSummaryType = 0; cSummaryType < params.summaryTypes.length; cSummaryType ++)
    {
        params.summaryType = params.summaryTypes [cSummaryType];
        var summaryObject = produceArraySummaryObject (params);
        results.push (summaryObject);
    }

    return results;
}

function findArraySummaryObject (arraySummaryObjects,summaryType)
{
    return findObjectInArray (arraySummaryObjects,'summaryType',summaryType);
}

function produceFilteredArray (sourceArray,filters)
{
    function passesThroughFilters (object)
    {
        var result = true;

        for (var filterProperty in filters)
        {
            var filterValue = filters [filterProperty];

            if (isDefined (filterValue))
            {
                var objectValue = object [filterProperty];

                if (objectValue != filterValue)
                    return false;
            }
        }

        return result;
    }

    var results = sourceArray.filter (passesThroughFilters);

    return results;
}

function deleteArrayElementsByValue (array,deleteValue)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array [i] === deleteValue)
        {
          array.splice (i,1);
          i --;
        }
    }

    return array;
};

function produceNumberedArray (startIndex,endIndex,stubStr)
{
    var results = [];

    for (var cIndex = startIndex; cIndex <= endIndex; cIndex ++)
    {
        var item;

        if (isDefinedAndNotEmpty (stubStr))
        {
            item = sprintf (stubStr,cIndex);
        }
        else
            item = cIndex.toString ();

        results.push (item);
    }

    return results;
}

function ArrayRandomizer (sourceArray)
{
    this.sourceArray = sourceArray;
    this.previousRandomIndex = -1;
    this.currentRandomIndex = -1;
}

ArrayRandomizer.prototype.getRandomElement = function ()
{
    if (isNotDefined (this.sourceArray) || this.sourceArray.length == 0)
        return null;

    if (this.sourceArray.length == 1)
        return this.sourceArray [0];

    this.previousRandomIndex = this.currentRandomIndex;

    while (this.currentRandomIndex == this.previousRandomIndex)
        this.currentRandomIndex = Math.floor (Math.random () * this.sourceArray.length);

    return this.sourceArray [this.currentRandomIndex];
}

function getRandomElement (arrayOrArrayRandomizer)
{
    if (isArray (arrayOrArrayRandomizer))
        return arrayOrArrayRandomizer [Math.floor (Math.random() * arrayOrArrayRandomizer.length)];
    else if (arrayOrArrayRandomizer instanceof ArrayRandomizer)
        return arrayOrArrayRandomizer.getRandomElement ()
    else
        return null;
}

function stringToArray (pString,pOptions)
{
    var options = {};
    options.trimStrings = true;
    options.includeEmptyStrings = false;

    if (pOptions)
        copyProperties (pOptions,options);

    var array = [];

    return array;
}

function modifyStringArray (pStringArray,pOptions)
{
    var options = {};
    options.prepareStringOptions = [psTrim];
    options.deleteEmptyStrings = true;

    if (pOptions)
        copyProperties (pOptions,options);

    if (options.prepareStringOptions && (typeof options.prepareStringOptions === 'number' || (isArray (options.prepareStringOptions) && options.prepareStringOptions.length)))
    {
        for (var cElement = 0; cElement < pStringArray.length; cElement ++)
        {
            pStringArray [cElement] = PrepareString (pStringArray [cElement],options.prepareStringOptions);
        }
    }

    if (options.deleteEmptyStrings)
        deleteArrayElementsByValue (pStringArray,'');

    return pStringArray;
}

function doesArrayContainAnyDuplicates (array)
{
    for (var c = 0; c < array.length - 1; c ++)
    {
        if (array.indexOf (array [c],c + 1) > -1)
            return true
    }
    return false
}

function getIntersectionOfArrays (arrays)
{
    if (!arrays || !arrays.length)
        return [];

    // to speed up this function, i should order the arrays by number of elements, smallest first

    var results = getCopyOfArray (arrays [0]);

    for (var cArray = 1; cArray < arrays.length; cArray ++)
    {
        var array = arrays [cArray];

        for (var cElement = results.length - 1; cElement >= 0; cElement --)
        {
            var element = results [cElement];

            if (array.indexOf (element) < 0)
                results.splice (cElement,1);
        }
    }

    return results;
}

function getUnionOfArrays (arrays)
{
    if (!arrays || !arrays.length)
        return [];

    var results = getCopyOfArray (arrays [0]);

    for (var cArray = 1; cArray < arrays.length; cArray ++)
    {
        var array = arrays [cArray];

        for (var cElement = 0; cElement < array.length; cElement ++)
        {
            var element = array [cElement];

            results.pushIfNew (element);
        }
    }

    return results;
}

function areAllArraysEqual (arrays)
{
    if (!arrays || arrays.length < 2)
        return false;

    var firstArray = arrays [0];

    for (var cArray = 1; cArray < arrays.length; cArray ++)
    {
        var array = arrays [cArray];

        if (array.length !== firstArray.length)
            return false;

        for (var cElement = 0; cElement < array.length; cElement ++)
        {
            if (array [cElement] !== firstArray [cElement])
                return false;
        }
    }

    return true;
}

function areArraysEqual(a, b)
{
    var la = a.length;

    if (la !== b.length)
        return false;

    for (var i = 0; i < la; i ++)
    {
        if (a[i] !== b[i])
            return false;
    }

    return true;
}

function doesArray1ContainArray2 (array1,array2,trueIfArraysEqual,areArraysSorted)
{
	if (!array1.length || !array2.length || array1.length < array2.length)
		return false

    if (!areArraysSorted)
    {
        console.warning ('doesArray1ContainArray2: areArraysSorted must be true, sorry!')
        return false
    }

	if (array1.length == array2.length)
	{
		if (areArraysEqual (array1,array2))
			return trueIfArraysEqual
	}

	var i = 0
	for (var c = 0; c < array2.length; c ++)
	{
		i = array1.indexOf (array2 [c],i)
		if (i === -1) return false
		i ++
	}

	return true
}

function subtractArray1FromArray2 (array1,array2,areArraysSorted)
{
    var array2Remaining = [].concat (array2)
    var result = []

    for (var c = 0; c < array1.length; c ++)
    {
        var i = array2Remaining.indexOf (array1 [c])
        if (i > -1)
        {
            array2Remaining.splice (i,1)
            if (array2Remaining.length === 0)
                break
        }
    }

    return array2Remaining
}

function getDifferencesBetweenArray1AndArray2 (array1,array2,areArraysSorted)
{
//    var sortedArrays = sortArraysByLength ([array1,array2],true)
    var result = {
        inArray1ButNotArray2: subtractArray1FromArray2 (array2,array1),
        inArray2ButNotArray1: subtractArray1FromArray2 (array1,array2),
    }
    return result
}

function getArrayElementForRangedValue (array,value,rangeMin,rangeMax)
{
    if (rangeMin === rangeMax || rangeMin > rangeMax) return null
    
    var index = getArrayIndexForRangedValue (array,value,rangeMin,rangeMax)
    
    return index > -1 ? array [index] : null
}

function getArrayIndexForRangedValue (array,value,rangeMin,rangeMax)
{
    if (rangeMin === rangeMax || rangeMin > rangeMax) return -1
    
    var index = Math.floor (mapValueInRange1ToValueInRange2 (value,rangeMin,rangeMax,0,array.length,true))
    if (index === array.length)
        index --
    return index
}
