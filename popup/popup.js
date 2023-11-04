let subredditPattern = new RegExp("^[a-zA-Z0-9_]+$");

const optionsDefaults = {
    "enableYouTube": true,
    "enableNebula": true,
    "enableTitleSearch": true,
    "collapseOnLoad": false,
    "childrenHiddenDefault": false,
    "includeNSFW": false
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#checkboxOptions input").forEach((checkbox) => {
        let getJson = JSON.parse(`{"${checkbox.id}": "${optionsDefaults[checkbox.id]}"}`);
        chrome.storage.sync.get(getJson, result => {
            if (result[checkbox.id] == "true") {
                checkbox.checked = true;
            };
          });
        checkbox.onchange = () => {
            let setJson = JSON.parse(`{"${checkbox.id}": "${checkbox.checked}"}`);
            chrome.storage.sync.set(setJson);
        };
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