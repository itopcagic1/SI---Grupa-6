import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { registerUser, loginUser, logoutUser } from '../authApi';

// Mock the entire axios module
vi.mock('axios', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockApi),
    },
  };
});

describe('authApi', () => {
  let mockApi;

  beforeEach(() => {
    // Reset the mock before each test
    vi.clearAllMocks();
    // Get the instance returned by axios.create
    mockApi = axios.create();
  });

  it('registerUser calls post with correct data', async () => {
    const mockData = { message: 'Success' };
    mockApi.post.mockResolvedValueOnce({ data: mockData });

    const userData = { email: 'test@test.com', lozinka: 'pass' };
    const response = await registerUser(userData);

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', userData);
    expect(response).toEqual(mockData);
  });

  it('loginUser calls post with correct data', async () => {
    const mockData = { access_token: 'token123' };
    mockApi.post.mockResolvedValueOnce({ data: mockData });

    const userData = { email: 'test@test.com', lozinka: 'pass' };
    const response = await loginUser(userData);

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', userData);
    expect(response).toEqual(mockData);
  });

  it('logoutUser calls post with correct headers', async () => {
    const mockData = { message: 'Logged out' };
    mockApi.post.mockResolvedValueOnce({ data: mockData });

    const token = 'fake-jwt-token';
    const response = await logoutUser(token);

    expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response).toEqual(mockData);
  });
});
