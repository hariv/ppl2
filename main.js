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
