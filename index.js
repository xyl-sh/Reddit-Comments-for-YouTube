let url;
let modhash = "";
let userId = "";
let banned = false;
let site;

document.addEventListener("click", event => {
  let target = event.target;
  if (target.matches(".rcfy-load-more-button:not(.rcfy-loading-more), .rcfy-load-more-button:not(.rcfy-loading-more) .rcfy-load-more-count")) {
    getMoreComments(target.classList.contains("rcfy-load-more-count") ? target.parentNode : target);
  } else if (target.classList.contains("rcfy-arrow")) {
    vote(target);
  } else if (target.classList.contains("rcfy-save-button")) {
    submit(target);
  } else if (target.classList.contains("rcfy-reply-button")) {
    reply(target);
  } else if (target.classList.contains("rcfy-edit-button")) {
    target.closest(".rcfy-comment-content").classList.add("rcfy-editing");
  } else if (target.classList.contains("rcfy-cancel-button")) {
    if (target.parentNode.classList.contains("rcfy-comment-box-edit")) {
      target.closest(".rcfy-comment-content").classList.remove("rcfy-editing");
    } else {
      target.parentNode.remove();
    }
  } else if (target.classList.contains("rcfy-delete-button")) {
    target.parentNode.classList.add("rcfy-confirming-delete");
  } else if (target.classList.contains("rcfy-confirm-delete-yes-button")) {
    target.parentNode.parentNode.classList.remove("rcfy-confirming-delete");
    target.parentNode.parentNode.parentNode.classList.add("rcfy-deleted");
    chrome.runtime.sendMessage({id: "delete", data: {id: target.closest(".rcfy-comment").getAttribute("rcfy-fullname"), uh: modhash}});
  } else if (target.classList.contains("rcfy-confirm-delete-no-button")) {
    target.parentNode.parentNode.classList.remove("rcfy-confirming-delete");
  } else if (target.classList.contains("rcfy-toggle-children-button")) {
    let comment = target.closest(".rcfy-comment");
    if (comment.classList.contains("rcfy-children-hidden")) {
      comment.classList.remove("rcfy-children-hidden");
      target.textContent = chrome.i18n.getMessage("hideChildComments");
    } else {
      comment.classList.add("rcfy-children-hidden");
      target.textContent = chrome.i18n.getMessage("showChildComments");
    }
  } else if (target.classList.contains("rcfy-comment-expander")) {
    target.closest(".rcfy-comment").classList.toggle("rcfy-collapsed");
  } else if (target.classList.contains("rcfy-spoiler")) {
    target.classList.add("rcfy-spoiler-revealed");
  }
})

document.addEventListener("keydown", event => {
  if (event.target.classList.contains("rcfy-textarea")) {
    if (event.key == "Enter" && (event.ctrlKey || event.metaKey)) {
      event.target.parentNode.querySelector(".rcfy-save-button").click();
    }
  }
});

function displayError(threads = false) {
  if (threads) {
    document.getElementById("rcfy-thread-status").textContent = chrome.i18n.getMessage("error");
  }
  document.getElementById("rcfy-notice").classList.remove("rcfy-notice-hidden");
  document.getElementById("rcfy-notice").textContent = navigator.onLine ? chrome.i18n.getMessage("otherError") : chrome.i18n.getMessage("internetError");
}

function getMe() {
  chrome.runtime.sendMessage({id: "getMe"}, response => {
    if (response.response && response.response.data.modhash != null && !response.response.data.is_suspended) {
      modhash = response.response.data.modhash;
      userId = "t2_" + response.response.data.id;
      document.getElementById("rcfy-container").classList.remove("rcfy-logged-out")
    }
    getThreads();
  })
}

function getThreads() {
  chrome.storage.sync.get({includeNSFW: "false"}, result => {
    chrome.runtime.sendMessage({
      id: "getThreads",
      site: site.name,
      videoId: window.location.href.match(site.idRegex)[1],
      includeNSFW: result.includeNSFW == "true",
      url: url
    }, response => {
      const threads = response.response;
      if (threads) {
        if (response.url != url) return;
        chrome.storage.sync.get({subBlacklist: []}, function(result) {
          setupThreadSelector(threads.filter(t => !t.data.promoted).filter(t => !result.subBlacklist.includes(t.data.subreddit.toLowerCase())));
        });
      } else {
        displayError(true);
      }
    })
  })
}

