var socket=io.connect("http://localhost");
socket.on('tossSuccess',function(data){
    var userId=document.getElementById("userId").innerHTML;
    var userSecret=document.getElementById("userSecret").innerHTML;
    var matchId=document.getElementsByTagName("title")[0].innerHTML;
    var body=document.getElementsByTagName("body")[0];
    matchId=matchId.replace("Match ","");
    if(data==userId)
    {
	var tossDiv=document.getElementById("tossDiv");
	tossDiv.parentNode.removeChild(tossDiv);
    }
    else
    {
	var status=document.getElementById("status");
	status.parentNode.removeChild(status);
    }
    body.innerHTML+="<br />You have Won the Toss";
    body.innerHTML+="<br /><h3 id='startDecision'>What do you Choose</h3><div id='buttons'><button id='bat' onclick=\"choice(this.id)\">Batting</button>&nbsp;&nbsp;<button id=`bowl` onclick=\"choice(this.id)\">Bowling</button></div>"
});
socket.on('tossFailure',function(data){
    console.log("You Lost!");
    var userId=document.getElementById("userId").innerHTML;
    var userSecret=document.getElementById("userSecret").innerHTML;
    var matchId=document.getElementsByTagName("title")[0].innerHTML;
    var body=document.getElementsByTagName("body")[0];
    matchId=matchId.replace("Match ","");
    if(data==userId)
    {
        var tossDiv=document.getElementById("tossDiv");
        tossDiv.parentNode.removeChild(tossDiv);
    }
    else
    {
	var status=document.getElementById("status");
	status.parentNode.removeChild(status);
    }
    body.innerHTML+="<br />You have Lost the Toss. Waiting for your opponent to decide";
});
function startSocket()
{
    var matchList=document.getElementById("matchList");
    var liNodes=matchList.childNodes;
    if(liNodes.length!=11)
    {
	alert("Choose Exactly 11 Players");
	return false;
    }
    var userId=document.getElementById("userId").innerHTML;
    var userSecret=document.getElementById("userSecret").innerHTML;
    var matchId=document.getElementsByTagName("title")[0].innerHTML;
    matchId=matchId.replace("Match ","");
    var matchPlayers=new Array();
    for(var i=0;i<liNodes.length;i++)
	matchPlayers[i]=liNodes[i].id.replace("newPlayer","");
    var joinObject=new Object();
    joinObject.userId=userId;
    joinObject.userSecret=userSecret;
    joinObject.matchId=matchId;
    joinObject.players=matchPlayers;
    console.log(joinObject);
    socket.emit('join',joinObject);
    socket.on('joinError',function(data){
	alert(data);
    });
    socket.on('joinResponse',function(team,teamId,msg){
	var body=document.getElementsByTagName("body")[0];
	body.innerHTML="<h2>My Playing Eleven</h2><div id='userId' style='display:none;'>"+userId+"</div><div id='userSecret' style='display:none;'>"+userSecret+"</div><ul id='playingEleven'>";
	for(var i=0;i<team.length;i++)
	    body.innerHTML+="<li id="+teamId[i]+">"+team[i]+"</li>";
	body.innerHTML+="</ul><br /><h3>"+msg+"</h3>";
    });
    socket.on('tossStart',function(opTeam,opTeamId){
	var msgHead=document.getElementsByTagName("h3")[0];
	msgHead.parentNode.removeChild(msgHead);
	var body=document.getElementsByTagName("body")[0];
	body.innerHTML+="<h2>Opponent Eleven</h2><ul id='opponentEleven'>";
	for(var i=0;i<opTeam.length;i++)
	    body.innerHTML+="<li id="+opTeamId[i]+">"+opTeam[i]+"</li>";
	body.innerHTML+="</ul>";
	body.innerHTML+="<h3 id='tossDiv'>Decide Toss</h3><div id='buttons'><button id='heads' onclick=\"toss(this.id)\">Heads</button>&nbsp;&nbsp;<button id=`tails` onclick=\"toss(this.id)\">Tails</button></div>"
    });
    socket.on('2JoinResponse',function(team,teamId,opTeam,opTeamId,msg){
	var body=document.getElementsByTagName("body")[0];
	body.innerHTML="<h2>My Playing Eleven</h2><div id='userId' style='display:none;'>"+userId+"</div><div id='userSecret' style='display:none;'>"+userSecret+"</div><ul id='playingEleven'>";
	for(var i=0;i<team.length;i++)
	    body.innerHTML+="<li id="+teamId[i]+">"+team[i]+"</li>";
	body.innerHTML+="</ul><br /><h2>Opponent Eleven</h2><ul id='opponentEleven'>";
	for(var j=0;j<opTeam.length;j++)
	    body.innerHTML+="<li id="+opTeamId[j]+">"+opTeam[j]+"</li>";
	body.innerHTML+="</ul><br /><h3 id='status'>"+msg+"</h3>"
    });
}
function toss(choice)
{
    var userId=document.getElementById("userId").innerHTML;
    var userSecret=document.getElementById("userSecret").innerHTML;
    var matchId=document.getElementsByTagName("title")[0].innerHTML;
    matchId=matchId.replace("Match ","");
    var buttons=document.getElementById("buttons");
    buttons.parentNode.removeChild(buttons);
    var tossObject=new Object();
    tossObject.userId=userId;
    tossObject.matchId=matchId;
    tossObject.userSecret=userSecret;
    socket.emit('toss',tossObject);
}
function removeFromTeam(id)
{
    var newId=id.replace("newButton","");
    var squadList=document.getElementById("matchList");
    document.getElementById(newId).style.display="inline";
    var newLi=document.getElementById("newPlayer"+newId);
    newLi.parentNode.removeChild(newLi);
}
function addToTeam(id)
{
    var matchList=document.getElementById("matchList");
    if(matchList.childNodes.length>=11)
    {
	alert("You have chosen 11 Players");
	return false;
    }
    var playerName=document.getElementById("player"+id).innerHTML;
    var newPlayer=document.createElement("li");
    var newSpan=document.createElement("span");
    var newButton=document.createElement("button");
    document.getElementById(id).style.display="none";
    newSpan.id="new"+id;
    newSpan.innerHTML=playerName;
    newButton.id="newButton"+id;
    newButton.innerHTML="X";
    newButton.setAttribute("onclick","removeFromTeam(this.id)");
    newPlayer.id="newPlayer"+id;
    newPlayer.appendChild(newSpan);
    newPlayer.appendChild(newButton);
    matchList.appendChild(newPlayer);
}
function showSquad(id)
{
    var xmlhttp,resp;
    var teamHeading=document.getElementById("teamName");
    var squadDiv=document.getElementById("teamSquad");
    var newTeam="<ul>";
    if (window.XMLHttpRequest)
    	xmlhttp=new XMLHttpRequest();
    else
    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.onreadystatechange=function()
    {
	if(xmlhttp.readyState==4 && xmlhttp.status==200)
	{
	    resp=eval(xmlhttp.responseText);
	    teamHeading.innerHTML="Team "+resp[resp.length-1];
	    for(var i=0;i<resp.length-1;i++)
	    	newTeam+="<li>"+resp[i]+"</li>";
	    newTeam+="</ul>";
	    squadDiv.innerHTML=newTeam;
	}
    }
    xmlhttp.open("POST","/getTeams",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("userId="+id);
}
