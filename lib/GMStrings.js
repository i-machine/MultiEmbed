// ------------------------------------------------------------
// file: src\GMStrings-global.js

var gmStrings = new GMStrings ()


// end of file: src\GMStrings-global.js

// ------------------------------------------------------------
// file: src\GMStrings-main.js

function GMStrings ()
{
}

GMStrings.prototype.trim = function (s)
{
    return s.replace (/^\s+|\s+$/g, '')
}

GMStrings.prototype.isEmpty = function (s)
{
	return !s.length
}

GMStrings.prototype.isEmptyIfTrimmed = function (s)
{
	return this.isEmpty () || this.isEmpty (this.trim (s))
}

GMStrings.prototype.isDefinedAndNotEmpty = function (s)
{
	return gmValues.isDefined (s) && !this.isEmpty (s)
}

// end of file: src\GMStrings-main.js

// ------------------------------------------------------------
// file: src\GMStrings-morphs.js



// end of file: src\GMStrings-morphs.js

// ------------------------------------------------------------
// file: tests\GMStringsTests.js

gmAddTestSuite ({
	name: '',
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

// end of file: tests\GMStringsTests.js

