# Smart Home Controller - Advanced Theme System

## 🎨 Fitur Theme System

### 1. **Multiple Preset Themes**
- **Light Theme**: Tema terang dengan warna biru modern
- **Dark Theme**: Tema gelap untuk penggunaan malam hari
- **Modern Theme**: Tema dengan glassmorphism dan gradient modern
- **Neon Theme**: Tema futuristik dengan warna neon
- **Classic Theme**: Tema klasik dengan warna earth tone

### 2. **3D Switch Animations**
- **Flip**: Animasi flip 3D seperti kartu
- **Rotate**: Rotasi 180 derajat
- **Scale**: Efek scale dengan rotasi
- **Slide**: Animasi slide dengan rotasi

### 3. **Custom Color System**
- Customizable primary, secondary, dan success colors
- Real-time color preview
- Persistent color settings

### 4. **Floating Theme Selector**
- Floating Action Button (FAB) di pojok kanan bawah
- Panel theme yang dapat dibuka/tutup
- Responsive design untuk mobile

## 🚀 Cara Menggunakan

### Mengubah Theme:
1. Klik tombol palette (🎨) di pojok kanan bawah
2. Pilih salah satu preset theme yang tersedia
3. Theme akan langsung diterapkan dan disimpan

### Mengubah Animasi Switch:
1. Buka theme panel
2. Pilih animasi dari dropdown "Switch Animation"
3. Semua switch akan menggunakan animasi yang dipilih

### Custom Colors:
1. Buka theme panel
2. Scroll ke bagian "Custom Colors"
3. Pilih warna untuk Primary, Secondary, dan Success
4. Klik "Apply Custom" untuk menerapkan

## 📁 Struktur File

```
E:\project MQTT\
├── MQTTv6_themed.html      # File HTML utama dengan theme system
├── theme_script.js         # Theme management system
├── mqtt_functions.js       # Fungsi-fungsi MQTT dan aplikasi utama
├── schedule_functions.js   # Fungsi-fungsi jadwal
├── MQTTflipv1.html        # File referensi untuk desain switch
├── MQTTv6.html            # File asli (backup)
└── README_THEMES.md       # Dokumentasi ini
```

## 🎯 Fitur Utama yang Dipertahankan

✅ **Semua fitur MQTTv6 tetap berfungsi:**
- Dashboard dengan kontrol lampu
- Sistem jadwal otomatis
- Konfigurasi MQTT, perangkat, dan sistem
- Debug panel
- Login system
- Auto-reconnect MQTT
- PWM intensity control

✅ **Peningkatan visual:**
- Glassmorphism effects
- Smooth animations
- Modern gradients
- Responsive design
- 3D switch animations

## 🔧 Konfigurasi Theme

### CSS Variables yang dapat dikustomisasi:
```css
:root {
    --primary: #4361ee;        /* Warna utama */
    --secondary: #3a0ca3;      /* Warna sekunder */
    --success: #4cc9f0;        /* Warna sukses */
    --warning: #f72585;        /* Warna peringatan */
    --card-bg: #ffffff;        /* Background kartu */
    --body-bg: #f0f2f5;        /* Background body */
    --gradient-bg: linear-gradient(...); /* Background gradient */
}
```

### LocalStorage Keys:
- `themeSettings`: Menyimpan theme, animasi, dan custom colors
- `mqttConfig`: Konfigurasi MQTT
- `deviceConfig`: Konfigurasi perangkat
- `systemConfig`: Konfigurasi sistem
- `deviceStates`: Status perangkat terakhir
- `schedules`: Daftar jadwal

## 🌟 Keunggulan Theme System

1. **Modular**: Setiap komponen theme terpisah dan mudah dimodifikasi
2. **Persistent**: Semua pengaturan disimpan di localStorage
3. **Responsive**: Bekerja optimal di desktop dan mobile
4. **Performance**: Menggunakan CSS variables untuk perubahan theme yang cepat
5. **Extensible**: Mudah menambah theme atau animasi baru

## 🎨 Menambah Theme Baru

Untuk menambah theme baru:

1. **Tambahkan CSS class di theme_script.js:**
```css
.new-theme {
    --primary: #your-color;
    --secondary: #your-color;
    --card-bg: #your-color;
    --body-bg: #your-color;
    --gradient-bg: linear-gradient(...);
}
```

2. **Tambahkan preset button di HTML:**
```html
<div class="theme-preset new" data-theme="new">
    <i class="fas fa-star"></i><br>New
</div>
```

3. **Update applyTheme function** untuk menangani theme baru.

## 📱 Responsive Design

Theme system fully responsive dengan breakpoints:
- Desktop: > 992px
- Tablet: 768px - 992px  
- Mobile: < 768px

Floating theme panel otomatis menyesuaikan ukuran dan posisi.

## 🔄 Kompatibilitas

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ✅ Semua resolusi layar

## 🎯 Tips Penggunaan

1. **Untuk penggunaan malam**: Gunakan Dark atau Neon theme
2. **Untuk presentasi**: Gunakan Modern theme dengan animasi Scale
3. **Untuk penggunaan klasik**: Gunakan Classic theme
4. **Untuk customization**: Gunakan Custom Colors dengan base theme apapun

---

**Dibuat dengan ❤️ untuk Smart Home Controller**
*Sistem theme yang modern, canggih, dan user-friendly*