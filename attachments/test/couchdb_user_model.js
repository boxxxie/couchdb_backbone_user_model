describe('mocha/chai',function(){
  it('testing tests',function(){ 
    assert.typeOf('foo','string','foo is string');
  });
});

describe('user model',function(){
  it('should exist',function(){ 
    Backbone.should.have.property('CouchDB_User');
  });
});
