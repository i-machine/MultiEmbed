function TagsManagerObject (pStorageKey)
{
	this.Tags = [];
	this.NextNewTagIndex = 0;
	this.StorageKey = pStorageKey || 'Tags';
}

function TagObject (pManager)
{
	this.Manager = pManager;
	this.Index = -1;

	this.Name = new NameObject ();

	this.ParentTags = [];
	this.ChildTags = [];
}

function TagsObject (pManager)
{
	this.Manager = pManager;
	this.Tags = [];
}

TagsManagerObject.prototype.RaiseError = function (pErrorMessage)
{
	console.log ('');
	console.log ('ERROR - ' + pErrorMessage);
	console.log ('');
}

TagsManagerObject.prototype.GetTag = function (pTagName)
{
	if (isNotDefined (pTagName))
		return null;

	if (pTagName instanceof TagObject)
		return pTagName;

	return FindNamedObjectInArray (this.Tags,'Name',pTagName);
}

TagsManagerObject.prototype.AddTag = function (pTagNameOrNames,pOptions)
{
	var TagNamesArray = valueToArray (pTagNameOrNames);
	if (TagNamesArray.length == 0)
		return null;

	var Options = getOptionalValue (pOptions,{});

	for (var cTagName = 0; cTagName < TagNamesArray.length; cTagName++)
	{
		var TagName = TagNamesArray [cTagName];

		var existingTag = this.GetTag (TagName);
		if (existingTag)
		{
			this.RaiseError ('A tag with the name "' + TagName + '" already exists');
			return null;
		}
	}

	var newTag = new TagObject (this);
	newTag.Name.SetNames (TagNamesArray);

	newTag.Index = this.NextNewTagIndex;
	this.NextNewTagIndex ++;

	this.Tags.push (newTag);

	return newTag;
}

TagsManagerObject.prototype.GetOrAddTag = function (pTagName)
{
	var Tag = this.GetTag (pTagName);
	if (Tag)
		return Tag;
	else
		return this.AddTag (pTagName);
}

TagsManagerObject.prototype.ProcessTagsOrTagNames = function (pTagsOrTagNames,pCallback,pOptions)
{
	var Options = getOptionalValue (pOptions,{});

	Options.TagsMustExist = getOptionalValue (Options.TagsMustExist,false);

	var TagsOrTagNames = valueToArray (pTagsOrTagNames);

	for (var cTag = 0; cTag < TagsOrTagNames.length; cTag++)
	{
		var TagOrTagName = TagsOrTagNames [cTag];

		var Tag = null;

		if (TagOrTagName instanceof TagObject)
			Tag = TagOrTagName;
		else
		{
			Tag = this.GetTag (TagOrTagName);
		}

		if (Options.TagsMustExist && (Tag == null))
		{
			this.RaiseError ('Could not find tag "' + TagOrTagName + '"');
		}
		else
		{
			if (isDefined (pCallback))
				pCallback (Tag,TagOrTagName);
		}
	}
}

TagsManagerObject.prototype.ProcessTagsArray = function (pTagsArray,pCallback,pOptions)
{
	if (isNotDefined (pTagsArray))
		return;

	var Options = getOptionalValue (pOptions,{});

	for (var cTag = 0; cTag < pTagsArray.length; cTag ++)
	{
		var Tag = pTagsArray [cTag];

		if (isDefined (pCallback))
			pCallback (Tag);
	}
}

TagObject.prototype.AddChildTags = function (pTagsOrTagNames)
{
	var thisTag = this;

	function AddChildTag (Tag,TagName)
	{
		if (Tag == null)
			Tag = this.Manager.AddTag (TagName);

		thisTag.ChildTags.pushIfNew (Tag);
		Tag.ParentTags.pushIfNew (thisTag);
	}

	this.Manager.ProcessTagsOrTagNames (pTagsOrTagNames,AddChildTag);
}

TagObject.prototype.AddParentTags = function (pTagsOrTagNames)
{
	var thisTag = this;

	function AddParentTag (Tag,TagName)
	{
		if (Tag == null)
			Tag = this.Manager.AddTag (TagName);

		thisTag.ParentTags.pushIfNew (Tag);
		Tag.ChildTags.pushIfNew (thisTag);
	}

	this.Manager.ProcessTagsOrTagNames (pTagsOrTagNames,AddParentTag);
}

TagsManagerObject.prototype.TagsToStringArray = function (pTagsArray,pOptions)
{
	if (isNotDefined (pTagsArray))
		return [];

	var Options = getOptionalValue (pOptions,{});

	var results = [];

	function cb (Tag)
	{
		results.push (Tag.Name.Name);
	}

	this.ProcessTagsArray (pTagsArray,cb,Options);

	return results;
}

TagsManagerObject.prototype.TagsToString = function (pTagsArray,pOptions)
{
	if (isNotDefined (pTagsArray))
		return '';

	var Options = getOptionalValue (pOptions,{});
	Options.DelimiterStr = getOptionalValue (Options.DelimiterStr,',');

	var result = this.TagsToStringArray (pTagsArray,Options).join (Options.DelimiterStr);

	return result;
}

