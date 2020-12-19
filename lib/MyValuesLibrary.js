function isDefined (value)
{
    return !isNotDefined (value);
}

function isNotDefined (value)
{
    return (value === undefined || value === null);
}

function isEmpty (value)
{
    if (isNotDefined (value))
        return true;

    if (typeof value === 'string')
        return (value.length == 0);

    if (isArray (value))
        return (value.length == 0);

    return false;
}

function isNotEmpty (value)
{
    return !isEmpty (value);
}

function isEmptyOrNotDefined (value)
{
    return (isNotDefined (value) || isEmpty (value));
}

function isNotDefinedOrEmpty (value)
{
    return (isNotDefined (value) || isEmpty (value));
}

function isDefinedAndNotEmpty (value)
{
    return (isDefined (value) && !isEmpty (value));
}

function isObject (val)
{
    if (!isDefined (val)) return false
    return (typeof val === 'object' && val instanceof Object)
}

function isUntypedObject (val)
{
    return (isObject (val) && val.constructor == Object)
}

function isObjectOfType (val,constructor)
{
    return (isObject (val) && val instanceof constructor)
}

function isNumeric (num)
{
    if (!isDefined (num))
        return false;
    else
        return !isNaN (num);
}

function isNumber (val)
{
    return (typeof val === 'number')
}

function isString (val)
{
    return (typeof val === 'string')
}

function isFunction (val)
{
    return (typeof val === 'function')
}

function isJQueryObject (val)
{
    return isJQueryElement (val)
}

function isDOMObject (val)
{
    return isHtmlElement (val)
}

function isJQueryElement (val)
{
    return (isObject (val) && val instanceof jQuery)
}

function isHtmlElement (val)
{
    return (isObject (val) && val instanceof Element)
}

function empty (value)
{
    return isEmpty (value);
}

function notEmpty (value)
{
    return !isEmpty (value);
}

function emptyOrNotDefined (value)
{
    return isEmptyOrNotDefined (value);
}

function notDefinedOrEmpty (value)
{
    return isNotDefinedOrEmpty (value);
}

function definedAndNotEmpty (value)
{
    return isDefinedAndNotEmpty (value);
}

function getOptionalValue (OptionalValue,DefaultValue)
{
    if (OptionalValue === undefined)
        return DefaultValue;
    else
        return OptionalValue;
}

function getDefinedValue (OptionalValue,DefaultValue)
{
    if (OptionalValue === undefined)
        return DefaultValue;
    else
        return OptionalValue;
}

function getValueAsSingleValue (value)
{
    if (isArray (value))
    {
        if (value.length == 0)
            return null;
        else if (value.length == 1)
            return value [0];
        else
            return null;
    }
    else
        return value;
}

function getValueAsArray (value)
{
    if (isArray (value))
        return value;

    var newArray = [];

    if (isDefined (value))
        newArray.push (value);

    return newArray;
}

function convertValueToArray (value)
{
    return convertValuesToArray (value)
}

function convertValuesToArray ()
{
    return convertArgumentsToArray.apply (null,arguments)
}

function convertArgumentsToArray ()
{
    var args = Array.prototype.slice.call (arguments)

    if (args.length == 0) return []
    if (args.length == 1 && isArray (args [0])) return args [0]

    return args
}

function resolveToObject (objectOrObjectSelector,objectResolver)
{
    if (isObject (objectOrObjectSelector))
        return objectOrObjectSelector

    return objectResolver (objectOrObjectSelector)
}
