// Get references to form and input elements
const form = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const successMessage = document.getElementById("success-message");

// ✅ Pre-fill name and email if user is logged in (from sessionStorage)
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(
        sessionStorage.getItem("taskforge_current_user") || "null"
    );
    if (user) {
        nameInput.value = user.name;
        emailInput.value = user.email;
    }
});

// ✅ Clear validation errors when user types in inputs
[nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
        input.classList.remove("error"); // remove error border
        document.getElementById(`${input.id}-error`).classList.remove("show"); // hide error message
    });
});

// ✅ Handle form submission
form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default form submission behavior

    // Clear previous error states and messages
    document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
    document.querySelectorAll(".error-text").forEach((el) => el.classList.remove("show"));
    successMessage.classList.remove("show");

    // Get trimmed values from the inputs
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let isValid = true;

    // ✅ Validate Name: at least 2 characters
    if (name.length < 2) {
        nameInput.classList.add("error");
        document.getElementById("name-error").classList.add("show");
        isValid = false;
    }

    // ✅ Validate Email using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailInput.classList.add("error");
        document.getElementById("email-error").classList.add("show");
        isValid = false;
    }

    // ✅ Validate Message: at least 10 characters
    if (message.length < 10) {
        messageInput.classList.add("error");
        document.getElementById("message-error").classList.add("show");
        isValid = false;
    }

    // ❌ If any field is invalid, stop submission
    if (!isValid) return;

    // ✅ If valid, store the message in sessionStorage
    const contacts = JSON.parse(
        sessionStorage.getItem("taskforge_contacts") || "[]"
    );

    contacts.push({
        id: Date.now(),              // unique ID for message
        name,
        email,
        message,
        submittedAt: new Date().toISOString(), // timestamp
    });

    // ✅ Save updated contact list to sessionStorage
    sessionStorage.setItem("taskforge_contacts", JSON.stringify(contacts));

    // ✅ Show success message and reset the form
    successMessage.classList.add("show");
    form.reset();
});
