function addMessage(sender, content) {
    const chat = document.getElementById('chat');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    if (sender === 'assistant') {
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
    const input = document.getElementById('user-input');
    const question = input.value.trim();
    if (!question || !currentConnectionId) return;
    
    addMessage('user', question);
    input.value = '';
    
    try {
        const res = await fetch('http://localhost:8000/api/chat/query', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question, connection_id: currentConnectionId})
        });
        const data = await res.json();
        
        let responseHTML = `<div class="sql-code">${data.sql}</div>`;
        if (data.error) {
            responseHTML += `<p style="color:red;">Error: ${data.error}</p>`;
        } else {
            responseHTML += `<p>${data.summary}</p>`;
            if (data.result && data.result.length > 0) {
                responseHTML += `<pre>${JSON.stringify(data.result.slice(0,3), null, 2)}</pre>`;
            }
        }
        
        addMessage('assistant', responseHTML);
    } catch (e) {
        addMessage('assistant', 'Error processing query.');
    }
}

// Allow Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});