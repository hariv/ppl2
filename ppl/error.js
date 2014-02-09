var fileError=function(err,url)
{
    console.log("Error connecting to "+url);
    console.log("Error Details "+err);
}
var sqlError=function(query,table,err)
{
    console.log("Error running "+query+" query on "+table);
    console.log("Error Details "+err);
}
exports.fileError=fileError;
exports.sqlError=sqlError;
