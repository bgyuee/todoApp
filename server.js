const express = require('express');
const app = express();
const port = 8080;
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://bgyuee:as970930@cluster0.usbyjbv.mongodb.net/?retryWrites=true&w=majority";
app.set('view engine', 'ejs');

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
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html');
});

app.post('/add', (req, res) => {
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, reuslt){
        console.log(reuslt.totalPost);
        let 총게시물갯수 = reuslt.totalPost;

    db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목 : req.body.title, 날짜 : req.body.date }, function (error, reuslt) {
        console.log('저장완료');
    // $set(변경), $inc(증가), $min(기존값보다 적을 때만 변경), $rename(key값 이름변경)
    db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost: 1} }, function(error, result){
        if(error) return console.log(error);
    })
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