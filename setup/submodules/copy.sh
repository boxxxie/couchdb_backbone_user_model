#!/bin/bash

# Change to this project's root folder
cd $(dirname "${0}")/../../


echo Copying submodules...


mkdir -p  attachments/lib/modules/

cp libraries/couchdb/share/www/script/jquery.couch.js attachments/lib/modules/
cp libraries/underscore/underscore-min.js attachments/lib/modules/

echo Finished copying submodules.


# Return to original folder
cd - > /dev/null
