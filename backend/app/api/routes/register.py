from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse

import pyotp
from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Message, Token, UserPublic
from app.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)

router = APIRouter()

@router.post("/register")
def register_user(
    session: SessionDep, email: str, password: str
) -> Message:
    """
    Реєстрація нового користувача
    """
    user = crud.get_user_by_email(session=session, email=email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(password)
    new_user = crud.create_user(session=session, email=email, hashed_password=hashed_password)
    
    # Генеруємо код підтвердження
    confirmation_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=email, email=email, token=confirmation_token
    )
    send_email(
        email_to=email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Registration successful, check your email for confirmation.")

@router.post("/confirm-email")
def confirm_email(
    session: SessionDep, token: str
) -> Message:
    """
    Підтвердження реєстрації по коду на email
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid confirmation token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True  # Встановлюємо статус як "підтверджений"
    session.add(user)
    session.commit()
    return Message(message="Email confirmed successfully.")

@router.post("/enable-2fa")
def enable_2fa(
    session: SessionDep, current_user: CurrentUser
) -> Message:
    """
    Увімкнути 2FA для поточного користувача
    """
    user = crud.get_user_by_id(session=session, user_id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Генеруємо секретний ключ для OTP
    otp_secret = pyotp.random_base32()
    user.otp_secret = otp_secret  # Зберігаємо секретний ключ в базі даних
    session.add(user)
    session.commit()
    
    otp_provisioning_uri = pyotp.totp.TOTP(otp_secret).provisioning_uri(
        user.email, issuer_name="Llamafolio"
    )
    
    return Message(
        message="2FA enabled. Scan this QR code with your authenticator app.",
        otp_provisioning_uri=otp_provisioning_uri
    )

@router.post("/verify-2fa")
def verify_otp(
    session: SessionDep, current_user: CurrentUser, otp_code: str
) -> Message:
    """
    Підтвердження OTP-коду під час входу
    """
    user = crud.get_user_by_id(session=session, user_id=current_user.id)
    if not user or not user.otp_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled for this user.")
    
    totp = pyotp.TOTP(user.otp_secret)
    if not totp.verify(otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    return Message(message="OTP verified successfully.")
