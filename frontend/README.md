# T3 React Template

A starting react template project based on the Allstate MIP web front end.

## Features

- TypeScript
- React
- Redux
- React Router
- Hot Reloading
- TSLint
- SCSS
- Autoprefixer
- Testing with Jest & Enzyme
- Production file generation with Webpack
- Server side rendering

## Project Setup

- Install Node.js
- Initialize the packages
  - `npm i`

## Dev environment

- `npm start` from a terminal
- Browse to [http://localhost:3000](http://localhost:3000) to view the app

## Tests

- To run tests: `npm t`
- To generate test coverage: `npm run coverage`, a report will be generated in the `/coverage` directory

## Linting

- to run linting over the entire project (src and __tests__), `npm run lint`

## Generating Production Files

production files are generated automatically to the `/dist` folder by running `npm run build`. This will generate the following files:

- `bundle.min.[version].js` the javascript bundle where `[version]` is the version from your package.json
- a source map for the above javascript file
- `bundle.min.[version].css` the compiled CSS bundle
- `index.html` the static html file to serve to the user
- `report.html` an analysis of the javascript bundle that describes the size of the project

## Third Party Info

- [React Dev Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi/related?hl=en)
- [Redux Dev Tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd/related)
- [ESLint](https://eslint.org/docs/about/) - enable the plugin in your IDE/editor of choice to enable linting

## Server Side Rendering

This template also contains an express server which renders your application on the server
and serves it to the user. The basic flow of the express server request is:

1. User makes HTTP request to your server
2. Server passes URL to react-router
3. React application executes the first render and converts it to a string
4. Handlebars takes this string and injects it into the index.handlebars template to generate an HTML file
5. HTML file is returned to the user

The server itself is in `src/server.js`. Note that before the server can be run both `npm run build` and
`npm run compile` must be executed - this should be part of your CI process!

`npm run compile` runs babel over your `src` directory and converts it to ES5 JavaScript, then moves it
to the `dist` folder where we serve static files and the express server looks for your React files.