function sortThreads() {
  let sort = document.getElementById("rcfy-thread-sorter-select").querySelector("option:checked").value;
  let threads = document.getElementById("rcfy-thread-selector");
  if (localStorage) {
    localStorage.setItem('lastSort', sort);
  }
  let threadList = Array.from(threads.querySelectorAll('option'));
  let oldThread = threads.querySelector("option:checked").getAttribute("value");
  threadList.sort((a, b) => {
    let conda, condb;
    switch(sort) {
      case "subreddit":
        conda = a.getAttribute("subreddit").toLowerCase();
        condb = b.getAttribute("subreddit").toLowerCase()
        break;
      
      case "votes":
        conda = parseInt(b.getAttribute("votes"));
        condb = parseInt(a.getAttribute("votes"));
        break;

      case "comments":
        conda = parseInt(b.getAttribute("comments"));
        condb = parseInt(a.getAttribute("comments"));
        break;

      case "newest":
        conda = parseInt(b.getAttribute("created"));
        condb = parseInt(a.getAttribute("created"));
    }
    const namea = a.getAttribute("title").toLowerCase();
    const nameb = b.getAttribute("title").toLowerCase();
    return ((conda < condb) ? -1 : ((conda > condb) ? 1 : ((namea < nameb) ? -1 : 1)));
  });
  while (threads.firstChild) {
    threads.removeChild(threads.lastChild);
  }
  threadList.forEach(item => {
    threads.append(item);
  })
  threads.selectedIndex = 0;
  if (oldThread != threads.querySelector("option:checked").value || !document.getElementById("rcfy-thread")) {
    threads.onchange();
  }
}

function parseTimestamp(timestamp) {
  if (isNaN(timestamp)) {
    if (timestamp.includes(":")) {
      let sections = timestamp.split(":");
      if (sections.length == 3) {
        return (3600 * parseInt(sections[0])) + (60 * parseInt(sections[1])) + parseInt(sections[2]);
      } else {
        return (60 * parseInt(sections[0])) + parseInt(sections[1]);
      }
    } else {
      let newTime = 0;
      let hours = timestamp.match(/\d*h/);
      let minutes = timestamp.match(/\d*m/);
      let seconds = timestamp.match(/\d*s/);
      if (hours) {
        newTime += (parseInt(hours[0]) * 3600);
      }
      if (minutes) {
        newTime += (parseInt(minutes[0]) * 60);
      }
      if (seconds) {
        newTime += (parseInt(seconds[0]));
      }
      return newTime;
    }
  } else {
    return parseInt(timestamp);
  }
}

