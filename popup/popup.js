document.getElementById("addSite").onclick = function () {
  const site = document.getElementById("newSite").value;
  if (site) {
    chrome.runtime.sendMessage(
      { action: "add", site: site },
      function (response) {
        if (response.success) {
          addSiteToList(site);
          document.getElementById("newSite").value = ""; // Clear input
        }
      },
    );
  }
};

function addSiteToList(site) {
  const list = document.getElementById("siteList");
  const entry = document.createElement("li");
  entry.appendChild(document.createTextNode(site));
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.onclick = function () {
    entry.remove();
    chrome.runtime.sendMessage({ action: "remove", site: site });
  };
  entry.appendChild(removeButton);
  list.appendChild(entry);
}

// On popup open, populate the list with currently blocked sites
chrome.runtime.sendMessage({ action: "getSites" }, function (response) {
  response.sites.forEach((site) => {
    addSiteToList(site);
  });
});
