// ---------------------------------------------
// prototypes begin p.begin p.b pb
// ---------------------------------------------

function MachinaTableObject (pTableID,pTableClassNames,pBindToArray)
{
    this.TableID = pTableID;
    this.TableClassNames = pTableClassNames;
    this.BindToArray (pBindToArray);

    this.Columns = [];

    this.ShowColumnHeaders = true;

    this.DOMTable = null;
    this.jQueryTable = null;
}

function MachinaTableColumnObject ()
{
    this.Title = '';
    this.ObjectProperty = '';
    this.ClassNames = '';
}

MachinaTableObject.prototype.BindToArray = function (pArray)
{
    this.BoundArray = pArray;
}

MachinaTableObject.prototype.AddColumn = function (pTitle,pObjectProperty,pClassNames)
{
    var newColumn = new MachinaTableColumnObject ();

    newColumn.Title = pTitle;
    newColumn.ObjectProperty = pObjectProperty || pTitle;
    newColumn.ClassNames = pClassNames || GetTokenizedVersionOf (pTitle);

    this.Columns.push (newColumn);

    return newColumn;
}

MachinaTableObject.prototype.GetColumn = function (pTitleOrObjectProperty)
{
    return findObjectInArray (this.Columns,['Title','ObjectProperty'],pTitleOrObjectProperty);
}

MachinaTableObject.prototype.CreateDOMTable = function ()
{
    if (isDefined (this.jQueryTable) && this.jQueryTable.length)
    {
        console.log ('removing table');
        this.jQueryTable.remove ();
    }

    var TableHTML = '<table id="' + this.TableID + '" class="' + this.TableClassNames + '">';

    TableHTML += '</table>';

    this.jQueryTable = $(TableHTML);
}

MachinaTableObject.prototype.PopulateTableFromArray = function ()
{
    return this.SynchFromArrayToTable ();
}

MachinaTableObject.prototype.SynchFromArrayToTable = function ()
{
    this.AddHeaderRow ();

    for (var cArrayElement = 0; cArrayElement < this.BoundArray.length; cArrayElement++)
    {
        var tmpObject = this.BoundArray [cArrayElement];

        this.AddRow (tmpObject);
    }
}

MachinaTableObject.prototype.GetRowForBoundObject = function (pObject)
{
    var thisMachinaTable = this;

    var ObjectIndex = this.BoundArray.indexOf (pObject);

    if (ObjectIndex < 0)
        return null;

    var result = null;

    this.jQueryTable.find ('tr').each (function ()
    {
        if (thisMachinaTable.GetBoundObjectForRow ($(this)) == pObject)
//        if ($(this).attr (MachinaDataBoundObjectKey,ObjectIndex.toString ()))
        {
            result = $(this);
            return false;
        }
    });

    return result;
}

MachinaTableObject.prototype.GetBoundObjectForRow = function (pRow)
{
    var BoundObjectIndexStr = $(pRow).attr (MachinaDataBoundObjectKey) || '';

    if (Empty (BoundObjectIndexStr) || isNaN (BoundObjectIndexStr))
        return null;
    
    var BoundObjectIndex = parseInt (BoundObjectIndexStr);

    if (BoundObjectIndex < 0 || BoundObjectIndex >= this.BoundArray.length)
        return null;

    return this.BoundArray [BoundObjectIndex];
}

MachinaTableObject.prototype.AddRow = function (pObject,pIsHeaderRow)
{
    var newRowHTML = '<tr>';
    if (isDefined (pObject))
    {
        var ObjectClassName = pObject.constructor.name;
        newRowHTML = '<tr class="' + ObjectClassName + '" ' + MachinaDataBoundObjectKey + '="' + this.BoundArray.indexOf (pObject).toString () + '">';
    }

    for (cColumn = 0; cColumn < this.Columns.length; cColumn++)
    {
        var Column = this.Columns [cColumn];

        var newCellHTML = '';
        if (pIsHeaderRow)
            newRowHTML += '<th class="' + Column.ClassNames + '">' + Column.Title + '</th>';
        else
            newRowHTML += '<td class="' + Column.ClassNames + '"></td>';
    }

    newRowHTML += '</tr>';

    this.jQueryTable.append (newRowHTML);

    if (isDefined (pObject))
        this.SynchFromObjectToRow (pObject,this.GetRowForBoundObject (pObject));
}

MachinaTableObject.prototype.AddHeaderRow = function ()
{
    return this.AddRow (null,true);
}

MachinaTableObject.prototype.SynchFromObjectToRow = function (pObject)
{
    var thisMachinaTable = this;

    var Row = this.GetRowForBoundObject (pObject);

    if (!Row)
    {
        return false;
    }

    Row.children ('td').each (function (index)
    {
        var Column = thisMachinaTable.Columns [index];

        var CellText = getObjectProperty (pObject,Column.ObjectProperty);
        $(this).text (CellText);
    });

}