function setupThreadSelector(threads) {
  if (threads.length == 0) {
    document.getElementById("rcfy-notice").textContent = chrome.i18n.getMessage("noThreads");
    document.getElementById("rcfy-notice").classList.remove("rcfy-notice-hidden");
  } else {
    let threadSort = "votes"
    if (localStorage && localStorage.getItem('lastSort')) {
      threadSort = localStorage.getItem('lastSort');
    }
    document.getElementById("rcfy-thread-sorter").classList.remove("rcfy-thread-sorter-hidden");
    document.getElementById("rcfy-thread-sorter-select").value = threadSort;
    let threadSelectorString = "<select id='rcfy-thread-selector'>";
    threads.forEach(thread => {
      const threadData = thread.data;
      const subreddit = "r/" + threadData.subreddit;
      // &#8679; is an upvote symbol, &#128172; is a comment symbol
      const prefix = `${subreddit}, ${threadData.score}&#8679;, ${threadData.num_comments}&#128172;`;
      // Add in a dynamic number of spaces so that all the video titles line up
      const spaces = "&nbsp".repeat(52 - prefix.length);
      // Chop off titles that are too long to fit on screen:
      const title = threadData.title.length < 65 ? threadData.title : threadData.title.slice(0, 60) + "...";

      let url = new URL(threadData.url.replace("&amp;", "&"));
      let linkedTimestamp = url.searchParams.get("t");
      
      if (linkedTimestamp) {
        linkedTimestamp = parseTimestamp(linkedTimestamp);
      } else {
        linkedTimestamp = "";
      }

      threadSelectorString += `<option
        value="${threadData.id}"
        title="${threadData.title.replace(/\"/g,'&quot;')}"
        timestamp="${linkedTimestamp}"
        subreddit="${threadData.subreddit}"
        votes=${threadData.score}
        created=${threadData.created}
        comments=${threadData.num_comments}
        >${prefix}${spaces} ${title}</option>`;
    });
    threadSelectorString += "</select>"
    if (document.getElementById("rcfy-thread-selector")) return;
    document.getElementById("rcfy-header").insertAdjacentHTML("afterend", threadSelectorString)
    let threadSelector = document.getElementById("rcfy-thread-selector");
    threadSelector.onchange = () => {
      chrome.storage.sync.get({defaultSort: "top"}, result => {
        getCommments(threadSelector.querySelector("option:checked"), result.defaultSort);
      });
    };
    sortThreads();
  }
  document.getElementById("rcfy-thread-sorter-select").onchange = () => {sortThreads()}
  document.getElementById("rcfy-thread-status").textContent = threads.length == 1 ? chrome.i18n.getMessage("oneThread") : chrome.i18n.getMessage("threadCount", [threads.length])
}

function getCommments(selector, sort) {
  let rcfyNotice = document.getElementById("rcfy-notice");
  rcfyNotice.textContent = chrome.i18n.getMessage("loadingComments");
  rcfyNotice.classList.remove("rcfy-notice-hidden");
  if (thread = document.getElementById("rcfy-thread")) {
    thread.remove()
  }
  let threadId = selector.value;
  chrome.runtime.sendMessage({id: "getSub", subreddit: selector.getAttribute("subreddit")}, subredditResponse => {
    banned = subredditResponse.response.data.user_is_banned;
    chrome.runtime.sendMessage({id: "setupComments", threadId: threadId, sort: sort, url: url}, response => {
      if (response.url != url) return;
      if (response.response != null) {
        let thread = response.response[0].data.children[0];
        let threadElement = document.createElement("template");
        let scores = getScores(thread);
        threadElement.innerHTML = `<div id="rcfy-thread" rcfy-is-archived="${thread.data.archived}" rcfy-fullname="${thread.data.name}">
          <div id="rcfy-thread-header" class="${getVotedClass(thread.data.likes)}" rcfy-fullname="${thread.data.name}">
            <div id="rcfy-thread-arrows">
              <div class="rcfy-arrow rcfy-upvote"></div>
              <div class="rcfy-score rcfy-score-downvoted">${scores[0]}</div>
              <div class="rcfy-score rcfy-score-unvoted">${scores[1]}</div>
              <div class="rcfy-score rcfy-score-upvoted">${scores[2]}</div>
              <div class="rcfy-arrow rcfy-downvote"></div>
            </div>
            <p id="rcfy-thread-title"><a href="https://www.reddit.com${thread.data.permalink}" target="_blank">${thread.data.title}</a> ${selector.getAttribute("timestamp") == "" ? "" : createTimeStamp(selector.getAttribute("timestamp"), false)}</p>
            <p id="rcfy-thread-tagline" class="rcfy-tagline">${chrome.i18n.getMessage("threadTagline", [timestampToRelativeTime(thread.data.created_utc), thread.data.author, thread.data.subreddit])}${getAwards(thread.data)}</p>
          </div>
          <div id="rcfy-sort-comments">
            <span>${chrome.i18n.getMessage("sortedBy")}</span>
            <select id="rcfy-sort-comments-selector" value="${sort}">
              <option value="confidence">${chrome.i18n.getMessage("best")}</option>
              <option value="top">${chrome.i18n.getMessage("top")}</option>
              <option value="new">${chrome.i18n.getMessage("new")}</option>
              <option value="controversial">${chrome.i18n.getMessage("controversial")}</option>
              <option value="old">${chrome.i18n.getMessage("old")}</option>
              <option value="qa">${chrome.i18n.getMessage("qa")}</option>
            </select>
          </div>
          ${modhash != "" && !thread.data.archived && !thread.data.locked && !banned ? createTextBox(true) : ""}
          <div id="rcfy-comments"></div></div>`
        
        response.response[1].data.children.forEach(item => {
          threadElement.content.querySelector("#rcfy-comments").appendChild(processComment(item));
        })

        let commentSortSelector = threadElement.content.querySelector("#rcfy-sort-comments-selector");
        commentSortSelector.value = sort;
        commentSortSelector.onchange = () => {
          getCommments(selector, commentSortSelector.querySelector("option:checked").value);
        }

        chrome.storage.sync.get({childrenHiddenDefault: "false"}, result => {
            if (result.childrenHiddenDefault == "true") {
              threadElement.content.querySelectorAll("#rcfy-comments > .rcfy-comment").forEach(item => {
                if (item.querySelector(".rcfy-comment-children .rcfy-comment")) {
                  item.classList.add("rcfy-children-hidden");
                  item.querySelector(".rcfy-toggle-children-button").textContent = chrome.i18n.getMessage("showChildComments");
                }
              });
            }
            document.getElementById("rcfy-notice").classList.add("rcfy-notice-hidden");
            document.getElementById("rcfy-container").appendChild(threadElement.content);
        })
      } else {
        displayError();
      }
    })
  })
}

