# D3 Pianogram Arcs
[bl.ocks.org link](http://bl.ocks.org/chrisrzhou/raw/5a9fa44b9b1e115b56c6/)

Pianogram Arcs visualizes music notes in a radial histogram.  This is a variation of the original [Pianogram][].

The project is created using AngularJS and D3.js.

------

## Instructions
-   Load any *valid uncompressed* [MusicXML][] file and Pianogram will render the visualization completely using front-end Javascript.

-   Use the "music player" controls to go over measure bars in the music and visualize subsets of the data over time.

-   Hover over the piano keys for a quick summary of key steps used in the music!

-   Future improvements would be to find a way to play the notes as the data updates but this seems pretty involved and does not really
    flow well with the MusicXML parsing method that I've adopted, which parses the data based on how the music is read on the score, and
    not based on how the music is actually played.  The end effect of "playing" a music as it sounds would probably require a different
    parsing implementation.

------

## Files
-   **`index.html`**: Main HTML file.

-   **`app.js`**: AngularJS core logic to connect Javascript components and D3 visualization updates with user interactions. The
    directive `onReadFile` handles and the directive `pianogramArcs` draws D3 SVG.  

-   **`music.js`**: Helper angular module `Music` containing useful services such as `getData`, `parseMusicXML` and `getMeasureMax` to
    support the angular app.

-   **`pianogram.js`**: Contains D3-specific code for drawing the D3 SVG.  It is called by the `pianogramArcs` directive in `app.js`.

-   **`samples.json`**: Sample data files that are used for plotting demos.

-   **`style.css`**: stylesheet

------

## Pianogram Variants:
Here's a list of variants of Pianograms that I've created that parse and visualize MusicXML files:

-   [Pianogram][]
-   [Pianogram Tiles][]
-   [Pianogram Arcs][]

------

## Notes
-   Inspiration is taken form Mike Bostock's recent implementation of [Arc Piano][].  I wanted to apply it to the past pianogram
    projects that I've done and managed to integrate this.

-   The project uses AngularJS directives for loading MusicXML files and drawing the visuals in D3.

-   I took a different approach to drawing and managing data from Mike Bostock.
    -   I ran into some visualization issues with adding more keys using Mike Bostock's original code, so I defaulted to drawing keys
        like I did in [Pianogram][].  Tihs involves creating an array of keys (tracking white/blacks) and forcing D3 to draw the two
        subsets on the same visualization (whites before blacks).  As a result, it is important to generate equal lengths of keys to
        make sure that our data drawing is in sync.  We then "hide" invalid black keys through checking the `exists` attribute of each
        key.
    -   I delegated the key frequencies to the data creation outside of D3 (that way you can pass datasets externally and D3 will solely
        draw the dataset supplied to it, in this case we supply the data to D3 through `scope.data` in the angular directive.  
    -   There is no use of `arcTween` since I am using the data values to scale the `outerRadius` for a histogram-like visualization.

-   Note that this pianogram does not actually simulate the total keys played in the music, it simulates the total music notes
    *displayed* on a music score sheet (i.e. it does not handle repeat bars)

-   Parsing of MusicXML is executed on the browser with a self-written Javascript function utilizing `angular.element`.  `parseMusicXML`
    function can only parse *uncompressed MusicXML* files and cannot parse the compressed version (`.mxl` files).  You can go to
    [MuseScore][] to save these compressed `.mxl` files as uncompressed MusicXML files for uploading to this application.

-   This Pianogram does not handle double sharps and double flats.

-   A big help from this [fiddle][] to help implement an AngularJS `FileReader`.

<!-- external links -->
[Pianogram]: http://bl.ocks.org/chrisrzhou/raw/6e5fa4352fb8de5ba1f4
[Pianogram Tiles]: http://bl.ocks.org/chrisrzhou/raw/d469b1324404b71b8172
[Pianogram Arcs]: http://bl.ocks.org/chrisrzhou/raw/5a9fa44b9b1e115b56c6
[Arc Piano]: http://bl.ocks.org/mbostock/5723d93e4f617b542991
[MusicXML]: http://www.musicxml.com/
[MuseScore]: http://www.musescore.org
[fiddle]: http://jsfiddle.net/alexsuch/6aG4x/

<!-- ga beacon -->
![Analytics](https://ga-beacon.appspot.com/UA-58181799-1/5a9fa44b9b1e115b56c6)