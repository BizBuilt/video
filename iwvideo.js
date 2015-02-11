$(function () {
  'use strict';

  /*
   * JW Player
   *
   * - Embed options: http://cl.ly/Zhz6
   * - JS reference: http://cl.ly/ZhNc
   */

  var ctaButtonInstance = $('#ctaVideo');
  var containerVideoInstance = $('.container-video');
  var coverInstance = $('#videoRevealCover');
  var animationDefaultMs;
  var jwSettings;
  var cover = {};
  var reveal = {};
  var containerVideo = {};
  var lobby = {};
  var videoRevealInstance = jwplayer('videoReveal');

  // JW Player defaults
  var jwDefaults = {
    both: {
      aspectratio: '16:9',
      displaytitle: false,
      height: '100%',
      primary: 'html5',
      width: '100%',
    },
    desktop: {
      autostart: true,
      controls: 'false',
      primary: 'html5',
    },
    mobile: {
      repeat: 'false'
    }
  };

  jwDefaults.mobile = _.extend({}, jwDefaults.mobile, jwDefaults.both);
  jwDefaults.desktop = _.extend({}, jwDefaults.desktop, jwDefaults.both);

  if (bowser.mobile) {
    animationDefaultMs = 0;
    jwSettings = jwDefaults.mobile;
  } else {
    animationDefaultMs = 1000;
    jwSettings = jwDefaults.desktop;
  }

  // ---

  containerVideo.hide = function () {
    console.log('containerVideo:hide');
    containerVideoInstance.animate({
      opacity: 0
    }, animationDefaultMs);
  };
  containerVideo.show = function () {
    console.log('containerVideo:show');
    containerVideoInstance.animate({
      opacity: 1
    }, animationDefaultMs);
  };

  // ---

  cover.hide = function () {
    console.log('cover:hide');
    coverInstance.hide();
  };
  cover.show = function () {
    console.log('cover:show');
    coverInstance.fadeIn(animationDefaultMs, function () {
      console.log('cover:show:complete');
    });
  };

  // ---

  var ctaButton = {};
  ctaButton.clicked = false;
  ctaButton.disable = function () {
    ctaButton.clicked = true;
  };
  ctaButton.enable = function () {
    ctaButton.clicked = false;
  };
  ctaButton.hide = function () {
    ctaButtonInstance.fadeOut(animationDefaultMs * 0.5);
  };
  ctaButton.show = function () {
    ctaButtonInstance.fadeIn(animationDefaultMs * 0.5);
  };

  // ---

  reveal.status = null;
  reveal.load = function () {
    console.log('reveal:load');
    reveal.status = 'loading';
    console.log('reveal:load:waiting');
    var deferred = Q.defer();
    // Wait a little bit, because the browser tries to do too much at once
    setTimeout(function () {
      console.log('reveal:load:loading');
      // Load reveal video - will be shown when action is taken
      jwSettings.playlist = '//content.jwplatform.com/feed/8XABftQB.rss';
      console.log(videoRevealInstance);
      videoRevealInstance.setup(jwSettings);
      videoRevealInstance.onReady(function () {
        console.log('reveal:load:ready');
        reveal.status = 'loaded';
        deferred.resolve();
      });
    }, 500);
    return deferred.promise;
  };
  reveal.play = function () {
    console.log('reveal:play');
    var deferred = Q.defer();
    videoRevealInstance.onBuffer(function () {
      console.log('trying to play');
      videoRevealInstance.play(true);
    });
    videoRevealInstance.play(true);
    return deferred.promise;
  };

  videoRevealInstance.onBufferChange(function () {
    console.log('BUFFER: ' + videoRevealInstance.getBuffer());
  });

  // ---

  lobby.hide = function () {
    console.log('lobby:hide');
    var deferred = Q.defer();
    setTimeout(function () {
      ctaButton.hide();
      $('#videoLobby').fadeOut(
        animationDefaultMs * 0.75,
        function () {
          deferred.resolve();
        });
    }, animationDefaultMs);
    return deferred.promise;
  };
  lobby.loadAndPlay = function () {
    console.log('lobby:loadAndPlay');
    var deferred = Q.defer();
    // Load lobby video - before action is taken
    var settings = {
      mute: true,
      playlist: '//content.jwplatform.com/feed/trgRuzuX.rss',
      repeat: true
    };
    jwplayer('videoLobby').setup(_.extend({}, jwSettings, settings));
    // When the lobby video is playing, we can introduce the load overhead
    // of the second video. This will just get the video ready
    jwplayer('videoLobby').onBuffer(function () {
      deferred.resolve();
    });
    return deferred.promise;
  };
  lobby.pause = function () {
    console.log('lobby:pause');
    jwplayer('videoLobby').pause();
    return true;
  };
  lobby.play = function () {
    console.log('lobby:play');
    jwplayer('videoLobby').play();
    return true;
  };
  lobby.show = function () {
    console.log('lobby:show');
    var deferred = Q.defer();
    // Reveal the video when the dust settles
    setTimeout(function () {
      deferred.resolve();
      containerVideo.show();
    }, 500);
    return deferred.promise;
  };

  // ---

  var transitionToLobby = function () {
    var deferred = Q.defer();
    videoRevealInstance.onComplete(function () {
      console.log('transitionToLobby:videoComplete');
      if (!bowser.mobile) {
        jwplayer('videoLobby').seek(0);
      }
      containerVideo.show();
      ctaButton.show();
      setTimeout(function () {

        var resetRevealVideo = function () {
          videoRevealInstance.seek(0); // reset for second play
          videoRevealInstance.pause();
          deferred.resolve();
        };

        if (!bowser.mobile) {
          $('#videoLobby').fadeIn(animationDefaultMs, function () {
            if (!bowser.mobile) {
              jwplayer('videoLobby').play();
            }
            resetRevealVideo();
          });
        } else {
          resetRevealVideo();
        }
      }, 500);
    });
    return deferred.promise;
  };

  // ---

  videoRevealInstance.onSetupError(function () {
    console.log('ERROR: ' + arguments);
  });

  console.log('demo', videoRevealInstance);
  setInterval(function () {
    console.log('STATE: ' + videoRevealInstance.getState());
  }, 250);

  // Click action

  ctaButtonInstance.bind('click', function () {
    ctaButton.disable();
    var waitUntilLoaded = function () {
      console.log('waitUntilLoaded');
      var deferred = Q.defer();
      var checker = setInterval(function () {
        if (reveal.status === 'loaded') {
          clearInterval(checker);
          deferred.resolve();
        }
      }, 250);
      return deferred.promise;
    };

    var allowTransitionToReveal = function () {
      if (bowser.mobile) {
        console.log('start mobile');
        lobby.hide()
          .then(containerVideo.show)
          .then(reveal.play)
          .then(function () {
            console.log('what??')
          })
          .then(ctaButton.enable)
          .then(transitionToLobby)
          .then(containerVideo.hide)
          .done();
        //.then(cover.hide)
      } else {
        lobby.hide()
          .then(lobby.pause)
          .then(reveal.play)
          .then(cover.hide)
          .then(ctaButton.enable)
          .done();
        // .then(cueFadeOut)
        // .then(transitionToLobby)
        // .then(playLobbyVideo)
      }
    };

    waitUntilLoaded()
      .then(allowTransitionToReveal);
  });

  // Init
  (function () {
    // Get user in ready state
    if (bowser.mobile) {
      reveal.load()
        .done();
    } else {
      lobby.loadAndPlay()
        .then(lobby.show)
        .then(reveal.load)
        .done();
    }
  })();
});
