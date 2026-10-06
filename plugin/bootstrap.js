/* Zotero 7–10 bootstrapped extension; deliberately avoids version-specific imports. */
var modernThemes;
var chromeHandle;

async function startup({ id, version, rootURI }) {
  // The settings sidebar colors its icons with context-fill, which Gecko only allows for chrome:// and
  // resource:// images, not the plugin's own jar: URLs.
  const aomStartup = Cc["@mozilla.org/addons/addon-manager-startup;1"].getService(Ci.amIAddonManagerStartup);
  chromeHandle = aomStartup.registerChrome(Services.io.newURI(rootURI + "manifest.json"),
    [["content", "modern-zotero-themes", rootURI]]);
  const scope = {};
  Services.scriptloader.loadSubScript(rootURI + "themes.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "collection-icons.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "reading-progress.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "runtime.js", scope);
  modernThemes = scope.MZTCreateRuntime({
    Zotero, Services, Ci, Cu: Components.utils, rootURI, id, version, themes: scope.MZTThemes, collectionIcons: scope.MZTCollectionIcons,
    readingProgress: scope.MZTReadingProgress, paneImage: "chrome://modern-zotero-themes/content/icons/palette.svg"
  });
  try {
    await modernThemes.start();
  }
  catch (error) {
    shutdown();
    throw error;
  }
}

function shutdown() {
  modernThemes?.stop();
  modernThemes = null;
  chromeHandle?.destruct();
  chromeHandle = null;
}
function onMainWindowLoad({ window }) { modernThemes?.attach(window); }
function onMainWindowUnload({ window }) { modernThemes?.detach(window); }
function install() {}
function uninstall() {}
