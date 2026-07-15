import sqlite3
from typing import Dict

from sqlalchemy import create_engine, text
from pymongo import MongoClient

connections = {}


def connect_db(conn_data: Dict):
    db_type = conn_data.get("db_type")

    conn_id = f"{db_type}_{conn_data.get('database', 'default')}_{id(conn_data)}"

    try:

        # ---------------- SQLITE ---------------- #

        if db_type == "SQLite":
            db_path = conn_data.get("file_path", ":memory:")
            conn = sqlite3.connect(db_path)

            connections[conn_id] = {
                "conn": conn,
                "engine": None,
                "type": "sqlite",
                "db_type": "SQLite",
                "database": db_path,
                "host": None,
                "port": None,
                "username": None,
            }

            return conn_id, "Connected to SQLite successfully"

        # ---------------- MYSQL ---------------- #

        elif db_type == "MySQL":

            engine = create_engine(
                f"mysql+pymysql://"
                f"{conn_data['username']}:{conn_data['password']}@"
                f"{conn_data['host']}:{conn_data.get('port',3306)}/"
                f"{conn_data['database']}"
            )

            conn = engine.connect()

            connections[conn_id] = {
                "conn": conn,
                "engine": engine,
                "type": "mysql",
                "db_type": "MySQL",
                "host": conn_data["host"],
                "port": conn_data.get("port", 3306),
                "database": conn_data["database"],
                "username": conn_data["username"],
            }

            return conn_id, "Connected to MySQL successfully"

        # ---------------- POSTGRES ---------------- #

        elif db_type == "PostgreSQL":

            engine = create_engine(
                f"postgresql+psycopg2://"
                f"{conn_data['username']}:{conn_data['password']}@"
                f"{conn_data['host']}:{conn_data.get('port',5432)}/"
                f"{conn_data['database']}"
            )

            conn = engine.connect()

            connections[conn_id] = {
                "conn": conn,
                "engine": engine,
                "type": "postgres",
                "db_type": "PostgreSQL",
                "host": conn_data["host"],
                "port": conn_data.get("port", 5432),
                "database": conn_data["database"],
                "username": conn_data["username"],
            }

            return conn_id, "Connected to PostgreSQL successfully"

        # ---------------- MONGODB ---------------- #

        elif db_type == "MongoDB":

            uri = conn_data.get("uri")

            client = MongoClient(uri)

            db = client[conn_data["database"]]

            connections[conn_id] = {
                "conn": db,
                "engine": client,
                "type": "mongodb",
                "db_type": "MongoDB",
                "database": conn_data["database"],
                "host": uri,
            }

            return conn_id, "Connected to MongoDB successfully"

        else:
            return None, f"Unsupported database type: {db_type}"

    except Exception as e:
        return None, f"Connection failed: {str(e)}"


def get_connection(conn_id):
    return connections.get(conn_id)


def execute_query(conn_id, sql):

    conn_info = get_connection(conn_id)

    if not conn_info:
        return None, "No active connection"

    try:

        # SQLITE
        if conn_info["type"] == "sqlite":

            cursor = conn_info["conn"].cursor()
            cursor.execute(sql)

            if cursor.description:

                columns = [c[0] for c in cursor.description]

                rows = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]

                return rows, None

            conn_info["conn"].commit()
            return [], None

        # MONGODB (placeholder)
        elif conn_info["type"] == "mongodb":

            return [], "MongoDB query execution not implemented yet."

        # MYSQL / POSTGRES
        else:

            result = conn_info["conn"].execute(text(sql))

            if result.returns_rows:

                rows = [
                    dict(row._mapping)
                    for row in result.fetchall()
                ]

                return rows, None

            conn_info["conn"].commit()

            return [], None

    except Exception as e:

        return None, str(e)