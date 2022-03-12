#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL.

# This script performs the following actions depending on the option provided when
# run:
#
# 1. (default) Builds the Common library production files for testing, and uses
# npm pack to create the gzipped tarball file for publishing.
# 2. Builds the angulardev application in a way that the Map Component can be embedded
# in a non-Angular created website.
# 3. Prints a help message that describes the above two script actions.
#

BCyan='\033[1;36m'        # Cyan
Green='\033[0;32m'        # Green
Reset='\033[0m'           # Text Reset

printUsage() {
  echo ""
  echo "  Usage: ${scriptName} [options ...]"
  echo ""
  echo "  Build either the AngularDev application or Common library production files."
  echo "  By default, this script performs ng build on the Common library only and "
  echo "  uses npm to package them for production."
  echo ""
  echo "  Command parameter options:"
  echo ""
  echo "  -R          Overrides the default production build on the Common library,"
  echo "              and instead builds the angulardev application with the Map Component"
  echo "              as the entry component. All dist/angulardev/ files can then be"
  echo "              used to embed the solo Map Component in another website."
  echo "  -h          Prints this usage message and exits."
  echo ""
}

# SCRIPT ENTRY POINT
# By default, keep the production build file names to the default hash values. This
# can be changed using a command line option.
renameDistFiles=false
# Get the folder where this script is located since it may have been run from any
# folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# The name of this bash script.
scriptName=$(basename "$0")
# repoFolder is owf-app-dev-ng/.
repoFolder=$(dirname "${scriptFolder}")
# mainFolder is ng-workspace/.
mainFolder="${repoFolder}/ng-workspace"
# The common (Common Library) dist folder after ng build.
commonDistFolder="${mainFolder}/dist/OpenWaterFoundation/common"
# The angulardev (angulardev application) dist folder after ng build.
angularDevDistFolder="${mainFolder}/dist/angulardev"

while getopts ":hR" opt; do
  case "${opt}" in
    # Prints the usage help message and exits.
    h)
      printUsage
      exit 0
      ;;
    # Replace the created bundle files in dist/ from the cache-busting hash to the
    # supplied version. The version number is found in the app.component.ts file
    # in angulardev.
    R)
      version=$(grep "Version:" "${mainFolder}/projects/angulardev/src/app/app.component.ts" | cut -b 15-)
      renameDistFiles=true
      ;;
    # An option was provided that did not match any in getopts.
    \?)
      echo "  Invalid option: ${OPTARG}" 1>&2
      echo ""
      printUsage
      exit 1
      ;;
    # The supplied option required an arument, but none was provided.
    :)
      echo "  Invalid option: ${OPTARG} requires an argument" 1>&2
      echo ""
      printUsage
      exit 1
      ;;
  esac
done

if [ ${renameDistFiles} = "true" ]; then
  # Build the AppDev application files with the Map Component as entryComponent.
  echo ""
  echo "))> Creating the AppDev application default production build files."
  echo "))> Running the build as 'ng build --configuration production --outputHashing=all'"
  echo ""
  (cd "${mainFolder}" && ng build --configuration production)

  echo "))> Navigating to ${angularDevDistFolder}."
  cd "${angularDevDistFolder}" || exit
  # Replace the hash value with version in the main bundle files. The destination
  # file needs to be a string to insert the version variable.
  # echo "))> Renaming application build files to include '${version}' and removing index.html."
  echo -e "))> Concatenating main bundle files into the ${BCyan}map-component.${version}.js${Reset} file."

  cat scripts.* main.* polyfills.* runtime.* > "map-component.${version}.js"
  rm scripts.* main.* polyfills.* runtime.* index.html favicon.ico
  mv styles.* "styles.${version}.css"

  echo "))> Done."
  echo -e "))> ${Green}Successfully built angulardev app with the Map Component as entryComponent.${Reset}"

else
  # Build the Common Library files.
  echo ""
  echo "))> Creating Common library default production build files."
  echo ""
  # Change directory to the main folder and build the common library in a subshell.
  (cd "${mainFolder}" && ng build @OpenWaterFoundation/common --configuration production)

  echo "))> Creating the npm zipped tarball for the Common library."
  echo ""
  # Change directory to the common dist folder in another subshell.
  (cd "${commonDistFolder}" && npm pack)
  echo ""
  echo "))> Done."
  echo -e "))> ${Green}Successfully built, gzipped and tarballed the @OpenWaterFoundation/common production files.${Reset}"
fi
