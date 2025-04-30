import os
import subprocess
import threading
from typing import List


# class Worker(threading.Thread):
#     """
#     Worker thread to execute a subprocess and capture its exit code.
#     """
#
#     def __init__(self, process: subprocess.Popen):
#         super().__init__()
#         self.process = process
#         self.exit_code = None
#         self._stop_event = threading.Event()  # 用于标记线程是否应该停止
#
#     def run(self):
#         try:
#             if not self._stop_event.is_set():  # 如果没有设置停止标志位，则等待子进程完成
#                 self.exit_code = self.process.wait()
#         except Exception as e:
#             self.exit_code = -1
#
#     def interrupt(self):
#         """
#         Interrupt the thread by setting the stop event and terminating the process.
#         """
#         self._stop_event.set()  # 设置停止标志位
#         if self.process.poll() is None:  # 如果子进程仍在运行，则终止
#             self.process.terminate()
#
#
# def execute_command(command: List[str], timeout: int) -> str:
#     process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
#     worker = Worker(process)
#     worker.start()
#
#     try:
#         print("Executing command:", " ".join(command))
#         stdout, stderr = process.communicate(timeout=timeout)
#
#         stdout = stdout.strip() if stdout else ""
#         stderr = stderr.strip() if stderr else "Unknown error"
#
#         if process.returncode != 0:
#             print(f"Command stderr: {stderr}")
#             raise Exception(f"Command failed with return code {process.returncode}:\n{stderr}")
#
#         print("Command stdout:", stdout)
#         return stdout
#     except subprocess.TimeoutExpired:
#         process.kill()
#         process.communicate()  # Ensure output is collected after killing
#         raise TimeoutError("Command execution timed out.")
#     except Exception as ex:
#         worker.interrupt()
#         raise ex
#     finally:
#         try:
#             process.terminate()
#             process.wait(timeout=5)
#         except Exception as e:
#             print(f"Error during process termination: {e}")

def execute_command(command: List[str], timeout: int = 300) -> str:
    process = None  # 提前定义，避免未赋值时报错
    print("Executing command:", " ".join(command))

    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        stdout, stderr = process.communicate(timeout=timeout)
        stdout = stdout.strip() if stdout else ""
        stderr = stderr.strip() if stderr else ""

        if process.returncode != 0:
            raise subprocess.CalledProcessError(
                process.returncode, command, output=stdout, stderr=stderr
            )

        return stdout

    except subprocess.TimeoutExpired:
        if process:
            process.kill()
            _, _ = process.communicate()
        raise TimeoutError(f"Command timed out after {timeout} seconds.")

    except Exception as e:
        raise RuntimeError(f"Failed to execute command: {' '.join(command)}\n{str(e)}")



def get_files_in_folder(folder_path: str) -> List[str]:
    """
    Get all files in a folder.

    :param folder_path: Path to the folder.
    :return: List of file paths.
    """
    if not os.path.isdir(folder_path):
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    return [os.path.join(folder_path, file) for file in os.listdir(folder_path) if
            os.path.isfile(os.path.join(folder_path, file))]


def delete_folder_and_content(folder_path: str):
    """
    Delete a folder and its content.

    :param folder_path: Path to the folder to delete.
    """
    if not os.path.exists(folder_path):
        return

    for entry in os.listdir(folder_path):
        entry_path = os.path.join(folder_path, entry)
        if os.path.isfile(entry_path):
            os.remove(entry_path)
        elif os.path.isdir(entry_path):
            delete_folder_and_content(entry_path)

    os.rmdir(folder_path)


def save_file(uploaded_input_stream, server_location: str):
    """
    Save uploaded file to a specified location on the server.

    :param uploaded_input_stream: Input stream of the uploaded file.
    :param server_location: Path to save the file on the server.
    """
    try:
        with open(server_location, "wb") as output_stream:
            while True:
                data = uploaded_input_stream.read(1024)
                if not data:
                    break
                output_stream.write(data)
    except IOError as e:
        print(f"Error saving file: {e}")


def get_praat_location(default_path="D:/praat.exe"):
    """
    获取 Praat 的安装路径。
    如果环境变量未设置，则返回默认路径。
    """
    praat_location = os.getenv("PRAAT_LOCATION", default_path)
    if not os.path.isfile(praat_location):
        raise Exception(f"PRAAT_LOCATION path '{praat_location}' is not a valid file")
    return praat_location


def check_file_exists(file_path):
    """
    检查文件路径是否存在
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    return True


def check_directory_exists(dir_path):
    """
    检查目录路径是否存在
    """
    if not os.path.isdir(dir_path):
        raise NotADirectoryError(f"Directory not found: {dir_path}")
    return True
