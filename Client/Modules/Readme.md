Changed all `import 'xyz';` to use a full external url, imports must have relative paths for chrome.

Redux is the ESM version taken from node_modules, NOT dist (doesn't work; `Uncaught SyntaxError: The requested module 'https://unpkg.com/redux@4.0.5/dist/redux.js' does not provide an export named 'compose'` despite compose being exported...)