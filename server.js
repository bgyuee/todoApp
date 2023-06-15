const express = require('express');
const app = express();
const port = 8080;
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://bgyuee:as970930@cluster0.usbyjbv.mongodb.net/?retryWrites=true&w=majority";
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.use('/public', express.static('public')); //미들웨어 static 파일을 보관하기 위해 public 폴더를 쓸거다


let db;
MongoClient.connect(uri, { useUnifiedTopology: true }, function (에러, client) {
    // 연결되면 할일
  if (에러) return console.log(에러);
  
  db = client.db('todoapp');

//   db.collection('post').insertOne( {이름 : 'John', _id : 100} , function(에러, 결과){
//     console.log('저장완료'); 
//   });

  app.listen(port, function () {
    console.log('listening on 8080')
  });
  
});

// app.listen(port, () => {
//     console.log('listening on 8080');
// });

// req(요청), res(응답)
app.get('/pet', (req, res) => {
    res.send('펫 용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', (req, res) => {
    res.send('뷰티용품 쇼핑 페이지임');
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

app.post('/add', (req, res) => {
    // res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, reuslt){
        console.log(reuslt.totalPost);
        let 총게시물갯수 = reuslt.totalPost;

    db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date }, function (error, reuslt) {
        console.log('저장완료');
    // $set(변경), $inc(증가), $min(기존값보다 적을 때만 변경), $rename(key값 이름변경)
    db.collection('counter').updateOne(
        {name : '게시물갯수'}, 
        { $inc : {totalPost: 1} }, 
        function(error, result){
        if(error) return console.log(error);
        res.redirect('list');
    });
    });


    });
    
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function(error, reuslt){
        console.log(reuslt);
        res.render('list.ejs', { posts : reuslt });
    });
});

app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id); // 문자데이터를 정수로 parseInt함수를 써서 바꿔줌
    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제완료');
        res.status(200).send({ message : '성공했습니다' }); //응답코드 200을 보내주세요 & 메세지도 보내주세여  200 : 성공, 400 : 실패  이 숫자를 보내줘야 제이쿼리에 ajax의 done(200), fail(400)이 실행된다
    });
});

app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        console.log(result);
        res.render('detail.ejs', { data : result });
    });
});

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        console.log(result);
        res.render('edit.ejs', { data : result });
    });
});

app.put('/edit', function(req, res){
    db.collection('post').updateOne(
    { _id : parseInt(req.body.id) }, 
    { $set : { 제목 : req.body.title, 날짜 : req.body.date } }, 
    function(error, result){
        console.log('수정완료');
        res.redirect('/list');
    });
});

/* 회원가입, 로그인 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//미들웨어
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false})); 
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
failureRedirect : '/fail'
}), function(req, res){
    res.redirect('/') //인증된 계정을 지정한 주소로 보내줌
});

app.get('/mypage', 로그인했니, function(req, res){
    res.render('mypage.ejs');
});

function 로그인했니(req, res, next){
    if (req.user) {
        next();
    } else {
        res.send('로그인 해주세욥');
    }
};

// Localstrategy
passport.use(new LocalStrategy({
    usernameField: 'id', //form에 name값
    passwordField: 'pw', //form에 name값
    session: true, //로그인 후 session을 저장할건지
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));
