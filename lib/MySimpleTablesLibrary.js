function SimpleTable (userParams)
{
	this.params = new SimpleTableParams (userParams);
	this.columns = [];
	this.callbacks = new SimpleTableCallbacks ();

	copyProperties (this.params,this);

	this.initialise ();
}

function SimpleTableParams (userParams)
{
	this.tableElement = null;
	this.tableElementId = '';
	this.tableElementSelector = '';
	this.parentElement = null;
	this.parentElementId = '';
	this.parentElementSelector = '';
	this.classNames = [];
	this.rowClassNames = [];
	this.sourceDataArray = [];
	this.properties = [];
	this.excludeProperties = [];
    this.sortColumn = null;

    this.tableDataArraySummaryObjects = [];
    this.footers = [];

	this.showHeaders = true;
	this.showFooters = [];
	this.footersTextColumnName = '';
	this.includeTHeadTag = true;
	this.includeTBodyTag = true;
	this.includeTFootTag = true;
    this.indicateSortColumn = true;
    this.includeRowNumberColumn = false;
    this.indicateOddAndEvenRows = true;
    this.useDynamicRefresh = false;
    this.useTableSorter = true;
    this.useSpinner = true;
    this.addTableToDOMNow = false;

	if (userParams)
		copyProperties (userParams,this);
}

function SimpleTableCallbacks ()
{
	this.onSortStart = null;
	this.onSortEnd = null;
}

function SimpleTableColumn (simpleTable,userParams)
{
	this.simpleTable = simpleTable;

	SimpleTableColumnParams.apply (this,[userParams]);

	if (this.isRowNumberColumn)
	{
		this.name = '#';
		this.classNames.push ('simpleTableRowNumberColumn');
		this.dataClassNames.push ('rowNumber');
	}
	else
	{
		if (this.property.length)
		{
			if (this.name.length == 0)
				this.name = this.property;

			this.classNames.push ('simpleTableColumn-' + this.name);
			this.dataClassNames.push (this.property);
		}
	}

	this.name = new NameObject (this.name);
}

function SimpleTableColumnParams (userParams)
{
	this.index = -1;
	this.name = '';
	this.hint = '';
	this.property = '';
	this.subProperty = '';
	this.classNames = [];
	this.dataClassNames = [];
	this.alignment = 'left';
	this.isRowNumberColumn = false;
	this.defaultSortOrder = 1;
	this.sortOrder = 1;
	this.isPropertyANameObject = false;
	this.isSubPropertyANameObject = false;
	this.decimalPlaces = null;
	this.excludeValues = [];
	this.applyPositiveValueClass = false;
	this.applyNegativeValueClass = false;
	this.includeInFooters = true;
	this.propertyValuePrefix = '';
	this.propertyValueSuffix = '';

	if (userParams)
		copyProperties (userParams,this);
}

SimpleTable.prototype.initialise = function ()
{
	this.setTableDataArrayFromSourceDataArray ();

	if (this.tableElementId.length)
		this.tableElementSelector = '#' + this.tableElementId;
	this.tableElement = this.getTableElement ();

	if (this.parentElementId.length)
		this.parentElementSelector = '#' + this.parentElementId;

	this.parentElement = this.getParentElement ();

	this.classNames.push ('simpleTable');
	if (this.indicateOddAndEvenRows)
		this.classNames.push ('simpleTable-indicateOddAndEvenRows');

	this.rowClassNames.push ('simpleTableRow');

	this.tableHeaderSelector = this.tableElementSelector;
	if (this.includeTHeadTag)
		this.tableHeaderSelector += ' > thead';

	this.tableFooterSelector = this.tableElementSelector;
	if (this.includeTHeadTag)
		this.tableFooterSelector += ' > tfoot';

	this.tableBodySelector = this.tableElementSelector;
	if (this.includeTBodyTag)
		this.tableBodySelector += ' > tbody';

	this.tableRowSelector = this.tableBodySelector + ' > tr';

	this.normaliseproperties ();
	this.produceColumns ();

	this.footers = getNormalisedArraySummaryTypes (this.showFooters);

	this.sortColumn = this.getColumn (this.sortColumn);
	this.lastSortColumn = null;

	if (this.addTableToDOMNow && this.parentElement)
		this.addTableToDOM ();
}

