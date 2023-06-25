let router = require('express').Router();

const 로그인했니 = (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.send('로그인 해주세욥');
    }
}; //미들웨어역활 사용자가 로그인했는지 안했는지 검사하는 함수

router.use(로그인했니); // 이 파일안에 있는 모든 router들에게 전역으로 해당 함수적용
/* router.use('/sub/sports', 로그인했니); // /sub/sports 에만 들어갔을때 적용 */

// router.get('/sub/sports', 로그인했니, (req, res) => {
//     res.send('스포츠 게시판');
// });

router.get('/sub/sports', (req, res) => {
    res.send('스포츠 게시판');
});

router.get('/sub/game', (req, res) => {
    res.send('게임 게시판');
});

module.exports = router;