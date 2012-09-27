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

function log_args(namespace){
  return function(){
    console.log(namespace,arguments)
  }
}

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
  var user_model = new Backbone.CouchDB_User({
    name:user_name,
    password:user_pass
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
    user_model.on('registered',make_sure_user_was_added);
    user_model.on('error:registered', _throw('uhoh'));
    user_model.signup();
  })

  it('should be able to login', function(done) {
    function make_sure_user_was_loggedin() {
      $.couch.session({
        success: call(done),
        error: _throw( 'session failed')
      });
    }
    user_model.on('loggedin', make_sure_user_was_loggedin);
    user_model.login();
  });

  it("should be able to update it's password",function(done){
    var fun_user_params = {password:changed_password};
		user_model.on('all',log_args('user model'))
    user_model.set(fun_user_params);
    user_model.on('loggedin',call(done));
    user_model.on('sync', _.bind(user_model.login, user_model))
    user_model.save();
  })

  it('should be able to logout', function(done) {
    //user_model.on('all',log_args('user_model'));
    user_model.on('loggedout', call(done));
    user_model.on('error:loggedout', _throw('oopsie'));
    user_model.logout();
  });
  
  after(function(){
    // cleanup: remove registered user, must be logged out (admin
    // party mode)
    $.couch.userDb(
      function(user_db){
        user_db.openDoc("org.couchdb.user:"+user_name, {
          success:function(userDoc){
            user_db.removeDoc(_.pick(userDoc,'_id','_rev'));
	  },
          error:_throw( "user doesn't exist")
        })
      })
  })      
})
