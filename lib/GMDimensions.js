function GMDimensions ()
{
	this.dimensionTypes = {}
	this.dimensionTypesArray = []
	this.initialiseDimensionTypes ()
}

function GMDimensionType (gmDimensions)
{
	this.gmDimensions = gmDimensions
	this.name = ''
	this.internalUnit = undefined
	this.defaultUnitSystem = undefined
	this.unitSystems = {}
	this.unitSystemsArray = []
	this.unitsArray = []
}

function GMDimensionUnitsSystem (dimensionType)
{
	this.dimensionType = dimensionType
	this.gmDimensions = dimensionType.gmDimensions
	this.name = ''
	this.unitsArray = []
	this.units = {}
	this.decimalPlaces = 8
}

function GMDimensionUnit (unitsSystem)
{
	this.unitsSystem = unitsSystem
	this.gmDimensions = unitsSystem.gmDimensions
	this.dimensionType = unitsSystem.dimensionType
	this.indexInUnitsSystem = unitsSystem.unitsArray.length
	this.name = ''
	this.multiplier = 1
	this.multiplierUnit = undefined
	this.firstUnitMultiplier = 1
	this.internalUnitMultiplier = 1
}

function GMDimensionValue (dimensionType)
{
	this.dimensionType = dimensionType
	this.unit = undefined
	this.unitValue = undefined
	this.decimalPlacesOverride = -1
	this.internalUnitValue = undefined
}

GMDimensions.prototype.createDimensionValue = function (value,pUnit,opDimensionType,opDecimalPlaces)
{
	var dimensionType
	if (pUnit instanceof GMDimensionUnit)
		dimensionType = pUnit.dimensionType
	else
		dimensionType = this.resolveDimensionTypeFunctionArgument (opDimensionType)

	if (isNotDefined (dimensionType))
		return undefined

	return dimensionType.createDimensionValue (value,pUnit,opDecimalPlaces)
}

GMDimensionType.prototype.createDimensionValue = function (value,pUnit,opDecimalPlaces)
{
	var unit = this.resolveUnitFunctionArgument (pUnit)
	var dimensionValue = new GMDimensionValue (this)

	if (isDefined (opDecimalPlaces))
		this.decimalPlacesOverride = opDecimalPlaces

	dimensionValue.setValue (value,unit)

	return dimensionValue
}

GMDimensionValue.prototype.setValue = function (value,opUnit,opDecimalPlaces)
{
	if (isDefined (opUnit))
		this.unit = this.dimensionType.resolveUnitFunctionArgument (opUnit)

	if (isDefined (opDecimalPlaces))
		this.decimalPlacesOverride = opDecimalPlaces

	var decimalPlaces = this.decimalPlacesOverride > -1 ? this.decimalPlacesOverride : this.unit.unitsSystem.decimalPlaces

/*
	this.unitValue = this.unit.gmDimensions.applyDecimalPlaces (decimalPlaces,value)
	this.internalUnitValue = this.dimensionType.convertUnitValueToInternalUnitValue (this.unitValue,this.unit,this.decimalPlaces ())
*/
	this.unitValue = value
	this.internalUnitValue = this.dimensionType.convertUnitValueToInternalUnitValue (this.unitValue,this.unit,this.decimalPlaces ())
}

GMDimensionValue.prototype.convertValueToUnit = function (pUnit)
{
	var newUnit = this.dimensionType.resolveUnitFunctionArgument (pUnit)
	var newUnitValue = this.dimensionType.convertValueFromUnit1ToUnit2 (this.unitValue,this.unit,newUnit,this.decimalPlaces ())
	this.setValue (newUnitValue,newUnit)
}

GMDimensions.prototype.getDimensionType = function (dimensionTypeName)
{
	return findObjectInArray (this.dimensionTypesArray,'name',dimensionTypeName)
}

GMDimensions.prototype.addDimensionType = function (name,unitSystems,internalUnitName,defaultUnitSystemName)
{
	var dimensionType = new GMDimensionType (this)
	dimensionType.name = name

	for (var c = 0; c < unitSystems.length; c ++)
	{
		var unitSystemData = unitSystems [c]
		dimensionType.addUnitSystem (unitSystemData [0],unitSystemData [1])
	}

	dimensionType.internalUnit = dimensionType.getUnit (internalUnitName)
	dimensionType.defaultUnitSystem = dimensionType.getUnitSystem (defaultUnitSystemName) || dimensionType.unitSystemsArray [0]

	dimensionType.calculateInternalUnitMultipliers ()

	this.dimensionTypesArray.push (dimensionType)
	this.dimensionTypes [name] = dimensionType
	return dimensionType
}

GMDimensions.prototype.applyDecimalPlaces = function (decimalPlaces,value)
{
	var dpFactor = Math.pow (10,decimalPlaces)
	
	if (dpFactor > 0)
		return Math.round (value * dpFactor) / dpFactor
	else
		return Math.round (value)
}

GMDimensions.prototype.resolveDimensionTypeFunctionArgument = function (dimensionType)
{
	if (typeof (dimensionType) === 'string')
		return this.getDimensionType (dimensionType)
	else
		return dimensionType
}

GMDimensionType.prototype.getUnit = function (unitName,unitSystem)
{
	if (unitSystem)
		return unitSystem.getUnit (unitName)
	else
		return findObjectInArray (this.unitsArray,'name',unitName)
}

GMDimensionType.prototype.getUnitSystem = function (unitSystemName)
{
	return findObjectInArray (this.unitSystemsArray,'name',unitSystemName)
}

