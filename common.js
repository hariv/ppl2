var error=require('./error.js');
var playerArray=new Array();
for(var j=0;j<8;j++)
    playerArray[j]=0;
var checkTeamPlayers=function(matchId,userId,players,sqlConnection,callback)
{
    for(var i=0;i<players.length;i++)
    {
	checkPlayer(players[i],matchId,userId,sqlConnection,i,function(num,status){
	    var check=0;
	    if(status)
	    {
		var updateQuery=sqlConnection.connection.query("UPDATE `squad_details` SET `match_id`=? WHERE `user_id`=? AND `player_id`=?",[matchId,userId,players[num]],function(err,results){
		    if(err)
		    {
			error.sqlError("UPDATE","squad_details",err);
			return;
		    }
		    
		    if(num==10)
			callback(1);
		});
	    }
	    else
	   	check=1;
	    if(check)
		callback(0);
	});
    }
}
var authenticateUser=function(userId,userSecret,sqlConnection,callback)
{
    sqlConnection.connection.query("SELECT * FROM `team_sessions` WHERE `team_id`=? AND `team_password`=?",[userId,userSecret],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","team_sessions",err);
	    return;
	}
	if(results.length>0)
	    callback(1);
else
	    callback(0);
    });
}
var checkMatch=function(userId,matchId,sqlConnection,callback)
{
    console.log(userId);
    console.log(matchId);
   sqlConnection.connection.query("SELECT * FROM `matches` WHERE `id`=? AND (`team_1`=? OR `team_2`=?) AND (`status`=0)",[matchId,userId,userId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","matches",err);
	    return;
	}
	if(results.length>0)
	{
	    var opponentId=results[0].team_1;
	    if(opponentId==userId)
		opponentId=results[0].team_2;
	    callback(opponentId);
	}
	else
	    callback(null);
    });
}
var checkPlayer=function(playerId,matchId,userId,sqlConnection,num,callback)
{
    var checkQuery=sqlConnection.connection.query("SELECT * FROM `squad_details` WHERE `player_id`=? AND `user_id`=?",[playerId,userId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squad_details",err);
	    return;
	}
	if(results.length==1)
	    callback(num,1);
	else
	    callback(num,0);
    });
}
var getPlayerName=function(playerId,sqlConnection,num,callback)
{
    var getPlayerNameQuery=sqlConnection.connection.query("SELECT * FROM `players` WHERE `player_id`=?",[playerId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","players",err);
	    return;
	}
	if(results.length>0)
	{
	    callback(results[0].player_name,playerId,num);
	}
    });

}
var getSquad=function(userId,sqlConnection,callback)
{
    var getSquadQuery=sqlConnection.connection.query("SELECT * FROM `squad_details` WHERE `user_id`=?",[userId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squad_details",err);
	    return;
	}
	if(results.length>0)
	{
	    var squad=new Array();
	    var squadId=new Array();
	    for(var i=0;i<results.length;i++)
	    {
		getPlayerName(results[i].player_id,sqlConnection,i,function(name,id,num){
		    squad.push(name);
		    squadId.push(id);
		    if(num==results.length-1)
			callback(squad,squadId);
		});
	    }
	}
    });
}
var getPlayingEleven=function(userId,matchId,sqlConnection,callback)
{
    var getPlayingElevenQuery=sqlConnection.connection.query("SELECT * FROM `squad_details` WHERE `user_id`=? AND `match_id`=?",[userId,matchId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squad_details",err);
	    return;
	}
	if(results.length>0)
	{
	    var playing=new Array();
	    var playingId=new Array();
	    for(var i=0;i<results.length;i++)
	    {
		getPlayerName(results[i].player_id,sqlConnection,i,function(name,id,num){
		    playing.push(name);
		    playingId.push(id);
		    if(num==results.length-1)
			callback(playing,playingId);
		});
	    }
	}
    });
}
var getTeam=function(userId,sqlConnection,num,callback)
{
    var teamName;
    var getTeamQuery=sqlConnection.connection.query("SELECT * FROM `squads` WHERE `user_id`=?",[userId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squad",err);
	    return;
	}
	if(results.length>0)
	    teamName=results[0].squad_name;
	callback(teamName,userId,num);
    });
}
exports.getSquad=getSquad;
exports.getTeam=getTeam;
exports.authenticateUser=authenticateUser;
exports.checkMatch=checkMatch;
exports.checkTeamPlayers=checkTeamPlayers;
exports.getPlayingEleven=getPlayingEleven;
