var show=function(res,data)
{
    res.setHeader('Content-Type','text/html');
    res.send(data);
}
var loadJs=function(res,data)
{
    res.setHeader('Content-Type','application/javascript');
    res.send(data);
}
exports.show=show;
exports.loadJs=loadJs;
