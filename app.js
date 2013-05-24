

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var count = 0;
var roomList = new Object();
var jsonBoth = {};
 
function htmlspecialchars(ch) { 
    ch = ch.replace(/&/g,"&");
    ch = ch.replace(/"/g,'"');
    ch = ch.replace(/'/g,"'");
    ch = ch.replace(/>/g,">");
    return ch;
}
//XSSの回避
 
var io = require('socket.io').listen(server);


io.sockets.on("connection", function (socket) {
    console.log("connected");
 
    count++;
    io.sockets.emit("port", {value: count});
    //オンライン者数を+1し、人数を更新
 
    if(roomList){
        io.sockets.emit("roomList", roomList);
    }
    //ルームが作られていればクライアントを更新
 
    function upDateRL(roomList){
        if(roomList){
            io.sockets.emit('roomList', roomList);
        }
    }
 
    socket.on("enter", function(data2){
        var data2name = htmlspecialchars(data2.value);
        //ルーム作成orルーム入室イベントが起きる。XSSを回避
        if(!roomList[data2name]){
            //ルームが作られていない場合
 
            roomList[data2name] = 1;
            console.log(data2name + "番ルームが作られました。" + roomList[data2name] + "人います。" );
 
            socket.set('room', data2name);
            socket.join(data2name);
 
            io.sockets.to(data2name).emit('message', data2name + "に入室しました");
 
            io.sockets.emit("roomList", roomList);
 
        }else if(roomList[data2name]){
            if(roomList[data2name] >= 1 && roomList[data2name] < 4){
                //ルームが作られていて、人数が1～3人の場合
                roomList[data2name]++;
 
                console.log(data2name+ "番ルームに入室しました。現在" + roomList[data2name] + "人");
 
                socket.set('room', data2name);
                socket.join(data2name);
 
                io.sockets.to(data2name).emit('message', data2name + "に入室しました");
 
                upDateRL(roomList);
 
            }else{
                console.log(data2name+ "番ルームは満員です。");
                //ルームが作られていて人数が満員の時
            }
        }
    }); 
 
    socket.on('message', function(data3) {
        var room;
        socket.get('room', function(err, _room) {
            room = _room;
        });
 
        data3 = htmlspecialchars(data3);
 
        io.sockets.to(room).emit('message', data3);
        console.log("ルーム別メッセ[" + room + "]へ「" + data3 + "」の送信がありました。");
    });
 
    socket.on("disconnect", function () {
        count--;
 
        var room;
 
        socket.get('room', function(err, _room){
            room = _room;
        });
        if(room){
            roomList[room]--;   
            socket.leave(room);
 
            if(roomList[room] < 1){
                console.log(room + "の人数が0を下回りました。ルームを削除します。");
                delete roomList[room];
                console.log(roomList);
                io.sockets.emit("roomDel", roomList);
            }else{
                console.log(room + "の人数：現在" + roomList[room]);
                io.sockets.to(room).emit('message', room + "を退室しました");
                upDateRL(roomList);
            }
        }
 
        console.log("ウェブサイトから退室：現在" + count + "人");
        io.sockets.emit("port", {value: count});
    });
});

