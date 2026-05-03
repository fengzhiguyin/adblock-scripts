// built at Sun May  3 03:40:40 UTC 2026
(function () {
  console.log("Global ad clean active");

  let body = $response.body;

  try {
    body = body.replace(/"ad_[^"]+"/g, "");
    body = body.replace(/"ads":\{.*?\}/g, "");
    body = body.replace(/"advertisement"\s*:\s*true/g, "");

    $done({ body });
  } catch (e) {
    $done({});
  }
})();
