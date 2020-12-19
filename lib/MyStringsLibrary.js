// ---------------------------------------------
// prototypes begin p.begin p.b pb
// ---------------------------------------------

function SynonymManagerObject ()
{
    this.Entries = [];
}

SynonymManagerObject.prototype.AddEntry = function (pSynonymArray)
{
    var SynonymArray = valueToArray (pSynonymArray);

    for (var cSynonym = 0; cSynonym < SynonymArray.length; cSynonym++)
        SynonymArray [cSynonym] = SynonymArray [cSynonym].toLowerCase ();

    this.Entries.push (SynonymArray);
}

SynonymManagerObject.prototype.ProcessSynonyms = function (thisString)
{
    var sourceStr = thisString;
    var resultStr = thisString;

    do
    {
        sourceStr = resultStr;

        for (var cEntry = 0; cEntry < this.Entries.length; cEntry++)
        {
            var SynonymArray = this.Entries [cEntry];

            for (var cSynonym = 1; cSynonym < SynonymArray.length; cSynonym++)
            {
                resultStr = sourceStr.replace (new RegExp ('\\b' + SynonymArray [cSynonym] + '\\b','gi'),SynonymArray [0]);
                if (resultStr != sourceStr)
                    break;
            }

            if (resultStr != sourceStr)
                break;
        }
    }
    while (resultStr != sourceStr);

    return resultStr;
}

function PreparedStringsObject (pString,synonymManager)
{
    this.Value = pString;
    this.PreparedStrings = GetPreparedStrings (this.Value,{SynonymManager: synonymManager});
}

if (!String.isEmpty)
{
    String.prototype.isEmpty = function ()
    {
        return (Trim (this).length == 0);
    }
}

if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
        .replace(urlPattern, '<a href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

if(!String.extractLinks) {
    String.prototype.extractLinks = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        var a1 = this.match(urlPattern);
        var a2 = this.match(pseudoUrlPattern);
        var a3 = this.match(emailAddressPattern);

        var Results = new Array ();
        if (a1) Results.push (a1);
        if (a2) Results.push (a2);
        if (a3) Results.push (a3);

        return Results;
    };
}

