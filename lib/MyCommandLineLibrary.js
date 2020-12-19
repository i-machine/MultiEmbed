var ScriptCommands = [];
var ScriptCommandTokenizedCodesSortedByLength = [];
var ScriptCommandIgnoreTheseWordsInCommands = [];

var MaxScriptCommandTokenizedCodeLength = 500;

function InitialisedScriptCommandObject (Name,Codes)
{
    this.Name = Name;
    this.Codes = Codes.split (',');
    this.TokenizedCodes = Codes.split (',');

    for (var c = 0; c < this.TokenizedCodes.length; c++)
        this.TokenizedCodes [c] = PrepareScriptCommandStrForMatching (this.TokenizedCodes [c]);

    var TokenizedName = PrepareScriptCommandStrForMatching (this.Name);
    if (this.TokenizedCodes.indexOf (TokenizedName) == -1)
    {
        this.Codes.push (this.Name);
        this.TokenizedCodes.push (TokenizedName);
    }
}

function InitialisedScriptCommandInstanceObject ()
{
    this.UserID = '';
    this.Command = null;
    this.CommandCodeInvoked = '';
    this.Parameters = '';
}

function PrepareScriptCommandStrForMatching (ThisStr)
{
    var result = PrepareStringForMatching (ThisStr,1,5);
    var result = RemoveTheseWords (result,ScriptCommandIgnoreTheseWordsInCommands);
    var result = PrepareStringForMatching (result,6);

//    console.log (ThisStr + ' = ' + result);

    return result;
}

function FindScriptCommandFromCode (ThisCode)
{
    if (Trim (ThisCode) == '')
        return null;

    for (var c = 0; c < ScriptCommands.length; c ++)
    {
        var tmpCommand = ScriptCommands [c];
        if (tmpCommand.Codes.indexOf (ThisCode) > -1)
            return tmpCommand;
        if (tmpCommand.TokenizedCodes.indexOf (ThisCode) > -1)
            return tmpCommand;
    }
    return null;
}

function AddScriptCommand (Name,Codes)
{
    if (Trim (Name) == '')
        return null;

    var result = new InitialisedScriptCommandObject (Name,Codes);
    ScriptCommands.push (result);

    for (var c = 0; c < result.TokenizedCodes.length; c++)
    {
        var TokenizedCode = result.TokenizedCodes [c];
        ScriptCommandTokenizedCodesSortedByLength [TokenizedCode.length].push (TokenizedCode);
    }

    console.log ('Added script command: ' + Name);
    return result;
}

function ScanStringForScriptCommand (ScanThisString)
{
    var InputStr = Trim (ScanThisString);
    if (InputStr.length == 0 || '/#$!>@'.indexOf (InputStr [0]) == -1)
        return [false,null];

    InputStr = Trim (InputStr.slice (1));
    if (InputStr.length == 0)
        return [false,null];

    var MatchFoundAtLength = 0;

    var InputStrLength = InputStr.length;
    var SearchStrMatch = '';
    var TokenizedSearchStrMatch = '';

    for (var cInputStrLength = InputStrLength; cInputStrLength > 0; cInputStrLength--)
    {
        var SearchStr = InputStr.slice (0,cInputStrLength);
        var TokenizedSearchStr = PrepareScriptCommandStrForMatching (SearchStr);

        if (ScriptCommandTokenizedCodesSortedByLength [TokenizedSearchStr.length].indexOf (TokenizedSearchStr) > -1)
        {
            MatchFoundAtLength = cInputStrLength;
            SearchStrMatch = SearchStr;
            TokenizedSearchStrMatch = TokenizedSearchStr;
        }
        else
        {
            if (MatchFoundAtLength > 0 && (cInputStrLength == InputStrLength || /[a-zA-Z0-9]/.test (InputStr [cInputStrLength]) == false))
                break;
        }
    }

    if (MatchFoundAtLength > 0)
    {
        var ScriptCommandInstance = new InitialisedScriptCommandInstanceObject ();
        ScriptCommandInstance.Command = FindScriptCommandFromCode (TokenizedSearchStrMatch);
        if (ScriptCommandInstance.Command == null)
            ScriptCommandInstance.Command = FindScriptCommandFromCode ('Help');
        ScriptCommandInstance.CommandCodeInvoked = SearchStrMatch;
        ScriptCommandInstance.Parameters = Trim (InputStr.slice (MatchFoundAtLength));
        return [true,ScriptCommandInstance];
    }
    else
        return [true,null];
}

function PerformScriptCommandAsUser (UserID,CommandInstance)
{
    CommandInstance.UserID = UserID;
    PerformScriptCommand (CommandInstance);
}

function InitialiseMyCommandLineLibrary ()
{
//    ScriptCommandIgnoreTheseWordsInCommands = 'show,list,display,type,print,printout,output,get,fetch,return,find,query,data,results,info,information,details,text,link,bring up,explain,advice,advise,help,guide,instructions,command,run,do,please,bot,machina,computer,me,us,him,her,our,their,my,them,the,and,in,of,to,a,an,all,any,every,out,some,your,you,can,will,what,which,how,why,who,when,these,this,that,work,working,function,operate,behave'.split (',');
    ScriptCommandIgnoreTheseWordsInCommands = 'show,list,display,type,print,printout,output,get,fetch,return,find,query,data,results,info,information,details,text,link,bring up,explain,advice,advise,describe,what,which,who,when,why,instructions,run,do,please,bot,machina,computer,all,any,every,out,for,this,that'.split (',');

    for (var c = 0; c < MaxScriptCommandTokenizedCodeLength; c++)
        ScriptCommandTokenizedCodesSortedByLength.push ([]);
}

InitialiseMyCommandLineLibrary ();
