const blockedSitesList = ["*://*espn.com/*", "*://*.somesite.com/*"];

chrome.runtime.onInstalled.addListener(() => {
  // Initialize the blockedSites list in storage if it doesn't exist
  chrome.storage.sync.get(["blockedSites"], function (result) {
    if (!result.blockedSites) {
      // chrome.storage.sync.set({ blockedSites: ["*://*.example.com/*", "*://*.somesite.com/*"]});
      chrome.storage.sync.set({ blockedSites: blockedSitesList });
    }
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "add") {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      const updatedSites = [
        ...result.blockedSites,
        "*://*" + request.site + "/*",
      ];
      chrome.storage.sync.set({ blockedSites: updatedSites }, function () {
        updateBlocking(updatedSites);
        sendResponse({ success: true });
      });
    });
  } else if (request.action === "remove") {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      const updatedSites = result.blockedSites.filter(
        (site) => site !== "*://*" + request.site + "/*",
      );
      chrome.storage.sync.set({ blockedSites: updatedSites }, function () {
        updateBlocking(updatedSites);
        sendResponse({ success: true });
      });
    });
  } else if (request.action === "getSites") {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      sendResponse({
        sites: result.blockedSites.map((site) =>
          site.replace("*://*.", "").replace("/*", ""),
        ),
      });
    });
  }
  return true; // Return true to indicate that sendResponse will be called asynchronously
});

function updateBlocking(sites) {
  chrome.webRequest.onBeforeRequest.removeListener(blockSite);
  if (sites.length > 0) {
    chrome.webRequest.onBeforeRequest.addListener(blockSite, { urls: sites }, [
      "blocking",
    ]);
  }
}

function blockSite(details) {
  return { cancel: true };
}

// Load and set the initial blocking upon startup
chrome.storage.sync.get(["blockedSites"], function (result) {
  if (result.blockedSites) {
    updateBlocking(result.blockedSites);
  }
});
