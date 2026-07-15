from fastapi import APIRouter, HTTPException
import traceback

from models import QueryRequest, QueryResponse
from database.connection import execute_query, get_connection
from database.schema import get_schema
from llm.model import generate_sql

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        print("\n========== NEW QUERY ==========")
        print(f"Connection ID : {request.connection_id}")
        print(f"Question      : {request.question}")

        # Get connection
        conn_info = get_connection(request.connection_id)
        if not conn_info:
            raise HTTPException(
                status_code=400,
                detail="No active database connection found."
            )

        print("Connection found.")

        # Get database type
        db_type = conn_info.get("db_type")
        print(f"Database Type : {db_type}")

        # Load schema
        schema = get_schema(request.connection_id)
        print("Schema loaded successfully.")

        # Generate SQL
        sql = generate_sql(
            schema=schema,
            question=request.question,
            db_type=db_type
        )

        print("Generated SQL:")
        print(sql)

        if not sql or sql.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="LLM failed to generate SQL."
            )

        # Execute SQL
        result, error = execute_query(request.connection_id, sql)

        if error:
            print("Database Error:", error)

            return QueryResponse(
                sql=sql,
                result=[],
                summary="Query execution failed.",
                error=error
            )

        row_count = len(result) if result else 0

        summary = f"Query executed successfully. {row_count} row(s) returned."

        if row_count > 0:
            summary += f"\nFirst Row: {result[0]}"

        print("Rows Returned:", row_count)
        print("===============================\n")

        return QueryResponse(
            sql=sql,
            result=result or [],
            summary=summary,
            error=None
        )

    except HTTPException:
        raise

    except Exception as e:
        print("\n========== ERROR ==========")
        traceback.print_exc()
        print("===========================\n")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )