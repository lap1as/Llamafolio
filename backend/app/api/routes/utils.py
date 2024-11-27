from datetime import datetime, timedelta
import jwt
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr
from app.models import Message
from app.api.deps import get_current_active_superuser
from app.core.config import settings
from app.utils import generate_test_email, send_email

router = APIRouter()


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> bool:
    """
    Health check for the application.
    """
    return True


# Utility functions related to password reset
def generate_password_reset_token(email: str, expiry: timedelta = timedelta(hours=1)) -> str:
    """Generate a password reset token."""
    expiration = datetime.utcnow() + expiry
    payload = {"sub": email, "exp": expiration}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify the password reset token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]  # Return the email address
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
