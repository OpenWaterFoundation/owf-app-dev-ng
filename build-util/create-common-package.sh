#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL.

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
  echo "  -R                 Overrides the default production build on the Common"
  echo "                     library, and instead builds the angulardev application."
  echo "                     Replaces the hash value in each main bundle file in"
  echo "                     its dist/ folder to the version number found in the"
  echo "                     application's app.component.ts file."
  echo "  -h                 Prints this usage message and exits."
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
scriptName=$(basename $0)
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
    # supplied version.
    R)
      version=$(cat "${mainFolder}/projects/angulardev/src/app/app.component.ts" | grep "Version:" | cut -b 15-)
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
  # Build the AppDev application files.
  echo "  Creating the AppDev application default production build files."
  (cd "${mainFolder}" && ng build --prod)

  echo "  Renaming application build files to replace hash value with ${version}."
  cd "${angularDevDistFolder}"
  # Replace the hash value with version in the main bundle files. The destination
  # file needs to be a string to insert the version variable.
  mv main-es5.* "main-es5.${version}.js"
  mv main-es2015.* "main-es2015.${version}.js"
  mv polyfills-es5.* "polyfills-es5.${version}.js"
  mv polyfills-es2015.* "polyfills-es2015.${version}.js"
  mv runtime-es5.* "runtime-es5.${version}.js"
  mv runtime-es2015.* "runtime-es2015.${version}.js"
  mv scripts.* "scripts.${version}.js"
  mv styles.* "styles.${version}.css"

  echo "  Application files successfully renamed."
  echo ""

else
  # Build the Common Library files.
  echo "  Creating Common library default production build files."
  echo ""
  # Change directory to the main folder and build the common library in a subshell.
  (cd "${mainFolder}" && ng build @OpenWaterFoundation/common --prod)

  echo "  Creating the npm zipped tarball for the Common library."
  echo ""
  # Change directory to the common dist folder in another subshell.
  (cd "${commonDistFolder}" && npm pack)

fi
