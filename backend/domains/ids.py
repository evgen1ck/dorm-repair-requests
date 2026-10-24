from typing import Annotated

from fastapi import Path
from pydantic import Field

MAX_DB_ID = 2**31 - 1

DbId = Annotated[int, Field(ge=1, le=MAX_DB_ID)]
DbIdPath = Annotated[int, Path(ge=1, le=MAX_DB_ID)]
