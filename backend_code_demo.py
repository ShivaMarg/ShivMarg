#!/usr/bin/env python3
"""
ShivaMarg Backend — Single-file FastAPI server
Auth (register/login/JWT) + Comments (CRUD) with MongoDB
Install: pip install fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart
Run: uvicorn shivamarg_backend:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import os
import re

# ─────────────────────────────────────────────
#  CONFIG  (change these via env vars in prod)
# ─────────────────────────────────────────────
MONGO_URI        = os.getenv("MONGO_URI",  "mongodb://localhost:27017")
DB_NAME          = os.getenv("DB_NAME",    "shivamarg")
SECRET_KEY       = os.getenv("SECRET_KEY", "shiva-om-namah-supersecret-change-in-prod-2024")
ALGORITHM        = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days

ALLOWED_ORIGINS  = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# ─────────────────────────────────────────────
#  APP + CORS
# ─────────────────────────────────────────────
app = FastAPI(title="ShivaMarg API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  DB
# ─────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db     = client[DB_NAME]
users_col           = db["users"]
comments_col        = db["comments"]
vidyapati_posts_col = db["VidyapatiGeetSangrah"]

# Indexes
users_col.create_index("email",    unique=True)
users_col.create_index("username", unique=True)
comments_col.create_index([("page_id", 1), ("created_at", DESCENDING)])
comments_col.create_index("user_id")
vidyapati_posts_col.create_index([("createdAt", DESCENDING)])
vidyapati_posts_col.create_index("featured")

# ─────────────────────────────────────────────
#  PASSWORD + JWT
# ─────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer(auto_error=False)

def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        return None
    payload = decode_token(creds.credentials)
    user = users_col.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    user = get_current_user(creds)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def serialize_user(u: dict) -> dict:
    return {
        "id":         str(u["_id"]),
        "username":   u["username"],
        "email":      u["email"],
        "avatar":     u.get("avatar", u["username"][0].upper()),
        "created_at": u["created_at"].isoformat(),
    }

def serialize_comment(c: dict, current_user_id: Optional[str] = None) -> dict:
    likes      = c.get("likes", [])
    liked_by_me = (current_user_id in likes) if current_user_id else False
    return {
        "id":          str(c["_id"]),
        "page_id":     c["page_id"],
        "user_id":     c["user_id"],
        "username":    c["username"],
        "avatar":      c.get("avatar", c["username"][0].upper()),
        "text":        c["text"],
        "likes":       len(likes),
        "liked_by_me": liked_by_me,
        "created_at":  c["created_at"].isoformat(),
        "updated_at":  c.get("updated_at", c["created_at"]).isoformat(),
    }

def serialize_post(p: dict) -> dict:
    """Serialize Vidyapati Geet post for API response"""
    return {
        "id":          str(p["_id"]),
        "name":        p.get("name") or p.get("eng", "Unknown"),
        "title":       p.get("eng") or p.get("name", "Unknown"),
        "description": p.get("preview", ""),
        "desc":        p.get("preview", ""),
        "category":    p.get("category", ""),
        "typeLabel":   p.get("typeLabel", ""),
        "image":       p.get("imageUrl") or p.get("img", ""),
        "img":         p.get("img", ""),
        "url":         p.get("url", ""),
        "link":        p.get("url", ""),
        "hashtags":    p.get("hashtags", []),
        "featured":    p.get("featured", False),
        "createdAt":   p.get("createdAt", datetime.utcnow()).isoformat() if isinstance(p.get("createdAt"), datetime) else p.get("createdAt", ""),
        "date":        p.get("createdAt", datetime.utcnow()).isoformat() if isinstance(p.get("createdAt"), datetime) else p.get("createdAt", ""),
        "updatedAt":   p.get("updatedAt", datetime.utcnow()).isoformat() if isinstance(p.get("updatedAt"), datetime) else p.get("updatedAt", ""),
    }

# ─────────────────────────────────────────────
#  SCHEMAS
# ─────────────────────────────────────────────
class RegisterInput(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: str
    password: str = Field(..., min_length=6)
    display_name: Optional[str] = None

class LoginInput(BaseModel):
    email: str
    password: str

class CommentInput(BaseModel):
    page_id: str = Field(..., description="Unique page identifier e.g. 'shiv-aarti'")
    text: str    = Field(..., min_length=1, max_length=1000)

class CommentUpdate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

# ─────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────
@app.post("/api/auth/register", status_code=201)
def register(body: RegisterInput):
    try:
        # Validate username
        if not re.match(r"^[a-zA-Z0-9_]+$", body.username):
            raise HTTPException(400, "Username can only contain letters, numbers, underscores")

        # Check duplicates
        if users_col.find_one({"email": body.email.lower()}):
            raise HTTPException(400, "Email already registered")
        if users_col.find_one({"username": body.username}):
            raise HTTPException(400, "Username already taken")

        doc = {
            "username":     body.username,
            "display_name": body.display_name or body.username,
            "email":        body.email.lower(),
            "password":     hash_password(body.password),
            "avatar":       body.username[0].upper(),
            "created_at":   datetime.utcnow(),
        }
        result = users_col.insert_one(doc)
        doc["_id"] = result.inserted_id

        token = create_token({"sub": str(result.inserted_id)})
        return {"token": token, "user": serialize_user(doc)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"REGISTER ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ─────────────────────────────────────────────
#  EXTENDED SCHEMAS  (add these with your existing schemas)
# ─────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=60)
    username:     Optional[str] = Field(None, min_length=3, max_length=30)
    email:        Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class PersonalDetails(BaseModel):
    mobile:   Optional[str] = Field(None, max_length=20)
    dob:      Optional[str] = None          # ISO date string  "YYYY-MM-DD"
    address:  Optional[dict] = None         # {line1, city, state, pin, country}


# ─────────────────────────────────────────────
#  EXTENDED serialize_user  (replace your existing one)
# ─────────────────────────────────────────────

def serialize_user(u: dict) -> dict:
    return {
        "id":           str(u["_id"]),
        "username":     u["username"],
        "display_name": u.get("display_name", u["username"]),
        "email":        u["email"],
        "avatar":       u.get("avatar", u["username"][0].upper()),
        "mobile":       u.get("mobile"),
        "dob":          u.get("dob"),
        "address":      u.get("address"),
        "created_at":   u["created_at"].isoformat(),
    }


# ─────────────────────────────────────────────
#  NEW ROUTES  (add after your existing routes)
# ─────────────────────────────────────────────

# 1. Edit display name / username / email
@app.patch("/api/auth/profile")
def update_profile(body: ProfileUpdate, current_user=Depends(require_user)):
    updates = {}

    if body.display_name is not None:
        updates["display_name"] = body.display_name.strip()

    if body.username is not None:
        if not re.match(r"^[a-zA-Z0-9_]+$", body.username):
            raise HTTPException(400, "Username can only contain letters, numbers, underscores")
        existing = users_col.find_one({"username": body.username})
        if existing and str(existing["_id"]) != str(current_user["_id"]):
            raise HTTPException(400, "Username already taken")
        updates["username"] = body.username
        updates["avatar"]   = body.username[0].upper()   # keep avatar letter in sync

    if body.email is not None:
        existing = users_col.find_one({"email": body.email.lower()})
        if existing and str(existing["_id"]) != str(current_user["_id"]):
            raise HTTPException(400, "Email already registered")
        updates["email"] = body.email.lower()

    if not updates:
        raise HTTPException(400, "Nothing to update")

    updates["updated_at"] = datetime.utcnow()
    users_col.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated = users_col.find_one({"_id": current_user["_id"]})
    return serialize_user(updated)


# 2. Change password
@app.post("/api/auth/password")
def change_password(body: PasswordChange, current_user=Depends(require_user)):
    if not verify_password(body.old_password, current_user["password"]):
        raise HTTPException(400, "Current password is incorrect")
    users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(body.new_password), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password updated successfully"}


# 3. Save / update personal details (mobile, DOB, address)
@app.put("/api/auth/details")
def update_details(body: PersonalDetails, current_user=Depends(require_user)):
    updates = {}
    if body.mobile  is not None: updates["mobile"]  = body.mobile.strip()
    if body.dob     is not None: updates["dob"]     = body.dob
    if body.address is not None: updates["address"] = body.address
    if not updates:
        raise HTTPException(400, "Nothing to update")
    updates["updated_at"] = datetime.utcnow()
    users_col.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated = users_col.find_one({"_id": current_user["_id"]})
    return serialize_user(updated)


# 4. Get all comments by a specific user, with page title lookup
#    page_titles is an optional dict you pass from your frontend config
#    e.g. {"shiv-aarti": "Shiv Aarti", "maha-mrityunjaya": "Maha Mrityunjaya"}
PAGE_TITLES: dict = {}   # populate this from an env var or a DB collection if you have one

@app.get("/api/users/{user_id}/comments")
def get_user_comments(
    user_id: str,
    skip: int = 0,
    limit: int = 50,
    creds: HTTPAuthorizationCredentials = Depends(bearer),
):
    try:
        uid_obj = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user id")

    current_user = get_current_user(creds)
    viewer_id    = str(current_user["_id"]) if current_user else None

    cursor = (
        comments_col
        .find({"user_id": user_id})
        .sort("created_at", DESCENDING)
        .skip(skip)
        .limit(limit)
    )
    total = comments_col.count_documents({"user_id": user_id})

    comments = []
    for c in cursor:
        serialized            = serialize_comment(c, viewer_id)
        serialized["page_title"] = PAGE_TITLES.get(c["page_id"], c["page_id"])  # fallback to page_id slug
        comments.append(serialized)

    # unique pages the user has commented on
    unique_pages = comments_col.distinct("page_id", {"user_id": user_id})
    page_summary = [
        {"page_id": p, "page_title": PAGE_TITLES.get(p, p)}
        for p in unique_pages
    ]

    return {
        "total":     total,
        "pages":     page_summary,
        "comments":  comments,
    }


# 5. Public profile — anyone can view basic info + comment count
@app.get("/api/users/{user_id}/profile")
def get_public_profile(user_id: str):
    try:
        uid_obj = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user id")

    user = users_col.find_one({"_id": uid_obj})
    if not user:
        raise HTTPException(404, "User not found")

    comment_count = comments_col.count_documents({"user_id": user_id})
    pages_count   = len(comments_col.distinct("page_id", {"user_id": user_id}))

    return {
        "id":           str(user["_id"]),
        "username":     user["username"],
        "display_name": user.get("display_name", user["username"]),
        "avatar":       user.get("avatar", user["username"][0].upper()),
        "created_at":   user["created_at"].isoformat(),
        "stats": {
            "comments": comment_count,
            "pages":    pages_count,
        }
    }


@app.post("/api/auth/login")
def login(body: LoginInput):
    try:
        user = users_col.find_one({"email": body.email.lower()})
        if not user or not verify_password(body.password, user["password"]):
            raise HTTPException(401, "Invalid email or password")

        token = create_token({"sub": str(user["_id"])})
        return {"token": token, "user": serialize_user(user)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"LOGIN ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/auth/me")
def me(current_user=Depends(require_user)):
    return serialize_user(current_user)


# ─────────────────────────────────────────────
#  COMMENT ROUTES
# ─────────────────────────────────────────────
@app.get("/api/comments/{page_id}")
def get_comments(
    page_id: str,
    skip: int = 0,
    limit: int = 20,
    creds: HTTPAuthorizationCredentials = Depends(bearer),
):
    current_user = get_current_user(creds)
    uid = str(current_user["_id"]) if current_user else None

    cursor = (
        comments_col
        .find({"page_id": page_id})
        .sort("created_at", DESCENDING)
        .skip(skip)
        .limit(limit)
    )
    total = comments_col.count_documents({"page_id": page_id})
    items = [serialize_comment(c, uid) for c in cursor]
    return {"total": total, "comments": items}


@app.post("/api/comments", status_code=201)
def post_comment(body: CommentInput, current_user=Depends(require_user)):
    doc = {
        "page_id":    body.page_id,
        "user_id":    str(current_user["_id"]),
        "username":   current_user["username"],
        "avatar":     current_user.get("avatar", current_user["username"][0].upper()),
        "text":       body.text.strip(),
        "likes":      [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = comments_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_comment(doc, str(current_user["_id"]))


@app.put("/api/comments/{comment_id}")
def update_comment(
    comment_id: str,
    body: CommentUpdate,
    current_user=Depends(require_user),
):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")

    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if comment["user_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Cannot edit another user's comment")

    comments_col.update_one(
        {"_id": oid},
        {"$set": {"text": body.text.strip(), "updated_at": datetime.utcnow()}}
    )
    updated = comments_col.find_one({"_id": oid})
    return serialize_comment(updated, str(current_user["_id"]))


@app.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: str, current_user=Depends(require_user)):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")

    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if comment["user_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Cannot delete another user's comment")

    comments_col.delete_one({"_id": oid})
    return None


@app.post("/api/comments/{comment_id}/like")
def toggle_like(comment_id: str, current_user=Depends(require_user)):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")

    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")

    uid  = str(current_user["_id"])
    likes = comment.get("likes", [])

    if uid in likes:
        comments_col.update_one({"_id": oid}, {"$pull": {"likes": uid}})
        liked = False
    else:
        comments_col.update_one({"_id": oid}, {"$push": {"likes": uid}})
        liked = True

    updated = comments_col.find_one({"_id": oid})
    return serialize_comment(updated, uid)


# ─────────────────────────────────────────────
#  POSTS ROUTES (Vidyapati Geet)
# ─────────────────────────────────────────────
@app.get("/api/posts/latest")
def get_latest_posts(limit: int = 5, skip: int = 0):
    """
    Fetch latest Vidyapati Geet posts from VidyapatiGeetSangrah collection
    
    Query params:
    - limit: number of posts to return (default: 5, max: 20)
    - skip: number of posts to skip for pagination (default: 0)
    
    Returns:
    {
        "posts": [
            {
                "id": "...",
                "name": "गीत का नाम",
                "title": "English Title",
                "description": "preview text",
                "image": "https://url/to/image",
                "url": "https://shivmarg.live/...",
                "createdAt": "2024-01-01T00:00:00",
                "hashtags": [...]
            }
        ],
        "total": 42
    }
    """
    try:
        # Validate limit (max 20)
        limit = min(int(limit), 20)
        skip = max(int(skip), 0)
        
        # Query latest posts, sorted by createdAt descending
        cursor = (
            vidyapati_posts_col
            .find({})
            .sort("createdAt", DESCENDING)
            .skip(skip)
            .limit(limit)
        )
        
        posts = [serialize_post(post) for post in cursor]
        total = vidyapati_posts_col.count_documents({})
        
        return {
            "posts": posts,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    
    except Exception as e:
        print(f"GET LATEST POSTS ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/posts/featured")
def get_featured_posts(limit: int = 5):
    """
    Fetch featured Vidyapati Geet posts
    
    Query params:
    - limit: number of posts to return (default: 5, max: 20)
    
    Returns: Same format as /api/posts/latest
    """
    try:
        limit = min(int(limit), 20)
        
        cursor = (
            vidyapati_posts_col
            .find({"featured": True})
            .sort("createdAt", DESCENDING)
            .limit(limit)
        )
        
        posts = [serialize_post(post) for post in cursor]
        total = vidyapati_posts_col.count_documents({"featured": True})
        
        return {
            "posts": posts,
            "total": total,
            "limit": limit
        }
    
    except Exception as e:
        print(f"GET FEATURED POSTS ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/posts/search")
def search_posts(q: str = "", category: str = "", limit: int = 10):
    """
    Search Vidyapati Geet posts by name, title, or category
    
    Query params:
    - q: search query (searches in name, eng, preview)
    - category: filter by category (e.g., "shiv", "durga")
    - limit: number of results (default: 10, max: 50)
    
    Returns: Same format as /api/posts/latest
    """
    try:
        limit = min(int(limit), 50)
        
        # Build query
        query = {}
        
        if q:
            # Search in multiple fields
            query["$or"] = [
                {"name": {"$regex": q, "$options": "i"}},
                {"eng": {"$regex": q, "$options": "i"}},
                {"preview": {"$regex": q, "$options": "i"}},
            ]
        
        if category:
            query["category"] = category
        
        cursor = (
            vidyapati_posts_col
            .find(query)
            .sort("createdAt", DESCENDING)
            .limit(limit)
        )
        
        posts = [serialize_post(post) for post in cursor]
        total = vidyapati_posts_col.count_documents(query)
        
        return {
            "posts": posts,
            "total": total,
            "query": q,
            "category": category,
            "limit": limit
        }
    
    except Exception as e:
        print(f"SEARCH POSTS ERROR: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/posts/{post_id}")
def get_post_detail(post_id: str):
    """
    Get detailed view of a single post
    
    Params:
    - post_id: MongoDB ObjectId of the post
    
    Returns: Full post object with all fields
    """
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(400, "Invalid post id")
    
    post = vidyapati_posts_col.find_one({"_id": oid})
    if not post:
        raise HTTPException(404, "Post not found")
    
    return serialize_post(post)


# ─────────────────────────────────────────────
#  HEALTH
# ─────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "db": DB_NAME}


# ─────────────────────────────────────────────
#  RUN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("shivamarg_backend:app", host="0.0.0.0", port=8000, reload=True)