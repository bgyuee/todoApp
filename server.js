require('dotenv').config(); //환경변수 사용
const express = require('express');
const app = express();
const port = process.env.PORT;
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URL;
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



app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function(error, reuslt){
        console.log(reuslt);
        res.render('list.ejs', { posts : reuslt });
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
        next()
    } else {
        res.send('로그인 해주세욥');
    }
}; //미들웨어역활 사용자가 로그인했는지 안했는지 검사하는 함수

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

// 로그인한 정보 세션유지
  passport.serializeUser(function (user, done) { //세션을 저장시키는 코드 (로그인 성공시 발동)
    done(null, user.id)
  });
  
  passport.deserializeUser(function (아이디, done) { // 나중에 호출되는애 (마이페이지 접속시 발동)
    db.collection('login').findOne({ id : 아이디 }, (error, result) => {
      done(null, result);
    });
  });

  /* 회원가입 */
  app.post('/register', (req, res) => {
    db.collection('login').insertOne({ id : req.body.id, pw : req.body.pw }, (error, result) => {
      res.redirect('/');
    });
  });

  /* 글작성 */
  app.post('/add', (req, res) => {

    // res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, reuslt){
        console.log(reuslt.totalPost);
        let 총게시물갯수 = reuslt.totalPost;

        let userContent = { 작성자 : req.user._id, _id: 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date }

    db.collection('post').insertOne(userContent, function (error, reuslt) {
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

  /* 삭제요청 */
  app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id); // 문자데이터를 정수로 parseInt함수를 써서 바꿔줌

    let 삭제할데이터 = { _id : req.body._id, 작성자 : req.user._id }

    // req.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(삭제할데이터, function(error, result){
        console.log('삭제완료');
        if (result) {console.log(result);}
        res.status(200).send({ message : '성공했습니다' }); //응답코드 200을 보내주세요 & 메세지도 보내주세여  200 : 성공, 400 : 실패  이 숫자를 보내줘야 제이쿼리에 ajax의 done(200), fail(400)이 실행된다
    });
  });


  /* 검색기능 */
  app.get('/search', (req, res) => {
    let 검색조건 = [
        {
            $search: {
              index: 'titleSearch',
              text: {
                query: req.query.value,
                path: ['제목', '날짜']  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
              }
            }
          },
        //   {
        //     $sort : { _id : 1 } // 1 : 오름차순 -1, : 내림차순
        //   },
        //   {
        //     $limit : 10 // 글 목록 제한
        //   },
          {
            $project : { 제목 : 1, _id : 1, score : { $meta: "searchScore" } } //1:가져옴 0: 안가져옴 score : 검색관련도 높을수록 관련있음
          }

    ]
    console.log(req.query.value); //사용자가 입력한 검색어
    db.collection('post').aggregate(검색조건).toArray((error, result) => {// toArray : 찾은 데이터들을 배열로 변환시켜줌
        console.log(result);
        res.render('searchResult.ejs', { searchResult :  result});
    }); 
  });


  /* routes 분할 */
  app.use('/shop', require('./routes/shop.js')); //shop.js에서 배출한 변수를 첨부 할 수 있다.
  app.use('/board', require('./routes/board.js')); //board.js에서 배출한 변수를 첨부 할 수 있다.