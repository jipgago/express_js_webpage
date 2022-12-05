var db = require('../../lib/db.js'); //경로가 다를 수 있습니다.
var qs = require('querystring');

module.exports = {
    calendarHome : function(request, response){
        db.query(`SELECT * FROM calendar`, function(err, result){
            if(err){
                throw err;
            }
            
            var context = { doc: `./calendar/calendar.ejs`,
                        loggined : authIsOwner(request, response),
                        id : request.session.login_id,
                        cls : request.session.class,
                        results : result};
            request.app.render('index', context, function(error, html){
                if(error){
                    throw error;
                }
                response.end(html);
            });
        });
    },
    calendarCreate : function(request,response){
        var titleofcreate = 'Create';
        var context = {doc : `./calendar/calendarCreate.ejs`,
                    title : '',
                    description : '',
                    cls : request.session.class,
                    kindOfDoc : 'C',
                    loggined : authIsOwner(request,response),
                    id : request.session.login_id
                };
        request.app.render('index', context, function(err, html){
            response.end(html);
        });
    },
    calendarCreate_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var cal = qs.parse(body);
            db.query(`INSERT INTO calendar (title, description, created, author_id)
                    VALUES(?, ?, NOW(), 2)`, [cal.title, cal.description], function(err, result){
                if(err){
                    throw err;
                }
                response.writeHead(302, {Location:encodeURI('/calendar')});
                response.end();
            });
        });
    },
    calendarUpdate_process : function(request, response){
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var plan = qs.parse(body);
            var planId = request.params.planId;
            db.query('UPDATE calendar SET title=?, description=?, author_id=? WHERE id=?',
                [plan.title, plan.description, 2, planId], function (error, result) {
                    response.writeHead(302, { Location: `/calendar` });
                    response.end();
                });
        });

    },
    calendarDelete_process :function(request,response){
        var planId = request.params.planId;
        db.query(`DELETE FROM calendar WHERE id = ?`, [planId], function(err, result){
            if(err){
                throw err;
            }
            response.writeHead(302, {Location:encodeURI(`/calendar`)});
            response.end();
        });
    },
    calendarList: function (request, response) {
        var titleofcreate = 'Create';
        db.query(`SELECT * FROM calendar `,
            function (error, result) {
                if (error) {
                    throw error;
                }
                tmplogin = 'Y';
                var context = {
                    doc: `./calendar/calendarList.ejs`,
                    loggined: authIsOwner(request, response),
                    id: request.session.login_id,
                    cls : request.session.class,
                    results: result
                };
                request.app.render('index', context, function (err, html) {
                    response.end(html);
                }
                );
            });
    },
    calendarUpdate : function(request, response){
        var planIds = request.params.planId;
        db.query(`SELECT * FROM calendar where id = ${planIds}`,
            function (error, result) {
                if (error) {
                    throw error;
                }
                var context = {
                    doc: `./calendar/calendarCreate.ejs`,
                    title: result[0].title,
                    description: result[0].description,
                    pId: planIds,
                    kindOfDoc: 'U',
                    cls : request.session.class,
                    loggined: authIsOwner(request, response),
                    id: request.session.login_id
                };
                request.app.render('index', context, function (err, html) {
                    if(err){
                        throw err;
                    }
                    response.end(html);
                });
            }); 
    },
    calendarSearch : function(request, response){
        context = {
            doc : './search.ejs',
            kind : 'Calendar Search',
            listyn : 'N',
            keyword : '',
            hld : '캘린더',
            cls : request.session.class,
            loggined : authIsOwner(request, response),
            id : request.session.login_id
        };
        request.app.render('index', context, function(err,html){
            if(err) throw err;
            response.end(html);
        });
    },
    calendarSearch_result : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
        db.query(`SELECT * FROM calendar WHERE title like ?`, [post.keyword], function(err, results){
                if(err) throw err;
                context = {
                    keyword : post.keyword,
                    doc : './search.ejs',
                    hld : '캘린더',
                    kind : 'Calendar Search',
                    listyn : 'Y',
                    cls : request.session.class,
                    loggined : authIsOwner(request, response),
                    id : request.session.login_id,
                    bs : results
                };
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        });    
    },
    namecardHome : function(request, response){
        db.query(`SELECT * FROM namecard`, function(err, result){
            if(err){
                throw err;
            }
            var context = {doc: './namecard/namecardHome.ejs',
                        cls : request.session.class,
                        loggined : authIsOwner(request, response),
                        id : request.session.login_id,
                        results : result};
            request.app.render('index', context, function(error, html){
                if(error){
                    throw error;
                }
                response.end(html);
            });
        });
    },
    namecardList : function(request, response){
        db.query(`SELECT * FROM namecard`, function(err, result){
            if(err){
                throw err;
            }
            var context = {doc: './namecard/namecardList.ejs',
                        cls : request.session.class,
                        loggined : authIsOwner(request, response),
                        id : request.session.login_id,
                        results : result};
            request.app.render('index', context, function(error, html){
                if(error){
                    throw error;
                }
                response.end(html);
            });
        });
    },
    namecardCreate : function(request,response){
        var titleofcreate = 'Create';
        var context = {doc : `./namecard/namecardCreate.ejs`,
                    title : '',
                    description : '',
                    kindOfDoc : 'C',
                    cls : request.session.class,
                    loggined : authIsOwner(request, response),
                    id : request.session.login_id
                };
        request.app.render('index', context, function(err, html){
            response.end(html);
        });
    },
    namecardCreate_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var cal = qs.parse(body);
            db.query(`INSERT INTO namecard (name, description)
                    VALUES(?, ?)`, [cal.title, cal.description], function(err, result){
                if(err){
                    throw err;
                }
                response.writeHead(302, {Location:encodeURI('/namecard')});
                response.end();
            });
        });
    },
    namecardUpdate : function(request, response){
        var nameIds = request.params.nameId;
        db.query(`SELECT * FROM namecard where id = ${nameIds}`,
            function (error, result) {
                if (error) {
                    throw error;
                }
                var context = {
                    doc: `./namecard/namecardCreate.ejs`,
                    title: result[0].name,
                    description: result[0].description,
                    cls : request.session.class,
                    nId: nameIds,
                    kindOfDoc: 'U',
                    loggined: authIsOwner(request, response),
                    id: request.session.login_id
                };
                request.app.render('index', context, function (err, html) {
                    if(err){
                        throw err;
                    }
                    response.end(html);
                });
            }); 
    },
    namecardUpdate_process : function(request, response){
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var nc = qs.parse(body);
            var nameId = request.params.nameId;
            db.query('UPDATE namecard SET name=?, description=? WHERE id=?',
                [nc.title, nc.description, nameId], function (error, result) {
                    response.writeHead(302, { Location: `/namecard` });
                    response.end();
                });
        });
    },
    namecardDelete_process : function(request, response){
        var nameId = request.params.nameId;
        db.query(`DELETE FROM namecard WHERE id = ?`, [nameId], function(err, result){
            if(err){
                throw err;
            }
            response.writeHead(302, {Location:encodeURI(`/namecard`)});
            response.end();
        });
    },
    namecardSearch : function(request, response){
        context = {
            doc : './search.ejs',
            kind : 'Namecard Search',
            listyn : 'N',
            keyword : '',
            hld : 'Namecard',
            cls : request.session.class,
            loggined : authIsOwner(request, response),
            id : request.session.login_id
        };
        request.app.render('index', context, function(err,html){
            if(err) throw err;
            response.end(html);
        });
    },
    namecardSearch_result : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
        db.query(`SELECT * FROM namecard WHERE name like ?`, [post.keyword], function(err, results){
                if(err) throw err;
                context = {
                    keyword : post.keyword,
                    doc : './search.ejs',
                    hld : 'Namecard',
                    kind : 'Namecard Search',
                    listyn : 'Y',
                    cls : request.session.class,
                    loggined : authIsOwner(request, response),
                    id : request.session.login_id,
                    bs : results
                };
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        });    
    }
}

function authIsOwner(request, response){
    if(request.session.is_logined){
        return true;
    } else {
        return false;
    }
}

