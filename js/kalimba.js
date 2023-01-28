/* -------------------------------------------------------------------------- */
/*      Authors:    Andrew Walsh, Michael Myer                                
/*      Course:     COMP 3612
/*      Assignment: 2
/*      Instructor: Randy Connolly
/*      Due:        Nov 17
/*      File:       kalimba.js
/* -------------------------------------------------------------------------- */
/* external references:
/*
/* Rick Astley - Never Gonna Give You Up 
/* https://www.youtube.com./watch?v=dQw4w9WgXcQ
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                               GLOBAL STRINGS                               */
/* -------------------------------------------------------------------------- */

const url = "https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php";
const OriginalList = "Original Songs List";
const ResultsList = "Filtered Songs List";
const GenresList = "Genres List";
const ArtistsList = "Artists List";
const PlaylistList = "Playlist List";


/* -------------------------------------------------------------------------- */
/*                             SHORTHAND FUNCTIONS                            */
/* -------------------------------------------------------------------------- */

/** localStorage.setItem( key, JSON.stringify( value ) )
 * 
 * @param {String} key 
 * @param {Array} value
 * 
 */
const storeLocalDataStringify = (key, value) => {localStorage.setItem(key, JSON.stringify(value))};

/** sessionStorage.setItem( key, JSON.stringify( value ) )
 * 
 * @param {String} key 
 * @param {Array} value 
 */
const storeSessionDataStringify = (key, value) => {sessionStorage.setItem(key, JSON.stringify(value))};

/**
 * 
 * @param {String} key 
 * @returns JSON.parse(localStorage.getItem(key)
 */
const getLocalDataParse = (key) => {return JSON.parse(localStorage.getItem(key))};

/**
 * 
 * @param {String} key 
 * @returns JSON.parse(sessionStorage.getItem(key))
 */
const getSessionDataParse = (key) => {return JSON.parse(sessionStorage.getItem(key))};

/**
 * 
 * @param {String} key 
 * @returns localStorage.getItem(key)
 */
const getLocalData = (key) => {return localStorage.getItem(key)};

/**
 * 
 * @param {String} key 
 * @returns sessionStorage.getItem(key)
 */
const getSessionData = (key) => {return sessionStorage.getItem(key)};

/**
 * 
 * @param {json} data 
 * @returns JSON.parse(data)
 */
const parse = (data) => {return JSON.parse(data)};

/**
 * 
 * @param {String} key 
 * @returns document.querySelector(key)
 */
const docQ = (key) => {return document.querySelector(key)};

/**
 * 
 * @param {String} key 
 * @returns document.querySelectorAll(key)
 */
const docQAll = (key) => {return document.querySelectorAll(key)};

/**
 * 
 * @param {String} element 
 * @returns document.createElement(element)
 */
const docMake = (element) => {return document.createElement(element)};




/* -------------------------------------------------------------------------- */
/*                         PRIMARY DOM CONTENT RUNNER                         */
/* -------------------------------------------------------------------------- */

/* Event after DOM load */
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem(OriginalList) == null) {
        retrieveSongData(url).then(()=>{
            console.log("Songs Now In Storage");
            populator()
            eventHandlers()
        });
    } else {
        console.log("In Storage");
        populator()
        eventHandlers()
    };
});




/* -------------------------------------------------------------------------- */
/*                              GROUPING HANDLERS                             */
/* -------------------------------------------------------------------------- */
function populator(){
    searchOptionsPopulator();
    searchResultsPopulator();
};

/* -------------------------------------------------------------------------- */

function eventHandlers(){
    sortResultsHeaderEvents();
    radioButtonClickListeners();
    searchFormSubmitEvent();
    setcloseViewButtonListener();
    setcreditsButtonListener(); 
    setplaylistButtonListener();
    clearPlaylistButtonListener();
};




/* -------------------------------------------------------------------------- */
/*                           API SONG DATA RETRIEVAL                          */
/* -------------------------------------------------------------------------- */

async function retrieveSongData(url) {
    console.log(`${OriginalList} was not already stored`);
    return fetch(url)
    .then(response => {
        if (response.ok) {
             return response.json();
        } else {
            throw new Error('Cannot Fetch Data');
        }
    })
    .then(data => {
        storeLocalDataStringify(OriginalList, data);
        console.log(`${OriginalList} data is now stored`);
    });
};




