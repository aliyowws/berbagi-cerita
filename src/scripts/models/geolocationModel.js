// src/scripts/models/geolocationModel.js

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

export const getCameraStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        return stream;
    } catch (error) {
        console.error("Error accessing camera via GeolocationModel: ", error);
        throw new Error("Failed to access camera. Please ensure permissions are granted.");
    }
};

export const getGeolocationName = async (lat, lon) => {
    try {
        const res = await fetch(`${NOMINATIM_API_URL}?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        return data.address.city || data.address.town || data.address.village || data.display_name || 'Lokasi Tidak Diketahui';
    } catch (err) {
        console.error("Error fetching location name via GeolocationModel:", err);
        throw new Error("Failed to detect location name.");
    }
};