SimpleTable.prototype.getColumns = function (columnsOrColumnIds)
{
	var results = [];

	for (cColumn = 0; cColumn < columnsOrColumnIds.length; cColumn ++)
	{
		var columnId = columnsOrColumnIds [cColumn];

		var column = this.getColumn (columnId);

		if (column)
			results.push (column);
	}

	return results;
}

SimpleTable.prototype.getColumn = function (columnOrColumnId)
{
	if (columnOrColumnId instanceof SimpleTableColumn)
		return columnOrColumnId;

	if (typeof columnOrColumnId == 'number')
		return this.getColumnByIndex (columnOrColumnId);

	if (typeof columnOrColumnId == 'string')
	{
		var column = this.getColumnByName (columnOrColumnId);
		if (column)
			return column;

		var column = this.getColumnByProperty (columnOrColumnId);
		if (column)
			return column;
	}

	return null;
}

SimpleTable.prototype.getColumnByIndex = function (index)
{
	return this.columns [index];
}

SimpleTable.prototype.getColumnByName = function (name)
{
	return FindNamedObjectInArray (this.columns,'name',name);
}

SimpleTable.prototype.getColumnByProperty = function (property)
{
	return findObjectInArray (this.columns,'property',property);
}

SimpleTable.prototype.getRowCount = function ()
{
	return $(this.tableRowSelector).length;
}

SimpleTable.prototype.getTableCell = function (tableRow,column,cellTag)
{
	var workingCellTag = cellTag || 'td';
	var cellSelector = workingCellTag + ':eq(' + column.index + ')';
	
	return tableRow.children (cellSelector);
}

SimpleTable.prototype.getTableHeaderRow = function (index)
{
	var workingIndex = index || 0;

	return $(this.tableHeaderSelector + sprintf (' > tr:eq(%d)',workingIndex));
}

SimpleTable.prototype.getTableFooterRow = function (index)
{
	var workingIndex = index || 0;

	return $(this.tableFooterSelector + sprintf (' > tr:eq(%d)',workingIndex));
}

SimpleTable.prototype.getTableRow = function (index)
{
	return $(this.tableRowSelector + ':eq(' + index.toString () + ')');
}

SimpleTable.prototype.getTableRowForObjectIndex = function (objectIndex)
{
	if (objectIndex < 0)
		return null;

	var row = $(this.tableRowSelector + '[data-simpletable-objectindex="' + objectIndex.toString () + '"]');

	return row;
}

SimpleTable.prototype.getTableRowForObject = function (object)
{
	var index = this.getObjectIndex (object);

	return this.getTableRowForObjectIndex (index);
}

SimpleTable.prototype.getObject = function (objectIndex)
{
	if (objectIndex > -1)
		return this.tableDataArray [objectIndex];
	else
		return null;
}

SimpleTable.prototype.getObjectIndex = function (object)
{
	return this.tableDataArray.indexOf (object);
}

SimpleTable.prototype.autoSetColumnAlignment = function (column)
{
	switch (column.valueType)
	{
		case 'number':
			column.alignment = 'right';
			break;
		default:
			column.alignment = 'left';
	}
}

SimpleTable.prototype.addColumn = function (userParams)
{
	var params = new SimpleTableColumnParams (userParams);

	var column = new SimpleTableColumn (this,params);

	this.columns.push (column);

	column.index = this.columns.length - 1;

	var object = this.getExampleSourceDataArrayObject ();

	if (object)
	{
		var propertyValue = object [column.property];

		if (isDefined (propertyValue))
		{
			column.valueType = typeof propertyValue;

			if (column.valueType == 'object')
			{
				if (propertyValue instanceof NameObject)
				{
					column.isPropertyANameObject = true;
				}
				else
				{
					if (!column.subProperty.length)
					{
						var nameObjects = GetNameObjectProperties (propertyValue);

						if (nameObjects && nameObjects.length)
							column.subProperty = nameObjects [0];
						else
						{
							if (isDefined (propertyValue.name))
								column.subProperty = 'name';
						}
					}

					var subPropertyValue = propertyValue [column.subProperty];
					if (subPropertyValue instanceof NameObject)
						column.isSubPropertyANameObject = true;
				}
			}
			else
			{
				if (column.valueType == 'string' && isNumeric (propertyValue))
					column.valueType = 'number';
			}
		}

		this.autoSetColumnAlignment (column);
	}

	return column;
}

