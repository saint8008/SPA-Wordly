# Wordly Dictionary

An interactive dictionary Single Page Application (SPA) for the Wordly language learning platform. Users can search for a word, view its pronunciation, definitions, synonyms, and sources, and save favorite terms, all on one page without a refresh.

---

## Features
- **Instant word search** with no page reloads (SPA behavior)
- **Pronunciation** with phonetic text and audio playback where available
- **Definitions** grouped by part of speech (noun, verb, etc.) with example sentences
- **Synonyms** that are clickable, so users can search related words quickly
- **Source details** linking to where the data came from
- **Favorites**: save and remove words, persisted in `localStorage` across sessions
- **Loading and error states** (word not found, network failure, empty input)
- **Responsive design** for mobile, tablet, and desktop

## Tech Stack
| Area | Technology |
|------|-----------|
| Markup / Styling | HTML5, CSS3 (Flexbox/Grid) |
| Logic | JavaScript (ES6+), Fetch API |
| Data | [Free Dictionary API](https://dictionaryapi.dev/) |
| Storage | Browser `localStorage` |
| Deployment | <Netlify / Vercel / GitHub Pages> |

## Usage
1. Type a word into the search bar and press **Enter** or click **Search**.
2. Review the pronunciation, definitions, synonyms, and source.
3. Click the play icon to hear the pronunciation.
4. Click a synonym to search for it instantly.
5. Click the heart/star icon to add the word to **Favorites**.
6. Open the Favorites list to revisit or remove saved words.