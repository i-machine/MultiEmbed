// ------------------------------------------------------------
// file: src\GMValues-global.js

var gmValues = new GMValues ()

// end of file: src\GMValues-global.js

// ------------------------------------------------------------
// file: src\GMValues-main.js

function GMValues ()
{
}

GMValues.prototype.isDefined = function (v)
{
	return v !== undefined
}

GMValues.prototype.isUndefined = function (v)
{
	return v === undefined
}

GMValues.prototype.isNull = function (v)
{
	return v === null
}

GMValues.prototype.isNotNull = function (v)
{
	return v !== null
}

GMValues.prototype.isDefinedAndNotNull = function (v)
{
	return this.isDefined (v) && this.isNotNull (v)
}

GMValues.prototype.isUndefinedOrNull = function (v)
{
	return this.isUndefined (v) && this.isNull (v)
}

GMValues.prototype.isArray = function (v)
{
	return this.isDefined (v) && typeof v === 'array'
}

GMValues.prototype.isObject = function (v)
{
	return this.isDefined (v) && typeof v === 'array' && v instanceof Object
}

GMValues.prototype.isNumber = function (v)
{
	return this.isDefined (v) && typeof v === 'number'
}

GMValues.prototype.isString = function (v)
{
	return this.isDefined (v) && typeof v === 'string'
}

GMValues.prototype.isFunction = function (v)
{
	return this.isDefined (v) && typeof v === 'function'
}

GMValues.prototype.isJQueryElement = function (v)
{
    return this.isObject (v) && v instanceof jQuery
}

GMValues.prototype.isHtmlElement = function (v)
{
    return this.isObject (v) && v instanceof Element
}

GMValues.prototype.getValueIfDefined = function (v,vIfVUndefined)
{
	if (this.isDefined (v))
		return v
	else
		return vIfVUndefined
}

GMValues.prototype.getValueIfNotNull = function (v,vIfVNull)
{
	if (this.isDefinedAndNotNull (v))
		return v
	else
		return vIfVNull
}

// end of file: src\GMValues-main.js

// ------------------------------------------------------------
// file: src\GMValues-morphs.js

GMValues.prototype.isSomething = function (v)
{
	return this.isDefinedAndNotNull (v)
}

GMValues.prototype.isNothing = function (v)
{
	return this.isUndefinedOrNull (v)
}

GMValues.prototype.convertValueToArray = GMValues.prototype.valueToArray = function (value,convertCSV)
{
	return gmArrays.convertValueToArray (value,convertCSV)
}

GMValues.prototype.getOptionalValue = GMValues.prototype.getValueOrDefault = gmValues.getValueIfDefined

// end of file: src\GMValues-morphs.js

// ------------------------------------------------------------
// file: tests\GMValuesTests.js

gmAddTestSuite ({
	name: 'gmValues',
	enabled: true,
	variables: {},
	preTestFunction: undefined,
	postTestFunction: undefined
})

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

gmAddTest ('',function () {
})

// end of file: tests\GMValuesTests.js

