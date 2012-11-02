#!/bin/bash

# Change to this project's root folder
cd $(dirname "${0}")/../../


git submodule sync -q
echo
git submodule foreach git clean -x -d -f --exclude node_modules/
echo
git submodule foreach git reset --hard
echo
git submodule foreach git checkout -f -q master
echo
git submodule foreach git pull -q origin
echo


# Return to original folder
cd - > /dev/null
