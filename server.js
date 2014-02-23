var fs=require('fs');
var http=require('http');
var express=require('express');
var crypto=require('crypto');
var mysql=require('mysql');
var app=express.createServer();
var io=require('socket.io').listen(app);
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.configure(function(){
    app.use(require('connect').bodyParser());
});
//var server=http.createServer(app);
//var io=require('socket.io').listen(app);
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
app.post('/getTeams',function(req,res){
    if(req.body.userId)
    {
        var userId=req.body.userId;
        common.getTeam(userId,sqlConnect,null,function(teamName,id,num){
            common.getSquad(userId,sqlConnect,function(squad,squadId){
                squad.push(teamName);
                var jsonArray=JSON.stringify(squad);
                res.end(jsonArray);
            });
        });
    }
});
app.post('/match',function(req,res){
    if(req.session.userId)
    {
	var userId=req.session.userId;
	var getMatchQuery=sqlConnect.connection.query("SELECT * FROM `matches` WHERE `status`=0 AND (`team_1`=? OR `team_2`=?)",[userId,userId],function(err,results){
	    if(err)
	    {
		error.sqlError("SELECT","squads",err);
		return;
	    }
	    if(results.length<1)
	    {
		res.setHeader("Content-Type","text/plain");
		res.end("No Match Scheduled!");
	    }
	    else
	    {
		var htmlResponse;
		var matchId=results[0].id;
		var opponentId=results[0].team_1;
		if(userId==opponentId)
		    opponentId=results[0].team_2;
		htmlResponse="<html><head><title>Match "+matchId+"</title><script type=\"text/javascript\" src=\"main.js\"></script></head><body>";
		htmlResponse+="<h3>My Team</h3><ul id=\"mySquad\">";
		common.getSquad(userId,sqlConnect,function(squad,squadId){
		    for(var i=0;i<squad.length;i++)
			htmlResponse+="<li id=oldPlayer"+squadId[i]+"><span id=player"+squadId[i]+">"+squad[i]+"</span><button id="+squadId[i]+" onclick=\"addToTeam(this.id)\">+</button>";
		    htmlResponse+="</ul><h3>Opponent Squad</h3><ul id=\"opponentSquad\">";
		    common.getSquad(opponentId,sqlConnect,function(squad,squadId){
			for(var j=0;j<squad.length;j++)
			    htmlResponse+="<li>"+squad[j]+"</li>";
			htmlResponse+="</ul><h3>Playing Eleven</h3><ul id=\"matchList\"></ul></body></html>";
			res.setHeader('Content-Type','text/html');
			res.end(htmlResponse);
		    });
		});
	    }
	});
    }
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
	    var htmlResponse="<html><head><title>All Teams</title><script type=\"text/javascript\" src=\"main.js\"></script></head><body>";
	    var firstId=results[0].user_id;
	    common.getTeam(firstId,sqlConnect,null,function(teamName,id,num){
		htmlResponse+="<h1 id='teamName'>Team "+teamName+"</h1><div id='teamSquad'><ul>";
		common.getSquad(firstId,sqlConnect,function(squad,squadId){
                    for(var j=0;j<squad.length;j++)
			htmlResponse+="<li>"+squad[j]+"</li>";
                    htmlResponse+="</ul></div>";
		    for(var i=0;i<results.length;i++)
		    {
			var userId=results[i].user_id;
			common.getTeam(userId,sqlConnect,i,function(teamName,id,num){
			    if(!isNaN(num))
			    {
				htmlResponse+="<button id="+id+" onclick=\"showSquad(this.id)\">"+teamName+"</button>";
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
app.get('/profile',function(req,res){
    if(req.session.userId)
    {
	var userId=req.session.userId;
	common.getTeam(userId,sqlConnect,null,function(teamName){
	    var htmlResponse="<html><head><title>"+teamName+"</title><script type=\"text/javascript\" src=\"main.js\"></script></head>";
            htmlResponse+="<body><h2>"+teamName+"</h2><a href='/allTeams'>All Teams</a><br />";
            htmlResponse+="<button id='showMySquad'>My Squad</button><button id='showFixtures'>Fixtures</button><button id='showStatistics'>Statistics</button><form action=\"/signout\" method=\"POST\"><input type=\"submit\" value=\"Sign Out!\" /></form><br /><div id='content'>";
            htmlResponse+="<ul id='squadList'>";
	    common.getSquad(userId,sqlConnect,function(squad,squadId){
                for(var i=0;i<squad.length;i++)
                    htmlResponse+="<li>"+squad[i]+"</li>";
                htmlResponse+="</ul></div>";
		htmlResponse+="<form action=\"match\" method=\"POST\"><input type=\"submit\" value=\"Start Match\" /></form>";
		htmlResponse+="</body></html>";
		res.setHeader("Content-Type","text/html");
                res.end(htmlResponse);
            });
	});
    }
    else
    {
	res.setHeader("Content-Type","text/plain");
	res.end("Not Found!");
    }
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
		    htmlResponse+="<button id='showMySquad'>My Squad</button><button id='showFixtures'>Fixtures</button><button id='showStatistics'>Statistics</button><form action=\"/signout\" method=\"POST\"><input type=\"submit\" value=\"Sign Out!\" /></form><br /><div id='content'>";
		    htmlResponse+="<ul id='squadList'>";
		    common.getSquad(userId,sqlConnect,function(squad,squadId){
			for(var i=0;i<squad.length;i++)
			    htmlResponse+="<li>"+squad[i]+"</li>";
			htmlResponse+="</ul></div>";
			htmlResponse+="<form action=\"match\" method=\"POST\"><input type=\"submit\" value=\"Next Challenger\" /></form>";
			htmlResponse+="</body></html>";
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
app.post('/signout',function(req,res){
    if(req.session.userId)
	req.session.userId=null;
    res.setHeader('Content-Type','text/plain');
    res.end("Logged Out!");
});
app.listen(3000);
console.log("Server running at port 3000");
