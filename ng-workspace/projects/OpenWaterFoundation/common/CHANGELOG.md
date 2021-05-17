# Open Water Foundation Common Library Changelog

Optional elements to be added to each package version are as follows:

* Bug Fixes
* Code Refactoring
* Features
* Performance Improvements
* Breaking Changes

These elements will only be added if they are applicable for the new version.

# 0.1.3 #

### Features ###

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

### Features ###

* Changed a selected highlight layer's opacity from `0.7` to `0.4`.

# 0.1.0 #

### Bug Fixes ###

* Fixed an bug where the function that determines whether a point of coordinates reside inside
of a polygon was not working correctly. Replace the single function with Turf.js, a geospatial
analysis package, which seems to have fixed the issue.

### Features ###

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

### Feature ###

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

### Features ###

* Zoom to address button added to the data table kebab menu for zooming to a point in a
polygon. Is only enabled when on a polygon layer and after an address has been searched.
* Updated the color of the Angular Material radio buttons by overriding the CSS.

# 0.0.1-alpha.6 #

### Code Refactoring ###

* Streamlined how the zoomDisable pipe is handling arguments to determine whether a button
should be enabled/disabled or visible/hidden. It's also easier to read and determine what
the code is doing.

### Features ###

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