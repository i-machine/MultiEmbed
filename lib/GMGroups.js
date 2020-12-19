// ------------------------------------------------------------
// file: src\GMGroup.js

function GMGroup (gmGroups)
{
	this.groups = gmGroups
	this.id = -1
	this._name = null
	this.contents = []
	this.isGroupIntersection = false
	this.intersectionGroups = []
	this.parentGroups = []
	this.childGroups = []
}

GMGroup.prototype.name = function ()
{
	if (this.isGroupIntersection)
		return this.groups.groupsToNamesString (this.intersectionGroups,':')
	else
		return this._name.Name
}

GMGroup.prototype.addChildGroup = function (childGroup)
{
	if (this.childGroups.contains (childGroup)) return

	this.childGroups.push (childGroup)
	childGroup.parentGroups.push (this)

	return this
}
GMGroup.prototype.addChildGroups = function (childGroups)
{
	var paramsArray = convertArgumentsToArray (arguments)
	paramsArray.forEach ((childGroup) => {this.addChildGroup (childGroup)})
}

GMGroup.prototype.addParentGroup = function (parentGroup)
{
	if (this.parentGroups.contains (parentGroup)) return this

	this.parentGroups.push (parentGroup)
	parentGroup.childGroups.push (this)

	return parentGroup
}

GMGroup.prototype.createChildGroup = function (childGroupName)
{
	var childGroup = this.groups.createGroup (childGroupName)

	this.addChildGroup (childGroup)

	return childGroup
}

GMGroup.prototype.isChildGroupOfGroup = function (group)
{
	return this.groups.isGroupAChildOfGroupB (this,group)
}

GMGroup.prototype.isParentGroupOfGroup = function (group)
{
	return this.groups.isGroupAParentOfGroupB (this,group)
}

GMGroup.prototype.isChildOfGroup = function (group)
{
	return this.groups.isGroupAChildOfGroupB (this,group)
}

GMGroup.prototype.isParentOfGroup = function (group)
{
	return this.groups.isGroupAParentOfGroupB (this,group)
}

// end of file: src\GMGroup.js

// ------------------------------------------------------------
// file: src\GMGroupFinder.js

function GMGroupFinder (gmGroupsManager)
{
	GMGroupRecurser.call (this, gmGroupsManager)

	this.findOneOnly = true
	this.matchFunction = undefined
}
inheritObjectFromParent (GMGroupFinder, GMGroupRecurser)

GMGroupFinder.prototype.performFind = function (pMatchFunction)
{
	var groupFinder = this

	groupFinder.matchFunction = getOptionalValue (pMatchFunction,groupFinder.matchFunction)

	groupFinder.performRecursionFunction (function (groupFinder,group) {
		if (groupFinder.matchFunction (group))
		{
			if (groupFinder.findOneOnly)
				groupFinder.setResultAndCancelRecursion (group)
			else
				groupFinder.addToResults (group)
		}
	})


	return groupFinder.findOneOnly ? groupFinder.result : groupFinder.results
}

// end of file: src\GMGroupFinder.js

// ------------------------------------------------------------
// file: src\GMGroupRecursor.js

function GMGroupRecurser (gmGroupsManager)
{
	this.groupsManager = gmGroupsManager
	this.recursionEnabled = true
	this.recurseUpward = false
	this.recurseDownward = false
	this.startingGroup = null
	this.includeStartingGroup = true
	this.functionToPerformOnGroup = null
	this.recursionCancelled = false
	this.recursionCompleted = false
	this.result = undefined
	this.results = []
	this.resultAndBreadcrumbs = new GMGroupRecurserResultAndBreadcrumbs (this)
	this.resultsAndBreadcrumbs = []
}

function GMGroupRecurserResultAndBreadcrumbs (gmGroupRecurser)
{
	this.result = undefined
	this.breadcrumbs = []
}

