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
* [Troubleshooting](#troubleshooting)

See the following resources for background information for the library.

* [Publishing private `npm` packages using GitHub Packages](https://javascript.plainenglish.io/publishing-private-npm-packages-using-github-packages-415993cd2da8).
* [Configuring npm for use with GitHub Packages](https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages).
* [Semantic Versioning](https://github.com/semver/semver/blob/master/semver.md).


## Building the Common Library

From the `ng-workspace` folder, type `../build-util/create-common-package.sh` to
build the project through Angular and create a tarball file that npm will use to
publish. This allows the library to be published using the created distributable
version of the library in the `dist/` folder, or by installing the local tarball
file in another local application's `package.json` dependencies. This is used for
testing the library.

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

3. Follow the instructions under [Building the Common Library](#building-the-common-library) above.

4. `cd` into the `dist/OpenWaterFoundation/common` folder.

5. Authenticate to GitHub Packages/npm by logging in to the GitHub Packages registry by using
the command:

    ```
    npm login --registry=https://npm.pkg.github.com --scope=OWNER
    ```

    replacing OWNER with the owner of the repository - `OpenWaterFoundation` in this case. Three
    prompts will display:

      * **Username** - GitHub username. This must be all lower case or it will ask again.
      * **Password** - GitHub account personal access token with `repo` and `read:packages`
      access permissions.
      * **Email** - GitHub email address.
  
    A successful login will show something similar to
    ```
      Logged in as <User> to scope @OpenWaterFoundation on https://npm.pkg.github.com/.
    ```

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

1. In the Common package, in the same directory as the package's `package.json` file, create or edit an `.npmrc` file and add
    ```
    @OWNER:registry=https://npm.pkg.github.com
    ```
    replacing `OWNER` with the name of the user or organization account that own the repository
    containing the project.
2. Copy the `.npmrc` file into the application as well. Similarly, this will be in
the same directory as its `package.json`, so GitHub Packages can find the project.
3. Configure the application's `package.json` to use the package being installed.
This means adding it to the dependencies. This needs to be done manually by a developer
(though an automated way will hopefully be done at some point). Once there, it will
be in the application's repository, and will be installed with the other npm packages
when the repo is pulled and `npm install` is performed. As an example, the application
dependencies would look something like the following:
    ```json
    {
      "name": "@my-org/my-app",
      "version": "1.0.0",
      "description": "An app that uses the @OpenWaterFoundation/common package.",
      "main": "index.js",
      "author": "Malcolm Reynolds",
      "license": "MIT",
      "dependencies": {
        "@OpenWaterFoundation/common": "^4.2.0"
      }
    }
    ```
    * **Because this step needs to be performed manually, there are a few key actions
    developers need to keep in mind**:
      1. When starting a new development session in between Common package production
      builds, the version of the Common package should be replaced by the relative path
      to the package's `dist/` build folder. This can be automatically done by running
      the `reinstall-common-lib.sh` script, which is located in the consuming application's
      top level `build-util/` folder. If the current application does not have the
      file, it can be copied over from the InfoMapper, or any other application that
      contains it.
      2. Once all testing has been completed and a new version of the Common package
      is ready to be published, follow the section above to
      [publish a GitHub Package](#publishing-a-github-package). This takes care of
      the package steps, but an action still needs to be performed on the application
      side of things. The developer should try to remember that the application's
      `package.json` dependency for the Common package is still pointing to the package's
      local `dist/` folder. **This should be updated to the package version
      that was just published to npm before the application code is pushed to
      its remote repository**. If forgotten (which the author of this has before),
      the application's Common package dependency value will be a local path, and
      not the version that npm should look up in its registry. Even worse, if the
      application repo is updated by a third party, their version will also be replaced
      by this path. This flow will hopefully be automated somehow in the future,
      so the burden of having to remember this by the developer can be lessened.
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

See the Common library
[Changelog](https://github.com/OpenWaterFoundation/owf-app-dev-ng/blob/main/ng-workspace/projects/OpenWaterFoundation/common/CHANGELOG.md).

## Running Unit Tests

From anywhere in the Angular project, run either `ng test @OpenWaterFoundation/common`
or `npm test @OpenWaterFoundation/common` to execute the unit tests via
[Karma](https://karma-runner.github.io).

## Code Scaffolding

Run `ng generate component component-name --project common` to generate a new component. You can
also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project common`.
> Note: Don't forget to add `--project common` or else it will be added to the default project
in your `angular.json` file. 

## Further help

The common library uses some helper classes that use static methods. Angular libraries
will run into a metadata error if these classes are used. The only solution is to
"suppress" the error by adding the line

```typescript
// @dynamic
```

right above the class declaration. The error will be stopped, and the library
can be built.

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

For more information on how this library is used, go to the [AngularDev README]()

## Troubleshooting ##

This section aims to help alleviate any issues caused by updates, authenticating, and
other necessary actions to use, create, and/or publish the OWF Common Library.