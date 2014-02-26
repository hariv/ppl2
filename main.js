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
    var matchPlayers=new Array();
    for(var i=0;i<liNodes.length;i++)
	matchPlayers[i]=liNodes[i].id.replace("newPlayer","");
    socket.emit('join',matchPlayers);
    socket.on('joinError',function(data){
	alert(data);
    });
    socket.on('joinResponse',function(data){
	alert(data);
    });
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
