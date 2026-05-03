(function () {
  console.log("YouTube ad clean active");

  let body = $response.body;

  try {
    let obj = JSON.parse(body);

    if (obj.adPlacements) obj.adPlacements = [];
    if (obj.playerAds) obj.playerAds = [];

    if (obj?.contents?.twoColumnWatchNextResults) {
      delete obj.contents.twoColumnWatchNextResults.secondaryResults;
    }

    $done({ body: JSON.stringify(obj) });

  } catch (e) {
    console.log("parse fail");
    $done({});
  }
})();
