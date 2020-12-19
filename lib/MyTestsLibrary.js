function TestsManager (code)
{
	this.code = code || 'Tests';
	this.tests = [];
	this.testGroups = [];

	this.didLastTestFail = false;

	this.options = {};
	this.options.failIfTestNotFound = true;
	this.options.reportIndividualTests = true;
	this.options.reportTestsSummary = true;
}

function TestGroup (manager)
{
	this.manager = manager;
	this.index = -1;
	this.code = '';
	this.tests = [];
}

function Test (manager)
{
	this.manager = manager;
	this.index = -1;
	this.code = '';
	this.groups = [];
	this.testFunction = null;
	this.hasTestBeenRunYet = false
}

TestsManager.prototype.addTestGroup = function (testGroupProperties)
{
	var testGroup = new TestGroup (this);

	if (isDefined (testGroupProperties))
		copyProperties (testGroupProperties,testGroup);

	if (isDefinedAndNotEmpty (testGroup.code))
		this [testGroup.code] = testGroup;

	this.testGroups.push (testGroup);

	return testGroup;
}

TestsManager.prototype.addTest = function (testProperties,testFunction)
{
	if (typeof testProperties === 'function')
		return this.addTest ({},testProperties);

	var test = new Test (this);

	if (isDefined (testProperties))
		copyProperties (testProperties,test);

	for (var cGroup = 0; cGroup < test.groups.length; cGroup ++)
	{
		var testGroupOrindexOrCode = test.groups [cGroup];
		test.groups [cGroup] = this.getTestGroup (testGroupOrindexOrCode);

		var testGroup = test.groups [cGroup];
		testGroup.tests.push (test);
	}

	test.testFunction = testFunction;

	this.tests.push (test);

	return test;
}

TestsManager.prototype.runAllTests = function ()
{
	return this.runTests (this.tests);
}

TestsManager.prototype.runTests = function (tests)
{
	if (this.didLastTestFail)
		return false;

	if (tests.length == 0)
		return true;

	console.log ('----------------------------------------');
	console.log (sprintf ('Test suite: %s',this.code))
	console.log (sprintf ('Running %d tests',tests.length))

	for (var c = 0; c < tests.length; c ++)
	{
		var test = tests [c];
		this.runTest (test);

		if (this.didLastTestFail)
			return false;
	}

	if (!this.didLastTestFail && this.options.reportTestsSummary)
		this.reportRunTestsSuccess (tests);
}

TestsManager.prototype.runTest = function (testOrindexOrCode)
{
	if (this.didLastTestFail)
		return false;

	var test = this.getTest (testOrindexOrCode);

	if (test == null)
	{
		this.throwError (null,'CANNOT FIND TEST ' + testOrindexOrCode.toString (),!this.options.failIfTestNotFound);
		return false;
	}

	if (this.options.reportIndividualTests)
		console.log ('Commencing test: ', this.getTestLongName (test));

	var testResult = false;

	try
	{
		testResult = test.testFunction ();
		if (isDefined (testResult) && testResult === false)
		{
			this.throwError (test,'');
			return false;
		}
		else
		{
			if (this.options.reportIndividualTests)
				console.log ('Completed test: ', this.getTestLongName (test));
		}
	}
	catch (err)
	{
		this.throwError (test,err);
		return false;
	}

	return testResult;
}

TestsManager.prototype.getTest = function (testOrindexOrCode)
{
	if (testOrindexOrCode instanceof Test)
		return testOrindexOrCode;

	var indexMode = false;
	var codeMode = false;

	if (typeof testOrindexOrCode === 'number')
		indexMode = true;
	else if (typeof testOrindexOrCode === 'string')
		codeMode = true;
	else
		return null;

	for (var c = 0; c < this.tests.length; c ++)
	{
		var test = this.tests [c];

		if (indexMode && test.index === testOrindexOrCode)
			return test;

		if (codeMode && test.code === testOrindexOrCode)
			return test;
	}

	return null;
}

TestsManager.prototype.getTestGroup = function (testGroupOrindexOrCode)
{
	if (testGroupOrindexOrCode instanceof TestGroup)
		return testGroupOrindexOrCode;

	var indexMode = false;
	var codeMode = false;

	if (typeof testGroupOrindexOrCode === 'number')
		indexMode = true;
	else if (typeof testGroupOrindexOrCode === 'string')
		codeMode = true;
	else
		return null;

	for (var c = 0; c < this.testGroups.length; c ++)
	{
		var testGroup = this.testGroups [c];

		if (indexMode && testGroup.index === testGroupOrindexOrCode)
			return testGroup;

		if (codeMode && testGroup.code === testGroupOrindexOrCode)
			return testGroup;
	}

	return null;
}

TestGroup.prototype.runAllTests = function ()
{
	return this.manager.runTests (this.tests);
}

TestsManager.prototype.getTestLongName = function (test)
{
	var longName = 'test';

	if (test.index > -1)
		longName += ' ' + test.index.toString ();

	if (isDefinedAndNotEmpty (test.code))
		longName += ' "' + test.code + '"';

	return longName;
}

TestsManager.prototype.getGroupLongName = function (group)
{
	var longName = 'group';

	if (group.index > -1)
		longName += ' ' + group.index.toString ();

	if (isDefinedAndNotEmpty (group.code))
		longName += ' "' + group.code + '"';

	return longName;
}

Test.prototype.throwError = function (errorMessage,allowContinuation)
{
	return this.manager.throwError (this,errorMessage,allowContinuation);
}

TestsManager.prototype.throwError = function (test,errorMessage,allowContinuation)
{
	if (!allowContinuation)
		this.didLastTestFail = true;

	console.log ('');
	console.error ('========================================');

	if (isDefinedAndNotEmpty (errorMessage))
		console.error (errorMessage);

	if (test)
		console.error (this.getTestLongName (test), ' FAILED!');

	console.error ('========================================');
}

TestsManager.prototype.reportRunTestsSuccess = function (tests)
{
	console.log ('');
	console.log (tests.length + ' tests completed. Success!');
	console.log ('----------------------------------------');
}
