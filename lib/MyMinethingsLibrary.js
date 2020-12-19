MTServerTimeAtPageLoad = null;
MTServerTimeNow = null;
LocalTimeAtPageLoad = null;
LocalTimeNow = null;
MTServerTimeLocalTimeDifferentialInSeconds = 0;
SecondsSincePageLoad = 0;

function UpdateMTPageTimingDetails ()
{
    if (LocalTimeAtPageLoad == null)
    {
        LocalTimeAtPageLoad = new Date ();
        LocalTimeNow = new Date ();
        SecondsSincePageLoad = 0;
    }
    else
    {
        LocalTimeNow = new Date ();
        SecondsSincePageLoad = Math.ceil ((LocalTimeNow.getTime() - LocalTimeAtPageLoad.getTime ()) / 1000);
    }
    
    if (MTServerTimeAtPageLoad == null)
    {
        MTServerTimeAtPageLoad = ConvertMTDateTimeStrToDateTime ($('#left').find ('p').eq(0).text ());
        MTServerTimeNow = new Date ();
        MTServerTimeNow.setTime (MTServerTimeAtPageLoad.getTime ());
        SecondsSincePageLoad = 0;
        MTServerTimeLocalTimeDifferentialInSeconds = Math.ceil ((MTServerTimeAtPageLoad.getTime () - LocalTimeAtPageLoad.getTime ()) / 1000);
    }
    else
    {
        MTServerTimeNow.setTime (MTServerTimeAtPageLoad.getTime () + SecondsSincePageLoad * 1000);
    }
}

function SecondsSinceMTDateTime (MTDateTimeStr)
{
    UpdateMTPageTimingDetails ();
    // year isn't included in MTDateTimeStr so we have to account for 01-01 being after 12-31
    
    var MTDateTime = ConvertMTDateTimeStrToDateTime (MTDateTimeStr);
    if (MTDateTime.getTime () > MTServerTimeNow.getTime ())
        MTDateTime.setFullYear (parseInt (MTServerTimeNow.getFullYear ()) - 1);
    return Math.ceil ((MTServerTimeNow.getTime() - MTDateTime.getTime ()) / 1000);
}

function ConvertMTDateTimeStrToDateTime (MTDateTimeStr)
{
    var DateTimeStr = Trim (MTDateTimeStr);
    
    // 14/01/09 12:00
    var tmpParsedArray = DateTimeStr.match ('(.*?)\\/(.*?)\\/(.*?) (.*?):(.*?)$');
    if (tmpParsedArray && tmpParsedArray.length == 6)
        DateTimeStr = tmpParsedArray [2] + '/' + tmpParsedArray [3] + '/' + tmpParsedArray [1] + ' ' + tmpParsedArray [4] + ':' + tmpParsedArray [5];
    else
    {
        // 14/01/09
        var tmpParsedArray = DateTimeStr.match ('(.*?)\\/(.*?)\\/(.*?)$');
        if (tmpParsedArray && tmpParsedArray.length == 4)
            DateTimeStr = tmpParsedArray [2] + '/' + tmpParsedArray [3] + '/' + tmpParsedArray [1] + ' 00:00';
        else
        {
            // 01-09 12:00
            var tmpParsedArray = DateTimeStr.match ('(.*?)\\-(.*?) (.*?):(.*?)$');
            if (tmpParsedArray && tmpParsedArray.length == 5)
                {
                var Now = new Date ();
                DateTimeStr = tmpParsedArray [1] + '/' + tmpParsedArray [2] + '/' + Now.getFullYear () + ' ' + tmpParsedArray [3] + ':' + tmpParsedArray [4];
            }
        }
    }
        
    var DateTime = new Date (DateTimeStr);
    return DateTime;
}

function ConvertDateTimeToMTDateTimeStr (DateTime,Options)
{
    function Pad (Number)
    {
        var result = Number.toString ();
        if (result.length < 2)
            result = '0' + result;
        return result;
    }
    
    if (!isDefined (Options))
        Options = {};

    var TimeDateStr = '';

    if (getOptionalValue (Options.IncludeDate),true)
    {
        TimeDateStr = StringAPlusStringB (TimeDateStr,Pad (DateTime.getMonth () + 1) + '-' + Pad (DateTime.getDate ()),'');
        if (getOptionalValue (Options.IncludeYear),true)
        TimeDateStr = StringAPlusStringB (TimeDateStr,DateTime.getFullYear ().toString ().substring (2),'-');
    }

    if (getOptionalValue (Options.IncludeTime),true)
    {
        TimeDateStr = StringAPlusStringB (TimeDateStr,Pad (DateTime.getHours ()) + ':' + Pad (DateTime.getMinutes ()),' ');
    }
    
    return TimeDateStr;
}
