#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# repoFolder is owf-app-dev-ng.
repoFolder=$(dirname "${scriptFolder}")
# mainFolder is ng-workspace.
mainFolder="${repoFolder}/ng-workspace"
# The owf-common dist folder after ng build
commonDistFolder="${mainFolder}/dist/OpenWaterFoundation/common"

# Change directory to the main folder and build the common library.
(cd "${mainFolder}" && ng build @OpenWaterFoundation/common --prod) 
# Change directory to the owf-common dist folder
(cd "${commonDistFolder}" && npm pack)