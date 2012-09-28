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
})

describe('user model',function(){
  it('should exist',function(){ 
    expect(Backbone).to.have.property('CouchDB_User');
  });
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
    user_model.on('registered',make_sure_user_was_added);
    user_model.on('error:registered', _throw('uhoh'));
    user_model.signup();
  })

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
      var user_model_to_compare = user_model.toJSON();
      delete user_model_to_compare._rev;
      delete user_model_to_compare._id;
      delete user_model_to_compare.password;
      delete user_model_to_compare.password_sha;
      delete user_model_to_compare.salt;
      expect(user_model_to_compare).eql(expected_user_doc);
      done();
    }
    user_model.on('loggedin', make_sure_user_has_required_fields);
    user_model.login();
  });

  it("should be able to update it's password",function(done){
    user_model.change_password(changed_password)
      .done(_.bind(done))
      .fail(_throw('failed to change users password'));
  })

  it('should be able to logout', function(done) {
    user_model.on('loggedout', call(done));
    user_model.on('error:loggedout', _throw('oopsie'));
    user_model.logout();
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
