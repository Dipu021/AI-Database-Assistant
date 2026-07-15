from sqlalchemy import text
from .connection import get_connection


def get_schema(conn_id):
    conn_info = get_connection(conn_id)

    if not conn_info:
        return "No connection found."

    db_type = conn_info["type"]

    if db_type == "mysql":

        conn = conn_info["conn"]

        schema = ""

        # Get all tables
        tables = conn.execute(text("SHOW TABLES")).fetchall()

        for table in tables:

            table_name = list(table._mapping.values())[0]

            schema += f"\nTable: {table_name}\n"
            schema += "-" * 40 + "\n"

            columns = conn.execute(
                text(f"DESCRIBE {table_name}")
            ).fetchall()

            for col in columns:

                c = col._mapping

                schema += (
                    f"{c['Field']} "
                    f"{c['Type']} "
                    f"{'(PRIMARY KEY)' if c['Key']=='PRI' else ''}\n"
                )

            schema += "\n"

        return schema

    elif db_type == "postgres":

        return "PostgreSQL schema extraction coming soon."

    elif db_type == "sqlite":

        return "SQLite schema extraction coming soon."

    return "Schema not available."