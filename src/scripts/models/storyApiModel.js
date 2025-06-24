// src/scripts/models/storyApiModel.js

const BASE_STORY_API_URL = 'https://story-api.dicoding.dev/v1';


export const createStoryFormData = ({ description, photo, lat, lon }) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo, 'photo.jpg');
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);
  return formData;
};

export const postStory = async (formData, token) => {
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  try {
    const response = await fetch(`${BASE_STORY_API_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error posting story:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
};

export const getStories = async (token) => {
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  try {
    const response = await fetch(`${BASE_STORY_API_URL}/stories?location=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching stories:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
};
