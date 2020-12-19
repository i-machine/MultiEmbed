function NameObject (names,synonymManager)
{
	this.Names = [];
	this.Name = '';
	this.SynonymManager = synonymManager;
	if (names)
		this.SetNames (names);
}

function NamedObject (names,synonymManager)
{
	this.Name = new NameObject (names,synonymManager);
}

NamedObject.prototype = Object.create (Object.prototype);
NamedObject.prototype.constructor = NamedObject;

NameObject.prototype.AddName = function (pName)
{
	var newName = new PreparedStringsObject (pName,this.SynonymManager);
	this.Names.push (newName);
	return newName;
}

NameObject.prototype.sortNamesByLength = function (ascending)
{
	this.Names.sort (function (a,b) {
		var la = a.Value.length;
		var lb = b.Value.length;

		if (la == lb)
			return 0;

		if (ascending)
		{
			if (la < lb)
				return -1;
			else
				return 1;
		}
		else
		{
			if (la > lb)
				return -1;
			else
				return 1;
		}
	});
}

NameObject.prototype.AddNames = function (pNamesArray)
{
	var NamesArray = valueToArray (pNamesArray);

	for (cName = 0; cName < NamesArray.length; cName++)
		this.AddName (NamesArray [cName]);
}

NameObject.prototype.SetNames = function (pNamesArray)
{
	this.Names.clear ();

	this.AddNames (pNamesArray);

	this.Name = this.Names [0].Value;
}

NameObject.prototype.SetName = function (pName)
{
	return this.SetNames (pName);
}

NameObject.prototype.GetNamesAsArray = function ()
{
	var results = [];

	for (var cName = 0; cName < this.Names.length; cName)
	{
		var name = this.Names [cName];

		results.push (name.Value);
	}

	return results;
}

NameObject.prototype.MatchesString = function (pString,pCompareFromLevel,pCompareToLevel,pCompareType)
{
	pCompareType = pCompareType || csWholeString;
	return (this.GetIndexOf (pString,pCompareFromLevel,pCompareToLevel,pCompareType) >= 0);
}

NameObject.prototype.GetIndexOf = function (pString,pCompareFromLevel,pCompareToLevel,pCompareType)
{
	pCompareType = pCompareType || csWholeString;
	var result = -1;
	var FromLevel = 0, ToLevel = 0;

	if (isDefined (pCompareFromLevel))
	{
		if (isDefined (pCompareToLevel))
		{
			FromLevel = pCompareFromLevel;
			ToLevel = pCompareToLevel;
		}
		else
			ToLevel = pCompareFromLevel;

		if (ToLevel == psUser)
			ToLevel = psMax;
		if (ToLevel == psBasic)
			ToLevel = psLowerCase;
	}
	else
		ToLevel = psMax;

	var preparedStr = pString;
	for (var cLevel = FromLevel; cLevel <= ToLevel; cLevel++)
	{
		preparedStr = PrepareString (preparedStr,cLevel);
		result = this.GetIndexOfPreparedString (preparedStr,cLevel,pCompareType);
		if (result >= 0)
			return result;
	}

	return -1;
}

NameObject.prototype.GetIndexOfPreparedString = function (pPreparedString,pCompareLevel,pCompareType)
{
	pCompareType = pCompareType || csWholeString;
	var isMatch = false;

	for (var cName = 0; cName < this.Names.length; cName++)
	{
		var tmpName = this.Names [cName];

		switch (pCompareType)
		{
			case csWholeString:
				isMatch = (tmpName.PreparedStrings [pCompareLevel] == pPreparedString);
				break;
			case csContainsSubString:
				isMatch = (tmpName.PreparedStrings [pCompareLevel].indexOf (pPreparedString) > -1)
				break;
			case csStartsWithSubString:
				isMatch = (tmpName.PreparedStrings [pCompareLevel].indexOf (pPreparedString) == 0)
				break;
		}

		if (isMatch)
			return cName;
	}

	return -1;
}

NameObject.prototype.GetStartAndEndIndexesOfName = function (pString,pCompareFromLevel,pCompareToLevel,pCompareType)
{
	pCompareType = pCompareType || csWholeString;
	var result = {};
	var FromLevel = 0, ToLevel = 0;

	if (isDefined (pCompareFromLevel))
	{
		if (isDefined (pCompareToLevel))
		{
			FromLevel = pCompareFromLevel;
			ToLevel = pCompareToLevel;
		}
		else
			ToLevel = pCompareFromLevel;

		if (ToLevel == psUser)
			ToLevel = psMax;
		if (ToLevel == psBasic)
			ToLevel = psLowerCase;
	}
	else
		ToLevel = psMax;

	var preparedStr = pString;
	for (var cLevel = FromLevel; cLevel <= ToLevel; cLevel++)
	{
		preparedStr = PrepareString (preparedStr,cLevel);
		result = this.GetStartAndEndIndexesOfNameInPreparedString (preparedStr,cLevel,pCompareType);
		if (result.startIndex > -1)
			return result;
	}

	return {startIndex: -1, endIndex: -1};
}

