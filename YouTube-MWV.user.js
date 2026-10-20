// ==UserScript==
// @name            YouTube-MWV
// @namespace       http://kuchi.be/
// @version         2.0
// @description     Control YouTube volume by scrolling mouse wheel up and down over the player and saving the volume settings by Kuchi - Soft's
// @author          Kuchi - Soft's
// @license         MIT
// @defaulticon     https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV-icon.png
// @icon            https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV-icon.png
// @homepageURL     https://github.com/KuchiSofts/YouTube-MWV
// @supportURL      https://github.com/KuchiSofts/YouTube-MWV/issues
// @updateURL       https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV.user.js
// @downloadURL     https://raw.githubusercontent.com/KuchiSofts/YouTube-MWV/master/YouTube-MWV.user.js
// @match           https://www.youtube.com/*
// @match           https://www.youtube-nocookie.com/embed/*
// @exclude         https://www.youtube.com/subscribe_embed?*
// @run-at          document-end
// @grant           none
// ==/UserScript==

(function() {
    'use strict';

    var CONFIG = {
        step: 5,            // Volume change per wheel notch, in percent
        fineStep: 1,        // Volume change per notch while holding Shift, in percent
        wheelThrottleMs: 30, // Minimum time between two steps (smooths touchpads)
        osdTimeout: 1000,   // How long the volume display stays visible, in ms
        storageKey: 'YouTubeVolume' // Saved as 0..1 (same key/format as v1.x)
    };

    // Areas inside the player that scroll on their own (settings menu, panels)
    var IGNORE_SELECTOR = '.ytp-popup, .ytp-settings-menu, .ytp-panel-menu, .ytp-chapter-hover-container';

    var lastWheelTime = 0;
    var osdTimeout = null;
    var appliedVideoId = null;
    var applying = false;

    // ---------- Storage ----------

    function loadVolume() {
        try {
            var saved = localStorage.getItem(CONFIG.storageKey);
            if (saved === null) return null;
            var value = parseFloat(saved);
            if (isNaN(value)) return null;
            return Math.round(Math.min(Math.max(value, 0), 1) * 100);
        } catch (e) {
            return null;
        }
    }

    function saveVolume(percent) {
        try {
            localStorage.setItem(CONFIG.storageKey, String(percent / 100));
        } catch (e) {
            // Storage blocked (private mode / third-party iframe) - nothing to do
        }
    }

    // ---------- Player ----------

    // YouTube's main player element exposes getVolume/setVolume/isMuted/unMute
    function getPlayer() {
        var player = document.getElementById('movie_player');
        if (!player || typeof player.setVolume !== 'function' || typeof player.getVolume !== 'function') {
            return null;
        }
        return player;
    }

    function getVideoId(player) {
        try {
            var data = typeof player.getVideoData === 'function' ? player.getVideoData() : null;
            return data && data.video_id ? data.video_id : null;
        } catch (e) {
            return null;
        }
    }

    // Apply the saved volume once per loaded video
    function applySavedVolume() {
        var player = getPlayer();
        if (!player) return;

        var videoId = getVideoId(player);
        if (!videoId || videoId === appliedVideoId) return;

        var saved = loadVolume();
        appliedVideoId = videoId;
        if (saved === null) return;

        if (Math.round(player.getVolume()) !== saved) {
            applying = true;
            player.setVolume(saved);
            setTimeout(function() { applying = false; }, 0);
        }
    }

    function changeVolume(player, delta) {
        var current = Math.round(player.getVolume());
        var muted = typeof player.isMuted === 'function' && player.isMuted();
        var next = Math.min(Math.max(current + delta, 0), 100);

        if (delta > 0 && muted && typeof player.unMute === 'function') {
            player.unMute();
            muted = false;
        }

        player.setVolume(next);

        if (next === 0 && !muted && typeof player.mute === 'function') {
            player.mute();
            muted = true;
        }

        if (next > 0) saveVolume(next);
        showOsd(player, muted ? 0 : next);
    }

    // ---------- Volume display (OSD) ----------

    function injectStyle() {
        if (document.getElementById('kmwv-style')) return;
        var style = document.createElement('style');
        style.id = 'kmwv-style';
        style.textContent =
            '.kmwv-osd{position:absolute;top:12%;left:50%;transform:translateX(-50%);z-index:70;' +
            'padding:8px 16px;border-radius:8px;background:rgba(0,0,0,.65);color:#fff;' +
            'font:500 18px/1.2 Roboto,Arial,sans-serif;pointer-events:none;opacity:0;' +
            'transition:opacity .25s ease;white-space:nowrap}' +
            '.kmwv-osd.kmwv-visible{opacity:1}';
        (document.head || document.documentElement).appendChild(style);
    }

    function showOsd(player, percent) {
        injectStyle();
        var osd = player.querySelector('.kmwv-osd');
        if (!osd) {
            osd = document.createElement('div');
            osd.className = 'kmwv-osd';
            player.appendChild(osd);
        }
        osd.textContent = percent === 0 ? 'Muted' : 'Volume ' + percent + '%';
        osd.classList.add('kmwv-visible');

        clearTimeout(osdTimeout);
        osdTimeout = setTimeout(function() {
            osd.classList.remove('kmwv-visible');
        }, CONFIG.osdTimeout);
    }

    // ---------- Events ----------

    window.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) return; // Keep browser zoom
        // Windows/Chrome turn Shift+wheel into horizontal scrolling (deltaX, deltaY = 0)
        var delta = e.shiftKey && e.deltaY === 0 ? e.deltaX : e.deltaY;
        if (delta === 0 || (!e.shiftKey && Math.abs(e.deltaX) > Math.abs(e.deltaY))) return;

        var target = e.target;
        if (!target || typeof target.closest !== 'function') return;

        var playerEl = target.closest('#movie_player');
        if (!playerEl || target.closest(IGNORE_SELECTOR)) return;

        var player = getPlayer();
        if (!player || player !== playerEl) return;

        // Only block page scrolling while the cursor is over the player
        e.preventDefault();

        var now = Date.now();
        if (now - lastWheelTime < CONFIG.wheelThrottleMs) return;
        lastWheelTime = now;

        var step = e.shiftKey ? CONFIG.fineStep : CONFIG.step;
        changeVolume(player, delta < 0 ? step : -step);
    }, { passive: false, capture: true });

    // Save volume changes made with YouTube's own slider / keys
    document.addEventListener('volumechange', function(e) {
        if (applying) return;
        var player = getPlayer();
        if (!player || !player.contains(e.target)) return;
        if (getVideoId(player) !== appliedVideoId) return; // Not restored yet for this video
        if (typeof player.isMuted === 'function' && player.isMuted()) return;
        var percent = Math.round(player.getVolume());
        if (percent > 0) saveVolume(percent);
    }, true);

    // Restore the saved volume when a video loads (also on SPA navigation)
    document.addEventListener('loadedmetadata', function(e) {
        var player = getPlayer();
        if (player && player.contains(e.target)) applySavedVolume();
    }, true);

    window.addEventListener('yt-navigate-finish', function() {
        setTimeout(applySavedVolume, 300);
    });

    applySavedVolume();
})();
