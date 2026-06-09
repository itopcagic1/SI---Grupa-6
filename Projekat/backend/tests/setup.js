jest.mock('ioredis', () => {
  const EventEmitter = require('events');
  class MockRedis extends EventEmitter {
    constructor() {
      super();
      this.options = {};
    }
    disconnect() {}
    quit() { return Promise.resolve('OK'); }
    publish() { return Promise.resolve(0); }
    subscribe() { return Promise.resolve(0); }
  }
  return MockRedis;
});

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn().mockResolvedValue({ id: 'mock-job' }),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(true),
      };
    }),
    Worker: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(true),
      };
    }),
  };
});
