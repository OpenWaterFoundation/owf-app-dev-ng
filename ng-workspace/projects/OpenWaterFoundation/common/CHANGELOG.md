# Open Water Foundation Common Library Changelog

Optional elements to be added to each package version are as follows:

* Bug Fixes
* Code Refactoring
* Features / Enhancements
* Performance Improvements
* Breaking Changes

These elements will only be added if they are applicable for the new version.

# 0.6.2 #

### Code refactoring ###

* Many quality of life additions were made to a few files, with the gapminder utility
files being changed the most. They are easier to read now.

### Features / Enhancements ###

* Updated the whole project from Angular 11 to Angular 13. Serving and building
the library/application is now faster, including the other quality of life updates
that come with the update.

* Preemptively added code for displaying multiple datasets in Gapminder. This will
be used in future releases; As of now, the code isn't used and the HTML element is
hidden.

# 0.6.1 #

### Code Refactoring ###

* Comments were completed for all named ID's and classes in the Gapminder Component
CSS file.

* Comments were added to the Gapminder Component ts file, and variables names were
changed to align more with recommended Typescript practices.

### Features / Enhancements ###

* Tracers and any event dealing with tracers on the Gapminder visualization was
added.

# 0.6.0 #

### Code Refactoring ###

* Since the Javascript Gapminder code was brought over and needed to be updated,
many lines of code was changed, refactored, updated, and generally improved
scoping and the deletion of any uses of the absolute global window object.

### Features / Enhancements ###

* Added the first working instance of a Gapminder Dialog. Buttons that play, pause,
replay, step backwards & forwards were added. Hovering and clicking over data 'dots'
on the visualization, along with styling & events for each was also added.

* The Gapminder Dialog can open a Doc Dialog or Data Table Light Dialog if a path
to either exist in the Gapminder configuration file. The Data Table Light is a version
of the Data Table that does not have any advanced zooming or address search capabilities,
or any map integrated abilities.

* A Gapminder section has been added to the Visualizations tab under the InfoMapper
documentation for users.

# 0.5.0 #

### Bug Fixes ###

* Fixed a bug that displayed `1 rows selected` in the Data Table instead of
`1 row selected`.

### Features / Enhancements ###

* Started Cypress testing for the InfoMapper, which uses the common library. Necessary
tags had the `data-cy=""` attribute so they can be uniquely identified by Cypress
without having to worry about changes in the future.

* Added basic D3 Dialog code. A dialog can be opened and display a either a Tidy
Tree or Treemap using D3.

# 0.4.0 #

### Features / Enhancements ###

* Added the `refreshInterval` and `refreshOffset` geoLayerView properties. The
`refreshInterval` tells a layer to refresh after N amount of time after its
initially loaded. For example: `"refreshInterval": "1hour 15minutes 30 seconds"`

The `refreshOffset` property is used to tell the layer when it should be refreshed
the first time. The default is an offset of 0, starting at midnight. Therefore,
if the `refreshInterval` is 30 minutes and the map is built at 2:33pm, the next
interval of 30 would occur at 3:00pm, and the first refresh would occur then.

If a `refreshOffset` of `15hours 30minutes` is provided and the map is built at
2:33pm, the offset is added to midnight, and will do the refresh of the layer
at 3:30pm, 15 hours and a half hours after the previous midnight.

* Layer refreshing now works with all vector and raster layers.

* Added the ability to create ImageOverlay layers on the map.


# 0.3.0 #

### Code Refactoring ###

* Added the DayTS class to accompany the YearTS and MonthTS classes that had already
been implemented. It is not complete, but when files containing DayTS is used for
testing, most of the core code will have been imported.

* Added some methods and data members to already existing classes in the common
library, such as `TS.ts`, `TSGraph.ts`, `TSData.ts`, etc.

* Started removing the Dialog CSS classes from each individual Dialog and adding
them to the shared `main-dialog-style.css` file. When finished, it will only
contain CSS classes that deal with static parts of the Dialog, such as the close
button alignment. In addition, each Dialog CSS file will start by declaring which
of these shared classes are currently being used in the Dialog. This way, it's not
ambiguous what styling those classes in the template file are using.

### Features / Enhancements ###

