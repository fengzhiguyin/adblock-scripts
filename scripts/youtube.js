// built at Sun May  3 03:38:16 UTC 2026
(function () {
  console.log("youtube clean active");

  let body = $response.body;

  try {
    let obj = JSON.parse(body);

    if (obj?.adPlacements) {
      obj.adPlacements = [];
    }

    if (obj?.playerAds) {
      obj.playerAds = [];
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
