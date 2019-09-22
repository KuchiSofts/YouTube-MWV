// ==UserScript==
// @name            YouTube-MWV
// @namespace       http://kuchi.be/
// @version         1.2
// @description     Control YouTube volume by scrolling mouse wheel up and down and saving the volume settings by Kuchi - Soft's
// @author          Kuchi - Soft's
// @defaulticon     https://github.com/KuchiSofts/YouTube-MWV/raw/master/YouTube-MWV-icon.png
// @icon            https://github.com/KuchiSofts/YouTube-MWV/raw/master/YouTube-MWV-icon.png
// @updateURL       https://github.com/KuchiSofts/YouTube-MWV/raw/master/YouTube-MWV.user.js
// @downloadURL     https://github.com/KuchiSofts/YouTube-MWV/raw/master/YouTube-MWV.user.js
// @match           *://*.youtube.com/*
// @match           *://youtube.com/*
// @match           *://s.ytimg.com/yts/jsbin/*
// @match           *://apis.google.com/*/widget/render/comments?*
// @match           *://plus.googleapis.com/*/widget/render/comments?*
// @include         *://*.youtube.com/*
// @include         *://youtube.com/*
// @include         *://apis.google.com/*/widget/render/comments?*
// @include         *://plus.googleapis.com/*/widget/render/comments?*
// @exclude         *://apiblog.youtube.com/*
// @exclude         *://*.youtube.com/subscribe_embed?*
// @run-at          document-end
// @grant           none
// @priority        9000
// ==/UserScript==

var YouTubePlayer = document.getElementsByClassName('video-stream html5-main-video')[0];
var volume = null;
var YTvolume = null;
var SliderVal = null;
var volSlider = document.body.querySelector(".ytp-volume-slider");
var VolDivF = null;
var VolDivShow = false;
var TimeOutVol = null;

if(localStorage.getItem('YouTubeVolume')){
    volume = localStorage.getItem('YouTubeVolume');
    SliderVal = volume * 0.4;
}

window.addEventListener('wheel', function(e) {
	YouTubePlayer = document.getElementsByClassName('video-stream html5-main-video')[0];
	volume = YouTubePlayer.volume;
    blockscroll();
  if (e.deltaY < 0) {
    if(e.target.className.includes("video-stream html5-main-video") || e.target.className.includes("html5-main-video") || e.target.className.includes("ytp-button")){
     setVolUp();
    }
  }

  if (e.deltaY > 0) {
    if(e.target.className.includes("video-stream html5-main-video") || e.target.className.includes("html5-main-video") || e.target.className.includes("ytp-button")){
		setVolDown();
    }
  }

	setVolFinish();
	showVolDiv();

}, false);

window.addEventListener("keydown",function(e){
	//console.log(e.target);
	if(e.target.className.includes("html5-video-player")){
		if(e.key == 'ArrowUp'){
			setVolUp();
		}else if(e.key == 'ArrowDown'){
			setVolDown();
		}
		setVolFinish();
		showVolDiv();
	}
  if (e.key === ' ' || e.key === 'Spacebar') {
    blockscroll();
  }

}, false);

function showVolDiv() {
		var VolDivF = document.body.querySelector("div.ytp-bezel-text-wrapper > div.ytp-bezel-text");
		VolDivF.innerText = Math.round(parseFloat(volume) * 100) + '%';
		VolDivF.parentElement.parentElement.style.display = "";
        VolDivShow = true;
        if(VolDivShow){
            clearInterval(TimeOutVol);
            TimeOutVol = setTimeout(function(){ VolDivF.parentElement.parentElement.style.display = "none"; VolDivShow = false;}, 3000);
        }	
}

function setVolFinish() {
	try{
		YouTubePlayer.volume = parseFloat(volume).toFixed(2);
		localStorage.setItem('YouTubeVolume', volume);
		document.getElementsByClassName("ytp-volume-panel")[0].setAttribute("aria-valuenow", volume * 100);
		document.getElementsByClassName("ytp-volume-panel")[0].setAttribute("aria-valuetext", volume * 100 + '% volume');
		document.getElementsByClassName("ytp-volume-slider-handle")[0].setAttribute("style", "left:" + volume * 40 + "px;");
		document.body.querySelector("button.ytp-mute-button > svg > path.ytp-svg-fill").setAttribute("d", ytVolumeIcon(volume));

	}catch(e){
		if(e){
			// If fails, Do something else
		}
	}
}

function setVolDown() {
	if(volume >= 0.01){
		YouTubePlayer.muted = false;
		volume = volume - 0.01;
		SliderVal = YouTubePlayer.volume * 100;
		console.log('YouTube Volume Set To:' + volume);
	}else{
		volume = 0;
		YouTubePlayer.muted = true;
		SliderVal = 0;
		console.log('YouTube Volume Set To: Mute');
	}
}

function setVolUp() {
	YouTubePlayer.muted = false;
	if(volume >= 0.99){
		volume = 1;
		SliderVal = 100;
		console.log('YouTube Volume Set To Max');
	}else{
		volume = parseFloat(volume) + 0.01;
		SliderVal = YouTubePlayer.volume * 100;
		console.log('YouTube Volume Set To:' + volume);
	}	
}

function ytVolumeIcon(volume) {
    if (volume <= 0) return "m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z";
    else if (volume >= 0.5) return "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z";
    else return "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z";
}

function blockscroll() {
    if(document.getElementById('player') !== null){
        document.getElementById('player').onwheel = function(){ return false; }
    }

    if(document.getElementById('player-container-outer') !== null){
        document.getElementById('player-container-outer').onwheel = function(){ return false; }
    }
}

    var interval = setInterval (function() {
		if('complete' == document.readyState && YTvolume === null){
			blockscroll();

			if(localStorage.getItem('YouTubeVolume')){
				volume = localStorage.getItem('YouTubeVolume');
				SliderVal = volume * 0.4;
					try{

					setVolFinish();
					//clearInterval(interval);
					//interval = null;
					}catch(e){
						if(e){
						// If fails, Do something else
						}
					}
			}
		}
	}
                 , 500);



