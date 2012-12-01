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
	
	lastTrack = track.uri;
	lastTimestamp = currentTimestamp;
	currentTimestamp = Number(new Date());
	differenceTimestamp = currentTimestamp - lastTimestamp;
	listenedAll = (differenceTimestamp > (lastTrackDuration-10000))?true:false;
	lastTrackDuration = track.duration;
	
	if (playerTrackInfo == null) {
		trackSection.innerHTML = "Nothing playing!";
	} else {
	  var playStop = (event.data.playstate?"P":"S");
		trackSection.innerHTML = trackSection.innerHTML+
		"#"+differenceTimestamp+"#"+
		lastTrack+" ("+lastTrackDuration+") "+
		playStop+"["+listenedAll+"]"+"<br />\n";
	}
});

function playSong(trackURI) {
  var sp = getSpotifyApi();
	var models = sp.require('$api/models');
	var player = models.player;
	player.play(trackURI)
}

function createEntity() {  
  var song = new Usergrid.Entity("songs");
  song.set("title","Song 2");
  song.set("artist","Blur");
  song.set("spotify-url", "spotify:track:3GfOAdcoc3X5GPiiXmpBjK");
  song.set("budget", 1000);
  song.save();
}

function getSongs() {
  var songs = new Usergrid.Collection('songs');
  songs.setQueryParams({"limit":"1000"});
  songs.get(function() {
    while(songs.hasNextEntity()) {
      var song = songs.getNextEntity();
      $('#sponsored_song_list').append('<li><a href="'+ song.get('spotify-url') + '">' + song.get('artist') + " - " + song.get('title') + "</a></li>");
    }
  });
}

$(function() {
  getSongs();
});