const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const inputFile = document.querySelector("#inputFile");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const fileUrl = document.querySelector("#fileUrl");
const copyBtn = document.querySelector("#copyBtn");
const sharingContainer = document.querySelector(".sharing-container");

const emailForm = document.querySelector("#emailForm")

const toast = document.querySelector(".toast");
const host = "https://happysharing-app.herokuapp.com/";
const uploadUrl = host + "api/files";
const emailUrl = host + "api/files/send";
const maxAllowedSize = 10 * 1024 * 1024;
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("dragged"))
        dropZone.classList.add("dragged");
    // console.log("dragging");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.log(files);
    if (files.length) {
        inputFile.files = files;
        uploadFiles();
    }
})

inputFile.addEventListener("change", () => {
    uploadFiles();
})

browseBtn.addEventListener("click", () => {
    inputFile.click();
})


const uploadFiles = () => {

    if (inputFile.files.length > 1) {
        inputFile.value = "";
        showToast("Upload only 1 file!");
        return;
    }
    const file = inputFile.files[0];
    if (file.size > maxAllowedSize) {
        inputFile.value = "";
        showToast("Can't upload more than 100 MB");
        return;
    }

    const formData = new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            showLink(JSON.parse(xhr.response));
        }
        console.log(xhr.readyState);
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        inputFile.value = "";
        showToast(`Error in upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
}

const updateProgress = (e) => {
    progressContainer.style.display = "block";
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    percentDiv.innerHTML = `${percent}%`;
}

const showLink = ({ file }) => {
    console.log(file);
    file.value = "";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    fileUrl.value = file;
    sharingContainer.style.display = "block";
}

copyBtn.addEventListener("click", (e) => {
    fileUrl.select();
    document.execCommand("copy");
    showToast("Copied to Clipboard");
})


emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Email sent");
    const url = (fileUrl.value);
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };
    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);
    fetch(emailUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
    }).then((res) => res.json()).then((data) => {
        if (data.success == true) {
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        }
    })
})


let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)"
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%, 60px)"
    }, 2000);
}