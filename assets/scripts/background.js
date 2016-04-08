/**
 * The standard method for getting selected text (info.selectionText) strips 
 * newlines (https://bugs.chromium.org/p/chromium/issues/detail?id=116429), so
 * this function gets the selected text including newlines.
 * We can't run this inside of cleanAndCopy() because it's async, so it needs to 
 * call cleanAndCopy() as a callback
 */
function getSelection() {
  // http://stackoverflow.com/a/19165930/399105
  chrome.tabs.executeScript( {
    code: 'window.getSelection().toString();'
  }, function(selection) {
    cleanAndCopy(selection[0]);
  });
}

function cleanAndCopy(selectionText) {
  var charsToRemove = {
    // Zero-width space
    '\u200b': '',
    // Non-breaking space
    '\u00a0': ' ',
  };

  for (var charToRemove in charsToRemove) {
    // http://stackoverflow.com/a/1144788/399105
    var re = new RegExp(charToRemove, 'g');
    selectionText = selectionText.replace(re, charsToRemove[charToRemove]);
  }

  // Create a temporary textarea to hold the text to copy to the clipboard
  // http://stackoverflow.com/a/30810322/399105
  var textArea = document.createElement('textarea');
  textArea.value = selectionText;
  document.body.appendChild(textArea);
  textArea.select();

  document.execCommand('copy');

  document.body.removeChild(textArea);
}

chrome.contextMenus.create({
  'title': chrome.i18n.getMessage('copyContextMenuTitle'),
  'contexts': ['selection'],
  'onclick': getSelection
});
