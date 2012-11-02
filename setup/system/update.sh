#!/bin/bash

# Change to this project's root folder
cd $(dirname "${0}")/../../


sudo npm update -g couchapp
npm update couchapp

# Return to original folder
cd - > /dev/null
