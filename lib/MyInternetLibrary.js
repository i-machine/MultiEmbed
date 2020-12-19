function parseUrl (url)
{
    var u
    try
    {
        u = new URL (url)
    }
    catch
    {
        return null
    }

    u.protocolAndHostname = u.protocol + '//' + u.hostname
    u.hostnameAndPathname = u.hostname + u.pathname
    u.hrefWithoutSearch = u.protocolAndHostname + u.pathname
    u.hrefWithoutProtocol = u.hostname + u.pathname + u.search
    u.hrefWithoutProtocolAndSearch = u.hostname + u.pathname

    var match = u.href.match (/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0)
    {
        u.domainPrefix = match [1] || ''
        u.hostnameWithoutPrefix = match [2]
    }
    else
    {
        u.domainPrefix = ''
        u.hostnameWithoutPrefix = u.hostname
    }

    var tmpArray = u.hostnameWithoutPrefix.split ('.')
    var rootDomainIndex = tmpArray.length - 1
    while (rootDomainIndex > 0 && tmpArray [rootDomainIndex].length <= 3)
        rootDomainIndex --

    if (rootDomainIndex >= 0)
    {
        u.rootDomainWithoutPrefix = tmpArray.slice (rootDomainIndex,tmpArray.length).join ('.')
        u.rootDomainWithPrefix = u.domainPrefix.length ? u.domainPrefix + u.rootDomainWithoutPrefix : u.rootDomainWithoutPrefix
        u.domains = [].concat (tmpArray.slice (0,rootDomainIndex))
        u.domains.push (u.rootDomainWithPrefix)
    }
    else
    {
        u.rootDomainWithoutPrefix = ''
        u.rootDomainWithPrefix = ''
        u.domains = []
    }

    u.searchParams = new URLSearchParams (u.search)
    u.searchParamsArray = []
    for (var p of u.searchParams)
        u.searchParamsArray.push ({key: p [0], value: p [1]})

    u.pathnameAsArray = u.pathname.split ('/')
    u.pathnameAsArray.splice (0,1)
    if (!u.pathnameAsArray [u.pathnameAsArray.length - 1].length)
        u.pathnameAsArray.splice (u.pathnameAsArray.length - 1,1)

    return u
}

$.urlParam = function(name){
    var results = new RegExp('[\?&;]' + name + '=([^&;#]*)','i').exec(window.location.href);
    if (results)
        return decodeURIComponent (results [1]);
    else
        return '';
}

function getFinalPartOfURL (URL)
{
    var n = URL.lastIndexOf('/');
    return (URL.substring(n + 1));
}

function getParameterByName (name,URL) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(URL);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function encodeQueryData(obj)
{
  var value = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      value.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return value.join("&");
}

function loadURLIntoString (URL,PerformAsynchronously)
{
    var tmpreq = new XMLHttpRequest();

    tmpreq.open ("GET",URL,PerformAsynchronously || false);
    tmpreq.send (null);

    return tmpreq.responseText;
}

function loadURLIntoString2 (URL)
{
    var tmpreq = new XMLHttpRequest();
    tmpreq.open ("GET",URL,true);

    tmpreq.onreadystatechange=function () {
       if (tmpreq.readyState == 4 && tmpreq.status == 200) {
          clearTimeout (xmlHttpTimeout);
          return (tmpreq.responseText);
       }
    }

    tmpreq.send (null);

    var xmlHttpTimeout = setTimeout (ajaxTimeout,5000);

    function ajaxTimeout () {
       tmpreq.abort ();
       return false;
    }
}

function loadURLIntoDiv (URL,IntoThisDiv)
{
    var result = loadURLIntoString (URL);
    if (result)
    {
        IntoThisDiv.innerHTML = result;
        return true;
    }
    else
    {
        IntoThisDiv.innerHTML = '';
        return false;
    }
}

function loadURLIntoDiv2 (URL,IntoThisDiv)
{
    var result = loadURLIntoString2 (URL);
    if (result)
    {
        IntoThisDiv.innerHTML = result;
        return true;
    }
    else
    {
        IntoThisDiv.innerHTML = '';
        return false;
    }
}

function openUrlInNewWindow (url)
{
    window.open (url, '_blank', 'toolbar=no');
}

function convertAllLinksToOpenInNewTabs (InThisElement)
{
    $(InThisElement).find ('a').each (function () {
        $(this).click (function (e) {e.preventDefault(); var tmpURL = $(this).attr ('href'); window.open (tmpURL,'_blank'); return false;});
    });
}

function convertAllLinksToOpenInNewWindows (InThisElement)
{
    $(InThisElement).find ('a').each (function () {
        $(this).click (function (e) {e.preventDefault(); var tmpURL = $(this).attr ('href'); openUrlInNewWindow (tmpURL); return false;});
    });
}

function convertAllLinksToOpenInPanels (InThisElement)
{
    $(InThisElement).find ('a').each (function () {
        $(this).click (function (e) {e.preventDefault(); var tmpURL = $(this).attr ('href'); openUrlInPanel (tmpURL); return false;});
    });
}

