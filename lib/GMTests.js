var gmTestsManager = new GMTestsManager ()

function gmAddTestSuite (pParams)
{
	return gmTestsManager.addTestSuite (pParams)
}

function gmAddTest (name,testFunction,testVariables)
{
	return gmTestsManager.currentTestSuite.addTest (name,testFunction,testVariables)
}

function GMTestsManager ()
{
	this.testSuites = []
	this.tests = []
	this.testsPassed = []
	this.testsFailed = []
	this.testSuitesPassed = []
	this.testSuitesFailed = []
	this.testSuitesNotTested = []
	this.disabledTestSuites = []

	this.currentTestSuite = null
	this.didAnyTestsFail = false
	this.halted = false

	this.options = {
		showTestSuiteSummaries : true,
		haltIfAnyTestFails : false,
		showSummaryOnHalt : true
	}
}

function GMTestSuite (testsManager)
{
	this.testsManager = testsManager

	this.enabled = true
	this.name = null
	this.tests = []
	this.testsPassed = []
	this.testsFailed = []

	this.didAnyTestsFail = false

	this.variables = {}
	this.preTestFunction = null
	this.postTestFunction = null
}

function GMTest (testsManager,testSuite)
{
	this.testsManager = testsManager
	this.testSuite = testSuite || null

	this.index = 0
	this.name = null

	this.variables = {}
	this.testFunction = null

	this.hasTestBeenRunYet = false
	this.testFunctionReturnValue = undefined
	this.failed = undefined
	this.failValues = undefined
	this.failHandled = false
	this.assertionsFailed = 0
}

GMTestsManager.prototype.getTestSuite = function (name)
{
	if (name === undefined || typeof name !== 'string')
		return null

	var lcName = name.toLowerCase ()

	for (var c = 0; c < this.testSuites.length; c ++)
	{
		var testSuite = this.testSuites [c]
		var lcTestSuiteName = testSuite.name.toLowerCase ()

		if (lcName === lcTestSuiteName)
			return testSuite
	}

	return null
}

GMTestsManager.prototype.addTestSuite = function (pParams)
{
	var testSuite = new GMTestSuite (this)

	if (pParams)
	{
		for (var key in pParams)
		{
		    if (pParams.hasOwnProperty (key))
		    	testSuite [key] = pParams [key]
		}
	}

	this.currentTestSuite = testSuite
	this.testSuites.push (testSuite)
	return testSuite
}

GMTestsManager.prototype.halt = function ()
{
	if (this.halted)
		return

	this.halted = true
}

GMTestsManager.prototype.reset = function ()
{
	this.halted = false

	this.testsPassed = []
	this.testsFailed = []
	this.testSuitesPassed = []
	this.testSuitesFailed = []
	this.testSuitesNotTested = []
	this.disabledTestSuites = []

	this.currentTestSuite = null
	this.didAnyTestsFail = false

	for (var c = 0; c < this.testSuites.length; c ++)
	{
		var testSuite = this.testSuites [c]

		testSuite.reset ()

		if (testSuite.enabled)
			this.testSuitesNotTested.push (testSuite)
		else
			this.disabledTestSuites.push (testSuite)
	}
}

GMTestsManager.prototype.runAllTestSuites = function ()
{
	return this.runAllTests ()
}

GMTestsManager.prototype.runTestSuites = function (testSuiteNames)
{
	if (testSuiteNames === undefined || testSuiteNames.constructor !== Array || !testSuiteNames.length)
		return this.runAllTestSuites ()

	for (var c = 0; c < testSuiteNames.length; c ++)
	{
		var testSuite = this.getTestSuite (testSuiteNames [c])
		if (testSuite)
			testSuite.runTests (true)
		else
			console.error (sprintf ('gmTestsManager:runTestSuites:Cannot find testSuite "%s".',testSuiteNames [c]))
	}
}

GMTestsManager.prototype.runTests = function ()
{
	return this.runAllTests ()
}

