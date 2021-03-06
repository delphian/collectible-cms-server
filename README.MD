# Collectible CMS Server

A Content Management System for stamps, coins, comic books, and other collectibles. This repository contains the server portion of the CMS which is responsible for the database, storing uploaded files, and providing the API for clients. A seperate client, such as [Collectible CMS Web Client](https://www.github.com/delphian/collectible-cms-web-client), must be used to provide the user interface.

## Requirements

* nodejs (>7.1.0) and npm (3.10.9). https://nodejs.org/en/download/
* MondoDB. https://docs.mongodb.com/manual/administration/install-community/
* A bash shell. Using windows? Try Cygwin.

## Installation

#### Install global node packages
* 'forever' will be used to run the server in the background. `npm install forever -g`
* 'gulp' will be used to build the project. `npm install gulp -g` 

#### Clone repository and install packages
* `git clone https://github.com/delphian/collectible-cms-server.git`
* `cd collectible-cms-server`
* `npm install`

#### Customize the configuration files
* `cp templates/config.js.sample ./config.js`
* `cp templates/apidoc.json.sample ./apidoc.json`
Set token seccret, port and site domain. **tokenSignature in config.js must be
replaced or the site will NOT be secure**..

#### Build/Rebuild the project
* `gulp build`

## Usage

* `gulp start` to lanch as a foreground process, or:
* `forever start server.js` to launch the server in daemon mode (background process).

By visiting http://localhost:8080 for the first time the default admin user
will be created. Remember the credentials presented to you on screen. __'forever'
should only be used as a temporary solution to running the server as a service__.

## API Documentation

* Visit http://localhost:8080/apidoc/v1 and issue test API requests as desired.

Remember to rebuild the project with `gulp build` after updating the documentation.

## Sublime Text 3 Support

### Install Typescript Support

* https://github.com/Microsoft/TypeScript-Sublime-Plugin

## License

[MIT License](../master/LICENSE.md)
