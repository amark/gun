# GUN (GunDB) Project Context

## Project Overview
**GUN** is a realtime, decentralized, offline-first, graph data synchronization engine. It acts as a peer-to-peer database that runs everywhere (browsers, servers, mobile, etc.).

*   **Type:** Graph Database / Sync Protocol
*   **Key Features:**
    *   **Offline-first:** Changes sync when connectivity is restored.
    *   **Decentralized:** No single point of failure; works P2P.
    *   **Realtime:** State synchronization across connected peers.
    *   **Graph Data:** Supports key/value, tables, documents, and circular references.
    *   **SEA (Security Encryption Authorization):** User authentication and end-to-end encryption.

## Building and Running

### Installation
```bash
npm install
```

### Running a Relay Peer
To start a default GUN relay peer (server) which also serves the browser examples:
```bash
npm start
```
*   This runs `examples/http.js`.
*   Default port: `8765`.
*   Access in browser: `http://localhost:8765`.
*   **Environment Variables:**
    *   `PORT`: Port to listen on (default: 8765).
    *   `HTTPS_KEY` / `HTTPS_CERT`: Paths to SSL key/cert for HTTPS (auto-detects in homedir).
    *   `PEERS`: Comma-separated list of peer URLs to connect to.

### Testing
Tests are run using **Mocha**.
```bash
npm test
```
*   **Note:** Tests may write to disk (`*data*` directories). Clean up with `rm -rf *data*` if needed between runs to ensure a fresh state.
*   **Specific Tests:**
    *   SEA Tests: `npm run testsea`
    *   E2E Tests: `npm run e2e`

### Building / Minification
The project uses a custom build script to combine modules.
```bash
npm run unbuild
```
This runs `lib/unbuild.js` and likely triggers minification (`uglifyjs`) to produce `gun.min.js`.

## Key Files & Directories

*   **`gun.js`**: The main library entry point / bundle.
*   **`examples/http.js`**: The HTTP server entry point used by `npm start`. Handles server creation, clustering (crash recovery), and attaches GUN.
*   **`lib/`**: Contains core modules and utilities (e.g., `ws.js`, `aws.js`, `unbuild.js`).
*   **`sea/`**: **S**ecurity **E**ncryption **A**uthorization modules. Implements the crypto layer.
*   **`test/`**: Contains Mocha test suites.
    *   `test/panic/`: Tests related to the PANIC distributed testing tool.
*   **`types/`**: TypeScript definition files (`index.d.ts`).

## Development Conventions

*   **Environment:** Node.js and Browser compatible.
*   **Style:** Pure JavaScript.
*   **Architecture:** Modular design where functionality is often split into files in `lib/` and combined or loaded as needed.
*   **Testing:** Uses `mocha` for unit/integration tests. Uses "PANIC" for distributed/load testing.
*   **Security:** Relies on the `sea/` module for cryptographic operations. In Node.js, it may require `@peculiar/webcrypto` as a shim for the Web Crypto API.
