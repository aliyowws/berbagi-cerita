// src/scripts/models/authModel.js

const AUTH_TOKEN_KEY = 'token'; 
const BASE_AUTH_API_URL = 'https://story-api.dicoding.dev/v1'; 

export const getToken = () => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
    }
};

export const setToken = (token) => {
    if (!token) {
        console.warn('Attempting to set empty token');
        return false;
    }
    
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('Error storing token:', error);
        return false;
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return true;
    } catch (error) {
        console.error('Error removing token:', error);
        return false;
    }
};

export const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email dan password harus diisi');
    }

    try {
        const response = await fetch(`${BASE_AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.message || `HTTP ${response.status}: Login gagal`);
        }

        // Handle different response structures
        const token = data.loginResult?.token || data.data?.token;
        if (!token) {
            throw new Error('Token tidak ditemukan dalam response');
        }

        const tokenSet = setToken(token);
        if (!tokenSet) {
            throw new Error('Gagal menyimpan token login');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        }
        throw error;
    }
};

export const registerUser = async (name, email, password) => {
    if (!name || !email || !password) {
        throw new Error('Nama, email, dan password harus diisi');
    }

    try {
        const response = await fetch(`${BASE_AUTH_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.message || `HTTP ${response.status}: Registrasi gagal`);
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        }
        throw error;
    }
};

export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};