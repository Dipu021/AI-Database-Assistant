# AI Database Assistant

AI Database Assistant is a full-stack app that turns natural-language questions into SQL, executes them against a connected database, and returns the results through a simple web interface.

## Features

- Natural-language to SQL generation using Groq
- FastAPI backend for query processing and API routes
- A lightweight frontend served directly by the backend
- Support for PostgreSQL, MySQL, SQLite, and MongoDB-style connection flows

## Prerequisites

- Python 3.11+
- Docker (optional)
- A Groq API key

## Local development

1. Create a `.env` file in the project root with your Groq key:
   ```bash
   GROQ_API_KEY=your_key_here
   ```
2. For database connections, use the host value `localhost` when running the app locally.
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```
4. Open http://localhost:8000/ in your browser.

The frontend is served by the FastAPI app, so you do not need a separate web server for local development.

## Docker deployment

Build the image:

```bash
docker build -t ai-database-assistant .
```

Run the container:

```bash
docker run --rm -p 8000:8000 --env-file .env ai-database-assistant
```

For database connections inside Docker, use `host.docker.internal` as the host value so the container can reach services running on your host machine. For local development, use `localhost`.

Then visit http://localhost:8000/ to use the app.

## Project structure

- `backend/` contains the FastAPI app, database logic, and LLM integration
- `frontend/` contains the static web UI served by the backend
- `Dockerfile` builds and runs the application in a container
