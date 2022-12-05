var db = require('../../lib/db.js'); //경로가 다를 수 있습니다.

var qs = require('querystring');

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
    list : function(request,response){
        db.query(`SELECT count(*) as total FROM board`,function(error, nums){ //board table에 각 행을 전부 세서 total로 반환한다. nums로 넘겨준다
            if(error) throw error; //에러가 나면 왜 에러가 났는지 던져줌
            var numPerPage = 2; //2개씩 출력하는 행의 갯수 정의
            var pageNum = request.params.pNum // 주소에서 받아오는 페이지 위치 변수
            var offs = (pageNum-1)*numPerPage; //행의 시작위치를 정의해주는 변수
            var totalPages = Math.ceil(nums[0].total / numPerPage); //목록에 표시할 총 페이지 개수 이다. Math.ceil 함수는 소숫점을 올려주는 함수이다.
            db.query(`SELECT * FROM board ORDER BY date desc, id LIMIT ? OFFSET ?`, [numPerPage, offs],function(error, boards) {
                //목록 쿼리문과 그것을 정의해주는 변수들, 해당하는 행들을 board로 반환한다.
                if(error) {
                    throw error;
                }
                var context = {
                    doc : `./board/boardlist.ejs`, //렌더링 할 ejs 경로
                    cls : request.session.class, //관리자인지 아닌지 알려주는 변수
                    loggined : authIsOwner(request, response), //로그인 되있는지 안되있는지 알려주는 변수
                    id : request.session.login_id, //로그인아이디가 담겨있는 변수
                    kind : '게시판', //제목정의
                    board : boards, //반환한 board를 ejs파일로 넘겨주는 변수
                    pageNum : pageNum, //주소에서 받아온 페이지 위치변수
                    totalpages : totalPages //목록에 표시항 총 페이지 갯수를 넘겨준다.
                };
                request.app.render('index',context, function(err, html){ //렌더링 해주는 메서드
                    if(err) throw err;
                    response.end(html); })  
            });
        })
    },
    view : function(request,response){
        var bNum = request.params.bNum;
        var pNum = request.params.pNum;
        db.query(`SELECT *  FROM board WHERE id = ? `,[bNum],function(error, board){
                if(error) {
                    throw error;
                }
                var context = {doc : `./board/boardview.ejs`,
                            cls : request.session.class,
                            loggined : authIsOwner(request, response),
                            id : request.session.login_id,
                            kind : '게시물 내용',
                            pageNum : pNum,
                            board : board
                            };
                request.app.render('index',context, function(err, html){
                    response.end(html); })  
           
        })
    },
    create : function(request,response){
            db.query(`SELECT *  FROM person WHERE loginid = ? `,[request.session.login_id],function(error, person){
                if(error) {
                    throw error;
                }
                var context = {doc : `./board/boardcreate.ejs`,
                            cls : request.session.class,
                            loggined : authIsOwner(request, response),
                            id : request.session.login_id,
                            title : '',
                            content : '',
                            loginid : '',
                            name : person[0].name,
                            pNum : '',
                            kind : 'C'
                            };
                request.app.render('index',context, function(err, html){
                    if(err) throw err;
                    response.end(html); });  
            });  
    },
    create_process : function(request,response){
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            db.query(`
                INSERT INTO board (loginid, name, date, content,title, password)
                    VALUES(?, ?, ?, ?, ?, '1234')`,
                [post.id, post.nmh, dateOfEightDigit(),post.content, post.title], function(error, result) {
                    if(error) {
                        throw error;
                    }
                    response.writeHead(302, {Location: `/board/list/1`});
                    response.end();
                }
            );
        });
    },
    update : function(request, response) {
        var bNum = request.params.bNum;
        var pNum = request.params.pNum;
        db.query(`SELECT *  FROM person WHERE loginid = ? `,[request.session.login_id],function(error, person){
            db.query(`SELECT * FROM board WHERE id= ?`,[bNum],function(error,board){
                if(error) {
                    throw error;
                }
                var context = {doc : `./board/boardcreate.ejs`,
                            cls : request.session.class,
                            loggined : authIsOwner(request, response),
                            id : request.session.login_id,
                            title : board[0].title,
                            content : board[0].content,
                            loginid : bNum,
                            name : person[0].name,
                            pNum : pNum,
                            kind : 'U'
                            };
                request.app.render('index',context, function(err, html){
                    if(err) throw err;
                    response.end(html); });  
            });  
        });
    },
    update_process : function(request, response) {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            db.query('UPDATE board SET title=?, content=?, date=? WHERE id=?',
                [post.title, post.content, dateOfEightDigit(), post.loginid], function(error, result) {
                    if(error) throw error;
                response.writeHead(302, {Location: `/board/view/${post.loginid}/${post.pNum}`});
                response.end();
            });
        });
    },
    delete : function(request, response) {
        var bNum = request.params.bNum;
        var pNum = request.params.pNum;
        db.query('DELETE FROM board WHERE id = ?', [bNum], function(error, result) {
            if(error) {
                    throw error;
            }
            response.writeHead(302, {Location: `/board/list/${pNum}`});
            response.end();
        });
        
    }
}
