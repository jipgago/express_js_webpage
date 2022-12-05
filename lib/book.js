const { findSourceMap } = require('module');
var qs = require('querystring');
var db = require('../../lib/db.js'); //경로가 다를 수 있습니다.
const { user } = require('./authentication.js');

module.exports = {
    home : function(request, response){
        db.query(`SELECT COUNT(*) as total FROM book`, function(err, nums){
            if(err) throw err;
            var numPerPage = 4;
            var pageNum = parseInt(request.params.pNum);
            var offs = (pageNum-1)*numPerPage; 
            var totalPages = Math.ceil(nums[0].total / numPerPage); 
            db.query(`SELECT * FROM book ORDER BY id LIMIT ? OFFSET ?`,[numPerPage, offs] ,function(error, result){
                if(error) throw error;
                var context = {
                    title : 'Book',
                    doc : `./book/book.ejs`,
                    loggined : authIsOwner(request,response),
                    id : request.session.login_id,
                    cls : request.session.class,
                    totalpages : totalPages,
                    pageNum : pageNum,
                    results : result,
                    list : 'Y'
                };
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
        });
    },
    bestseller : function(request, response){
        db.query(`SELECT * FROM book B join (SELECT * FROM(
            SELECT bookid, count(bookid) as numOfSeller
            FROM purchase
            group by bookid
            order by count(bookid) desc) A 
            LIMIT 3) S on B.id = S.bookid`
            , function(error, books){
            if(error) throw error;
                var context = {
                    title : 'Best Seller',
                    doc : './book/book.ejs',
                    loggined : authIsOwner(request,response),
                    id : request.session.login_id,
                    cls : request.session.class,
                    list:'N',
                    results : books
                }
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
    },
    monbook : function(request, response){
        db.query(`SELECT * FROM book B JOIN (SELECT * FROM (
            SELECT bookid, COUNT(bookid) AS numOfSeller
            FROM purchase
            WHERE left(purchasedate, 6) = ?
            group by bookid
            order by count(bookid) desc ) A Limit 3)
            S on B.id = S.bookid`, [dateOfEightDigit().substring(0, 6)], function(err, books){
                if(err) throw err;
                var context = {
                    title : '이달의 책',
                    doc : './book/book.ejs',
                    loggined : authIsOwner(request,response),
                    id : request.session.login_id,
                    cls : request.session.class,
                    list:'N',
                    results : books
                }
                request.app.render('index', context, function(err, html){
                    if(err) throw err;
                    response.end(html);
                });
            });
    },
    ebook : function(request, response){
        db.query(`SELECT * FROM book WHERE ebook = 'Y'`, function(err, result){
            if(err) throw err;
            context = {
                title : 'eBook',
                results : result,
                loggined : authIsOwner(request,response),
                id : request.session.login_id,
                list:'N',
                cls : request.session.class,
                doc: `./book/book.ejs`
            };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        })
    },
    list : function(request, response){
        db.query(`SELECT * FROM book`, function(err, result){
            if(err) throw err;
            var context = {
                doc : `./book/bookList.ejs`,
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
    book_detail: function(request, response){
        var bookId = request.params.bookId;
        db.query(`SELECT * FROM book WHERE id =${bookId}`, function(err, result){
            if(err){
                throw err;
            }

            var context = { doc: `./book/bookdetail.ejs`,
                        bookid : bookId,
                        loggined : authIsOwner(request, response),
                        name : result[0].name,
                        img : result[0].img,
                        publisher : result[0].publisher,
                        price : result[0].price,
                        stock : result[0].stock,
                        id : request.session.login_id,
                        cls : request.session.class,};
            request.app.render('index', context, function(error, html){
                if(error){
                    throw error;
                }
                response.end(html);
            });
        });
    },
    bookCreate : function(request,response){
        var context = {doc : `./book/bookCreate.ejs`,
                    name : '',
                    description : '',
                    author : '',
                    publisher : '',
                    stock : 0,
                    pubdate : '',
                    pagenum : 0,
                    isbn : '',
                    ebook : '',
                    kdc : '',
                    image : '',
                    price : 0,
                    nation : '',
                    kindOfDoc : 'C',
                    cls : request.session.class,
                    loggined : authIsOwner(request, response),
                    id : request.session.login_id
                };
        request.app.render('index', context, function(err, html){
            if(err) throw err;
            response.end(html);
        });
    },
    bookCreate_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var book = qs.parse(body);
            db.query(`INSERT INTO book (name, publisher, author, stock, pubdate, pagenum, ISBN, ebook, kdc, img, price, nation, description)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [book.name, book.publisher, book.author, book.stock, book.pubdate, book.pagenum, book.isbn, book.ebook, book.kdc, book.image, book.price, book.nation, book.description], function(err, result){
                if(err){
                    throw err;
                }
                response.writeHead(302, {Location:encodeURI('/book/list')});
                response.end();
            });
        });
    },
    bookUpdate : function(request,response){
        var bookIds = request.params.bookId;
        db.query(`SELECT * FROM book WHERE id = ${bookIds}`, function(err, result){
            if(err) throw err;
            var context = {doc : `./book/bookCreate.ejs`,
                    name : result[0].name,
                    description : result[0].description,
                    author : result[0].author,
                    publisher : result[0].publisher,
                    stock : result[0].stock,
                    pubdate : result[0].pubdate,
                    pagenum : result[0].pagenum,
                    isbn : result[0].ISBN,
                    ebook : result[0].ebook,
                    kdc : result[0].kdc,
                    image : result[0].img,
                    price : result[0].price,
                    nation : result[0].nation,
                    bId : bookIds,
                    kindOfDoc : 'U',
                    cls : request.session.class,
                    loggined : authIsOwner(request, response),
                    id : request.session.login_id
                };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
    },
    update_process : function(request, response){
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var book = qs.parse(body);
            var bookIds = request.params.bookId;
            db.query('UPDATE book SET name=?, publisher=?, author=?, stock=?, pubdate=?, pagenum=?, ISBN=?, ebook=?, kdc=?, img=?, price=?, nation=?, description=? WHERE id=?',
                [book.name, book.publisher, book.author, book.stock, book.pubdate, book.pagenum, book.isbn, book.ebook, book.kdc, book.image, book.price, book.nation, book.description, bookIds], function (error, result) {
                    if(error) throw error;
                    response.writeHead(302, { Location: `/book/list` });
                    response.end();
                });
        });
    },
    delete_process : function(request, response){
        var bookIds = request.params.bookId;
        db.query(`DELETE FROM book WHERE id = ?`, [bookIds], function(err, result){
            if(err){
                throw err;
            }
            response.writeHead(302, {Location:encodeURI(`/book/list`)});
            response.end();
        });
    },
    purchase : function(request, response){
        var purchaseid = request.params.pId;
        db.query(`select * from purchase P join book B on P.bookid = B.id WHERE purchaseid = ?`,[purchaseid] , function(err, result){
            if(err) throw err;
            context = {
                doc : './book/bookPurchase.ejs',
                results : result,
                cls : request.session.class,
                loggined : authIsOwner(request, response),
                id : request.session.login_id
            };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
    },
    purchase_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var list = qs.parse(body);
            console.log(list);
            if(list.cartid != undefined){
                db.query(`SELECT * FROM book WHERE id = ?`, [list.name], function(err, result){
                    if(err) throw err;
                    db.query(`INSERT INTO purchase (custid, bookid, purchasedate, price, qty, cartid) VALUES(?, ?, ?, ?, ?, ?)`,
                    [request.session.login_id, list.name, dateOfEightDigit(), result[0].price, list.qty, list.cartid], function(error, results){
                        if(error) throw error;
                        db.query(`SELECT * FROM purchase P JOIN book B ON P.bookid = B.id JOIN cart C ON P.cartid = C.cartid WHERE P.custid = ? AND P.refund = 'N' AND P.cancel = 'N'`,[request.session.login_id], function(err, idVal){
                            if(err) throw err;
                            response.writeHead(302, {Location:encodeURI(`/purchase/${idVal[0].purchaseid}`)});
                            response.end();
                        });
                    });
                });
            } else {
            list.cartid = 0;
            db.query(`SELECT * FROM book WHERE id = ?`, [list.name], function(err, result){
                if(err) throw err;
                db.query(`INSERT INTO purchase (custid, bookid, purchasedate, price, qty, cartid) VALUES(?, ?, ?, ?, ?, ?)`,
                [request.session.login_id, list.name, dateOfEightDigit(), result[0].price, list.qty, list.cartid], function(error, results){
                    if(error) throw error;
                    db.query(`SELECT * FROM purchase P JOIN book B ON P.bookid = B.id WHERE P.custid = ? AND P.refund = 'N' AND P.cancel = 'N' ORDER BY purchasedate DESC LIMIT 1`,[request.session.login_id], function(err, idVal){
                        if(err) throw err;
                        response.writeHead(302, {Location:encodeURI(`/purchase/${idVal[0].purchaseid}`)});
                        response.end();
                    });
                });
            });
        }
        });
    },
    purchase_confirm : function(request, response){
        var purchaseId = request.params.pId;
        db.query(`SELECT cartid FROM purchase where purchaseid = ?`, [purchaseId], function(error, results){
            if(error) throw error
            if(results[0].cartid != 0){
                db.query(`DELETE FROM cart WHERE cartid = ?`, [results[0].cartid], function(error, results){
                    if(error) throw error;
                });
            }
        })
        db.query(`UPDATE purchase SET refund = 'Y' WHERE purchaseid = ?`,[purchaseId] ,function(err, result){
            if(err) throw err;
            response.writeHead(302, {Location : encodeURI(`/`)});
            response.end();
        });
    },
    purchase_cancel : function(request, response){
        var purchaseId = request.params.pId;
        db.query(`UPDATE purchase SET cancel = 'Y' WHERE purchaseid =?` , [purchaseId], function(err, result){
            if(err) throw err;
            response.writeHead(302, {Location:encodeURI(`/`)});
            response.end();
        });
    },
    cart : function(request, response){
        var userid = request.session.login_id;
        db.query(`select * from cart C join book B on C.bookid = B.id where C.custid = ?`, [userid], function(err, result){
            if(err) throw err;
            context = {
                user : userid,
                doc : './book/bookCart.ejs',
                results : result,
                cls : request.session.class,
                loggined : authIsOwner(request, response),
                id : userid
            };
            request.app.render('index', context, function(err, html){
                if(err) throw err;
                response.end(html);
            });
        });
        
    },
    cart_delete_process : function(request, response){
        var cartIds = request.params.cartid;
        db.query(`DELETE FROM cart WHERE cartid = ?`, [cartIds], function(err, result){
            if(err){
                throw err;
            }
            response.writeHead(302, {Location:encodeURI(`/cart`)});
            response.end();
        });
    },
    cart_process : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var book = qs.parse(body);
            console.log(book);
            db.query(`INSERT INTO cart (custid, bookid, cartdate, qty) VALUES(?, ?, ?, ?)`,
            [request.session.login_id, book.name, dateOfEightDigit(), book.qty], function(err, result){
                if(err) throw err;
                    response.writeHead(302, { Location: `/cart` });
                    response.end();
            });
        })
        
    },
    book_search : function(request, response){
        context = {
            doc : './search.ejs',
            kind : 'Book Search',
            hld : '책',
            listyn : 'N',
            keyword : '',
            cls : request.session.class,
            loggined : authIsOwner(request, response),
            id : request.session.login_id
        };
        request.app.render('index', context, function(err,html){
            if(err) throw err;
            response.end(html);
        });
    },
    book_search_result : function(request, response){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
        db.query(`SELECT * FROM book WHERE name like ?`, [post.keyword], function(err, results){
                if(err) throw err;
                context = {
                    hld : '책',
                    keyword : post.keyword,
                    doc : './search.ejs',
                    kind : 'Book Search',
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
    if(request.session.is_logined) return true;
    else  return false;
}
function dateOfEightDigit() {
    var today = new Date();
    var nowdate = String(today.getFullYear());
    var month;
    var day;
    if (today.getMonth < 9)
        month = "0" + String(today.getMonth() + 1);
    else
        month = String(today.getMonth() + 1);

    if (today.getDate < 10)
        day = "0" + String(today.getDate());
    else
        day = String(today.getDate());
    return nowdate + month + day;
}