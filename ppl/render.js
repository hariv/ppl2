var show=function(res,data)
{
    res.setHeader('Content-Type','text/html');
    res.send(data);
}
exports.show=show;