GMGroupRecurser.prototype.stringToRecurseDirections = function (pRecurseDirection)
{
	var recurseDirection = PrepareString (pRecurseDirection,[psAllKeepSpaces])

	this.recurseUpward = (['up','upward','parent','through parent','up through parent','parent group','through parent group','up through parent group'].indexOf (recurseDirection) > -1)
	this.recurseDownward = (['down','downward','child','through child','down through child','children','through children','down through children','child group','through child group','down through child group'].indexOf (recurseDirection) > -1)
}

GMGroupRecurser.prototype.reset = function ()
{
	this.recursionCompleted = false
	this.recursionCancelled = false
	this.result = undefined
	this.results = []
	this.resultAndBreadcrumbs.result = undefined
	this.resultAndBreadcrumbs.breadcrumbs = []
	this.resultsAndBreadcrumbs = []
	this.currentBreadcrumbs = []
}

GMGroupRecurser.prototype.performRecursionFunction = function (pRecursionFunction)
{
	var recurser = this

	recurser.functionToPerformOnGroup = getOptionalValue (pRecursionFunction,recurser.functionToPerformOnGroup)

	recurser.reset ()

	if (recurser.includeStartingGroup)
	{
		recurser.currentBreadcrumbs.push (recurser.startingGroup)

		recurser.functionToPerformOnGroup (this,recurser.startingGroup)

		if (recurser.recursionCancelled)
			return
	}

	if (recurser.recursionEnabled)
	{
		var propertyToRecurseThrough = recurser.recurseUpward ? 'parentGroups' : 'childGroups'

		function recurse (group)
		{
			recurser.currentBreadcrumbs.pushIfNew (group)

			var recurseProperty = group [propertyToRecurseThrough]
			
			for (var c = 0; c < recurseProperty.length; c ++)
			{
				var newRecurseGroup = recurseProperty [c]

				recurser.functionToPerformOnGroup (recurser,newRecurseGroup)

				if (recurser.recursionCancelled)
					return

				recurse (newRecurseGroup)
			}

			recurser.currentBreadcrumbs.pop ()
		}

		recurse (recurser.startingGroup)

		if (!recurser.recursionCancelled)
			recurser.recursionCompleted = true
	}

}

GMGroupRecurser.prototype.cancelRecursion = function ()
{
	this.recursionCancelled = true
}

GMGroupRecurser.prototype.setResultAndCancelRecursion = function (result)
{
	this.result = result
	this.resultAndBreadcrumbs.result = result
	this.resultAndBreadcrumbs.breadcrumbs = [].concat (this.currentBreadcrumbs)
	this.cancelRecursion ()
}

GMGroupRecurser.prototype.addToResults = function (result)
{
	this.results.push (result)

	var resultAndBreadcrumbs = new GMGroupRecurserResultAndBreadcrumbs (this)

	resultAndBreadcrumbs.result = result
	resultAndBreadcrumbs.breadcrumbs = [].concat (this.currentBreadcrumbs)

	this.resultsAndBreadcrumbs.push (resultAndBreadcrumbs)
}

GMGroupRecurser.prototype.debugResults = function ()
{
	console.log (this.resultAndBreadcrumbs.getDebugStr ())

	for (var c = 0; c < this.resultsAndBreadcrumbs.length; c ++)
		console.log (this.resultsAndBreadcrumbs [c].getDebugStr ())
}

GMGroupRecurserResultAndBreadcrumbs.prototype.getDebugStr = function ()
{
	var debugStr = 'result: ' + this.result + '   breadcrumbs: '

	var breadcrumbNames = []
	for (var c = 0; c < this.breadcrumbs.length; c ++)
		breadcrumbNames.push (this.breadcrumbs [c].name ())

	debugStr += breadcrumbNames.join (',')

	return debugStr
}

// end of file: src\GMGroupRecursor.js

// ------------------------------------------------------------
// file: src\GMGroups.js

function GMGroups (parentStorageKeyStub)
{
	this.rootGroup = null
	this.nextGroupId = 0
	this.scriptsManager = null
	this.storageKeyStub = (isDefinedAndNotEmpty (parentStorageKeyStub) ? parentStorageKeyStub + '.' : '') + 'GMGroups'
}

