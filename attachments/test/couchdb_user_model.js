function _throw(things){
  return function(){
    throw things;
  }
}
function   call(done){
  return function(){
    done()
  }
}

/*function log_args(namespace){
  return function(){
    console.log(namespace,arguments)
  }
}*/

describe('mocha/chai',function(){
  it('testing tests',function(){ 
    assert.typeOf('foo','string','foo is string');
  });
});

describe('jquery.couch',function(){
  it('should exist',function(){
    expect(jQuery).to.have.property('couch');
  })
});

describe('Backbone', function() {
  it('should have CouchDB_User model', function() {
    expect(Backbone).to.have.property('CouchDB_User');
  });
});

describe('user model',function(){
  var user_pass = $.couch.newUUID();
  var user_name = $.couch.newUUID();
  var changed_password = $.couch.newUUID();
  var user_defaults = {
    name:user_name,
    password:user_pass,
    roles:['my_role'],
    custom_field:'my custom field'
  };
  var user_model = new Backbone.CouchDB_User(user_defaults);

  it('should not be able to sign up with invalid confirm password',function(done){
    user_model.set("password_confirm", "foobar");
    user_model.on('error:registered', function(error) { 
      expect(error).to.have.property("password_confirm");
      done();
    });
    user_model.signup();
  });

  it('should not be able to sign up if name is missing', function(done) {
    user_model.set("name", "");
    user_model.on('error:registered', function(error) { 
      expect(error).to.have.property("name");
      done();
    });
    user_model.signup();
    user_model.set("name", user_name);
  });

  it('should be able to sign up',function(done){
    function make_sure_user_was_added(){
      $.couch.userDb(
        function(user_db){
          user_db.openDoc("org.couchdb.user:"+user_name, {
            success:call(done),
            error:_throw( "user doesn't exist")
          })
        })
    }
    user_model.set("password_confirm", user_model.get("password"));
    user_model.on('registered',make_sure_user_was_added);
    user_model.on('error:registered', _throw('uhoh'));
    user_model.signup();
    user_model.unset("password_confirm");
  });

  it('should be able to login', function(done) {
    function make_sure_user_was_loggedin() {
      $.couch.session({
        success: function(){
          user_model.off(); // turn off event listener that we added earlier
          done();
        },
        error: _throw( 'session failed')
      });
    }
    user_model.on('loggedin', make_sure_user_was_loggedin);
    user_model.login();
  });

  it('should have all proper fields available when logged in', function(done) {
    function make_sure_user_has_required_fields() {
      var expected_user_doc = _.extend({},user_defaults,{type:"user"});
      delete expected_user_doc.password;
      var user_model_to_compare = _.omit(user_model.toJSON(), "_rev", "_id", "password", "password_sha", "salt");
      expect(user_model_to_compare).eql(expected_user_doc);
      done();
    }
    user_model.on('loggedin', make_sure_user_has_required_fields);
    user_model.login();
  });

  it("should be able to retrieve session", function(done) {
    // login, create a new user model, call session on the new object, compare objects
    function models_equal(model1){
        return function(model2) {
            var model1_to_compare = _.omit(model1.toJSON(), "password");
            expect(model1_to_compare).eql(model2.toJSON());
            done();
        }
    }
    var make_sure_session_model_and_login_model_are_same = models_equal(user_model);
    //we already logged in from the last function, so we can use that data because we are lazy and dirty
    var model_simulating_page_refresh = new Backbone.CouchDB_User();
    model_simulating_page_refresh.on('loggedin',make_sure_session_model_and_login_model_are_same)
    model_simulating_page_refresh.session();
  });

  it("should be able to update its password",function(done){
    user_model.change_password(changed_password)
      .done(_.bind(done))
      .fail(_throw('failed to change users password'));
  })

  it('should be able to logout', function(done) {
    user_model.on('loggedout', function () {
      expect(user_model.get('name')).to.be.undefined;
      done();
    });
    user_model.on('error:loggedout', _throw('oopsie'));
    user_model.logout();
  });
  
  afterEach(function(done) {
    user_model.off();
    done();
  });

  after(function(done){
    // cleanup: remove registered user, must be logged out (admin
    // party mode)
    $.couch.userDb(
      function(user_db){
        user_db.openDoc("org.couchdb.user:"+user_name, {
          success:function(userDoc){
            user_db.removeDoc(_.pick(userDoc,'_id','_rev'));
            done();
          },
          error:_throw( "user doesn't exist")
        })
      })
  })      
})
