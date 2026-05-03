(function () {
  console.log("global ad clean active");

  let body = $response.body;

  try {
    body = body.replace(/"ad_[^"]+"/g, "");
    body = body.replace(/"ads":\{.*?\}/g, "");

    $done({ body });
  } catch (e) {
    $done({});
  }
})();
