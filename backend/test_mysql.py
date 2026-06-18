import asyncio
import asyncmy

async def test_connection():
    try:
        conn = await asyncmy.connect(
            host='localhost',
            port=3306,
            user='root',
            password='action',
            database='demo'
        )
        print("MySQL connection successful!")
        await conn.close()
    except Exception as e:
        print(f"MySQL connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
