var socket=io.connect("http://localhost");
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
    socket.emit('join',joinObject);
    socket.on('joinError',function(data){
	alert(data);
    });
    socket.on('joinResponse',function(team,teamId,msg){
	var body=document.getElementsByTagName("body")[0];
	body.innerHTML="<h2>My Playing Eleven</h2><ul id='playingEleven'>";
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
	body.innerHTML+="<h3>Decide Toss</h3><div id='buttons'>";
	body.innerHTML+="<button id='heads' onclick=\"toss(this.id)\">Heads</button>&nbsp;&nbsp;<button id=`tails` onclick=\"toss(this.id)\">Tails</button></div>"
    });
    socket.on('2JoinResponse',function(team,teamId,opTeam,opTeamId,msg){
	var body=document.getElementsByTagName("body")[0];
	body.innerHTML="<h2>My Playing Eleven</h2><ul id='playingEleven'>";
	for(var i=0;i<team.length;i++)
	    body.innerHTML+="<li id="+teamId[i]+">"+team[i]+"</li>";
	body.innerHTML+="</ul><br /><h2>Opponent Eleven</h2><ul id='opponentEleven'>";
	for(var j=0;j<opTeam.length;j++)
	    body.innerHTML+="<li id="+opTeamId[j]+">"+opTeam[j]+"</li>";
	body.innerHTML+="</ul><br /><h3>"+msg+"</h3>"
    });
}
function toss(choice)
{
    var buttonDiv=document.getElementById("buttons");
    buttonDiv.parentNode.removeChild(buttonDiv);
    var chArray=new Array();
    chArray['heads']=1;
    chArray['tails']=2;
    var userId=document.getElementById("userId").innerHTML;
    var userSecret=document.getElementById("userSecret").innerHTML;
    var matchId=document.getElementsByTagName("title")[0].innerHTML;
    var tossObject=new Object();
    tossObject.userId=userId;
    tossObject.matchId=matchId;
    tossObject.userSecret=userSecret;
    tossObject.decision=chArray[choice];
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
