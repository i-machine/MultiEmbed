// ==UserScript==
// @name       MyMinethingsGeneralLibrary
// @description  
// @version    1.0

// ==/UserScript==

if(!String.MachinaSplit) {
    String.prototype.MachinaSplit = function(Options)
    {
        if (!isDefined (Options))
            Options = {};
        
        var StrToSearch = this;
        
        if (isDefined (Options.Delimiters))
        {
            var tmpDelimiters = Options.Delimiters.split (',');
            for (var c = 0; c < tmpDelimiters.length; c ++)
                StrToSearch = StrToSearch.replace (new RegExp (tmpDelimiters [c],'gi'),',');
        }

        var Results = StrToSearch.split (',');
        Results = Results || [];
        
        for (cResult = 0; cResult < Results.length; cResult ++)
        {
            var ResultStr = Results [cResult];
            if (getOptionalValue (Options.Trim,true))
                ResultStr = Trim (ResultStr);
            if (getOptionalValue (Options.Tokenize,false))
                ResultStr = GetTokenizedVersionOf (ResultStr);
            Results [cResult] = ResultStr;
        }
        return Results;
    };
}

function ExtractQuantityAndNoun (QuantityAndNounStr,Options)
{
    if (!isDefined (Options))
        Options = {};
        
    var MultiplierChars = getOptionalValue (Options.MultiplierChars,'x,:,=, ').split (',');
    
    for (var c = 0; c < MultiplierChars.length; c ++)
    {
        var tmpParsedArray = QuantityAndNounStr.match ('\\s*(.*?)\\s*' + MultiplierChars [c] + '\\s*(.*?)\\s*$');
        if (tmpParsedArray && tmpParsedArray.length == 3)
        {
            if (!isNaN (tmpParsedArray [1]))
                return [parseFloat (tmpParsedArray [1]),tmpParsedArray [2]];
            if (!isNaN (tmpParsedArray [2]))
                return [parseFloat (tmpParsedArray [2]),tmpParsedArray [1]];
        }
    }
    
    return [1,QuantityAndNounStr];
}

function ExtractNamedObjectsFromString (ObjectsStr,SourceArray,PropertyToMatchOn)
{
    var Results = [];
    
    var StrArray = ObjectsStr.MachinaSplit ({Delimiters: '\\;,\\+,\\&'});

    for (var cStr = 0; cStr < StrArray.length; cStr ++)
    {
        var tmpQAN = ExtractQuantityAndNoun (StrArray [cStr]);
        var ObjectName = GetTokenizedVersionOf (tmpQAN [1],true,true);
        var tmpObject = findObjectInArray (SourceArray,PropertyToMatchOn,ObjectName);
        if (tmpObject)
        {
            for (var c = 1; c <= tmpQAN [0]; c ++)
                Results.push (tmpObject);
        }
    }
    
    return Results;
}
