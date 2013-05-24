
// jQ
//var $ = require('https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
//var $ = require('jquery');


// Socket.IOに接続する
var socket = io.connect("http://localhost:3000");
 
  // 接続時のイベント
socket.on("connect", function () {
    console.log("client: connect");
});

  // サーバーからメッセージを受け取った時のイベント
socket.on("message", function (message) {
    // 画面にメッセージを表示する
    appendMessage(message);
});
 
  // ディスコネクトした際のイベント
socket.on("disconnect", function (client) {
    console.log(client.sessionId + " disconnected.");
});

socket.on("roomList", function(roomList2){
    $("#list-box").text("");
    if(roomList2){
        for(var j in roomList2){
            console.log(j + "、" + roomList2[j] + "人います");
            var roomLcount = roomList2[j];
            var roomName = j;
            $("#list-box").append("<span class='NaCo'>" + roomName + "（" + roomLcount + " / 4）</span>");
        }
    }
});
socket.on("roomDel", function(roomList){
    $("#list-box").text("");
    if(roomList){
        for(var k in roomList){
            $("#list-box").append("<span class='NaCo'>" + k + "（" + roomList[k] + " / 4）</span>");
        }
    }
});



  // サーバーにメッセージを送信する機能
function sendMessage () {
    var msg = $("input#message").val();
    $("input#message").val("");
    if (msg.length > 0) {
        socket.emit("message", msg);
    }
}
 
//サーバーに入るルーム名を送信
function roomPut(){
    appendMessage("roomPut()");   
    var num = $("#enter").val();
    socket.emit("enter", {value: num});
}



 
// メッセージを表示
function appendMessage (message) {
    $("div#chat-box").append("<div class='msg'>" + message + "</div>");
}
 
$(function clickNaCo(){
    $(".NaCo").live("click", function(){
        $(this).css("background-color", "#D6D6D6");
    });
});


