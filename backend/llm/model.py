from groq import Groq
from config import GROQ_API_KEY
from .prompts import SQL_GENERATION_PROMPT

client = Groq(api_key=GROQ_API_KEY)


def generate_sql(schema: str, question: str, db_type: str) -> str:
    prompt = SQL_GENERATION_PROMPT.format(
        db_type=db_type,
        schema=schema,
        question=question
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=500
    )

    sql = response.choices[0].message.content.strip()

    # Remove markdown if present
    sql = sql.replace("```sql", "").replace("```", "").strip()

    return sql