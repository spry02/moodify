import csv
import io
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import storage

try:
    from google.api_core.exceptions import NotFound
except Exception:  # pragma: no cover
    NotFound = None  # type: ignore


def append_prediction_csv_row(*, uid: str, detected_emotion: str, mood: str) -> None:
    """Append a single prediction row to `users/{uid}/predictions.csv` in Firebase Storage."""

    try:
        firebase_admin.get_app()
    except ValueError as e:
        raise RuntimeError("Firebase Admin is not initialized (missing service-account.json)") from e

    ts = datetime.now(timezone.utc).isoformat()
    header = "timestamp_utc,detected_emotion,mood\n"

    bucket = storage.bucket()
    blob = bucket.blob(f"users/{uid}/predictions.csv")

    existing = ""
    try:
        existing = blob.download_as_text()
    except Exception as e:
        if NotFound is not None and isinstance(e, NotFound):
            existing = ""
        else:
            # Some backends raise a generic Exception on first upload; treat it as missing.
            existing = ""

    if existing and not existing.endswith("\n"):
        existing += "\n"

    has_header = existing.lstrip().startswith("timestamp_utc,detected_emotion,mood")

    row_buf = io.StringIO()
    writer = csv.writer(row_buf)
    writer.writerow([ts, detected_emotion, mood])
    row = row_buf.getvalue()

    if not existing:
        new_content = header + row
    elif has_header:
        new_content = existing + row
    else:
        new_content = header + existing + row

    blob.upload_from_string(new_content, content_type="text/csv")
