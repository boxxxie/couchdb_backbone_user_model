#!/bin/bash

# Change to this script's folder
cd $(dirname "${0}")


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


./submodule-copy.sh


# Return to original folder
cd - > /dev/null
