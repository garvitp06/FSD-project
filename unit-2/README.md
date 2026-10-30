# Unit 2: BookNest Library (HTML, CSS & JavaScript)

Adds client-side JavaScript for interactivity, validation and local data management.

## Features
* **Form Validation:** required fields, minimum lengths, letters-only author name, copies range 1–50.
* **ISBN-13 Check:** must be 13 digits starting with 978/979 **and** pass the ISBN check-digit formula. Hyphens are allowed while typing.
* **Duplicate Detection:** the same ISBN cannot be added twice.
* **Dynamic Table:** books are rendered into the DOM without page refresh; stock badges change colour (Available / Few left / All issued).
* **Add & Delete:** delete uses event delegation and a confirmation dialog.
* **Live Search + Genre Filter:** filter by title, author or ISBN as you type, combined with a genre dropdown.
* **Live Stats:** total titles, total copies (`reduce`) and unique genres (`Set`).
* **Local Storage:** data persists in the browser's `localStorage`; "Restore Sample Data" resets it.

## How to Run
Open `index.html` in any web browser.
