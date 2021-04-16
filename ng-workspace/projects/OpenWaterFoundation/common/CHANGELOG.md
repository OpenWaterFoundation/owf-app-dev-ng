# Open Water Foundation Common Library Changelog

Optional elements to be added to each package version are as follows:

* Bug Fixes
* Code Refactoring
* Features
* Performance Improvements
* Breaking Changes

These elements will only be added if they are applicable for the new version.

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