/* -------------------------------------------------------------------------- */
/*                           POPULATE HTML WITH DATA                          */
/* -------------------------------------------------------------------------- */

function searchOptionsPopulator() {
    storeLocalDataStringify(GenresList, parse(genres));
    storeLocalDataStringify(ArtistsList, parse(artists));
    populateSelections(docQ('#Select-Genre-Filter'), getLocalDataParse(GenresList));
    populateSelections(docQ('#Select-Artist-Filter'), getLocalDataParse(ArtistsList));
};

/* -------------------------------------------------------------------------- */

function searchResultsPopulator() {
    if (getSessionData(ResultsList) == null) {
        storeSessionDataStringify(ResultsList, getLocalDataParse(OriginalList));
    };
    if (getLocalData(PlaylistList) == null) {
        const playlist = [];
        storeLocalDataStringify(PlaylistList, playlist);
    }
    songList = getSessionDataParse(ResultsList);
    populateResults(sortTitle(songList, "Ascending"));
};

/* -------------------------------------------------------------------------- */

function populateSelections(selector, List){
    List.forEach(o =>{
        const option = docMake('option');
        option.setAttribute('value', o.name);
        option.textContent = o.name;
        selector.appendChild(option);
    });
};

/* -------------------------------------------------------------------------- */

function populateResults(list) {
    clearData('#search-results')
    const table = docQ('#search-results');
    list.forEach(s=>{
        const ul = docMake('ul');
        const add = docMake('button');
        add.setAttribute('data-song', s.song_id);
        add.classList.add("song-button", "round-corners");
        add.textContent = 'Add Song';
        setAddSongButtonListener(add);
        
        let li = docMake('li');
        li.setAttribute('data-song', s.song_id);
        li.setAttribute('data-view', 'browse-view');
        li.classList.add('song-title');

        li.textContent = s.title;
        setSongClickListener(li);
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-artist');
        li.textContent = s.artist.name;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-year');
        li.textContent = s.year;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-genre');
        li.textContent = s.genre.name;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-popularity');
        li.textContent = s.details.popularity;
        ul.appendChild(li);

        ul.appendChild(add);
        table.appendChild(ul);
    });
};




/* -------------------------------------------------------------------------- */
/*                                FILTER SONGS                                */
/* -------------------------------------------------------------------------- */

function filterSongs(filterParameter, filterSelection, songs) {
    /* results should be cleared */
    const songList = parse(songs);
    let filtered;

    if (filterParameter == "Song-Title-Filter") {
        filtered = songList.filter(s => s.title.toString().toLowerCase() == filterSelection.toLowerCase());
    }
    else if (filterParameter == "Select-Artist-Filter") {
        filtered = songList.filter(s => s.artist.name == filterSelection);
    }
    else if (filterParameter == "Select-Genre-Filter") {
        filtered = songList.filter(s => s.genre.name == filterSelection);
    }
    storeSessionDataStringify(ResultsList, filtered);
    populateResults(filtered);
};

/* -------------------------------------------------------------------------- */

function setFilterOption(selected) {
    const options = docQAll(`.filter-parameter`);
    options.forEach( o => {
        if (o.id == selected) {
            o.disabled = false;
        }
        else {
            o.value = "";
            o.disabled = true;
        };
    });
};

/* -------------------------------------------------------------------------- */

function sortBrowse(element, songs) {
    debugger;
    const songsList = parse(songs);
    const attr = element.target.getAttribute('value');
    const sortOrder = docQ("#browse-sort-button");
    if (attr == 'title') {
        populateResults(sortTitle(songsList, sortOrder.value));
    }
    else if (attr== 'artist') {
        populateResults(sortArtist(songsList, sortOrder.value));
    }
    else if (attr == 'year') {
        populateResults(sortYear(songsList, sortOrder.value));
    }
    else if (attr == 'genre') {
        populateResults(sortGenre(songsList, sortOrder.value));
    }
    else if (attr == 'popularity') {
        populateResults(sortPopularity(songsList, sortOrder.value));
    };
};

