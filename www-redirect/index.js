// Sends www.<domain> to <domain>, keeping the path and query.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = url.hostname.replace(/^www\./, "");
    return Response.redirect(url.toString(), 301);
  },
};
