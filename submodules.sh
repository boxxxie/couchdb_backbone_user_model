#!/bin/bash

cd $(dirname "${0}")

git submodule sync -q
git submodule update --init --recursive
git submodule foreach git clean -x -d -f --exclude node_modules/
git submodule foreach git reset --hard
git submodule foreach git checkout -f -q master
git submodule foreach git pull -q origin


cd - > /dev/null

./submodule-copy.sh