* Added the **Heatmap Dialog** into the Common package. Used for displaying TS
data in a plotly heatmap graph.

* Added the ability to make plotly graphs dynamically resizable on Dialog resizing.
This has been introduced as a 'beta' feature, since there are some undesired traits.
For example, resizing does not take the graphs aspect ratio in account; the Dialog
can be resized in any way on the X and Y axes, and the graph will follow suit. This
will hopefully be updated in the future.

# 0.2.0 #

### Features / Enhancements ###

* Migrated the Map Component over from the InfoMapper, to be potentially used as
either a separate/stand-alone map, or in an InfoMapper-like application.

* Created the **leaflet** entry point where the map component and other necessary
files are located and can be exported for application to consume.

* Created the **pipes** entry point, where all pipes used throughout the common
package reside, and can be used by importing the pipes module from any other
entry point. This also fixed an issue where more than one pipe could not be used
in the same folder.


### Code Refactoring ###

* Made some repeated enums, interfaces, etc. DRY in some services and other utility
code classes. Also updated paths and code in existing common library files that
rely on map component code.

# 0.1.6 #

### Bug Fixes ###

* Fixed a Window Manager windowID issue, where the variable in the InfoMapper was still called
buttonID, an old leftover when the ID was only being created in a Leaflet popup button. This will
stop a Text and Graph Dialog from opening just once.

* Fixed a bug where a address would be added to the map regardless if it was in a feature or not.
The new code will only create and add the Marker if the address is found in any of the layer's
features.

### Performance Improvements ###

* Updated the way a filtered feature is added to a newly-created GeoJSON object, removing
unnecessary n^2 time complexity nested for loops.

* Changed what's sent to the Dialog from the more granular geoLayerId and geoLayerView name to the
entire geoLayer and geoLayerView, to cut down on separate imports for each, cleaning up the code.

* Added a selected layer and highlight layer (highlight currently unused) to be added as separate
geoJSON layers to a layerItem object in the MapLayerItem class. This way when each Leaflet layer
is added, 

### Features / Enhancements ###

* Updated how the selected layer is displayed on the Leaflet map, so that a selected fully opaque
feature can still be discovered by a user, especially when adjacent to other fully opaque
features.


# 0.1.5 #

### Bug Fixes ###

* Removed a conditional checking for the same input for a user. This will be added later, but
other checks will need to be done as well.

# 0.1.4 #

### Bug Fixes ###

* Not really a bug, but added `& Search` to a layer Data Table button option.
* Updated how the zoom to selected features and address buttons are enabled and disabled. One
address does not need to be exact anymore for the button to be enabled. 

# 0.1.3 #

### Features / Enhancements ###

* Added a marker to be displayed on an address when filtered in the Data Table. The address is
attached to the layer so that toggling the layer on/off will affect the marker as well.

* Updated some more of the MapLayerItem code so that if a user clears the input in the Data Table
filter, all selected layers will be removed from the map instead of hidden, as this will keep
adding layers to the map.

* Implemented a `previous search` class variable to hold the string the user searched for last. This
way, a complete data or address search wouldn't be done over and over each time the enter key was
pressed on the same input string.

### Bug Fixes ###

* Fixed an issue where the filter input field wouldn't be updated correctly. If a user filtered
an input string and hit enter, then selected the string and changed it to something else without
explicitly deleting it (i.e. setting the input to an empty string), selected layers from the first
search would still remain on the map. So if two addresses were searched this way, two markers and
two highlighted features would display on the map. Now when enter is pressed, (if the user input
has changed) a check for any currently highlighted layers is done, and any are removed before new
selected highlight layers are added.

# 0.1.2 #

### Bug Fixes ###

* Updated the MapLayerItem class so that selected highlight layers are added. This way, when
a user toggles the layer on/off, the selected layer will follow suit.

### Features / Enhancements ###

* Changed a selected highlight layer's opacity from `0.7` to `0.4`.

# 0.1.0 #

### Bug Fixes ###

* Fixed an bug where the function that determines whether a point of coordinates reside inside
of a polygon was not working correctly. Replace the single function with Turf.js, a geospatial
analysis package, which seems to have fixed the issue.

