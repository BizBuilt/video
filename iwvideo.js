$(function () {
  'use strict';

  /*
   * JW Player
   *
   * - Embed options: http://cl.ly/Zhz6
   * - JS reference: http://cl.ly/ZhNc
   *
   */

  // JW Player defaults
  var jwDefaults = {
    both: {
      aspectratio: '16:9',
      displaytitle: false,
      height: '100%',
      primary: 'html5',
      width: '100%'
    },
    desktop: {
      autostart: true,
      controls: 'false',
      primary: 'html5'
    },
    mobile: {
      repeat: 'false'
    }
  };

  jwDefaults.mobile = _.extend({}, jwDefaults.mobile, jwDefaults.both);
  jwDefaults.desktop = _.extend({}, jwDefaults.desktop, jwDefaults.both);

  var jwSettings;
  var animationDefaultMs = 1000;
  if (bowser.mobile) {
    jwSettings = jwDefaults.mobile;
  } else {
    jwSettings = jwDefaults.desktop;
  }

  var button = function () {
    var api = {};
    api.clicked = false;
    api.disable = function () {
      console.log('button:disable');
      api.clicked = true;
    };
    api.enable = function () {
      console.log('button:enable');
      api.clicked = false;
    };
    api.fadeOut = function () {
      console.log('button:fadeOut');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 0
      }, animationDefaultMs, function () {
        console.log('button:fadeOut:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.fadeIn = function () {
      console.log('button:fadeOut');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 1
      }, animationDefaultMs, function () {
        console.log('button:fadeOut:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.hide = function () {
      console.log('button:hide');
      //api.instance.fadeOut(animationDefaultMs * 0.5);
      api.instance.hide();
    };
    api.instance = $('#ctaVideo');
    api.show = function () {
      console.log('button:show');
      //api.instance.fadeIn(animationDefaultMs * 0.5);
      api.instance.show();
    };
    return api;
  }();

  var lobbyCover = function () {
    var api = {};
    api.fadeIn = function () {
      console.log('lobbyCover:fadeIn');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 1
      }, animationDefaultMs, function () {
        console.log('lobbyCover:fadeIn:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.fadeOut = function () {
      console.log('lobbyCover:fadeOut');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 0
      }, animationDefaultMs, function () {
        console.log('lobbyCover:fadeOut:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.hide = function () {
      api.instance.hide();
    };
    api.instance = $('#videoLobbyCover');
    api.show = function () {
      api.instance.show();
    };
    return api;
  }();

  var presentation = function () {
    var api = {};
    api.afterLoad = function () {
      jwplayer('videoPresentation').onComplete(function () {
        console.log('transitionToLobby:videoComplete');
        if (!bowser.mobile) {
          lobby.video.seek(0);
        }
        button.show();
        //setTimeout(function () {
        var resetPresentationVideo = function () {
          jwplayer('videoPresentation').seek(0); // reset for second play
          jwplayer('videoPresentation').pause();
        };
        if (!bowser.mobile) {
          $('#videoLobby').fadeIn(animationDefaultMs, function () {
            if (!bowser.mobile) {
              jwplayer('videoLobby').play(true);
            }
            resetPresentationVideo();
          });
        } else {
          resetPresentationVideo();
        }
        //}, 500);
      });
      jwplayer('videoPresentation').onSetupError(function () {
        console.log('ERROR: ' + arguments);
      });
    };
    api.hide = function () {
      console.log('presentation:hide');
      api.instance.css('z-index', -100);
    };
    api.instance = $('#videoPresentation');
    api.load = function () {
      console.log('presentation:load');
      var deferred = Q.defer();
      jwplayer('videoPresentation').setup(_.extend({}, jwSettings, {
        autostart: false,
        playlist: '//content.jwplatform.com/feed/8XABftQB.rss',
      }));
      jwplayer('videoPresentation').onReady(function () {
        console.log('presentation:load:ready');
        api.setInstance();
        deferred.resolve();
      });
      // }, 500);
      return deferred.promise;
    };
    api.play = function () {
      console.log('presentation:play');
      var deferred = Q.defer();
      jwplayer('videoPresentation').play(true);
      var interval = setInterval(function () {
        if (jwplayer('videoPresentation').getState() === 'PLAYING') {
          console.log('presentation:play:complete');
          clearInterval(interval);
          deferred.resolve();
        }
      }, 100);
      return deferred.promise;
    };
    api.setInstance = function () {
      api.instance = $('#videoPresentation');
    };
    api.show = function () {
      api.setInstance();
      console.log('presentation:show');
      api.instance.css('z-index', 0);
    };
    api.video = jwplayer('videoPresentation');
    api.waitUntilFinishedPlaying = function () {
      console.log('presentation:waitUntilFinishedPlaying');
      var deferred = Q.defer();
      var duration = jwplayer('videoPresentation').getDuration();
      var position = 0;
      var interval = setInterval(function () {
        position = jwplayer('videoPresentation').getPosition();
        if (
          jwplayer('videoPresentation').getState() === 'IDLE' ||
          position + 2 >= duration
        ) {
          console.log('presentation:waitUntilFinishedPlaying:complete');
          clearInterval(interval);
          deferred.resolve();
        }
      }, 100);
      return deferred.promise;
    };
    return api;
  }();

  var presentationCover = function () {
    var api = {};
    api.fadeIn = function () {
      console.log('presentationCover:fadeIn');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 1
      }, animationDefaultMs, function () {
        console.log('presentationCover:fadeIn:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.fadeOut = function () {
      console.log('presentationCover:fadeOut');
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 0
      }, animationDefaultMs, function () {
        console.log('presentationCover:fadeOut:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.hide = function () {
      api.instance.hide();
    };
    api.instance = $('#videoPresentationCover');
    api.show = function () {
      api.instance.show();
    };
    return api;
  }();

  var lobby = function () {
    var api = {};
    api.fadeIn = function () {
      console.log('lobby:fadeIn');
      api.instance.css('opacity', 0);
      var deferred = Q.defer();
      api.instance.animate({
        opacity: 1
      }, animationDefaultMs, function () {
        console.log('lobby:fadeIn:complete');
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.hide = function () {
      api.instance.css('opacity', 0);
    };
    api.hideWhenStylesSet = function () {
      console.log('lobby:hideWhenStylesSet');
      var deferred = Q.defer();
      var interval = setInterval(function () {
        if (api.instance.hasClass('jwplayer')) {
          console.log('lobby:hideWhenStylesSet:complete');
          api.hide();
          clearInterval(interval);
          deferred.resolve();
        }
      }, 100);
      return deferred.promise;
    };
    api.instance = $('#videoLobby');
    api.load = function () {
      console.log('lobby:load');
      var deferred = Q.defer();
      jwplayer('videoLobby').setup(_.extend({}, jwSettings, {
        mute: true,
        playlist: '//content.jwplatform.com/feed/trgRuzuX.rss',
        repeat: true
      }));
      jwplayer('videoLobby').onReady(function () {
        console.log('lobby:load:ready');
        api.setInstance();
        deferred.resolve();
      });
      return deferred.promise;
    };
    api.pause = function () {
      console.log('lobby:pause');
      jwplayer('videoLobby').pause();
    };
    api.play = function () {
      console.log('lobby:play');
      var deferred = Q.defer();
      jwplayer('videoLobby').play(true);
      var interval = setInterval(function () {
        if (jwplayer('videoLobby').getState() === 'PLAYING') {
          console.log('lobby:play:complete');
          clearInterval(interval);
          deferred.resolve();
        }
      }, 100);
      return deferred.promise;
    };
    api.setInstance = function () {
      api.instance = $('#videoLobby');
    };
    api.show = function () {
      console.log('lobby:show');
      api.instance.show();
    };
    api.stop = function () {
      console.log('lobby:stop');
      jwplayer('videoLobby').seek(0);
      jwplayer('videoLobby').pause();
    };
    api.wait = function () {
      console.log('lobby:wait');
      var deferred = Q.defer();
      setTimeout(function () {
        deferred.resolve();
      }, 500);
      return deferred.promise;
    };
    return api;
  }();

  // Click action

  button.instance.bind('click', function () {

    button.disable();

    if (bowser.mobile) {
      lobby.hide()
        .then(presentation.play)
        .then(function () {
          console.log('what??');
        })
        .then(button.enable)
        .done();
    } else {
      presentation.load()
        .then(function () {
          return Q.allSettled([
            button.fadeOut(),
            presentationCover.fadeIn(),
            presentation.play()
          ]);
        })
        .then(function () {
          return Q.allSettled([
            lobby.stop(),
            presentation.show()
            //button.fadeOut(),
            //presentationCover.fadeIn(),
            //presentation.play()
          ]);
        })
        .then(presentationCover.fadeOut)
        .then(presentation.waitUntilFinishedPlaying)
        .then(presentationCover.fadeIn)
        .then(lobby.play)
        .then(function () {
          return Q.allSettled([
            presentationCover.fadeOut(),
            lobby.play(),
            button.fadeIn(),
            presentation.hide()
            //presentationCover.fadeIn(),
            //presentation.play()
          ]);
        })
        .done();
    }
  });

  var wait = function () {
    console.log('wait');
    var deferred = Q.defer();
    setTimeout(function () {
      deferred.resolve();
    }, 500);
    return deferred.promise;
  };

  // Init
  (function () {
    // Get user in ready state
    if (bowser.mobile) {
      presentation.load()
        .done();
    } else {
      lobby.load()
        .then(lobby.play)
        .then(wait) // this hides a loading flicker from jw
      .then(lobbyCover.fadeOut)
        .done();
    }
  })();
});
