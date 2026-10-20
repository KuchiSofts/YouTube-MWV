# <img src="YouTube-MWV-icon.png" alt="" height="32" align="top"> YouTube-MWV

**Mouse-wheel volume for YouTube.** Scroll over the video to change the volume, and the script remembers your level for the next video.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0-FF0000.svg)](https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV.user.js)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-supported-00485B.svg)](https://www.tampermonkey.net/)
[![Violentmonkey](https://img.shields.io/badge/Violentmonkey-supported-1E88E5.svg)](https://violentmonkey.github.io/)

## Features

- **Wheel volume.** Scroll over the player to change the volume in 5% steps (1% with <kbd>Shift</kbd>).
- **Volume display.** A small "Volume 45%" label appears inside the player and fades out.
- **Saved volume.** Your volume is saved in `localStorage` and applied once to each new video. Changes you make with YouTube's own slider are saved too.
- **Smart mute.** Scrolling down to 0% mutes the video, and scrolling up unmutes it.
- **Uses YouTube's player API.** The volume is changed through YouTube's own player, so its slider and icon stay in sync.
- **Stays out of your way.** The page, comments and Shorts scroll normally, <kbd>Ctrl</kbd>+wheel still zooms, and no keyboard shortcuts are changed.

## Install

1. Install a userscript manager: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click **[Install YouTube-MWV](https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV.user.js)** and confirm.

Updates install automatically through your userscript manager.

## Usage

| Action | Where | Result |
| --- | --- | --- |
| Mouse wheel up / down | Over the video player | Volume +5% / -5% |
| <kbd>Shift</kbd> + wheel | Over the video player | Volume +1% / -1% |
| Wheel | Anywhere else | Normal page scrolling |

YouTube's built-in keys still work as usual. <kbd>↑</kbd> / <kbd>↓</kbd> change the volume and <kbd>M</kbd> mutes.

## Settings

Edit the `CONFIG` object at the top of the script:

| Setting | Default | Description |
| --- | --- | --- |
| `step` | `5` | Percent per wheel notch |
| `fineStep` | `1` | Percent per notch with <kbd>Shift</kbd> |
| `wheelThrottleMs` | `30` | Minimum time between steps, which smooths touchpads |
| `osdTimeout` | `1000` | How long the volume label stays visible, in ms |

Edits you make to the script are overwritten by updates. To keep them, turn off auto-update for this script in your manager.

## Compatibility

- Chrome, Edge, Brave, Opera and Firefox (desktop) with Tampermonkey or Violentmonkey
- `www.youtube.com` (watch pages, theater mode, fullscreen and the miniplayer) and embedded players (`youtube.com/embed`, `youtube-nocookie.com/embed`)
- Not active on `m.youtube.com` or in the Shorts player

## Troubleshooting

**The volume doesn't change when I scroll.** The cursor has to be over the video itself. Scrolling over the settings menu still scrolls that menu. Reload the page after installing or updating.

**The saved volume isn't restored in embeds on other sites.** Browsers may partition or block storage inside third-party iframes, so embeds can't always read the saved volume.

**I upgraded from 1.x.** Your saved volume (`YouTubeVolume`) is kept. The step is now 5% per notch. Hold <kbd>Shift</kbd> for the old 1% steps, or set `step: 1`.

## Changelog

**2.0**
- Rewritten on YouTube's player API, so it no longer fights YouTube's own volume slider.
- Only active over the player. The home page, search and comments scroll normally, and there are no errors on pages without a video.
- Applies the saved volume once per video instead of every 500 ms.
- New volume label (OSD) that fades out.
- Removes the duplicate arrow-key, A/D seek and debug-logging handlers.
- Adds support for embedded players and removes old Google+ matches.

## Contributing

Issues and pull requests are welcome. To report a bug, open an [issue](https://github.com/KuchiSofts/YouTube-MWV/issues) with your browser, userscript manager and the page URL. For pull requests, keep the existing code style and bump `@version` in the script.

## License

[MIT](LICENSE) © KuchiSofts
