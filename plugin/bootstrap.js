/* Zotero 7–10 bootstrapped extension; deliberately avoids version-specific imports. */
var modernThemes;

async function startup({ id, version, rootURI }) {
  const scope = {};
  Services.scriptloader.loadSubScript(rootURI + "themes.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "collection-icons.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "reading-progress.js", scope);
  Services.scriptloader.loadSubScript(rootURI + "runtime.js", scope);
  modernThemes = scope.MZTCreateRuntime({
    Zotero, Services, Ci, Cu: Components.utils, rootURI, id, version, themes: scope.MZTThemes, collectionIcons: scope.MZTCollectionIcons,
    readingProgress: scope.MZTReadingProgress
  });
  try {
    await modernThemes.start();
  }
  catch (error) {
    modernThemes.stop();
    modernThemes = null;
    throw error;
  }
}

function shutdown() {
  modernThemes?.stop();
  modernThemes = null;
}
function onMainWindowLoad({ window }) { modernThemes?.attach(window); }
function onMainWindowUnload({ window }) { modernThemes?.detach(window); }
function install() {}
function uninstall() {}
