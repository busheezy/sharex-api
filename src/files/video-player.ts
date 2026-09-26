import type { File } from "./entities/file.entity";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderVideoPlayer(file: File, pageUrl: URL): string {
  const videoUrl = new URL(pageUrl);
  videoUrl.pathname = pageUrl.pathname.replace(/\/watch$/, "/video");
  const downloadUrl = new URL(pageUrl);
  downloadUrl.pathname = pageUrl.pathname.replace(/\/watch$/, "");
  const title = escapeHtml(file.originalFileName);
  const canonicalUrl = escapeHtml(pageUrl.href);
  const streamUrl = escapeHtml(videoUrl.href);
  const downloadHref = escapeHtml(downloadUrl.href);
  const fileType = escapeHtml(file.fileType);

  return `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:description" content="Watch ${title}">
  <meta property="og:video" content="${streamUrl}">
  <meta property="og:video:url" content="${streamUrl}">
  <meta property="og:video:type" content="${fileType}">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #111318; color: #f4f4f5; }
    main { width: min(100% - 2rem, 72rem); padding: 2rem 0; }
    h1 { font-size: 1.25rem; overflow-wrap: anywhere; }
    video { display: block; width: 100%; max-height: 80vh; background: #000; border-radius: .5rem; }
    a { color: #a5c9ff; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <video controls playsinline preload="metadata" aria-label="${title}">
      <source src="${streamUrl}" type="${fileType}">
      Your browser does not support video playback.
    </video>
    <p><a href="${downloadHref}">Download video</a></p>
    <p>If playback is unavailable, download the video to watch it.</p>
  </main>
</body>
</html>`;
}
