gmAddTestSuite ({
	name: 'main',
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
