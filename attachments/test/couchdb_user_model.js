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
  
  it('should be able to sign up',function(done){
    var user = new Backbone.CouchDB_User({
      name:user_name,
      password:user_pass
    });
    function make_sure_user_was_added(){
      $.couch.userDb(
        function(user_db){
          user_db.openDoc("org.couchdb.user:"+user_name, {
            success:call(done),
            error:_throw( "user doesn't exist")
          })
        })
    }
    user.on('registered',make_sure_user_was_added);
    user.signup();
  })

  it('should be able to login', function(done) {
    var user = new Backbone.CouchDB_User({
      name:user_name,
      password:user_pass
    });
    function make_sure_user_was_loggedin() {
      $.couch.session({
        success: call(done),
        error: _throw( 'session failed')
      });
    }
    user.on('loggedin', make_sure_user_was_loggedin);
    user.login();
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
