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
    console.log(req.body.date);
    console.log(req.body.title);
    db.collection('post').insertOne({ 제목 : req.body.title, 날짜 : req.body.date }, function (에러, 결과) {
        console.log('저장완료');
    });
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function(error, reuslt){
        console.log(reuslt);
        res.render('list.ejs', { posts : reuslt });
    });
});