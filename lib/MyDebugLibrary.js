var dlError = 0;
var dlWarning = 1;
var dlInfo = 2;
var dlDefault = 3;
var dlHint = 4;
var dlVerbose = 5;
var dlTesting = 6;

var maxDebugLevelToDisplay = dlVerbose;
    
function debug (Message,debugLevel)
{
    if (!isDefined (debugLevel))
        debugLevel = dlDefault;
    
    if (debugLevel > maxDebugLevelToDisplay)
        return;

    switch (debugLevel)
    {
        case dlError:
            console.error ('Error: ' + Message);
            break;
        case dlWarning:
            console.warn ('Warning: ' + Message);
            break;
        case dlInfo:
            console.info (Message);
            break;
        case dlDefault: case dlHint: case dlVerbose: case dlTesting:
            console.log (Message);
            break;
    }
}

function getDebugStr (object,includeConstructorName,NameObjectProperty,keys)
{
    var result = '';
    var debugSeperator = ', ';

    function addSection (sectionStr)
    {
        result = StringAPlusStringB (result,sectionStr,debugSeperator);
    }

    if (includeConstructorName)
        addSection (object.constructor.name);

    if (NameObjectProperty)
    {
        var nameObject = object [NameObjectProperty];
        addSection (object [NameObjectProperty].Name);
    }

    for (var cKey = 0; cKey < keys.length; cKey++)
    {
        var key = keys [cKey];
        var keyStr = key + ': ' + object [key];

        addSection (keyStr);
    }

    return result;
}