MachinaTableObject.prototype.GetCell = function (pTableRow,pColumn)
{

}

function InitialiseMachinaDataKeys ()
{
    MachinaDataBoundObjectKey = 'machinadata-bound-object';
}

InitialiseMachinaDataKeys ();

// ---------------------------------------------
// prototypes end p.end p.e pe 
// functions begin f.begin f.b fb 
// ---------------------------------------------

function GetCell (table,rowObject,column)
{
    if (isNaN (column))
        return ($(rowObject).children().eq(GetColumnIndex (table,column)));
    else
        return ($(rowObject).children().eq(column));
}
 
function GetColumnIndex (InThisTable,ColumnTitle)
{
    var tmpColumnTH = InThisTable.find ('th').filter(function(index) {return AreStringsBasicallyEqual ($(this).text(),ColumnTitle);});
    
    if (tmpColumnTH.length)
        return tmpColumnTH.index ();
    else
        return -1;
}

function GetColumnCells (InThisTable,ColumnIndex)
{
    var ColumnSearchCriteria = 'th:nth-child(' + (ColumnIndex + 1) + '),td:nth-child(' + (ColumnIndex + 1) + ')';

    var results = $(InThisTable).find (ColumnSearchCriteria);

    return results;
}

function SetColumnIndexWidth (InThisTable,ColumnIndex,Width)
{
    var ColumnSearchCriteria = 'th:nth-child(' + (ColumnIndex + 1) + '),td:nth-child(' + (ColumnIndex + 1) + ')';
    $(InThisTable).find(ColumnSearchCriteria).css ('width',Width);
}

function SetColumnIndexCSS (InThisTable,ColumnIndex,CSSProperty,CSSValue)
{
    var ColumnSearchCriteria = 'th:nth-child(' + (ColumnIndex + 1) + '),td:nth-child(' + (ColumnIndex + 1) + ')';
    $(InThisTable).find(ColumnSearchCriteria).css (CSSProperty,CSSValue);
}

function SetColumnIndexVisible (InThisTable,ColumnIndex,Value)
{
    var ColumnSearchCriteria = 'th:nth-child(' + (ColumnIndex + 1) + '),td:nth-child(' + (ColumnIndex + 1) + ')';
    if (Value == true)
    {
        $(InThisTable).find(ColumnSearchCriteria).show ();
    }
    else
    {
        $(InThisTable).find(ColumnSearchCriteria).hide ();
    }
}

function SetColumnIndexTitle (InThisTable,ColumnIndex,Title)
{
    InThisTable.find ('tr:eq(0)').children().eq(ColumnIndex).html (Title);
}

function InsertColumnABeforeColumnB (InThisTable,ColumnNameA,ColumnNameB)
{
    var ColumnBIndex = GetColumnIndex (InThisTable,ColumnNameB);
    
    InThisTable.find('tr:eq(0)').eq(0).find('th').eq(ColumnBIndex).before ('<th>'+ColumnNameA+'</th>');
    InThisTable.find('tr:gt(0)').each(function(){
        $(this).find('td').eq(ColumnBIndex).before('<td></td>');
    });
}

function InsertColumnAAfterColumnB (InThisTable,ColumnNameA,ColumnNameB)
{
    InThisTable.find('tr:eq(0)').eq(0).find('th').eq(GetColumnIndex (InThisTable,ColumnNameB)).after ('<th>'+ColumnNameA+'</th>');
    InThisTable.find('tr:gt(0)').each(function(){
        $(this).find('td').eq(GetColumnIndex (InThisTable,ColumnNameB)).after('<td></td>');
    });
}

function SwitchColumns (InThisTable,col1,col2)
{
    InThisTable.find('tr').each (function (){
        RowCells = $(this).find ('td,th');
        var tmpCell = RowCells.eq(col1).clone();
        RowCells.eq (col1).html (RowCells.eq (col2).html());
        RowCells.eq (col2).html (tmpCell.html());
    });
}

function GetArrayElementFromTableRow (pTable,pTableRow,pArray)
{
    var ArrIndex = parseInt (($(pTableRow).attr ('data-arrayelementindex') || '-1'));

    if (ArrIndex >= 0 && ArrIndex < pArray.length)
        return pArray [ArrIndex];
    else
        return null;
}

function GetTableRowFromArrayElement (pTable,pArray,pArrayElement)
{
    var TableRows = $(pTable).find ('tr');

    var result = null;

    var ArrIndex = -1;
    if (typeof pArrayElement == 'object')
        ArrIndex = pArray.indexOf (pArrayElement);
    else
        ArrIndex = pArrayElement;

    TableRows.each (function () {
        var RowArrIndex = parseInt (($(this).attr ('data-arrayelementindex') || '-1'));
        if (ArrIndex == RowArrIndex)
        {
            result = $(this);
            return false;
        }
    });
}

