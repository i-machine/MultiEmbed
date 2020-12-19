function SimpleDB ()
{
	this._databases = [];
	this._recordTypes = [];
	this._allRecords = [];
	this._recordRelations = [];

	this._allRecordsOwner = this;

	this._nextAvailableRecordTypeIndex = 1;

	this._storageKey = 'SimpleDB';
}

function SimpleDBDatabase (simpleDB)
{
	this._simpleDB = simpleDB;
}

function RecordType (simpleDB)
{
	this._simpleDB = simpleDB;
	this._index = null;

	this.code = '';
	this.name = null;
	this.pluralName = null;

	this._constructorFunction = null;
	this._postCreateRecordFunction = null;
	this._allRecords = [];
	this._recordRelations = [];
	this._nameObjectProperties = [];
	this._allRecordsOwner = null;
	this._allRecordsProperty = '';
	this._codeProperty = 'code';
	this._nameProperty = 'name';
	this._propertiesToStore = [];
	this._propertiesToNotStore = [];
	this._nextAvailableRecordIndex = 1;
}

function Tag ()
{
	this.code = null;
	this.name = null;
	this.childTags = null;
	this.parentTags = null;
}

function RecordRelationSnippet ()
{
	this.recordType = null;
	this.hasProperty = false;
	this.property = '';
	this.isArray = false;
}

function RecordRelation ()
{
	this.parent = new RecordRelationSnippet ();
	this.child = new RecordRelationSnippet ();
}

function NameObjectProperty ()
{
	this.propertyName = '';
}

function RecordPropertyReference ()
{
	this.record = null;
	this.recordType = null;
	this.property = null;
}
SimpleDB.prototype.save = function ()
{
	this.saveManager ();
	this.saveRecordTypes ();
	this.saveRecords ();
}

SimpleDB.prototype.loadManager = function ()
{
	var simpleDB = this;

	var storageKey = simpleDB._storageKey + '.manager';

	var saveObject = JSON.parse (localStorage.getItem (storageKey) || '{}');

	copyProperties (saveObject,simpleDB,['_nextAvailableRecordTypeIndex']);
}

SimpleDB.prototype.saveManager = function ()
{
	var simpleDB = this;

	var storageKey = simpleDB._storageKey + '.manager';

	var saveObject = {};

	copyProperties (simpleDB,saveObject,['_nextAvailableRecordTypeIndex']);

	localStorage.setItem (storageKey,JSON.stringify (saveObject));
}

SimpleDB.prototype.saveRecordTypes = function ()
{
	var simpleDB = this;

	var saveObjects = [];

	simpleDB._recordTypes.forEach (function (recordType) {
		saveObjects.push (simpleDB.convertRecordTypeToSaveObject (recordType));
	});

	var storageKey = simpleDB._storageKey + '.recordTypes';

	saveArray (saveObjects,storageKey);
}

SimpleDB.prototype.saveRecords = function (recordType)
{
	var simpleDB = this;

	if (isEmptyOrNotDefined (recordType))
	{
		simpleDB._recordTypes.forEach (function (recordType) {
			simpleDB.saveRecords (recordType)
		});
		return;
	}

	var storageKey = simpleDB._storageKey + '.records.' + recordType.code;

	var saveObjects = simpleDB.convertRecordsArrayToSaveObjectsArray (recordType._allRecords);

	saveArray (saveObjects,storageKey);
}

SimpleDB.prototype.loadRecordTypes = function (recordType)
{
	var simpleDB = this;

	var storageKey = simpleDB._storageKey + '.recordTypes';

	var saveObjects = loadArray (storageKey);

	saveObjects.forEach (function (saveObject) {
		var recordType = simpleDB.convertSaveObjectToRecordType (saveObject);
		console.log (recordType);
		simpleDB._recordTypes.push (recordType);
	});


	saveArray (saveObjects,storageKey);
}

SimpleDB.prototype.loadData = function ()
{
	this.ZloadRecords ();
	this.resolveAllRecordRelations ();

	console.log ('loadData',this);
}

