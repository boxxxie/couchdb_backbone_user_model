#!/bin/bash

# Change to this project's root folder
cd $(dirname "${0}")/../../


sudo npm install -g couchapp
npm install couchapp

# Return to original folder
cd - > /dev/null