### Features / Enhancements ###

* Added ability to highlight polygons when filtered in the Data Table.
* Added ability to zoom to polygons using a Turf.js created boundary box.

### Code Refactoring ###

* Gutted how a selection layer was created in the InfoMapper app, and instead will create it in
the common library. This way, only features that are found are added to the selected layer, and
not all of them, which could negatively effect user experience if there are hundreds.
* Changed the clear selection code so that each layer can still clear highlighted features, but
added the ability to add in a global clear selection button in the future.
* Added some error testing if an address is given when the search layer data radio button is
selected, if an address isn't found, etc.


# 0.0.1 #

### Bug Fixes ###

* Fixed a bug in the Data Table Dialog where the Zoom to Address button shows up even if the
Find from Address radio button was not there.
* Squished a bug that wouldn't know how to display an image in Dialog Doc markdown when given
a relative path to the image from where the markdown file lives. The component needed another
property from the InfoMapper so the library could set its own fullMarkdownPath in the top
level service.

### Feature / Enhancements ###

* Not a feature per se, but `-alpha.X` was removed from the package version now that there is
more confidence in building and publishing new versions of the package. In fact, publishing was
deemed to be happening too quickly, and subsequent version updates will either have multiple
updates/fixes/changes, or contain a high-priority/critical bug fix if not.

# 0.0.1-alpha.10 #

### Bug Fixes ###

* Fixed the path resolver issue, where if a file from the InfoMapper wanted to use a path
relative to its map configuration file, the dialog wouldn't know where to find it. Each
dialog has the path resolver variable 'mapConfigPath' defined and set to the common library's
service, so the relative path can be found with building paths. This is set even if the dialog
is not currently using a relative path, but will be ready in the future.

# 0.0.1-alpha.9 #

### Bug Fixes ###

* Dialogs were only being closed and removed from the window manager when either of the top or
bottom close buttons were clicked inside the Dialog. If a user navigates away from the current
page, like a markdown link for example, the URL would change for the InfoMapper, and the close
function would not be called. The same functions called from the onClose function have now been
copied into each dialog Component's onDestroy function (Dialog Text, TSTable, Doc, etc.). This
is a pre-defined function from Angular that is called when the Component is destroyed. This way,
any dialog will successfully have its clean-up functions called.

# 0.0.1-alpha.8 #

### Bug Fixes ###

* Added in showdownOptions into each component that uses Showdown. This configuration object
is given to the converter on a component scope, and overrides any other top level Showdown
option objects. On one hand, it prevents users from changing the options when using the common
library. On the other, the options set would be used a majority of the time, and prevent users
from adding a specific line into their own app.module.ts file when importing the ShowdownModule
into the NgModule. This also prevents adding unwanted `<br>` tags in the converted HTML.

# 0.0.1-alpha.7 #

### Bug Fixes ###

* Fixed an issue where the testing environment wasn't set up correctly and would not show
the address radio button when being displayed on a polygon layer.
* Updated the zoom disable pipe code that wouldn't always enable/disable the button
at the right times.

### Features / Enhancements ###

* Zoom to address button added to the data table kebab menu for zooming to a point in a
polygon. Is only enabled when on a polygon layer and after an address has been searched.
* Updated the color of the Angular Material radio buttons by overriding the CSS.

# 0.0.1-alpha.6 #

### Code Refactoring ###

* Streamlined how the zoomDisable pipe is handling arguments to determine whether a button
should be enabled/disabled or visible/hidden. It's also easier to read and determine what
the code is doing.

### Features / Enhancements ###

* Search layer data and Find from address radio buttons added to Data Table Component.
* The data table will filter by whatever is selected (default is Search layer data, used for looking
through all columns of data) using the GeoCodIO geocoding service.


# 0.0.1-alpha.5 #

* Using a new method for describing changes/updates in the changelog, will take effect in
`alpha.6`.

# 0.0.1-alpha.3 #

* Scripts made for building the library and npm packs it into the tarball to be used for testing
or npm publishing.

# 0.0.1-alpha.2 #

* Initial working common library. Can successfully build and use in a consuming app
(InfoMapper).
* Contains dialogs, services, multi project environment, and a basic app for running/testing
the common library.