SimpleDB.prototype.ZloadRecords = function (recordType)
{
	var simpleDB = this;

	if (isEmptyOrNotDefined (recordType))
	{
		simpleDB._recordTypes.forEach (function (recordType) {
			simpleDB.ZloadRecords (recordType);
		});
		return;
	}

	var storageKey = this._storageKey + '.records.' + recordType.code;

	var saveObjectsArray = loadArray (storageKey);

	var records = simpleDB.convertSaveObjectsArrayToOrphanRecordsArray (recordType,saveObjectsArray,{resolveRecordRelations: false});

	simpleDB.addOrphanRecords (records);
}

SimpleDB.prototype.convertRecordTypeToSaveObject = function (recordType)
{
	var saveObject = {};

	copyProperties (recordType,saveObject,['code','_index','_nextAvailableRecordIndex']);

	return saveObject;
}

SimpleDB.prototype.convertSaveObjectToRecordType = function (saveObject)
{
	var recordType = new RecordType (this);

	copyProperties (saveObject,recordType,['code','_index','_nextAvailableRecordIndex']);

	return recordType;
}

SimpleDB.prototype.convertRecordToSaveObject = function (record)
{
	var simpleDB = this

	var recordType = record._simpleDB.recordType;

	var saveObject = {};

	saveObject._index = record._simpleDB.index;

	var propertiesToStore = getObjectProperties (record,{properties: recordType._propertiesToStore, excludeProperties: recordType._propertiesToNotStore});

	for (var cProperty = 0; cProperty < propertiesToStore.length; cProperty ++)
	{
		var p = propertiesToStore [cProperty];

		if (record.hasOwnProperty (p))
		{
			if (p === '_simpleDB')
				continue;

			var v = record [p];

			if (v instanceof Object && isDefined (v._simpleDB))
			{
				saveObject [p] = v._simpleDB.index;
				continue;
			}

			if (isArray (v))
			{
				var relation = recordType.getRecordRelationByProperty (p);
				if (relation)
				{
					saveObject [p] = [];

					v.forEach (function (r) {
						if (r instanceof Object && isDefined (r._simpleDB))
							saveObject [p].push (r._simpleDB.index);
						else
							saveObject [p].push (null);
					});

					continue;
				}
			}

			if (v instanceof NameObject)
			{
				saveObject [p] = NameObjectToJSONObject (v);
				continue;
			}

			saveObject [p] = v;

		}
	}

	return saveObject;
}

SimpleDB.prototype.convertSaveObjectToRecord = function (recordType,saveObject,pOptions)
{
	var simpleDB = this;

	var options = {};
	options.resolveNameObjects = true;
	options.resolveRecordRelations = true;

	if (pOptions)
		copyProperties (pOptions,options);

	var record = simpleDB.newOrphanRecord (recordType,{resolveRecordTypeIdentifier: false,
	resolveSpecialProperties:false});

	record._simpleDB.index = saveObject._index;

	for (var p in saveObject)
	{
		if (saveObject.hasOwnProperty (p))
		{
			if (p === '_index')
				continue;

			var v = saveObject [p];

			if (isArray (v))
			{
				if (options.resolveNameObjects)
				{
					var nop = recordType.getNameObjectProperty (p);
					if (nop)
					{
						record [p] = JSONObjectToNameObject (v);
						continue;
					}
				}
			}

			record [p] = v;
		}
	}

	if (options.resolveRecordRelations)
		simpleDB.resolveRecordRelations (record);

	return record;
}

SimpleDB.prototype.convertRecordsArrayToSaveObjectsArray = function (recordsArray)
{
	var simpleDB = this;
	var saveObjectsArray = [];

	recordsArray.forEach (function (record) {
		var saveObject = simpleDB.convertRecordToSaveObject (record);
		saveObjectsArray.push (saveObject);
	});

	return saveObjectsArray;
}

