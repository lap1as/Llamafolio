import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    # Create the user object and add the hashed password
    db_obj = User(**user_create.dict())  # Using Pydantic's dict() to convert to model fields
    db_obj.hashed_password = get_password_hash(user_create.password)

    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)  # Exclude unset fields from the update
    if "password" in user_data:
        password = user_data.pop("password")  # Pop to handle separately
        user_data["hashed_password"] = get_password_hash(password)  # Set hashed password

    # Apply updates to db_user and commit changes
    for key, value in user_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user or not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    # Convert Pydantic model to SQLModel instance using dict() for item_in
    db_item = Item(**item_in.dict(), owner_id=owner_id)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item
