const express = require('express');
const app = express();
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
var db = require('../lib/db.js'); //경로가 다를 수 있습니다.
var auth = require('./lib/authentication.js');
var etc = require('./lib/etc.js');
var book = require('./lib/book.js');
var board = require('./lib/board.js');
var order = require('./lib/order.js');


var options = {
    host: 'localhost',
    user: 'nodejs',
    password: 'nodejs',
    database: 'webdb2022'
};
var sessionStore = new MySqlStore(options);

app.use(express.static('public'));

app.use(session({
    secret: 'asadlfkj!@#$%^dfgasdg',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

app.get('/', function(request, response){
    response.writeHead(302, {Location:encodeURI('/book/view/1')});
    response.end();
});

app.get('/book/view/:pNum', function (request, response) {
    book.home(request, response);
});
app.get('/bestseller', function (request, response) {
    book.bestseller(request, response);
});
app.get('/monbook', function (request, response) {
    book.monbook(request, response);
});
app.get('/ebook', function(request, response){
    book.ebook(request, response);
});
app.get('/book/list', function (request, response) {
    book.list(request, response);
});
app.get('/book_detail/:bookId', function (request, response) {
    book.book_detail(request, response);
});
app.get('/book/create', function (request, response) {
    book.bookCreate(request, response);
});
app.post('/book/create_process', function (request, response) {
    book.bookCreate_process(request, response);
});
app.get('/book/update/:bookId', function (request, response) {
    book.bookUpdate(request, response);
});
app.post('/book/update_process/:bookId', function (request, response) {
    book.update_process(request, response);
});
app.get('/book/delete_process/:bookId', function (request, response) {
    book.delete_process(request, response);
});
app.get('/calendar', function (request, response) {
    etc.calendarHome(request, response);
});
app.get('/calendar/create', function (request, response) {
    etc.calendarCreate(request, response);
});
app.post('/calendar/create_process', function (request, response) {
    etc.calendarCreate_process(request, response);
});
app.get('/calendar/list', function (request, response) {
    etc.calendarList(request, response);
});
app.get('/calendar/update/:planId', function (request, response) {
    etc.calendarUpdate(request, response);
});
app.post('/calendar/update_process/:planId', function (request, response) {
    etc.calendarUpdate_process(request, response);
});
app.get('/calendar/delete_process/:planId', function (request, response) {
    etc.calendarDelete_process(request, response);
});
app.get('/namecard', function (request, response) {
    etc.namecardHome(request, response);
});
app.get('/namecard/list', function (request, response) {
    etc.namecardList(request, response);
});
app.get('/namecard/create', function (request, response) {
    etc.namecardCreate(request, response);
});
app.post('/namecard/create_process', function (request, response) {
    etc.namecardCreate_process(request, response);
});
app.get('/namecard/update/:nameId', function (request, response) {
    etc.namecardUpdate(request, response);
});
app.post('/namecard/update_process/:nameId', function (request, response) {
    etc.namecardUpdate_process(request, response);
});
app.get('/namecard/delete_process/:nameId', function (request, response) {
    etc.namecardDelete_process(request, response);
});
app.get('/user', function (request, response) {
    auth.user(request, response);
});
app.get('/user/list', function (request, response) {
    auth.userList(request, response);
});
app.get('/user/create', function (request, response) {
    auth.userCreate(request, response);
});
app.post('/user/create_process', function (request, response) {
    auth.create_process(request, response);
});
app.get('/user/update/:loginId', function (request, response) {
    auth.userUpdate(request, response);
});
app.post('/user/update_process/:loginId', function (request, response) {
    auth.update_process(request, response);
});
app.get('/user/delete_process/:loginId', function (request, response) {
    auth.delete_process(request, response);
});
app.get('/login', function (request, response) {
    auth.login(request, response);
});
app.post('/login_process', function (request, response) {
    auth.login_process(request, response);
});
app.get('/logout', function (request, response) {
    auth.logout(request, response);
});
app.get('/register', function (request, response) {
    auth.register(request, response);
});
app.post('/register_process', function (request, response) {
    auth.register_process(request, response);
});
app.get('/passwordchange', function (request, response) {
    auth.password_change(request, response);
});
app.post('/password_change_process', function (request, response) {
    auth.password_change_process(request, response);
});
app.get('/book/search', function (request, response) {
    book.book_search(request, response);
});
app.post('/book/search', function (request, response) {
    book.book_search_result(request, response);
});
app.get('/calendar/search', function (request, response) {
    etc.calendarSearch(request, response);
});
app.post('/calendar/search', function (request, response) {
    etc.calendarSearch_result(request, response);
});
app.get('/namecard/search', function (request, response) {
    etc.namecardSearch(request, response);
});
app.post('/namecard/search', function (request, response) {
    etc.namecardSearch_result(request, response);
});
app.get('/board/list/:pNum', function (request, response) {
    board.list(request, response);
});
app.get('/board/view/:bNum/:pNum', function (request, response) {
    board.view(request, response);
});
app.get('/board/create', function (request, response) {
    board.create(request, response);
});
app.post('/board/create_process', function (request, response) {
    board.create_process(request, response);
});
app.get('/board/update/:bNum/:pNum', function (request, response) {
    board.update(request, response);
});
app.post('/board/update_process', function (request, response) {
    board.update_process(request, response);
});
app.get('/board/delete/:bNum/:pNum', function (request, response) {
    board.delete(request, response);
});
app.post('/cart/cart_process', function(request, response){
    book.cart_process(request, response);
});
app.get('/cart', function(request, response){
    book.cart(request, response);
});
app.get('/cart/delete_process/:cartid', function(request, response){
    book.cart_delete_process(request, response);
});
app.post('/purchase_process', function(request, response){
    book.purchase_process(request, response);
});
app.get('/purchase/:pId', function(request, response){
    book.purchase(request, response);
});
app.get('/purchase/purchase_confirm/:pId', function(request, response){
    book.purchase_confirm(request, response);
});
app.get('/purchase/purchase_cancel/:pId', function(request, response){
    book.purchase_cancel(request, response);
});
app.get('/order', function(request, response){
    if(request.session.class == 'A'){
        response.writeHead(302, {Location : '/order/list'});
        response.end();
    } else order.home(request, response);
});
app.get('/order/list', function(request, response){
    order.home(request, response);
});
app.get('/order/create', function(request, response){
    order.create(request, response);
});
app.post('/order/create_process', function(request, response){
    order.create_process(request, response);
});
app.get('/order/update/:oId', function(request, response){
    order.update(request, response);
});
app.post('/order/update_process/:oId', function(request, response){
    order.update_process(request, response);
});
app.get('/order/delete_process/:oId', function(request, response){
    order.delete(request, response);
});
app.listen(3000, () => console.log('yeah'));