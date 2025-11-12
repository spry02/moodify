from fastapi import FastAPI

app = FastAPI(title="Moodify API", version="0.1.0")


@app.get("/", summary="Testowy endpoint")
async def read_root() -> dict[str, str]:
    return {"message": "Hello World"}

