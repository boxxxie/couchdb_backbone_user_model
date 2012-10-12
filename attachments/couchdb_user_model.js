if(Backbone && !Backbone.CouchDB_User && $.couch){
  (function(){
    var con;
    Backbone.couch_user_connector = con = {
      config: {
        db_name: "_users" //have a feeling this isn't used
      },
      helpers: {
        make_db: function() {
          var db;
          db = $.couch.db(con.config.db_name);
          if (con.config.base_url != null) {
            db.uri = "" + con.config.base_url + "/" + con.config.db_name + "/";
          }
          return db;
        }, 
      },
      read: function(model, opts) {
        return con.read_model(model, opts);
      },
      read_model: function(model, opts) {
        if (!model.id) {
          throw new Error("The model has no id property, so it can't get fetched from the database");
        }
        return this.helpers.make_db().openDoc(model.id, {
          success: function(doc) {
            opts.success(doc);
            return opts.complete();
          },
          error: function(status, error, reason) {
            var res;
            res = {
              status: status,
              error: error,
              reason: reason
            };
            opts.error(res);
            return opts.complete(res);
          }
        });
      },
      create: function(model, opts) {
        var coll, vals;
        vals = model.toJSON();
        return this.helpers.make_db().saveDoc(vals, {
          success: function(doc) {
            opts.success({
              _id: doc.id,
              _rev: doc.rev
            });
            return opts.complete();
          },
          error: function(status, error, reason) {
            var res;
            res = {
              status: status,
              error: error,
              reason: reason
            };
            opts.error(res);
            return opts.complete(res);
          }
        });
      },
      update: function(model, opts) {
        return this.create(model, opts);
      },
      del: function(model, opts) {
        return this.helpers.make_db().removeDoc(model.toJSON(), {
          success: function() {
            return opts.success();
          },
          error: function(nr, req, e) {
            var res;
            if (e === "deleted") {
              opts.success();
              return opts.complete();
            } else {
              res = {
                status: status,
                error: error,
                reason: reason
              };
              opts.error(res);
              return opts.complete(res);
            }
          }
        });
      }
    };


    Backbone.CouchDB_User = Backbone.Model.extend({
      url:function(){return '_users/' + 'org.couchdb.user:'+ this.name;},
      sync:function(method, model, opts) {
        if (opts.success == null) {
          opts.success = function() {};
        }
        if (opts.error == null) {
          opts.error = function() {};
        }
        if (opts.complete == null) {
          opts.complete = function() {};
        }
        switch (method) {
        case "read":
          return con.read(model, opts);
        case "create":
          return con.create(model, opts);
        case "update":
          return con.update(model, opts);
        case "delete":
          return con.del(model, opts);
        }
      },
      signup: function() {
        var user_model = this;
        var user_data = user_model.toJSON();
        var password = user_data.password;
        var password_confirm = user_data.password_confirm;
        delete user_data.password;
        delete user_data.password_confirm;

        var errors = {};
        if ( !password_confirm || password !== password_confirm ) {
          errors["password_confirm"] = "Passwords do not match";
        }
        if ( !user_data.name ) {
          errors["name"] = "Name is required";
        }

        if ( _.isEmpty(errors) ) {
          var error_handler = function(status, error, reason) {
            console.log(status);
          }
          $.couch.signup(user_data, password, { error: error_handler })
            .done(function(a,b,c){
              user_model.trigger('registered', user_model);
            })
            .fail(function(a,b,c){
              user_model.trigger('error:registered');
            });
        }
        else {
          user_model.trigger('error:registered', errors);
        }
      },
      session: function() {
          var user_model = this;
          var user_name = user_model.get('name');
          $.couch.session()
            .done(function(resp){
              if(!(resp && resp.userCtx && resp.userCtx.name)){throw 'no user cookies'}
              var user_name = resp.userCtx.name;
              $.couch.userDb()
                .pipe(function(db){
                  return db.openDoc("org.couchdb.user:"+user_name)
                })
                .done(function(userDoc){
                  user_model.set(userDoc);
                  user_model.trigger('loggedin',user_model);
                })
                .fail(function(){
                  user_model.trigger('error:loggedin');
                })
            });
      },
      login: function() {
        var user_model = this;
        var user_name = user_model.get('name');
        var name_pass = _.pick(user_model.toJSON(),'name','password');
        $.couch.login(name_pass)
          .pipe(function(nothing){
            return $.couch.userDb()
          })
          .pipe(function(user_db){
            return user_db.openDoc("org.couchdb.user:"+user_name)
          })
          .done(function(userDoc){
            user_model.set(userDoc);
            user_model.trigger('loggedin');
          })
          .fail(function(){
            user_model.trigger('error:loggedin');
          })
      },
      logout: function() {
        var user_model = this;
        user_model.clear({silent: true});
        $.couch.logout()
          .done(_.bind(user_model.trigger,user_model,'loggedout'))
          .fail(_.bind(user_model.trigger,user_model,'error:loggedout'))
      },
      change_password:function(new_password){
        var user_model = this;
        return $.when(user_model.save({password:new_password}))
          .pipe(_.bind(user_model.login, user_model))
          .done(_.bind(user_model.trigger, user_model,"password-changed"))
          .fail(_.bind(user_model.trigger, user_model,"error:password-changed")); 
      }
    });
  })()
}

