# Photo Capture & Select Web App

A modern web application that allows users to take photos using their device camera and select photos from their device storage.

## Features

### 📸 Camera Functionality
- **Start Camera**: Access device camera with proper permissions
- **Take Photos**: Capture high-quality photos directly from the camera
- **Stop Camera**: Clean camera resource management

### 📁 File Selection
- **Upload Photos**: Select multiple photos from device storage
- **Drag & Drop**: Drag and drop photos directly onto the upload area
- **Multiple Format Support**: Supports all common image formats (JPG, PNG, GIF, etc.)

### 🖼️ Photo Gallery
- **Grid Layout**: Beautiful responsive grid display of all photos
- **Preview**: Click any photo to view full-size preview
- **Photo Management**: Download individual photos or delete unwanted ones

### 🎛️ Advanced Controls
- **Download All**: Download all photos at once
- **Clear Gallery**: Remove all photos with confirmation
- **Keyboard Navigation**: Use arrow keys to navigate in full-screen view
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## How to Use

### Taking Photos
1. Click **"Start Camera"** to access your device camera
2. Position your camera and click **"Take Photo"** to capture
3. Click **"Stop Camera"** when finished

### Selecting Photos
1. Click on the upload area or **"Click to select photos"**
2. Choose one or multiple photos from your device
3. Alternatively, drag and drop photos directly onto the upload area

### Managing Photos
- **View**: Click any photo in the gallery to view full-size
- **Download**: Use the download button to save individual photos
- **Delete**: Remove unwanted photos from the gallery
- **Navigation**: Use arrow keys (← →) to navigate between photos in full-screen view

## Browser Requirements

- Modern web browser with HTML5 support
- Camera access requires HTTPS (except for localhost)
- JavaScript enabled

## Supported Features

### Camera Access
- Front and rear camera support
- High-resolution photo capture
- Real-time video preview

### File Handling
- Multiple file selection
- Drag and drop interface
- Memory-efficient image processing

### User Experience
- Responsive design for all screen sizes
- Touch-friendly interface
- Keyboard shortcuts
- Visual feedback and notifications

## Installation

1. Download all files to a directory
2. Open `index.html` in a web browser
3. For camera access on non-localhost, serve over HTTPS

## Files Structure

```
web_fire/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── script.js       # JavaScript functionality
└── README.md       # This documentation
```

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security & Privacy

- All photo processing happens locally in the browser
- No photos are uploaded to any server
- Camera access requires user permission
- All data stays on your device

## Keyboard Shortcuts

- **Escape**: Close full-screen photo view
- **← →**: Navigate between photos in full-screen view
- **Delete**: Remove current photo in full-screen view
- **Ctrl/Cmd + S**: Download current photo

## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if camera is being used by another application
- Verify HTTPS connection (required for camera access)

### Photos Not Loading
- Check if the files are valid image formats
- Ensure sufficient browser memory for large images
- Try refreshing the page

## Future Enhancements

- Photo editing capabilities
- Cloud storage integration
- Photo filters and effects
- Batch processing tools
- Social sharing options
