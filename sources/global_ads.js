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
