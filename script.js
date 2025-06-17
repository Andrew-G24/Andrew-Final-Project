const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const servers = document.querySelectorAll(".server");
const chatHeader = document.getElementById("chat-header");
const toggleThemeBtn = document.getElementById("toggle-theme");
const app = document.getElementById("app");

const profilePic = document.getElementById("profile-pic");
const profileName = document.getElementById("profile-name");
const profileStatus = document.getElementById("profile-status");
const editProfileBtn = document.getElementById("edit-profile");
const profileModal = document.getElementById("profile-modal");
const usernameInput = document.getElementById("username-input");
const profileImgInput = document.getElementById("profile-img-input");
const statusSelect = document.getElementById("status-select");
const saveProfileBtn = document.getElementById("save-profile");
const closeModalBtn = document.getElementById("close-modal");

let currentChannel = "General";

const emojiMap = {
    ":smile:": "😄",
    ":sad:": "😢",
    ":thumbsup:": "👍",
    ":heart:": "❤️",
};

function parseEmojis(text) {
    return text.replace(/:\w+:/g, (match) => emojiMap[match] || match);
}

const defaultProfile = {
    name: "User",
    image: "https://via.placeholder.com/32",
    status: "online",
};

let profile = JSON.parse(localStorage.getItem("profile")) || defaultProfile;

function updateProfileUI() {
    profileName.textContent = profile.name;
    profilePic.src = profile.image;
    profileStatus.className = `status-btn ${profile.status}`;
}

function openProfileModal() {
    usernameInput.value = profile.name;
    profileImgInput.value = profile.image;
    statusSelect.value = profile.status;
    profileModal.classList.remove("hidden");
}

function saveProfile() {
    profile.name = usernameInput.value || "User";
    profile.image = profileImgInput.value || "https://via.placeholder.com/32";
    profile.status = statusSelect.value;
    localStorage.setItem("profile", JSON.stringify(profile));
    updateProfileUI();
    profileModal.classList.add("hidden");
}

editProfileBtn.addEventListener("click", openProfileModal);
saveProfileBtn.addEventListener("click", saveProfile);
closeModalBtn.addEventListener("click", () =>
    profileModal.classList.add("hidden")
);

// Chat logic
const channels = JSON.parse(localStorage.getItem("channels")) || {
    General: [],
    Gaming: [],
    Music: [],
};

function renderMessages(channel) {
    chatBox.innerHTML = "";
    channels[channel].forEach((msg) => {
        const p = document.createElement("p");
        p.innerHTML = parseEmojis(msg);
        chatBox.appendChild(p);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        const formatted = `${profile.name}: ${message}`;
        channels[currentChannel].push(formatted);
        saveChats();
        renderMessages(currentChannel);
        chatInput.value = "";
    }
});

servers.forEach((server) => {
    server.addEventListener("click", () => {
        servers.forEach((s) => s.classList.remove("active"));
        server.classList.add("active");
        currentChannel = server.textContent.replace("# ", "");
        chatHeader.textContent = server.textContent;
        renderMessages(currentChannel);
    });
});

toggleThemeBtn.addEventListener("click", () => {
    app.classList.toggle("dark");
    app.classList.toggle("light");
    toggleThemeBtn.textContent = app.classList.contains("dark")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
});

function saveChats() {
    localStorage.setItem("channels", JSON.stringify(channels));
}

// Initial render
updateProfileUI();
renderMessages(currentChannel);
