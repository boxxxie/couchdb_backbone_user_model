#!/bin/bash

# Change to this script's parent folder
cd $(dirname "${0}")/../


./setup/submodules/update.sh
./setup/submodules/copy.sh


# Return to original folder
cd - > /dev/null
