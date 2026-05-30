"""
Script to create/reset the demo user in the database.
Run this if you're having login issues.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import User


async def create_demo_user():
    """Create or update the demo user."""
    demo_email = "demo@aimail.com"
    demo_password = "Demo@1234"
    demo_username = "Demo User"
    
    print("🔧 Fixing demo user...")
    print(f"Email: {demo_email}")
    print(f"Password: {demo_password}")
    
    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.email == demo_email))
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"✓ Demo user already exists with ID: {existing.id}")
            print(f"  Updating password...")
            existing.password = hash_password(demo_password)
            await session.commit()
            print(f"✓ Password updated successfully!")
        else:
            print(f"Creating new demo user...")
            demo_user = User(
                email=demo_email,
                username=demo_username,
                password=hash_password(demo_password),
            )
            session.add(demo_user)
            await session.commit()
            print(f"✓ Demo user created successfully!")
        
        # Verify the user
        result = await session.execute(select(User).where(User.email == demo_email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"\n✅ Demo user is ready!")
            print(f"   Email: {user.email}")
            print(f"   Username: {user.username}")
            print(f"   ID: {user.id}")
            print(f"\n🎯 You can now login with:")
            print(f"   Email: demo@aimail.com")
            print(f"   Password: Demo@1234")
        else:
            print(f"\n❌ Error: Could not verify demo user")


if __name__ == "__main__":
    asyncio.run(create_demo_user())
