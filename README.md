Node Ninja Blocks
===
A simple library to help interacting with the Ninja Blocks Platform.

## Installation
```
npm install ninja-blocks
```

## Usage
```javascript
var ninjaBlocks = require('ninja-blocks');
// ACCESS_TOKEN acquired via OAuth
var ninja = ninjaBlocks.app({access_token:ACCESS_TOKEN});

ninja.devices(function(err,devices) {
  // ...
});
```

## API Overview

### User
```javascript
// Fetch a user's profile anyformation
app.user(function(err, data) { ... }); 

// Fetch a user's activity stream
app.user().stream(function(err,data){ ... }) 

// Fetch a user's pusher channel
app.user().pusher_channel(function(err,data){ ... }) 
```

### Device
```javascript
// Fetch a user's devices, a hash map of guid => metadata
app.devices(function(err, data) { ... })

// Send `command` to device `guid`
app.device(guid).actuate(command,function(err) { ... }) 

// Subscribe to a device's data feed. Optionally `overwrite`s an existing callback `url`
app.device(guid).subscribe('example.com',true,function(err) { ... }) 

// Unubscribe from a device's data feed.
app.device(guid).unsubscribe(function(err) { ... }) 

// Fetch any historical data about this device. Optionally specify the period's `start` and `end` timestamp.
app.device(guid).data(start, end, function(err, data) { ... })

// Fetch the last heartbeat received by this device.
app.device(guid).last_heartbeat(function(err, data) { ... })
```
This is by no means exhaustive, and more functionality will be forthcoming.
