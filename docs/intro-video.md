# Intro video (/intro)

The company intro video served at https://www.sonical.ai/intro/.

## Files

| File | What it is |
| --- | --- |
| `src/pages/intro.astro` | The page |
| `public/video/sonical-intro.mp4` | The video, 1080p H.264 |
| `public/video/sonical-intro-poster.jpg` | Poster frame, 1920x1080 |

## Why the video is re-encoded

The master is `Sonical - Intro Video.mp4` in Gary's Google Drive
(`1Nyp8PQeZCZ_zWNb_g-V_0NcSIAWfg4vy`): 4K HEVC, 30fps, 16.2 Mbps, 5:42, 700 MB.

Two reasons it cannot be served as-is:

1. **HEVC does not play in most browsers.** Chrome and Firefox will not decode
   it on most machines. It has to be H.264.
2. **700 MB will not fit the workflow.** GitHub hard-rejects any file over
   100 MB, and Netlify's free tier includes 100 GB of bandwidth a month, which
   700 MB per view would exhaust in about 140 plays.

So the committed file is 1080p H.264, two-pass at 1800 kbps, which lands near
80 MB and stays inside both limits.

## Re-encoding a new cut

Replace `SRC` with the new master and run:

```bash
SRC="/path/to/new-master.mp4"
OUT="public/video/sonical-intro.mp4"

ffmpeg -y -hwaccel videotoolbox -i "$SRC" \
  -c:v libx264 -preset slow -b:v 1800k -pass 1 -passlogfile /tmp/x264pass \
  -vf "scale=1920:1080:flags=lanczos" -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 60 -an -f mp4 /dev/null

ffmpeg -y -hwaccel videotoolbox -i "$SRC" \
  -c:v libx264 -preset slow -b:v 1800k -pass 2 -passlogfile /tmp/x264pass \
  -vf "scale=1920:1080:flags=lanczos" -profile:v high -level 4.0 -pix_fmt yuv420p \
  -g 60 -c:a aac -b:a 128k -ac 2 -movflags +faststart "$OUT"
```

`-movflags +faststart` puts the index at the front of the file so playback
starts before the whole thing has downloaded. Do not drop it.

Then check the output is under 100 MB, refresh the poster frame, and update the
runtime shown in `intro.astro` if the length changed.

If a future cut is long enough that 1800 kbps looks soft, the answer is a
streaming host (Vimeo, Cloudflare Stream, Bunny Stream), not a bigger file in
the repo.

## Do not put the video inside a clipping wrapper

The rounded corners go on the `<video>` element itself. They must **not** go on
a parent with `overflow: hidden`.

The first version wrapped the video in a rounded, `overflow:hidden` div with a
large `box-shadow`. A clipping ancestor forces the browser off its hardware
video-overlay path and onto a masked software raster, and the video went badly
blocky whenever the page was scrolled during playback. Reported by Ollie,
2 Sep 2026; moving the rounding onto the video fixed it.

Worth knowing that the file was not at fault: VMAF against the 4K master scores
the shipped encode at mean 93.3 over all 10,275 frames, worst single frame 78.0,
with no frame below 80. If the video ever looks blocky again, check the
compositing before re-encoding.

## Keeping it unlisted

`/intro` is reachable by link only. Four things hold that:

- no link to it from any nav, footer or page
- `noindex, nofollow` meta, set by the `noindex` prop on `Page.astro`
- `X-Robots-Tag` header in `netlify.toml`
- absent from `public/sitemap.xml`

Do **not** add `/intro` to `robots.txt`. A `Disallow` there stops crawlers
fetching the page, which means they never read the `noindex` meta, and Google
can still index a blocked URL it finds linked elsewhere.

This is obscurity, not access control. Anyone with the link can forward it.
Real gating means Netlify password protection, which needs a paid plan.
