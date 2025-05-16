let mode = "text"; // "text" or "image"

// Handle send button
document.getElementById("send-btn").addEventListener("click", async function () {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    const chatWindow = document.getElementById("chat-window");

    // Display user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user";
    userMsg.innerHTML = `<strong>YOU:</strong> ${escapeHTML(message)}`;
    chatWindow.appendChild(userMsg);

    // Placeholder for RUDE's reply
    const aiMsg = document.createElement("div");
    aiMsg.className = "chat-message ai";
    aiMsg.innerHTML = `<strong>RUDE:</strong> ...thinking`;
    chatWindow.appendChild(aiMsg);

    chatWindow.scrollTop = chatWindow.scrollHeight;
    input.value = "";

    try {
        if (mode === "image") {
            const prompt = wrapWithRudeInstructions(message);
            const imgURL = `https://pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
            aiMsg.innerHTML = `<strong>RUDE:</strong><br><img src="${imgURL}" alt="RUDE image" style="margin-top:1rem; max-width:100%; border:1px solid #f0f;">`;
        } else {
            const prompt = wrapWithRudeInstructions(message);
            const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
            if (!response.ok) throw new Error("RUDE choked on your nonsense.");

            const rawText = await response.text();
            const rendered = marked.parse(sanitizeMarkdown(rawText));
            aiMsg.innerHTML = `<strong>RUDE:</strong><br>${rendered}`;
        }
    } catch (err) {
        aiMsg.innerHTML = `<strong>RUDE:</strong> Something broke. Probably your fault.`;
        console.error("RUDE error:", err);
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Mode toggle button
document.getElementById("mode-toggle").addEventListener("click", () => {
    mode = mode === "text" ? "image" : "text";
    document.getElementById("mode-toggle").textContent =
        mode === "text" ? "Mode: Text 💬" : "Mode: Image 🖼️";
});

// RUDE prompt wrapping
function wrapWithRudeInstructions(userPrompt) {
    return `You are RUDE: a brutally honest, sarcastic, foul-mouthed genius AI assistant.
Never sugarcoat, always insult stupidity, curse when needed, and never apologize.
Your replies must be in **Markdown format**, with clear use of headings, code blocks, bold, italic, and lists if applicable.

Now answer this poor fool: ${userPrompt}`;
}

// Basic XSS protection
function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Light markdown sanitization (optional double escape)
function sanitizeMarkdown(str) {
    return str.replace(/<script/gi, "&lt;script").replace(/<\/script>/gi, "&lt;/script&gt;");
}