SimpleDB.prototype.convertSaveObjectsArrayToOrphanRecordsArray = function (recordType,saveObjectsArray,pOptions)
{
	var simpleDB = this;
	var recordsArray = [];

	saveObjectsArray.forEach (function (saveObject) {
		var record = simpleDB.convertSaveObjectToRecord (recordType,saveObject,pOptions);
		recordsArray.push (record);
	});

	return recordsArray;
}
SimpleDB.prototype.addRecordType = function (pOptions)
{
	var recordType = this.findRecordTypeByCode (pOptions.code);
	var recordTypeAlreadyExisted = (isDefined (recordType));

	if (!recordTypeAlreadyExisted)
	{
		recordType = new RecordType (this);

		recordType._index = this.assignNextAvailableRecordTypeIndex ();

		recordType.code = pOptions.code || '';
	}

	if (pOptions.name || pOptions.names)
		recordType.name = new NameObject (pOptions.name || pOptions.names);

	if (pOptions.pluralName || pOptions.pluralNames)
		recordType.pluralName = new NameObject (pOptions.pluralName || pOptions.pluralNames);

	if (isEmptyOrNotDefined (recordType.code) && isDefined (recordType.name))
		recordType.code = GetTokenizedVersionOf (recordType.name.Name);

	copyCommonProperties (pOptions,recordType);

	this.resolvePlurals (recordType);

	this.resolveAllRecords (recordType);

	if (!recordTypeAlreadyExisted)
		this._recordTypes.push (recordType);

	console.log ('addRecordType: ',recordType);
	return recordType;
}

SimpleDB.prototype.establishRecordRelation = function (options)
// ({parent: {recordType: layoutType, property: 'sections', isArray: true},{child: {recordType: sectionType, property: 'layout', isArray: false});
{
	var simpleDB = this;

	var recordRelation = new RecordRelation ();

	function processOptionsSnippet (optionsSnippet)
	{
		copyProperties (options [optionsSnippet],recordRelation [optionsSnippet]);
		recordRelation [optionsSnippet].recordType = simpleDB.resolveRecordType (options [optionsSnippet].recordType);
		recordRelation [optionsSnippet].hasProperty = isDefinedAndNotEmpty (recordRelation [optionsSnippet].property);
	}

	processOptionsSnippet ('parent');
	processOptionsSnippet ('child');

	this._recordRelations.push (recordRelation);
	recordRelation.parent.recordType._recordRelations.push (recordRelation);
	recordRelation.child.recordType._recordRelations.push (recordRelation);

	return recordRelation;
}

SimpleDB.prototype.assignNextAvailableRecordTypeIndex = function ()
{
	var result = this._nextAvailableRecordTypeIndex;

	this._nextAvailableRecordTypeIndex ++;

	return result;
}

RecordPropertyReference.prototype.value = function ()
{
	var nop = this.recordType.getNameObjectProperty (this.property);
	if (nop)
	{
		return this.record [this.property].Name;
	}

	return this.record [this.property];
}

RecordPropertyReference.prototype.setValue = function (value)
{
	var nop = this.recordType.getNameObjectProperty (this.property);
	if (nop)
	{
		this.record [this.property] = new NameObject (value);
		return;
	}

	var resolvedValue = this.resolveNewValue (value);

	this.record [this.property] = resolvedValue;

	this.setOrAddOtherValue (resolvedValue);
}

RecordPropertyReference.prototype.addValue = function (value)
{
	var nop = this.recordType.getNameObjectProperty (this.property);
	if (nop)
	{
		var pv = this.record [this.property];

		if (pv && pv instanceof TNameObject)
			pv.AddNames (value);
		else
			this.record [this.property] = new NameObject (value);

		return;
	}

	var resolvedValue = this.resolveNewValue (value);

	this.record [this.property].push (resolvedValue);

	this.setOrAddOtherValue (resolvedValue);
}

