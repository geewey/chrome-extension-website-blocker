document.addEventListener("DOMContentLoaded", function () {
  // Load the current list of blocked sites
  loadBlockedSites();

  document.getElementById("addSite").addEventListener("click", function () {
    const site = document.getElementById("newSite").value.trim().toLowerCase(); // Enforce casing
    if (site && isValidUrlFormat(site)) {
      addBlockRule(site);
    } else if (!isValidUrlFormat(site)) {
      alert(
        "Input only the domain and top-level domain, ex: abc.com, xyz.shop, or funk.net",
      );
    }
    document.getElementById("newSite").value = ""; // Clear input field
  });
});

function isValidUrlFormat(site) {
  // this pattern matches simple domain names like abc.com, xyz.shop, funk.net
  // it checks for a string that consists of:
  // 1. Optionally, one or more characters that are alphanumeric or dashes (for subdomains), followed by a dot.
  // 2. One or more characters that are alphanumeric or dashes (for the domain name), followed by a dot.
  // 3. Two to (a practical limit of) 10 characters for the TLD, to cover newer TLDs, allowing only letters.
  const urlPattern = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,10}$/;

  return urlPattern.test(site);
}

function loadBlockedSites() {
  chrome.runtime.sendMessage({ action: "getSites" }, function (response) {
    const blockedSitesList = document.getElementById("blockedSitesList");
    blockedSitesList.innerHTML = ""; // Clear existing list
    response.sites.forEach((site) => {
      displayBlockedSitesList(site);
    });
  });
}

function addBlockRule(site) {
  chrome.runtime.sendMessage(
    { action: "add", site: site },
    function (response) {
      if (response.success) {
        displayBlockedSitesList(site);
      } else {
        // Handle error
        alert("Site already blocked: " + site);
      }
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

function displayBlockedSitesList(site) {
  const list = document.getElementById("blockedSitesList");
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
