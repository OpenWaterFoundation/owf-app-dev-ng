# owf-app-dev-ng

This repository contains the Open Water Foundation (OWF) Angular development web application (AngularDev),
which is used to develop common library code.
The libraries can then be used by other Angular applications such as OWF InfoMapper.

* [Introduction](#introduction)
* [Repository Contents](#repository-contents)
* [Getting Started](#getting-started)
* [Sharing Libraries with AngularDev](#sharing-libraries-with-angulardev)
* [Sharing Libraries with InfoMapper](#sharing-libraries-with-infomapper)
* [Angular Tasks](#angular-tasks)
* [Deploying the Site to AWS](#deploying-the-site-to-aws)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [Contributors](#contributors)
* [License](#license)

----------------------

## Introduction ##

This repository contains Angular software for common (shared) Angular libraries
that can be used to streamline development of other Angular applications.
Development uses a simple application (AngularDev) that is used for development and testing.

The focus of development is applications developed by OWF.
Libraries are currently not published to the public `npm` registry.
However, it is possible that the libraries will be of benefit to others and
publishing to public `npm` registry may occur in the future.
OWF is evaluating the best way to share libraries, for example using [GitHub packages](https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages).
The following libraries are included in this repository, in addition to AngularDev application:

| **Library** | **`npm` package** | **Description** |
| -- | -- | -- |
| `owf-common` | `ng-owf-common` | Useful common code, including application utilities, classes ported from Java, and UI components based on Angular Material. |
| `owf-d3` | `ng-owf-d3` | D3.js dynamic visualizations. |
| `owf-plotly` | `ng-owf-plotly` | Plotly.js chart visualizations. |
| `owf-showdown` | `ng-owf-showdown` | Markdown to HTML package using showdown.js. |

The library code is packaged with `npm` to share locally with other applications,
including the following OWF applications.

| **Application** | **Description** |
| -- | -- |
| [OWF InfoMapper](https://github.com/OpenWaterFoundation/owf-app-infomapper-ng) | Web mapping and visualization application. |
| InfoMapper Map | Single map that can be embedded in a web page - **to be developed**. |
| [SNODAS web application](https://github.com/OpenWaterFoundation/owf-app-snodas-ng) | Provides access to SNODAS snow data - OWF has developed an Angular version based on previous JavaScript/HTML prototype and needs to migrate to new integrated components.  **Conversion to use new libraries is planned.** |

See the following resources for background information.
This repository generally follows the conventions for an Angular 
"multi-project workspace".

* [Angular](https://angular.io/) web framework
* [Angular - Workspace and project file structure](https://angular.io/guide/file-structure)
* [Angular - Creating Libraries](https://angular.io/guide/creating-libraries)
* [`npm` - Creating and publishing private packages](https://docs.npmjs.com/creating-and-publishing-private-packages)

## Repository Contents ##

The following folder structure is recommended for development.
Top-level folders should be created as necessary.
The following folder structure clearly separates user files (as per operating system),
development area (`owf-dev`), product (`AngularDev`),
repositories for product (`git-repos`), and specific repositories for the product.
Currently the application only includes one repository;
however, additional repositories may be added in the future.
Folders within the Angular workspace adhere to Angular standards for a "multi-project workspace".
Repository folder names should agree with GitHub repository names.
Scripts in repository folders that process data should detect their starting location
and then locate other folders using relative paths.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    AngularDev/                                Angular development application product files.
                                               Other applications such as InfoMapper are similar.
      ------------------------------------------------------------------------------------------
      ----         Above are recommended, below folder names should match exactly.          ----
      ------------------------------------------------------------------------------------------
      git-repos/                               Git repositories for AngularDev application.
        owf-app-dev-ng/                        Angular development application repository.
          .gitattributes                       Main repository attributes.
          .gitignore                           Main repository .gigitnore to ignore files.
          README.md                            This file.
          build-util/                          Useful scripts for building software.
          ng-workspace/                        Angular workspace for the development application.
                                               Use a generic name to emphasize Angular framework.
            dist/                              Used to build distributions (contents are .gitignored since dynamic).
            node_modules/                      Third party libraries installed via `npm install`.
            projects/                          Standard Angular folder for multi-project workspace.
              angulardev/                      Application project containing main application.
                src/                           Standard Angular folder for source code.
                  app/                         Standard Angular folder indicating application.
                    *                          Application source code.
                  assets/                      Standard Angular folder containing run-time configuration and data.
                    app-config.json            Application configuration file.
              owf-common/                      Library project containing common (shared) OWF code.
                                               This library is used by other `owf-*` libraries
                                               Specific examples are provided below for illustration.
                src/                           Standard Angular folder for source code.
                  lib/                         Main entry point into the library.
                                               Not required to be named lib. Might be
                                               changed in the future. All subsequent
                                               folders under owf-common are considered
                                               secondary entry points.
                    *                          Any classes or module for the owf-common
                                               library main entry point. (Empty for now)
                  public-api.ts                Exported members of the library main
                                               entry point.
                ts/                            Time series package (ported from Java).
                  TS.ts                        Time series class.
                  package.json                 Tells ng-packagr to compile this as a
                                               secondary entry point into the library.
                  public-api.ts                Exported members of this ts/ module as
                                               a secondary entry point.
                ui/                            User interface components (based on Material).
                  dialog/                      Code related to dialogs.
                  window-manager/              Code related to Window Manger for managing dialogs.
                    WindowManager.ts           Class to manager windows.
                    package.json
                    public-api.ts
                util/                          Utility code package (ported from Java).
                  time/                        Utility code for date/time.
                    DateTime.ts                Class for date/time.
                    package.json
                    public-api.ts
              owf-d3/                          Library project containing D3.js visualizations.
                *                              Follow standard Angular folder structure,
                                               with folders to organize package's classes.
              owf-plotly/                      Library project containing plotly.js visualizations.
                *                              Follow standard Angular folder structure,
                                               with folders to organize package's classes.
              owf-showdown/                    Library project containing Showdown code (Markdown viewer).
                *                              Follow standard Angular folder structure,
                                               with folders to organize package's classes.
```

## Getting Started ##

This section explains how to initialize the development environment for AngularDev.

### Prerequisites: ###

Development and deployment of this Angular based web application requires the following tools:

1. Node.js (version 10.x or higher) and npm (version 5.5.1 or higher):
   * Check which version of Node.js is installed by running `node -v`.
   To get Node.js, go to [nodejs.org](nodejs.org). 
   * Check which version of npm is installed by running `npm -v`.
   To update npm run `npm install npm@latest -g`.
2. Angular CLI (Command Line Interface):
   * Check which version of Angular CLI is installed by running `ng --version`.
   If Angular CLI needs installed run `npm install -g @angular/cli`.

### Running the project: ###

Once all prerequisites have been installed, clone this repository onto the
local machine using the recommended folder structure and `cd` into the `infomapper` directory.
Use the command `npm install` to download all necessary packages and dependencies
used by the application.
Run the site by running the command `ng serve`.
Optionally add the flag `--open` to automatically open the application in a new web browser tab.

**Need to explain library build process within this application (see previous section).**

## Sharing Libraries with AngularDev ##

### Library Setup ###

The AngularDev application uses many different library modules under the `owf-common/`
folder (e.g. `ts/`, `ui/`, and `util/`) that can be shared with the `angulardev` main
application. To use these modules from the `owf-common` library, the library must be
built using the following:

1. `cd` into `projects/`. 
2. Use the command `ng build owf-common` to build the library and put it into the
`dist/` folder under the `ng-workspace`. Now the library and its modules are ready
to be consumed by the application.
3. In a developing environment, if the library is also being updated, an option for
the build command is useful. `ng build --watch` will not only build the library, but
will keep listening to the file and watch for any other updates to it. This way, both
the app and library can be updated simultaneously. **NOTE:** `ng build --watch` must
be run before `ng serve`. If built after the app's server is running, warnings and
errors will occur.

### Application Setup ###

In the application, add the following as a property to the **compilerOptions** in the
`projects/tsconfig.ts` file so the `angulardev` app knows where to look when importing
classes/modules.

```json
"paths": {
  "@owf-common": [
    "dist/owf-common"
  ],
  "@owf-common/*": [
    "dist/owf-common/*"
  ]
}
```

The first path tells the app that importing something from `@owf-common` is the main
entry point for the library (currently empty). This may be updated to something else
in the future.

The second will be for all other modules in the library, where a more descriptive path
to the module will be needed, such as `@owf-common/ui/window-manager/WindowManager`.
This way, there will be no ambiguity as to where the module originated from.

* Use GitHub packages or local files to hand off `npm` packages?

The following is an example of `import` to use a library class.
Goals of the implementation are:

* Follow standard Angular syntax and protocols.
* Clearly indicate "namespace" `owf-common` to distinguish as OWF library and avoid conflict with similarly named classes in other libraries.
* Use folders to emphasize hierarchy of code, similar to other languages.
* Code should be the same whether the library is used in AngularDev application, InfoMapper, or other application.

```javascript
import { WindowManager } from "@owf-common/ui/window-manager/WindowManager"
```

The `projects/tsconfig.ts` file will look something like the following after the paths
property has been entered:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    ...,
    "paths": {
      "@owf-common": [
        "dist/owf-common"
      ],
      "@owf-common/*": [
        "dist/owf-common/*"
      ]
    }
  }
  ...
}
```

## Sharing Libraries with InfoMapper ##

Libraries developed in this repository can be shared with other applications.
The section uses the InfoMapper application as an example to explain how this occurs.

The following is a summary of InfoMapper folder structure.
**Note - InfoMapper will likely be converted to a multi-project workspace in the future
but the following currently uses a single application project folder structure.**

```
C:\Users\user\                   User's home folder for Windows.
/c/Users/user/                   User's home folder for Git Bash.
/cygdrive/C/Users/user/          User's home folder for Cygwin.
/home/user/                      User's home folder for Linux.
  owf-dev/                       Work done on Open Water Foundation projects.
    InfoMapper/                  InfoMapper product files
      ------------------------------------------------------------------------------------------
      ----         Above are recommended, below folder names should match exactly.          ----
      ------------------------------------------------------------------------------------------
      git-repos/                 Git repositories for the InfoMapper application.
        owf-app-infomapper-ng/   Angular web application.
          infomapper/            InfoMapper Angular project folder.
            node_modules/        Third party libraries installed via `npm install`.
                                 Uses a specific name since only one project.
                                 OWF libraries that are deployed from AngularDev application
                                 will install here.
            src/                 Standard Angular folder for source code.
              app/               Standard Angular folder indicating application.
                *                Application source code.
              assets/            Standard Angular folder containing run-time configuration and data.
                app-config.json  Application configuration file.
                *                Other runtime configuration and data files.
```

* Explain how the application sees library modules via `npm` packages and `node_modules`.
* See Sofia's [owf-app1-ng](https://github.com/OpenWaterFoundation/owf-app1-ng) documentation.
* Copy the above here and tighten up, or add a separate Markdown file in this repo.
* Should this use GitHub packages to get `npm` packages?
* `tsconfig.json`
* `import` syntax
* anything else?

## Angular Tasks ##

**Need to describe common tasks with checklists and examples such as the following,
maybe in separate README.**

* naming conventions
* adding a class (for non-UI classes)
* adding a component (for UI classes)
* adding a new library
* adding a test
* running tests
* etc.

## Deploying the Site to AWS ##

**This section needs to be updated.  It may be helpful to deploy the application to cloud server for testing.
The following was copied from InfoMapper but has not been updated for AngularDev.**

The site can be built in a `dist` folder for local testing by using
the command

`ng build --prod --aot=true --baseHref=. --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false`

The content of the `dist` folder can imitate a production build of the
InfoMapper. To run the InfoMapper in its distributable form, navigate to
the `build-util` folder and run the `run-http-server-8000.sh` file. In a
web browser, type in `http://localhost:8000/`, then click on
**dist/ > infomapper** to run the InfoMapper.

Once checked locally, deploy to the Amazon S3 site by
running the following in the `build-util` folder using a Windows command shell:

```
copy-to-owf-amazon-s3.bat
```

For example, see the deployment script for the Poudre Basin Information
InfoMapper implementation.
[Poudre Basin Information](http://poudre.openwaterfoundation.org/latest/#/content-page/home)

The above can be run if Amazon Web Services credentials are provided.
A batch file is used to overcome known issues running in Git Bash.

## Contributing ##

Contributions can be made via normal Git/GitHub protocols:

1. Those with commit permissions can make changes to the repository.
2. Use GitHub Issues to suggest changes (preferred for small changes).
3. Fork the repository and use pull requests.
Any pull requests should be based on current master branch contents.

## Maintainers ##

The AngularDev application and libraries are maintained by the Open Water Foundation.

## License ##

The AngularDev and library code are licensed under the GPL v3+ license. See the [GPL v3 license](LICENSE.md).
