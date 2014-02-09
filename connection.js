var config=require("./config.js");
var connect=function(mysql)
{
    var connection=mysql.createConnection({
	host:config.host,
	user:config.user,
	password:config.password,
    });
    connection.connect(function(err){
	if(err)
	{
            console.log("Error in connecting to MySQL "+err);
            return;
	}
	console.log("Connected to MySQL");
    });
    var query=connection.query("USE "+config.database,function(err,result){
	if(err)
	{
            console.log("Error in selecting DB "+err);
            return;
	}
	console.log("Database Connection Established");
    });
    exports.connection=connection;
}
exports.connect=connect;

