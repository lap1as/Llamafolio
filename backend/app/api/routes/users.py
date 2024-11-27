import uuid
from datetime import datetime, timedelta
import pyotp
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, delete, func, col

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Item,
    Message,
    Token,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import (
    generate_new_account_email,
    send_email,
    generate_password_reset_token,
    generate_reset_password_email,
    verify_password_reset_token,
)

router = APIRouter()


@router.post("/register")
def register_user(session: SessionDep, user_create: UserCreate) -> Message:
    """
    Register a new user and send a confirmation email with a 2FA setup.
    """
    user = crud.get_user_by_email(session=session, email=user_create.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create the new user
    new_user = crud.create_user(session=session, user_create=user_create)

    # Generate confirmation token for email verification
    confirmation_token = generate_password_reset_token(email=user_create.email)
    email_data = generate_reset_password_email(
        email_to=user_create.email, email=user_create.email, token=confirmation_token
    )
    send_email(
        email_to=user_create.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

    return Message(message="Registration successful. Please check your email for confirmation.")


@router.post("/confirm-email")
def confirm_email(session: SessionDep, token: str) -> Message:
    """
    Confirm user registration via token sent to email and enable 2FA.
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid confirmation token")

    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_active:
        raise HTTPException(status_code=400, detail="Email already confirmed")

    # Activate the user account
    user.is_active = True

    # Enable 2FA for the user
    otp_secret = pyotp.random_base32()  # Generate OTP secret key
    user.otp_secret = otp_secret
    session.add(user)
    session.commit()

    otp_provisioning_uri = pyotp.totp.TOTP(otp_secret).provisioning_uri(
        user.email, issuer_name="Llamafolio"
    )

    session.commit()

    return Message(
        message="Email confirmed successfully. 2FA enabled. Scan this QR code with your authenticator app.",
        otp_provisioning_uri=otp_provisioning_uri,
    )


@router.post("/verify-2fa")
def verify_otp(session: SessionDep, current_user: CurrentUser, otp_code: str) -> Message:
    """
    Verify OTP code for 2FA after email confirmation.
    """
    user = crud.get_user_by_id(session=session, user_id=current_user.id)
    if not user or not user.otp_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled for this user.")

    totp = pyotp.TOTP(user.otp_secret)
    if not totp.verify(otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    # Reset failed attempts and lockout if verification is successful
    user.failed_otp_attempts = 0
    user.lockout_until = None
    session.add(user)
    session.commit()

    return Message(message="OTP verified successfully. You are now logged in.")


@router.get("/", dependencies=[Depends(get_current_active_superuser)], response_model=UsersPublic)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=users, count=count)


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(*, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser) -> Any:
    """
    Update own user.
    """
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=409, detail="User with this email already exists")
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Super users are not allowed to delete themselves")
    statement = delete(Item).where(col(Item.owner_id) == current_user.id)
    session.exec(statement)  # type: ignore
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")
