# NgWorkspace

This project was generated with [Angular CLI](https://github.com/angular/angular-cli)
version 9.0.2.

## Currently Installed `npm` Packages ##

This section contains the currently installed `npm` packages, what they do, and what
version they are at. A package will be flagged under its name if its purpose is unknown,
so that the appropriate action can be done, such as figuring out what it's doing, or
removing the package.

The reason this section was created (and why it will be created for any Angular project
in the future), is because as more and more third-party libraries are relied on for a
project, the higher the chances for upgrade issues, security vulnerabilities, code
abandonment, etc. This way the packages can be viewed and scrutinized at any time, and
more thought and care can go into installing them for project use.

> NOTE: The following table should be directly compared with the Infomapper `npm` packages
table. This is an easier way to visually see what packages each one is using, since the
Infomapper depends on the common library. Both tables will probably be close to identical
until a method is discovered that allows the Infomapper to not have every installed
AppDev package.

This table contains the following:

* **Package Name** - The name of the installed `npm` package. Will contain **POSSIBLE DELETION**
if the package might be able to be removed, but more information is needed.
* **Description** - A description of the package and what it does for the project.
* **Angular Installed** - Whether Angular installed the package automatically. These will
need to be updated only when updating Angular using `npx`.
* **Version** - The current version the installed package.

| **Package Name**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | **Description** | **Angular Installed** | **Version** |
| ---- | ---- | ---- | ---- |
| **@angular-devkit/build-angular** |  | Yes | `13.1.4` |
| **@angular/animations** |  | Yes | `13.1.3` |
| **@angular/cdk** |  | Yes | `13.1.3` |
| **@angular/cli** |  | Yes | `13.1.4` |
| **@angular/common** |  | Yes | `13.1.3` |
| **@angular/compiler-cli** |  | Yes | `13.1.3` |
| **@angular/compiler** |  | Yes | `13.1.3` |
| **@angular/core** |  | Yes | `13.1.3` |
| **@angular/elements** |  | Yes | `13.1.3` |
| **@angular/forms** |  | Yes | `13.1.3` |
| **@angular/language-service** |  | Yes | `13.1.3` |
| **@angular/material** |  | Yes | `13.1.3` |
| **@angular/platform-browser-dynamic** |  | Yes | `13.1.3` |
| **@angular/platform-browser** |  | Yes | `13.1.3` |
| **@angular/router** |  | Yes | `13.1.3` |
| **@turf/bbox** | Takes a set of features, calculates the bbox of all input features, and returns a bounding box. Used by the Data Table Dialog for positioning the map view when zooming to a feature. |  | `6.3.0` |
| **@turf/boolean-point-in-polygon** | Takes a Point and a Polygon or MultiPolygon and determines if the point resides inside the polygon. The polygon can be convex or concave. The function accounts for holes. Used by the Data Table Dialog for determining whether a given address is in a polygon. |  | `6.3.0` |
| **@types/d3** | Type definitions for the D3 standard bundle. |  | `7.0.0` |
| **@types/file-saver** |  |  | `2.0.2` |
| **@types/jasmine** |  | Yes | `3.5.14` |
| **@types/jasminewd2** |  | Yes | `2.0.8` |
| **@types/jquery** |  |  | `3.5.13` |
| **@types/leaflet** |  |  | `1.7.0` |
| **@types/lodash** |  |  | `4.14.170` |
| **@types/node** |  | Yes | `12.20.12` |
| **@types/papaparse** |  |  | `5.2.5` |
| **@types/select2** |  |  | `4.0.54` |
| **@types/showdown** |  |  | `1.9.3` |
| **bootstrap** |  |  | `4.6.0` |
| **chart.js**<br>**POSSIBLE DELETION** |  |  | `2.9.4` |
| **chartjs-plugin-zoom**<br>**POSSIBLE DELETION** |  |  | `0.7.7` |
| **clusterize.js** |  |  | `0.18.1` |
| **codelyzer** |  |  | `6.0.2` |
| **cypress** |  |  | `8.3.0` |
| **d3** | JavaScript library for visualizing data using web standards. Used by the Gapminder Component to display the Trendalyzer (previously known as Gapminder) visualization software. |  | `7.0.3` |
| **document-register-element** |  |  | `1.14.10` |
| **file-saver** | Saves a CSV file on a local computer. Used by the Data Table, Data Table Light, Text, and TSTable Dialogs to display a `Download` button. |  | `2.0.5` |
| **flatted** |  |  | `3.1.1` |
| **font-awesome** |  |  | `4.7.0` |
| **geoblaze** |  |  | `0.3.2` |
| **georaster-layer-for-leaflet** | Display GeoTIFFs and other types of rasters. Used by the Map Component and Map Util class for displaying single- and multi-band rasters. |  | `0.6.8` |
| **georaster** | Used by `georaster-layer-for-leaflet` for creating raster layers. |  | `1.5.6` |
| **jasmine-core** |  | Yes | `3.5.0` |
| **jasmine-spec-reporter** |  | Yes | `5.0.2` |
| **jquery** |  |  | `3.6.0` |
| **karma-chrome-launcher** |  | Yes | `3.1.0` |
| **karma-coverage-istanbul-reporter** |  | Yes | `3.0.3` |
| **karma-jasmine-html-reporter** |  | Yes | `1.5.4` |
| **karma-jasmine** |  | Yes | `4.0.1` |
| **karma** |  | Yes | `6.3.11` |
| **leaflet-mouse-position** |  |  | `1.2.0` |
| **leaflet-sidebar-v2** |  |  | `3.2.3` |
| **leaflet-svg-shape-marker** |  |  | `1.3.0` |
| **leaflet.zoomhome** |  |  | `1.0.0` |
| **leaflet** |  |  | `1.7.1` |
| **lodash** |  |  | `4.17.21` |
| **material-design-icons** |  |  | `3.0.1` |
| **moment** |  |  | `2.29.1` |
| **ng-packagr** |  |  | `13.1.3` |
| **ng-select2** |  |  | `1.4.1` |
| **ng-table-virtual-scroll** |  |  | `1.3.5` |
| **ngx-gallery-9**<br>**DELETION RECOMMENDED** |  |  | `1.0.6` |
| **ngx-showdown** |  |  | `6.0.0` |
| **papaparse** |  |  | `5.3.0` |
| **plotly.js** |  |  | `2.3.0` |
| **popper.js** |  |  | `1.16.1` |
| **protractor** |  | Yes | `7.0.0` |
| **rxjs** |  | Yes | `7.5.2` |
| **select2** |  |  | `4.0.13` |
| **showdown** |  |  | `1.9.1` |
| **ts-node** |  | Yes | `8.3.0` |
| **tslib** |  | Yes | `2.3.1` |
| **tslint** |  |  | `6.1.3` |
| **typescript** |  | Yes | `4.5.5` |
| **zone.js** |  | Yes | `0.11.4` |

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will
automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/`
directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