GMTestsManager.prototype.runAllTests = function ()
{
	console.log ('')
	console.log (sprintf ('gmTestsManager:Commencing testSuites.'))

	this.reset ()

	for (var c = 0; c < this.testSuites.length; c ++)
	{
		var testSuite = this.testSuites [c]

		if (testSuite.enabled)
		{
			testSuite.runTests ()

			if (testSuite.didAnyTestsFail && this.options.haltIfAnyTestFails)
			{
				if (this.options.showSummaryOnHalt)
					break
				else
					return
			}
		}
	}

	if (!this.halted)
	{
		if (this.options.showTestSuiteSummaries)
		{
			console.log ('')
			console.log ('gmTestsManager:All testSuites completed.')
			console.log ('')
		}
	}

	if (this.didAnyTestsFail)
	{
		console.error (sprintf ('gmTestsManager:Failed %d testSuites and %d tests.',this.testSuitesFailed.length,this.testsFailed.length))
		console.log ('Failed testSuites:',this.testSuitesFailed)
		console.log ('Failed tests:',this.testsFailed)
		console.log ('Passed testSuites:',this.testSuitesPassed)
		if (this.testSuitesNotTested.length)
			console.log ('TestSuites not tested yet due to halt:',this.testSuitesNotTested)
	}
	else
	{
		console.log (sprintf ('gmTestsManager:Passed all %d testSuites and all %d tests.',this.testSuitesPassed.length,this.testsPassed.length))
		console.log ('Passed testSuites:',this.testSuitesPassed)
	}

}

GMTestsManager.prototype.setAllTestSuitesEnabled = function (enabled)
{
	for (var c = 0; c < this.testSuites.length; c ++)
	{
		var testSuite = this.testSuites [c]
		testSuite.enabled = enabled
	}
}

GMTestsManager.prototype.setTestSuitesEnabled = function (testSuiteNames,enabled)
{
	if (testSuiteNames === undefined || testSuiteNames.constructor !== Array || !testSuiteNames.length)
		return

	for (var c = 0; c < testSuiteNames.length; c ++)
	{
		var testSuite = this.getTestSuite (testSuiteNames [c])
		if (testSuite)
			testSuite.enabled = enabled
		else
			console.error (sprintf ('gmTestsManager:setTestSuitesEnabled:Cannot find testSuite "%s".',testSuiteNames [c]))
	}
}

GMTestsManager.prototype.disableAllTestSuites = function ()
{
	return this.setAllTestSuitesEnabled (false)
}

GMTestsManager.prototype.enableAllTestSuites = function ()
{
	return this.setAllTestSuitesEnabled (true)
}

GMTestsManager.prototype.disableAllTestSuitesExcept = function (testSuiteNames)
{
	this.disableAllTestSuites ()
	this.enableTestSuites (testSuiteNames)
}

GMTestsManager.prototype.enableAllTestSuitesExcept = function (testSuiteNames)
{
	this.enableAllTestSuites ()
	this.disableTestSuites (testSuiteNames)
}

GMTestsManager.prototype.disableTestSuites = function (testSuiteNames)
{
	return this.setTestSuitesEnabled (testSuiteNames,false)
}

GMTestsManager.prototype.enableTestSuites = function (testSuiteNames)
{
	return this.setTestSuitesEnabled (testSuiteNames,true)
}

GMTestSuite.prototype.addTest = function (name,testFunction,testVariables)
{
	var test = new GMTest (this.testsManager,this)

	test.index = this.tests.length + 1 // indexes start at 1

	test.name = name
	test.testFunction = testFunction
	test.variables = testVariables || {}

	this.tests.push (test)
	return test
}

GMTestSuite.prototype.reset = function ()
{
	this.testsPassed = []
	this.testsFailed = []

	this.didAnyTestsFail = false

	this.variables = {}

	for (var c = 0; c < this.tests.length; c ++)
		this.tests [c].reset ()
}

GMTestSuite.prototype.runTests = function (opRunEvenIfTestSuiteIsDisabled)
{
	if (!(this.enabled || opRunEvenIfTestSuiteIsDisabled))
		return

	this.reset ()

	this.testsManager.currentTestSuite = this

	if (this.testsManager.options.showTestSuiteSummaries)
	{
		console.log ('')
		console.log (sprintf ('gmTestsManager:TestSuite "%s" commencing. Running %d tests.',this.name,this.tests.length))
	}

	for (var c = 0; c < this.tests.length; c ++)
	{
		var test = this.tests [c]

		test.runTest ()

		if (test.failed && this.testsManager.options.haltIfAnyTestFails)
		{
			if (this.testsManager.options.showSummaryOnHalt)
				break
			else
				return
		}
	}

	var tmpIndex = this.testsManager.testSuitesNotTested.indexOf (this)
	if (tmpIndex > -1)
		this.testsManager.testSuitesNotTested.splice (tmpIndex,1);

	if (this.didAnyTestsFail)
	{
		if (this.testsManager.testSuitesFailed.indexOf (this) < 0)
			this.testsManager.testSuitesFailed.push (this)

		console.log ('')
		console.error (sprintf ('gmTestsManager:TestSuite "%s" failed %d tests.',this.name,this.testsFailed.length))
		console.log ('Failed tests:',this.testsFailed)
		console.log ('Passed tests:',this.testsPassed)
	}
	else
	{
		if (this.testsManager.testSuitesPassed.indexOf (this) < 0)
			this.testsManager.testSuitesPassed.push (this)

		if (this.testsManager.options.showTestSuiteSummaries)
			console.log (sprintf ('gmTestsManager:TestSuite "%s" passed all %d tests.',this.name,this.testsPassed.length))
	}
}

