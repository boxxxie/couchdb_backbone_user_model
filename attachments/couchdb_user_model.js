
//http://blog.couchbase.com/what%E2%80%99s-new-couchdb-10-%E2%80%94-part-4-security%E2%80%99n-stuff-users-authentication-authorisation-and-permissions

//i wasn't able to do the curl stuff from the above site, but i was able to do stuff with $.couch in futon

//editing an existing user (need to be logged in as admin to do this)
/*$.couch.userDb(function(db){
    db.openDoc("org.couchdb.user:10", //user name is "10"
	       {success:function(user){
		   user.roles.push("hello");
		   db.saveDoc(user);
	       }})})

//signing up a new user (need to be logged on as admin to set roles)
//user only needs a name and the userDoc _id == "org.couchdb.user:" + .name
$.couch.signup({name:"user name", roles:["pos_sales"]}, 
	       "password",
	       {success:function(){
		   console.log(arguments);}})

//logging in as admin, or other. returns response.roles[]
$.couch.login({name:"paul",password:"12345",
	       success:function(response){
		   console.log(response)
	       }})

function autoLog(){console.log(arguments);}
function autoSuccess(){return {success:autoLog};}

//getting session information
$.couch.session(autoSuccess())
/* response session obj
//unauthenticated requests to CouchDB will not see values for userCtx.name or userCtx.roles.
{info: {
    authenticated: "cookie",
    authentication_db: "_users",
    authentication_handlers: ["oauth","cookie","default"]
},
 ok: true,
 userCtx:{
     name: "paul",
     roles: ["_admin"]  //notice "_admin"
 }
}
*/
/*
//creating a user doc with a new password (doesn't save to the db, just makes a doc with a proper password)
$.couch.prepareUserDoc({name:"special",roles:["myrole"]},'12345')
//XHR finished loading: "http://localhost:5984/_uuids?count=1".
Object = {
    _id: "org.couchdb.user:special",
    name: "special",
    password_sha: "ebd098d5a41bd11756ab8a8f3a759ba7b2d123bf",
    roles: Array[1],
    salt: "129d294032a8aafd9c188bca3b00a706",
    type: "user",
    __proto__: Object
}

//this should change the user password (doc validation must allow for this to happen)
function changeUserPassword(userName,newPassword){
    $.couch.userDb
    (function(db){
	 db.openDoc("org.couchdb.user:"+userName,
		    {success:function(user){
			 //$.couch.prepareUserDoc(user,newPassword)
			 $.couch.signup(user,newPassword);
		     }})})
}

function printSession(){
    $.couch.session({success:function(){console.log(arguments);}});
}



//-------------------------------------------------------------------------------

change_user_password:function(user_id){
  var router = this;
  console.log("change_user_password");
  console.log(arguments);

  function login_with_new_password(user_doc,callback){
    var SE_handler = {
      success: function(){
	var simple_user = simple_user_format(user_doc);
	callback(undefined,simple_user);
      },
      error: function (code,type,message) {
	callback({code:code,type:type,message:message});
      }
    };
    var login_options =
      _.extend({
	name : user_doc.name,
	password : user_doc.password
      },
	       SE_handler);

    $.couch.login(login_options);
  }

  function setup_session(callback){
    $.couch.session(
      {
	success:function(resp){
	  ReportData.session = resp;
	  callback(undefined);
	},
	error:function(code,type,message){
	  callback({code:code,type:type,message:message});
	}
      });
  }

  function report(err){
    if(err){
      alert(JSON.stringify(err));
    }
  }

  var new_password = prompt("new password");
  if(new_password!=null) {
    var session = ReportData.session;
    if(is_logged_in_user(router.current_user,user_id)){
      var user = router.current_user;
      async.waterfall(
	[
	  user.change_password(session,new_password),
	  login_with_new_password,
	  setup_router_current_user,
	  setup_report_data,
	  setup_session
	],
	report);
    }
    else{
      var user = get_current_user();
      async.waterfall(
	[
	  user.change_password(session,new_password),
	  edit_router_user_collection
	],
	report);
    }
  }
},

edit_user:function(user_id){
  function login_with_new_password(user_doc,callback){
    var SE_handler = {
      success : function(){
	callback(undefined,user_doc);
      },
      error: function (code,type,message) {
	callback({code:code,type:type,message:message});
      }
    };
    var login_options =
      _.extend(
        {
	  name : user_doc.name,
	  password : user_doc.password
	},
	SE_handler);
    $.couch.login(login_options);
  }
  
  function setup_session(callback){
    $.couch.session(
      {
	success:function(resp){
	  ReportData.session = resp;
	  callback(undefined);
	},
	error:function(code,type,message){
	  callback({code:code,type:type,message:message});
	}
      });
  }

  function report(err){
    if(err){
      console.log(err);
    }
  }

  var userJSON = user.toJSON();
  
  $.couch.session({
    success: function(session) {
      
      //TODO : 2 cases ; 1. loggedin user, 2. other user
      if(is_logged_in_user(router.current_user,user_id)){
	var user = router.current_user;
	async.waterfall(
	  [
	    user.updateUserDoc(session,user_data),
	    login_with_new_password,
	    setup_router_current_user,
	    setup_report_data,
	    setup_session
	  ],
	  report);
      } else {
	var user = router.user_collection.find(function(user){return user.get('_id') === user_id;});
	async.waterfall(
	  [
	    user.updateUserDoc(session,user_data),
	    edit_router_user_collection
	  ],
	  report);
      }
    },
    error:function() {
      console.log("session error");
    }
  });
}
});


function add_new_user(user_data){  
  (new UserDoc(user_data))
    .signup(
      {
	success:function(resp){
	  router.user_collection.add(simple_user_format(user_data));
	},
	error:function(err_code,err,err_message){
	  alert(err_message);
	}});}
}
*/
