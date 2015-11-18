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
    // build keys in order of notes, which allows for algorithmic assignment
    // of music note id and frequencies.  We will build all notes out,
    // and tag invalid notes as exists == false.
    function getKeyboard() {
      var notes = ["C", "D", "E", "F", "G", "A", "B"];
      var octaves = [1, 2, 3, 4, 5, 6, 7];
      var keys = [];
      // build base keys
      octaves.forEach(function(octave) {
        notes.forEach(function(note) {
          keys.push(genKeyboardKey(octave, note));
          keys.push(genKeyboardKey(octave, note + "\u266f"));
        });
      });
      // add boundary keys to front and end
      keys.unshift(genKeyboardKey(0, "A"), genKeyboardKey(0, "A\u266f"), genKeyboardKey(0, "B"), genKeyboardKey(0, "B\u266f"));
      keys.push(genKeyboardKey(8, "C"), genKeyboardKey(8, "C\u266f"));
      keys[keys.length - 1].exists = false;  // 8C# does not exist but we need the data point for accurately spacing keys in the D3 draw functions later.
      var i = 0;
      keys.forEach(function(key) {
        if (key.exists) {
          i++;
          key.id = i;
          key.frequency = 440 * Math.pow(2, (i - 49) / 12);  // music note frequency formula from http://en.wikipedia.org/wiki/Piano_key_frequencies
        }
      });
      return keys;
    }

    // helper function genKeyboardKey
    function genKeyboardKey(octave, note) {
      var noExists = ["E\u266f", "B\u266f"];
      var key = {
        keyId: octave + note,
        note: note,
        octave: octave,
        sharp: note.indexOf("\u266f") > 0,
        exists: noExists.indexOf(note) < 0,
        count: 0,
        percentage: 0,
        maxCountPercentage: 0
      };
      return key;
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
        // Generate the right keyId after remapping notes
        var keyId = octave + note;
        var key = {
          keyId: keyId,
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