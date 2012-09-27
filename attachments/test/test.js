var assert = require("assert");
var _ = require('underscore');
var backbone = require('backbone');

var jsdom = require('jsdom').jsdom
  , myWindow = jsdom().createWindow()
  , $ = require('jquery')
  , jq = require('jquery').create()
  , jQuery = require('jquery').create(myWindow);
require('../jquery.couch.js')(jQuery);



suite('jquery-couch',function(){
  test('$.couchinitialized',function(){
    $.should.have.property('couch');
  })  
})
