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
