Storage.prototype.GetListLengthKey = function (pListKey)
{
    return pListKey + '.length';
}

Storage.prototype.GetListItemKey = function (pListKey,pIndex)
{
    return pListKey + '.item.' + pIndex.toString ();
}

Storage.prototype.GetListLength = function (pListKey)
{
    var LengthKey = this.GetListLengthKey (pListKey);
    var ItemStr = this.getItem (LengthKey);
    if (ItemStr === null)
        return 0;
    else
        return parseInt (ItemStr);
}

Storage.prototype.SetListLength = function (pListKey,pLength)
{
    var LengthKey = this.GetListLengthKey (pListKey);
    this.setItem (LengthKey,pLength.toString ());
}

Storage.prototype.GetListItem = function (pListKey,pIndex)
{
    var ItemKey = this.GetListItemKey (pListKey,pIndex);

    return this.getItem (ItemKey);
}

Storage.prototype.SetListItem = function (pListKey,pIndex,pItemString)
{
    var ItemKey = this.GetListItemKey (pListKey,pIndex);

    this.setItem (ItemKey,pItemString);
}

Storage.prototype.AddListItem = function (pListKey,pItemString)
{
    var ListLength = this.GetListLength (pListKey);

    this.SetListLength (pListKey,ListLength + 1);

    this.SetListItem (pListKey,ListLength,pItemString);

    return ListLength;
}

Storage.prototype.RemoveListItem = function (pListKey,pIndex)
{
    var ItemKey = this.GetListItemKey (pListKey,pIndex);

    this.removeItem (ItemKey);
}

Storage.prototype.ClearList = function (pListKey)
{
    var ListLength = this.GetListLength (pListKey);

    for (var cItem = 0; cItem < ListLength; cItem ++)
        this.RemoveListItem (pListKey,cItem);

    this.SetListLength (pListKey,0);
}

function loadArray (localStorageKey,ObjectFunction,ReplacerFunction)
{
    dateTimeReviver = function (key, value) {
        var a;
        if (typeof value === 'string') {
            a = /\/Date\((\d*)\)\//.exec(value);
            if (a) {
                return new Date(+a[1]);
            }
        }
        return value;
    }

    var LoadedArray = [];

    var tmpstr = localStorage.getItem (localStorageKey) || '';
    if (tmpstr != '' && tmpstr [0] != '"')
    {
        try {
            var tmpA = JSON.parse (tmpstr,dateTimeReviver);
        }
        catch(e) {
            var tmpA = [];
        }

        LoadedArray = tmpA.slice (0);
    }

    if (isDefined (ObjectFunction) || isDefined (ReplacerFunction))
    {
        for (cItem = 0; cItem < LoadedArray.length; cItem++)
        {
            var RawObject = LoadedArray [cItem];

            if (isDefined (ObjectFunction))
                var NewObject = new ObjectFunction ();
            else
                var NewObject = RawObject;

            if (isDefined (ReplacerFunction))
                NewObject = ReplacerFunction (NewObject,RawObject);
            else
            {
                for (var attr in RawObject)
                {
                    if (RawObject.hasOwnProperty (attr))
                        NewObject [attr] = RawObject [attr];
                }
            }

            LoadedArray [cItem] = NewObject;
        }
    }

    return LoadedArray;
}

function saveArray (ArrayToSave,LocalStorageKey,Replacer)
{
    if (Replacer)
        var tmpstr = JSON.stringify (ArrayToSave,Replacer);
    else
        var tmpstr = JSON.stringify (ArrayToSave);
    localStorage.setItem (LocalStorageKey,tmpstr);
}

function isLocalStorageEnabled()
{
    var tmprn = Math.floor((Math.random()*1000000)+1);
    try {
        localStorage.setItem ('LocalStorageTest',tmprn);
        tmpin = localStorage ['LocalStorageTest'] || -1;
        if (tmpin == -1 || tmpin != tmprn)
            return false;
          else
          {
        localStorage.removeItem ('LocalStorageTest');
        return true;
        }
    } catch (e) {
        return false;
    }
    // shouldn't get to here but just in case
    return false;
}

function incLocalStorageCounter (key,incValue)
{
    var workingIncValue;
    if (isDefined (incValue))
        workingIncValue = incValue;
    else
        workingIncValue = 1;

    var value = localStorage.getItem (key) || '0';
    var counterValue = parseFloat (value);

    counterValue += workingIncValue;

    localStorage.setItem (key,counterValue.toString ());

    return counterValue;
}

function loadTextFileFromDisk (fileInputId,onloadCallback)
{
    function processFile (file)
    {
        var fileReader = new FileReader ();

        fileReader.onload = function (fileLoadedEvent) 
        {
            var fileText = fileLoadedEvent.target.result;

            if (onloadCallback)
                onloadCallback (fileInputId,file,fileText);
        };
        
        fileReader.readAsText (file,"UTF-8");
    }

    var fileInput = document.getElementById (fileInputId);

    if (fileInput.multiple == true)
    {
        for (var cFile = 0; cFile < fileInput.files.length; cFile ++)
            processFile (fileInput.files [cFile]);
    }
    else
        processFile (fileInput.files [0]);

}
