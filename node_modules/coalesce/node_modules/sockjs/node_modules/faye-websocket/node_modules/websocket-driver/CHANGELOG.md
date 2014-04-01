### 0.3.2 / 2013-12-29

* Expand `maxLength` to cover sequences of continuation frames and `draft-{75,76}`
* Decrease default maximum frame buffer size to 64MB
* Stop parsing when the protocol enters a failure mode, to save CPU cycles

### 0.3.1 / 2013-12-03

* Add a `maxLength` option to limit allowed frame size
* Don't pre-allocate a message buffer until the whole frame has arrived
* Fix compatibility with Node v0.11 `HTTPParser`

### 0.3.0 / 2013-09-09

* Support client URLs with Basic Auth credentials

### 0.2.2 / 2013-07-05

* No functional changes, just updates to package.json

### 0.2.1 / 2013-05-17

* Export the isSecureRequest() method since faye-websocket relies on it
* Queue sent messages in the client's initial state

### 0.2.0 / 2013-05-12

* Add API for setting and reading headers
* Add Driver.server() method for getting a driver for TCP servers

### 0.1.0 / 2013-05-04

* First stable release

