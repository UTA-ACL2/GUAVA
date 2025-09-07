document.addEventListener("DOMContentLoaded", () => {
    const audioInput = document.getElementById('audioFile');
    const uploadButton = document.getElementById('uploadButton');
    const exportAllButton = document.getElementById('exportAllButton');
    const errorMessage = document.getElementById('errorMessage');
    const poolContainer = document.getElementById("poolContainer");
    const fileList = document.getElementById("fileList");
    const userDisplay = document.getElementById("userDisplay");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");

    let currentPage = 1;
    const itemsPerPage = 10;
    let totalPages = 1;
    let fileData = [];
    let currentSort = { key: null, asc: true };
    const keyMap = {
        name: "name",
        type: "type",
        status: "status",
        duration: "duration",
        size: "size"
    };

    if (window.message) {
        alert(window.message);
    }

    // Check the file format and whether the file is selected
    function validateFile() {
        const file = audioInput.files[0];
        errorMessage.textContent = '';
        if (!file) {
            errorMessage.textContent = 'No video or audio provided';
            return false;
        }
        const fileName = file.name.toLowerCase();
        if (!(fileName.endsWith('.mp4') || fileName.endsWith('.wav') || fileName.endsWith('.mp3'))) {
            errorMessage.textContent = 'Please upload MP4, MP3, WAV file';
            return false;
        }
        errorMessage.textContent = '';
        return true;
    }

    uploadButton.addEventListener('click', (event) => {
        if (!validateFile()) {
            event.preventDefault();
        }
    });

    audioInput.addEventListener('change', () => {
        validateFile();
    });

    uploadButton.addEventListener('click', async () => {
        const fileInput = document.getElementById('audioFile');
        const files = Array.from(fileInput.files);
        const formData = new FormData();

        for (const file of files) {
            const ext = file.name.split('.').pop();
            let baseName = file.name.substring(0, file.name.lastIndexOf('.'));
            function sanitizeFileName(name) {
                return name
                    .replace(/[^\w]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_+|_+$/g, '');
            }
            baseName = sanitizeFileName(baseName);
            let finalName = baseName;
            let override = false;
            const checkRes = await fetch(`${window.URL_PREFIX}/check_file_exists?username=${window.username}&videoName=${finalName}`);
            const { exists } = await checkRes.json();
            if (exists) {
                const confirmOverwrite = confirm(`File "${finalName}" already exists. Do you want to overwrite it? (previous annotation will be deleted)`);
                if (confirmOverwrite) {
                    override = true;
                } else {
                    let index = 2;
                    while (true) {
                        const newName = `${baseName}__${index}`;
                        const check = await fetch(`${window.URL_PREFIX}/check_file_exists?username=${window.username}&videoName=${newName}`);
                        const { exists: existsAlt } = await check.json();
                        if (!existsAlt) {
                            finalName = newName;
                            break;
                        }
                        index++;
                    }
                }
            }
            const renamedFile = new File([file], `${finalName}.${ext}`, { type: file.type });
            formData.append("audioFile", renamedFile);
            formData.append(`override_${finalName}`, override);
        }
        const form = document.getElementById('runForm');
        const action = form.getAttribute('action');
        const res = await fetch(action, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            window.location.reload();
        } else {
            alert("Upload failed！");
        }
    });

    exportAllButton.addEventListener('click', () => {
        const url = `${window.URL_PREFIX}/export_all_annotations?username=${window.username}`;
        window.open(url, '_blank');
    });

    function fetchAndRenderPage(page) {
        fetch(`${window.URL_PREFIX}/${window.username}/files?page=${page}&per_page=${itemsPerPage}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("User not found or no files available.");
                    return;
                }
                userDisplay.textContent = data.username;
                fileData = data.files.map((file, index) => ({
                    ...file,
                    originalIndex: index
                }));
                totalPages = data.total_pages;
                renderPage();
                poolContainer.style.display = "block";
            })
            .catch(error => console.error("Error loading files:", error));
    }

    function sortFileData(key, asc) {
        fileData.sort((a, b) => {
            const valA = getValue(a, key);
            const valB = getValue(b, key);
            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
        });
    }

    function getValue(file, key) {
        if (key === "name") return file.name.toLowerCase();
        if (key === "type") return file.type.toLowerCase();
        if (key === "status") return file.status === "Annotated" ? 1 : 0;
        if (key === "duration") return parseFloat(file.duration);
        if (key === "size") return parseFloat(file.size);
        return file.name;
    }

    function renderPage() {
        fileList.innerHTML = "";
        const pageItems = fileData;
        pageItems.forEach(file => {
            let fileItem = document.createElement("li");
            fileItem.classList.add("file-item");
            let fileIcon = document.createElement("img");
            fileIcon.classList.add("file-icon");
            fileIcon.src = `${window.URL_PREFIX}/static/icons/${
                file.type === "WAV" ? "audio" : file.type === "MP3" ? "audio1" : "video"
            }-icon.png`;
            let nameDiv = document.createElement("div");
            nameDiv.classList.add("col", "name");
            nameDiv.title = file.name
            nameDiv.textContent = file.name;
            let statusDiv = document.createElement("div");
            statusDiv.classList.add("col", "status");
            statusDiv.textContent = file.status;
            statusDiv.style.color = file.status === "Annotated" ? "red" : "green";
            let durationDiv = document.createElement("div");
            durationDiv.classList.add("col", "duration");
            durationDiv.textContent = file.duration;
            let typeDiv = document.createElement("div");
            typeDiv.classList.add("col", "type");
            typeDiv.textContent = file.type;
            let sizeDiv = document.createElement("div");
            sizeDiv.classList.add("col", "size");
            sizeDiv.textContent = file.size;
            fileItem.appendChild(fileIcon);
            fileItem.appendChild(nameDiv);
            fileItem.appendChild(typeDiv);
            fileItem.appendChild(statusDiv);
            fileItem.appendChild(durationDiv);
            fileItem.appendChild(sizeDiv);
            fileList.appendChild(fileItem);
        });
        updatePaginationControls();
    }

    function updatePaginationControls() {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    prevPageBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            fetchAndRenderPage(currentPage);
        }
    });

    nextPageBtn.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAndRenderPage(currentPage);
        }
    });

    document.querySelectorAll(".sortable").forEach(col => {
        const key = col.classList[1];
        const actualKey = keyMap[key];

        col.addEventListener("click", () => {
            if (currentSort.key === actualKey) {
                if (currentSort.asc) {
                    currentSort.asc = false;
                } else {
                    currentSort.key = null;
                    fileData.sort((a, b) => a.originalIndex - b.originalIndex);
                    updateSortIcons();
                    renderPage();
                    return;
                }
            } else {
                currentSort = { key: actualKey, asc: true };
            }
            sortFileData(currentSort.key, currentSort.asc);
            updateSortIcons();
            renderPage();
        });
    });

    function updateSortIcons() {
        document.querySelectorAll(".sort-arrow").forEach(arrow => arrow.classList.remove("active"));
        if (!currentSort.key) return;
        const colKey = Object.keys(keyMap).find(k => keyMap[k] === currentSort.key);
        const col = document.querySelector(`.col.${colKey}`);
        if (!col) return;
        const arrow = col.querySelector(`.sort-arrow.${currentSort.asc ? 'up' : 'down'}`);
        if (arrow) arrow.classList.add("active");
    }

    fileList.addEventListener("click", async function (event) {
        let target = event.target;
        while (target && !target.classList.contains("file-item")) {
            target = target.parentElement;
        }
        if (target) {
            const fileName = target.querySelector(".name").textContent.trim();
            const fileName2 = fileName.split(".")[0];

            const lockRes = await fetch(`${window.URL_PREFIX}/lock_file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: window.username, filename: fileName2 })
            });
            const lockData = await lockRes.json();
            if (!lockData.success) {
                alert("This file is currently being used by another session.");
                return;
            }

            const fileResponse = await fetch(`${window.URL_PREFIX}/static/videos/pool/${window.username}/${fileName}`);
            const fileBlob = await fileResponse.blob();

            // --- FIX: Use the correct mime type from the fetched blob ---
            const selectedFile = new File([fileBlob], fileName, { type: fileBlob.type });

            const formData = new FormData();
            formData.append("audioFile", selectedFile);
            formData.append("username", window.username);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${window.URL_PREFIX}/general/general`;
            form.enctype = 'multipart/form-data';
            form.style.display = 'none';

            // const allFileNames = fileData.map(f => f.name);
            // const currentIndex = allFileNames.indexOf(fileName);

            // const fileListInput = document.createElement('input');
            // fileListInput.type = 'hidden';
            // fileListInput.name = 'fileList';
            // fileListInput.value = JSON.stringify(allFileNames);
            // form.appendChild(fileListInput);

            // const indexInput = document.createElement('input');
            // indexInput.type = 'hidden';
            // indexInput.name = 'currentIndex';
            // indexInput.value = currentIndex;
            // form.appendChild(indexInput);

            for (const [key, value] of formData.entries()) {
                 const input = document.createElement('input');
                if (value instanceof File) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(value);
                    input.type = 'file';
                    input.name = key;
                    input.files = dataTransfer.files;
                } else {
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                }
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        }
    });

    const contextMenu = document.getElementById("filePoolItemContextMenu");
    let selectedFileItem = null;
    document.getElementById("fileList").addEventListener("contextmenu", function (e) {
        let target = e.target;
        while (target && !target.classList.contains("file-item")) {
            target = target.parentElement;
        }
        if (target) {
            e.preventDefault();
            selectedFileItem = target;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.display = "block";
        }
    });

    document.getElementById("deleteFileOption").addEventListener("click", async () => {
        if (!selectedFileItem) return;
        const fileName = selectedFileItem.querySelector(".name").textContent.trim();
        const confirmDelete = confirm(`Are you sure you want to delete "${fileName}"?`);
        if (!confirmDelete) return;
        const res = await fetch(`${window.URL_PREFIX}/delete_file?username=${window.username}&filename=${encodeURIComponent(fileName)}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            fetchAndRenderPage(currentPage);
        } else {
            alert("Delete failed: " + (result.error || "Unknown error"));
        }
        contextMenu.style.display = "none";
    });

    document.addEventListener("click", () => {
        contextMenu.style.display = "none";
    });

    fetchAndRenderPage(currentPage);
});