if(!String.splitQuoted) {
    String.prototype.splitQuoted = function() {
      var Results = this.match (/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      Results = Results || [];
      return Results;
    };
}

if(!String.splitAndTokenize) {
    String.prototype.splitAndTokenize = function(Seperator) {
        if (!Seperator)
            Seperator = ',';
        var Results = this.split (Seperator);
        Results = Results || [];
        for (c = 0; c < Results.length; c++)
            Results [c] = GetTokenizedVersionOf (Results [c]);
        return Results;
    };
}

// ---------------------------------------------
// prototypes end p.end p.e pe
// functions begin f.begin f.b fb
// ---------------------------------------------

var psExact = 0, psTrim = 1, psLowerCase = 2, psRemovePunctuation = 3, psRemoveSmallWords = 4, psConvertToSingular = 5, psRemoveNonAlphaNumeric = 6, psRemoveSpaces = 7, psMax = 7;
var psAllKeepSpaces = 100;
var psAllRemoveSpaces = 102, psUser = 102, psAll = 102;
var psBasic = 101, psBasicMatch = 101, psTokenized = 101;

var MaxPrepareStringForMatchingStage = 6;
var DefaultPrepareStringForMatchingStage = 3;

var StringMatchExact = 0;
var StringMatchTrim = 1;
var StringMatchLowerCase = 2;
var StringMatchLowerCaseAndTokenized = 3;
var StringMatchRemovePlurals = 4;
var StringMatchRemoveSmallWords = 5;
var StringMatchRemoveSpaces = 6;
var StringMatchUserMode = MaxPrepareStringForMatchingStage;

var csWholeString = 101, csContainsSubString = 102, csStartsWithSubString = 103;

function trim (Str)
{
    return Str.replace (/^\s+|\s+$/g, "");
}

function basicStr (str)
{
	return trim (str.toLowerCase ());
}

function Trim (Str)
{
    return Str.replace (/^\s+|\s+$/g, "");
}

function AreStringsBasicallyEqual (Str1,Str2)
{
    if (Str1 == Str2)
        return true;

    var s1 = Str1.toLowerCase ();
    var s2 = Str2.toLowerCase ();
    if (s1 == s2)
        return true;

    s1 = Trim (s1);
    s2 = Trim (s2);
    if (s1 == s2)
        return true;

    s1 = GetTokenizedVersionOf (s1,false,false);
    s2 = GetTokenizedVersionOf (s2,false,false);
    if (s1.length == 0 && s2.length == 0)
        return false;
    if (s1 == s2)
        return true;

    var sb1 = GetTokenizedVersionOf (s1,true,false);
    var sb2 = GetTokenizedVersionOf (s2,true,false);
    if (sb1.length == 0 && sb2.length == 0)
        return false;
    if (sb1 == sb2)
        return true;

    if (sb1 [0] == sb2 [0])
    {
        s1 = ConvertAllWordsInStringToSingularForm (s1);
        s2 = ConvertAllWordsInStringToSingularForm (s2);
        if (s1 == s2)
            return true;

        s1 = GetTokenizedVersionOf (s1,true,false);
        s2 = GetTokenizedVersionOf (s2,true,false);
        if (s1 == s2)
            return true;
    }
    return false;
}

function GetTokenizedVersionOf (Str,StripSpaces,ConvertToSingularForm)
{
    if (StripSpaces)
        result = Str.replace (/[^a-zA-Z0-9\_\-]/g,'');
    else
        result = Str.replace (/[^a-zA-Z0-9\_\- ]/g,'');
    result = Trim (result);
    result = result.toLowerCase ();
    if (ConvertToSingularForm)
        result = ConvertAllWordsInStringToSingularForm (result);
    return result;
}

function PrepareStringForMatching (SourceStr,StartStage,EndStage)
{
    var result = SourceStr;

    if (!isDefined (StartStage))
    {
        StartStage = 1;
        EndStage = DefaultPrepareStringForMatchingStage;
    }

    if (!isDefined (EndStage))
    {
        EndStage = StartStage;
        StartStage = 1;
    }

    for (var cStage = StartStage; cStage <= EndStage; cStage ++)
    {
        switch (cStage)
        {
            case 1:
                result = Trim (result);
                break;
            case 2:
                result = result.toLowerCase ();
                break;
            case 3:
                result = Trim (result.replace (/[^a-zA-Z0-9 ]/g,''));
                break;
            case 4:
                result = ConvertAllWordsInStringToSingularForm (result);
                break;
            case 5:
                result = Trim (RemoveSmallWords (result));
                break;
            case 6:
                result = Trim (result.replace (/[ ]/g,''));
                break;
        }
    }
    return result;
}

function IndexOfStringInArray (SearchStr,SearchArray,PrepareStringsUpToStage)
{
    var result = -1;
    var tmpStr = SearchStr;
    var tmpArray = SearchArray.slice (0);

    var cStageMax = getOptionalValue (PrepareStringsUpToStage,MaxPrepareStringForMatchingStage);
    for (var cStage = 0; cStage <= cStageMax; cStage ++)
    {
        if (cStage > 0)
        {
            tmpStr = PrepareStringForMatching (tmpStr,cStage,cStage);
            for (var cStr = 0; cStr < tmpArray.length; cStr ++)
                tmpArray [cStr] = PrepareStringForMatching (tmpArray [cStr],cStage,cStage);
        }

        result = tmpArray.indexOf (tmpStr);
        if (result > -1)
            return result;
    }

    return -1;
}

function DoesStringContainAnyOf (ThisStr,TheseSubstrings,TokenizeStrings,WholeWordsOnly)
{
    if (isEmpty (TheseSubstrings))
        return false;

    var StringToSearchIn = Trim (ThisStr);
    if (TokenizeStrings)
        StringToSearchIn = GetTokenizedVersionOf (StringToSearchIn,false,true);
    for (var c = 0; c < TheseSubstrings.length; c++)
    {
        var StringToSearchFor = TheseSubstrings [c];
        if (TokenizeStrings)
            StringToSearchFor = GetTokenizedVersionOf (StringToSearchFor,false,true);
        if (WholeWordsOnly)
            var tmpParsedArray = StringToSearchIn.match (new RegExp ('\\b' + StringToSearchFor + '\\b','i'));
        else
            var tmpParsedArray = StringToSearchIn.match (new RegExp (StringToSearchFor,'i'));
        if (tmpParsedArray != null && tmpParsedArray.length)
            return true;
    }
    return false;
}

function DoesStringContainAllOf (ThisStr,TheseSubstrings,TokenizeStrings,WholeWordsOnly)
{
    if (isEmpty (TheseSubstrings))
        return false;

    var StringToSearchIn = Trim (ThisStr);
    if (TokenizeStrings)
        StringToSearchIn = GetTokenizedVersionOf (StringToSearchIn,false,true);

    for (var c = 0; c < TheseSubstrings.length; c++)
    {
        var StringToSearchFor = TheseSubstrings [c];
        if (TokenizeStrings)
            StringToSearchFor = GetTokenizedVersionOf (StringToSearchFor,false,true);
        if (WholeWordsOnly)
            var tmpParsedArray = StringToSearchIn.match (new RegExp ('\\b' + StringToSearchFor + '\\b','i'));
        else
            var tmpParsedArray = StringToSearchIn.match (new RegExp (StringToSearchFor,'i'));
        if (!(tmpParsedArray != null && tmpParsedArray.length))
            return false;
    }
    return true;
}

function StringAPlusStringB (StringA,StringB,SeperatorIfStringBNotEmpty)
{
    // Seperator is only added if StringB != '' AND StringA != ''
    if (StringB == '')
        return StringA;

    if (StringA == '')
        return StringB;

    return StringA + SeperatorIfStringBNotEmpty + StringB;
}

function RemoveTheseWords (SourceStr,RemoveWordsInThisArray,pOptions)
{
    function removeWord (word)
    {
        result = result.replace (new RegExp ('\\b' + word + '\\b',flags),'')
    }

    var options = {}
    options.isStringAlreadyLowerCase = false
    if (isDefined (pOptions))
        copyCommonProperties (pOptions,options)

    var flags = 'g'
    if (!options.isStringAlreadyLowerCase)
        flags += 'i'

    var result = SourceStr;
    for (var c = 0; c < RemoveWordsInThisArray.length; c++)
        removeWord (RemoveWordsInThisArray [c])

    result = trim (result.replace (/  +/g,' '));

    return result;
}

function RemoveSmallWords (SourceStr,isStringAlreadyLowerCase)
{
    return RemoveTheseWords (SourceStr,['the','and','in','of','to','a','an','is','are','it','for','with'],{isStringAlreadyLowerCase: isStringAlreadyLowerCase})
}

function ConvertStringToSingularIfNecessary (ThisStr,NumberOfThisStr)
{
    if (NumberOfThisStr == 1)
        return ConvertAllWordsInStringToSingularForm (ThisStr);
    else
        return ThisStr;
}

function NNouns (N,NounPlural)
{
    return N + ' ' + ConvertStringToSingularIfNecessary (NounPlural,N);
}

function ConvertWordToSingularForm (ThisWord)
{
    var result = ThisWord;

    result = result.replace (new RegExp ('ies\\b',''),'y');
    result = result.replace (new RegExp ('sses\\b',''),'ss' + '\x00');
    result = result.replace (new RegExp ("'s\\b",''),'');
    result = result.replace (new RegExp ('s(?!\\x00)\\b',''),'');
    result = result.replace (new RegExp ('ss(?=\\x00)',''),'ss');

    return result;
}

function replaceSubstringAtIndex (sourceStr,index,replacement)
{
    return sourceStr.substr (0,index) + replacement + sourceStr.substr (index + replacement.length);
}

function replaceCharAtIndex (sourceStr,index,replacement)
{
    return replaceSubstringAtIndex (sourceStr,index,replacement)
}

function setCharAtIndex (sourceStr,index,replacement)
{
    return replaceSubstringAtIndex (sourceStr,index,replacement)
}

function ConvertAllWordsInStringToSingularForm (Str)
{
    var result = Str;

    result = result.replace (new RegExp ('ies\\b','g'),'y');
    result = result.replace (new RegExp ('sses\\b','g'),'ss' + '\x00');
    result = result.replace (new RegExp ("'s\\b",'g'),'');
    result = result.replace (new RegExp ('s(?!\\x00)\\b','g'),'');
    result = result.replace (new RegExp ('ss(?=\\x00)','g'),'ss');

    return result;
}

function ConvertSecondsToReadableStr (seconds,DisplaySecondsIfTotalSecondsUnder,userWantD)
{
    var result = '';

    var minutes = Math.floor (seconds / 60);
    var hv = Math.floor (minutes / 60);
    var mv = minutes % 60;
    var sv = Math.floor (seconds) % 60;

    var wantD = getOptionalValue (userWantD,true);

    var wantm = true;
    if (hv > 0)
        {
        if (hv > 24 && wantD)
        {
            var dv = Math.floor (hv / 24);
            result += dv + 'd ';
            hv = hv % 24;
            wantm = false;
        }
        if (hv > 0)
            result += hv + 'h ';
    }
    if (wantm && mv > 0)
        result += mv + 'm ';
    if (seconds < (DisplaySecondsIfTotalSecondsUnder || 60))
    {
        if (sv > 0)
            result += sv + 's';
    }
    return (Trim (result));
}

function DateToTimeStr (ThisDate,DoWeWant24HourFormat,DoWeWantSeconds)

{
    var hs,ms,ss;
    var result = '';

    var hrs = ThisDate.getHours ();
    var mins = ThisDate.getMinutes ();
    var secs = ThisDate.getSeconds ();
    if (DoWeWant24HourFormat)
    {
        hs = hrs.toString ();
        if (hrs < 10)
          hs = '0' + hs;
    }
    else
    {
        if (hrs > 12)
            hrs -= 12;
        if (hrs == 0)
            hrs = 12;
        hs = hrs.toString ();
    }
    ms = mins.toString ();
    if (mins < 10)
      ms = '0' + ms;

    result = hs + ':' + ms;
    if (DoWeWantSeconds)
    {
        ss = secs.toString ();
        if (secs < 10)
          ss = '0' + ss;
        result += ':' + ss;
    }
    return result;
}

function GetOrdinalOf (n)
{
    if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
        var s=["th","st","nd","rd"],
        v=n%100;
        return n+(s[(v-20)%10]||s[v]||s[0]);
    }
    return n;
}

