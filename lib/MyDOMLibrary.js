function PersistentElementValue ()
{
    this.ElementId = '';
    this.ElementValue = '';
    this.ElementType = '';
    this.Value = '';
}

function savePersistentElementValues (SectionName)
{
    if (!isDefined (SectionName))
        SectionName = '';

    var PersistentValues = loadArray (getPersistentElementValuesKey (SectionName));

    $('.persistent-value').each (function ()
    {
        var tmpElement = $(this);

        if (tmpElement.attr ('id') && tmpElement.attr ('id').length)
        {
            var tmpElementId = tmpElement.attr ('id');

            var PersistentValue = findObjectInArray (PersistentValues,'ElementId',tmpElement.attr ('id'),{UseTokenizedStrings: false});

            if (!PersistentValue)
            {
                PersistentValue = new PersistentElementValue ();
                PersistentValue.ElementId = tmpElement.attr ('id');
                PersistentValues.push (PersistentValue);
            }

            if (tmpElement.attr ('type'))
            {
                switch (tmpElement.attr ('type').toLowerCase ())
                {
                    case 'checkbox':
                    case 'radio':
                        PersistentValue.Value = (tmpElement.is (':checked')).toString ();
                        break;

                    default:
                        PersistentValue.Value = tmpElement.val ();

                }
            }
            else
            {
                switch (tmpElement.prop ('tagName'))
                {
                    // case 'select':
                    //     PersistentValue.Value = $('#' + tmpElementId + ' :selected').text ();
                }
            }
        }
    });

    saveArray (PersistentValues,getPersistentElementValuesKey (SectionName));
}

function loadAndApplyPersistentElementValues (SectionName)
{
    if (!isDefined (SectionName))
        SectionName = '';

    var PersistentValues = loadArray (getPersistentElementValuesKey (SectionName));

    $('.persistent-value').each (function ()
    {
        var tmpElement = $(this);

        if (tmpElement.attr ('id') && tmpElement.attr ('id').length)
        {
            var tmpElementId = tmpElement.attr ('id');

            var PersistentValue = findObjectInArray (PersistentValues,'ElementId',tmpElement.attr ('id'),{UseTokenizedStrings: false});

            if (PersistentValue)
            {
                if (tmpElement.attr ('type'))
                {
                    switch (tmpElement.attr ('type').toLowerCase ())
                    {
                        case 'checkbox':
                        case 'radio':
                            tmpElement.prop ("checked",PersistentValue.Value == 'true');
                            break;

                        default:
                            tmpElement.val (PersistentValue.Value);
                    }
                }
                else
                {
                    switch (tmpElement.prop ('tagName'))
                    {
                        // case 'select':
                        //     PersistentValue.Value = $('#' + tmpElementId + ' :selected').text ();
                    }
                }
            }
        }
    });
}

function getPersistentElementValuesKey (SectionName)
{
    var Key = '';

    if (!empty (SectionName))
        Key += SectionName + '.';

    Key += 'PersisentElementValues';

    return Key;
}

function openSelectElement (selector)
{
    var element = $(selector)[0], worked = false;
    if (document.createEvent) { // all browsers
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        worked = element.dispatchEvent(e);
    } else if (element.fireEvent) { // ie
        worked = element.fireEvent("onmousedown");
    }
}

function arrayToSelectOptions (ThisSelect,ThisArray,PropToUseAsText)
{
    ThisSelect.empty ();

    for (var c = 0; c < ThisArray.length; c++)
    {
        var opt = document.createElement ('option');
        if (isDefined (PropToUseAsText))
        {
            opt.innerHTML = ThisArray [c] [PropToUseAsText];
            opt.value = ThisArray [c] [PropToUseAsText];
        }
        else
        {
            opt.innerHTML = ThisArray [c];
            opt.value = ThisArray [c];
        }

        ThisSelect.append ($(opt));
    }
}

function addSelectOptionsFromArray (ThisSelect,ThisArray,userParams)
{
    function addOption (optionText)
    {
        var opt = document.createElement ('option');

        opt.innerHTML = optionText;
        opt.value = optionText;

        ThisSelect.append ($(opt));
    }

    var params = {};

    params.deleteExistingOptionsFirst = false;
    params.propertyIsNameObject = false;
    params.propertyToUse = undefined;
    params.firstOptionText = undefined;
    params.sortOrder = undefined;
    params.addAllNamesInNameObject = false;
    params.selectedValue = '';

    if (isDefined (userParams))
        copyProperties (userParams,params);

    if (params.deleteExistingOptionsFirst)
        ThisSelect.empty ();

    if (params.firstOptionText)
        addOption (params.firstOptionText);

    var flatArray = buildFlatArrayFromSourceArray (ThisArray,{propertyToUse: params.propertyToUse, sortOrder: params.sortOrder, propertyIsNameObject: params.propertyIsNameObject, addAllNamesInNameObject: params.addAllNamesInNameObject});

    for (var c = 0; c < flatArray.length; c++)
    {
        var optText = flatArray [c];

        addOption (optText);
    }

    if (params.selectedValue && params.selectedValue.length)
    {
        ThisSelect.val (params.selectedValue);
    }
}
