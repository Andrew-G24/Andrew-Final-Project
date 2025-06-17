// DOM Elements
const channels = document.querySelectorAll(".channel");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const currentChannelName = document.getElementById("current-channel-name");
const userListUl = document.getElementById("user-list-ul");
const statusSelect = document.getElementById("status-select");
const profileNameDisplay = document.getElementById("profile-name");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const settingsUsernameInput = document.getElementById("settings-username");
const saveUsernameBtn = document.getElementById("save-username");
const themeToggleBtn = document.getElementById("theme-toggle");

// Data
let currentUser = {
    name: "You",
    status: "online",
    id: "user1",
    profileImg: "https://via.placeholder.com/40",
};

const users = [
    currentUser,
    {
        name: "Alice",
        status: "online",
        id: "user2",
        profileImg: "https://via.placeholder.com/40",
    },
    {
        name: "Bob",
        status: "idle",
        id: "user3",
        profileImg: "https://via.placeholder.com/40",
    },
];

const messages = {
    general: [
        { userId: "user2", text: "Hey, welcome to the general channel!" },
        { userId: "user1", text: "Thanks! Glad to be here." },
    ],
    random: [{ userId: "user3", text: "Random chat is the best chat." }],
    help: [{ userId: "user2", text: "Need help? Ask here." }],
};

let currentChannel = "general";

// Functions

function renderChannels() {
    channels.forEach((ch) => {
        ch.classList.toggle("active", ch.dataset.channel === currentChannel);
    });
}

function renderMessages() {
    messagesContainer.innerHTML = "";
    messages[currentChannel].forEach(({ userId, text }) => {
        const user = users.find((u) => u.id === userId);
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<strong>${user.name}:</strong> ${escapeHtml(text)}`;
        messagesContainer.appendChild(div);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderUserList() {
    userListUl.innerHTML = "";
    users.forEach(({ id, name, status }) => {
        const li = document.createElement("li");
        li.classList.add("user-list-item");
        li.innerHTML = `
      <div class="user-status-dot user-status-${status}"></div> ${escapeHtml(
            name
        )}
    `;
        userListUl.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, "<br>");
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    messages[currentChannel].push({ userId: currentUser.id, text });
    messageInput.value = "";
    renderMessages();
}

function setStatus(newStatus) {
    currentUser.status = newStatus;
    statusSelect.value = newStatus;
    renderUserList();
}

function setUsername(newName) {
    currentUser.name = newName.trim() || currentUser.name;
    profileNameDisplay.textContent = currentUser.name;
    settingsUsernameInput.value = currentUser.name;
    renderUserList();
}

// Event Listeners

channels.forEach((ch) =>
    ch.addEventListener("click", () => {
        currentChannel = ch.dataset.channel;
        currentChannelName.textContent = currentChannel;
        renderChannels();
        renderMessages();
    })
);

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

statusSelect.addEventListener("change", (e) => {
    setStatus(e.target.value);
});

settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
    settingsUsernameInput.value = currentUser.name;
    settingsUsernameInput.focus();
});

closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
});

saveUsernameBtn.addEventListener("click", () => {
    setUsername(settingsUsernameInput.value);
    settingsModal.classList.add("hidden");
});

settingsUsernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        saveUsernameBtn.click();
    }
});

themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        themeToggleBtn.textContent = "☀️";
    } else {
        themeToggleBtn.textContent = "🌙";
    }
});

// Initial render
renderChannels();
renderMessages();
renderUserList();
profileNameDisplay.textContent = currentUser.name;
settingsUsernameInput.value = currentUser.name;
statusSelect.value = currentUser.status;
