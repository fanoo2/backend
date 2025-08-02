import { describe, test, expect } from '@jest/globals';

describe('Jest Configuration Tests', () => {
  test('should run TypeScript tests successfully', () => {
    // Test that TypeScript syntax works in Jest
    const testObject: { name: string; value: number } = {
      name: 'test',
      value: 123
    };
    
    expect(testObject.name).toBe('test');
    expect(testObject.value).toBe(123);
  });

  test('should support async/await syntax', async () => {
    const asyncFunction = async (value: string): Promise<string> => {
      return Promise.resolve(`Hello, ${value}!`);
    };

    const result = await asyncFunction('Jest');
    expect(result).toBe('Hello, Jest!');
  });

  test('should have proper test environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(typeof process.platform).toBe('string');
  });

  test('should be able to import from node modules', () => {
    // Test that Jest can properly resolve and import modules
    expect(jest).toBeDefined();
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });
});