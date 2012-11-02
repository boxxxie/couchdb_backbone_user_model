# couchdb_backbone_user_model

A wrapper around the user system `_users` in CouchDB, so they can be used for authentication in a web app.

# Installation

```bash
./setup/install.sh
```

# Maintenance

```bash
./setup/update.sh
```

# Tests

Create the database `couchdb_user_model_testing`.

```bash
./push.sh
```

Run tests through [`test/test.html`](http://localhost:5984/couchdb_user_model_testing/_design/app/test/test.html) or mocha through `test/test.js`.