function sortPlaylist(element, songs) {
    const songsList = parse(songs);
    const attr = element.target.getAttribute('value');
    const sortOrder = docQ("#playlist-sort-button");

    if (attr == 'title') {
        populatePlaylistResults(sortTitle(songsList, sortOrder.value));
    }
    else if (attr== 'artist') {
        populatePlaylistResults(sortArtist(songsList, sortOrder.value));
    }
    else if (attr == 'year') {
        populatePlaylistResults(sortYear(songsList, sortOrder.value));
    }
    else if (attr == 'genre') {
        populatePlaylistResults(sortGenre(songsList, sortOrder.value));
    }
    else if (attr == 'popularity') {
        populatePlaylistResults(sortPopularity(songsList, sortOrder.value));
    };
};

/* -------------------------------------------------------------------------- */

function sortTitle(songs, sortOrder) {
    songs.sort(function (a, b) {
        let lessThan, greaterThan;
        if (sortOrder == "Ascending")
            lessThan = -1, greaterThan = 1
        else
            lessThan = 1, greaterThan = -1

        if (a.title.toString().toLowerCase() < b.title.toString().toLowerCase())
            return lessThan;
        else if (a.title.toString().toLowerCase() > b.title.toString().toLowerCase())
            return greaterThan;
        return 0;
    });
    return songs;
};

/* -------------------------------------------------------------------------- */

function sortArtist(songs, sortOrder) {
    songs.sort(function (a, b) {
        let lessThan, greaterThan;
        if (sortOrder == "Ascending")
            lessThan = -1, greaterThan = 1
        else
            lessThan = 1, greaterThan = -1

        if (a.artist.name < b.artist.name)
            return lessThan;
        else if (a.artist.name > b.artist.name)
            return greaterThan;
        return 0;
    });
    return songs;
};

/* -------------------------------------------------------------------------- */

function sortYear(songs, sortOrder) {
    songs.sort(function (a, b) {
        let lessThan, greaterThan
        if (sortOrder == "Ascending")
            lessThan = -1, greaterThan = 1
        else
            lessThan = 1, greaterThan = -1

        if (a.year < b.year)
            return lessThan;
        else if (a.year > b.year)
            return greaterThan;
        return 0;
    });
    return songs;
};

/* -------------------------------------------------------------------------- */

function sortGenre(songs, sortOrder) {
    songs.sort(function (a, b) {
        let lessThan, greaterThan;
        if (sortOrder == "Ascending")
            lessThan = -1, greaterThan = 1
        else
            lessThan = 1, greaterThan = -1

        if (a.genre.name.toLowerCase() < b.genre.name.toLowerCase())
            return lessThan;
        else if (a.genre.name.toLowerCase() > b.genre.name.toLowerCase())
            return greaterThan;
        return 0;
    });
    return songs;
};

/* -------------------------------------------------------------------------- */

function sortPopularity(songs, sortOrder) {
    songs.sort(function (a, b) {
        let lessThan, greaterThan;
        if (sortOrder == "Ascending")
            lessThan = -1, greaterThan = 1
        else
            lessThan = 1, greaterThan = -1

        if (a.details.popularity < b.details.popularity)
            return lessThan;
        else if (a.details.popularity > b.details.popularity)
            return greaterThan;
        return 0;
    });
    return songs;
};

/* -------------------------------------------------------------------------- */

function switchtoBrowseView() {
    docQ(`#browse`).classList.remove("hidden"); /* browse section */
    docQ(`#playlist-button`).classList.remove("hidden"); /* playlist-button button */
    docQ(`#song-view`).classList.add("hidden"); // song view section
    docQ(`#close-view-button`).classList.add("hidden"); //close view button
    docQ(`#playlist-view`).classList.add("hidden");
}



/* -------------------------------------------------------------------------- */
/*                             Song View Page Setup                           */
/* -------------------------------------------------------------------------- */

function switchToSongView(song, previousView) {
    debugger;
    docQ(`#browse`).classList.add("hidden");
    docQ(`#playlist-button`).classList.add("hidden");
    docQ(`#playlist-view`).classList.add("hidden");
    docQ(`#song-view`).classList.remove("hidden");
    const closeView = docQ(`#close-view-button`);
    closeView.classList.remove("hidden");
    closeView.setAttribute('data-view', previousView);

    populateSongDetails(song);
    populateAnalysisData(song);
    createSongChart(getChartData(song.analytics));
}

/* -------------------------------------------------------------------------- */

