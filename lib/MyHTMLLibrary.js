function produceHtmlPropertyString (property,value,addPropertyIfValueEmpty)
{
    var workingValue = value || '';

    if (workingValue.length || addPropertyIfValueEmpty)
        return property + '="' + workingValue + '"';
    else
        return '';
}

function produceHtmlTagString (tag,includeClosingTag,id,classNames,properties)
{
    var tagHtml = '';
    var workingTagName = tag.toLowerCase ();

    tagHtml += '<' + workingTagName;

    if (id && id.length)
        tagHtml += ' ' + produceHtmlPropertyString ('id',id);

    if (classNames && classNames.length)
    {
        var classNamesArray = valueToArray (classNames);
        var classNamesStr = classNamesArray.join (' ');

        tagHtml += ' ' + produceHtmlPropertyString ('class',classNamesStr);
    }

    if (properties && properties.length)
    {
        for (cProp = 0; cProp < properties.length; cProp ++)
        {
            var prop = properties [cProp];

            tagHtml += ' ' + produceHtmlPropertyString (prop.property,prop.value);
        }
    }

    tagHtml += '>';

    if (includeClosingTag)
        tagHtml += sprintf ('</%s>',workingTagName);

    return tagHtml;
}

function produceHtmlElement (tag,parentElement,id,classNames,properties)
{
    var tagHtmlString = produceHtmlTagString (tag,true,id,classNames,properties);

    var result = null;

    if (parentElement)
    {
        parentElement.innerHTML += tagHtmlString;
        result = parentElement.lastChild;
    }

    return result;
}

function removeTagsFromHtml (tags,html)
{
    tags = valueToArray (tags)

    var div = document.createElement('div');
    div.innerHTML = html;

    for (var c = 0; c < tags.length; c ++)
    {
        var elements = div.getElementsByTagName(tags [c]);
        var i = elements.length;
        while (i--) {
          elements[i].parentNode.removeChild(elements[i]);
        }
    }
    return div.innerHTML;
}
