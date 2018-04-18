# onetech

> One Hour One Life Crafting Reference

View here: https://kazetsukai.github.io/onetech

This site is built using the game data directly from [the game data repository](https://github.com/jasonrohrer/OneLifeData7).
It shows the relationships between items, and lets you explore how things are crafted.

Unlike the wiki, which contains "wisdom" about the game, this site contains only "knowledge".
This is a reference. For a better guide, go to the [game wiki](https://onehouronelife.gamepedia.com/One_Hour_One_Life_Wiki).


## Build Setup

The project is split into two parts:
- A node script that processes the latest data from the game data repository
- The site itself, built in VueJS


### Site

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).


### Processing Script

The script is under the folder `process`. It will pull the latest data from the game data repository (if provided `download` as a command line argument), and then generate JSON files for the objects. It will also composite the sprites and create PNGs for each object in the game.

To get it running, you will need to install [ImageMagick](https://www.imagemagick.org/script/index.php) and [Canvas dependencies](https://github.com/Automattic/node-canvas/blob/v1.x/Readme.md#installation), and then:

``` bash
cd process

# install dependencies
npm install

# run script including downloading latest data and processing sprites
node process.js dev download

# after downloading once, you can run without the download argument
node process.js dev

# if you want to re-process the sprites
node process.js dev sprites

# remove the dev argument to process for production (before building)
node process.js
```

You can override the Git URL or path if you want to supply your own data content.

``` bash
export ONETECH_PROCESS_GIT_URL="https://github.com/custom-ohol-data"
# or
export ONETECH_PROCESS_GIT_PATH="/path/to/custom-ohol-data"
```
