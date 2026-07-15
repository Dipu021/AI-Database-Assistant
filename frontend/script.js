let currentConnectionId = null;

// Automatically use the current website as the API URL
const API_BASE = window.location.origin;

async function connectDB() {
    const dbType = document.getElementById("db-type").value;

    let data = {
        db_type: dbType
    };

    if (dbType === "SQLite") {
        data.file_path = document.getElementById("file-path")?.value || ":memory:";
    }
    else if (dbType === "MongoDB") {
        data.uri = document.getElementById("uri")?.value || "";
    }
    else {
        data.host = document.getElementById("host")?.value || "localhost";
        data.port = parseInt(
            document.getElementById("port")?.value ||
            (dbType === "PostgreSQL" ? "5432" : "3306")
        );
        data.database = document.getElementById("database")?.value || "";
        data.username = document.getElementById("username")?.value || "";
        data.password = document.getElementById("password")?.value || "";
    }

    try {

        const response = await fetch(`${API_BASE}/api/db/connect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || result.message || "Connection failed");
        }

        currentConnectionId = result.connection_id;

        document.getElementById("status").innerHTML = `
            🟢 Connected Successfully
            <br>
            <small>${dbType}</small>
        `;

        if (typeof addMessage === "function") {
            addMessage(
                "assistant",
                "✅ Database connected successfully. You can now ask questions."
            );
        }

    } catch (err) {
        console.error(err);
        alert("Connection failed:\n\n" + err.message);
    }
}

function updateFields() {

    const type = document.getElementById("db-type").value;
    const fields = document.getElementById("fields");

    if (type === "SQLite") {

        fields.innerHTML = `
            <label>Database File</label>
            <input
                type="text"
                id="file-path"
                placeholder="database.db"
                value=":memory:"
            >
        `;

    } else if (type === "MongoDB") {

        fields.innerHTML = `
            <label>Mongo URI</label>
            <input
                type="text"
                id="uri"
                placeholder="mongodb://username:password@host:27017/database"
            >
        `;

    } else {

        const defaultPort = type === "PostgreSQL" ? 5432 : 3306;

        fields.innerHTML = `
            <label>Host</label>
            <input
                type="text"
                id="host"
                placeholder="localhost"
                value="localhost"
            >

            <label>Port</label>
            <input
                type="number"
                id="port"
                value="${defaultPort}"
            >

            <label>Database</label>
            <input
                type="text"
                id="database"
                placeholder="Database Name"
            >

            <label>Username</label>
            <input
                type="text"
                id="username"
                placeholder="Username"
            >

            <label>Password</label>
            <input
                type="password"
                id="password"
                placeholder="Password"
            >
        `;
    }
}

// Load default fields on page load
updateFields();