SimpleTable.prototype.refreshTableCell = function (tableRow,column,object)
{
	var cell = this.getTableCell (tableRow,column);

	var cellText = this.produceTableCellHtml (object,column,tableRow.index ());

	cell.html (cellText);
}

SimpleTable.prototype.refreshTableRowIndex = function (index,object)
{
	var tableRow = this.getTableRow (index);

	this.refreshTableRow (tableRow,object);
}

SimpleTable.prototype.refreshTableRowForObject = function (object)
{
	var index = this.tableDataArray.indexOf (object);
	if (index > -1)
		this.refreshTableRowIndex (index,object);
}

SimpleTable.prototype.refreshTableRow = function (tableRow,object)
{
	for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
	{
		var column = this.columns [cColumn];

		this.refreshTableCell (tableRow,column,object);
	}
}

SimpleTable.prototype.refreshTable = function ()
{
	if (!this.useDynamicRefresh)
	{
		this.addTableToDOM ();
		return;
	}

	this.normaliseTableRowCount ();

	for (var cRow = 0; cRow < this.tableDataArray.length; cRow ++)
		this.refreshTableRowIndex (cRow,this.tableDataArray [cRow]);
}

SimpleTable.prototype.attachTableSorterToTable = function ()
{
	var simpleTable = this;

	var headers = {};

	for (var cColumn = 0; cColumn < simpleTable.columns.length; cColumn ++)
	{
		var column = simpleTable.columns [cColumn];

		var header = {};

		if (column.isRowNumberColumn)
			header.sorter = false;
		else
		{
			var sortOrder = 'asc';
			if (column.defaultSortOrder < 0)
				sortOrder = 'desc';

			header.sortInitialOrder = sortOrder;
		}

		headers [cColumn.toString ()] = header;
	}

	simpleTable.tableElement.tablesorter ({
		headerTemplate: '',
		headers: headers,
		delayInit: false,
		sortRestart: true,
		sortInitialOrder: 'asc',
		sortStable: true,
		textExtraction: function (node)
		{
			return node.textContent || $(node).text() || '';
		}
	});		

	simpleTable.tableElement.bind ('sortStart',function ()
	{
		if (simpleTable.isSpinnerRequired ())
			showSpinner ();

		if (simpleTable.callbacks.onSortStart)
			simpleTable.callbacks.onSortStart (simpleTable);
	});

	simpleTable.tableElement.bind ('sortEnd',function ()
	{
		if (simpleTable.includeRowNumberColumn)
		{
			simpleTable.tableElement.find ('tbody tr').each (function () {
				$(this).children ('td:eq(0)').text ($(this).index () + 1);
			});
		}

		if (simpleTable.isSpinnerRequired ())
			hideSpinner ();

		if (simpleTable.callbacks.onSortEnd)
			simpleTable.callbacks.onSortEnd (simpleTable);
	});
}

SimpleTable.prototype.produceTableDataArraySummaryObjects = function ()
{
	var summaryObjectParams = {};

	summaryObjectParams.sourceArray = this.tableDataArray;
	summaryObjectParams.defaultValueForNonProcessedProperties = '';
	summaryObjectParams.summaryTypes = this.footers;
	summaryObjectParams.summaryTextProperty = this.footersTextColumnName;

	copyProperties (this,summaryObjectParams,['properties','excludeProperties','summaryProperties']);

	for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
	{
		var column = this.columns [cColumn];

		if (!column.includeInFooters)
			summaryObjectParams.excludeProperties.pushIfNew (column.property);
	}
	
	this.tableDataArraySummaryObjects = produceArraySummaryObjects (summaryObjectParams);
}