TagsManagerObject.prototype.Save = function ()
{
	var SaveObject = {};

	SaveObject.NextNewTagIndex = this.NextNewTagIndex;
	SaveObject.Tags = [];

	for (var cTag = 0; cTag < this.Tags.length; cTag ++)
	{
		var Tag = this.Tags [cTag];

		var SaveTag = {};

		SaveTag.Index = Tag.Index;
		SaveTag.Name = NameObjectToJSONObject (Tag.Name);
		SaveTag.ParentTags = objectArrayToIndexArray (Tag.ParentTags);
		SaveTag.ChildTags = objectArrayToIndexArray (Tag.ChildTags);

		SaveObject.Tags.push (SaveTag);
	}

	localStorage.setItem (this.StorageKey,JSON.stringify (SaveObject));
}

TagsManagerObject.prototype.Load = function ()
{
	this.Tags = [];

	var LoadedStr = localStorage.getItem (this.StorageKey);

	if (NotDefinedOrEmpty (LoadedStr))
		return;

	var LoadedObject = JSON.parse (LoadedStr);

	this.NextNewTagIndex = LoadedObject.NextNewTagIndex;

	for (var cTag = 0; cTag < LoadedObject.Tags.length; cTag ++)
	{
		var LoadedTag = LoadedObject.Tags [cTag];

		var newTag = new TagObject (this);

		newTag.Index = LoadedTag.Index;
		newTag.Name = JSONObjectToNameObject (LoadedTag.Name);
		newTag.ParentTags = LoadedTag.ParentTags;
		newTag.ChildTags = LoadedTag.ChildTags;

		this.Tags.push (newTag);
	}

	for (var cTag = 0; cTag < this.Tags.length; cTag ++)
	{
		var Tag = this.Tags [cTag];

		Tag.ParentTags = indexArrayToObjectArray (Tag.ParentTags,this.Tags);
		Tag.ChildTags = indexArrayToObjectArray (Tag.ChildTags,this.Tags);
	}
}

TagsManagerObject.prototype.InitialiseStandardTags = function ()
{
	this.AddTag ('US,USA,America,American');
	this.AddTag ('UK,GB,United Kingdom,Great Britain,Britain,British');
	this.AddTag ('World,Global,International');
	this.AddTag ('Country,National').AddChildTags ('US,UK');
	this.AddTag ('News');

	return;
	
	this.AddTag ('');
	this.AddTag ('');
	this.AddTag ('');
}

TagsObject.prototype.IndexOf = function (pTagOrTagName)
{
	var tmpTag = this.Manager.GetTag (pTagOrTagName);
	if (tmpTag)
		return this.Tags.indexOf (tmpTag);
	else
		return -1;
}

TagsObject.prototype.ContainsAnyOf = function (pTagsOrTagNames)
{
	var TagsOrTagNames = valueToArray (pTagsOrTagNames);
	if (TagsOrTagNames.length == 0)
		return false;

	for (var cTag = 0; cTag < TagsOrTagNames.length; cTag++)
	{
		var TagOrTagName = TagsOrTagNames [cTag];
		var Tag = this.Manager.GetTag (TagOrTagName);

		if (Tag && this.Tags.contains (Tag))
			return true;
	}

	return false;
}

TagsObject.prototype.ContainsAllOf = function (pTagsOrTagNames)
{
	var TagsOrTagNames = valueToArray (pTagsOrTagNames);
	if (TagsOrTagNames.length == 0)
		return false;

	for (var cTag = 0; cTag < TagsOrTagNames.length; cTag++)
	{
		var TagOrTagName = TagsOrTagNames [cTag];
		var Tag = this.Manager.GetTag (TagOrTagName);

		if (Tag == null || this.Tags.doesNotContain (Tag))
			return false;
	}

	return true;
}

TagsObject.prototype.Contains = function (pTagsOrTagNames)
{
	return this.ContainsAllOf (pTagsOrTagNames);
}

TagsObject.prototype.Add = function (pTagsOrTagNames)
{
	var TagsOrTagNames = valueToArray (pTagsOrTagNames);
	if (TagsOrTagNames.length == 0)
		return null;

	for (var cTag = 0; cTag < TagsOrTagNames.length; cTag++)
	{
		var TagOrTagName = TagsOrTagNames [cTag];
		var Tag = this.Manager.GetOrAddTag (TagOrTagName);
		if (Tag)
			this.Tags.pushIfNew (Tag);
	}
}

TagsObject.prototype.Remove = function (pTagsOrTagNames)
{
	var TagsOrTagNames = valueToArray (pTagsOrTagNames);
	if (TagsOrTagNames.length == 0)
		return null;

	for (var cTag = 0; cTag < TagsOrTagNames.length; cTag++)
	{
		var TagOrTagName = TagsOrTagNames [cTag];
		var Tag = this.Manager.GetOrAddTag (TagOrTagName);
		if (Tag)
			this.Tags.deleteIfFound (Tag);
	}
}

TagsObject.prototype.ToString = function (pDelimiter)
{
	var result = '';

	var Delimiter = getOptionalValue (pDelimiter,',');

	for (var c = 0; c < this.Tags.length; c++)
	{
		var Tag = this.Tags [c];

		if (c > 0)
			result += Delimiter;

		result += Tag.Name.Name;
	}

	return result;
}

function TagsObjectToJSONObject (pTagsObject)
{
	return objectArrayToIndexArray (pTagsObject.Tags);
}

function JSONObjectToTagsObject (pJSONObject,pManager)
{
	var newTagsObject = new TagsObject (pManager);

	newTagsObject.Tags = indexArrayToObjectArray (pJSONObject,pManager.Tags);

	return newTagsObject;
}
