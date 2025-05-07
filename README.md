# GUAVA (Graphical User Audio-Video Annotator)

A web-based multimodal annotation tool for acoustic and video data

GUAVA is a browser-based annotation platform built on [Praat](https://www.fon.hum.uva.nl/praat/) functionality. It supports real-time waveform, spectrogram, pitch, and intensity visualization. Users can annotate audio and video files directly in the browser with features like region labeling, tier control, and auto-saving.

## Key Features

### File Upload
- Duplicate file detection: Uploading a file with the same name will trigger a warning.
- Multiple file upload: Select and upload multiple `.wav`  `.mp3` or `.mp4` files at once.

### Waveform-Based Annotation
- Region create: Drag on the waveform to create a new annotation region.
- Region update: Resize or move regions freely.
- Playback: Click a region to play the corresponding audio.
- Timestamp preview: Hover over the waveform to view precise timing.
- Annotation: Right-click a region to add or delete labels.

### Tier Control
- Select tier: Click a tier to activate it before annotating.
- Edit tier name: Click the tier name to edit it directly.
- Hide/delete: Right-click to hide or delete a tier.

### Zoom Control
- Scroll to zoom: Use the mouse wheel over the waveform to zoom in or out.

### Custom Label Categories
- Fully customizable: Define your own annotation labels and checkbox attributes.

### Auto-Save
- All changes are auto-saved: No need for a Save button.

### Export
- Export to TextGrid: Download annotations as a `.TextGrid` file compatible with Praat.

## Annotation Storage

All annotation data and files generated during processing are stored per file per user under the following structure:

```
static/videos/pool/{user}/{file_name}
```

Each uploaded file is saved under the logged-in username, and annotations persist independently per user.

### Required External Tools

| Tool      | Required? | Setup Notes                          |
| --------- | --------- | ------------------------------------ |
| ffmpeg    | Yes       | Add to system `PATH`                 |
| praat.exe | Yes       | Set full path in `general_routes.py` |

### Edit the following in `general_routes.py`:

```python
PRAAT_LOCATION = "D:/praat.exe"
```

## Try It Out

You can use GUAVA in two ways:

### 1. Access the ACL2 Server

Open in browser:  
**http://10.33.48.248/praat**

> If you are off UTA campus, please connect to VPN first.

### 2. Run Locally

Start the Flask app:

```bash
python app.py
```

## Contact

**Peter (Weiran Zhang)**
 Email: wxz9630@mavs.uta.edu