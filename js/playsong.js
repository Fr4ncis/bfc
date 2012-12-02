Usergrid.ApiClient.init('fr4ncis', 'sandbox');

var sp = getSpotifyApi();
var models = sp.require('$api/models');

var lastTimestamp = Number(new Date());
var currentTimestamp = Number(new Date());;
var lastTrack;
var lastTrackDuration = 99999999999;

models.player.observe(models.EVENT.CHANGE, function(event) {
	var player = models.player;
	var playerTrackInfo = player.track;
	var track = playerTrackInfo.data;
	
  lastTimestamp = currentTimestamp;
  currentTimestamp = Number(new Date());
  differenceTimestamp = currentTimestamp - lastTimestamp;
  listenedAll = (differenceTimestamp > (lastTrackDuration-10000))?true:false;
  
  if (lastTrack) {
    if (playerTrackInfo == null) {
       console.log("Nothing playing!");
    } else {
      console.log("#"+differenceTimestamp+"# "+lastTrack.name+" ("+lastTrackDuration+")");
      if (listenedAll) {
        updateBudget(lastTrack.uri, -1, 1);
      }
    }
	}
	
  lastTrack = track;
  lastTrackDuration = track.duration;
});


function updateBudget(track, budget_modification, plays_modification) {
    plays_modification = typeof plays_modification !== 'undefined' ? plays_modification : 0;
    
    var songs = new Usergrid.Collection('songs');
    songs.setQueryParams({"ql":"select * where spotify_url='"+track+"'"})
    songs.get(function() {
        if (songs.hasNextEntity()) {
	        song = songs.getNextEntity();
	        var budget = song.get('budget')+budget_modification;
	        song.set('budget', budget);
	        var play_count = song.get('play_count')+plays_modification;
	        song.set('play_count', play_count);
	        song.save();
	    }
    });    
}

function playSong(trackURI) {
  var sp = getSpotifyApi();
	var models = sp.require('$api/models');
	var player = models.player;
	player.play(trackURI);
}
 
function createEntity() {  
  var song = new Usergrid.Entity("songs");
  song.set("title","Song 2");
  song.set("artist","Blur");
  song.set("spotify_url", "spotify:track:3GfOAdcoc3X5GPiiXmpBjK");
  song.set("budget", 1000);
  song.save();
}

function getSongs() {
  var songs = new Usergrid.Collection('songs');
  songs.setQueryParams({"ql":"select * where budget>=0", "limit":"1000"});
  
  var sp = getSpotifyApi(1);
  var models = sp.require("sp://import/scripts/api/models");
  var views = sp.require("sp://import/scripts/api/views");

  songs.get(function() {
    while(songs.hasNextEntity()) {
        var song = songs.getNextEntity();
       
        // Generate the playable album art image
        var single_track = models.Track.fromURI(song.get('spotify_url'));
        var single_track_playlist = new models.Playlist();
        single_track_playlist.add(single_track);
        var single_track_player = new views.Player();
        single_track_player.track = null; // Don't play the track right away
        single_track_player.context = single_track_playlist;

        // Convert the player node to text
        var el = document.createElement("p");
        el.appendChild(single_track_player.node);
        var tmp = document.createElement("div");
        tmp.appendChild(el);
    
        // Generate the HTML snippet for this song
        $('#sponsored_songs').append('<li>'+
             '<div class="albumimage">'+
                 tmp.innerHTML +
             '</div>'+
             //'<a href="'+song.get('spotify_url')+'">'+
             '<a href="javascript:playSong(\''+song.get('spotify_url')+'\')">'+
                 '<h3>'+song.get('artist')+'</h3>'+
                 '<p>'+song.get('title')+'</p>'+
                 '<p class="playcount icon-music">Played '+song.get('play_count')+' times, '+song.get('budget')+' plays remaining</p>'+
             '</a>'+
         '</li>');
      
      // console.log(song.get('uuid'));
     }
  });
}

$(function() {
  getSongs();
});