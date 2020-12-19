// ------------------------------------------------------------
// file: src\GMTag.js

function GMTag (tagsManager)
{
	this.tagsManager = tagsManager
	this._ = new GMTag_ (this)
	this.name = undefined

	this.componentTags = []
	this.parentTags = []
	this.childTags = []
}

function GMTag_ (tag)
{
	this.tag = tag
	this.index = undefined
}

GMTag.prototype.isChildOf = function (tag,opRecurse)
{
	return this.tagsManager.isTagAChildOfTagB (this,tag,opRecurse)
}

GMTag.prototype.isParentOf = function (tag,opRecurse)
{
	return this.tagsManager.isTagAParentOfTagB (this,tag,opRecurse)
}

GMTag.prototype.addChildTag = function (tag)
{
	this.childTags.push (tag)
	tag.parentTags.push (this)
	return tag
}

// end of file: src\GMTag.js

// ------------------------------------------------------------
// file: src\GMTags-global.js

var gmTags = new GMTags ()


// end of file: src\GMTags-global.js

// ------------------------------------------------------------
// file: src\GMTagsInterchange.js

function GMTagsInterchangeManager (tagsManager)
{
	this.tagsManager = tagsManager
	this.options = new GMTagsInterchangeManagerOptions (this)
}

function GMTagsInterchangeManagerOptions (interchangeManager)
{
	this.interchangeManager = interchangeManager

	this.tagDelimiter = ','
	this.componentTagDelimiter = '|'
	this.globalTagToken = '!'
}

GMTagsInterchangeManager.prototype.saveToInterchangeObject = function ()
{
	var io = {}
	var tagsManager = this.tagsManager

	io.nextIndex = tagsManager._.nextIndex
	io.tags = []

	for (var cTag = 0; cTag < tagsManager.tags.length; cTag ++)
	{
		var tag = tagsManager.tags [cTag]
		var tio = this.tagToInterchangeObject (tag)
		io.tags.push (tio)
	}

	return io
}

GMTagsInterchangeManager.prototype.loadFromInterchangeObject = function (interchangeObject)
{
	var tagsManager = this.tagsManager

	tagsManager._.reset ()

	tagsManager._.nextIndex = interchangeObject.nextIndex

	for (var cStep = 1; cStep <= 2; cStep ++)
	{
		for (var cTag = 0; cTag < interfaceObject.tags.length; cTag ++)
		{
			var tagInterfaceObject = interfaceObject.tags [cTag]

			switch (cStep)
			{
				case 1:
					var tag = this.interfaceObjectToTag (tagInterfaceObject)
					tagsManager.tags.push (tag)
					break

				case 2:
					var tag = tagsManager.tags [cTag]
					tag = this.interfaceObjectToTag (tagInterfaceObject,tag)
					break
			}
		}
	}
}

GMTagsInterchangeManager.prototype.tagToInterchangeObject = function (tag)
{
	var interchangeObject = {}

	interchangeObject.index = tag._.index
	if (tag.name)
		interchangeObject.name = NameObjectToJSONObject (tag.name)
	interchangeObject.componentTags = this.tagsToTagIndexes (tag.componentTags)
	interchangeObject.childTags = this.tagsToTagIndexes (tag.childTags)
	interchangeObject.parentTags = this.tagsToTagIndexes (tag.parentTags)

	return interchangeObject
}

GMTagsInterchangeManager.prototype.interchangeObjectToTag = function (interchangeObject,tag)
{
	if (!tag)
	{
		var tag = new GMTag (this.tagsManager)

		tag._.index = interchangeObject.index
		if (gmStrings.isDefinedAndNotEmpty (interchangeObject.name))
			tag.name = JSONObjectToNameObject (interchangeObject.name)
	}
	else
	{
		tag.componentTags = this.tagIndexesToTags (interchangeObject.componentTags)
		tag.childTags = this.tagIndexesToTags (interchangeObject.childTags)
		tag.parentTags = this.tagIndexesToTags (interchangeObject.parentTags)
	}

	return tag
}

