$(function () {
  'use strict';

  var button = $('#ctaVideo');
  var md = new MobileDetect(window.navigator.userAgent);

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

  var coverInstance = $('#videoRevealCover');

  var cover = {
    hide: function () {
      console.log('cover:hide');
      coverInstance.hide();
    },
    show: function () {
      console.log('cover:show');
      coverInstance.fadeIn(1000, function () {
        console.log('in');
      });
    }
  }

  var reveal = {
    load: function () {
      console.log('reveal:load');
      var deferred = Q.defer();
      // Wait a few seconds, because the browser tries to do too much at once
      setTimeout(function () {
        // Load reveal video - will be shown when action is taken
        if (md.mobile()) {
          jwsettings = {};
        }
        jwsettings.playlist = '//content.jwplatform.com/feed/8XABftQB.rss';
        jwsettings.autostart = 'false';
        jwsettings.repeat = 'false';
        jwplayer('videoReveal').setup(jwsettings);
      }, 1000);
      return deferred.promise;
    },
    play: function () {
      console.log('reveal:play');
      var deferred = Q.defer();
      jwplayer('videoReveal').play();
      jwplayer('videoReveal').onBuffer(function () {
        setTimeout(function () {
          deferred.resolve();
        }, 500)
      });
      return deferred.promise;
    }
  }

  var lobby = {
    hide: function () {
      console.log('lobby:hide');
      var deferred = Q.defer();
      setTimeout(function () {
        button.fadeOut(500);
        $('#videoLobby').fadeOut(750, function () {
          deferred.resolve();
        });
      }, 1000);
      return deferred.promise;
    },
    loadAndPlay: function () {
      console.log('lobby:loadAndPlay');
      var deferred = Q.defer();
      // Load lobby video - before action is taken
      jwsettings.playlist = '//content.jwplatform.com/feed/trgRuzuX.rss';
      jwplayer('videoLobby').setup(jwsettings);
      // When the lobby video is playing, we can introduce the load overhead
      // of the second video. This will just get the video ready
      jwplayer('videoLobby').onBuffer(function () {
        deferred.resolve();
      });
      return deferred.promise;
    },
    pause: function () {
      console.log('lobby:pause');
      jwplayer('videoLobby').pause();
      return true;
    },
    play: function () {
      console.log('lobby:play');
      jwplayer('videoLobby').play();
      return true;
    },
    show: function () {
      console.log('lobby:show');
      var deferred = Q.defer();
      // Reveal the video when the dust settles
      setTimeout(function () {
        deferred.resolve();
        $('.container-video').animate({
          opacity: 1
        }, 500);
      }, 500);
      return deferred.promise;
    }
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

    if (!md.mobile()) {
      lobby.hide()
        .then(cover.show)
    } else {
      lobby.hide()
        .then(lobby.pause)
        .then(reveal.play)
        .then(cover.hide)
    }
    // .then(cueFadeOut)
    // .then(fadeOutRevealVideoAndPause)
    // .then(playLobbyVideo)
    // .done();
  });

  // Init
  (function () {
    // Get user in ready state
    if (md.mobile()) {
      console.log(md.mobile());
      console.log(434343);
      lobby.loadAndPlay()
        .then(lobby.show)
        .then(reveal.load)
        .done();
    }
  })();
});