function populateSongDetails(song) {
    artistData = getLocalDataParse(ArtistsList);
    artist = artistData.find(a => a.name == song.artist.name)
    details = docQ(`#song-details ul`);
    details.textContent = '';
    
    // --- title ---
    let li = docMake('li');

    // --- title link ---
    let a = docMake('a');
    a.setAttribute('href', 'https://www.youtube.com./watch?v=dQw4w9WgXcQ%27');
    a.textContent = song.title;
    li.appendChild(a);
    details.appendChild(li)
    
    // --- artist ---
    li = docMake('li');
    li.textContent = `by ${song.artist.name}`;
    details.appendChild(li);
    
    // --- type ---
    li = docMake('li');
    li.textContent = `${artist.type}`;
    details.appendChild(li);
    
    // --- genre ---
    li = docMake('li');
    li.textContent = `${song.genre.name}`;
    details.appendChild(li);
    
    // --- year ---
    li = docMake('li');
    li.textContent = `${song.year}`;
    details.appendChild(li);
    
    // --- duration ---
    li = docMake('li');
    const seconds = song.details.duration;
    
    //referenced:
    //https://stackoverflow.com/questions/8043026/how-to-format-numbers-by-prepending-0-to-single-digit-numbers
    li.textContent = `${(seconds/60) | 0 }:${(seconds % 60).toLocaleString(undefined, {minimumIntegerDigits: 2})}`;
    details.appendChild(li);
};

/* -------------------------------------------------------------------------- */

function populateAnalysisData(song) {
    data = docQ(`#song-analysis-data ul`);
    data.textContent = '';
    // --- bpm ---
    let li = docMake('li');
    li.textContent = `BPM: ${song.details.bpm}`;
    li.classList.add(`padding-bottom-15`);
    data.appendChild(li);
    
    // --- popularity ---
    li = docMake('li');
    li.textContent = `Popularity: ${song.details.popularity}`;
    li.classList.add(`padding-bottom-15`);
    data.appendChild(li);

    // --- energy ---
    li = docMake('li');
    li.textContent = `Energy:`;
    li.appendChild(makeProgressBar(song.analytics.energy));
    data.appendChild(li);
    
    // --- danceability ---
    li = docMake('li');
    li.textContent = `Danceability:`;
    li.appendChild(makeProgressBar(song.analytics.danceability));
    data.appendChild(li);
    
    // --- liveness ---
    li = docMake('li');
    li.textContent = `Liveness:`;
    li.appendChild(makeProgressBar(song.analytics.liveness));
    data.appendChild(li);
    
    // --- valence ---
    li = docMake('li');
    li.textContent = `Valence:`;
    li.appendChild(makeProgressBar(song.analytics.valence));
    data.appendChild(li);
    
    // --- acousticness ---
    li = docMake('li');
    li.textContent = `Acousticness:`;
    li.appendChild(makeProgressBar(song.analytics.acousticness));
    data.appendChild(li);
    
    // --- speechiness ---
    li = docMake('li');
    li.textContent = `Speechiness:`;
    li.appendChild(makeProgressBar(song.analytics.speechiness));
    data.appendChild(li);
};

/* -------------------------------------------------------------------------- */

function makeProgressBar(metric) {
    let outerBar = docMake(`div`);
    outerBar.classList.add(`progress-bar`);
    let innerBar = docMake(`div`);
    innerBar.classList.add(`progress-level`);
    setProgressBar(metric, innerBar);
    outerBar.appendChild(innerBar);
    return outerBar;
}


/* -------------------------------------------------------------------------- /
/                             PLAYLIST VIEW SETUP                            /
/ -------------------------------------------------------------------------- */

function switchToPlaylistView() {
    docQ(`#browse`).classList.add("hidden");
    docQ(`#playlist-button`).classList.add("hidden");
    docQ(`#playlist-view`).classList.remove("hidden");
    docQ(`#close-view-button`).classList.remove("hidden");
    docQ(`#close-view-button`).setAttribute('data-view', 'browse-view');
    docQ(`#song-view`).classList.add("hidden");
    playlist = getLocalDataParse(PlaylistList);
    populatePlaylistResults(sortTitle(playlist, "Ascending"));
    populatePlaylistDetails(playlist);
}

