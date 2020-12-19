// ------------------------------------------------------------
// file: src\GMContextDBAtoms.js


// end of file: src\GMContextDBAtoms.js

// ------------------------------------------------------------
// file: src\GMContextDBContext.js



// end of file: src\GMContextDBContext.js

// ------------------------------------------------------------
// file: src\GMContextDBManager.js

function GMContextDB ()
{
	this.contexts = []
	this.recordTypes = []
	this._private = new _GMContextDBPrivate ()
}

function _GMContextDBPrivate ()
{
	this.nextAtomId = 0
}

// end of file: src\GMContextDBManager.js

// ------------------------------------------------------------
// file: src\GMContextDBRecordType.js


// end of file: src\GMContextDBRecordType.js

// ------------------------------------------------------------
// file: src\GMContextDBRecordTypeProperty.js


// end of file: src\GMContextDBRecordTypeProperty.js

// ------------------------------------------------------------
// file: tests\GMContextDBTests.js

gmAddTestSuite ({
	name: 'GMContextDB',
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

// end of file: tests\GMContextDBTests.js

