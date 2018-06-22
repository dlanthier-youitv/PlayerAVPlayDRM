(function() {
	'use strict';

	/**
	 * Displays logging information on the screen and in the console.
	 * 
	 * @param {string}
	 *            msg - Message to log.
	 */
	function log(msg) {
		var logsEl = document.getElementById('logs');

		if (msg) {
			// Update logs
			console.log('[PlayerAvplayDRM]: ', msg);
			logsEl.innerHTML += msg + '<br />';
		} else {
			// Clear logs
			logsEl.innerHTML = '';
		}

		logsEl.scrollTop = logsEl.scrollHeight;
	}

	var player;

	// flag to monitor UHD toggling
	var uhdStatus = false;

	// Configuration data for different DRM systems
	/**
	 * 
	 * @property {String} name - name to be displayed in UI
	 * @property {String} url - content url
	 * @property {String} licenseServer - [Playready/Widevine] url to the
	 *           license server
	 * @property {String} customData - [Playready] extra data to add to the
	 *           license request
	 */
	var drms = {
		NO_DRM : {
			name : 'Smooth No DRM 1',
			url : 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest'
		},
		HLS_NO_DRM: {
			name: 'Apple HLS',
			url: 'http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8'
		},
		ENVIVIO_NO_DRM: {
			name: 'Envivio No DRM',
			url: 'http://dash.edgesuite.net/envivio/dashpr/clear/Manifest.mpd'
		},
//		DASH_NO_DRM: {
//			name: 'DASH No DRM',
//			url: 'http://amssamples.streaming.mediaservices.windows.net/683f7e47-bd83-4427-b0a3-26a6c4547782/BigBuckBunny.ism/manifest(format=mpd-time-csf)'
//		},
//		SMOOTH_NO_DRM: {
//			name: 'Smooth No DRM 2',
//			url: 'http://amssamples.streaming.mediaservices.windows.net/683f7e47-bd83-4427-b0a3-26a6c4547782/BigBuckBunny.ism/manifest'
//		},
		DASH_FILMSTRUCK: {
			name: 'Filmstruck',
			url: 'https://edc-test.cdn.turner.com/DASH_MontereyPop_0011/3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c000014d4/master.mpd'
		},
//		MS_SMOOTH_PLAYREADY: {
//			name: 'Smooth + PR',
//			url: 'http://test.playready.microsoft.com/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
//			licenseServer: 'http://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:150)'
//		},
//		MS_DASH_DRM: {
//			name: 'MS Dash + PR',
//			url: 'http://profficialsite.origin.mediaservices.windows.net/c51358ea-9a5e-4322-8951-897d640fdfd7/tearsofsteel_4k.ism/manifest(format=mpd-time-csf)',
//			licenseServer: 'http://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:150)'
//		},
//		MS_SMOOTH_PLAYREADY2: {
//			name: 'Alt Smooth + PR',
//			url: 'http://profficialsite.origin.mediaservices.windows.net/09e36702-8f33-436c-a5dd-60ffe6671e70/SuperSpeedway_720PR.ism/manifest',
//			licenseServer: 'http://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:150)'
//		},
//		TTV_DASH_1: {
//			name: 'Toutv Dragons S7E1',
//			url: 'https://rcavtoutv.akamaized.net/62fae1b2-1b31-467c-939a-9980e133e0d2/2018-04-18_20_00_00_dragon_0066.ism/manifest(filter=3000,format=mpd-time-csf)',
//			licenseServer: 'https://rcavtoutv-key.akamaized.net/PlayReady/',
//			token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cm46bWljcm9zb2Z0OmF6dXJlOm1lZGlhc2VydmljZXM6Y29udGVudGtleWlkZW50aWZpZXIiOiIyYzk1ZTE4Zi03NTFiLTQ0NTQtOTg5Yi1jZjMwMDczZTAwNTQiLCJpc3MiOiJodHRwczovL3NlcnZpY2VzLnJhZGlvLWNhbmFkYS5jYS8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0LyIsImV4cCI6MTUzNDI2ODM4MCwibmJmIjoxNTI5MDg0MDgwfQ.JbceJeJ_LdAyjOQJM_Yurm5xNm0GOh3-B26w05CgjIU'
//		},
		TTV_DASH_2: {
			name: 'Toutv Dragons S7E1alt',
			url: 'https://rcavtoutv.akamaized.net/62fae1b2-1b31-467c-939a-9980e133e0d2/2018-04-18_20_00_00_dragon_0066.ism/manifest(format=mpd-time-csf)',
			licenseServer: 'https://rcavtoutv-key.akamaized.net/PlayReady/',
			token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cm46bWljcm9zb2Z0OmF6dXJlOm1lZGlhc2VydmljZXM6Y29udGVudGtleWlkZW50aWZpZXIiOiIyYzk1ZTE4Zi03NTFiLTQ0NTQtOTg5Yi1jZjMwMDczZTAwNTQiLCJpc3MiOiJodHRwczovL3NlcnZpY2VzLnJhZGlvLWNhbmFkYS5jYS8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0LyIsImV4cCI6MTUzNDc3NzAwOCwibmJmIjoxNTI5NTkyNzA4fQ.65Efmyxd1FCHZr1b3J0JscXMGufTVWfB2ihzGN-VE0w'
		},
		TTV_SMOOTH: {
			name: 'Toutv Dragons S7E1 Smooth',
			url: 'https://rcavtoutv.akamaized.net/62fae1b2-1b31-467c-939a-9980e133e0d2/2018-04-18_20_00_00_dragon_0066.ism/manifest',
			licenseServer: 'https://rcavtoutv-key.akamaized.net/PlayReady/',
			token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cm46bWljcm9zb2Z0OmF6dXJlOm1lZGlhc2VydmljZXM6Y29udGVudGtleWlkZW50aWZpZXIiOiIyYzk1ZTE4Zi03NTFiLTQ0NTQtOTg5Yi1jZjMwMDczZTAwNTQiLCJpc3MiOiJodHRwczovL3NlcnZpY2VzLnJhZGlvLWNhbmFkYS5jYS8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0LyIsImV4cCI6MTUzNDc3NzAwOCwibmJmIjoxNTI5NTkyNzA4fQ.65Efmyxd1FCHZr1b3J0JscXMGufTVWfB2ihzGN-VE0w'
		},
		PLAYREADY : {
			name : 'Playready',
			url : 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
			licenseServer : 'http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1',
			customData : ''
		},
		PLAYREADY_GET_CHALLENGE : {
			name : 'Playready GetChallenge',
			url : 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
			licenseServer : '',
			customData : ''
		},
		WIDEVINE : {
			name : 'Widevine',
			url : 'http://commondatastorage.googleapis.com/wvmedia/starz_main_720p_6br_tp.wvm',
			licenseServer : 'https://license.uat.widevine.com/getlicense/widevine',
			customData : ''
		},
		DASH_SUBTITLES : {
			name : 'Subtitles',
			url: 'http://irtdashreference-i.akamaihd.net/dash/live/901161/bfs/manifestARD.mpd'
		}

	/* Smooth Streaming examples */
	// url:
	// 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
	// url:
	// 'http://playready.directtaps.net/smoothstreaming/TTLSS720VC1/To_The_Limit_720.ism/Manifest',
	/* Smooth Streaming + Playready example */
	// url:
	// "http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest",
	// licenseServer:
	// 'http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1'
	};

	/**
	 * Register keys used in this application
	 */
	function registerKeys() {
		var usedKeys = [ 'MediaPause', 'MediaPlay', 'MediaPlayPause',
				'MediaFastForward', 'MediaRewind', 'MediaStop', '0', '1', '2',
				'3' ];

		usedKeys.forEach(function(keyName) {
			tizen.tvinputdevice.registerKey(keyName);
		});
	}

	/**
	 * Handle input from remote
	 */
	function registerKeyHandler() {
		document.addEventListener('keydown', function(e) {
			switch (e.keyCode) {
			case 13: // Enter
				player.toggleFullscreen();
				break;
			case 38: // UP arrow
				switchDrm('up');
				break;
			case 40: // DOWN arrow
				switchDrm('down');
				break;
			case 10252: // MediaPlayPause
			case 415: // MediaPlay
			case 19: // MediaPause
				player.playPause();
				break;
			case 413: // MediaStop
				player.stop();
				break;
			case 417: // MediaFastForward
				player.ff();
				break;
			case 412: // MediaRewind
				player.rew();
				break;
			case 48: // key 0
				log();
				break;
			case 49: // Key 1
				//setUhd();
				player.enableHardcodedSubtitles();
				break;
			case 50: // Key 2
				player.getTracks();
				player.enableHardcodedSubtitles();
				break;
			case 51: // Key 3
				log('getting properties');
				player.getProperties();
				break;
			case 52: // Key 4
				player.enableHardcodedSubtitles(true);
				break;
			case 10009: // Return
				if (webapis.avplay.getState() !== 'IDLE'
						&& webapis.avplay.getState() !== 'NONE') {
					player.stop();
				} else {
					tizen.application.getCurrentApplication().hide();
				}
				break;
			default:
				log("Unhandled key: " + e.keyCode);
			}
		});
	}

	/**
	 * Display application version
	 */
	function displayVersion() {
		var el = document.createElement('div');
		el.id = 'version';
		el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
		document.body.appendChild(el);
	}

	function registerMouseEvents() {
		document
				.querySelector('.video-controls .play')
				.addEventListener(
						'click',
						function() {
							player.playPause();
							document.getElementById('streamParams').style.visibility = 'visible';
						});
		document
				.querySelector('.video-controls .stop')
				.addEventListener(
						'click',
						function() {
							player.stop();
							document.getElementById('streamParams').style.visibility = 'hidden';
						});
		document.querySelector('.video-controls .pause').addEventListener(
				'click', player.playPause);
		document.querySelector('.video-controls .ff').addEventListener('click',
				player.ff);
		document.querySelector('.video-controls .rew').addEventListener(
				'click', player.rew);
		document.querySelector('.video-controls .fullscreen').addEventListener(
				'click', player.toggleFullscreen);
	}

	/**
	 * Create drm switching list
	 */
	function createDrmList() {
		var drmParent = document.querySelector('.drms');
		var currentDrm;
		var li;
		for ( var drmID in drms) {
			li = document.createElement('li');
			li.className = li.innerHTML = drms[drmID].name;
			li.dataset.drm = drmID;
			drmParent.appendChild(li);
		}
		currentDrm = drmParent.firstElementChild;
		currentDrm.classList.add('drmFocused');
	}

	/**
	 * Enabling uhd manually in order to play uhd streams
	 */
	function setUhd() {
		if (!uhdStatus) {
			if (webapis.productinfo.isUdPanelSupported()) {
				log('4k enabled');
				uhdStatus = true;
			} else {
				log('this device does not have a panel capable of displaying 4k content');
			}
		} else {
			log('4k disabled');
			uhdStatus = false;
		}
		player.setUhd(uhdStatus);
	}

	/**
	 * Changes drm settings according to user's action
	 * 
	 * @param {String}
	 *            direction - 'up' or 'down'
	 */
	function switchDrm(direction) {
		var drmParent = document.querySelector('.drms');
		var currentDrm = drmParent.querySelector('.drmFocused');

		currentDrm.classList.remove('drmFocused');
		if (direction === 'up') {
			if (currentDrm === drmParent.firstElementChild) {
				currentDrm = drmParent.lastElementChild;
			} else {
				currentDrm = currentDrm.previousElementSibling;
			}
		} else if (direction === 'down') {
			if (currentDrm === drmParent.lastElementChild) {
				currentDrm = drmParent.firstElementChild;
			} else {
				currentDrm = currentDrm.nextElementSibling;
			}
		}
		currentDrm.classList.add('drmFocused');
		player.setChosenDrm(drms[currentDrm.dataset.drm]);
	}

	/**
	 * Function initialising application.
	 */
	window.onload = function() { 
		log('Danhack - window loaded');

		if (window.tizen === undefined) {
			log('This application needs to be run on Tizen device');
			return;
		}

		/**
		 * Player configuration object.
		 * 
		 * @property {Object} drms - object containing drm configurations
		 * @property {HTML Element} player - application/avplayer object
		 * @property {HTML Div Element} controls - player controls
		 * @property {HTLM Div Element} info - place to display stream info
		 * @property {Function} logger - function to use for logging within
		 *           player component
		 * 
		 */
		var config = {
			drms : drms,
			player : document.getElementById('av-player'),
			controls : document.querySelector('.video-controls'),
			info : document.getElementById('info'),
			logger : log
		};

		displayVersion();
		createDrmList();
		registerKeys();
		registerKeyHandler();

		// Check the screen width so that the AVPlay can be scaled accordingly
		tizen.systeminfo.getPropertyValue("DISPLAY", function(display) {
			log("The display width is " + display.resolutionWidth);
			config.resolutionWidth = display.resolutionWidth;

			// initialize player - loaded from videoPlayer.js
			player = new VideoPlayer(config);
			registerMouseEvents();
		}, function(error) {
			log("An error occurred " + error.message);
		});
	}
}());
