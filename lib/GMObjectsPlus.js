function GMObject ()
{
	GMObjectAtom.apply (this)

}
inheritObjectFromParent (GMObject,GMObjectAtom)
function GMObjectAtom ()
{
	this._atom = new GMObjectAtom_ (this)
}

GMObjectAtom.prototype.addProperty = function (symbol,opParams)
{
	var params = {
		symbol: symbol || undefined,
		name : undefined,
		type: undefined,
	}

	if (isDefined (opParams))
		copyProperties (opParams,params)

	var property = new GMProperty (this)

	property.symbol = params.symbol
	if (isDefined (params.name))
		property.name = new NameObject (params.name)
	else if (isDefined (params.symbol))
		property.name = new NameObject (params.symbol)

	property.type = params.type

	this._atom.ensureProperties ()
	this._atom.propertiesManager.propertiesArray.push (property)
	this.properties [property.symbol] = property

	return property
}

GMObjectAtom.prototype.resolveToProperty = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	if (isObject (propertyOrPropertySelector))
	{
		if (propertyOrPropertySelector instanceof GMProperty)
			return propertyOrPropertySelector
		else
			return null
	}
	else
	{
		if (this.hasProperties ([],false))
		{
			var property = this._atom.propertiesManager.propertiesArray.findObject ('symbol',propertyOrPropertySelector)
			if (!property)
				property = this._atom.propertiesManager.propertiesArray.findObject ('name',propertyOrPropertySelector)

			if (property)
				return property
		}

		var recurseThroughParents = getOptionalValue (opRecurseThroughParents,true)

		return (recurseThroughParents && isDefined (this._atom.parentAtom)) ? this._atom.parentAtom.resolveToProperty (propertyOrPropertySelector,recurseThroughParents) : null
	}
}

GMObjectAtom.prototype.getProperty = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	return this.resolveToProperty (propertyOrPropertySelector,opRecurseThroughParents)
}

GMObjectAtom.prototype.hasProperty = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	var property = this.resolveToProperty (propertyOrPropertySelector,opRecurseThroughParents)

	return (isDefined (property))
}

GMObjectAtom.prototype.hasProperties = function (opPropertyOrProperties,opRecurseThroughParents)
{
	var recurseThroughParents = getOptionalValue (opRecurseThroughParents,true)

	if (this._atom.hasProperties () && this._atom.propertiesManager.propertiesArray.isNotEmpty ())
	{
		var properties = gmArrays.convertValueToArray (opPropertyOrProperties)

		if (gmArrays.isEmpty (properties))
			return true
		else
		{
			for (var c = 0; c < properties.length; c ++)
			{
				if (!this.hasProperty (properties [c],recurseThroughParents))
					return false
			}

			return true
		}
	}
	else
		return (recurseThroughParents && isDefined (this._atom.parentAtom)) ? this._atom.parentAtom.hasProperties (opPropertyOrProperties,recurseThroughParents) : false
}

GMObjectAtom.prototype.resolveToPropertyValue = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	if (isObject (propertyOrPropertySelector))
	{
		if (propertyOrPropertySelector instanceof GMPropertyValue)
			return propertyOrPropertySelector
		else
			return null
	}
	else
	{
		var property = this.resolveToProperty (propertyOrPropertySelector,opRecurseThroughParents)

		if (this.hasPropertyValues ([],false))
		{
			var propertyValue = this._atom.propertyValuesManager.propertyValuesArray.findObject ('property',property)

			if (propertyValue)
				return propertyValue
		}

		return (recurseThroughParents && isDefined (this._atom.parentAtom)) ? this._atom.parentAtom.resolveToPropertyValue (propertyOrPropertySelector,recurseThroughParents) : null
	}
}

GMObjectAtom.prototype.getPropertyValue = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	return this.resolveToPropertyValue (propertyOrPropertySelector,opRecurseThroughParents)
}

GMObjectAtom.prototype.createPropertyValue = function (propertyOrPropertySelector)
{
	var property = this.getProperty (propertyOrPropertySelector,true)
	var propertyValue = this.getPropertyValue (property,false)
	if (propertyValue)
		return propertyValue

	propertyValue = new GMPropertyValue ()
	propertyValue.property = property

	this._atom.ensurePropertyValuesManager ()
	this._atom.propertyValuesManager.propertyValuesArray.push (propertyValue)
	return propertyValue
}

GMObjectAtom.prototype.setPropertyValue = function (propertyOrPropertySelector,value)
{
	var property = this.getProperty (propertyOrPropertySelector,true)

	var propertyValue = this.getPropertyValue (property,false)
	if (!propertyValue)
		propertyValue = this.createPropertyValue (property)

	propertyValue.value = value

	return propertyValue
}

GMObjectAtom.prototype.hasPropertyValue = function (propertyOrPropertySelector,opRecurseThroughParents)
{
	var propertyValue = this.resolveToPropertyValue (propertyOrPropertySelector,opRecurseThroughParents)

	return (isDefined (propertyValue))
}

