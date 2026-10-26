["search-form","search-input","status-message","results","word-title",
 "favorite-btn","phonetic-text","audio-btn","audio-player","meanings",
 "synonyms-list","source-link"].forEach(id => {
  if (!document.getElementById(id)) console.error("Missing element ID:", id);
});

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const FAVORITES_KEY = "wordly-favorites";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusMessage = document.getElementById("status-message");
const resultsSection = document.getElementById("results");
const wordTitle = document.getElementById("word-title");
const favoriteBtn = document.getElementById("favorite-btn");
const phoneticText = document.getElementById("phonetic-text");
const audioBtn = document.getElementById("audio-btn");
const audioPlayer = document.getElementById("audio-player");
const meaningsContainer = document.getElementById("meanings");
const synonymsList = document.getElementById("synonyms-list");
const sourceLink = document.getElementById("source-link");

let currentWord = "";


 // fetch data from the API
async function fetchWord(word) {
    const response = await fetch(API_URL + encodeURIComponent(word));

    if (response.status === 404) {
        throw new Error("NOT_FOUND");
    }

    if (!response.ok) {
        throw new Error("REQUEST_FAILED");
    }

    return response.json();
}


// parse API response 
function parseWordData(data) {
    const entry = data[0];

    const phoneticWithAudio = entry.phonetics.find((p) => p.audio);
    const phoneticwithText = entry.phonetics.find((p) => p.text);

    const phonetic = 
        entry.phonetic ||
        (phoneticWithAudio && phoneticWithAudio.text) ||
        (phoneticwithText && phoneticwithText.text) ||
        "";
    const audio = phoneticWithAudio ? phoneticWithAudio.audio : "";

    const meanings = entry.meanings.map((meaning) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.slice(0, 3),
    }));

    const synonymSet = new Set();

    entry.meanings.forEach((meaning) => {
        meaning.synonyms.forEach((s) => synonymSet.add(s));
        meaning.definitions.forEach((d) => d.synonyms.forEach((s) => synonymSet.add(s)));
    });

    const synonyms = [...synonymSet].slice(0, 12);

    const source = entry.sourceUrls && entry.sourceUrls[0] ? entry.sourceUrls[0] : "";

    return { word: entry.word, phonetic, audio, meanings, synonyms, source };
}


// update the DOM
function showStatus(message) {
    statusMessage.textContent = message;
}

function renderWord(details) {
    currentWord = details.word;
    wordTitle.textContent = details.word;

    // Pronunciation
    phoneticText.textContent = details.phonetic;

    if(details.audio) {
        audioPlayer.src = details.audio;
        audioBtn.classList.remove("hidden");
    } else {
        audioPlayer.removeAttribute("src");
        audioBtn.classList.add("hidden");
    }


    // Definitions
    meaningsContainer.innerHTML = "";
    details.meanings.forEach((meaning) => {
        const block = document.createElement("div");
        block.className = "meaning-block";

        const pos = document.createElement("h3");
        pos.className = "part-of-speech";
        pos.textContent = meaning.partOfSpeech;
        block.appendChild(pos);

        const list = document.createElement("ol");
        meaning.definitions.forEach((def) => {
            const item = document.createElement("li");
            item.textContent = def.definition;

            if (def.example) {
                const example = document.createElement("p");
                example.className = "example";
                example.textContent = `"${def.example}"`;
                item.appendChild(example);
            }
            list.appendChild(item)
        });
        
        block.appendChild(list);
        meaningsContainer.appendChild(block);
    });

    synonymsList.innerHTML = "";
    const synonymsSection = synonymsList.parentElement;

    if (details.synonyms.length > 0) {
        synonymsSection.classList.remove("hidden");
        details.synonyms.forEach((syn) => {
            const li = document.createElement("li");
            li.textContent = syn;
            li.tabIndex = 0;
            li.setAttribute("role", "button");
            synonymsList.appendChild(li);
        });
    } else {
        synonymsSection.classList.add("hidden");
    }

    if (details.source) {
        sourceLink.href = details.source;
        sourceLink.textContent = details.source;
        sourceLink.parentElement.classList.remove("hidden");
    } else {
        sourceLink.parentElement.classList.add("hidden");
    }

    updateFavoriteButton();
    resultsSection.classList.remove("hidden");
}

/* ---------- 5. Search flow ---------- */
async function searchWord(word) {
  const cleanWord = word.trim().toLowerCase();
 
  if (!cleanWord) {
    showStatus("Please enter a word to search.");
    resultsSection.classList.add("hidden");
    return;
  }
 
  showStatus("Loading...");
  resultsSection.classList.add("hidden");
 
  try {
    const data = await fetchWord(cleanWord);
    const details = parseWordData(data);
    renderWord(details);
    showStatus("");
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      showStatus(`No definitions found for "${cleanWord}". Check the spelling and try again.`);
    } else {
      showStatus("Something went wrong. Please check your connection and try again.");
    }
  }
}
 
/* ---------- 6. Favorites (localStorage) ---------- */
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}
 
function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
 
function updateFavoriteButton() {
  const isFavorite = getFavorites().includes(currentWord);
  favoriteBtn.textContent = isFavorite ? "★" : "☆";
  favoriteBtn.setAttribute(
    "aria-label",
    isFavorite ? "Remove from favorites" : "Save to favorites"
  );
}
 
function toggleFavorite() {
  if (!currentWord) return;
 
  let favorites = getFavorites();
  if (favorites.includes(currentWord)) {
    favorites = favorites.filter((w) => w !== currentWord);
  } else {
    favorites.push(currentWord);
  }
  saveFavorites(favorites);
  updateFavoriteButton();
}
 
/* ---------- 7. Event listeners ---------- */
// Form submission (button click or Enter key)
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  searchWord(input.value);
});
 
// Play pronunciation audio
audioBtn.addEventListener("click", () => {
  if (audioPlayer.src) {
    audioPlayer.play().catch(() => showStatus("Audio could not be played."));
  }
});
 
// Save / remove favorite
favoriteBtn.addEventListener("click", toggleFavorite);
 
// Click a synonym to search for it (event delegation)
synonymsList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    input.value = event.target.textContent;
    searchWord(event.target.textContent);
  }
});
 
// Keyboard support for synonyms
synonymsList.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.tagName === "LI") {
    input.value = event.target.textContent;
    searchWord(event.target.textContent);
  }
});