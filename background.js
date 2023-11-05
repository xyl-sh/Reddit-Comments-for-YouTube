chrome.runtime.onMessage.addListener(
  function (request, _sender, sendResponse) {
    let formData = new FormData();
    if (request.data) {
      for (let key in request.data) {
        formData.append(key, request.data[key]);
      }
    }
    switch(request.id) {
      case "setupComments":
        fetch(`https://api.reddit.com/comments/${request.threadId}?sort=${request.sort}`).then(response => response.json()).then(json => sendResponse({response: json, url: request.url}));
        break;

      case "getThreads":
        let urls = [
          `https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.videoId}+site:youtu.be&include_over_18=${request.includeNSFW}`,
          `https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.videoId}+site:youtube.com&include_over_18=${request.includeNSFW}`];
        if (request.site === "NEBULA") {
          urls = [`https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.videoId}&include_over_18=${request.includeNSFW}`];
        }

        if (!!request.youtubeId) {
          urls.push(`https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.youtubeId}+site:youtu.be&include_over_18=${request.includeNSFW}`,
          `https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.youtubeId}+site:youtube.com&include_over_18=${request.includeNSFW}`)
        }

        Promise.all(urls.map(url => getThread(url)))
        .then(promises => {
          const threads = [];
          promises.forEach(response => {
            if (response != null) {
              response.forEach(thread => threads.push(thread));
            }
          });
          sendResponse({response: threads, url: request.url})
        })
        .catch(() => sendResponse({response: null}));
        break; 

      case "moreChildren":
        fetch("https://api.reddit.com/api/morechildren", {
          method: "POST",
          body: formData
        }).then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "getMe":
        fetch("https://api.reddit.com/api/me.json").then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "getSub":
        fetch(`https://api.reddit.com/r/${request.subreddit}/about.json`).then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "vote":
        fetch("https://api.reddit.com/api/vote", {
          method: "POST",
          body: formData
        });
        break;

      case "comment":
        fetch("https://api.reddit.com/api/comment", {
          method: "POST",
          body: formData
        }).then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "edit":
        fetch("https://api.reddit.com/api/editusertext", {
          method: "POST",
          body: formData
        }).then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "delete":
        fetch("https://api.reddit.com/api/del", {
          method: "POST",
          body: formData
        }).then(response => response.json()).then(json => sendResponse({response: json}));
        break;

      case "getYouTubeClientInfo":
        fetch("https://www.youtube.com/sw.js").then(response => response.text()).then(text => sendResponse({response: text}));
        break;

      case "getNebulaCreators":
        fetch("https://talent.nebula.tv/creators/").then(response => response.text()).then(text => sendResponse({response: text}));
        break;

      case "searchYouTube":
        if (request.channel) {
          fetch(`https://www.youtube.com/channel/${request.channel}/search?query=${request.title}&themeRefresh=1`)
          .then(response => response.text())
          .then(text => {
            let json = JSON.parse(text.split(">var ytInitialData = ")[1].split(";</script>")[0]);
            let results = json.contents.twoColumnBrowseResultsRenderer.tabs.find(t => t.expandableTabRenderer?.selected).expandableTabRenderer.content.sectionListRenderer.contents.filter(r => r.itemSectionRenderer && r.itemSectionRenderer.contents[0].videoRenderer).map(r => ({
              videoId: r.itemSectionRenderer.contents[0].videoRenderer.videoId,
              title: r.itemSectionRenderer.contents[0].videoRenderer.title.runs[0].text,
              channel: r.itemSectionRenderer.contents[0].videoRenderer.longBylineText.runs[0].text
            }));
            sendResponse({response: results});
          });
        } else {
          fetch(`https://www.youtube.com/results?search_query=${request.title}&themeRefresh=1`)
          .then(response => response.text())
          .then(text => {
            let json = JSON.parse(text.split(">var ytInitialData = ")[1].split(";</script>")[0]);
            let results = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(r => r.videoRenderer).map(r => ({
              videoId: r.videoRenderer.videoId,
              title: r.videoRenderer.title.runs[0].text,
              channel: r.videoRenderer.longBylineText.runs[0].text
            }));
            sendResponse({response: results});
          });
        }

        break;
      }
      return true;
    }
  );

async function getThread(url) {
  return new Promise ((resolve, reject) => {
    const threads = [];
    fetch(url).then(response => response.json()).then(async function(json) {
      json.data.children.forEach(t => threads.push(t));
      if (json.data.after != null) {
        trimmedUrl = url.replace(/&after.*$/g, "");
        await getThread(`${trimmedUrl}&after=${json.data.after}`).then(value => {
          moreThreads = value;
          threads.push(...value);
        }, error => {
          console.error(`Failed to fetch ${url}: ${error}`);
        })
      }
      resolve(threads);
    }).catch((error) => reject(error))
  })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: "CHANGED",
      url: changeInfo.url
    })
  }
}
);