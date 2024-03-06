// These sites are blocked upon initialization
const SITES_TO_BLOCK = ["espn.com", "cnn.com"];

chrome.runtime.onInstalled.addListener(() => {
  // Initialize an empty list of blocked sites in storage if it doesn't exist
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
      sendResponse({ sites: result.blockedSites || SITES_TO_BLOCK });
    });
  }
  return true; // Indicate that we will answer asynchronously
});

function addSite(site, sendResponse) {
  chrome.storage.sync.get(["blockedSites"], function (result) {
    const sites = result.blockedSites || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.sync.set({ blockedSites: sites }, () => {
        updateRules();
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, error: "Site already blocked" });
      console.log("Site already blocked: " + site);
    }
  });
}

function removeSite(site, sendResponse) {
  chrome.storage.sync.get(["blockedSites"], function (result) {
    const sites = result.blockedSites || [];
    const index = sites.indexOf(site);
    if (index > -1) {
      sites.splice(index, 1);
      console.log(sites);
      chrome.storage.sync.set({ blockedSites: sites }, () => {
        updateRules();
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, error: "Site not found" });
      console.log("Site not found: " + site);
    }
  });
}

function updateRules() {
  chrome.storage.sync.get(["blockedSites"], function (result) {
    const sites = result.blockedSites || [];
    console.log("Updating rules...");
    console.log(sites);
    const rules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        // urlFilter: site,
        urlFilter: `|https://*.${site}*`,
        resourceTypes: ["main_frame"],
      },
    }));

    console.log(rules);

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((rule) => rule.id),
      addRules: rules,
    });
  });
}