SimpleTable.prototype.addTableToDOM = function ()
{
	if (this.isSpinnerRequired ())
		showSpinner ();

	if (this.showFooters && this.showFooters.length && this.footers && this.footers.length)
		this.produceTableDataArraySummaryObjects ();

	this.produceTableHtml ();

	this.getTableElement ();
	this.getParentElement ();

	this.parentElement.append (this.tableHtml);

	this.getTableElement ();

	this.attachTableEventHandlers ();

	if (this.useTableSorter && this.includeTHeadTag && this.includeTBodyTag)
		this.attachTableSorterToTable ();

	if (this.useDynamicRefresh)
		this.refreshTable ();

	if (this.indicateSortColumn)
		this.doIndicateSortColumn ();

	if (this.isSpinnerRequired ())
		hideSpinner ();

	if (isDefined (this.sortColumn))
		this.sortTable (this.sortColumn);

	this.tableElement.show ();
}

SimpleTable.prototype.doIndicateSortColumn = function ()
{
	if (!this.indicateSortColumn)
		return;

	if (!this.showHeaders)
		return;

	var headerRow = this.getTableHeaderRow ();

	for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
	{
		var column = this.columns [cColumn];

		var cell = this.getTableCell (headerRow,column,'th');

		if (column == this.sortColumn)
			cell.addClass ('simpleTableSortColumnHeader');
		else
			cell.removeClass ('simpleTableSortColumnHeader');
	}
}

SimpleTable.prototype.sortTable = function (sortColumnOrColumnId,reverseOrderIfSortColumnIsLastSortColumn,fromHeaderClick)
{
	var simpleTable = this;

	var sortColumn = this.getColumn (sortColumnOrColumnId);
	if (!sortColumn)
		return false;
	this.sortColumn = sortColumn;

	if (this.lastSortColumn && this.lastSortColumn == this.sortColumn && reverseOrderIfSortColumnIsLastSortColumn)
		this.sortColumn.sortOrder = this.sortColumn.sortOrder * -1;
	else
		this.sortColumn.sortOrder = this.sortColumn.defaultSortOrder;

	this.lastSortColumn = this.sortColumn;

	this.doIndicateSortColumn ();

	if (this.useTableSorter)
	{
		if (!fromHeaderClick)
		{
			this.tableElement.trigger ('update');

			var sortArray = [[this.sortColumn.index,1]];

			this.tableElement.trigger ('sorton',[sortArray]);
		}
	}
	else
	{
		var sortProperty = this.sortColumn.property;

		this.tableDataArray.sort (function (a,b)
		{
			var result;
			if (a [simpleTable.sortColumn.property] < b [simpleTable.sortColumn.property])
				result = -1;
			else
				result = 1;

			result = result * simpleTable.sortColumn.sortOrder;

			return result;
		});

		this.refreshTable ();
	}
}

SimpleTable.prototype.produceColumns = function ()
{
	if (this.includeRowNumberColumn)
	{
		var columnParams = new SimpleTableColumnParams ();
		columnParams.isRowNumberColumn = true;

		var rowNumberColumn = this.addColumn (columnParams);
	}

	this.produceColumnsForproperties ();
}

SimpleTable.prototype.produceColumnsForproperties = function ()
{
	for (var cProperty = 0; cProperty < this.properties.length; cProperty ++)
	{
		var property = this.properties [cProperty];

		var columnParams = new SimpleTableColumnParams ();

		columnParams.property = property;

		var column = this.addColumn (columnParams);
	}
}

SimpleTable.prototype.getExampleSourceDataArrayObject = function ()
{
	if (this.sourceDataArray && this.sourceDataArray.length)
		return this.sourceDataArray [0];
	else
		return null;
}

SimpleTable.prototype.normaliseproperties = function ()
{
	var object = this.getExampleSourceDataArrayObject ();

	if (!object)
		return false;

	this.properties = getNormalisedObjectProperties (object,{properties: this.properties, excludeProperties: this.excludeProperties});
}

SimpleTable.prototype.getTableElement = function ()
{
	this.tableElement = $(this.tableElementSelector);

	return this.tableElement;
}

SimpleTable.prototype.getParentElement = function ()
{
	if (this.parentElementSelector && this.parentElementSelector.length)
		this.parentElement = $(this.parentElementSelector);

	return this.parentElement;
}

SimpleTable.prototype.produceClassNamesStrFromClassNamesArray = function (classNames)
{
	return classNames.join (' ');
}

