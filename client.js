

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
});

function appendMessage(user, message, alignRight = false) {
  const chat = document.getElementById("chat");
  const listItem = document.createElement("li");
  listItem.classList.add("chat-bubble", alignRight ? "sent-bubble" : "received-bubble");
  listItem.innerHTML = `<strong>${user}:</strong> <em>${message}</em>`;
  // console.log(listItem)
  chat.appendChild(listItem);
}

function appendMessageLeft(user_name){
  const chat = document.getElementById("chat");
  const listItem = document.createElement("li");
  listItem.classList.add("chat-bubble", "received-bubble");
  listItem.innerHTML = `<strong>${user_name}:</strong> left the group`;
  // console.log(listItem)
  chat.appendChild(listItem);
}

document.getElementById("join").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const group = document.getElementById("group").value;
  socket.emit("join-group", { user_name: username, groupId: group });
  appendMessage(username, `joined the Group with group id ${group}`, true);
});

socket.on("user_joined", (data) => {
  appendMessage(data.user_name, "joined the Group");
});


document.getElementById("message").addEventListener("focus", () => {
  socket.emit("sender-typing", "Typing...");
});

document.getElementById("message").addEventListener("blur", () => {
  socket.emit("sender-typing", ""); // Send an empty message to clear feedback
});

// Add an event listener for the "message-typed" event
socket.on('message-typed', (user_name, message) => {
  clearFeedback(); // Clear any previous feedback
  const chat = document.getElementById("feedback-list");
  const listItem = document.createElement("p");

  // Check if a message is provided (not empty)
  if (message) {
    listItem.innerHTML = `<em>${user_name} is ${message}</em>`;
  } else {
    clearFeedback()
  }

  chat.appendChild(listItem);
});

function clearFeedback() {
  const chat = document.getElementById("feedback-list");
  chat.innerHTML = ''; 
}

document.getElementById("send").addEventListener("click", () => {
  const group = document.getElementById("group").value;
  const message = document.getElementById("message").value;

  // Emit a 'send-message' event to the server
  socket.emit("send-message", { groupId: group, message });

  // Clear the message input field
  document.getElementById("message").value = "";
  appendMessage("You", message, true);
});

socket.on("receive-message", ({ userId, message }) => {
  clearFeedback();
  appendMessage(userId, message);
});


socket.on('user-left' , (user_name) =>{
  appendMessageLeft(user_name)
})