GMDimensionType.prototype.addUnitSystem = function (unitSystemName,units)
{
	var unitSystem = new GMDimensionUnitsSystem (this)
	unitSystem.name = unitSystemName

	this.unitSystemsArray.push (unitSystem)
	this.unitSystems [unitSystem.name] = unitSystem

	if (units)
		unitSystem.addUnits (units)

	return unitSystem
}

GMDimensionType.prototype.calculateInternalUnitMultipliers = function ()
{
	for (var c = 0; c < this.unitSystemsArray.length; c ++)
	{
		var unitSystem = this.unitSystemsArray [c]

		unitSystem.calculateInternalUnitMultipliers ()
	}
}

GMDimensionType.prototype.convertUnitValueToInternalUnitValue = function (value,valueUnit,opDecimalPlaces)
{
	valueUnit = this.resolveUnitFunctionArgument (valueUnit)

	return this.convertValueFromUnit1ToUnit2 (value,valueUnit,this.internalUnit,opDecimalPlaces)
}

GMDimensionType.prototype.convertValueFromUnit1ToUnit2 = function (value,unit1,unit2,opDecimalPlaces)
{
	unit1 = this.resolveUnitFunctionArgument (unit1)
	unit2 = this.resolveUnitFunctionArgument (unit2)

	if (unit1.dimensionType !== this || unit2.dimensionType !== this)
		return undefined

	if (unit1 === unit2 || unit1.internalUnitMultiplier === unit2.internalUnitMultiplier)
		return value

	var result
	if (unit1.unitsSystem === unit2.unitsSystem)
		result = (value * unit1.firstUnitMultiplier) / unit2.firstUnitMultiplier
	else
		result = (value * unit1.internalUnitMultiplier) / unit2.internalUnitMultiplier

/*
	var decimalPlaces = getOptionalValue (opDecimalPlaces,unit2.unitsSystem.decimalPlaces)
	result = this.gmDimensions.applyDecimalPlaces (decimalPlaces,result)
*/

	return result
}

GMDimensionType.prototype.resolveUnitFunctionArgument = function (unit)
{
	if (typeof (unit) === 'string')
		return this.getUnit (unit)
	else
		return unit
}

GMDimensionUnitsSystem.prototype.getUnit = function (unitName)
{
	return findObjectInArray (this.unitsArray,'name',unitName)
}

GMDimensionUnitsSystem.prototype.addUnit = function (unitName,multiplier,multiplierUnitName)
{
	var unit = new GMDimensionUnit (this)
	unit.name = unitName

	unit.multiplier = getOptionalValue (multiplier,1)
	unit.multiplierUnit = multiplierUnitName ? this.dimensionType.getUnit (multiplierUnitName) : this.unitsArray.length ? this.unitsArray [unit.indexInUnitsSystem - 1] : undefined

	this.unitsArray.push (unit)
	this.units [unit.name] = unit
	this.dimensionType.unitsArray.push (unit)
	
	return unit
}

GMDimensionUnitsSystem.prototype.addUnits = function (units)
{
	for (var c = 0; c < units.length; c ++)
	{
		var unitData = units [c]

		if (unitData.length === 3)
			this.addUnit (unitData [0],unitData [1],unitData [2])
		else if (unitData.length === 2)
			this.addUnit (unitData [0],unitData [1])
		else
			this.addUnit (unitData [0])
	}

	this.calculateInternalUnitMultipliers ()
}

GMDimensionUnitsSystem.prototype.calculateInternalUnitMultipliers = function ()
{
	for (var c = 0; c < this.unitsArray.length; c ++)
	{
		var unit = this.unitsArray [c]
		if (unit === this.dimensionType.internalUnit) continue;

		if (unit.multiplierUnit)
		{
			if (unit.unitsSystem === unit.multiplierUnit.unitsSystem)
				unit.firstUnitMultiplier = unit.multiplier * unit.multiplierUnit.firstUnitMultiplier

			if (this.dimensionType.internalUnit)
				unit.internalUnitMultiplier = unit.multiplier * unit.multiplierUnit.internalUnitMultiplier
		}
		else
		{
			if (this.dimensionType.internalUnit)
				unit.internalUnitMultiplier = unit.firstUnitMultiplier / this.dimensionType.internalUnit.firstUnitMultiplier
		}
	}
}

GMDimensionValue.prototype.decimalPlaces = function ()
{
	return this.decimalPlacesOverride > -1 ? this.decimalPlacesOverride : this.unit.unitsSystem.decimalPlaces
}

GMDimensions.prototype.initialiseDimensionTypes = function ()
{
	this.addDimensionType ('time',[['default',[['ms'],['s',1000],['m',60],['h',60],['d',24],['w',7],['f',2],['y',31536000,'s'],['m',1/12,'y'],['c',100,'y']]]],'s')
	this.addDimensionType ('length',[
		['metric',[['mm'],['cm',10],['m',100],['km',1000]]],
		['imperial',[['inch',2.54,'cm'],['foot',12],['yard',3],['mile',1760]]]
	],'cm')
	this.addDimensionType ('mass',[
		['metric',[['kg'],['g',1/1000,'kg'],['mg',1/1000],['ton',1000,'kg'],['kiloton',1000,'ton'],['megaton',1000,'kiloton']]],
		['imperial',[['lbs',0.45359237,'kg'],['oz',0.028349523125,'kg'],['stone',6.35029318,'kg']]]
	],'kg')
}

var gmDimensions = new GMDimensions ()
