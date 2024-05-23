const dropzone = document.body;
const loading = document.querySelector(".loading-install");

let cancelTimeout;
dropzone.addEventListener('dragleave', (e) => {
    cancelTimeout = setTimeout(() => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
    }, 250);
});

let isMouseOutside = false;

dropzone.addEventListener('dragover', function(event) {
    clearTimeout(cancelTimeout);
    event.preventDefault();
    event.stopPropagation();
    dropzone.classList.add('dragover');
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    if (mouseX < 0 || mouseX > window.innerWidth || mouseY < 0 || mouseY > window.innerHeight) {
        if (!isMouseOutside) {
            isMouseOutside = true;
            console.log("customout")
            dropzone.classList.remove('dragover');
        }
    } else {
        if (isMouseOutside) {
            isMouseOutside = false;
        }
    }
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
    loading.classList.remove('disabled');
    
    const files = e.dataTransfer.files;
    if (files.length === 0) {
        alert('No files dropped.');
        return;
    }
    
    for (const file of files) {
        if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
            handleZipFile(file);
        } else {
            alert('Only .ZIP files are compatible');
        }
    }
});

function handleZipFile(file) {
    fetch(`/install/zip`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: { filename: file.path } })
    }).then(res => {});
}