function createTextBox(isOp = false, isEdit = false, editText = "") {
  let commentBox = `
  <div class="rcfy-comment-box-container${isEdit ? " rcfy-comment-box-edit" : ""}" ${isOp ? `id="rcfy-top-level-comment-box"` : ""}>
    <textarea class="rcfy-textarea">${editText}</textarea>
    <button class="rcfy-save-button">${chrome.i18n.getMessage("save")}</button>
    ${!isOp ? `<button class="rcfy-cancel-button">${chrome.i18n.getMessage("cancel")}</button>` : ""}
    <span class="rcfy-error-notice"></span>
  </div>
  `
  return commentBox;
}

function createTimeStamp(time, isComment) {
  let hours = Math.floor(time / 3600);
  let remaining = time % 3600;
  let minutes = Math.floor(remaining / 60);
  let seconds = remaining % 60;
  let timestamp = `${hours > 0 ? hours + ":" + ("0" + minutes).slice(-2) : minutes}:${("0" + seconds).slice(-2)}`
  if (isComment) {
    return `&lt;span class=\"rcfy-comment-timestamp\" onclick=\"document.querySelector('${site.videoPlayer}').currentTime = ${time}\"&gt;[${timestamp}]&lt;/span&gt;`;
  } else {
    return `<span class="rcfy-title-timestamp-spacer"> -- </span> <span class="rcfy-title-timestamp" onclick="document.querySelector('${site.videoPlayer}').currentTime = ${time}">[${timestamp}]</span>`;
  }
}

function commentText(html) {
  let textTimestampRegex = /(?<=\s|^|;)[0-5]?\d(?::[0-5]?\d){1,2}(?=\s|$|&|\.)/g;
  let textTimestamps = [...html.matchAll(textTimestampRegex)];
  let textTimestampReplacements = [...textTimestamps.map(entry => {return createTimeStamp(parseTimestamp(entry[0]), true)})];
  let textTimestampIndex = 0;

  return html
  .replaceAll("&lt;a href=\"/", "&lt;a href=\"https://www.reddit.com/")
  .replaceAll("class=\"md\"", "class=\"rcfy-comment-text\"")
  .replaceAll("class=\"md-spoiler-text\"", "class=\"rcfy-spoiler\"")
  .replaceAll(textTimestampRegex, () => {return textTimestampReplacements[textTimestampIndex++]});
}