GMObjectAtom.prototype.hasPropertyValues = function (opPropertyOrProperties,opRecurseThroughParents)
{
	var recurseThroughParents = getOptionalValue (opRecurseThroughParents,true)

	if (this._atom.hasPropertyValuesManager () && this._atom.propertyValuesManager.propertyValuesArray.isNotEmpty ())
	{
		var properties = gmArrays.convertValueToArray (opPropertyOrProperties)

		if (gmArrays.isEmpty (properties))
			return true
		else
		{
			for (var c = 0; c < properties.length; c ++)
			{
				if (!this.hasPropertyValue (properties [c],recurseThroughParents))
					return false
			}

			return true
		}
	}
	else
		return (recurseThroughParents && isDefined (this._atom.parentAtom)) ? this._atom.parentAtom.hasPropertyValues (opPropertyOrProperties,recurseThroughParents) : false
}
function GMObjectAtomRecursor ()
{
	
}
function GMObjectAtomsManager (gmObjectsGlobal)
{
	this.gmObjectsGlobal = gmObjectsGlobal

	this.nextObjectId = 0
	this.getNextObjectId = function () {var nextId = this.nextObjectId; this.nextObjectId ++; return nextId}

	this.nextObjectTypeId = 0
	this.getNextObjectTypeId = function () {var nextId = this.nextObjectTypeId; this.nextObjectTypeId ++; return nextId}
}
function GMObjectAtom_ (gmObjectAtom)
{
	this.gmObjectAtom = gmObjectAtom
	this.propertiesManager = undefined
	this.propertyValuesManager = undefined
	this.parentAtom = undefined
}

function GMObjectAtom_PropertiesManager ()
{
	this.propertiesArray = gmArrays.newGMArray ()
}

function GMObjectAtom_PropertyValuesManager ()
{
	this.propertyValuesArray = gmArrays.newGMArray ()
}

GMObjectAtom_.prototype.hasProperties = function ()
{
	return (isDefined (this.propertiesManager))
}

GMObjectAtom_.prototype.ensureProperties = function ()
{
	if (!this.hasProperties ())
	{
		this.gmObjectAtom.properties = {}
		this.propertiesManager = new GMObjectAtom_PropertiesManager ()
	}

	return this
}

GMObjectAtom_.prototype.hasPropertyValues = function ()
{
	return (isDefined (this.propertyValuesManager))
}

GMObjectAtom_.prototype.ensurePropertyValues = function ()
{
	if (!this.hasPropertyValues ())
	{
		this.gmObjectAtom.propertyValues = {}
		this.propertyValuesManager = new GMObjectAtom_PropertyValuesManager ()
	}

	return this
}
function GMObjectGroupAtom ()
{
	GMObjectAtom.apply (this)

	this._groupAtom = new GMObjectGroupAtom_ ()

	this.symbol = undefined
	this.name = undefined

	this.objectTypes = {}
}
inheritObjectFromParent (GMObjectGroupAtom, GMObjectAtom)

GMObjectGroupAtom.prototype.createObjectType = function (symbol,opParams)
{
	var params = {
		symbol: symbol || undefined,
		name : undefined,
		constructor : undefined,
		objectConstructor : undefined,
	}

	if (isDefined (opParams))
		copyProperties (opParams,params)

	var objectType
	if (isDefined (params.constructor))
		objectType = new params.constructor ()
	else
		objectType = new GMObjectType ()

	objectType.symbol = params.symbol
	if (isDefined (params.name))
		objectType.name = new NameObject (params.name)
	else if (isDefined (params.symbol))
		objectType.name = new NameObject (params.symbol)

	objectType._atom.parentAtom = this
	if (isDefined (params.objectConstructor))
		objectType.objectConstructor = params.objectConstructor

	this.objectTypes [symbol] = objectType
	this._groupAtom.objectTypesArray.push (objectType)

	return objectType
}
function GMObjectGroupAtom_ ()
{
	this.objectTypesArray = []
}
var gmObjects = new GMObjectsGlobal ()

function isGMObject (object)
{
	return gmObjects.isGMObject (object)
}
function GMObjectsGlobal ()
{
	this._ = new GMObjectsGlobal_ (this)
}

function GMObjectsGlobal_ (gmObjectsGlobal)
{
	this.gmObjectsGlobal = gmObjectsGlobal
	this.objectAtomsManager = new GMObjectAtomsManager (this)
}

GMObjectsGlobal.prototype.isObject = function (val)
{
    if (!isDefined (val)) return false
    return (typeof val === 'object' && val instanceof Object)
}

GMObjectsGlobal.prototype.isObjectOfType = function (val,constructor)
{
    return (this.isObject (val) && val instanceof constructor)
}

GMObjectsGlobal.prototype.isUntypedObject = function (val)
{
    return (this.isObject (val) && val.constructor === Object)
}

GMObjectsGlobal.prototype.isGMObject = function (object)
{
	return this.isObjectOfType (object,GMObject)
}
function GMObjectsDB (symbol,names)
{
	GMObjectGroupAtom.apply (this,[symbol,names])

}
inheritObjectFromParent (GMObjectsDB,GMObjectGroupAtom)
function GMObjectType ()
{
	GMObjectGroupAtom.apply (this)

	this.objectConstructor = undefined
	this.objects = newGMArray ()
}
inheritObjectFromParent (GMObjectType,GMObjectGroupAtom)

GMObjectType.prototype.createObject = function (opConstructor)
{
	var constructor = opConstructor || this.objectConstructor || GMObject

	var object = new constructor ()

	object._atom.parentAtom = this
	object.objectType = this
	
	this.objects.push (object)
	return object
}
function GMProperty (gmObjectAtom)
{
	this.gmObjectAtom = gmObjectAtom

	this.symbol = undefined
	this.name = undefined
	this.type = undefined
	this.defaultValue = undefined
}

function GMPropertyValue ()
{
	this.property = undefined
	this.value = undefined
}

GMPropertyValue.prototype.setValue = function (value)
{
	this.value = value
}

GMPropertyValue.prototype.getValue = function ()
{
	return this.value
}