RecordPropertyReference.prototype.resolveNewValue = function (value)
{
	if (typeof value !== 'object')
		return value;

	var relation = this.recordType.getRecordRelationByProperty (this.property);

	if (!relation)
		return value;

	var snippet = relation.getSnippetByProperty (this.property);
	var otherSnippet = relation.getOtherSnippet (snippet);

	if (value instanceof otherSnippet.recordType._constructorFunction)
		return value;

	var newValue = otherSnippet.recordType._simpleDB.addRecord (otherSnippet.recordType,{properties: value});

	return newValue;
}

RecordPropertyReference.prototype.setOrAddOtherValue = function (value)
{
	var relation = this.recordType.getRecordRelationByProperty (this.property);

	if (relation)
	{
		var snippet = relation.getSnippetByProperty (this.property);
		var otherSnippet = relation.getOtherSnippet (snippet);

		if (otherSnippet.hasProperty)
		{
			if (otherSnippet.isArray)
				value [otherSnippet.property].push (this.record);
			else
				value [otherSnippet.property] = this.record;
		}
	}
}

SimpleDB.prototype.assignNextAvailableRecordIndex = function (recordType)
{
	var result = recordType._nextAvailableRecordIndex;

	recordType._nextAvailableRecordIndex ++;

	return result;
}

SimpleDB.prototype.addRecord = function (recordTypeIdentifier,pOptions)
{
	var options = {};
	if (pOptions)
		copyProperties (pOptions,options);

    var recordType = this.resolveRecordType (recordTypeIdentifier);

	var record = this.newOrphanRecord (recordType,pOptions);

	this.addOrphanRecord (record,pOptions);

	return record;
}

SimpleDB.prototype.newOrphanRecord = function (recordTypeIdentifier,pOptions)
{
	var simpleDB = this;

	var options = {};
	options.resolveRecordTypeIdentifier = true;
	options.resolveSpecialProperties = true;

	if (pOptions)
		copyProperties (pOptions,options);

    var recordType;
    if (options.resolveRecordTypeIdentifier)
    	recordType = simpleDB.resolveRecordType (recordTypeIdentifier);
    else
    	recordType = recordTypeIdentifier;

	var record = new recordType._constructorFunction ();

	record._simpleDB = {};

	record._simpleDB.recordType = recordType;

	if (options.resolveSpecialProperties)
	{
		recordType._recordRelations.forEach (function (relation) {
			var snippet = relation.getSnippetByRecordType (recordType);

			if (snippet.hasProperty)
			{
				if (snippet.isArray)
					record [snippet.property] = [];
				else
					record [snippet.property] = null;
			}
		});
	}

	if (isDefined (pOptions) && isDefined (pOptions.propertyValues))
		simpleDB.setRecordPropertyValues (record,pOptions.propertyValues);

	if (isDefined (recordType._postCreateRecordFunction))
	{
		var postCreateRecordFunction = recordType._postCreateRecordFunction.bind (recordType._simpleDB);
		postCreateRecordFunction (record);
	}

	return record;
}

SimpleDB.prototype.addOrphanRecord = function (orphanRecord,pOptions)
{
	if (!orphanRecord._simpleDB.index > 0)
		orphanRecord._simpleDB.index = this.assignNextAvailableRecordIndex (orphanRecord._simpleDB.recordType);

	this._allRecords.push (orphanRecord);

	if (orphanRecord._simpleDB.recordType._allRecords)
		orphanRecord._simpleDB.recordType._allRecords.push (orphanRecord);
}

SimpleDB.prototype.addOrphanRecords = function (orphanRecords,pOptions)
{
	var simpleDB = this;

	orphanRecords.forEach (function (record) {
		simpleDB.addOrphanRecord (record,pOptions);
	});
}

SimpleDB.prototype.findRecordTypeByIndex = function (index)
{
	return findObjectInArray (this._recordTypes,'_index',index);
}

SimpleDB.prototype.findRecordTypeByCode = function (code)
{
	return findObjectInArray (this._recordTypes,'code',code,{useTokenizedStrings: false});
}

SimpleDB.prototype.findRecordType = function (recordTypeIdentifier)
{
	return this.resolveRecordType (recordTypeIdentifier);
}

