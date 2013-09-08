'use strict';

var app = angular.module('emptyOrchestraApp');

app.controller('PresenterCtrl', function ($scope, $q, $routeParams, progressbar, routeWatcher) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  routeWatcher.watch();
  
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
    var oldRoom = $scope.rooms.shift();
    // delete $scope.presentRooms[oldRoom.broadcaster];
  };
  
  var config = {
    openSocket: function(config) {
        var channel = config.channel || $scope.sessionID || 'webrtc-oneway-broadcasting';
        console.log(config.channel);
        console.log(channel);
        var socket = new Firebase('https://empty-orchestra.firebaseio.com/' + channel);
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

app.controller('ObserverCtrl', function ($scope, $q, $routeParams, progressbar) {
  progressbar.complete();
  $scope.sessionID = $routeParams.sessionID;
  
      var config = {
        openSocket: function(config) {
          var channel = config.channel || $scope.sessionID || 'webrtc-oneway-broadcasting';
          console.log('Channel is ' + channel);
          var socket = new Firebase('https://empty-orchestra.firebaseio.com/' + channel);
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
            var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
            if (alreadyExist) return;
    
            if (typeof roomsList === 'undefined') roomsList = document.body;
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + room.roomName + '</strong> is broadcasting his media!</td>' +
                '<td><button class="join">Join</button></td>';
            roomsList.insertBefore(tr, roomsList.firstChild);
    
            var joinRoomButton = tr.querySelector('.join');
            joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
            joinRoomButton.setAttribute('data-roomToken', room.broadcaster);
            joinRoomButton.onclick = function() {
                this.disabled = true;
    
                var broadcaster = this.getAttribute('data-broadcaster');
                var roomToken = this.getAttribute('data-roomToken');
                broadcastUI.joinRoom({
                    roomToken: roomToken,
                    joinUser: broadcaster
                });
            };
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
      
    captureUserMedia(function() {
      broadcastUI.createRoom({
        roomName: (document.getElementById('broadcast-name') || {}).value || 'Anonymous',
        isAudio: true
      });
    });

    var broadcastUI = broadcast(config);
});
