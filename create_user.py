"""
create_user.py
-------------
A convenience script to create a user.
"""
import logging
from getpass import getpass

from sqlmodel import SQLModel, Session, create_engine

from schemas import User

logging.getLogger('passlib').setLevel(logging.ERROR)

engine = create_engine(
    "sqlite:///cars.db",
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=True # Log generated SQL
)


if __name__ == "__main__":
    print("Creating tables (if necessary)")
    SQLModel.metadata.create_all(engine)

    print("--------")

    print("This script will create a user and save it in the database.")

    username = input("Please enter username\n") #admin
    pwd = getpass("Please enter password\n") #123456

    # 调试信息：显示密码的实际长度和内容
    print(f"Password length: {len(pwd)} characters")
    print(f"Password byte length: {len(pwd.encode('utf-8'))} bytes")
    # 显示密码的repr形式以检查隐藏字符
    print(f"Password repr: {repr(pwd)}")

    with Session(engine) as session:
        user = User(username=username)
        user.set_password(pwd)
        session.add(user)
        session.commit()