GMGroups.prototype.initialise = function ()
{
	this.rootGroup = this.createGroup ()

	this.scriptsManager = new GMGroupsScriptsManager (this)
}

GMGroups.prototype.createGroup = function (name)
{
	var newGroup = new GMGroup (this)

	newGroup.id = this.nextGroupId
	this.nextGroupId ++

	newGroup._name = name ? new NameObject (name) : null

	return newGroup
}

GMGroups.prototype.createGroupIntersection = function (intersectionGroups,name)
{
	var newGroup = this.createGroup (name)

	newGroup.isGroupIntersection = true
	newGroup.intersectionGroups = [].concat (intersectionGroups)

	for (var c = 0; c < newGroup.intersectionGroups.length; c ++)
		newGroup.addParentGroup (newGroup.intersectionGroups [c])

	return newGroup
}

GMGroups.prototype.createGroupRecurser = function (startingGroup,includeStartingGroup,recursionEnabled,recurseDirection,functionToPerformOnGroup)
{
	var groupRecurser = new GMGroupRecurser (this)

	this.initialiseGroupRecurser (groupRecurser,startingGroup,includeStartingGroup,recursionEnabled,recurseDirection,functionToPerformOnGroup)

	return groupRecurser
}

GMGroups.prototype.initialiseGroupRecurser = function (groupRecurser,startingGroup,includeStartingGroup,recursionEnabled,recurseDirection,functionToPerformOnGroup)
{
	groupRecurser.recursionEnabled = getOptionalValue (recursionEnabled,true)

	if (recurseDirection && recurseDirection.length)
		groupRecurser.stringToRecurseDirections (recurseDirection)

	groupRecurser.startingGroup = startingGroup
	groupRecurser.includeStartingGroup = includeStartingGroup
	groupRecurser.functionToPerformOnGroup = functionToPerformOnGroup

	return groupRecurser
}

GMGroups.prototype.createUpwardGroupRecurser = function (startingGroup,includeStartingGroup,recursionEnabled,functionToPerformOnGroup)
{
	var groupRecurser = this.createGroupRecurser (startingGroup,includeStartingGroup,recursionEnabled,'',functionToPerformOnGroup)
	groupRecurser.recurseUpward = true

	return groupRecurser
}

GMGroups.prototype.createDownwardGroupRecurser = function (startingGroup,includeStartingGroup,recursionEnabled,functionToPerformOnGroup)
{
	var groupRecurser = this.createGroupRecurser (startingGroup,includeStartingGroup,recursionEnabled,'',functionToPerformOnGroup)
	groupRecurser.recurseDownward = true

	return groupRecurser
}

GMGroups.prototype.createGroupFinder = function (pFindOneOnly,startingGroup,includeStartingGroup,recursionEnabled,recurseDirection,matchFunction)
{
	var groupFinder = new GMGroupFinder (this)
	this.initialiseGroupRecurser (groupFinder,startingGroup,includeStartingGroup,recursionEnabled,recurseDirection)

	groupFinder.findOneOnly = getOptionalValue (pFindOneOnly,true)
	groupFinder.matchFunction = matchFunction

	return groupFinder
}

GMGroups.prototype.createUpwardGroupFinder = function (pFindOneOnly,startingGroup,includeStartingGroup,recursionEnabled,matchFunction)
{
	var groupFinder = this.createGroupFinder (pFindOneOnly,startingGroup,includeStartingGroup,recursionEnabled,'',matchFunction)
	groupFinder.recurseUpward = true

	return groupFinder
}

GMGroups.prototype.createDownwardGroupFinder = function (pFindOneOnly,startingGroup,includeStartingGroup,recursionEnabled,matchFunction)
{
	var groupFinder = this.createGroupFinder (pFindOneOnly,startingGroup,includeStartingGroup,recursionEnabled,'',matchFunction)
	groupFinder.recurseDownward = true

	return groupFinder
}