SimpleTable.prototype.getClassAttribute = function (classNames)
{
	var result = produceHtmlPropertyString ('class',this.produceClassNamesStrFromClassNamesArray (classNames));

	return result;
}

SimpleTable.prototype.produceTableHeaderCellHtml = function (column)
{
	var cellHtml = '';

	var cellClassNames = column.classNames.slice ();

	switch (column.alignment)
	{
		case 'left': cellClassNames.push ('alignLeft'); break;
		case 'right': cellClassNames.push ('alignRight'); break;
		case 'center': cellClassNames.push ('alignCenter'); break;
	}

	cellHtml += '<th';
	cellHtml += ' ' + produceHtmlPropertyString ('class',cellClassNames);
	cellHtml += '>';

	cellHtml += column.name.Name;

	cellHtml += '</th>';

	return cellHtml;
}

SimpleTable.prototype.produceTableCellHtml = function (object,column,rowIndex,parentTag)
{
	var cellHtml = '';

	var cellClassNames = column.dataClassNames.slice ();

	switch (column.alignment)
	{
		case 'left': break;
		case 'right': cellClassNames.push ('alignRight'); break;
		case 'center': cellClassNames.push ('alignCenter'); break;
	}

	var propertyValue, subPropertyValue;

	if (column.isRowNumberColumn && parentTag == 'tbody')
		propertyValue = (rowIndex + 1).toString ();
	else
	{
		propertyValue = object [column.property];

		if (isDefined (this.produceTableCellValueCallback))
			propertyValue = this.produceTableCellValueCallback (this,object,column,rowIndex,parentTag,propertyValue,subPropertyValue,cellClassNames);

		if (column.excludeValues.indexOf (propertyValue) > -1)
			propertyValue = '';
		else
		{
			if (typeof propertyValue == 'number')
			{
				if (column.applyNegativeValueClass && propertyValue < 0)
					cellClassNames.push ('negativeValue');
				if (column.applyPositiveValueClass && propertyValue > 0)
					cellClassNames.push ('positiveValue');

				if (isDefined (column.decimalPlaces))
					propertyValue = numberToStringWithFixedDecimalPlaces (propertyValue,column.decimalPlaces);
			}
			else if (typeof propertyValue == 'object')
			{
				if (propertyValue instanceof NameObject)
					propertyValue = propertyValue.Name;
				else
				{
					subPropertyValue = propertyValue [column.subProperty];
					if (subPropertyValue instanceof NameObject)
						propertyValue = subPropertyValue.Name;
					else
						propertyValue = subPropertyValue;
				}
			}
		}
	}

	if (isDefined (this.produceTableCellHtmlCallback))
		this.produceTableCellHtmlCallback (this,object,column,rowIndex,parentTag,propertyValue,subPropertyValue,cellClassNames);

	cellHtml += '<td';
	cellHtml += ' ' + this.getClassAttribute (cellClassNames);
	cellHtml += '>';

	if (isDefinedAndNotEmpty (propertyValue))
	{
		if (isDefinedAndNotEmpty (column.propertyValuePrefix))
			cellHtml += column.propertyValuePrefix;

		cellHtml += propertyValue.toString ();

		if (isDefinedAndNotEmpty (column.propertyValueSuffix))
			cellHtml += column.propertyValueSuffix;
	}

	cellHtml += '</td>';

	return cellHtml;
}

SimpleTable.prototype.produceTableHeadersHtml = function ()
{
	var headersHtml = '';

	if (this.includeTHeadTag)
		headersHtml += '<thead>';

	if (this.showHeaders)
	{
		var rowHtml = '';

		rowHtml += '<tr ' + produceHtmlPropertyString ('class','simpleTableHeaderRow') + '>';

		for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
		{
			var column = this.columns [cColumn];

			var cellHtml = this.produceTableHeaderCellHtml (column);

			rowHtml += cellHtml;
		}

		rowHtml += '</tr>';

		headersHtml += rowHtml;
	}

	if (this.includeTHeadTag)
		headersHtml += '</thead>';

	return headersHtml;
}

