// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/webrtc-broadcasting

angular.module('emptyOrchestraApp')
  .factory('observerSessionFactory', function() {
    var observe = function(sessionID) {
      var config = {
        openSocket: function(config) {
          var channel = config.channel || sessionID || 'webrtc-oneway-broadcasting';
          console.log('Channel is ' + channel);
          var socket = new Firebase('https://mycrofone.firebaseIO.com/' + channel);
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
      
    console.log('Now observing');
    captureUserMedia(function() {
      broadcastUI.createRoom({
        roomName: (document.getElementById('broadcast-name') || {}).value || 'Anonymous',
        isAudio: true
      });
    });

    var broadcastUI = broadcast(config);
  };
  
  return {
      observe: observe
  };
});