GMTest.prototype.getFullTestName = function ()
{
	var fullName = sprintf ('%s: Test %d',this.testSuite.name,this.index)
	if (this.name && this.name.length)
		fullName += sprintf (':%s',this.name)

	return fullName
}

GMTest.prototype.reset = function ()
{
	this.hasTestBeenRunYet = false
	this.testFunctionReturnValue = undefined
	this.failed = false
	this.failValues = undefined
	this.failHandled = false
	this.assertionsFailed = 0
}

GMTest.prototype.runTest = function ()
{
	this.reset ()

	if (this.testSuite.preTestFunction)
		this.testSuite.preTestFunction (this)

	if (this.testFunction)
	{
		this.testFunctionReturnValue = this.testFunction (this,this.variables,this.testSuite.variables)

		if (this.testFunctionReturnValue === undefined && !this.failed)
		{
			this.testSuite.testsPassed.push (this)
			this.testsManager.testsPassed.push (this)
		}
		else
		{
			this.fail (null,true)
		}
	}

	this.hasTestBeenRunYet = true

	if (this.testSuite.postTestFunction)
		this.testSuite.postTestFunction (this.test)
}

GMTest.prototype.assert = function (pNoteOrAssertion,pAssertion)
{
	var note, assertion

	if (typeof pNoteOrAssertion === 'string')
	{
		note = pNoteOrAssertion
		assertion = pAssertion
	}
	else
	{
		note = null
		assertion = pNoteOrAssertion
	}

	if (!assertion)
	{
		if (note && note.length)
			console.error (sprintf ('gmTestsManager:Test "%s": Assertion "%s" failed.',this.getFullTestName (),note))
		else
			console.error (sprintf ('gmTestsManager:Test "%s": Assertion failed.',this.getFullTestName (),note))

		console.trace ('callStack: (see 2nd entry for actual error location)')

		this.assertionsFailed ++
		this.failed = true // do not call this.fail yet. allow multiple asserts to fail then handle this.failed after the test function
	}

	return assertion
}

GMTest.prototype.fail = function (pFailValues,pShowConsoleTrace)
{
	if (this.failHandled)
		return

	this.failHandled = true
	this.failed = true
	this.failValues = pFailValues

	this.testSuite.didAnyTestsFail = true
	this.testsManager.didAnyTestsFail = true

	if (this.testsManager.options.haltIfAnyTestFails)
		this.testsManager.halt ()

	this.testSuite.testsFailed.push (this)
	this.testsManager.testsFailed.push (this)
	if (this.testsManager.testSuitesFailed.indexOf (this.testSuite) < 0)
		this.testsManager.testSuitesFailed.push (this.testSuite)

	console.log ('')
	console.error (sprintf ('gmTestsManager:Test "%s" failed.',this.getFullTestName ()))

	// only show callstack if the test function explicitly returns !undefined
	// this is because calls to functions like assert do not exit the test function and there may be multiple failed asserts
	// so in this case, don't show the callstack because it isn't pointint at the test function anymore
	if (this.testFunctionReturnValue !== undefined && (pShowConsoleTrace === undefined || pShowConsoleTrace))
		console.trace ('callStack: (see 2nd entry for actual error location)')

	console.log ('')
	if (this.failValues)
		console.log ('failValues:',this.failValues)

	if (this.testFunctionReturnValue !== undefined)
		console.log ('testFunctionReturnValue:',this.testFunctionReturnValue)

	console.log ('test:',this)
	console.log ('testVariables:',this.variables)
	console.log ('testSuiteVariables:',this.testSuite.variables)

	if (this.testsManager.halted)
	{
		console.log ('')
		console.error (sprintf ('gmTestsManager:Testing halted due to failed test "%s".',this.getFullTestName ()))
		console.log ('')
	}
}