SimpleTable.prototype.produceTableFootersHtml = function ()
{
	var footersHtml = '';

	if (this.showFooters && this.showFooters.length && this.footers && this.footers.length && this.tableDataArray.length > 1)
	{
		if (this.includeTFootTag)
			footersHtml += '<tfoot>';

		for (var cSummaryObject = 0; cSummaryObject < this.tableDataArraySummaryObjects.length; cSummaryObject ++)
		{
			var object = this.tableDataArraySummaryObjects [cSummaryObject];

			var rowHtml = '';

			rowHtml += '<tr ' + produceHtmlPropertyString ('class','simpleTableFooterRow') + '>';

			for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
			{
				var column = this.columns [cColumn];

				var cellHtml = this.produceTableCellHtml (object,column,cSummaryObject,'tfoot');

				rowHtml += cellHtml;
			}

			rowHtml += '</tr>';
			footersHtml += rowHtml;
		}

		if (this.includeTFootTag)
			footersHtml += '</tfoot>';
	}

	return footersHtml;
}

SimpleTable.prototype.produceTableRowHtml = function (object,rowIndex,parentTag)
{
	var rowHtml = '';

	rowHtml += '<tr';
	rowHtml += ' ' + this.getClassAttribute (this.rowClassNames);
	rowHtml += ' ' + produceHtmlPropertyString ('data-simpletable-objectindex',rowIndex.toString ());
	rowHtml += '>';

	for (var cColumn = 0; cColumn < this.columns.length; cColumn ++)
	{
		var column = this.columns [cColumn];

		var cellHtml = this.produceTableCellHtml (object,column,rowIndex,parentTag);

		rowHtml += cellHtml;
	}

	rowHtml += '</tr>';

	return rowHtml;
}

SimpleTable.prototype.produceTableBodyHtml = function ()
{
	var bodyHtml = '';

	if (this.includeTBodyTag)
		bodyHtml += '<tbody>';

	if (!this.useDynamicRefresh)
	{
		for (var cObject = 0; cObject < this.tableDataArray.length; cObject ++)
			bodyHtml += this.produceTableRowHtml (this.tableDataArray [cObject],cObject,'tbody');
	}

	if (this.includeTBodyTag)
		bodyHtml += '</tbody>';

	return bodyHtml;
}

SimpleTable.prototype.produceTableHtml = function ()
{
	var tableHtml = '';

	tableHtml += '<table';
	tableHtml += ' ' + produceHtmlPropertyString ('id',this.tableElementId);
	tableHtml += ' ' + this.getClassAttribute (this.classNames);
	tableHtml += '>';

	tableHtml += this.produceTableHeadersHtml ();

	tableHtml += this.produceTableBodyHtml ();

	tableHtml += this.produceTableFootersHtml ();

	tableHtml += '</table>';

	this.tableHtml = tableHtml;

	return tableHtml;
}

SimpleTable.prototype.normaliseTableRowCount = function ()
{
	if (this.tableDataArray.length == 0)
		$(this.tableRowSelector).remove ();
	else
	{
		while (this.getRowCount () > this.tableDataArray.length)
			$(this.tableRowSelector + ':eq(0)').remove ();
	}

	var newRowsRequired = this.tableDataArray.length - this.getRowCount ();

	if (newRowsRequired)
	{
		var bodyElement = $(this.tableBodySelector);
		var tableRowHtml = '';

		for (var cRow = 0; cRow < newRowsRequired; cRow ++)
			tableRowHtml += this.produceTableRowHtml ();

		bodyElement.append (tableRowHtml);
	}
}

SimpleTable.prototype.isSpinnerRequired = function ()
{
	return (this.useSpinner && this.tableDataArray.length > 500);
}

SimpleTable.prototype.handleHeaderClick = function (e)
{
	var cell = $(e.target);

	e.stopPropagation ();

	var column = this.columns [cell.index ()];

	this.sortTable (column,true,true);
}

SimpleTable.prototype.attachTableEventHandlers = function ()
{
	var simpleTable = this;

	var headerSelector = this.tableHeaderSelector + ' > tr > th';

	$(headerSelector).on ('click', function (e) {simpleTable.handleHeaderClick (e)});
}

SimpleTable.prototype.setTableDataArrayFromSourceDataArray = function ()
{
//	this.tableDataArray = this.sourceDataArray.slice ();
	this.tableDataArray = this.sourceDataArray;
}
