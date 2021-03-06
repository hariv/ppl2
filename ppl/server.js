var fs=require('fs');
var http=require('http');
var express=require('express');
var crypto=require('crypto');
var mysql=require('mysql');
var app=express();
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.configure(function(){
    app.use(require('connect').bodyParser());
});
var server=http.createServer(app);
var config=require('./config.js');
var error=require('./error.js');
var render=require('./render.js');
var splitter=require('./splitter.js');
var sqlConnect=require('./connection.js');
sqlConnect.connect(mysql);
app.get('/',function(req,res){
    fs.readFile(__dirname+'/index.html',function(err,data){
	if(err)
	{
	    error.fileError(err,req.url);
	    return;
	}
	render.show(res,data);
    });
});
app.post('/authenticate',function(req,res){
    var userName=req.body.loginName;
    var password=crypto.createHash('md5').update(req.body.loginPassword).digest('hex');
    var getUserQuery=sqlConnect.connection.query("SELECT * FROM `team_sessions` WHERE `team_name`=? AND `team_password`=?",[userName,password],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","team_name",err);
	    return;
	}
	if(results.length>0)
	{
	    res.setHeader("Content-Type","text/plain");
	    res.end("Logged in!");
	}
	else
	{
	    res.setHeader("Content-Type","text/plain");
	    res.end("Authentication Failure");
	}
	    
    });
});
app.listen(3000);
console.log("Server running at port 3000");