function DoesStringContainTag (SearchStr,Tag)
{
    if (empty (SearchStr) || empty (Tag))
        return false;

    var TokenizedTag = GetTokenizedVersionOf (Tag);
    var SearchStrTagsArray = SearchStr.toLowerCase ().split (',');

    for (var cTag = 0; cTag < SearchStrTagsArray.length; cTag ++)
    {
        var tmpTag = SearchStrTagsArray [cTag];

        if (GetTokenizedVersionOf (tmpTag) == TokenizedTag)
            return true;
    }

    return false;
}

function GetPreparedStrings (pString,userOptions)
{
    var Options = {};

    Options.SynonymManager = null;
    Options.MaxCompareLevel = psMax;

    if (userOptions)
        copyProperties (userOptions,Options);

    var preparedStrings = [];
    preparedStrings.push (pString);

    if (Options.MaxCompareLevel == 0)
        return preparedStrings;

    var tmpPreparedString = pString;
    for (var c = 1; c <= Options.MaxCompareLevel; c++)
    {
        tmpPreparedString = PrepareString (tmpPreparedString,c,Options);
        preparedStrings.push (tmpPreparedString);
    }

    return preparedStrings;
}

function PrepareString (pString,pLevelOrLevels,userOptions)
{
    if (isNotDefined (pString) || isEmpty (pString))
        return '';

    if (isNotDefined (pLevelOrLevels) || pLevelOrLevels == 0)
        return pString;

    var Options = {};

    Options.SynonymManager = null;
    Options.MaxCompareLevel = psMax;

    if (userOptions)
        copyProperties (userOptions,Options);

    var result = '';

    if (typeof pLevelOrLevels == 'number')
    {
        result = pString;
        switch (pLevelOrLevels)
        {
            case psBasic:
                result = PrepareString (result,[psTrim,psLowerCase]);
                break;
            case psAllKeepSpaces:
                result = PrepareString (result,[psTrim,psLowerCase,psRemovePunctuation,psConvertToSingular,psRemoveSmallWords,psTrim]);
                break;
            case psAllRemoveSpaces:
                result = PrepareString (result,[psTrim,psLowerCase,psRemovePunctuation,psConvertToSingular,psRemoveSmallWords,psRemoveSpaces]);
                break;
            case psExact:
                result = result;
                break;
            case psTrim:
                result = Trim (result);
                break;
            case psLowerCase:
                result = result.toLowerCase ();
                break;
            case psRemovePunctuation:
                result = result.replace (/[^a-zA-Z0-9 ]/g,'');
                break;
            case psRemoveNonAlphaNumeric:
                result = result.replace (/[^a-zA-Z0-9]/g,'');
                break;
            case psRemoveSpaces:
                result = result.replace (/ /g,'');
                break;
            case psConvertToSingular:
                result = result.replace (new RegExp ('ies\\b','g'),'y');
                result = result.replace (new RegExp ('sses\\b','g'),'ss' + '\x00');
                result = result.replace (new RegExp ("'s\\b",'g'),'');
                result = result.replace (new RegExp ('s(?!\\x00)\\b','g'),'');
                result = result.replace (new RegExp ('ss(?=\\x00)','g'),'ss');
                break;
            case psRemoveSmallWords:
                result = result.replace (/\bthe\b/gi,'');
                result = result.replace (/\band\b/gi,'');
                result = result.replace (/\bin\b/gi,'');
                result = result.replace (/\bof\b/gi,'');
                result = result.replace (/\bto\b/gi,'');
                result = result.replace (/\ba\b/gi,'');
                result = result.replace (/\ban\b/gi,'');
                result = result.replace (/\bis\b/gi,'');
                result = result.replace (/\bare\b/gi,'');
                result = result.replace (/\bit\b/gi,'');

                result = Trim (result.replace (/  +/g,' '));
                break;
        }

    }
    else
    {
        result = pString;
        for (var c = 0; c < pLevelOrLevels.length; c++)
            result = PrepareString (result,pLevelOrLevels [c]);
    }

    if (Options.SynonymManager)
        result = Options.SynonymManager.ProcessSynonyms (result);

    return result;
}