GMGroups.prototype.isGroupAParentOfGroupB = function (groupA,groupB,recursionEnabled)
{
	console.log ('query: isGroup',groupA.name (),'parent of',groupB.name ())

	var recurser = this.createUpwardGroupRecurser (groupB,true,recursionEnabled)

	recurser.performRecursionFunction (function (recurser,group) {
		if (group.parentGroups.contains (groupA))
		{
			recurser.currentBreadcrumbs.pushIfNew (groupB)
			recurser.currentBreadcrumbs.pushIfNew (groupA)
			recurser.setResultAndCancelRecursion (true)
		}
	})

	recurser.debugResults ()

	return getOptionalValue (recurser.result,false)
}

GMGroups.prototype.isGroupAChildOfGroupB = function (groupA,groupB,recursionEnabled)
{
	return this.isGroupAParentOfGroupB (groupB,groupA,recursionEnabled)
}

GMGroups.prototype.findChildGroupsOfParentGroup = function (pFindOneOnly,parentGroup,includeStartingGroup,recursionEnabled,matchFunction)
{
	var groupFinder = this.createDownwardGroupFinder (pFindOneOnly,parentGroup,includeStartingGroup,recursionEnabled,matchFunction)

	return groupFinder.performFind ()
}

GMGroups.prototype.findParentGroupsOfChildGroup = function (pFindOneOnly,childGroup,includeStartingGroup,recursionEnabled,matchFunction)
{
	var groupFinder = this.createUpwardGroupFinder (pFindOneOnly,childGroup,includeStartingGroup,recursionEnabled,matchFunction)

	return groupFinder.performFind ()
}

GMGroups.prototype.addChildGroupToParentGroup = function (childGroup,parentGroup)
{
	return parentGroup.addChildGroup (childGroup)
}

GMGroups.prototype.groupsToNamesString = function (groups,pDelimiter)
{
	var groupNames = []
	for (var c = 0; c < groups.length; c ++)
		groupNames.push (groups [c].name ())

	var delimiter = getOptionalValue (pDelimiter,',')
	
	var result = groupNames.join (delimiter)

	return result
}

// end of file: src\GMGroups.js

// ------------------------------------------------------------
// file: src\GMGroupsGlobal.js

var gmGroups = new GMGroups ()

// end of file: src\GMGroupsGlobal.js

// ------------------------------------------------------------
// file: src\GMGroupsScripts.js

function GMGroupsScriptsManager (gmGroupsManager)
{
	this.groupsManager = gmGroupsManager
	this.scripts = []
	this.storageKeyStub = this.groupsManager + '.' + 'scripts'
}

function GMGroupsScript (gmGroupsScriptsManager)
{
	this.scriptsManager = gmGroupsScriptsManager

	this.name = ''
	this.contents = []
}

GMGroupsScriptsManager.prototype.initialise = function ()
{
	var autoExecScript = this.loadScriptFromStorage ('autoexec')
}

GMGroupsScriptsManager.prototype.storageKey = function ()
{
	return this.storageKeyStub + '.' + this.name
}

GMGroupsScriptsManager.prototype.createScript = function (name)
{
	var newScript = new GMGroupsScript (this)

	newScript.name = getOptionalValue (name,'')

	this.scripts.push (newScript)

	return newScript
}

GMGroupsScriptsManager.prototype.destroyScript = function (script)
{
	this.scripts.delete (script)

	script = null
}

GMGroupsScriptsManager.prototype.loadScriptFromStorage = function (name)
{
	var newScript = this.createScript (name)

	var storageItem = localStorage.getItem (newScript.storageKey ())

	if (storageItem === null)
	{
		this.destroyScript (newScript)
		return null
	}

	newScript.contents = loadArray (newScript.storageKey ())

	return newScript
}

GMGroupsScript.prototype.reloadFromStorage = function ()
{
	newScript.contents = loadArray (this.storageKey ())
}

GMGroupsScript.prototype.saveToStorage = function ()
{
	saveArray (newScript.contents,this.storageKey ())
}

// end of file: src\GMGroupsScripts.js

// ------------------------------------------------------------
// file: tests\GMGroupsTests.js

gmAddTestSuite ({
	name: 'GMGroups',
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

gmAddTest ('',function (test) {
		
})

// end of file: tests\GMGroupsTests.js

