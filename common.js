var error=require('./error.js');
var playerArray=new Array();
for(var i=0;i<8;i++)
    playerArray[i]=0;
var checkPlayer=function(playerId,matchId,userId,sqlConnection,num,callback)
{
    var checkQuery=sqlConnection.connection.query("SELECT * FROM `squad_details` WHERE `player_id`=? AND `user_id`=?",[playerId,userId],function(err,results){
	if(err)
	{
	    error.sqlError("SELECT","squad_details",err);
	    return;
	}
	if(results.length==1)
	    playerArray[userId]=1;
	callback(playerId,userId,matchId,num,playerArray[userId]);
    });
}
var checkAndUpdate=function(players,matchId,userId,sqlConnection,callback)
{
    for(var i=0;i<players.length;i++)
    {
	checkPlayer(players[i],matchId,userId,sqlConnection,i,function(pId,uId,mId,num,status){
	    if(status==1)
	    {
		var updateQuery=sqlConnection.connection.query("UPDATE `squad_details` SET `match_id`=? WHERE `user_id`=? AND `player_id`=?",[mId,uId,pId],function(err,results){
		    if(err)
		    {
			error.sqlError("UPDATE","squad_details",err);
			return;
		    }
		    if(num==10)
		    	callback(mId,uId,status);
		});
	    }
	    else
	    	callback(mId,uId,status);
	});
    }
    
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
	    callback(results[0].player_name,playerId,num);
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
exports.checkAndUpdate=checkAndUpdate;
