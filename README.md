<p align="center"><img src="assets/hero.svg" alt="d04-rest-service animated SVG banner" width="100%"></p>

# d04-rest-service

A minimal HTTP router for Node.js with parameterized paths, query parsing, middleware chaining, and JSON helpers.

## Features
- Node.js 20+ ES modules
- Small, explicit API surface
- Async handler support and predictable HTTP responses
- No framework lock-in
- Animated SVG project banner

## Install
```bash
npm install
```

## Quick start
```js
import { createRouter, json } from "d04-rest-service";
const router = createRouter();
router.get("/users/:id", (req, res) => json(res, 200, { id: req.params.id }));
const server = createServer((req, res) => router.handle(req, res));
```

## Development
```bash
npm test
```

## Design notes
The router is intentionally small and intended as a foundation, not a complete replacement for mature production frameworks. Add body limits, authentication, CORS, and structured logging at the application boundary.

## License
MIT
