// src/scripts/views/addStoryView.js
import { getCameraStream, getGeolocationName } from '../models/geolocationModel.js';

let cameraStream = null;
let map = null;
let marker = null;

const addStoryView = {

  render() {
    return `
      <div>
        <h2>Tambah Cerita</h2>
        <form id="story-form">
          <textarea name="description" placeholder="Tulis cerita di sini..." required></textarea>
          <br/>
          <button type="button" id="takePhoto">Ambil Foto</button><br/>
          <video id="camera" autoplay muted style="display: none;" tabindex="0"></video>
          <canvas id="snapshot" style="display: none;"></canvas>
          <br/>
          <div id="map" style="height: 300px;"></div>
          <input type="hidden" id="lat" name="lat" />
          <input type="hidden" id="lon" name="lon" />
          <br/>
          <button type="submit">Kirim Cerita</button>
        </form>
      </div>
    `;
  },

  
  initialize({ onSubmit }) {
    this.video = document.getElementById('camera');
    this.canvas = document.getElementById('snapshot');
    this.form = document.getElementById('story-form');
    this.takePhotoButton = document.getElementById('takePhoto');
    this.latInput = document.getElementById('lat');
    this.lonInput = document.getElementById('lon');
    this.mapElement = document.getElementById('map');

    this._initCamera();
    this._initMap();
    this._initForm(onSubmit);
  },

  async _initCamera() {
    try {
      const stream = await getCameraStream();
      this.video.srcObject = stream;
      cameraStream = stream;
      this.video.style.display = 'block';
      this.canvas.style.display = 'none';

      this.takePhotoButton.onclick = () => this.takeSnapshot();
    } catch (error) {
      this.showError('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
      this.video.style.display = 'none';
      this.takePhotoButton.style.display = 'none';
    }
  },

  takeSnapshot() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = 'block';
    this.video.style.display = 'none';
  },

  async _initMap() {
    if (!this.mapElement) return;

    map = L.map(this.mapElement).setView([-6.2088, 106.8456], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', async (e) => {
      const lat = e.latlng.lat.toFixed(5);
      const lon = e.latlng.lng.toFixed(5);

      this.latInput.value = lat;
      this.lonInput.value = lon;

      const locationName = await getGeolocationName(lat, lon).catch(() => 'Lokasi Tidak Diketahui');
      const description = this.form.description?.value || '(tidak ada deskripsi)';

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);
      marker.bindPopup(`<b>Lokasi Dipilih</b><br>Lat: ${lat}<br>Lon: ${lon}<br>${locationName}<br>${description}`).openPopup();
    });
  },

  _initForm(onSubmit) {
    if (!this.form) return;
    this.form.onsubmit = async (e) => {
      e.preventDefault();

      if (this.canvas.style.display === 'none') {
        this.showError('Harap ambil foto terlebih dahulu!');
        return;
      }

      const lat = this.latInput.value.trim();
      const lon = this.lonInput.value.trim();
      
      if (!lat || !lon) {
      this.showError('Harap pilih lokasi pada peta terlebih dahulu!');
      return;
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      this.showError('Lokasi tidak valid. Pastikan koordinat berada dalam rentang yang benar.');
      return;
    }

      const imageBlob = await new Promise(resolve =>
        this.canvas.toBlob(resolve, 'image/jpeg', 0.8)
      );

      const data = {
        description: this.form.description.value,
        photo: imageBlob,
        lat: latNum,
        lon: lonNum,
      };

      onSubmit(data);
    };
  },

  disableCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    this.video.style.display = 'none';
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = 'block';
  },

  showError(msg) {
    alert(msg);
  },

  showSuccess(msg) {
    alert(msg);
  },

  teardown() {
    this.disableCamera();
    if (this.form) this.form.reset();
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    if (map) {
      map.remove();
      map = null;
    }
    if (this.takePhotoButton) this.takePhotoButton.onclick = null;
    this.video = null;
    this.canvas = null;
    this.form = null;
    this.takePhotoButton = null;
    this.latInput = null;
    this.lonInput = null;
    this.mapElement = null;
  }
};

export default addStoryView;