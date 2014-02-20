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
var common=require('./common.js');
var sqlConnect=require('./connection.js');
sqlConnect.connect(mysql);
app.get('/',function(req,res){
    if(req.session.userId)
    	res.redirect('/profile');
    else
    {
	fs.readFile(__dirname+'/index.html',function(err,data){
	    if(err)
	    {
		error.fileError(err,req.url);
		return;
	    }
	    render.show(res,data);
	});
    }
});
app.get('/main.js',function(req,res){
    fs.readFile(__dirname+'/main.js',function(err,data){
	if(err)
	{
	    error.fileError(err,req.url);
	    return;
	}
	render.loadJs(res,data);
    })
});
app.get('/allTeams',function(req,res){
    var getAllTeams=sqlConnect.connection.query("SELECT * FROM `squads` WHERE `squad_status`=1",function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squads",err);
	    return;
	}
	if(results.length>0)
	{
	    var allTeams=new Array();
	    var htmlResponse="<html><head><title>All Teams</title></head><body>";
	    var firstId=results[0].user_id;
	    common.getTeam(firstId,sqlConnect,null,function(teamName,num){
		htmlResponse+="<h1>Team "+teamName+"</h1><ul>";
		common.getSquad(firstId,sqlConnect,function(squad){
                    for(var j=0;j<squad.length;j++)
			htmlResponse+="<li>"+squad[j]+"</li>";
                    htmlResponse+="</ul>";
		    for(var i=0;i<results.length;i++)
		    {
			var userId=results[i].user_id;
			common.getTeam(userId,sqlConnect,i,function(teamName,num){
			    if(!isNaN(num))
			    {
				htmlResponse+="<button id="+num+">"+teamName+"</button>";
				if(num==results.length-1)
				{
				    htmlResponse+="</body></html>";
				    res.setHeader('Content-Type','text/html');
				    res.end(htmlResponse);
				}
			    }
			});
		    }
		});
	    });
	}
    });
});
app.post('/profile',function(req,res){
    if(req.body.loginName && req.body.loginPassword)
    {
	var userName=req.body.loginName;
	var password=crypto.createHash('md5').update(req.body.loginPassword).digest('hex');
	var getUserQuery=sqlConnect.connection.query("SELECT * FROM `team_sessions` WHERE `team_name`=? AND `team_password`=?",[userName,password],function(err,results){
	    if(err)
	    {
		error.sqlError("SELECT","team_sessions",err);
		return;
	    }
	    if(results.length>0)
	    {
		var userId=results[0].team_id;
		req.session.userId=userId;
		common.getTeam(userId,sqlConnect,null,function(teamName){
		    var htmlResponse="<html><head><title>"+teamName+"</title><script type=\"text/javascript\" src=\"main.js\"></script></head>";
		    htmlResponse+="<body><h2>"+teamName+"</h2><a href='/allTeams'>Other Teams</a><br />";
		    htmlResponse+="<button id='showMySquad'>My Squad</button><button id='showFixtures'>Fixtures</button><button id='showStatistics'>Statistics</button><br /><div id='content'>";
		    htmlResponse+="<ul id='squadList'>";
		    common.getSquad(userId,sqlConnect,function(squad){
			for(var i=0;i<squad.length;i++)
			    htmlResponse+="<li>"+squad[i]+"</li>";
			htmlResponse+="</ul></div></body></html>";
			
			res.setHeader("Content-Type","text/html");
			res.end(htmlResponse);
		    });
		});
	    }
	    else
	    {
		res.setHeader("Content-Type","text/plain");
		res.end("Authentication Failure");
	    }
	});
    }
    else
    {
	res.setHeader("Content-Type","text/plain");
	res.end("Bad Request");
    }
});
app.get('/profile',function(req,res){
    res.setHeader("Content-Type","text/plain");
    res.end("Not Found!");
});

app.listen(3000);
console.log("Server running at port 3000");
