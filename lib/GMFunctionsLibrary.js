function createGMFunctionManager (fInitialiseGMFunctions)
{
	var gmFunctionManager = new GMFunctionManager ()
	gmFunctionManager.initialise (fInitialiseGMFunctions)
	return gmFunctionManager
}

function GMFunctionManager ()
{
	this.gmFunctions = []
	this.synonymManager = new SynonymManagerObject ()
}

function GMFunction (manager)
{
	this.gmFunctionManager = manager
	this.name = null
	this.options = new GMFunctionOptions (this)
	this.jsFunction = null
	this.jsOptimizedFunction = null
	this.parameters = []
	this.returnValue = null
}

function GMFunctionOptions (gmFunction)
{
	this.gmFunction = gmFunction
}

function GMFunctionParameter (gmFunction)
{
	this.gmFunction = gmFunction
	this.name = null
	this.expectedType = null
	this.value = undefined
	this.defaultValue = undefined
	this.optional = false
	this.resolved = false
}

GMFunctionManager.prototype.initialise = function (fInitialiseGMFunctions)
{
	this.initialiseSynonymManager ()
	if (isDefined (fInitialiseGMFunctions))
		fInitialiseGMFunctions (this)
}

GMFunctionManager.prototype.initialiseSynonymManager = function ()
{
	this.synonymManager.AddEntry (['each','every','all']);
}

GMFunctionManager.prototype.addGMFunction = function (params)
{
	var gmFunction = new GMFunction (this)

	gmFunction.name = new NameObject (params.name,this.synonymManager)

	if (isDefined (params.parameters))
	{
		for (var c = 0; c < params.parameters.length; c ++)
			gmFunction.addParameter (params.parameters [c])
	}

	if (isDefined (params.options))
	{
		copyProperties (params.options,gmFunction.options)
		gmFunction.options.gmFunction = gmFunction
	}
	gmFunction.jsFunction = params.jsFunction
	gmFunction.jsOptimizedFunction = params.jsOptimizedFunction

	this.gmFunctions.push (gmFunction)
}

GMFunctionManager.prototype.getGMFunction = function (name)
{
	return findObjectInArray (this.gmFunctions,'name',name)
}

GMFunctionManager.prototype.call = function (name,parameters)
{
	var gmFunction = this.getGMFunction (name)
	if (!gmFunction) return

	for (var c = 0; c < gmFunction.parameters.length; c ++)
		gmFunction.resetParameter (gmFunction.parameters [c])

	for (var parameterName in parameters)
	{
		var parameter = gmFunction.getParameter (parameterName)
		if (parameter)
		{
			parameter.value = parameters [parameterName]
			parameter.resolved = true
		}
	}

	gmFunction.jsFunction (gmFunction)
}

GMFunction.prototype.getParameter = function (name)
{
	return findObjectInArray (this.parameters,'name',name)
}

GMFunction.prototype.addParameter = function (parameterInfo)
{
	var parameter = new GMFunctionParameter (this)
	if (isDefined (parameterInfo))
	{
		copyCommonProperties (parameterInfo,parameter)
		parameter.name = new NameObject (parameterInfo.name,this.gmFunctionManager.synonymManager)
	}
	this.parameters.push (parameter)
}

GMFunction.prototype.resetParameter = function (parameter)
{
	parameter.value = undefined
	parameter.resolved = false
}
