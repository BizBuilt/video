$(function () {
  'use strict';

  console.log('-----------------------------');
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
  var animationDefaultMs = 500;
  if (bowser.mobile) {
    jwSettings = jwDefaults.mobile;
  } else {
    jwSettings = jwDefaults.desktop;
  }

  var wait = function () {
    console.log('wait');
    var deferred = Q.defer();
    setTimeout(function () {
      deferred.resolve();
    }, 500);
    return deferred.promise;
  };

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
      api.instance.hide();
    };
    api.instance = $('#ctaVideo');
    api.show = function () {
      console.log('button:show');
      api.instance.show();
    };
    return api;
  }();

  var buttonClose = function () {
    var api = {};
    api.clicked = null;
    api.disable = function () {
      var deferred = Q.defer();
      console.log('buttonClose:disable');
      api.instance.css({
        'z-index': 10
      });
      deferred.resolve();
      return deferred.promise;
    };
    api.enable = function () {
      console.log('buttonClose:enable');
      api.instance.css({
        'z-index': 100
      });
    };
    api.hide = function () {
      console.log('buttonClose:hide');
      api.instance.css({
        opacity: 0,
        'z-index': -100
      });
    };
    api.instance = $('#buttonClose');
    api.show = function () {
      console.log('buttonClose:show');
      api.instance.show();
      api.instance.css({
        opacity: 1,
        'z-index': 10
      });
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
      console.log('lobbyCover:hide');
      var deferred = Q.defer();
      api.instance.hide();
      deferred.resolve();
      return deferred.promise;
    };
    api.instance = $('#videoLobbyCover');
    api.show = function () {
      var deferred = Q.defer();
      api.instance.show();
      deferred.resolve();
      return deferred.promise;
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
      var deferred = Q.defer();
      api.setInstance();
      api.instance.css('z-index', -150);
      deferred.resolve();
      return deferred.promise;
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
        api.status = jwplayer('videoPresentation').getState();
        if (api.status === 'PLAYING') {
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
      console.log('presentation:show');
      api.setInstance();
      api.instance.css('z-index', 0);
    };
    api.status = null;
    api.video = jwplayer('videoPresentation');
    api.interval = null;
    api.waitUntilFinishedPlaying = function () {
      console.log('presentation:waitUntilFinishedPlaying');
      var deferred = Q.defer();
      var duration = jwplayer('videoPresentation').getDuration();
      var position = 0;
      api.interval = setInterval(function () {
        position = jwplayer('videoPresentation').getPosition();
        api.status = jwplayer('videoPresentation').getState();
        if (api.status === 'IDLE' || position + 2 >= duration) {
          console.log('presentation:waitUntilFinishedPlaying:complete');
          clearInterval(api.interval);
          deferred.resolve();
        } else if (buttonClose.clicked) {
          console.log('presentation:waitUntilFinishedPlaying:rejected');
          clearInterval(api.interval);
          deferred.reject();
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
      console.log('lobby:hide');
      api.instance.css('z-index', -100);
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
      api.instance.css('z-index', -10);
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
    if (!button.clicked) {
      button.disable();
      if (bowser.mobile) {
        presentation.play()
          .done();
        // .then(presentation.play)
        // .then(lobbyCover.hide)
        // .then(presentation.hide)
        // .then(presentation.show)
        // .then(button.enable)
      } else {
        var exitFromPresentation = function () {
          console.log('exitFromPresentation ------------------------');
          return buttonClose.disable()
            .then(presentationCover.fadeIn)
            .then(function () {
              buttonClose.clicked = false;
              return Q.allSettled([
                presentation.hide(),
                lobby.play(),
                buttonClose.hide()
              ]);
            })
            .then(button.enable)
            .then(function () {
              return Q.allSettled([
                presentationCover.fadeOut(),
                button.fadeIn(),
                presentation.hide()
              ]);
            })
            .done();
        };

        var enterPresentation = function () {
          console.log('enterPresentation ------------------------');
          Q.allSettled([
            button.fadeOut(),
            presentationCover.fadeIn()
          ])
            .then(presentation.load)
            .then(presentation.play)
            .then(function () {
              return Q.allSettled([
                lobby.stop(),
                lobby.hide(),
                presentation.show(),
                buttonClose.show()
              ]);
            })
            .then(presentationCover.fadeOut)
            .then(buttonClose.enable)
            .then(presentation.waitUntilFinishedPlaying)
            .then(function () {
              if (!buttonClose.clicked) {
                exitFromPresentation()
              }
            })
            .done()
        };

        buttonClose.instance.bind('click', function () {
          console.log('buttonClose:clicked');
          if (!buttonClose.clicked) {
            console.log('buttonClose:clicked:engage');
            exitFromPresentation();
            clearInterval(buttonClose.interval);
            buttonClose.clicked = true;
          }
        });

        enterPresentation();
      }
    }
  });

  // Init
  (function () {
    if (bowser.mobile) {
      presentation.load()
        .done();
    } else {
      lobby.load()
        .then(lobby.play)
        .then(wait)
        .then(lobbyCover.fadeOut)
        .done();
    }
  })();
});
