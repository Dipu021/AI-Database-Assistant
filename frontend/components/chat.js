function addMessage(sender, content) {
    const chat = document.getElementById("chat");

    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;

    if (sender === "assistant") {
        msgDiv.innerHTML = `
            <strong>Assistant</strong><br>
            <div>${content}</div>
        `;
    } else {
        msgDiv.textContent = content;
    }

    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById("user-input");
    const question = input.value.trim();

    if (!question) return;

    if (!currentConnectionId) {
        addMessage("assistant", "⚠️ Please connect to a database first.");
        return;
    }

    addMessage("user", question);
    input.value = "";

    try {

        const response = await fetch("/api/chat/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question,
                connection_id: currentConnectionId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Query failed.");
        }

        let html = `
            <div class="sql-code">
                ${data.sql}
            </div>
        `;

        if (data.error) {

            html += `
                <p style="color:red;">
                    <b>Error:</b> ${data.error}
                </p>
            `;

        } else {

            if (data.summary) {
                html += `<p>${data.summary}</p>`;
            }

            if (data.result && data.result.length > 0) {

                html += `
                    <pre>${JSON.stringify(data.result, null, 2)}</pre>
                `;

            } else {

                html += `
                    <p><b>Query executed successfully.</b></p>
                `;
            }
        }

        addMessage("assistant", html);

    } catch (err) {

        console.error(err);

        addMessage(
            "assistant",
            `<span style="color:red;">${err.message}</span>`
        );
    }
}

document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});