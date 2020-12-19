function Assert (Condition)
{
    if (Condition)
        return true;
    else
    {
        console.error ('ASSERT FAILED');
        return false;
    }
}

function displayNotification (Title,Body,Timeout,Icon)
{
    function ShowNotification ()
    {
        var notification = new Notification (Title,{body: Body, icon: Icon});
        setTimeout (function () {notification.close ();}, Timeout);
    }

    if (!("Notification" in window))
    {
        alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted")
    {
        ShowNotification ();
    }
    else if (Notification.permission !== 'denied')
    {
        Notification.requestPermission(function (permission) {
            if (permission === "granted")
            {
                ShowNotification ();
            }
        });
    }
}

function Log (LogThis)
{
    function SendLogStr (LogStr)
    {
        var LTA = $('#ConsoleLogtextarea');
        if (!LTA.length)
            LTA = $('#Logtextarea');

        if (LTA.length)
        {
            LTA.text (LTA.text () + LogStr + '\n');
            LTA.scrollTop (LTA [0].scrollHeight);
        }
    }

    console.log (LogThis);

    var LogStr = '';

    if (typeof LogThis === 'object')
        LogStr = JSON.stringify (LogThis);
    else if (typeof LogThis === 'string')
        LogStr = LogThis;
    else if (!isDefined (LogThis))
        LogStr = 'undefined';
    else
        LogStr = LogThis.toString ();

    SendLogStr (LogStr);
}

// Set the name of the hidden property and the change event for visibility

var DocumentHiddenProperty, OnDocumentVisiblityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  DocumentHiddenProperty = "hidden";
  OnDocumentVisiblityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  DocumentHiddenProperty = "mozHidden";
  OnDocumentVisiblityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  DocumentHiddenProperty = "msHidden";
  OnDocumentVisiblityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  DocumentHiddenProperty = "webkitHidden";
  OnDocumentVisiblityChange = "webkitvisibilitychange";
}

function sleep (ms)
{
    var endtime = Date.now () + ms;
    while (Date.now() < endtime)
    {

    }
}

shortMonthStrings = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getRandomFloat (min,max)
{
    return Math.random () * (max - min) + min;
}

function getRandomInteger (min,max)
{
    return Math.floor (Math.random () * (max - min + 1)) + min;
}

function getRandomBoolean ()
{
    return (Math.random () >= 0.5);
}

function mapValueInRange1ToValueInRange2 (value,range1Min,range1Max,range2Min,range2Max,clipValueToRange1)
{
    if (clipValueToRange1)
    {
        if (value < range1Min)
            value = range1Min
        else if (value > range1Max)
            value = range1Max
    }

    var value2 = ((value - range1Min) / (range1Max - range1Min)) * (range2Max - range2Min) + range2Min

    return value2
}
