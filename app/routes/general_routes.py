import os
import shutil
import subprocess
import json
from flask import Blueprint, request, jsonify, render_template
from app.config import IS_SERVER, URL_PREFIX
from app.utils.utils import execute_command
import parselmouth
import numpy as np
import json
general_bp = Blueprint('general', __name__)

# Configure path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def get_audio_codec(file_path):
    """Use ffprobe to get the audio codec."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "json", file_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True
        )
        codec_data = json.loads(result.stdout)
        if not codec_data.get('streams'):
            return None
        return codec_data['streams'][0]['codec_name']
    except (subprocess.CalledProcessError, KeyError, json.JSONDecodeError):
        return None

def get_audio_sample_rate(file_path):
    """Use ffprobe to get the audio sample rate."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "json", file_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True
        )
        data = json.loads(result.stdout)
        if not data.get('streams'):
            return None
        return data['streams'][0]['sample_rate']
    except (subprocess.CalledProcessError, KeyError, json.JSONDecodeError):
        return None

# Utility function.
def save_file(uploaded_file, save_path):
    uploaded_file.save(save_path)


def create_directory_if_not_exists(path):
    os.makedirs(path, exist_ok=True)


def file_exists(*file_paths):
    return all(os.path.exists(p) for p in file_paths)


def create_graph_file(wav_path, graph_path):
    """
    Analyzes a .wav file using Parselmouth to extract pitch and intensity,
    and writes the output to a .graph file.
    """
    try:
        sound = parselmouth.Sound(wav_path)
        pitch = sound.to_pitch()
        intensity = sound.to_intensity()

        with open(graph_path, 'w') as f:
            f.write("time\tpitch\tintensity\n")  # Header

            for time_step in np.arange(sound.start_time, sound.end_time, 0.01):
                pitch_value = pitch.get_value_at_time(time_step)
                intensity_value = intensity.get_value(time_step)

                if np.isnan(pitch_value):
                    pitch_value = 0.0
                
                if np.isnan(intensity_value):
                    intensity_value = 0.0

                f.write(f"{time_step:.3f}\t{pitch_value:.2f}\t{intensity_value:.2f}\n")
        
        return True, "Success"
        
    except Exception as e:
        print(f"Parselmouth analysis failed: {e}")
        return False, str(e)


@general_bp.route('/general', methods=['GET', 'POST'])
def general():
    try:
        if request.method == 'GET':
            return render_template('general_form.html')

        audio_file = request.files.get('audioFile')
        username = request.form.get("username")

        if not audio_file or not username:
            return jsonify({"error": "Missing audio file or username"}), 400

        audio_filename = audio_file.filename
        
        # --- START: New File List Generation Logic ---
        target_dir = os.path.join(BASE_DIR, "static", "videos", "pool", username)
        create_directory_if_not_exists(target_dir)

        # Get a complete, sorted list of all valid files for navigation
        all_user_files = sorted([
            f for f in os.listdir(target_dir)
            if f.lower().endswith(('.wav', '.mp4', '.mp3'))
        ])

        try:
            current_index = all_user_files.index(audio_filename)
        except ValueError:
            # This can happen if a file is uploaded but not yet in the directory list
            all_user_files.append(audio_filename)
            all_user_files.sort()
            current_index = all_user_files.index(audio_filename)
        # --- END: New File List Generation Logic ---

        audio_basename = os.path.splitext(audio_filename)[0]
        file_ext = os.path.splitext(audio_filename)[1].lower()
        
        audio_file_path_mp4 = os.path.join(target_dir, f"{audio_basename}.mp4")
        audio_file_path_wav = os.path.join(target_dir, f"{audio_basename}.wav")
        graph_file_path = os.path.join(target_dir, f"{audio_basename}.graph")
        video_file = None
        
        temp_save_path = os.path.join(target_dir, f"temp_{audio_filename}")
        save_file(audio_file, temp_save_path)
        
        sample_rate = get_audio_sample_rate(temp_save_path)
        if not sample_rate:
            os.remove(temp_save_path)
            return jsonify({"error": f"Could not determine sample rate for '{audio_filename}'."}), 500

        if file_ext == '.wav':
            # ... (the logic for processing .wav files remains the same)
            codec = get_audio_codec(temp_save_path)
            if codec is None:
                os.remove(temp_save_path)
                return jsonify({"error": f"Could not process '{audio_filename}'. Unsupported format."}), 500
            if codec != 'pcm_s16le':
                ffmpeg_command = ["ffmpeg", "-y", "-i", temp_save_path, "-acodec", "pcm_s16le", "-ar", str(sample_rate), audio_file_path_wav]
                execute_command(ffmpeg_command, timeout=300)
                os.remove(temp_save_path)
            else:
                os.replace(temp_save_path, audio_file_path_wav)
        else: # For .mp4 and other formats
            # ... (the logic for processing other formats remains the same)
            ffmpeg_command = ["ffmpeg", "-y", "-i", temp_save_path, "-acodec", "pcm_s16le", "-ar", str(sample_rate), audio_file_path_wav]
            execute_command(ffmpeg_command, timeout=300)
            os.replace(temp_save_path, audio_file_path_mp4)
            video_file = f"{URL_PREFIX}/static/videos/pool/{username}/{audio_basename}.mp4"

        if not os.path.exists(audio_file_path_wav) or os.path.getsize(audio_file_path_wav) == 0:
            return jsonify({"error": "Failed to extract a valid audio track."}), 500

        success, message = create_graph_file(audio_file_path_wav, graph_file_path)
        if not success:
            return jsonify({"error": f"Audio analysis failed: {message}"}), 500

        audio_file_url = f"{URL_PREFIX}/static/videos/pool/{username}/{audio_basename}.wav"

        return render_template(
            'viewer.html',
            audioFile=audio_file_url,
            videoFile=video_file or '',
            graphData=f"{URL_PREFIX}/static/videos/pool/{username}/{audio_basename}.graph",
            fileName=audio_basename,
            userName=username,
            fileList=json.dumps(all_user_files), # Use the new complete list
            currentIndex=current_index        # Use the new correct index
        )

    except Exception as e:
        # Add more detailed error logging for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500