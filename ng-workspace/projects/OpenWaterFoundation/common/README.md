# Open Water Foundation Common Library

This package contains the Open Water Foundation (OWF) Angular `common` library, which is used to
develop common library code in the AngularDev workspace. It can then be used by other Angular
applications such as OWF InfoMapper.

* [Building the Common Library](#building-the-common-library)
* [Publishing the Common Library](#publishing-the-common-library)
* [Setting up a Library to use GitHub Packages](#setting-up-a-library-to-use-github-packages)
* [Changelog](#changelog)
* [Running Unit Tests](#running-unit-tests)
* [Code Scaffolding](#code-scaffolding)
* [Further Help](#further-help)

See the following resources for background information for the library.

* [Publishing private `npm` packages using GitHub Packages](https://javascript.plainenglish.io/publishing-private-npm-packages-using-github-packages-415993cd2da8).
* [Configuring npm for use with GitHub Packages](https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages).
* [Semantic Versioning](https://github.com/semver/semver/blob/master/semver.md).


## Building the Common Library

From the `ng-workspace` folder, type `../build-util/create-common-package.sh` to build the
project through Angular and create a tarball file through npm. This allows the library to be
published using the created distributable version of the library in the `dist/` folder, or
by installing the local tarball file in another local application's `package.json` dependencies.
This is used for testing the library.

## Publishing the Common Library ##

To publish as a GitHub Package using npm, perform the following steps:

>Note: If publishing the package for the first time, skipping to step 3 will publish the package
as the default version of `0.0.1`.

1. `cd` into `ng-workspace/projects/OpenWaterFoundation/common`
2. `npm version <version_number>` where `<version_number>` is the new version to be published.
    If a version of the library has already been published, the version number must be
    incremented.
    Using GitHub semantic versioning is highly advised. In-depth information can be found at the
    [semver GitHub account](https://github.com/semver/semver/blob/master/semver.md).

3. Follow the instructions under [Building the Common Library](#building-the-common-library)
above.

4. `cd` into the `dist/OpenWaterFoundation/common` folder.

5. Authenticate to GitHub Packages/npm by logging in to the GitHub Packages registry by using
the command

    ```
    npm login --registry=https://npm.pkg.github.com --scope=OWNER
    ```

    replacing OWNER with the owner of the repository - OpenWaterFoundation in this case. Three
    prompts will display:

      1. **Username** - GitHub username. This must be all lower case or it will ask again.
      2. **Password** - The GitHub Package access Token (GitHub password would also work).
      3. **Email** - GitHub email address.

6. `npm publish` to publish the package using GitHub packages. More information can be found at
[Setting up a Library to use GitHub Packages]().

## Setting up a Library to use GitHub Packages ##

The following sections include authenticating and publishing to GitHub packages, and the
installing of GitHub packages in an application. This section is mostly for developers, and can
be largely skipped if only the installation and utilization of the common library is needed. To
use the library, follow number `4` under
[Installing a GitHub Package](#installing-a-github-package).

### Publishing a GitHub Package ###

The `.npmrc` file can be used to configure the scope mapping for the project, and prevents other
developers from accidentally publishing the package to npmjs.org instead of GitHub Packages.
Publish the package as follows:

1. Authenticate to GitHub Packages. This is done in
[Authenticating to GitHub Packages](#authenticating-to-github-packages) above. 
2. Add `registry=https://npm.pkg.github.com/OWNER` in the `.npmrc` file, replacing `OWNER` with
the name of the user or organization that own the repository containing the project.
3. Add the `.npmrc` file to the repository via `git push`.
4. GitHub Package set up is now complete. Publish the package by following the instructions in
[Publishing the Common Library](#publishing-the-common-library).

### Setting up a GitHub Package to be Installed ###

The following instructions are for setting up an already existing application to be able to
communicate with GitHub so that an `npm` created GitHub Package can be consumed:

1. In the same directory as the app `package.json` file, create or edit an `.npmrc` file and add
    ```
    @OWNER:registry=https://npm.pkg.github.com
    ```
    replacing `OWNER` with the name of the user or organization account that own the repository
    containing the project.
2. Add the `.npmrc` file to the repo the application belongs to so GitHub Packages can find the
project.
3. Configure the `package.json` to use the package being installed. This means adding it to the
dependencies. This needs to be done manually by a developer, then once there, it will be in the
repository and used when cloned/fetched/pulled. For example, the dependencies property would
look something like:
    ```json
    {
      "name": "@my-org/my-app",
      "version": "1.0.0",
      "description": "An app that uses the @openwaterfoundation/common package",
      "main": "index.js",
      "author": "",
      "license": "MIT",
      "dependencies": {
        "@OpenWaterFoundation/common": "0.0.1-alpha.6"
      }
    }
    ```
4. The package can now be installed by typing `npm install` like any other npm package.

### Installing a GitHub Package  ###

To install the dependencies of a project using GitHub Packages from a git clone, perform the
following steps (assuming InfoMapper is being used):

1. `cd` into the directory that will hold the repository folder.
2. `git clone git@github.com:OpenWaterFoundation/owf-app-infomapper-ng.git`
3. `cd owf-app-infomapper-ng/infomapper`
4. Follow step `5` under [Publishing the Common Library](#publishing-the-common-library)
5. Run `npm install`

## Changelog ##

### 0.0.1-alpha.6 ###

Bug Fixes

Code Refactoring

Features

* 

Performance Improvements

Breaking Changes

### 0.0.1-alpha.5 ###

Bug Fixes

Code Refactoring

Features

Performance Improvements

Breaking Changes

### 0.0.1-alpha.3 ###

Bug Fixes

Code Refactoring

Features

Performance Improvements

Breaking Changes

### 0.0.1-alpha.2 ###

* Initial working common library
* Contains dialogs, services, multi project environment, 


## Running Unit Tests

Run `ng test common` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Code Scaffolding

Run `ng generate component component-name --project common` to generate a new component. You can
also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project common`.
> Note: Don't forget to add `--project common` or else it will be added to the default project
in your `angular.json` file. 

## Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

For more information on how this library is used, go to the [AngularDev README]()