var db = require('../../lib/db.js'); // 경로가 다를 수 있습니다.
var qs = require('querystring');
module.exports = {
    login : function(request, response){
        var subdoc;
        if(authIsOwner(request, response) === true){
            subdoc = './book/book.ejs';
        } else subdoc = './user/login.ejs';
        var context = {
            doc : subdoc,
            id : request.session.login_id,
            loggined : authIsOwner(request,response),
            cls : request.session.class
        };
        request.app.render('index', context, function(err, html){
            if(err) throw err;
            response.end(html);
        });
    },
    login_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            db.query(`SELECT loginid, password, class FROM person WHERE loginid = ? and password = ?` , 
            [post.id, post.pw], function(err, result){
                if(err) throw err;
                if(result[0] === undefined) {
                    response.end('아이디 또는 비밀번호가 틀렸습니다.');
                } 
                else {
                    request.session.is_logined = true;
                    request.session.login_id = result[0].loginid;
                    request.session.class = result[0].class;
                    response.redirect('/');
                }
            });
        });
    },
    logout : function(request, response){
        request.session.destroy(function(err){
            response.redirect('/');
        });
    },
    register : function(request, response){
        var context = {doc : `./user/register.ejs`,
                    title : '',
                    description : '',
                    cls : request.session.class,
                    loggined : authIsOwner(request,response),
                    id : request.session.login_id
                };
        request.app.render('index', context, function(err, html){
            response.end(html);
        });
    },
    register_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var inf = qs.parse(body);
            db.query(`INSERT INTO person (loginid, password, name, address, tel, birth, class, grade)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, [inf.id, inf.pw, inf.name, inf.address, inf.tel, inf.birth, 'b', 'b'], function(err, results){
                if(err) throw err;

                request.session.is_logined = true;
                request.session.login_id = inf.id;
                request.session.class = inf.class;
                response.writeHead(302, { Location: `/` });
                response.end();
                       
            });
        });
    },
    password_change : function(request, response){
        var rId = request.session.login_id;
        context = {
            doc : './user/passwordchange.ejs',
            cls : request.session.class,
            loggined : authIsOwner(request, response),
            id : rId
        };
        request.app.render('index', context, function(err, result){
            if(err) throw err;
            response.end(result);
        });
    },
    password_change_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var pw = qs.parse(body);
            var id = request.session.login_id;
            db.query('UPDATE person SET password = ? WHERE loginid=?', [pw.pw, id], function(err, result){
                response.writeHead(302, {Location: '/'});
                response.end();
            });
        });
    },
    user : function(request, response){
        db.query(`SELECT * FROM person`, function(err, result){
            var context = {
                doc : `./user/user.ejs`,
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                cls : request.session.class,
                results : result
            };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
    },
    userList : function(request, response){
        db.query(`SELECT * FROM person`, function(err, result){
            var context = {
                doc : `./user/userlist.ejs`,
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                cls : request.session.class,
                results : result
            };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
    },
    userCreate : function(request, response){
        var context = {
            doc : `./user/userCreate.ejs`,
            loginid : '',
            password : '',
            name : '',
            address : '',
            tel : '',
            birth : '',
            class : '',
            grade : '',
            kindOfDoc : 'C',
            loggined : authIsOwner(request,response),
            id : request.session.login_id,
            cls : request.session.class,
        };
        request.app.render('index', context, function(err, html){
            if(err) throw err;
            response.end(html);
        });
    },
    create_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var inf = qs.parse(body);
            db.query(`INSERT INTO person (loginid, password, name, address, tel, birth, class, grade)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, [inf.loginid, inf.password, inf.name, inf.address, inf.tel, inf.birth, inf.class, inf.grade], function(err, results){
                if(err) throw err;
                response.writeHead(302, { Location: `/user/list` });
                response.end();
            });
        });
    },
    userUpdate : function(request, response){
        var loginId = request.params.loginId;
        db.query(`SELECT * FROM person WHERE loginid =? `, [loginId],function(err, result){
            if(err) throw err;
            console.log(result);
            context = {
                doc : `./user/userCreate.ejs`,
                loginid : result[0].loginid,
                password : result[0].password,
                name : result[0].name,
                address : result[0].address,
                tel : result[0].tel,
                birth : result[0].birth,
                results : result,
                kindOfDoc : 'U',
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                cls : request.session.class
            }
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
        
    },
    update_process : function(request, response){
        var loginids = request.params.loginId;
        console.log(loginids);
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var user = qs.parse(body);
            console.log(user);
            db.query('UPDATE person SET loginid=?, password=?, name=?, address=?, tel=?, birth=?, class =?, grade=? WHERE loginid = ?',
                [user.loginid, user.password, user.name, user.address, user.tel, user.birth, user.class, user.grade, loginids], function (error, result) {
                    if(error) throw error;
                    response.writeHead(302, { Location: `/user/list` });
                    response.end();
                });
        });
    },
    delete_process : function(request, response){
        var loginId = request.params.loginId;
        db.query(`DELETE FROM person WHERE loginid = ?`, [loginId], function(err, result){
            if(err){
                throw err;
            }
            response.writeHead(302, {Location:encodeURI(`/user/list`)});
            response.end();
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