function processComment(comment) {
  let commentElement = document.createElement("template");
  if (comment.kind == "t1") {
    let scores = getScores(comment, "comment");
    commentElement.innerHTML = `
    <div class="rcfy-comment ${getVotedClass(comment.data.likes)}" rcfy-fullname="${comment.data.name}">
      <div class="rcfy-comment-arrows">
        <div class="rcfy-arrow rcfy-upvote"></div>
        <div class="rcfy-arrow rcfy-downvote"></div>
      </div>
      <div class="rcfy-comment-content">
        <p class="rcfy-tagline ${comment.data.controversiality == 1 ? "rcfy-controversial" : ""}">
          <span class="rcfy-comment-expander"></span>
          ${comment.data.author == "[deleted]"
          ? `<span class="rcfy-author-deleted"><em>[deleted]</em></span>`
          : `<a class="rcfy-comment-author
          ${comment.data.is_submitter ? " rcfy-comment-submitter" : ""}
          ${comment.data.distinguished == "moderator" ? " rcfy-comment-moderator" : ""}
          ${comment.data.distinguished == "admin" ? " rcfy-comment-admin" : ""}" href='https://www.reddit.com/user/${comment.data.author}' target='_blank'>${comment.data.author}</a>`}
          <span class="rcfy-score rcfy-score-downvoted">${scores[0]}</span>
          <span class="rcfy-score rcfy-score-unvoted">${scores[1]}</span>
          <span class="rcfy-score rcfy-score-upvoted">${scores[2]}</span>
          <span>${timestampToRelativeTime(comment.data.created_utc)}</span>${comment.data.edited ? `<span title="${chrome.i18n.getMessage("commentEdited", [timestampToRelativeTime(comment.data.edited)])}">*</span>` : ""}
          ${getAwards(comment.data)}
          ${comment.data.stickied ? `<span class="rcfy-stickied">${chrome.i18n.getMessage("stickiedComment")}</span>` : ""}
        </p>
        ${new DOMParser().parseFromString(commentText(comment.data.body_html),
          "text/html").body.textContent}
        ${createTextBox(false, true, comment.data.body)}
        <ul class="rcfy-comment-buttons">
          <li><a class="rcfy-permalink-button" href="https://www.reddit.com${comment.data.permalink}" target="_blank">${chrome.i18n.getMessage("permalink")}</a></li>

          ${comment.data.author_fullname == userId ? `
          <li><span class="rcfy-edit-button">${chrome.i18n.getMessage("edit")}</a></li>
          <li><span class="rcfy-delete-button">${chrome.i18n.getMessage("delete")}</span><span class="rcfy-confirm-delete">${chrome.i18n.getMessage("confirmDelete")}</span><span class="rcfy-deleted-notice">${chrome.i18n.getMessage("deleted")}</li>
          ` : ""}
          ${modhash != "" && !comment.data.locked && !comment.data.archived && comment.data.score != null && !banned ? `<li><span class="rcfy-reply-button">${chrome.i18n.getMessage("reply")}</span></li>` : ""}
          ${comment.data.replies != "" && comment.data.replies.data.children[0].kind == "t1" ? `<li><span class="rcfy-toggle-children-button">${chrome.i18n.getMessage("hideChildComments")}</span></li>` : ""}
        </ul>
        </div><div class="rcfy-comment-children"></div></div>`
    commentElement.content.querySelectorAll(".rcfy-comment-text a").forEach(item => {
      item.target = "_blank"
    })
    commentElement.content.querySelectorAll(`.rcfy-comment-text a[href*="${window.location.href.match(site.idRegex)[1]}"]`).forEach(item => {
      if (time = new URL(item.href).searchParams.get("t")) {
        item.outerHTML = `${!item.textContent.match(/((?:^|\[)[0-5]?\d(?::[0-5]?\d){1,2}(?:$|\])|\?t=\d+)/g) ? item.textContent : ""} ${new DOMParser().parseFromString(createTimeStamp(parseTimestamp(time), true), "text/html").body.textContent}`;
      }
    });
    if (comment.data.replies != "") {
      comment.data.replies.data.children.forEach(item => {
        commentElement.content.querySelector(".rcfy-comment-children").appendChild(processComment(item));
      });
    }
  } else if (comment.kind == "more") {
    commentElement.innerHTML = `<span class="rcfy-load-more-button" rcfy-fullname="${comment.data.name}" rcfy-children="${comment.data.children.join()}">${chrome.i18n.getMessage("loadMoreComments", [comment.data.count])}</span>`
  }
  return commentElement.content;
}

function getMoreComments(element) {
  element.classList.add("rcfy-loading-more");
  element.textContent = chrome.i18n.getMessage("loadingMoreComments");
  let requestData = {"link_id": document.getElementById("rcfy-thread-header").getAttribute("rcfy-fullname"), "sort": "hot", "children": element.getAttribute("rcfy-children"), "id": element.getAttribute("rcfy-fullname"), "limit_children": false}
  chrome.runtime.sendMessage({id: "moreChildren", data: requestData}, response => {
    let data = response.response.jquery[10][3][0];
    let moreComments = document.createElement("template");
    data.forEach(item => {
      let comment = processComment(item);
      if (parent = moreComments.content.querySelector(`div[rcfy-fullname="${item.data.parent_id}"] > .rcfy-comment-children`)) {
        parent.appendChild(comment);
      } else {
        moreComments.content.appendChild(comment);
      }
    })
    if (parentComment = element.closest(".rcfy-comment")) {
      if (!parentComment.querySelector(":scope > .rcfy-comment-content .rcfy-comment-buttons .rcfy-toggle-children-button")) {
        element.closest(".rcfy-comment").querySelector(":scope > .rcfy-comment-content .rcfy-comment-buttons").insertAdjacentHTML("beforeend", `<li><span class="rcfy-toggle-children-button">${chrome.i18n.getMessage("hideChildComments")}</span></li>`)
      }
    }
    element.replaceWith(moreComments.content);
  })
}

function vote(element) {
  let grandparent = element.parentNode.parentNode;
  let voteDirection;
  if ((element.classList.contains("rcfy-upvote") && grandparent.classList.contains("rcfy-upvoted")) ||
      (element.classList.contains("rcfy-downvote") && grandparent.classList.contains("rcfy-downvoted"))) {
    voteDirection = 0;
    grandparent.classList.remove("rcfy-upvoted");
    grandparent.classList.remove("rcfy-downvoted");
    grandparent.classList.add("rcfy-unvoted");
  } else if (element.classList.contains("rcfy-upvote")) {
    voteDirection = 1;
    grandparent.classList.remove("rcfy-unvoted");
    grandparent.classList.remove("rcfy-downvoted");
    grandparent.classList.add("rcfy-upvoted");
  } else {
    voteDirection = -1;
    grandparent.classList.remove("rcfy-upvoted");
    grandparent.classList.remove("rcfy-unvoted");
    grandparent.classList.add("rcfy-downvoted");
  }
  let data = {dir: voteDirection, id: grandparent.getAttribute("rcfy-fullname"), rank: 2, uh: modhash}
  chrome.runtime.sendMessage({id: "vote", data: data})
}

function submit(element) {
  element.disabled = true;
  let container = element.parentNode;
  container.querySelector(".rcfy-error-notice").textContent = "";
  let data = {thing_id: container.closest("div[rcfy-fullname]").getAttribute("rcfy-fullname"), text: container.querySelector(".rcfy-textarea").value, uh: modhash};
  if (!container.classList.contains("rcfy-comment-box-edit")) {
    chrome.runtime.sendMessage({id: "comment", data: data}, response => {
      if (response.response.success) {
        let newComment = processComment(response.response.jquery[response.response.jquery.length-4][3][0][0]);
        if (container.id == "rcfy-top-level-comment-box") {
          document.getElementById("rcfy-comments").prepend(newComment);
          container.querySelector(".rcfy-textarea").value = "";
        } else {
          if (!element.closest(".rcfy-comment").querySelector(":scope > .rcfy-comment-content .rcfy-comment-buttons .rcfy-toggle-children-button")) {
            element.closest(".rcfy-comment").querySelector(":scope > .rcfy-comment-content .rcfy-comment-buttons").insertAdjacentHTML("beforeend", `<li><span class="rcfy-toggle-children-button">${chrome.i18n.getMessage("hideChildComments")}</span></li>`)
          }
          container.replaceWith(newComment);
        }
      } else {
        container.querySelector(".rcfy-error-notice").textContent = response.response.jquery[14][3][0];
      }
    element.disabled = false;
    })
  } else {
    chrome.runtime.sendMessage({id: "edit", data: data}, response => {
      if (response.response.success) {
        container.parentNode.querySelector(".rcfy-comment-text").remove();
        container.insertAdjacentHTML("beforebegin", new DOMParser().parseFromString(response.response.jquery[response.response.jquery.length-4][3][0][0].data.body_html
          .replaceAll("&lt;a href=\"/", "&lt;a href=\"https://www.reddit.com/")
          .replaceAll("class=\"md\"", "class=\"rcfy-comment-text\"")
          .replaceAll("class=\"md-spoiler-text\"", "class=\"rcfy-spoiler\""),
          "text/html").body.textContent);
        container.parentNode.classList.remove("rcfy-editing")
      } else {
        container.querySelector(".rcfy-error-notice").textContent = chrome.i18n.getMessage("editFailed");
      }
      element.disabled = false;
    })
  }
}

function reply(element) {
  if (!element.closest(".rcfy-comment").querySelector(":scope > .rcfy-comment-children > .rcfy-comment-box-container")) {
    element.closest(".rcfy-comment").querySelector(":scope > .rcfy-comment-children").insertAdjacentHTML("afterbegin", createTextBox());
  }
}

function getScores(item) {
  if (item.data.score_hidden == true) {
    return [chrome.i18n.getMessage("commentScoreHidden"), chrome.i18n.getMessage("commentScoreHidden"), chrome.i18n.getMessage("commentScoreHidden")];
  }
  let scores;
  if (item.data.likes == null) {
    scores = [item.data.score - 1, item.data.score, item.data.score + 1]
  } else if (!item.data.likes) {
    scores = [item.data.score, item.data.score + 1, item.data.score + 2]
  } else {
    scores = [item.data.score - 2, item.data.score - 1, item.data.score]
  }
  scores.forEach((score, index) => {
    if (score > 9999) {
      score = chrome.i18n.getMessage("commentThousandUnit", [(score / 1000).toFixed(score > 99999 ? 0 : 1)]);
    }
    if (item.kind == "t1") {
      if (score == 1) {
        score = chrome.i18n.getMessage("commentPoint")
      } else {
        score = chrome.i18n.getMessage("commentPoints", [score])
      }
    }
    scores[index] = score;
  })
  return scores;
}

function getVotedClass(likedPost) {
  if (likedPost == null) {
    return "rcfy-unvoted";
  }
  return likedPost ? "rcfy-upvoted" : "rcfy-downvoted";
}

function getAwards(item) {
  let awardsList = item.all_awardings;
  let increment = 0;
  let awardsCounted = 0;
  let awardsString = "<span class='rcfy-awards'>"
  for (increment; increment < awardsList.length && increment < 4; increment++) {
    let award = awardsList[increment];
    awardsString += `<span class="rcfy-award"><img src="${award.resized_icons[0].url}">${award.count > 1 ? award.count : ""}</span>`;
    awardsCounted += award.count;
  }
  let awardsLeft = item.total_awards_received - awardsCounted;
  awardsString += `${awardsLeft > 0 ? chrome.i18n.getMessage("moreAwards", [awardsLeft]) : ""}</span>`;
  return awardsString;
}

function timestampToRelativeTime(timestamp) {
  let currentTime = Math.floor(Date.now() / 1000);
  let difference = currentTime - timestamp;

  if (difference < 10) {
    return chrome.i18n.getMessage("timeJustNow");
  } else if (difference < 60) {
    return chrome.i18n.getMessage("timeSecondsAgo", [difference]);
  } else if (difference < 120) {
    return chrome.i18n.getMessage("timeMinuteAgo");
  } else if (difference < 3600) {
    return chrome.i18n.getMessage("timeMinutesAgo", [Math.floor(difference/60)]);
  } else if (difference < 7200) {
    return chrome.i18n.getMessage("timeHourAgo");
  } else if (difference < 86400) {
    return chrome.i18n.getMessage("timeHoursAgo", [Math.floor(difference/3600)]);
  } else if (difference < 172800) {
    return chrome.i18n.getMessage("timeDayAgo");
  } else if (difference < 2678400) {
    return chrome.i18n.getMessage("timeDaysAgo", [Math.floor(difference/86400)]);
  } else if (difference < 5356800) {
    return chrome.i18n.getMessage("timeMonthAgo");
  } else if (difference < 31536000) {
    return chrome.i18n.getMessage("timeMonthsAgo", [Math.floor(difference/2678400)]);
  } else if (difference < 63072000) {
    return chrome.i18n.getMessage("timeYearAgo");
  } else {
    return chrome.i18n.getMessage("timeYearsAgo", [Math.floor(difference/31536000)]);
  }
}

async function getCommentsForVideo(videoUrl) {
  return document.querySelector(site.anchorElement) || new Promise(resolve => {
    const intervalId = setInterval(() => {
      const comments = document.querySelector(site.anchorElement);
      if(videoUrl !== window.location.href){
        clearInterval(intervalId);
        resolve(null);
      }
      else if (comments) {
        clearInterval(intervalId);
        resolve(comments);
      }
    }, 200);
  });
}

async function update() {
  if (window.location.href === url || !window.location.href.match(site.idRegex)) {
    url = "";
    return;
  }
  url = window.location.href;
  const comments = await getCommentsForVideo(url)
  if (comments) {
    if (rcfyContainer = document.getElementById("rcfy-container")) {
      rcfyContainer.remove();
    }
    chrome.storage.sync.get({collapseOnLoad: "false"}, result => {
      comments.insertAdjacentHTML(site.anchorType, `
      <div id="rcfy-container" class="rcfy-logged-out ${result.collapseOnLoad == "true" ? "rcfy-collapsed" : ""}">
        <div id="rcfy-header">
          <h2><span id="rcfy-thread-expander" onclick="document.getElementById('rcfy-container').classList.toggle('rcfy-collapsed')"></span>&nbsp;${chrome.i18n.getMessage("header")}</h2>
          <h2 id="rcfy-thread-status">${chrome.i18n.getMessage("loadingThreads")}</h2>
          <div id="rcfy-thread-sorter" class="rcfy-thread-sorter-hidden">
            <h2>${chrome.i18n.getMessage("sortThreads")}</h2>
              <select id="rcfy-thread-sorter-select">
                <option value="votes">Score</option>
                <option value="comments">Comments</option>
                <option value="subreddit">Subreddit</option>
                <option value="newest">Newest</option>
              </select>
          </div>
        </div>
        <h3 id="rcfy-notice" class="rcfy-notice-hidden"></h3>
      </div>`);
      getMe();
    })
  }
};

async function init() {
  if (window.location.hostname === "www.youtube.com") {
    chrome.storage.sync.get({enableYouTube: "true"}, result => {
      if (result.enableYouTube !== "true") {
        return;
      }

      site = {
        name: "YOUTUBE",
        idRegex: /(?:v=|shorts\/)([a-zA-Z0-9\-_]{11})/,
        anchorElement: "#comments",
        anchorType: "beforebegin",
        videoPlayer: ".video-stream"
      };
      document.addEventListener("yt-navigate-finish", () => update());
      document.addEventListener("spfdone", () => update());
      document.addEventListener("DOMContentLoaded", () => update());
    });
  } else if (window.location.hostname === "nebula.tv") {
    chrome.storage.sync.get({enableNebula: "true"}, result => {
      if (result.enableNebula !== "true") {
        return;
      }

      site = {
        name: "NEBULA",
        idRegex: /(videos\/.*)/,
        anchorElement: "section[aria-label='video description']",
        anchorType: "beforeend",
        videoPlayer: "#video-player video"
      };
      document.addEventListener("DOMContentLoaded", () => update());
      chrome.runtime.onMessage.addListener(
        (request) => {
          if (request.message === "CHANGED") {
            update();
          }
      });
    });
  }
}

init();