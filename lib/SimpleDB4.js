// ------------------------------------------------------------
// file: src\SimpleDB.js

function SimpleDB ()
{
	this.recordTypes = []
	this.records = []
	this._ = new SimpleDB_ (this)
}

SimpleDB.prototype.createRecordType = function (pOptions)
{
	var options = Object.assign ({
		name: undefined
	},pOptions)

	var recordType = new SimpleDBRecordType (this)

	if (gmValues.isDefinedAndNotNull (options.name))
		recordType.name = new NameObject (options.name)

	this.recordTypes.push (recordType)

	return recordType
}

// end of file: src\SimpleDB.js

// ------------------------------------------------------------
// file: src\SimpleDBAtoms.js

function SimpleDBAtom (simpleDB)
{
	this.simpleDB = simpleDB
	this._ = {
		index: simpleDB._.getNextIndex ()
	}
}

function SimpleDBNamedAtom (simpleDB)
{
	SimpleDBAtom.call (this,simpleDB)

	this.name = undefined
}
gmObjects.inheritPrototype (SimpleDBNamedAtom,SimpleDBAtom)

// end of file: src\SimpleDBAtoms.js

// ------------------------------------------------------------
// file: src\SimpleDBInterchange.js


// end of file: src\SimpleDBInterchange.js

// ------------------------------------------------------------
// file: src\SimpleDBRecord.js

function SimpleDBRecord (simpleDB)
{
	SimpleDBAtom.call (this,simpleDB)
}
gmObjects.inheritPrototype (SimpleDBRecord,SimpleDBAtom)

// end of file: src\SimpleDBRecord.js

// ------------------------------------------------------------
// file: src\SimpleDBRecordType.js

function SimpleDBRecordType (simpleDB)
{
	SimpleDBNamedAtom.call (this,simpleDB)
}
gmObjects.inheritPrototype (SimpleDBRecordType,SimpleDBNamedAtom)

// end of file: src\SimpleDBRecordType.js

// ------------------------------------------------------------
// file: src\SimpleDB_.js

function SimpleDB_ (simpleDB)
{
	this.simpleDB = simpleDB
	this.nextIndex = 0
}

SimpleDB_.prototype.getNextIndex = function ()
{
	var nextIndex = this.nextIndex
	this.nextIndex ++

	return nextIndex
}

// end of file: src\SimpleDB_.js

// ------------------------------------------------------------
// file: tests\SimpleDB4Tests.js

gmAddTestSuite ({
	name: 'SimpleDB',
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

gmAddTest ('', function () {
	var s = new SimpleDB ()
	var rt1 = s.createRecordType ({name: 'recordType1'})
	console.log (rt1)
})

// end of file: tests\SimpleDB4Tests.js

