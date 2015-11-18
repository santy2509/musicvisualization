(function() {
  angular.module("Music", [])
    .service("MusicService", MusicService);

  // service function MusicService
  function MusicService($http) {
    var service = {};
    service = {
      getKeyboard: getKeyboard,
      parseMusicXML: parseMusicXML,
      getMeasureMax: getMeasureMax
    };
    return service;


    // function getKeyboard
    function getKeyboard() {
      var colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8"]; // alternatively colorbrewer.YlGnBu[9]
      var notes = ["C", "C\u266f", "D", "D\u266f", "E", "F", "F\u266f", "G", "G\u266f", "A", "A\u266f", "B"];
      var octaves = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      var whites = [true, false, true, false, true, true, false, true, false, true, false, true];
      data = {
        colors: colors,
        notes: notes,
        octaves: octaves,
        whites: whites,
        values: []
      };
      octaves.forEach(function(octave) {
        notes.forEach(function(note) {
          d = {
            note: note,
            octave: octave,
            count: 0,
            frequency: 0
          };
          data.values.push(d);
        });
      });
      return data;
    }


    // function parseMusicXML
    function parseMusicXML(xml) {
      var keys = [];
      var noteRemap = {
        "C\u266d": {
          newNote: "B",
          octaveModifier: -1
        },
        "D\u266d": {
          newNote: "C\u266f",
          octaveModifier: 0
        },
        "E\u266d": {
          newNote: "D\u266f",
          octaveModifier: 0
        },
        "F\u266d": {
          newNote: "E",
          octaveModifier: 0
        },
        "G\u266d": {
          newNote: "F\u266f",
          octaveModifier: 0
        },
        "A\u266d": {
          newNote: "G\u266f",
          octaveModifier: 0
        },
        "B\u266d": {
          newNote: "A\u266f",
          octaveModifier: 0
        },
        "E\u266f": {
          newNote: "F",
          octaveModifier: 0
        },
        "B\u266f": {
          newNote: "C",
          octaveModifier: 1
        },
      };
      angular.forEach(angular.element(xml).find("pitch"), function(tag) {
        var step = angular.element(tag).find("step").html();
        var alter = angular.element(tag).find("alter").html();
        var octave = parseInt(angular.element(tag).find("octave").html());
        var measure = parseInt(angular.element(tag).parent().parent().attr("number"));
        // logic to assign signs
        var sign = "";
        if (alter == 1) sign = "\u266f";
        if (alter == -1) sign = "\u266d";
        var note = step + sign;
        var newNote = noteRemap[note];

        // if notes need to be mapped to newNotes
        if (typeof newNote !== "undefined") {
          note = newNote.newNote;
          octave += newNote.octaveModifier;
        }
        var key = {
          note: note,
          octave: octave,
          measure: parseInt(measure),
        };
        keys.push(key);
      });
      return keys;
    }


    // function getMeasureMax
    function getMeasureMax(keys) {
      measureMax = 0;
      keys.forEach(function(key) {
        if (key.measure > measureMax) measureMax = key.measure;
      });
      return measureMax;
    }
  }
})();