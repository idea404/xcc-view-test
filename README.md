# NEAR Cross Contract Calls with View or Change Methods

This repo shows how cross contract calls behave when placed within view or change methods. Specifically, with the current syntax for [NEAR SDK JS](https://github.com/near/near-sdk-js), every cross contract call becomes a function call. Function calls can not be called from within view methods, so by extension, we may not perform cross contract calls from within view methods.

### Requirements

- [Node.js](https://nodejs.org/en/download/) >= 16.0.0

### Running the tests

1. Clone this repo
2. Run `npm install`
3. Run `npm run build`
4. Run `npm test`
