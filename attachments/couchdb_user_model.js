if(Backbone && !Backbone.CouchDB_User && $.couch){
  (function(){
    var con;
    Backbone.couch_user_connector = con = {
      config: {
        db_name: "_users",
        //ddoc_name: "backbone_example",
        //view_name: "byCollection",
        //list_name: null,
        //global_changes: false,
        //base_url: null
      },
      helpers: {
        extract_collection_name: function(model) {
          var _name, _splitted;
          if (model == null) {
            throw new Error("No model has been passed");
          }
          if (!(((model.collection != null) && (model.collection.url != null)) || (model.url != null))) {
            return "";
          }
          if (model.url != null) {
            _name = _.isFunction(model.url) ? model.url() : model.url;
          } else {
            _name = _.isFunction(model.collection.url) ? model.collection.url() : model.collection.url;
          }
          if (_name[0] === "/") {
            _name = _name.slice(1, _name.length);
          }
          _splitted = _name.split("/");
          _name = _splitted.length > 0 ? _splitted[0] : _name;
          _name = _name.replace("/", "");
          return _name;
        }
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
        //coll = this.helpers.extract_collection_name(model);
        if (coll.length > 0) {
          vals.collection = coll;
        }
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
      signup:function(){
        var user_model = this;
        var user_data = this.toJSON();
        var password = user_data.password;
        delete user_data.password;
        $.couch.signup(user_data, password,{
          success:function(){
	    user_model.trigger('registered');
          },
          error:function() {
            user_model.trigger('error:registered');
          }
        });
      },
      login: function() {
        var user_model = this;
        $.couch.login({ 
          name: user_model.get('name'), 
          password: user_model.get('password'), 
          success: function() {
            user_model.trigger('loggedin');
          },
          error:function() {
            user_model.trigger('error:loggedin');
          }
        });
      },
      logout: function() {
        var user_model = this;
        $.couch.logout({
          success: function() {
            user_model.trigger('loggedout');
          },
          error: function(){
            user_model.trigger('error:loggedout');
          }
        });
      },
      change_password:function(new_password){
        var user_model = this;
        //var
      }
    });
    
/*
    function log_args(namespace){
      return function(){
        console.log(namespace,arguments)
      }
    }

    $.couch.logout({success:log_args('success'),error:log_args('error')});
*/

  })()
}