GMTagsInterchangeManager.prototype.tagIndexesToTags = function (tagIndexes)
{
	return tagIndexes.map (function (index) {return this.getTagByIndex (index)},this.tagsManager)
}

GMTagsInterchangeManager.prototype.tagsToTagIndexes = function (tags)
{
	return tags.map (function (tag) {return tag._.index})
}

// end of file: src\GMTagsInterchange.js

// ------------------------------------------------------------
// file: src\GMTagsManager.js

function GMTagsManager ()
{
	this.tags = []
	this._ = new GMTagsManager_ (this)
	this.interchangeManager = new GMTagsInterchangeManager (this)
	this.resolver = new GMTagsResolver (this)
}

function GMTagsManager_ (tagsManager)
{
	this.tagsManager = tagsManager
	this.nextIndex = 0
}

GMTagsManager_.prototype.getNextIndex = function ()
{
	var nextIndex = this.nextIndex
	this.nextIndex ++
	return nextIndex
}

GMTagsManager_.prototype.reset = function ()
{
	this.tagsManager._.nextIndex = 0
	this.tagsManager.tags = []
}

GMTagsManager.prototype.createTag = function ()
{
	var tag = new GMTag (this)
	tag._.index = this._.getNextIndex ()

	this.tags.push (tag)
	return tag
}

GMTagsManager.prototype.getTagByIndex = function (index)
{
	return gmArrays.findObject (this.tags,'_.index',index)
}

GMTagsManager.prototype.getTagByName = function (name)
{
	return gmArrays.findObject (this.tags,'name',name)
}

GMTagsManager.prototype.getTagByComponentTags = function (componentTags)
{
	return gmArrays.findElementUsingFilter (this.tags,function (tag) {return gmArrays.areArraysEqual (tag.componentTags,componentTags,false)})
}

GMTagsManager.prototype.isTagAChildOfTagB = function (tagA,tagB,opRecurse)
{
	var pRecurse = gmValues.getValueIfDefined (opRecurse,true)

	function explore (tag)
	{
		if (gmArrays.containsElement (tag.childTags,tagA))
			return true
		else
		{
			if (pRecurse)
			{
				for (var c = 0; c < tag.childTags.length; c ++)
				{
					var childTag = tag.childTags [c]
					if (explore (childTag))
						return true
				}
			}

			return false
		}
	}

	return explore (tagB)
}

GMTagsManager.prototype.isTagAParentOfTagB = function (tagA,tagB,opRecurse)
{
	return this.isTagAChildOfTagB (tagB,tagA,opRecurse)
}

// end of file: src\GMTagsManager.js

// ------------------------------------------------------------
// file: src\GMTagsResolver.js

function GMTagsResolver (tagsManager)
{
	this.tagsManager = tagsManager

	this.inputString = ''
	this.items = []
}

function GMTagsStringResolver (tagsResolver)
{

}

function GMTagsStringResolverItem ()
{
	this.index = undefined
	this.inputString = undefined
	this.tag = undefined
}

GMTagsInterchangeManager.prototype.resolveStringToTags = function (tagsString)
{
	var tagResolver = new GMTagsInterchangeTagResolver (this)

	tagResolver.resolveStringToTags (tagsString)

	return tagResolver
}

GMTagsInterchangeManager.prototype.resolveStringToTag = function (tagString)
{
	var tagResolver = new GMTagsInterchangeTagResolver (this)

	tagResolver.resolveStringToTag (tagString)

	return tagResolver
}

GMTagsInterchangeTagResolver.prototype.resolveStringToTags = function (tagsString)
{

}

GMTagsInterchangeTagResolver.prototype.resolveStringToTag = function (tagString)
{

}

// end of file: src\GMTagsResolver.js

// ------------------------------------------------------------
// file: tests\GMTagsTests.js

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

// end of file: tests\GMTagsTests.js

