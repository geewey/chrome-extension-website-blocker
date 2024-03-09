// initial list of blocked sites for when the extension is loaded for the first time
const SITES_TO_BLOCK = ["espn.com", "cnn.com"];

chrome.runtime.onInstalled.addListener(() => {
  // initialize an empty list of blocked sites in storage if it doesn't exist
  chrome.storage.sync.get(["blockedSites"], function (result) {
    if (!result.blockedSites) {
      chrome.storage.sync.set({ blockedSites: SITES_TO_BLOCK });
      updateRules();
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "add") {
    addSite(request.site, sendResponse);
  } else if (request.action === "remove") {
    removeSite(request.site, sendResponse);
  } else if (request.action === "getSites") {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      sendResponse({ sites: result.blockedSites || [] });
    });
  }
  return true; // indicate that we will answer asynchronously
});

// helper function for managing storage
function updateStorageSites(updateCallback) {
  chrome.storage.sync.get(["blockedSites"], function (result) {
    const sites = result.blockedSites || [];
    updateCallback(sites, function (updatedSites) {
      chrome.storage.sync.set({ blockedSites: updatedSites }, updateRules);
    });
  });
}

function addSite(site, sendResponse) {
  updateStorageSites((sites, updateDone) => {
    if (!sites.includes(site)) {
      sites.push(site);
      updateDone(sites);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Site already blocked" });
      console.log("Site already blocked: " + site);
    }
  });
}

function removeSite(site, sendResponse) {
  updateStorageSites((sites, updateDone) => {
    const index = sites.indexOf(site);
    if (index > -1) {
      sites.splice(index, 1);
      updateDone(sites);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Site not found" });
      console.log("Site not found: " + site);
    }
  });
}

function updateRules() {
  chrome.storage.sync.get(["blockedSites"], async function (result) {
    const sites = result.blockedSites || [];
    // prepare the new rules based on the updated list of blocked sites
    const newRules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: site, resourceTypes: ["main_frame"] },
    }));

    // then get all all existing rules
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule) => rule.id);

    // update the dynamic rules with the new set
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules,
    });
  });
}
