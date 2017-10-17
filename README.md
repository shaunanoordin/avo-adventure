# AvO Adventure Game

AvO is an Action RPG where each adventure is a short story in an anthology. Players are given options to finish each adventure in any way they want, from skillfully fighting enemies to cleverly solving puzzles.

Developed by [Shaun A. Noordin](http://shaunanoordin.com)

## Development

- Target audience: Legend of Zelda fans, like myself. People who like exploring new worlds, fun short stories, and the freedom to solve problems in a variety of ways.
- Target devices: PCs and mobile devices - that means keyboard _and_ touch screen compatibility.
- This is a web app built on HTML5, JavaScript and CSS.
- It uses Babel to transpile 'modern' ES6 code into 'current' (2016) Javascript code.
- It also uses Stylus to make writing CSS easier.
- Developing the web app requires Node.js installed on your machine and a handy command line interface. (Bash, cmd.exe, etc)
- However, the _compiled_ web app itself can be run simply by opening the `index.html` in a web browser. (Chrome, Firefox, etc)

Project anatomy:

- Source JS (ES6 JavaScript) and STYL (Stylus CSS) files are in the `/src` folder.
- Compiled JS and CSS files are in the `/app` folder.
- Media assets are meant to be placed in the `assets` folder, but this is optional.
- Entry point is `index.html`.

Starting the project:

1. Install the project dependencies by running `npm install`
2. Run `npm start` to start the server.
3. Open `http://localhost:3000` on your browser to view the app.

Alternatively, there's a developer mode:

1. `npm install`
2. `npm run dev`
3. `http://localhost:3000`
4. Changes to the JS and STYL files will now be compiled automatically; i.e. Babel and Stylus now _watch_ the files. Refreshing the browser window should should show the latest edits.
