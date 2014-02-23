var error=require('./error.js');
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
