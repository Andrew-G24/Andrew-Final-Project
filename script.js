// DOM Elements
const channelsContainer = document.querySelector(".channels");
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
const addChannelBtn = document.getElementById("add-channel-btn");
const deleteChannelBtn = document.getElementById("delete-channel-btn");

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
    ],
    random: [{ userId: "user3", text: "Random chat is the best chat." }],
    help: [{ userId: "user2", text: "Need help? Ask here." }],
};

let currentChannel = "general";

// Functions

function renderChannels() {
    // Clear all except controls
    const controls = channelsContainer.querySelector(".channel-controls");
    channelsContainer.innerHTML = "";
    // Add channel divs from messages keys
    Object.keys(messages).forEach((chName) => {
        const chDiv = document.createElement("div");
        chDiv.classList.add("channel");
        chDiv.dataset.channel = chName;
        chDiv.tabIndex = 0;
        chDiv.textContent = `# ${chName}`;
        if (chName === currentChannel) chDiv.classList.add("active");

        chDiv.setAttribute("draggable", "true");

        chDiv.addEventListener("click", () => {
            currentChannel = chName;
            currentChannelName.textContent = currentChannel;
            renderChannels();
            renderMessages();
        });

        // Drag events
        chDiv.addEventListener("dragstart", handleDragStart);
        chDiv.addEventListener("dragover", handleDragOver);
        chDiv.addEventListener("drop", handleDrop);
        chDiv.addEventListener("dragend", handleDragEnd);

        // Right-click context menu
        chDiv.addEventListener("contextmenu", handleChannelContextMenu);

        channelsContainer.appendChild(chDiv);
    });

    // Append controls at end (add/delete buttons container)
    if (controls) channelsContainer.appendChild(controls);
}

function renderMessages() {
    messagesContainer.innerHTML = "";
    if (!messages[currentChannel]) return;
    messages[currentChannel].forEach(({ userId, text }) => {
        const user = users.find((u) => u.id === userId);
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<strong>${
            user ? user.name : "Unknown"
        }:</strong> ${escapeHtml(text)}`;
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
    if (!messages[currentChannel]) messages[currentChannel] = [];
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

function addChannel() {
    const name = prompt("Enter channel name (no # needed):");
    if (!name) return;

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleanName || messages[cleanName]) {
        alert("Invalid or duplicate channel name.");
        return;
    }

    messages[cleanName] = [];
    currentChannel = cleanName;
    currentChannelName.textContent = cleanName;
    renderChannels();
    renderMessages();
}

function deleteChannel() {
    const keys = Object.keys(messages);
    if (keys.length === 1) {
        alert("You must have at least one channel.");
        return;
    }

    if (confirm(`Delete channel "${currentChannel}"?`)) {
        delete messages[currentChannel];

        // Switch to first remaining channel
        currentChannel = Object.keys(messages)[0];
        currentChannelName.textContent = currentChannel;
        renderChannels();
        renderMessages();
    }
}

// Drag and Drop Handlers
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.currentTarget;
    e.currentTarget.classList.add("dragging");
}

function handleDragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target === draggedElement) return;

    const bounding = target.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    const before = offset < bounding.height / 2;

    const parent = target.parentNode;
    if (before) {
        parent.insertBefore(draggedElement, target);
    } else {
        parent.insertBefore(draggedElement, target.nextSibling);
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedElement) return;

    draggedElement.classList.remove("dragging");

    // Rebuild messages object in new order
    const channelEls = channelsContainer.querySelectorAll(".channel");
    const newOrder = Array.from(channelEls)
        .map((el) => el.dataset.channel)
        .filter((name) => messages.hasOwnProperty(name));

    const newMessages = {};
    newOrder.forEach((name) => {
        newMessages[name] = messages[name];
    });

    // Overwrite messages with reordered channels
    Object.keys(messages).forEach((k) => delete messages[k]);
    Object.assign(messages, newMessages);

    renderChannels(); // Reattach event listeners and update UI
}

function handleDragEnd() {
    if (draggedElement) {
        draggedElement.classList.remove("dragging");
        draggedElement = null;
    }
}

// Context menu for rename/delete
function handleChannelContextMenu(e) {
    e.preventDefault();
    removeContextMenu();

    const channelDiv = e.currentTarget; // The channel div that was right-clicked
    const oldName = channelDiv.dataset.channel;

    const menu = document.createElement("div");
    menu.classList.add("channel-context-menu");
    menu.style.position = "absolute";
    menu.style.zIndex = 1000;

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename Channel";
    renameBtn.onclick = () => {
        const newName = prompt("New channel name:", oldName);
        if (!newName) {
            removeContextMenu();
            return;
        }
        const cleanName = newName.trim().toLowerCase().replace(/\s+/g, "-");
        if (cleanName && cleanName !== oldName && !messages[cleanName]) {
            messages[cleanName] = messages[oldName];
            delete messages[oldName];

            // Update the channelDiv dataset and textContent
            channelDiv.dataset.channel = cleanName;
            channelDiv.textContent = `# ${cleanName}`;

            if (currentChannel === oldName) {
                currentChannel = cleanName;
                currentChannelName.textContent = cleanName;
            }

            renderChannels();
            renderMessages();
        } else {
            alert("Invalid or duplicate name.");
        }
        removeContextMenu();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete Channel";
    deleteBtn.onclick = () => {
        if (Object.keys(messages).length === 1) {
            alert("Cannot delete the last channel.");
        } else if (confirm(`Delete channel "${oldName}"?`)) {
            delete messages[oldName];
            if (currentChannel === oldName) {
                currentChannel = Object.keys(messages)[0];
                currentChannelName.textContent = currentChannel;
            }
            renderChannels();
            renderMessages();
        }
        removeContextMenu();
    };

    menu.append(renameBtn, deleteBtn);
    document.body.appendChild(menu);

    const { clientX: x, clientY: y } = e;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    document.addEventListener("click", removeContextMenu);
}

function removeContextMenu() {
    const existing = document.querySelector(".channel-context-menu");
    if (existing) existing.remove();
    document.removeEventListener("click", removeContextMenu);
}

// Event Listeners
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
    const isDark = document.body.classList.toggle("dark");
    document.body.classList.toggle("light", !isDark);

    // Update icon
    themeToggleBtn.textContent = isDark ? "☀️" : "🌙";

    // Optional: Save preference
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

addChannelBtn.addEventListener("click", addChannel);
deleteChannelBtn.addEventListener("click", deleteChannel);

// Initial render and setup
renderChannels();
renderMessages();
renderUserList();
profileNameDisplay.textContent = currentUser.name;
settingsUsernameInput.value = currentUser.name;
statusSelect.value = currentUser.status;
