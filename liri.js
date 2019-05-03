require("dotenv").config();
var fs = require("fs");
var axios = require("axios");
var keys = require("./keys.js");
var SpotifyApi = require("node-spotify-api");
var spotify = new SpotifyApi(keys.spotify);
var moment = require("moment");

// command line text
var arg = process.argv;

var command = process.argv[2];

var request = process.argv.slice(3).join(" ");


// switch statement to evaluate user input
switch (arg[2]) {
    case "movie-this":
        movieThis(request);
        break;
    case "concert-this":
        concertThis(request);
        break;
    case "spotify-this":
        spotifyThis(request);
        break;
    case "do-what-it-says":
        // reads the random.txt file
        doWhatItSays();
        break;
    default:
        console.log('** Type a request using the following examples below as a guide: ** \n' +
            'node liri.js concert-this <band name> \n' +
            'node liri.js spotify-this-song <song name> \n' +
            'node liri.js movie-this <movie name> \n' +
            'node liri.js do-what-it-says \n'
        );
        process.exit();
}

// concertThis is the function that uses axios to call the Bands in Town Artist Events API
function concertThis(request) {
    if (!request) {
        console.log("Please enter an artist or band for this search. In the meantime here some information for mana...");
        axios.get("https://rest.bandsintown.com/artists/mana/events?app_id=codingbootcamp").then(function (response) {
            var concert = response.data[0];
            var concertDate = moment(concert.datetime).format('MM-DD-YYYY');
            var concertInfoTL = (`
                Venue Name: ${concert.venue.name}
                Venue City: ${concert.venue.city}
                Date of this Event: ${concertDate}
            `);
            console.log(concertInfoTL);
            process.exit();
        });
    } else {
        var queryURL1 = "https://rest.bandsintown.com/artists/" + request + "/events?app_id=codingbootcamp";

        axios.get(queryURL1).then(function (response) {
            if (response.data.length === 0 || response.data.includes("warn=Not found")) {
                console.log("No concert information is available for: " + artist + ". Please try another!");
            } else {
                var conResp = response.data[0];
                var concertDate = moment(conResp.datetime).format('MM-DD-YYYY');
                var concertInfo = (`
                Venue Name: ${conResp.venue.name}
                Venue Location: ${conResp.venue.city}, ${conResp.venue.country}
                Date of this Event: ${concertDate}
                `);
                console.log(concertInfo);
                process.exit();
            }
        });
    }
}



function spotifyThis() {
    if (command === "spotify-this") {
        //     console.log("Please enter a song for this search.");
        //     console.log("Please enter a song for this search. In the meantime here is the information for mariposa traicionera by mana...");
        //     spotify.search({ type: 'track', query: 'mariposa traicionera', limit: 5}).then(function(response) {
        //         var songAB = response.tracks.items;
        //         console.log(songAB);
        //         for (var i = 0; i < songAB.length; i++) {
        //             var songInfoAB = (`
        //             Song Title: ${songAB[i].name}
        //             Artist(s): ${songAB[i].artists[0].external_urls.name}
        //             Album: ${songAB[i].album.name}
        //             Preview URL: ${songAB[i].preview_url}
        //             `);
        //             console.log(songInfoAB);
        //             process.exit();
        //         }
        //     });
        // } else {
        spotify.search({ type: "track", query: request }).then(function (response) {
            if (response.tracks.items.length === 0) {
                console.log("Sorry, Spotify couldn't find this song. Please try another song.");
                process.exit();
            }

            var song = response.tracks.items[0];

            var songInfo = (`
                Song Title: ${song.name}
                Artist(s): ${song.artists[0].name}
                Album: ${song.album.name}
                Preview URL: ${song.preview_url}
                `);
            console.log(songInfo);


        }).catch(function (error) {
            console.log(error);
        });
    }
}


// movieThis is the function that calls the OMDB API based on the user input 
function movieThis(request) {
    console.log(request);
    if (!request) {
        console.log("Please enter a movie for this search. In the meantime here is the information for Cars...");
        queryURL = "http://www.omdbapi.com/?t=cars&y=&plot=short&apikey=b55c4ee7";
        axios.get(queryURL).then(function (response) {
            var movieInfoMN = (`
            Title: ${response.data.Title}
            Year: ${response.data.Year}
            Rated: ${response.data.Rated}
            IMDB Score: ${response.data.Ratings[0].Value}
            Rotten Tomatoes Score: ${response.data.Ratings[1].Value}
            Country: ${response.data.Country}
            Languages: ${response.data.Language}
            Plot: ${response.data.Plot}
            Actors: ${response.data.Actors}
            `);
            console.log(movieInfoMN);
            process.exit();
        });
    } else {
        var queryURL = "http://www.omdbapi.com/?t=" + request + "&y=&plot=short&apikey=b55c4ee7";
        console.log(queryURL);
        axios.get(queryURL).then(function (response) {
            if (response.data.Error) {
                console.log(`${response.data.Error}`);
                process.exit();
            } else {
                var movieInfo = (`
                Title: ${response.data.Title}
                Year: ${response.data.Year}
                Rated: ${response.data.Rated}
                IMDB Score: ${response.data.Ratings[0].Value}
                Rotten Tomatoes Score: ${response.data.Ratings[1].Value}
                Country: ${response.data.Country}
                Languages: ${response.data.Language}
                Plot: ${response.data.Plot}
                Actors: ${response.data.Actors}
                `);
                console.log(movieInfo);
                process.exit();
            }
        });
    }
}

function doWhatItSays() {

    // read from random.txt
    fs.readFile("random.txt", "utf8", function (err, data) {
        var entries = data.split(',');
        switch (entries[0]) {
            case "movie-this":
                movieThis(entries[1]);
                break;
            case "concert-this":
                concertThis(entries[1]);
                break;
            case "spotify-this-song":
                spotifyThis(entries[1]);
                break;
            default:
                console.log(`I'm sorry I don't know what to run. Make sure the random.txt file has the correct formatting. Choose an option below, follow the guide, and insert it into the random.txt file. Then you can run the command line 'node liri.js do-what-it-says to get the proper response.` +
                    `spotify-this-song,"<song title>"` +
                    `movie-this,"<movie-title>"` +
                    `concert-this,<artist/band name (note-without quotations!)>
                `);
        }
    });
}

// spotifyThis();