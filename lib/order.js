var db = require('../../lib/db.js'); // 경로가 다를 수 있습니다.
var qs = require('querystring');
const { appendFile } = require('fs');
const { login } = require('./authentication.js');
function authIsOwner(request, response){
    //console.log(request.session);
    if(request.session.is_logined){
        return true;
    } else {
        return false;
    }
}

function dateOfEightDigit(){
    var today = new Date();
    var nowdate = String(today.getFullYear());
    var month ;
    var day ;
    if (today.getMonth() < 9)
        month = "0" + String(today.getMonth()+1);
    else
        month = String(today.getMonth()+1);
    if (today.getDate() < 10)
        day = "0" + String(today.getDate());
    else
        day = String(today.getDate());
       
    return nowdate + month + day;
}
module.exports = {
    home : function(request, response){
        var loginid = request.session.login_id;
        if(loginid == 'admin'){
            db.query('SELECT * FROM purchase P JOIN book B ON P.bookid = B.id', function(err, result){
                if(err) throw err;
                context = {
                    doc : `./order/order.ejs`,
                    loggined : authIsOwner(request,response),
                    id : loginid,
                    cls : request.session.class,
                    results : result
                }
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        } else{
            db.query('SELECT * FROM purchase P JOIN book B ON P.bookid = B.id WHERE P.custid = ?', [loginid], function(err, result){
                if(err) throw err;
                context = {
                    doc : `./order/order.ejs`,
                    loggined : authIsOwner(request,response),
                    id : loginid,
                    cls : request.session.class,
                    results : result
                }
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        }
    },
    create : function(request, response){
        var isAdmin = request.session.class;
        if(isAdmin == 'A'){
            context = {
                doc : `./order/orderCreate.ejs`,
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                cls : request.session.class,
                custid:'',
                purchasedate:'',
                bookid :'',
                qty:'',
                cancel:'N',
                refund:'N',
                kindOfDoc : 'C'
            }
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            })
        } else {
            response.end('your not admin!')
        }
    },
    create_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var purInf = qs.parse(body);
            db.query(`SELECT price FROM book WHERE id = ?`, [purInf.bookid], function(err, value){
                if(err) throw err;
                console.log(value[0].price);
                db.query(`INSERT INTO purchase (custid, bookid, purchasedate, qty, cancel, refund, price) 
                VALUES(?, ?, ?, ?, ?, ?, ?)`, [purInf.custid, purInf.bookid, purInf.purchasedate, purInf.qty, purInf.cancel, purInf.refund, value[0].price]
                , function(err, results){
                    if(err) throw err;
                    response.writeHead(302, {Location:'/order/list'});
                    response.end();
                });
            })
        })
        
// 가격 추가해줘야함
    },
    update : function(request, response){
        var purId = request.params.oId;
        if(request.session.class == 'A'){
            db.query(`SELECT * FROM purchase WHERE purchaseid = ?`,[purId], function(err, result){
                if(err) throw err;
                context = {
                    doc : `./order/orderCreate.ejs`,
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                cls : request.session.class,
                custid: result[0].custid,
                purchasedate:result[0].purchasedate,
                bookid :result[0].bookid,
                qty:result[0].qty,
                cancel:result[0].cancel,
                refund:result[0].refund,
                anywhere : result[0].purchaseid,
                kindOfDoc : 'U'
                }
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        } else response.end('Your not admin');
    },
    update_process : function(request, response){
        var purId = request.params.oId;
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var updInf = qs.parse(body);
            db.query(`UPDATE purchase SET custid=?, purchasedate=?, bookid=?, qty=?, cancel=?, refund=? WHERE purchaseid = ?`,
            [updInf.custid, updInf.purchasedate, updInf.bookid, updInf.qty, updInf.cancel, updInf.refund, purId], function(err, result){
                if(err) throw err;
                response.writeHead(302, {Location:encodeURI('/order/list')})
                response.end();
            })
        });
    },
    delete : function(request, response){
        var orderId = request.params.oId;
        db.query(`DELETE FROM purchase WHERE purchaseid = ?`, [orderId] , function(err, result){
            if(err) throw err;
            response.writeHead(302, {Location:encodeURI(`/order`) });
            response.end();
        });
    }
}