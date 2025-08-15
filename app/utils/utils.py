import subprocess
from typing import List


def execute_command(command: List[str], timeout: int = 300) -> str:
    process = None  # Define in advance to avoid errors when no value is assigned
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
