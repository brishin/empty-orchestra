'use strict';

// TODO: When angularFire updates $scope.rooms get the front of the queue and call joinRoom on it
// if something exists on the front of the queue.

var app = angular.module('emptyOrchestraApp');

app.controller('PresenterCtrl', function ($scope, $q, $routeParams, progressbar, routeWatcher, angularFire) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  var FirebaseSession = new Firebase('https://empty-orchestra.firebaseio.com/sessions/').child($scope.sessionID);
  $scope.rooms = [];
  $scope.roomsLeft = {};
  angularFire(FirebaseSession.child('queue'), $scope, "rooms");
  
  routeWatcher.watch(function() {
    // if (broadcastUI.getAudioPlayer())
    //   angular.element(broadcastUI.getAudioPlayer()).remove();
    // broadcastUI.getAudioPlayer().muted = true;
  });
  
  // Join room when the queue changes
  $scope.$watch('rooms', function(newValue, oldValue) {
    var newRoom = $scope.rooms[0];
    if (newRoom) {
      broadcastUI.joinRoom({
        roomToken: $scope.rooms[0].roomToken,
        joinUser: $scope.rooms[0].broadcaster
      });
    }

    var oldRoom = oldValue[0];
    if (oldRoom) {
      $scope.roomsLeft[oldRoom.roomToken] = true;
    }
  });
  
  $scope.listening = false;
  
  $scope.startListening = function () {
    $scope.listening = true;
    var room = $scope.rooms[0];
    if (room) {
      console.log('Listening to');
      console.log(room);
    } 
    var audioPlayer = broadcastUI.getAudioPlayer();
    if (audioPlayer) audioPlayer.muted = false;   
  };
  
  $scope.pauseListening = function () {
    $scope.listening = false;
    var audioPlayer = broadcastUI.getAudioPlayer();
    if (audioPlayer) audioPlayer.muted = true;    
  };
  
  $scope.nextRoom = function () {
    $scope.pauseListening();
    var oldRoom = $scope.rooms.shift();

    $scope.startListening();
  };
  
  var config = {
    openSocket: function(conf) {
        var channel = conf.channel || $scope.sessionID || 'webrtc-oneway-broadcasting';
      console.log(conf.channel);
        console.log(channel);
        var socket = new Firebase('https://empty-orchestra.firebaseio.com/channels/' + channel);
        socket.channel = channel;
        socket.on('child_added', function(data) {
            console.log('Child added to socket');
            var room = data.val();
            console.log(room);
            if (room.roomToken in $scope.roomsLeft) {
              console.log('This guys left. Ignoring');
              return;
            }
            conf.onmessage(data.val());
        });
        socket.send = function(data) {
            var room = data;
            console.log(room);
            if (room.roomToken in $scope.roomsLeft) {
              console.log('This guys left. Ignoring');
              return;
            }
            this.push(data);
        }
        conf.onopen && setTimeout(conf.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function(htmlElement) {},
    onRoomFound: function(room) {
      console.log("onRoomFound CALLED");
      console.log(room);
      var roomInQueue = $scope.rooms[0];
      console.log(roomInQueue);
      // if (roomInQueue && roomInQueue.uid == room.roomToken) {
        broadcastUI.joinRoom({
              roomToken: room.roomToken,
              joinUser: room.broadcaster
            });
      // } else {
        // TODO: How to disconnect user from broadcastUI
      // }
    },
    onNewParticipant: function(numberOfViewers) {
        document.title = 'Viewers: ' + numberOfViewers;
    }
  };
  
  function captureUserMedia(callback) {
      var constraints = {
          audio: true,
          video: false
      };
  
      var mediaConfig = {
          // video: htmlElement,
          onsuccess: function(stream) {
              config.attachStream = stream;
              callback && callback();
          },
          onerror: function() {
              alert('unable to get access to your microphone');
          }
      };
      if (constraints) mediaConfig.constraints = constraints;
      getUserMedia(mediaConfig);
  }
  
  var broadcastUI = broadcast(config);
});

function uniqueToken() {
  var s4 = function () {
    return Math.floor(Math.random() * 0x10000).toString(16);
  };
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

app.controller('ObserverCtrl', function ($scope, $q, $routeParams, progressbar, angularFire) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  var FirebaseSession = new Firebase('https://empty-orchestra.firebaseio.com/sessions/').child($scope.sessionID);
  $scope.queue = [];
  angularFire(FirebaseSession.child('queue'), $scope, "queue");
  $scope.prompt = true;
  $scope.room = {
    name: "",
    uid: uniqueToken()
  };
  

  //FirebaseSession.child('queue').on('c', function (snapshot) {
  //  $scope.queue = snapshot.val();
  //});
  
      var config = {
        openSocket: function(config) {
          var channel = config.channel || $scope.sessionID || 'webrtc-oneway-broadcasting';
          console.log('Channel is ' + channel);
          var socket = new Firebase('https://empty-orchestra.firebaseio.com/channels/' + channel);
          socket.channel = channel;
          socket.on('child_added', function(data) {
              config.onmessage(data.val());
          });
          socket.send = function(data) {
              this.push(data);
          }
          config.onopen && setTimeout(config.onopen, 1);
          socket.onDisconnect().remove();
          return socket;
        },
        onRemoteStream: function(htmlElement) {},
        onRoomFound: function(room) {
            console.log(room);
        },
        onNewParticipant: function(numberOfViewers) {
            document.title = 'Viewers: ' + numberOfViewers;
        }
    };
    
    function captureUserMedia(callback) {
        var constraints = {
            audio: true,
            video: false
        };
    
        var mediaConfig = {
            // video: htmlElement,
            onsuccess: function(stream) {
                config.attachStream = stream;
                callback && callback();
            },
            onerror: function() {
                alert('unable to get access to your microphone');
            }
        };
        if (constraints) mediaConfig.constraints = constraints;
        getUserMedia(mediaConfig);
    }
    
    $scope.askQuestion = function () {
      console.log("Entering queue");
      console.log($scope.room);
      captureUserMedia(function() {
        var roomData = broadcastUI.createRoom({
          roomName: $scope.room.name || 'Anonymous',
          isAudio: true
        });
        console.log('ROOOOOOOM DATA WORKED');
        console.log(roomData);
        $scope.queue.push(roomData);
        $scope.$apply();
      });
      //FirebaseSession.child('queue').push($scope.room, function(error) {
      //  console.log("yayy!");
      //});
      // $scope.queue.push($scope.room);
      $scope.prompt = false;
    };
  
  $scope.leave = function () {
    var index = $scope.queue.indexOf($scope.room);
    $scope.queue.shift();
    $scope.prompt = true;
    console.log(broadcastUI);
    broadcastUI.stopBroadcasting();
    console.log('Trying to close');
    config.onclose()
    console.log(config);
  }

    var broadcastUI = broadcast(config);
});
