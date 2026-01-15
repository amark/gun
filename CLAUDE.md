# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GUN is a decentralized, peer-to-peer graph data synchronization engine and realtime database (~9KB gzipped, 20M+ API ops/sec). It enables building community-run, encrypted applications with offline-first capabilities.

## Build & Test Commands

```bash
# Testing (requires mocha globally: npm install -g mocha)
npm test                          # Run tests (clean DB first!)
rm -rf *data*                     # REQUIRED: Clean DB before re-running tests
npm run testsea                   # Test SEA cryptography only
npm run e2e                       # Run distributed E2E tests

# Development
npm start                         # Start example HTTP server with profiling
npm run https                     # Start with HTTPS (uses test certs)

# Building
npm run unbuild                   # Bundle core + minify
npm run unbuildSea                # Bundle SEA module
npm run unbuildMeta               # Bundle metadata
npm run minify                    # Minify gun.js only
```

## Architecture

### Core Layers

**Core Engine (`/src`)** - 23 modules building the chaining API:
- `root.js` - Gun constructor, HAM (Hypothetical Amnesia Machine) conflict resolution
- `chain.js` - Complex JavaScript chaining mechanism
- `get.js`/`put.js` - Read/write operations with caching and subscriptions
- `mesh.js` - P2P mesh networking and message routing
- `on.js`/`onto.js` - Event system and socket routing
- `localStorage.js` - Browser persistence

**SEA Crypto (`/sea`)** - Security, Encryption, Authorization:
- User authentication (`auth.js`, `create.js`)
- Cryptographic operations (`sign.js`, `verify.js`, `encrypt.js`, `decrypt.js`)
- Key management (`pair.js`, `share.js`, `certify.js`)

**Libraries (`/lib`)** - Extended functionality:
- Storage adapters: `file.js`, `level.js`, `aws.js`
- Networking: `webrtc.js`, `axe.js` (DHT)
- Utilities: `radix2.js`/`rad.js` (serialization), `unbuild.js` (build system)

**Examples (`/examples`)** - Reference implementations for React, Vue, Angular, Electron, etc.

### Data Model

GUN uses a graph structure with:
- **Souls**: Unique node identifiers (e.g., `user/mark`)
- **State**: Timestamps on each property for conflict resolution
- **HAM**: Hypothetical Amnesia Machine algorithm for distributed conflict resolution

```javascript
// Internal data format
{
  "_": {"#": "user/mark", ">": {"name": 1234567890}},
  "name": "Mark"
}
```

## Code Patterns

### Chaining API
```javascript
gun.get('users').set(user).once(callback)
gun.get('mark').put({name: "Mark"}).on(callback)
gun.get('mark').back().get('admin')  // .back() navigates up chain
```

### Module System
- Custom `USE()` unbuild system (not standard CommonJS)
- Modules wrap in IIFE: `(function(){ /* code */ })()`
- Changes to `/src` require `npm run unbuild` to take effect

### Code Style
- Minimal variable names: `at`, `gun`, `tmp`, `cat`, `msg`, `u` (undefined)
- Heavy performance optimization
- No linting/prettier enforced (intentionally ignored)

## Key Gotchas

1. **Testing**: Always `rm -rf *data*` before re-running tests (writes persist)
2. **Rebuilding**: Changes to `/src` or `/sea` won't reflect until unbuild runs
3. **Crypto shim**: Node.js/React Native requires `@peculiar/webcrypto` for SEA
4. **Chain complexity**: Chain objects are complex; use `.back()` for navigation
5. **Events**: `.on()` = stream, `.once()` = single value

## Configuration

```javascript
Gun({
  peers: ['http://localhost:8765'],  // Relay servers
  axe: false,                         // Disable DHT
  localStorage: true,                 // Enable persistence
})
```

Environment variables:
- `HTTPS_KEY`, `HTTPS_CERT` - HTTPS configuration
- `CI=false` - Prevent warnings-as-errors in deployment

## TypeScript

Type definitions in `/types` directory. Main declarations: `gun.d.ts`, `sea.d.ts`.