/* -------------------------------------------------------------------------- */

function populatePlaylistResults(list) {
    const table = docQ('#playlist-data');
    table.textContent = '';
    list.forEach(s=>{
        const ul = docMake('ul');
        const remove = docMake('button');
        remove.setAttribute('data-song', s.song_id);
        remove.classList.add("song-button", "round-corners");
        remove.textContent = 'Remove Song';
        setRemoveSongButtonListener(remove);

        let li = docMake('li');
        li.setAttribute('data-song', s.song_id);
        li.setAttribute('data-view', 'playlist-view');
        li.classList.add('song-title');

        li.textContent = s.title;
        setSongClickListener(li);
        
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-artist');
        li.textContent = s.artist.name;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-year');
        li.textContent = s.year;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-genre');
        li.textContent = s.genre.name;
        ul.appendChild(li);
        
        li = docMake('li');
        li.classList.add('song-popularity');
        li.textContent = s.details.popularity;
        ul.appendChild(li);

        ul.appendChild(remove);
        table.appendChild(ul);
    });
};

/* -------------------------------------------------------------------------- */

function populatePlaylistDetails(playlist) {
    const songCount = docQ('#playlist-song-count');
    const popularity = docQ('#popularity-ranking');

    let sum = 0;
    let avg = 0;
    if (playlist.length > 0) {
        playlist.forEach(s => {
            sum += 1;
            avg += s.details.popularity;
        });
        avg = avg/sum;
    };
    songCount.textContent = sum;
    debugger;
    if(avg)
        popularity.textContent = avg.toFixed(2);
    else
        popularity.textContent = 0;
};




/* -------------------------------------------------------------------------- /
/                             CREDITS BUTTON STUFF                            /
/ -------------------------------------------------------------------------- */


function showCredits() {
    docQ(`#credits-details`).classList.remove("hidden");
}

/* -------------------------------------------------------------------------- */

function hideCredits() {
    docQ(`#credits-details`).classList.add("hidden");
}




/* -------------------------------------------------------------------------- */
/*                                CLEAR RESULTS                               */
/* -------------------------------------------------------------------------- */

function clearData(key) {
    const resultsTable = docQ(key);
    resultsTable.textContent = '';
};




/* -------------------------------------------------------------------------- */
/*                               EVENT HANDLERS                               */
/* -------------------------------------------------------------------------- */

function sortResultsHeaderEvents() {
    const tableHeaders = docQAll(".category");
    tableHeaders.forEach(h => {
        h.addEventListener("click", (e) => {
            console.log(e.target);
            tableHeaders.forEach(h => {
                h.classList.remove("selected-colour");
            });
            e.target.classList.add("selected-colour");

            if (e.target.dataset.view == `browse`) {
                sortBrowse(e, getSessionData(ResultsList));
            }
            else if (e.target.dataset.view == `playlist`) {
                sortPlaylist(e, getLocalData(PlaylistList));
            };
        });
    });

    const sortButton = docQAll(".sort-button");
    sortButton.forEach(b => b.addEventListener("click", (e) => {
        if (e.target.value == "Ascending") {
            e.target.value = "Descending";
            e.target.textContent = "Descending";
        }
        else {
            e.target.value = "Ascending";
            e.target.textContent = "Ascending";
        };
    }));
};


/* -------------------------------------------------------------------------- */

function searchFormSubmitEvent() {
    docQ('form').addEventListener('submit', (e) => {
        if (e.submitter.value == 'Submit') {
            const parameters = docQAll(".filter-parameter");
            parameters.forEach(p => {
                if (p.disabled == false) {
                    filterSongs(p.id, p.value, getLocalData(OriginalList));
                }
            });
            console.log(enbld);
        }
        else if (e.submitter.value == 'Clear') {
            sessionStorage.removeItem(ResultsList);
        }
    })
};

/* -------------------------------------------------------------------------- */

function setSongClickListener(title) {
    title.addEventListener('click', (e) => {
        console.log(e.target);
        console.log(e);
        const songs = getSessionDataParse(ResultsList);
        const song = songs.find(s => s.song_id == e.target.dataset.song);
        debugger;
        switchToSongView(song, e.target.dataset.view);
    });
};

/* -------------------------------------------------------------------------- */

