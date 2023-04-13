let subredditPattern = new RegExp("^[a-zA-Z0-9_]+$");

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get({childrenHiddenDefault: "false"}, result => {
        if (result.childrenHiddenDefault == "true") {
          document.getElementById("hideChildren").checked = true;
        };
      });
    document.getElementById('hideChildren').onchange = () => {
        if (document.getElementById('hideChildren').checked) {
            chrome.storage.sync.set({childrenHiddenDefault: "true"});
        }
        else {
            chrome.storage.sync.set({childrenHiddenDefault: "false"});
        }
    };

    chrome.storage.sync.get({collapseOnLoad: "false"}, result => {
        if (result.collapseOnLoad == "true") {
            document.getElementById("collapseOnLoad").checked = true;
        };
      });
      document.getElementById("collapseOnLoad").onchange = () => {
            if (document.getElementById("collapseOnLoad").checked) {
                chrome.storage.sync.set({collapseOnLoad: "true"});
            }
            else {
                chrome.storage.sync.set({collapseOnLoad: "false"});
            }
    };

    chrome.storage.sync.get({includeNSFW: "false"}, result => {
        if (result.includeNSFW == "true") {
            document.getElementById("includeNSFW").checked = true;
        }
        document.getElementById("includeNSFW").onchange = () => {
            if (document.getElementById("includeNSFW").checked) {
                chrome.storage.sync.set({includeNSFW: "true"});
            }
            else {
                chrome.storage.sync.set({includeNSFW: "false"});
            }
        }
    })

    chrome.storage.sync.get({defaultSort: "top"}, result => {
      document.getElementById("defaultSortSelect").value = result.defaultSort;
      document.onchange = () => {
        chrome.storage.sync.set({defaultSort: document.getElementById("defaultSortSelect").value});
      }
    })

    chrome.storage.sync.get({subBlacklist: []}, result => {
        result.subBlacklist.forEach(element => {
            document.getElementById("blacklist").insertAdjacentHTML("beforeend", `<p class="subEntry"><span class="remove">&#10006; </span><span class="name">${element}</span></p>`);
        });
    });
})

document.addEventListener("click", event => {
    let target = event.target;
    if (target.classList.contains("remove")) {
        parent = target.parentElement;
        let sub = parent.querySelector(".name").textContent;
        chrome.storage.sync.get({subBlacklist: []}, result => {
            let subBlacklist = result.subBlacklist.filter(word => word != sub);
            chrome.storage.sync.set({subBlacklist: subBlacklist}, () => {
                parent.remove();
            });
        });
    } else if (target.id == "clearButton") {
        document.getElementById("duplicateError").style.display = "none";
        chrome.storage.sync.remove("subBlacklist", () => {
            let blacklist = document.getElementById("blacklist");
            while (blacklist.firstChild) {
                blacklist.removeChild(blacklist.lastChild);
            }
        });
    } else if (target.id == "blacklistButton") {
        document.getElementById("duplicateError").style.display = "none";
        sub = document.getElementById('blacklistInput').value.toLowerCase();
        if (subredditPattern.test(sub)) {
            document.getElementById("inputError").style.display = "none";
            chrome.storage.sync.get({subBlacklist: []}, result => {
                let subBlacklist = result.subBlacklist;
                if (subBlacklist.includes(sub.toLowerCase())) {
                    document.getElementById("duplicateError").style.display = "block";
                } else {
                    subBlacklist.push(sub);
                    chrome.storage.sync.set({subBlacklist: subBlacklist}, () => {
                        document.getElementById("blacklist").insertAdjacentHTML("beforeend", `<p class='subEntry'><span class='remove'>&#10006; </span><span class='name'>${sub}</span></p>`);
                        document.getElementById("blacklistInput").value = "";
                    });
                }
            });
        } else {
            document.getElementById("inputError").show();
        }
    }
})