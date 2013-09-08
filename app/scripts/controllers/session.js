'use strict';

var app = angular.module('emptyOrchestraApp');

app.controller('PresenterCtrl', function ($scope, $q, $routeParams, progressbar, routeWatcher) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  routeWatcher.watch(function() {
    if (broadcastUI.getAudioPlayer())
      angular.element(broadcastUI.getAudioPlayer()).remove();
    broadcastUI.getAudioPlayer().muted = true;
  });
  
  $scope.listening = false;
  $scope.rooms = [];
  var roomsPresent = {};
  
  $scope.startListening = function () {
    $scope.listening = true;
    var room = $scope.rooms[0];
    if (room) {
      room.initAndStart(function(room) {
        roomsPresent[room.broadcaster] = true;
      });
      var audioPlayer = broadcastUI.getAudioPlayer();
      if (audioPlayer) audioPlayer.muted = false;   
    } 
  };
  
  $scope.pauseListening = function () {
    $scope.listening = false;
    var audioPlayer = broadcastUI.getAudioPlayer();
    audioPlayer.muted = true;    
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
            conf.onmessage(data.val());
        });
        socket.send = function(data) {
            this.push(data);
        }
        conf.onopen && setTimeout(conf.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function(htmlElement) {},
    onRoomFound: function(room) {
      if (room.broadcaster in roomsPresent) return;  
      $scope.rooms.push({
        'name': room.roomName,
        'initAndStart': function (callback) {
          if (room.broadcaster in roomsPresent) return;
          console.log(roomsPresent);
          console.log(room.broadcaster);
          broadcastUI.joinRoom({
            roomToken: room.broadcaster,
            joinUser: room.broadcaster
          });
          if (callback) callback(room);
        }
      });
      
      $scope.$apply();
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
        broadcastUI.createRoom({
          roomName: $scope.room.name || 'Anonymous',
          roomToken: $scope.room.uid,
          isAudio: true
        });
      });
      //FirebaseSession.child('queue').push($scope.room, function(error) {
      //  console.log("yayy!");
      //});
      $scope.queue.push($scope.room);
      $scope.prompt = false;
    };
  
  $scope.leave = function () {
    var index = $scope.queue.indexOf($scope.room);
    $scope.queue.splice(index, 1);
    $scope.prompt = true;
  }

    var broadcastUI = broadcast(config);
});