function StringToLocation (pString)
{
    var result = document.createElement ('a');
    result.href = pString;
    return result;
}

function numberToStringWithLeadingZeros (num,size)
{
    var s = num + '';

    while (s.length < size)
        s = '0' + s;

    return s;
}

function numberToStringWithFixedDecimalPlaces (val,decimalPlaces)
{
    var multiplier = Math.pow (10, decimalPlaces);
    return (Math.round (val * multiplier) / multiplier).toFixed (decimalPlaces);
}

function fractionOrDecimalToDecimal (fraction)
// accepts '1/2', '1-1/2', '1.5'
{
    var result,wholeNum=0, frac, deci=0;
    if(fraction.search('/') >=0){
        if(fraction.search('-') >=0){
            var wholeNum = fraction.split('-');
            frac = wholeNum[1];
            wholeNum = parseInt(wholeNum,10);
        }else{
            frac = fraction;
        }
        if(fraction.search('/') >=0){
            frac =  frac.split('/');
            deci = parseInt(frac[0], 10) / parseInt(frac[1], 10);
        }
        result = wholeNum+deci;
    }else{
        result = fraction
    }
    return result;
}

function generateRandomString (length,fromCharacters)
{
    var result = '';
    var possible = fromCharacters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i ++)
        result += possible.charAt (Math.floor (Math.random () * possible.length));

    return result;
}