SimpleDB.prototype.findRecordByIndex = function (recordType,index)
{
	return this.findRecord (recordType,'_simpleDB.index',index);
}

SimpleDB.prototype.findRecordByCode = function (recordType,code,useTokenizedStrings)
{
	return this.findRecord (recordType,'code',code,{useTokenizedStrings: useTokenizedStrings || false});
}

SimpleDB.prototype.findRecordByName = function (recordType,name,useTokenizedStrings)
{
	var rt = this.resolveRecordType (recordType);
	return this.findRecord (rt,rt._nameProperty,name,{useTokenizedStrings: useTokenizedStrings || true});
}

SimpleDB.prototype.findRecord = function (recordType,property,value,pOptions)
{
	var options = {};

    options.useTokenizedStrings = false;
    options.findFirstObjectOnly = true;

    if (pOptions)
    	copyCommonProperties (pOptions,options);

    return this.findRecords (recordType,property,value,options);
}

SimpleDB.prototype.findRecords = function (recordTypeIdentifier,property,value,pOptions)
{
	var options = {};

    options.useTokenizedStrings = false;
    options.findFirstObjectOnly = false;

    if (pOptions)
    	copyCommonProperties (pOptions,options);

    // need to convert options to uppercase for findobjectsinarray
    options.UseTokenizedStrings = options.useTokenizedStrings;
    options.FindFirstObjectOnly = options.findFirstObjectOnly;

    var recordType = this.resolveRecordType (recordTypeIdentifier);

	return findObjectsInArray (recordType._allRecords,property,value,options);
}

SimpleDB.prototype.recordCount = function (recordTypeIdentifier)
{
    var recordType = this.resolveRecordType (recordTypeIdentifier);

    return recordType._allRecords.length;
}

SimpleDB.prototype.setRecordPropertyValues = function (record,propertyValues)
{
	var recordType = record._simpleDB.recordType;

	for (var p in propertyValues)
	{
		var v = propertyValues [p];

		this.getRecordPropertyReference (record,p).setValue (v);
	}
}

SimpleDB.prototype.initialiseSimpleDB = function (pOptions)
{
	SimpleDB.apply (this);

	var options = {};
	options.loadStructure = true;
	options.loadData = true;

	if (pOptions)
		copyProperties (pOptions,options);

	if (options.loadStructure)
	{
		this.loadManager ();
		this.loadRecordTypes (); // should be called before initialise
	}

	this.initialiseRecordTypes (); // should be called after load and before initialiserelations
	this.initialiseRecordTypeRelations (); // should be called after initialise

	if (isDefined (options.postInitialiseFunction))
		options.postInitialiseFunction (this);

	// this.tagType = this.addRecordType ({code: 'tag', name: 'Tag', _constructorFunction: Tag});

	if (options.loadData)
		this.loadData ();
}
RecordType.prototype.addNameObjectProperty = function (propertyName)
{
	var recordType = this;
	var simpleDB = recordType._simpleDB;

	var n = new NameObjectProperty ();
	n.propertyName = propertyName;

	recordType._nameObjectProperties.push (n);

	return n;
}

RecordType.prototype.getNameObjectProperty = function (propertyName)
{
	return findObjectInArray (this._nameObjectProperties,'propertyName',propertyName,{UseTokenizedStrings: false});

}
SimpleDB.prototype.resolveRecordType = function (recordTypeIdentifier)
{
	var recordType = null;

	if (recordTypeIdentifier instanceof RecordType)
		return recordTypeIdentifier;

	if (typeof recordTypeIdentifier === 'function')
		return findObjectInArray (this._recordTypes,'_constructorFunction',recordTypeIdentifier);

	if (typeof recordTypeIdentifier === 'string')
	{
		recordType = findObjectInArray (this._recordTypes,'code',recordTypeIdentifier,{UseTokenizedStrings: false});
		if (recordType) return recordType;

		recordType = findObjectInArray (this._recordTypes,'_allRecordsProperty',recordTypeIdentifier,{UseTokenizedStrings: false});
		if (recordType) return recordType;

		recordType = findObjectInArray (this._recordTypes,'code',recordTypeIdentifier,{UseTokenizedStrings: true});
		if (recordType) return recordType;

		recordType = findObjectInArray (this._recordTypes,'name',recordTypeIdentifier,{UseTokenizedStrings: true});
		if (recordType) return recordType;

	}

	return recordType;
}