function radioButtonClickListeners(){
    const radioButtons = docQAll('.radio-button');
    radioButtons.forEach(rb=>{
        rb.addEventListener('change', (e)=>{
            console.log(e.target);
            // TODO this thingy
            setFilterOption(e.target.value);
            return;
        })
    });
};

/* -------------------------------------------------------------------------- */

function setAddSongButtonListener(button) {
        button.addEventListener("click", (e) => {
            console.log(e.target.dataset.song);
            const playlist = getLocalDataParse(PlaylistList);
            const songList = getSessionDataParse(ResultsList);
            const song = songList.find(s => s.song_id == e.target.dataset.song);
            debugger;
            if (playlist.find( s => s.song_id == song.song_id) == undefined) {
                playlist.push(song);
            }
            else {
                alert("Song is already in playlist");
            };
            storeLocalDataStringify(PlaylistList, playlist);
            debugger;
        });
}

/* -------------------------------------------------------------------------- */

function setRemoveSongButtonListener(button) {
    button.addEventListener("click", (e) => {
        console.log(e.target.dataset.song);
        const playlist = getLocalDataParse(PlaylistList);
        const newPlaylist = playlist.filter(s => s.song_id != e.target.dataset.song);
        storeLocalDataStringify(PlaylistList, newPlaylist);
        populatePlaylistResults(newPlaylist);
        populatePlaylistDetails(newPlaylist);
    });
}

/* -------------------------------------------------------------------------- */

function setcreditsButtonListener() {
    const creditsButton = docQ("#credits-button");
    creditsButton.addEventListener("mouseover", (e) => {
        showCredits();
        const timeOut = setTimeout(hideCredits, 5000);
    });
}

/* -------------------------------------------------------------------------- */

function setcloseViewButtonListener() {
    const closeButton = docQ("#close-view-button");
    closeButton.addEventListener("click", (e) => {
        debugger;

        // switch depending on prior view
        // use song title data oc class browse or playlist to switch back
        if (e.target.dataset.view == 'playlist-view') {
            switchToPlaylistView();
        } else {
            switchtoBrowseView();
        };
    });
};

/* -------------------------------------------------------------------------- */

function setplaylistButtonListener() {
    docQ("#playlist-button").addEventListener('click', (e) => {
        switchToPlaylistView();
    });
}

/* -------------------------------------------------------------------------- */

function clearPlaylistButtonListener() {
    docQ("#clear-playlist-button").addEventListener('click', (e) => {
        clearData('#playlist-data');
        const newPlaylist = []
        storeLocalDataStringify(PlaylistList, newPlaylist);
        populatePlaylistDetails(newPlaylist);
    });
};




/* -------------------------------------------------------------------------- */
/*                             CHART DATA HANDLERS                            */
/* -------------------------------------------------------------------------- */

function getChartData(analytics) {
    let data = [];
    data.push(analytics.energy);
    data.push(analytics.danceability);
    data.push(analytics.liveness);
    data.push(analytics.valence);
    data.push(analytics.acousticness);
    data.push(analytics.speechiness);
    return data;
};

/* -------------------------------------------------------------------------- */

function createSongChart(chartData) {
  
    //referenced:
    //https://stackoverflow.com/questions/40056555/destroy-chart-js-bar-graph-to-redraw-other-graph-in-same-canvas
    
    let chartStatus = Chart.getChart("myChart");
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");
    let myNewChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Energy', 'Danceability', 'Liveness', 'Valence', 'Acousticness', 'Speechiness'],
            datasets: [{
                data: chartData,
                backgroundColor: 'rgba(220, 214, 247, 0.2)',
                borderColor: 'rgba(220, 214, 247, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                r: {
                    ticks: {
                        display: false
                    },
                    pointLabels: {
                        color: `rgba(220, 214, 247, 1)`,
                        font: {
                            size: 20,
                        },
                    },
                    backgroundColor: `rgba(97, 103, 128, 0.6)`
                },
            }
        }
    });
};

/* -------------------------------------------------------------------------- */

function setProgressBar(metric, bar) {
    debugger;
    let width = 0;
    let id = setInterval(frame, 5);
    function frame() {
        debugger;
        if (width >= metric) {
            clearInterval(id);
            i = 0;
        } else {
            width++;
            bar.style.width = width + "%";
        }
    }
}

