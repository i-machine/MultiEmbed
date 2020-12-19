function inheritObjectFromParent (child, parent)
{
    child.prototype = Object.create (parent.prototype)
}

function getObjectProperty (o, s)
{
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

function getPropertyValueFromDotNotationString (propertyName,object)
{
  var parts = propertyName.split( "." ),
    length = parts.length,
    i,
    property = object || this;

  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }

  return property;
}

function renameProperties (obj, newKeys)
{
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[key] || key;
    return { [newKey]: obj[key] };
  });
  return Object.assign({}, ...keyValues);
}

function copyProperties (sourceObject,destinationObject,properties,ignoreRangeChecks)
{
	var workingProperties = [];
	var hasOwnPropertyCheckDone = false;

	if (properties)
		workingProperties = valueToArray (properties);
	else
	{
		for (var key in sourceObject)
		{
		    if (sourceObject.hasOwnProperty (key))
				workingProperties.push (key);
		}
		hasOwnPropertyCheckDone = true;
	}

	for (var cProperty = 0; cProperty < workingProperties.length; cProperty ++)
	{
		var key = workingProperties [cProperty];

		if (ignoreRangeChecks || hasOwnPropertyCheckDone || sourceObject.hasOwnProperty (key))
			destinationObject [key] = sourceObject [key];
	}
}

function copyCommonProperties (sourceObject,destinationObject,excludeProperties)
{
	var commonProperties = getCommonProperties ([sourceObject,destinationObject],excludeProperties);

	copyProperties (sourceObject,destinationObject,commonProperties,true);
}

function getObjectProperties (object,userParams)
{
	var params = {};

	params.properties = [];
	params.excludeProperties = [];
	params.hasOwnProperty = true;
	params.propertyValueType = '';
	params.includeFunctions = false;

	if (userParams)
		copyProperties (userParams,params);

	function includeAllProperties ()
	{
		if (!object)
			return false;

		for (var property in object)
		{
			if (params.hasownProperty && !object.hasOwnProperty (property))
				continue;

			workingProperties.push (property);
		}
	}

	function processFunctions ()
	{
		if (!params.includeFunctions)
		{
			for (var cProperty = 0; cProperty < workingProperties.length; cProperty ++)
			{
				var property = workingProperties [cProperty];
				var propertyValue = object [property];

				if (propertyValue && typeof propertyValue === 'function')
					params.excludeProperties.pushIfNew (property);
			}
		}
	}

	function processWorkingProperties ()
	{
		for (var cProperty = 0; cProperty < workingProperties.length; cProperty ++)
		{
			var property = workingProperties [cProperty];

			if (params.excludeProperties && params.excludeProperties.indexOf (property) > -1)
				continue;

			var propertyValue = object [property];

			if (params.propertyValueType && params.propertyValueType.length && !(typeof propertyValue == params.propertyValueType || isNumeric (propertyValue)))
				continue;

			results.push (property);
		}
	}


	var results = [];
	var workingProperties = [];

	if (!params.properties || params.properties.length == 0)
		includeAllProperties ();
	else
		workingProperties = params.properties;

	processFunctions ();
	processWorkingProperties ();

	return results;
}

function getCommonProperties (objects,excludeProperties)
{
	var results = [];
	var workingExcludeProperties = null;

	if (excludeProperties)
		workingExcludeProperties = valueToArray (excludeProperties);

	for (var c = 0; c < objects.length - 1; c ++)
	{
		var o1 = objects [c];
		var o2 = objects [c + 1];

		for (var key in o1)
		{
		    if (o1.hasOwnProperty (key) && o2.hasOwnProperty (key))
		    {
				if (!(workingExcludeProperties && workingExcludeProperties.indexOf (key) > -1))
					results.push (key);
			}
		}
	}

	return results;
}

function getNormalisedObjectProperties (object,userParams)
{
	return getObjectProperties (object,userParams);
}

function setObjectPropertyValues (object,properties,value)
{
	if (!object)
		return false;

	for (var cProperty = 0; cProperty < properties.length; cProperty ++)
	{
		var property = properties [cProperty];

		object [property] = value;
	}
}

function normalisePropertyNameFromAliases (object,propertyName,propertyAliases)
{
	if (object.hasOwnProperty (propertyName))
		return object;

	for (var cAlias = 0; cAlias < propertyAliases.length; cAlias ++)
	{
		var propertyAlias = propertyAliases [cAlias];

		if (object.hasOwnProperty (propertyAlias))
		{
			object [propertyName] = object [propertyAlias];
			delete object [propertyAlias];

			return object;
		}
	}

	return object;
}

function convertSingularPropertiesToPlural (object,propertiesOrPropertyPairs)
{
    for (var cPropertyPair = 0; cPropertyPair < propertiesOrPropertyPairs.length; cPropertyPair ++)
    {
        var propertyPair = propertiesOrPropertyPairs [cPropertyPair];
        var singularProperty;
        var pluralProperty = null;

        if (typeof propertyPair === 'string')
            singularProperty = propertyPair;
        else
        {
            singularProperty = propertyPair [0];

            if (propertyPair.length == 2 && isDefinedAndNotEmpty (propertyPair [1]))
                pluralProperty = propertyPair [1];
        }

        if (!pluralProperty)
            pluralProperty = singularProperty + 's';

        object = normalisePropertyNameFromAliases (object,pluralProperty,[singularProperty]);
        object [pluralProperty] = getValueAsArray (object [pluralProperty]);
    }

    return object;
}

function convertSingularPropertyToPlural (object,singularProperty,pPluralProperty)
{
    var pluralProperty = pPluralProperty || null;

    convertSingularPropertiesToPlural (object,[[singularProperty,pluralProperty]]);

    return object;
}

function ensurePluralProperties (object,pluralPropertiesOrPropertyPairs)
{
    for (var cPropertyPair = 0; cPropertyPair < pluralPropertiesOrPropertyPairs.length; cPropertyPair ++)
    {
        var propertyPair = pluralPropertiesOrPropertyPairs [cPropertyPair];
        var singularProperty = null;
        var pluralProperty = '';

        if (typeof propertyPair === 'string')
            pluralProperty = propertyPair;
        else
        {
            pluralProperty = propertyPair [0];

            if (propertyPair.length == 2 && isDefinedAndNotEmpty (propertyPair [1]))
                singularProperty = propertyPair [1];
        }

        ensurePluralProperty (object,pluralProperty,singularProperty);
    }

    return object;
}

function ensurePluralProperty (object,pluralProperty,pSingularProperty)
{
	var propertyUpdated = false;

	function tryProperty (singularProperty)
	{
		if (object.hasOwnProperty (singularProperty))
		{
			convertSingularPropertyToPlural (object,singularProperty,pluralProperty);

			propertyUpdated = true;
		}
	}

	if (isDefinedAndNotEmpty (pSingularProperty))
		tryProperty (pSingularProperty);

	if (!propertyUpdated)
	{
		var computedSingularProperty = ConvertWordToSingularForm (pluralProperty);

		tryProperty (computedSingularProperty);
	}

	if (!propertyUpdated)
        object [pluralProperty] = getValueAsArray (object [pluralProperty]);

	return object;
}
