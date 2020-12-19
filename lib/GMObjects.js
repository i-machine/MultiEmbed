// ------------------------------------------------------------
// file: src\GMObjects-global.js

var gmObjects = new GMObjects ()

// end of file: src\GMObjects-global.js

// ------------------------------------------------------------
// file: src\GMObjects-main.js

function GMObjects ()
{

}

GMObjects.prototype.inheritPrototype = function (childPrototype,parentPrototype)
{
    childPrototype.prototype = Object.create (parentPrototype.prototype)
}

GMObjects.prototype.copy = 
GMObjects.prototype.copyOf = 
GMObjects.prototype.getCopy = 
GMObjects.prototype.getCopyOf = 
GMObjects.prototype.clone = 
GMObjects.prototype.cloneOf = 
GMObjects.prototype.getClone = 
GMObjects.prototype.getCloneOf = function (object)
{
	var clone = Object.assign ({},object)

	return clone
}

GMObjects.prototype.copyProperties = function (sourceObject,destinationObject,properties,ignoreRangeChecks)
{
	var workingProperties = [];
	var hasOwnPropertyCheckDone = false;

	if (properties)
		workingProperties = gmArrays.convertValueToArray (properties);
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

GMObjects.prototype.getCommonProperties = function (objects,excludeProperties)
{
	var results = [];
	var workingExcludeProperties = null;

	if (excludeProperties)
		workingExcludeProperties = gmArrays.convertValueToArray (excludeProperties);

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

GMObjects.prototype.copyCommonProperties = function (sourceObject,destinationObject,excludeProperties)
{
	var commonProperties = this.getCommonProperties ([sourceObject,destinationObject],excludeProperties);

	this.copyProperties (sourceObject,destinationObject,commonProperties,true);
}

// end of file: src\GMObjects-main.js

// ------------------------------------------------------------
// file: src\GMObjects-morphs.js


// end of file: src\GMObjects-morphs.js

// ------------------------------------------------------------
// file: tests\GMObjectsTests.js

gmAddTestSuite ({
	name: 'gmObjects',
	enabled: true,
	variables: {},
	preTestFunction: undefined,
	postTestFunction: undefined
})

// end of file: tests\GMObjectsTests.js

