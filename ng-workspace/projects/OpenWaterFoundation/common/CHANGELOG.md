# Open Water Foundation Common Library Changelog

Optional elements to be added to each package version are as follows:

* Bug Fixes
* Code Refactoring
* Features
* Performance Improvements
* Breaking Changes

These elements will only be added if they are applicable for the new version.

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