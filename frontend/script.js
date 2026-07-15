let currentConnectionId = null;

async function connectDB() {
    const dbType = document.getElementById('db-type').value;
    let data = { db_type: dbType };
    
    // Collect fields based on type - simplified
    if (dbType === 'SQLite') {
        data.file_path = '/path/to/db.sqlite'; // In real, use file input
    } else if (dbType === 'MongoDB') {
        data.uri = document.getElementById('uri') ? document.getElementById('uri').value : '';
    } else {
        data.host = document.getElementById('host') ? document.getElementById('host').value : 'localhost';
        data.port = parseInt(document.getElementById('port') ? document.getElementById('port').value : '5432');
        data.database = document.getElementById('database') ? document.getElementById('database').value : '';
        data.username = document.getElementById('username') ? document.getElementById('username').value : '';
        data.password = document.getElementById('password') ? document.getElementById('password').value : '';
    }
    
    try {
        const res = await fetch('http://localhost:8000/api/db/connect', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.status === 'success') {
            currentConnectionId = result.connection_id;
            document.getElementById('status').innerHTML = `🟢 Connected to ${dbType}<br>DB: ${data.database || 'default'}`;
            addMessage('assistant', 'Connection successful! Ask me anything about the database.');
        }
    } catch (e) {
        alert('Connection failed: ' + e);
    }
}

function updateFields() {
    const type = document.getElementById('db-type').value;
    const fieldsDiv = document.getElementById('fields');
    fieldsDiv.innerHTML = '';
    
    if (type === 'SQLite') {
        fieldsDiv.innerHTML = `
            <label>Database File</label>
            <input type="text" id="file-path" placeholder="path/to/database.db" value=":memory:">
        `;
    } else if (type === 'MongoDB') {
        fieldsDiv.innerHTML = `
            <label>Connection URI</label>
            <input type="text" id="uri" placeholder="mongodb://...">
        `;
    } else {
        fieldsDiv.innerHTML = `
            <label>Host</label>
            <input type="text" id="host" value="localhost">
            <label>Port</label>
            <input type="number" id="port" value="${type === 'PostgreSQL' ? 5432 : 3306}">
            <label>Database</label>
            <input type="text" id="database" value="employees">
            <label>Username</label>
            <input type="text" id="username" value="postgres">
            <label>Password</label>
            <input type="password" id="password" value="password">
        `;
    }
}

// Initial fields
updateFields();