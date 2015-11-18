(function() {
  angular.module("pianogramApp", ["Music"])
    .directive("pianogramTiles", pianogramTiles)
    .directive("onReadFile", onReadFile)
    .controller("pianoCtrl", pianoCtrl);

  // controller function pianoCtrl
  function pianoCtrl($scope, $interval, $http, MusicService) {
    var ctrl = this;
    init();

    // function init
    function init() {
      // initialize controller variables
      ctrl.data = MusicService.getKeyboard();
      ctrl.measure = {
        value: 0,
        max: 0
      };
      ctrl.samples = [{
        "name": "Für Elise by Beethoven"
      }, {
        "name": "Moonlight Sonata by Beethoven"
      }, {
        "name": "La campanella by Lizst"
      }, {
        "name": "Piano Sonata No. 16 in C Major by Mozart"
      }];
      ctrl.sample = ctrl.samples[0];


      // initialize controller functions
      ctrl.getData = getData;
      ctrl.getSample = getSample;
      ctrl.player = {
        playing: false,
        interval: null,
        play: play,
        pause: pause,
        nextMeasure: nextMeasure,
        prevMeasure: prevMeasure,
        firstMeasure: firstMeasure,
        lastMeasure: lastMeasure
      };

      // getSample
      ctrl.getSample();

      // watch and stop interval
      $scope.$watch(function() {
        return ctrl.measure.value;
      }, function() {
        if (ctrl.measure.value > ctrl.measure.max) {
          $interval.cancel(ctrl.player.interval);
          ctrl.player.playing = false;
        }
      });
    }


    // function getData
    function getData($fileContent) {
      ctrl.xml = $fileContent;
      ctrl.keys = MusicService.parseMusicXML(ctrl.xml);
      restart();
    }

    // function getSample
    function getSample() {
      $http.get("samples.json").success(function(data) {
        var id = ctrl.samples.indexOf(ctrl.sample);
        ctrl.keys = data[id];
        restart();
      });
    }

    // player function firstMeasure
    function firstMeasure() {
      ctrl.measure.value = 0;
      binKeys();
    }

    // player function lastMeasure
    function lastMeasure() {
      ctrl.measure.value = ctrl.measure.max;
      binKeys();
    }

    // player function prevMeasure
    function prevMeasure() {
      if (ctrl.measure.value > 0) {
        ctrl.measure.value--;
        binKeys();
      }
    }

    // player function nextMeasure
    function nextMeasure() {
      if (ctrl.measure.value < ctrl.measure.max) {
        ctrl.measure.value++;
        binKeys();
      }
    }

    // player function play
    function play() {
      $interval.cancel(ctrl.player.interval);
      if (ctrl.measure.value <= ctrl.measure.max) {
        var interval = $interval(function() {
          nextMeasure();
        }, 500);
        ctrl.player.interval = interval;
      }
      ctrl.player.playing = true;
    }

    // player function pause
    function pause() {
      ctrl.player.playing = false;
      $interval.cancel(ctrl.player.interval);
    }

    // function binKeys
    function binKeys() {
      ctrl.data = MusicService.getKeyboard(); // initialize blank keyboard
      var denominator = 0;  // calculate denominator to divide by
      ctrl.keys.forEach(function(key) {
        if (key.measure <= ctrl.measure.value) denominator++;
      });
      ctrl.keys.forEach(function(key) {
        ctrl.data.values.forEach(function(d) {
          if (key.note == d.note && key.octave == d.octave && key.measure <= ctrl.measure.value) {
            d.count += 1;
            d.frequency = (d.count / denominator) * 100;
          }
        });
      });
    }

    // function restart
    function restart() {
      ctrl.measure.value = 0;
      ctrl.measure.max = MusicService.getMeasureMax(ctrl.keys);
      play();
    }
  }


  // directive function pianogramTiles
  function pianogramTiles() {
    return {
      restrict: "E",
      scope: {
        data: "=",
      },
      link: pianogramDraw
    };
  }


  // directive function onReadFile
  function onReadFile($parse) {
    return {
      restrict: "A",
      scope: false,
      link: function(scope, element, attrs) {
        var fn = $parse(attrs.onReadFile);
        element.on("change", function(onChangeEvent) {
          var reader = new FileReader();
          reader.onload = function(onLoadEvent) {
            scope.$apply(function() {
              fn(scope, {
                $fileContent: onLoadEvent.target.result
              });
            });
          };
          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  }
})();