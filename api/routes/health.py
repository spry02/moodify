from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/", summary="Testowy endpoint")
async def read_root() -> dict[str, str]:
    return {"message": "Hello World"}