function BindArrayToTable (pArray,pTable,pStartRowIndex)
{
    if (!isDefined (pStartRowIndex))
        pStartRowIndex = 0;

    for (var cArray = 0; cArray < pArray.length; cArray ++)
    {
        var ArrObj = pArray [cArray];
        var TableRow = $(pTable).find ('tr:eq(' + (cArray + pStartRowIndex).toString () + ')');
        TableRow.attr ('data-arrayelementindex',cArray.toString ());
    }
}

function CreateTableHTML (FromThisArray,DoWeWantHeaders,DoWeWantTableTags,PropertiesToInclude)
{
    if (FromThisArray.length == 0)
    {
        if (DoWeWantTableTags)
            return ('<table></table>');
        else
            return ('');
    }

    var result = '';
    if (DoWeWantTableTags)
        result += '<table>';
    
    var PropertiesToIncludeArray = [];

    if (PropertiesToInclude)
    {
        var tmpPropertiesToInclude = PropertiesToInclude || '';
        PropertiesToIncludeArray = tmpPropertiesToInclude.split (',');
    }

    if (DoWeWantHeaders)
    {
        result += '<thead>';
        // put column headers row in
        result += '<tr>';
        // grab the first object in the array and loop through its property names
        var tmpObject = FromThisArray [0];
        for (var tmpProperty in tmpObject)
        {
            if (PropertiesToIncludeArray.length == 0 || PropertiesToIncludeArray.indexOf (tmpProperty) > -1)
                result += ('<th>' + tmpProperty + '</th>');
        }
        result += '</tr>';
        result += '</thead>';
        result += '<tbody>';
    }
    
    // loop through all objects and add them
    for (var cObject = 0; cObject < FromThisArray.length; cObject++)
    {
        var tmpObject = FromThisArray [cObject];
        
        result += '<tr>';
        for (var tmpProperty in tmpObject)
        {
            if (PropertiesToIncludeArray.length == 0 || PropertiesToIncludeArray.indexOf (tmpProperty) > -1)
            {
                var tmpValue = tmpObject [tmpProperty];
                result += ('<td class="' + tmpProperty + '">' + tmpValue + '</td>');
            }
        }
        result += '</tr>';
    }
    
    if (DoWeWantHeaders)
        result += '</tbody>';

    if (DoWeWantTableTags)
        result += '</table>';
    
    return result;
}

function CreateTableHTML2 (FromThisArray,DoWeWantHeaders,DoWeWantTableTags,Columns)
{
    if (FromThisArray.length == 0)
    {
        if (DoWeWantTableTags)
            return ('<table></table>');
        else
            return ('');
    }

    var result = '';
    if (DoWeWantTableTags)
        result += '<table>';

    var ColumnsArray = [];
    if (Columns)
    {
        var tmpColumns = Columns || '';
        ColumnsArray = tmpColumns.split (',');
    }

    if (DoWeWantHeaders)
    {
        result += '<tr>';

        for (cColumn = 0; cColumn < ColumnsArray.length; cColumn++)
        {
            var Column = ColumnsArray [cColumn];
            result += ('<th>' + Column + '</th>');
        }            

        result += '</tr>';
    }
    
    // loop through all objects and add them
    for (var cObject = 0; cObject < FromThisArray.length; cObject++)
    {
        var tmpObject = FromThisArray [cObject];
        
        result += '<tr>';

        for (cColumn = 0; cColumn < ColumnsArray.length; cColumn++)
        {
            var Column = ColumnsArray [cColumn];

            var tmpValue = '';
            if (Column in tmpObject)
                tmpValue = tmpObject [Column];

            result += ('<td class="' + GetTokenizedVersionOf (Column) + '" style="width: auto">' + tmpValue + '</td>');
        }
        result += '</tr>';
    }
    
    if (DoWeWantTableTags)
        result += '</table>';
    
    return result;
}

function ApplyStandardFormattingToTable (ThisTable)
{
    if (IsPreferenceEnabled ('Table style','Background color'))
        ThisTable.css('background',GetPreferenceValue ('Table style','Background color'));
    
    ThisTable.css('fontFamily',GetPreferenceValue ('Table style','Font name'));
    ThisTable.css('fontSize',GetPreferenceValue ('Table style','Font size'));
    ThisTable.css ('font-size',parseInt (GetPreferenceValue ('Table style','Font size')) + 'px');
    ThisTable.css('color',GetPreferenceValue ('Table style','Non-important text font color'));
    if (IsPreferenceEnabled ('Table style','Bold font'))
        ThisTable.css('fontWeight','bold');
    
    ThisTable.css('border-collapse','collapse');    
    if (!IsPreferenceEnabled ('Table style','Show borders between columns'))
        ThisTable.attr('border', '0');
    ThisTable.css('border','medium solid black');    
    ThisTable.find ('tr:eq(0)').css('border','medium solid black');    

    ThisTable.find ('td,th').each (function(){
        $(this).css('padding', '1px 5px');
        $(this).css('border-bottom', 'thin solid silver');
        $(this).css ('white-space','nowrap');
    });
}
