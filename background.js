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
          `https://api.reddit.com/search.json?limit=100&sort=top&q=url:${request.videoId}+site:youtube.com&include_over_18=${request.includeNSFW}`]
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