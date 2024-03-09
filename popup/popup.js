document.addEventListener("DOMContentLoaded", function () {
  // Load the current list of blocked sites
  loadBlockedSites();

  document.getElementById("addSite").addEventListener("click", function () {
    const site = document.getElementById("newSite").value.trim().toLowerCase(); // Enforce casing
    if (site) {
      addBlockRule(site);
    }
  });
});

function loadBlockedSites() {
  chrome.runtime.sendMessage({ action: "getSites" }, function (response) {
    const siteList = document.getElementById("siteList");
    siteList.innerHTML = ""; // Clear existing list
    response.sites.forEach((site) => {
      addSiteToList(site);
    });
  });
}

function addBlockRule(site) {
  chrome.runtime.sendMessage(
    { action: "add", site: site },
    function (response) {
      if (response.success) {
        addSiteToList(site);
      } else {
        // Handle error
        alert("Site already blocked: " + site);
      }
      document.getElementById("newSite").value = ""; // Clear input field
    },
  );
}

function removeBlockRule(site) {
  chrome.runtime.sendMessage(
    { action: "remove", site: site },
    function (response) {
      if (response.success) {
        loadBlockedSites(); // Refresh the list
      } else {
        // Handle error
        alert("Error occurred while removing site: " + site);
      }
    },
  );
}

function addSiteToList(site) {
  const list = document.getElementById("siteList");
  const entry = document.createElement("li");
  entry.textContent = site;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.classList.add("removeSpecificSite");
  removeButton.addEventListener("click", function () {
    removeBlockRule(site);
  });

  entry.appendChild(removeButton);
  list.appendChild(entry);
}
