const { state } = require('jest-metadata');

state.set('vendor.tests', state.get('vendor.tests', 0) + 1);
