$(function () {
  'use strict';

  var button = $('#ctaVideo');

  // Set up defaults
  var jwsettings = {
    width: '100%',
    height: '100%',
    controls: 'false',
    aspectratio: '16:9',
    mute: true,
    primary: 'html5',
    autostart: true,
    repeat: true
  };

  var loadAndPlayLobbyVideo = function () {
    var deferred = Q.defer();

    // Wait a few seconds before loading the lobby video
    setTimeout(function () {

      // Load lobby video - before action is taken
      jwsettings.playlist = '//content.jwplatform.com/feed/trgRuzuX.rss';
      jwplayer('videoLobby').setup(jwsettings);

      // When the lobby video is playing, we can introduce the load overhead
      // of the second video. This will just get the video ready
      jwplayer('videoLobby').onBuffer(function () {
        deferred.resolve();
      });
    });

    return deferred.promise;
  };

  var revealTheLobbyVideo = function () {
    var deferred = Q.defer();

    // Reveal the video when the dust settles
    setTimeout(function () {
      deferred.resolve();
      $('.container-video').animate({
        opacity: 1
      }, 1000);
    }, 1000);

    return deferred.promise;
  };

  var loadRevealVideo = function () {
    var deferred = Q.defer();

    // Wait a few seconds, because the browser tries to do too much at once
    setTimeout(function () {

      // Load reveal video - will be shown when action is taken
      jwsettings.playlist = '//content.jwplatform.com/feed/8XABftQB.rss';
      jwsettings.autostart = 'false';
      jwsettings.repeat = 'false';
      jwplayer('videoReveal').setup(jwsettings);

      // We can show the CTA button when ready
      jwplayer('videoReveal').onReady(function () {
        deferred.resolve();
        button.animate({
          opacity: 1
        }, 1000);
      });
    }, 1000);

    return deferred.promise;
  };

  var playRevealVideo = function () {
    var deferred = Q.defer();

    jwplayer('videoReveal').play();
    jwplayer('videoReveal').onBuffer(function () {
      deferred.resolve();
    });

    return deferred.promise;
  }

  var fadeLobby = function () {
    var deferred = Q.defer();

    setTimeout(function () {
      button.fadeOut(1500);
      $('#videoLobby').fadeOut(1000, function () {
        deferred.resolve();
      });
    }, 1000);

    return deferred.promise;
  };

  var pauseLobbyVideo = function () {
    jwplayer('videoLobby').pause();
    return true;
  };

  var playLobbyVideo = function () {
    jwplayer('videoLobby').play();
    return true;
  };

  var cueFadeOut = function () {
    var deferred = Q.defer();

    setInterval(function () {
      jwplayer('videoReveal').onTime(function (data) {
        console.log(data.position, data.duration);
        if (data.position > data.duration - 1) {
          console.log('go');
          jwplayer('videoReveal').pause();
          deferred.resolve();
        }
      });
    }, 1000);

    return deferred.promise;
  };

  var fadeOutRevealVideoAndPause = function () {
    var deferred = Q.defer();

    jwplayer('videoLobby').seek(0);
    button.fadeIn(1500);
    var interval = setTimeout(function () {
      $('#videoLobby').fadeIn(1000, function () {
        jwplayer('videoLobby').play();
        jwplayer('videoReveal').seek(0);
        clearInterval(interval);
        deferred.resolve();
      });
    }, 500);

    return deferred.promise;
  };

  // ---------

  // Click action
  button.bind('click', function () {
    playRevealVideo()
      .then(fadeLobby)
      .then(pauseLobbyVideo)
      .then(cueFadeOut)
      .then(fadeOutRevealVideoAndPause)
      .then(playLobbyVideo)
      .done();
  });

  // Init
  (function () {
    // Get user in ready state
    loadAndPlayLobbyVideo()
      .then(revealTheLobbyVideo)
      .then(loadRevealVideo)
      .done();
  })();
});
