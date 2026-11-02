// Permanent redirects between domains. Keeps the path and query.
const TARGETS = {
  "www.kyleyan.me": "kyleyan.me",
  "kyleyan.com": "kyleyan.me",
  "www.kyleyan.com": "kyleyan.me",
  "www.skyward.moe": "skyward.moe",
};

export default {
  fetch(request) {
    const url = new URL(request.url);
    const target = TARGETS[url.hostname];
    if (!target) return new Response("Not found", { status: 404 });
    url.hostname = target;
    return Response.redirect(url.toString(), 301);
  },
};
