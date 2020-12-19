var ChromePanelsEnabled = true;

/**
 * Turns a tab into a panel and vice versa.
 *
 * @param  {chrome.tabs.Tab} tab
 */
function togglePanel(tab) {
  chrome.windows.get(tab.windowId, function(vindov) {
    if (isPanel(vindov)) {
      panelIntoTab(vindov.id);
    } else {
      tabIntoPanel(tab);
    }
  });
}

/**
 * Opens a URL in a panel.
 *
 * @param {string}   url      URL to open
 * @param {function} callback (Optional.)
 */
function openInPanel(url, callback) {
  chrome.windows.create({ url: url, focused: true, type: 'panel' }, callback);
}
function openUrlInPanel(url, callback) {
  return openInPanel (url,callback)
}

/**
 * Opens a tab as a panel window. The tab will get closed and reopened.
 *
 * @param  {chrome.tabs.Tab} tab      (Optional.) Tab to open as a panel.
 *                                    Defaults to the active tab.
 * @param  {boolean}         isUnsafe (Optional). Whether the panel should be
 *                                    created without any checks for user
 *                                    preferences. Defaults to false.
 */
function tabIntoPanel(tab, isUnsafe) {
  if (tab === undefined) {
    getActiveTab(tabIntoPanel);
    return;
  }

  // If the currently open window is the only one, let's add a new tab to it so
  // that it won't get closed when its only tab is panelised. Setting isUnsafe
  // to true avoids an infinite loop.
  if (!isUnsafe && options.keepWindowsOpen) {
    ensureWindowNotClosed(tab, _.partialRight(tabIntoPanel, true));
    return;
  }

  openInPanel(tab.url, function() {
    chrome.tabs.remove(tab.id);
  });
}

/**
 * Ensures that the window of the given tab will not be closed after the tab is
 * removed from the window. Prevents the window from closing by opening a new
 * tab.
 *
 * @param  {chrome.tabs.Tab}   tab      Tab whose window should not be closed.
 * @param  {function}          callback (Optional.) Parameters:
 *                                      {chrome.tabs.Tab} The given tab.
 */
function ensureWindowNotClosed(tab, callback) {
  var _callback = function() {
    if (callback) {
      callback(tab);
    }
  };

  chrome.windows.get(tab.windowId, { populate: true }, function(vindov) {
    if (vindov.tabs.length === 1) {
      chrome.tabs.create({ windowId: vindov.id, active: false }, _callback);
      return;
    }

    _callback();
  });
}

/**
 * Opens a panel as a tab.
 *
 * @param  {number} windowId (Optional.) Window ID of the panel. Defaults to the
 *                           currently active panel.
 */
function panelIntoTab(windowId) {
  if (windowId === undefined) {
    getActivePanel(panelIntoTab);
    return;
  }

  chrome.windows.get(windowId, { populate: true }, function(panel) {
    var tab = panel.tabs[0];

    chrome.windows.remove(windowId, function() {
      openInFocusedWindow(tab.url);
    });
  });
}

/**
 * Gets the active tab, if one exists.
 *
 * @param  {Function} callback Parameters: {chrome.tabs.Tab}
 */
function getActiveTab(callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    callback(tabs[0]);
  });
}

/**
 * Gets the window ID of the active panel or the most recent panel, if one
 * exists.
 *
 * TODO: Should be two separate functions.
 *
 * @param  {Function} callback Parameters: {number}
 */
function getActivePanel(callback) {
  chrome.windows.getAll(null, function(windows) {
    var panels = _(windows).filter(isPanel);
    var activePanel = panels.find({ focused: true });

    if (activePanel) {
      callback(activePanel.id);
      return;
    }

    // IDs increase as windows are created.
    var mostRecentPanel = panels.map('id').max();

    if (mostRecentPanel) {
      callback(mostRecentPanel);
    }

    // TODO: Callback should be called with null or something.
  });
}

/**
 * Opens a URL in the last focused "normal" window if one exists. Creates a new
 * window otherwise.
 *
 * @param {string} url URL to open
 */
function openInFocusedWindow(url) {
  chrome.windows.getLastFocused({ windowTypes: ['normal'] }, function(vindov) {
    if (vindov === undefined) {
      chrome.windows.create({ url: url, focused: false });
    } else {
      chrome.tabs.create({ windowId: vindov.id, url: url });
    }
  });
}

/**
 * Checks whether a window is a panel or not.
 *
 * @param  {chrome.windows.Window}  vindov Window to check.
 * @return {boolean} True if the window is a panel, false otherwise.
 */
function isPanel(vindov) {
  return vindov.type === 'panel' || vindov.type === 'detached_panel';
}

function isChrome49OrNewer() {
  var userAgent = navigator.userAgent;
  var majorVersion = /Chrome\/([0-9]+)/.exec(userAgent)[1];

  return parseInt(majorVersion) >= 49;
}

function getClipboard() {    
    var el = document.createElement('textarea');
    document.body.appendChild(el);
    el.focus();
    document.execCommand('paste');
    var value = el.value;
    document.body.removeChild(el);
    return value;
}

function getSelectionText () {
    var text = "";
    if (window.getSelection)
        text = window.getSelection().toString();
    else if (document.selection && document.selection.type != "Control")
        text = document.selection.createRange().text;

/*
    if (text == "")
    {
        var iframes = document.getElementsByTagName('iframe');
        console.log (iframes);

        [].forEach.call(iframes, function(frame)
        {
            var iframeSelection = frame.contentWindow.getSelection();
            if (iframeSelection.toString().length > 0)
            {
                text = iframeSelection.toString ();
            }
        });
    }
*/

    return text;
}
