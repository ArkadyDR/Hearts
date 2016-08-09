# Hearts

## Application Prerequisites

- Node (v 5.x)

## Initial Setup

1. Clone repository.
2. Install NPM dependencies:
  ```
  npm install
  ```

  Semantic-UI will detect the semantic.json file, say yes that you'll use the existing config, yes that the current directory is your module directory and yes that you want to install to semantic/.

3. Change into the semantic/ directory.
4. Run the gulp build:
```
../node_modules/.bin/gulp build
```

## Running Server

1. In a command shell:
```
npm run server
```

## Using Server

- Server will be available on http://localhost:3000
- Swagger API UI available on http://localhost:3000/documentation

## Running Client

1. In a command shell:
```
npm run client
```

## Using Client

- Client will be available on http://localhost:8080

## Running Tests

1. In a command shell:
```
npm test
```

## Editor Notes

Project is configured to use ESLint with the AirBnB rules. Install the appropriate ESLint plugin (including the extra React plugin) for your editor and point at the project .eslintrc file to enable your checking.