NameObject.prototype.GetStartAndEndIndexesOfNameInPreparedString = function (pPreparedString,pCompareLevel,pCompareType)
{
	pCompareType = pCompareType || csWholeString;
	var isMatch = false;
	var index;

	for (var cName = 0; cName < this.Names.length; cName++)
	{
		var tmpName = this.Names [cName];

		switch (pCompareType)
		{
			case csWholeString:
				index = 0;
				isMatch = (pPreparedString == tmpName.PreparedStrings [pCompareLevel]);
				break;
			case csContainsSubString:
				index = pPreparedString.indexOf (tmpName.PreparedStrings [pCompareLevel]);
				isMatch = (index > -1);
				break;
			case csStartsWithSubString:
				index = pPreparedString.indexOf (tmpName.PreparedStrings [pCompareLevel]);
				isMatch = (index == 0);
				break;
		}

		if (isMatch)
			return {startIndex: index, endIndex: index + tmpName.PreparedStrings [pCompareLevel].length - 1};
	}

	return {startIndex: -1, endIndex: -1};
}

function NameObjectToJSONObject (pNameObject)
{
	if (!(pNameObject && pNameObject instanceof NameObject))
		return [];

	var nameArray = [];

	for (var cName = 0; cName < pNameObject.Names.length; cName++)
		nameArray.push (pNameObject.Names [cName].Value);

	return nameArray;
}

function JSONObjectToNameObject (pJSONObject)
{
	var Name = new NameObject ();

	Name.SetNames (pJSONObject);

	return Name;
}

function NamedObjectArrayToJSONObjectArray (pNamedObjectArray,pNameProperty)
{
	var results = [];
	var nameProperty = pNameProperty || 'name';

	for (var cElement = 0; cElement < pNamedObjectArray.length; cElement ++)
	{
		var element = pNamedObjectArray [cElement];
		var nameObject = element [nameProperty];

		var JSONObject = NameObjectToJSONObject (nameObject);

		results.push (JSONObject);
	}

	return results;
}

function FindNamedObjectInArray (SourceArray, LookupPropertyOrProperties, LookupValue, userOptions)
{
	var Options = {};

	Options.SynonymManager = null;
    Options.FindFirstObjectOnly = true;

	if (userOptions)
		copyProperties (userOptions,Options);

    return FindNamedObjectsInArray (SourceArray,LookupPropertyOrProperties,LookupValue,Options);
}

function FindNamedObjectsInArray (SourceArray, LookupPropertyOrProperties, LookupValue, userOptions)
{
	var Options = {};

	Options.SynonymManager = null;
    Options.FindFirstObjectOnly = false;
    Options.CompareType = csWholeString;
    Options.MaxCompareLevel = psMax;

	if (userOptions)
		copyProperties (userOptions,Options);

	var Results = [];

	var LookupValuePreparedStrings = GetPreparedStrings (LookupValue,Options);

	LookupPropertyOrProperties = valueToArray (LookupPropertyOrProperties);

	for (var cCompareLevel = 0; cCompareLevel <= Options.MaxCompareLevel; cCompareLevel++)
	{
	    for (var cObject = 0; cObject < SourceArray.length; cObject++)
	    {
	        var tmpObject = SourceArray [cObject];

	        if (Results.contains (tmpObject))
	        	continue;

	        var DoesObjectMatchFindValue = false;

	        for (var cProperty = 0; cProperty < LookupPropertyOrProperties.length; cProperty++)
	        {
	            var tmpVal = getObjectProperty (tmpObject,LookupPropertyOrProperties [cProperty]);

	            if (tmpVal instanceof NameObject)
	            {
	            	var NameIndex = tmpVal.GetIndexOfPreparedString (LookupValuePreparedStrings [cCompareLevel],cCompareLevel,Options.CompareType);
					if (NameIndex >= 0)
					{
						Results.push (tmpObject);

						if (Options.FindFirstObjectOnly)
							return tmpObject;

						break;
					}
	            }
	        }
	    }
	}

    if (Options.FindFirstObjectOnly)
	    return null;
    else
        return Results;
}

function GetNamedObjectsNamesAsArray (SourceArray, LookupProperty)
{
	var results = [];

    for (var cObject = 0; cObject < SourceArray.length; cObject++)
    {
        var tmpObject = SourceArray [cObject];

        var tmpVal = getObjectProperty (tmpObject,LookupProperty);

        if (tmpVal instanceof NameObject)
        {
        	results.push (tmpVal.Name);
        }
	}

	return results;
}

function GetFirstNamedObjectStartAndEndIndexes (userString,namedObjectsArray,nameProperty)
{
	var firstObject = null;
	var firstObjectIndex = null;

	var earliestIndex = 0;

	for (var cObject = 0; cObject < namedObjectsArray.length; cObject ++)
	{
		var tmpObject = namedObjectsArray [cObject];

		var tmpObjectIndex = tmpObject [nameProperty || 'name'].GetStartAndEndIndexesOfName (userString,0,psLowerCase,csContainsSubString);

		if (tmpObjectIndex.startIndex > -1 && (tmpObjectIndex.startIndex < earliestIndex || earliestIndex == 0))
		{
			firstObject = tmpObject;
			firstObjectIndex = tmpObjectIndex;
			earliestIndex = tmpObjectIndex.startIndex;
		}
	}

	if (firstObject)
		return {object: firstObject, startIndex: firstObjectIndex.startIndex, endIndex: firstObjectIndex.endIndex};
	else
		return {object: null};
}

function GetNameObjectProperties (object)
{
	var results = [];

	for (var p in object)
	{
		if (object.hasOwnProperty (p) && object [p] instanceof NameObject)
			results.push (p);
	}

	return results;
}