function isAlpha(charVal)
{
    if( charVal.toUpperCase() != charVal.toLowerCase() )
       return true;
    else
       return false;
}

function isCharUpperCase (char)
{
    return (char == char.toUpperCase ())
}

function isCharLowerCase (char)
{
    return (char == char.toLowerCase ())
}

function isTokenChar (char)
{
    return /[a-zA-Z0-9\_\-]/.test (char)
}

function isTokenString (string)
{
    for (var c = 0; c < string.length; c ++)
    {
        if (!isTokenChar (string [c]))
            return false
    }
    return true
}

function isStringCamelCase (string,capitalizedFirstWord)
{
    if (string.length == 0) return false
    if (!isTokenString (string)) return false
    if (capitalizedFirstWord && isCharLowerCase (string [0])) return false
    if (!capitalizedFirstWord && isCharUpperCase (string [0])) return false

    return true
}

function camelCaseToSpaces (camelCaseStr,capitalizeFirstWord)
{
    if (!isStringCamelCase (camelCaseStr,capitalizeFirstWord)) return camelCaseStr

    var result = ''
    if (capitalizeFirstWord)
        result += camelCaseStr [0].toUpperCase ()
    else
        result += camelCaseStr [0].toLowerCase ()

    for (var p = 1; p < camelCaseStr.length; p ++)
    {
        if (isCharUpperCase (camelCaseStr [p]) && (p == camelCaseStr.length - 1 || isCharLowerCase (camelCaseStr [p + 1])))
        {
            if (result [result.length - 1] != ' ')
                result += ' '
            result += camelCaseStr [p].toLowerCase ()
        }
        else if (isCharLowerCase (camelCaseStr [p]) && (p < camelCaseStr.length - 1 && isCharUpperCase (camelCaseStr [p + 1])))
        {
            result += camelCaseStr [p]
            result += ' '
        }
        else
            result += camelCaseStr [p]
    }

    return result
}

function stringToCamelCase (string,capitalizeFirstWord)
{
    var preparedString = trim (string)
    preparedString = preparedString.replace (/  /g,' ')
    if (preparedString.length == 0) return ''

    var words = preparedString.split (' ')

    var result = ''
    for (var c = 0; c < words.length; c ++)
    {
        var word = words [c]
        var newWord = word
        if (word != word.toUpperCase ())
        {
            if (c == 0)
            {
                if (capitalizeFirstWord)
                    newWord = replaceCharAtIndex (word,0,word [0].toUpperCase ())
                else
                    newWord = replaceCharAtIndex (word,0,word [0].toLowerCase ())
            }
            else
                newWord = replaceCharAtIndex (word,0,word [0].toUpperCase ())
        }
        result += newWord
    }

    return result
}

function doesStringMatchRegExp (testString,regExpOrRegExpString)
{
    var re

    if (typeof regExpOrRegExpString === 'string')
        re = new RegExp (regExpOrRegExpString)
    else
        re = regExpOrRegExpString

    return re.test (testString)
}