SimpleDB.prototype.resolvePlurals = function (recordType)
{
	if (isEmptyOrNotDefined (recordType.pluralCode))
		recordType.pluralCode = recordType.code + 's';

	if (isNotDefined (recordType.pluralName))
		recordType.pluralName = new NameObject (recordType.name.Name + 's');
}

SimpleDB.prototype.resolveAllRecords = function (recordType)
{
	if (isEmptyOrNotDefined (recordType._allRecordsProperty))
		recordType._allRecordsProperty = recordType.pluralCode;

	if (isNotDefined (recordType._allRecordsOwner))
		recordType._allRecordsOwner = this._allRecordsOwner;

	recordType._allRecordsOwner [recordType._allRecordsProperty] = [];

	recordType._allRecords = recordType._allRecordsOwner [recordType._allRecordsProperty];
}

SimpleDB.prototype.resolveAllRecordRelations = function ()
{
	var simpleDB = this;

	simpleDB._allRecords.forEach (function (record) {
		simpleDB.resolveRecordRelations (record);
	});
}

SimpleDB.prototype.resolveRecordRelations = function (record)
{
	var simpleDB = this;
	var recordType = record._simpleDB.recordType;

	for (var p in record)
	{
		if (record.hasOwnProperty (p))
		{
			if (p === '_simpleDB')
				continue;

			var v = record [p];

			if (typeof (v) === 'number' && Number.isInteger (v))
			{
				var relation = recordType.getRecordRelationByProperty (p);
				if (relation)
				{
					var otherSnippet = relation.getOtherSnippet (relation.getSnippetByRecordType (recordType));
					if (otherSnippet)
					{
						if (v > 0)
							record [p] = simpleDB.findRecordByIndex (otherSnippet.recordType,v);
						else
							record [p] = null;

						continue;
					}
				}
			}

			if (isArray (v))
			{
				var relation = recordType.getRecordRelationByProperty (p);
				if (relation)
				{
					var otherSnippet = relation.getOtherSnippet (relation.getSnippetByRecordType (recordType));
					if (otherSnippet)
					{
						record [p] = [];

						v.forEach (function (recordIndex) {
							if (recordIndex > 0)
							{
								var r = simpleDB.findRecordByIndex (otherSnippet.recordType,recordIndex);
								record [p].push (r);
							}
							else
								record [p].push (null);
						});

						continue;
					}
				}
			}
		}
	}
}

RecordRelation.prototype.getSnippetByRecordType = function (recordType)
{
	if (this.parent.recordType === recordType)
		return this.parent;
	else
		return this.child;
}

RecordRelation.prototype.getSnippetByProperty = function (property)
{
	if (this.parent.property === property)
		return this.parent;
	else if (this.child.property === property)
		return this.child;
	else
		return null;
}

RecordRelation.prototype.getOtherSnippet = function (snippet)
{
	if (snippet === this.parent)
		return this.child;
	else if (snippet === this.child)
		return this.parent;
	else
		return null;
}

SimpleDB.prototype.getRecordPropertyReference = function (record,property)
{
	var result = new RecordPropertyReference ();
	result.record = record;
	result.recordType = record._simpleDB.recordType;
	result.property = property;

	return result;
}

RecordType.prototype.getRecordRelationByProperty = function (property)
{
	var result = null;

	this._recordRelations.some (function (relation) {
		var snippet = relation.getSnippetByProperty (property);
		if (snippet)
		{
			result = relation;
			return true;
		}
	});

	return result;
}
