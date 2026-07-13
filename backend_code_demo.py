#!/usr/bin/env python3
"""
ShivaMarg Backend — Single-file FastAPI server
Auth + Comments + Articles + Authors (MongoDB)

Install: pip install fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-slugify resend
Run:     uvicorn shivamarg_backend:app --host 0.0.0.0 --port 8000 --reload
"""

# ── CHANGE 1: Added BackgroundTasks to this import ────────────────────────────
from fastapi import FastAPI, HTTPException, Depends, status, Request, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import json
import os
import re
import uvicorn

# ── CHANGE 2: Import the welcome email utility ────────────────────────────────
try:
    from email_utils import send_welcome_email
except ImportError:
    def send_welcome_email(**kwargs):
        print("Welcome email skipped: email_utils.py is not installed")

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────
MONGO_URI                   = os.getenv("MONGO_URI",  "mongodb://localhost:27017")
DB_NAME                     = os.getenv("DB_NAME",    "ShivaMarg")
SECRET_KEY                  = os.getenv("SECRET_KEY", "shiva-om-namah-supersecret-change-in-prod-2024")
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days
ALLOWED_ORIGINS             = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# ─────────────────────────────────────────────
#  APP + CORS
# ─────────────────────────────────────────────
app = FastAPI(title="ShivaMarg API", version="3.1.0")

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
articles_col        = db["articles"]
authors_col         = db["authors"]
notification_tokens_col = db["notification_tokens"]

# ── Indexes ────────────────────────────────────
users_col.create_index("email",    unique=True)
users_col.create_index("username", unique=True)
comments_col.create_index([("page_id", 1), ("created_at", DESCENDING)])
comments_col.create_index("user_id")
vidyapati_posts_col.create_index([("createdAt", DESCENDING)])
vidyapati_posts_col.create_index("featured")
articles_col.create_index("slug",                          unique=True)
articles_col.create_index([("status", 1), ("published_at", DESCENDING)])
articles_col.create_index("category_slug")
articles_col.create_index("tags")
articles_col.create_index([("view_count", DESCENDING)])
articles_col.create_index("author_id")
articles_col.create_index([("status", 1), ("author_id", 1)])
articles_col.create_index([("status", 1), ("submitted_at", DESCENDING)])

# ── Authors indexes ───────────────────────────
authors_col.create_index("user_id",  unique=True)
authors_col.create_index("slug",     unique=True)
authors_col.create_index("username", unique=True)
authors_col.create_index([("followers_count", DESCENDING)])
authors_col.create_index("categories")
notification_tokens_col.create_index("token", unique=True)
notification_tokens_col.create_index("updated_at")

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
    payload        = data.copy()
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
    user    = users_col.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    user = get_current_user(creds)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

def require_admin(current_user=Depends(require_user)):
    if current_user.get("role", "user") not in ["admin", "editor", "lekhak"]:
        raise HTTPException(status_code=403, detail="Access required")
    return current_user

def require_super_admin(current_user=Depends(require_user)):
    if current_user.get("role", "user") != "admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

# ─────────────────────────────────────────────
#  SLUG HELPERS
# ─────────────────────────────────────────────
def make_slug(text: str) -> str:
    cleaned = re.sub(r"[^\u0900-\u097F\w\s-]", " ", text)
    cleaned = re.sub(r"[\s_-]+", "-", cleaned).strip("-")
    return cleaned.lower()

def make_author_slug(display_name: str, username: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9\s-]", "", display_name or username)
    base = re.sub(r"[\s_-]+", "-", base).strip("-").lower()
    if not base:
        base = username.lower()
    return base

# ─────────────────────────────────────────────
#  SERIALIZERS
# ─────────────────────────────────────────────
def serialize_user(u: dict) -> dict:
    return {
        "id": str(u.get("_id")),
        "username": u.get("username"),
        "display_name": u.get("display_name", u.get("username")),
        "email": u.get("email"),
        "avatar": u.get("avatar", u.get("username", "U")[0].upper()),
        "role": u.get("role", "user"),
        "mobile": u.get("mobile"),
        "dob": u.get("dob"),
        "address": u.get("address"),
        "is_author": u.get("role") in ["lekhak", "admin", "editor"],
        "author_slug": u.get("author_slug"),
        "created_at": u.get("created_at").isoformat() if u.get("created_at") else None,
    }

def serialize_comment(c: dict, current_user_id: Optional[str] = None) -> dict:
    likes       = c.get("likes", [])
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
    return {
        "id":          str(p["_id"]),
        "name":        p.get("name") or p.get("eng", "Unknown"),
        "title":       p.get("eng")  or p.get("name", "Unknown"),
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

def serialize_article(a: dict, full: bool = True) -> dict:
    def _dt(val):
        if isinstance(val, datetime):
            return val.isoformat()
        return val or ""

    base = {
        "id":               str(a["_id"]),
        "title":            a.get("title", ""),
        "slug":             a.get("slug", ""),
        "subtitle":         a.get("subtitle", ""),
        "excerpt":          a.get("excerpt", ""),
        "banner_url":       a.get("banner_url", ""),
        "thumbnail_url":    a.get("thumbnail_url", ""),
        "author": {
            "id":          a.get("author_id", ""),
            "username":    a.get("author_username", ""),
            "avatar":      a.get("author_avatar", ""),
            "author_slug": a.get("author_slug", ""),
            "author_bio" : a.get("author_bio", "")
        },
        "category":         a.get("category", ""),
        "category_slug":    a.get("category_slug", ""),
        "tags":             a.get("tags", []),
        "status":           a.get("status", "draft"),
        "read_time":        a.get("read_time", 5),
        "view_count":       a.get("view_count", 0),
        "like_count":       a.get("like_count", 0),
        "rejection_reason": a.get("rejection_reason"),
        "submitted_at":     _dt(a.get("submitted_at")),
        "approved_at":      _dt(a.get("approved_at")),
        "approved_by":      a.get("approved_by", ""),
        "published_at":     _dt(a.get("published_at")),
        "created_at":       _dt(a.get("created_at")),
        "updated_at":       _dt(a.get("updated_at")),
    }
    if full:
        base["content"] = a.get("content", "")
    return base

def serialize_author(a: dict, current_user_id: Optional[str] = None) -> dict:
    followers    = a.get("followers", [])
    is_following = (current_user_id in followers) if current_user_id else False
    return {
        "id":              str(a["_id"]),
        "user_id":         a.get("user_id", ""),
        "username":        a.get("username", ""),
        "slug":            a.get("slug", ""),
        "display_name":    a.get("display_name", ""),
        "pen_name":        a.get("pen_name", ""),
        "tagline":         a.get("tagline", ""),
        "bio":             a.get("bio", ""),
        "biography":       a.get("biography", ""),
        "avatar":          a.get("avatar", ""),
        "cover_image":     a.get("cover_image", ""),
        "website":         a.get("website", ""),
        "twitter":         a.get("twitter", ""),
        "instagram":       a.get("instagram", ""),
        "facebook":        a.get("facebook", ""),
        "youtube":         a.get("youtube", ""),
        "categories":      a.get("categories", []),
        "expertise":       a.get("expertise", ""),
        "location":        a.get("location", ""),
        "birth_year":      a.get("birth_year"),
        "books":           a.get("books", []),
        "contributions":   a.get("contributions", []),
        "activities":      a.get("activities", []),
        "articles_count":  a.get("articles_count", 0),
        "followers_count": len(followers),
        "total_views":     a.get("total_views", 0),
        "is_following":    is_following,
        "is_verified":     a.get("is_verified", False),
        "joined_at":       a["joined_at"].isoformat() if isinstance(a.get("joined_at"), datetime) else a.get("joined_at", ""),
        "updated_at":      a["updated_at"].isoformat() if isinstance(a.get("updated_at"), datetime) else a.get("updated_at", ""),
    }

def serialize_author_card(a: dict) -> dict:
    return {
        "id":              str(a["_id"]),
        "username":        a.get("username", ""),
        "slug":            a.get("slug", ""),
        "display_name":    a.get("display_name", ""),
        "pen_name":        a.get("pen_name", ""),
        "tagline":         a.get("tagline", ""),
        "bio":             a.get("bio", ""),
        "avatar":          a.get("avatar", ""),
        "categories":      a.get("categories", []),
        "articles_count":  a.get("articles_count", 0),
        "followers_count": len(a.get("followers", [])),
        "is_verified":     a.get("is_verified", False),
    }

# ─────────────────────────────────────────────
#  SCHEMAS
# ─────────────────────────────────────────────
class RegisterInput(BaseModel):
    username:     str           = Field(..., min_length=3, max_length=30)
    email:        str
    password:     str           = Field(..., min_length=6)
    display_name: Optional[str] = None
    role:         Optional[str] = "user"

class LoginInput(BaseModel):
    email:    str
    password: str

class CommentInput(BaseModel):
    page_id: str = Field(..., description="Unique page id e.g. 'shiv-aarti'")
    text:    str = Field(..., min_length=1, max_length=1000)

class CommentUpdate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=60)
    username:     Optional[str] = Field(None, min_length=3, max_length=30)
    email:        Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class PersonalDetails(BaseModel):
    mobile:  Optional[str]  = Field(None, max_length=20)
    dob:     Optional[str]  = None
    address: Optional[dict] = None

class RoleUpdate(BaseModel):
    role: str = Field(..., description="Must be 'user', 'admin', 'editor', or 'lekhak'")

VALID_ARTICLE_STATUSES = ["draft", "pending_approval", "published", "rejected", "archived"]

class ArticleCreate(BaseModel):
    title:         str            = Field(..., min_length=3, max_length=300)
    subtitle:      Optional[str]  = None
    content:       str            = Field(..., min_length=10)
    excerpt:       Optional[str]  = None
    banner_url:    Optional[str]  = None
    thumbnail_url: Optional[str]  = None
    category:      Optional[str]  = None
    category_slug: Optional[str]  = None
    tags:          Optional[List[str]] = []
    status:        Optional[str]  = "draft"
    read_time:     Optional[int]  = 5
    slug:          Optional[str]  = None

class ArticleUpdate(BaseModel):
    title:            Optional[str]       = Field(None, min_length=3, max_length=300)
    subtitle:         Optional[str]       = None
    content:          Optional[str]       = None
    excerpt:          Optional[str]       = None
    banner_url:       Optional[str]       = None
    thumbnail_url:    Optional[str]       = None
    category:         Optional[str]       = None
    category_slug:    Optional[str]       = None
    tags:             Optional[List[str]] = None
    status:           Optional[str]       = None
    read_time:        Optional[int]       = None
    rejection_reason: Optional[str]       = None

class ArticleSubmitForReview(BaseModel):
    slug: str = Field(..., description="Slug of the article to submit for review")

class ArticleReviewAction(BaseModel):
    action:           str           = Field(..., description="'approve' or 'reject'")
    rejection_reason: Optional[str] = Field(None, description="Required when action is 'reject'")

class AuthorRegisterInput(BaseModel):
    display_name:  str            = Field(..., min_length=2, max_length=100)
    pen_name:      Optional[str]  = Field(None, max_length=100)
    tagline:       Optional[str]  = Field(None, max_length=200)
    bio:           str            = Field(..., min_length=10, max_length=500)
    biography:     Optional[str]  = None
    categories:    Optional[List[str]] = []
    expertise:     Optional[str]  = None
    location:      Optional[str]  = None
    birth_year:    Optional[int]  = None
    website:       Optional[str]  = None
    twitter:       Optional[str]  = None
    instagram:     Optional[str]  = None
    facebook:      Optional[str]  = None
    youtube:       Optional[str]  = None
    slug:          Optional[str]  = None

class AuthorUpdate(BaseModel):
    display_name:  Optional[str] = Field(None, max_length=100)
    pen_name:      Optional[str] = Field(None, max_length=100)
    tagline:       Optional[str] = Field(None, max_length=200)
    bio:           Optional[str] = Field(None, max_length=500)
    biography:     Optional[str] = None
    categories:    Optional[List[str]] = None
    expertise:     Optional[str] = None
    location:      Optional[str] = None
    birth_year:    Optional[int] = None
    website:       Optional[str] = None
    twitter:       Optional[str] = None
    instagram:     Optional[str] = None
    facebook:      Optional[str] = None
    youtube:       Optional[str] = None
    avatar:        Optional[str] = None
    cover_image:   Optional[str] = None

class BookInput(BaseModel):
    title:     str           = Field(..., min_length=1, max_length=255)
    year:      Optional[int] = None
    publisher: Optional[str] = None
    cover_url: Optional[str] = None
    link:      Optional[str] = None

class ContributionInput(BaseModel):
    title:       str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    year:        int

class ActivityInput(BaseModel):
    title:       str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    date:        str

class NotificationTokenInput(BaseModel):
    token:    str = Field(..., min_length=20, max_length=4096)
    platform: Optional[str] = Field("web", max_length=100)

class NotificationSendInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    body:  str = Field(..., min_length=1, max_length=300)
    url:   str = Field("/", max_length=500)

# ─────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────
@app.post("/api/auth/register", status_code=201)
def register(
    body: RegisterInput,
    background_tasks: BackgroundTasks,          # ← CHANGE 3: Added BackgroundTasks
):
    try:
        if not re.match(r"^[a-zA-Z0-9_]+$", body.username):
            raise HTTPException(400, "Username can only contain letters, numbers, underscores")
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
            "role":         "user",
            "author_slug":  None,
            "created_at":   datetime.utcnow(),
        }
        result     = users_col.insert_one(doc)
        doc["_id"] = result.inserted_id
        token      = create_token({"sub": str(result.inserted_id)})

        # ── CHANGE 4: Queue welcome email (non-blocking background task) ──────
        # Runs AFTER the HTTP response is sent — registration stays fast.
        # Email failure logs an error but never prevents user creation.
        background_tasks.add_task(
            send_welcome_email,
            to_email     = doc["email"],
            display_name = doc.get("display_name") or doc["username"],
            username     = doc["username"],
        )
        # ─────────────────────────────────────────────────────────────────────

        return {"token": token, "user": serialize_user(doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
def me(current_user=Depends(require_user)):
    return serialize_user(current_user)

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
        updates["avatar"]   = body.username[0].upper()
    if body.email is not None:
        existing = users_col.find_one({"email": body.email.lower()})
        if existing and str(existing["_id"]) != str(current_user["_id"]):
            raise HTTPException(400, "Email already registered")
        updates["email"] = body.email.lower()
    if not updates:
        raise HTTPException(400, "Nothing to update")
    updates["updated_at"] = datetime.utcnow()
    users_col.update_one({"_id": current_user["_id"]}, {"$set": updates})
    return serialize_user(users_col.find_one({"_id": current_user["_id"]}))

@app.post("/api/auth/password")
def change_password(body: PasswordChange, current_user=Depends(require_user)):
    if not verify_password(body.old_password, current_user["password"]):
        raise HTTPException(400, "Current password is incorrect")
    users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(body.new_password), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password updated successfully"}

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
    return serialize_user(users_col.find_one({"_id": current_user["_id"]}))

# ─────────────────────────────────────────────
#  USER ROUTES
# ─────────────────────────────────────────────
PAGE_TITLES: dict = {}

@app.get("/api/users/{user_id}/comments")
def get_user_comments(
    user_id: str,
    skip:    int = 0,
    limit:   int = 50,
    creds:   HTTPAuthorizationCredentials = Depends(bearer),
):
    try:
        ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user id")
    current_user = get_current_user(creds)
    uid          = str(current_user["_id"]) if current_user else None
    cursor       = comments_col.find({"user_id": user_id}).sort("created_at", DESCENDING).skip(skip).limit(limit)
    total        = comments_col.count_documents({"user_id": user_id})
    comments     = []
    for c in cursor:
        s               = serialize_comment(c, uid)
        s["page_title"] = PAGE_TITLES.get(c["page_id"], c["page_id"])
        comments.append(s)
    unique_pages = comments_col.distinct("page_id", {"user_id": user_id})
    page_summary = [{"page_id": p, "page_title": PAGE_TITLES.get(p, p)} for p in unique_pages]
    return {"total": total, "pages": page_summary, "comments": comments}

@app.get("/api/users/{user_id}/profile")
def get_public_profile(user_id: str):
    try:
        uid_obj = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user id")
    user = users_col.find_one({"_id": uid_obj})
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id":           str(user["_id"]),
        "username":     user["username"],
        "display_name": user.get("display_name", user["username"]),
        "avatar":       user.get("avatar", user["username"][0].upper()),
        "created_at":   user["created_at"].isoformat(),
        "is_author":    user.get("role") in ["lekhak", "admin", "editor"],
        "author_slug":  user.get("author_slug"),
        "stats": {
            "comments": comments_col.count_documents({"user_id": user_id}),
            "pages":    len(comments_col.distinct("page_id", {"user_id": user_id})),
        },
    }

# ─────────────────────────────────────────────
#  COMMENT ROUTES
# ─────────────────────────────────────────────
@app.get("/api/comments/{page_id}")
def get_comments(
    page_id: str,
    skip:    int = 0,
    limit:   int = 20,
    creds:   HTTPAuthorizationCredentials = Depends(bearer),
):
    current_user = get_current_user(creds)
    uid          = str(current_user["_id"]) if current_user else None
    cursor       = comments_col.find({"page_id": page_id}).sort("created_at", DESCENDING).skip(skip).limit(limit)
    total        = comments_col.count_documents({"page_id": page_id})
    return {"total": total, "comments": [serialize_comment(c, uid) for c in cursor]}

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
    result     = comments_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_comment(doc, str(current_user["_id"]))

@app.put("/api/comments/{comment_id}")
def update_comment(comment_id: str, body: CommentUpdate, current_user=Depends(require_user)):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")
    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if comment["user_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Cannot edit another user's comment")
    comments_col.update_one({"_id": oid}, {"$set": {"text": body.text.strip(), "updated_at": datetime.utcnow()}})
    return serialize_comment(comments_col.find_one({"_id": oid}), str(current_user["_id"]))

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

@app.post("/api/comments/{comment_id}/like")
def toggle_like(comment_id: str, current_user=Depends(require_user)):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")
    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")
    uid   = str(current_user["_id"])
    likes = comment.get("likes", [])
    if uid in likes:
        comments_col.update_one({"_id": oid}, {"$pull": {"likes": uid}})
    else:
        comments_col.update_one({"_id": oid}, {"$push": {"likes": uid}})
    return serialize_comment(comments_col.find_one({"_id": oid}), uid)

# ─────────────────────────────────────────────
#  POSTS ROUTES
# ─────────────────────────────────────────────
@app.get("/api/posts/latest")
def get_latest_posts(limit: int = 15, skip: int = 0):
    try:
        limit  = min(int(limit), 20)
        skip   = max(int(skip),  0)
        cursor = vidyapati_posts_col.find({}).sort([("createdAt", DESCENDING), ("updatedAt", DESCENDING)]).skip(skip).limit(limit)
        posts  = [serialize_post(p) for p in cursor]
        total  = vidyapati_posts_col.count_documents({})
        return {"posts": posts, "total": total, "limit": limit, "skip": skip}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts/featured")
def get_featured_posts(limit: int = 15):
    try:
        limit  = min(int(limit), 20)
        cursor = vidyapati_posts_col.find({"featured": True}).sort("updatedAt", DESCENDING).limit(limit)
        posts  = [serialize_post(p) for p in cursor]
        total  = vidyapati_posts_col.count_documents({"featured": True})
        return {"posts": posts, "total": total, "limit": limit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts/search")
def search_posts(q: str = "", category: str = "", limit: int = 10):
    try:
        limit = min(int(limit), 50)
        query: dict = {}
        if q:
            query["$or"] = [
                {"name":    {"$regex": q, "$options": "i"}},
                {"eng":     {"$regex": q, "$options": "i"}},
                {"preview": {"$regex": q, "$options": "i"}},
            ]
        if category:
            query["category"] = category
        cursor = vidyapati_posts_col.find(query).sort("createdAt", DESCENDING).limit(limit)
        posts  = [serialize_post(p) for p in cursor]
        total  = vidyapati_posts_col.count_documents(query)
        return {"posts": posts, "total": total, "query": q, "category": category, "limit": limit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts/{post_id}")
def get_post_detail(post_id: str):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(400, "Invalid post id")
    post = vidyapati_posts_col.find_one({"_id": oid})
    if not post:
        raise HTTPException(404, "Post not found")
    return serialize_post(post)

# ─────────────────────────────────────────────
#  ARTICLES ROUTES
# ─────────────────────────────────────────────
@app.get("/api/articles")
def list_articles(
    skip:     int           = 0,
    limit:    int           = 10,
    category: Optional[str] = None,
    tag:      Optional[str] = None,
    status:   Optional[str] = None,
    creds:    HTTPAuthorizationCredentials = Depends(bearer),
):
    limit = min(int(limit), 50)
    skip  = max(int(skip),  0)
    current_user = get_current_user(creds)
    role         = current_user.get("role", "user") if current_user else "public"
    is_admin     = role in ["admin", "editor"]
    is_lekhak    = role == "lekhak"

    if is_admin and status and status in VALID_ARTICLE_STATUSES:
        query: dict = {"status": status}
    elif is_lekhak and status and status in VALID_ARTICLE_STATUSES:
        query = {"status": status, "author_id": str(current_user["_id"])}
    elif is_lekhak and not status:
        query = {"author_id": str(current_user["_id"])}
    else:
        query = {"status": "published"}

    if category:
        query["category_slug"] = category
    if tag:
        query["tags"] = tag

    cursor   = articles_col.find(query, {"content": 0}).sort("published_at", DESCENDING).skip(skip).limit(limit)
    articles = [serialize_article(a, full=False) for a in cursor]
    total    = articles_col.count_documents(query)
    return {"articles": articles, "total": total, "limit": limit, "skip": skip}


@app.get("/api/articles/popular")
def get_popular_articles(limit: int = 6):
    limit  = min(int(limit), 20)
    cursor = articles_col.find({"status": "published"}, {"content": 0}).sort("view_count", DESCENDING).limit(limit)
    return {"articles": [serialize_article(a, full=False) for a in cursor]}


@app.get("/api/articles/latest")
def get_latest_articles(limit: int = 5):
    limit  = min(int(limit), 20)
    cursor = articles_col.find({"status": "published"}, {"content": 0}).sort("published_at", DESCENDING).limit(limit)
    return {"articles": [serialize_article(a, full=False) for a in cursor]}


@app.get("/api/articles/categories")
def get_categories():
    pipeline = [
        {"$match": {"status": "published"}},
        {"$group": {"_id": "$category_slug", "name": {"$first": "$category"}, "article_count": {"$sum": 1}}},
        {"$sort": {"article_count": -1}},
    ]
    result = list(articles_col.aggregate(pipeline))
    return {"categories": [{"slug": r["_id"], "name": r["name"], "count": r["article_count"]} for r in result if r["_id"]]}


@app.get("/api/articles/search")
def search_articles(q: str = "", limit: int = 10):
    limit = min(int(limit), 50)
    if not q:
        return {"articles": [], "total": 0}
    query = {
        "status": "published",
        "$or": [
            {"title":    {"$regex": q, "$options": "i"}},
            {"subtitle": {"$regex": q, "$options": "i"}},
            {"excerpt":  {"$regex": q, "$options": "i"}},
            {"tags":     {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
        ],
    }
    cursor   = articles_col.find(query, {"content": 0}).sort("view_count", DESCENDING).limit(limit)
    articles = [serialize_article(a, full=False) for a in cursor]
    total    = articles_col.count_documents(query)
    return {"articles": articles, "total": total, "query": q}


@app.get("/api/articles/pending")
def get_pending_articles(
    skip:  int = 0,
    limit: int = 20,
    current_user=Depends(require_super_admin),
):
    limit  = min(int(limit), 50)
    skip   = max(int(skip), 0)
    query  = {"status": "pending_approval"}
    cursor = articles_col.find(query, {"content": 0}).sort("submitted_at", 1).skip(skip).limit(limit)
    total  = articles_col.count_documents(query)
    return {
        "articles": [serialize_article(a, full=False) for a in cursor],
        "total":    total,
        "limit":    limit,
        "skip":     skip,
    }


@app.get("/api/articles/my")
def get_my_articles(
    skip:   int           = 0,
    limit:  int           = 20,
    status: Optional[str] = None,
    current_user=Depends(require_user),
):
    limit = min(int(limit), 50)
    skip  = max(int(skip), 0)

    query: dict = {"author_id": str(current_user["_id"])}
    if status and status in VALID_ARTICLE_STATUSES:
        query["status"] = status

    cursor   = articles_col.find(query, {"content": 0}).sort("updated_at", DESCENDING).skip(skip).limit(limit)
    articles = [serialize_article(a, full=False) for a in cursor]
    total    = articles_col.count_documents(query)
    return {"articles": articles, "total": total, "limit": limit, "skip": skip}


@app.get("/api/articles/{slug}")
def get_article_by_slug(slug: str, creds: HTTPAuthorizationCredentials = Depends(bearer)):
    current_user = get_current_user(creds)
    role         = current_user.get("role", "user") if current_user else "public"
    is_admin     = role in ["admin", "editor"]
    is_lekhak    = role == "lekhak"

    query = {"slug": slug}
    if not is_admin:
        if not is_lekhak:
            query["status"] = "published"

    article = articles_col.find_one(query)
    if not article:
        raise HTTPException(404, "Article not found")

    if is_lekhak and article.get("status") != "published":
        if article.get("author_id") != str(current_user["_id"]):
            raise HTTPException(403, "Access denied")

    articles_col.update_one({"_id": article["_id"]}, {"$inc": {"view_count": 1}})
    article["view_count"] = article.get("view_count", 0) + 1
    return serialize_article(article, full=True)


@app.post("/api/articles", status_code=201)
def create_article(body: ArticleCreate, current_user=Depends(require_admin)):
    slug = body.slug if body.slug else make_slug(body.title)
    if articles_col.find_one({"slug": slug}):
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    excerpt = body.excerpt
    if not excerpt and body.content:
        plain   = re.sub(r"<[^>]+>", " ", body.content)
        plain   = re.sub(r"\s+", " ", plain).strip()
        excerpt = plain[:200] + ("..." if len(plain) > 200 else "")

    author_doc  = authors_col.find_one({"user_id": str(current_user["_id"])})
    author_slug = author_doc["slug"] if author_doc else ""
    role        = current_user.get("role", "user")
    is_admin    = role in ["admin", "editor"]
    now         = datetime.utcnow()

    if is_admin and body.status in VALID_ARTICLE_STATUSES:
        initial_status = body.status
    else:
        initial_status = "draft"

    doc = {
        "title":           body.title.strip(),
        "slug":            slug,
        "subtitle":        body.subtitle or "",
        "content":         body.content,
        "excerpt":         excerpt,
        "banner_url":      body.banner_url    or "",
        "thumbnail_url":   body.thumbnail_url or "",
        "author_id":       str(current_user["_id"]),
        "author_username": current_user["username"],
        "author_avatar":   current_user.get("avatar", current_user["avatar"]),
        "author_slug":     author_slug,
        "author_bio" :     authors_col.find_one({"user_id": current_user["_id"]})["bio"],
        "category":        body.category      or "",
        "category_slug":   body.category_slug or (make_slug(body.category) if body.category else ""),
        "tags":            body.tags          or [],
        "status":          initial_status,
        "read_time":       body.read_time     or 5,
        "view_count":      0,
        "like_count":      0,
        "likes":           [],
        "rejection_reason": None,
        "submitted_at":     None,
        "approved_at":      now if initial_status == "published" else None,
        "approved_by":      str(current_user["_id"]) if initial_status == "published" else None,
        "published_at":     now if initial_status == "published" else None,
        "created_at":       now,
        "updated_at":       now,
    }

    result     = articles_col.insert_one(doc)
    doc["_id"] = result.inserted_id

    if author_doc and initial_status == "published":
        authors_col.update_one({"_id": author_doc["_id"]}, {"$inc": {"articles_count": 1}})

    return serialize_article(doc, full=True)


@app.put("/api/articles/{slug}")
def update_article(slug: str, body: ArticleUpdate, current_user=Depends(require_admin)):
    article = articles_col.find_one({"slug": slug})
    if not article:
        raise HTTPException(404, "Article not found")

    role     = current_user.get("role", "user")
    is_admin = role in ["admin", "editor"]

    if not is_admin:
        if article.get("author_id") != str(current_user["_id"]):
            raise HTTPException(403, "आपको यह लेख संपादित करने की अनुमति नहीं है")
        if article.get("status") not in ["draft", "rejected"]:
            raise HTTPException(403, "केवल ड्राफ्ट या अस्वीकृत लेख संपादित किए जा सकते हैं")
        if body.status is not None:
            raise HTTPException(403, "आप लेख की स्थिति इस तरह नहीं बदल सकते। /submit का उपयोग करें।")

    updates: dict = {"updated_at": datetime.utcnow()}
    if body.title         is not None: updates["title"]         = body.title.strip()
    if body.subtitle      is not None: updates["subtitle"]      = body.subtitle
    if body.content       is not None: updates["content"]       = body.content
    if body.excerpt       is not None: updates["excerpt"]       = body.excerpt
    if body.banner_url    is not None: updates["banner_url"]    = body.banner_url
    if body.thumbnail_url is not None: updates["thumbnail_url"] = body.thumbnail_url
    if body.category      is not None:
        updates["category"]      = body.category
        updates["category_slug"] = body.category_slug or make_slug(body.category)
    if body.tags          is not None: updates["tags"]      = body.tags
    if body.read_time     is not None: updates["read_time"] = body.read_time

    if is_admin and body.status is not None and body.status in VALID_ARTICLE_STATUSES:
        updates["status"] = body.status
        if body.status == "published" and not article.get("published_at"):
            updates["published_at"] = datetime.utcnow()
            updates["approved_at"]  = datetime.utcnow()
            updates["approved_by"]  = str(current_user["_id"])
            updates["rejection_reason"] = None
        elif body.status == "rejected":
            if not body.rejection_reason:
                raise HTTPException(400, "अस्वीकृति के लिए कारण आवश्यक है")
            updates["rejection_reason"] = body.rejection_reason
            updates["approved_at"]      = None
            updates["approved_by"]      = None

    articles_col.update_one({"slug": slug}, {"$set": updates})
    updated = articles_col.find_one({"slug": slug})
    return serialize_article(updated, full=True)


@app.delete("/api/articles/{slug}", status_code=204)
def delete_article(slug: str, current_user=Depends(require_user)):
    article = articles_col.find_one({"slug": slug})
    if not article:
        raise HTTPException(404, "Article not found")

    role     = current_user.get("role", "user")
    is_admin = role in ["admin", "editor"]

    if not is_admin:
        if article.get("author_id") != str(current_user["_id"]):
            raise HTTPException(403, "आपको यह लेख हटाने की अनुमति नहीं है")
        if article.get("status") not in ["draft", "rejected"]:
            raise HTTPException(403, "केवल ड्राफ्ट या अस्वीकृत लेख हटाए जा सकते हैं")

    articles_col.delete_one({"slug": slug})
    comments_col.delete_many({"page_id": slug})


@app.post("/api/articles/{slug}/like")
def toggle_article_like(slug: str, current_user=Depends(require_user)):
    article = articles_col.find_one({"slug": slug, "status": "published"})
    if not article:
        raise HTTPException(404, "Article not found")
    uid   = str(current_user["_id"])
    likes = article.get("likes", [])
    if uid in likes:
        articles_col.update_one({"slug": slug}, {"$pull": {"likes": uid}, "$inc": {"like_count": -1}})
        liked = False
    else:
        articles_col.update_one({"slug": slug}, {"$push": {"likes": uid}, "$inc": {"like_count": 1}})
        liked = True
    updated = articles_col.find_one({"slug": slug})
    return {"liked": liked, "like_count": updated.get("like_count", 0)}


@app.patch("/api/articles/{slug}/status")
def change_article_status(slug: str, body: dict, current_user=Depends(require_admin)):
    new_status = body.get("status")
    if new_status not in VALID_ARTICLE_STATUSES:
        raise HTTPException(400, f"Status must be one of: {', '.join(VALID_ARTICLE_STATUSES)}")
    article = articles_col.find_one({"slug": slug})
    if not article:
        raise HTTPException(404, "Article not found")
    updates = {"status": new_status, "updated_at": datetime.utcnow()}
    if new_status == "published" and not article.get("published_at"):
        updates["published_at"] = datetime.utcnow()
        updates["approved_at"]  = datetime.utcnow()
        updates["approved_by"]  = str(current_user["_id"])
        updates["rejection_reason"] = None
    articles_col.update_one({"slug": slug}, {"$set": updates})
    return {"slug": slug, "status": new_status}


@app.post("/api/articles/{slug}/submit")
def submit_article_for_review(slug: str, current_user=Depends(require_user)):
    article = articles_col.find_one({"slug": slug})
    if not article:
        raise HTTPException(404, "Article not found")

    if article.get("author_id") != str(current_user["_id"]):
        raise HTTPException(403, "यह आपका लेख नहीं है")

    if article.get("status") not in ["draft", "rejected"]:
        raise HTTPException(400, f"केवल ड्राफ्ट या अस्वीकृत लेख समीक्षा के लिए भेजे जा सकते हैं। वर्तमान स्थिति: {article.get('status')}")

    now = datetime.utcnow()
    articles_col.update_one(
        {"slug": slug},
        {"$set": {
            "status":           "pending_approval",
            "submitted_at":     now,
            "rejection_reason": None,
            "updated_at":       now,
        }}
    )
    updated = articles_col.find_one({"slug": slug})
    return {
        "message":      "लेख समीक्षा के लिए भेज दिया गया है",
        "slug":         slug,
        "status":       "pending_approval",
        "submitted_at": now.isoformat(),
        "article":      serialize_article(updated, full=False),
    }


@app.post("/api/articles/{slug}/review")
def review_article(slug: str, body: ArticleReviewAction, current_user=Depends(require_super_admin)):
    if body.action not in ["approve", "reject"]:
        raise HTTPException(400, "action must be 'approve' or 'reject'")

    article = articles_col.find_one({"slug": slug})
    if not article:
        raise HTTPException(404, "Article not found")

    if article.get("status") != "pending_approval":
        raise HTTPException(400, f"केवल 'pending_approval' लेखों की समीक्षा की जा सकती है। वर्तमान स्थिति: {article.get('status')}")

    now     = datetime.utcnow()
    updates = {"updated_at": now}

    if body.action == "approve":
        updates["status"]           = "published"
        updates["approved_at"]      = now
        updates["approved_by"]      = str(current_user["_id"])
        updates["rejection_reason"] = None
        if not article.get("published_at"):
            updates["published_at"] = now

        author_doc = authors_col.find_one({"user_id": article.get("author_id")})
        if author_doc:
            authors_col.update_one({"_id": author_doc["_id"]}, {"$inc": {"articles_count": 1}})

        message = "लेख प्रकाशित कर दिया गया है"

    else:
        if not body.rejection_reason or not body.rejection_reason.strip():
            raise HTTPException(400, "अस्वीकृति के लिए कारण आवश्यक है")
        updates["status"]           = "rejected"
        updates["rejection_reason"] = body.rejection_reason.strip()
        updates["approved_at"]      = None
        updates["approved_by"]      = None
        message = "लेख अस्वीकृत कर दिया गया है"

    articles_col.update_one({"slug": slug}, {"$set": updates})
    updated = articles_col.find_one({"slug": slug})
    return {
        "message": message,
        "slug":    slug,
        "status":  updates["status"],
        "article": serialize_article(updated, full=False),
    }


# ─────────────────────────────────────────────
#  LEKHAK (AUTHORS) ROUTES   /api/lekhak
# ─────────────────────────────────────────────

@app.post("/api/lekhak/register", status_code=201)
def register_as_lekhak(
    body: AuthorRegisterInput,
    current_user=Depends(require_user),
):
    uid = str(current_user["_id"])

    if authors_col.find_one({"user_id": uid}):
        raise HTTPException(409, "आप पहले से एक लेखक हैं")

    base_slug = body.slug if body.slug else make_author_slug(body.display_name, current_user["username"])
    slug      = base_slug
    counter   = 1
    while authors_col.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    now = datetime.utcnow()
    doc = {
        "user_id":        uid,
        "username":       current_user["username"],
        "slug":           slug,
        "display_name":   body.display_name.strip(),
        "pen_name":       body.pen_name or "",
        "tagline":        body.tagline  or "",
        "bio":            body.bio.strip(),
        "biography":      body.biography or "",
        "avatar":         current_user.get("avatar", current_user["avatar"]),
        "cover_image":    "",
        "website":        body.website   or "",
        "twitter":        body.twitter   or "",
        "instagram":      body.instagram or "",
        "facebook":       body.facebook  or "",
        "youtube":        body.youtube   or "",
        "categories":     body.categories or [],
        "expertise":      body.expertise  or "",
        "location":       body.location   or "",
        "birth_year":     body.birth_year,
        "books":          [],
        "contributions":  [],
        "activities":     [],
        "articles_count": articles_col.count_documents({"author_id": uid, "status": "published"}),
        "followers":      [],
        "total_views":    0,
        "is_verified":    False,
        "joined_at":      now,
        "updated_at":     now,
    }

    result     = authors_col.insert_one(doc)
    doc["_id"] = result.inserted_id

    users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"role": "lekhak", "author_slug": slug, "updated_at": now}}
    )

    return {
        **serialize_author(doc),
        "message":     "बधाई हो! आपकी लेखक प्रोफ़ाइल बन गई।",
        "profile_url": f"author-profile.html?slug={slug}",
    }


@app.get("/api/lekhak")
def list_lekhak(
    skip:     int           = 0,
    limit:    int           = 20,
    category: Optional[str] = None,
    search:   Optional[str] = None,
    creds:    HTTPAuthorizationCredentials = Depends(bearer),
):
    limit = min(int(limit), 50)
    skip  = max(int(skip),  0)

    query: dict = {}
    if category:
        query["categories"] = category
    if search:
        query["$or"] = [
            {"display_name": {"$regex": search, "$options": "i"}},
            {"pen_name":     {"$regex": search, "$options": "i"}},
            {"username":     {"$regex": search, "$options": "i"}},
            {"bio":          {"$regex": search, "$options": "i"}},
        ]

    cursor  = authors_col.find(query, {"books": 0, "contributions": 0, "activities": 0, "biography": 0}).sort("followers_count", DESCENDING).skip(skip).limit(limit)
    authors = [serialize_author_card(a) for a in cursor]
    total   = authors_col.count_documents(query)
    return {"authors": authors, "total": total, "limit": limit, "skip": skip}


@app.get("/api/lekhak/me")
def get_my_author_profile(current_user=Depends(require_user)):
    uid    = str(current_user["_id"])
    author = authors_col.find_one({"user_id": uid})
    if not author:
        raise HTTPException(404, "आपकी लेखक प्रोफ़ाइल नहीं है। पहले /api/lekhak/register करें।")
    return serialize_author(author, current_user_id=uid)


@app.get("/api/lekhak/{slug}")
def get_lekhak_by_slug(
    slug: str,
    creds: HTTPAuthorizationCredentials = Depends(bearer),
):
    author = authors_col.find_one({"slug": slug})
    if not author:
        raise HTTPException(404, "लेखक नहीं मिला")
    current_user    = get_current_user(creds)
    current_user_id = str(current_user["_id"]) if current_user else None
    return serialize_author(author, current_user_id=current_user_id)


@app.get("/api/lekhak/{slug}/articles")
def get_lekhak_articles(
    slug:  str,
    skip:  int = 0,
    limit: int = 20,
):
    limit  = min(int(limit), 50)
    skip   = max(int(skip),  0)
    author = authors_col.find_one({"slug": slug})
    if not author:
        raise HTTPException(404, "लेखक नहीं मिला")
    query  = {"author_id": author["user_id"], "status": "published"}
    cursor = articles_col.find(query, {"content": 0}).sort("published_at", DESCENDING).skip(skip).limit(limit)
    total  = articles_col.count_documents(query)
    return {
        "articles": [serialize_article(a, full=False) for a in cursor],
        "total":    total,
    }


@app.patch("/api/lekhak/me")
def update_my_author_profile(
    body: AuthorUpdate,
    current_user=Depends(require_user),
):
    uid    = str(current_user["_id"])
    author = authors_col.find_one({"user_id": uid})
    if not author:
        raise HTTPException(404, "लेखक प्रोफ़ाइल नहीं मिली")

    updates: dict = {"updated_at": datetime.utcnow()}
    for field in ["display_name", "pen_name", "tagline", "bio", "biography",
                  "categories", "expertise", "location", "birth_year",
                  "website", "twitter", "instagram", "facebook", "youtube",
                  "avatar", "cover_image"]:
        val = getattr(body, field, None)
        if val is not None:
            updates[field] = val

    authors_col.update_one({"_id": author["_id"]}, {"$set": updates})

    if body.display_name:
        users_col.update_one({"_id": current_user["_id"]}, {"$set": {"display_name": body.display_name}})

    updated = authors_col.find_one({"_id": author["_id"]})
    return serialize_author(updated, current_user_id=uid)


@app.post("/api/lekhak/me/books", status_code=201)
def add_book(body: BookInput, current_user=Depends(require_user)):
    uid    = str(current_user["_id"])
    author = authors_col.find_one({"user_id": uid})
    if not author:
        raise HTTPException(404, "लेखक प्रोफ़ाइल नहीं मिली")
    book = {
        "id":        str(ObjectId()),
        "title":     body.title,
        "year":      body.year,
        "publisher": body.publisher or "",
        "cover_url": body.cover_url or "",
        "link":      body.link or "",
    }
    authors_col.update_one({"_id": author["_id"]}, {"$push": {"books": book}, "$set": {"updated_at": datetime.utcnow()}})
    return {"book": book, "message": "किताब जोड़ी गई"}

@app.delete("/api/lekhak/me/books/{book_id}", status_code=204)
def delete_book(book_id: str, current_user=Depends(require_user)):
    uid = str(current_user["_id"])
    authors_col.update_one({"user_id": uid}, {"$pull": {"books": {"id": book_id}}})

@app.post("/api/lekhak/me/contributions", status_code=201)
def add_contribution(body: ContributionInput, current_user=Depends(require_user)):
    uid    = str(current_user["_id"])
    author = authors_col.find_one({"user_id": uid})
    if not author:
        raise HTTPException(404, "लेखक प्रोफ़ाइल नहीं मिली")
    item = {"id": str(ObjectId()), "title": body.title, "description": body.description, "year": body.year}
    authors_col.update_one({"_id": author["_id"]}, {"$push": {"contributions": item}, "$set": {"updated_at": datetime.utcnow()}})
    return {"contribution": item, "message": "योगदान जोड़ा गया"}

@app.delete("/api/lekhak/me/contributions/{item_id}", status_code=204)
def delete_contribution(item_id: str, current_user=Depends(require_user)):
    uid = str(current_user["_id"])
    authors_col.update_one({"user_id": uid}, {"$pull": {"contributions": {"id": item_id}}})

@app.post("/api/lekhak/me/activities", status_code=201)
def add_activity(body: ActivityInput, current_user=Depends(require_user)):
    uid    = str(current_user["_id"])
    author = authors_col.find_one({"user_id": uid})
    if not author:
        raise HTTPException(404, "लेखक प्रोफ़ाइल नहीं मिली")
    item = {"id": str(ObjectId()), "title": body.title, "description": body.description, "date": body.date}
    authors_col.update_one({"_id": author["_id"]}, {"$push": {"activities": item}, "$set": {"updated_at": datetime.utcnow()}})
    return {"activity": item, "message": "गतिविधि जोड़ी गई"}

@app.delete("/api/lekhak/me/activities/{item_id}", status_code=204)
def delete_activity(item_id: str, current_user=Depends(require_user)):
    uid = str(current_user["_id"])
    authors_col.update_one({"user_id": uid}, {"$pull": {"activities": {"id": item_id}}})

@app.post("/api/lekhak/{slug}/follow")
def toggle_follow(slug: str, current_user=Depends(require_user)):
    author = authors_col.find_one({"slug": slug})
    if not author:
        raise HTTPException(404, "लेखक नहीं मिला")
    uid       = str(current_user["_id"])
    followers = author.get("followers", [])
    if uid in followers:
        authors_col.update_one({"slug": slug}, {"$pull": {"followers": uid}})
        is_following = False
    else:
        authors_col.update_one({"slug": slug}, {"$push": {"followers": uid}})
        is_following = True
    updated = authors_col.find_one({"slug": slug})
    return {
        "is_following":    is_following,
        "followers_count": len(updated.get("followers", [])),
        "message":         "अनुसरण की स्थिति बदली",
    }

# ─────────────────────────────────────────────
#  ADMIN DASHBOARD ROUTES
# ─────────────────────────────────────────────
def get_firebase_messaging():
    try:
        import firebase_admin
        from firebase_admin import credentials, messaging
    except ImportError:
        raise HTTPException(503, "firebase-admin is not installed")

    try:
        firebase_admin.get_app()
    except ValueError:
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account_json:
            try:
                service_account = json.loads(service_account_json)
                firebase_admin.initialize_app(credentials.Certificate(service_account))
            except (ValueError, TypeError, json.JSONDecodeError) as exc:
                raise HTTPException(503, f"Invalid FIREBASE_SERVICE_ACCOUNT_JSON: {exc}")
        else:
            try:
                firebase_admin.initialize_app()
            except Exception:
                raise HTTPException(
                    503,
                    "Firebase credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON "
                    "or GOOGLE_APPLICATION_CREDENTIALS.",
                )
    return messaging

@app.post("/api/notifications/token")
def save_notification_token(
    body: NotificationTokenInput,
    request: Request,
    current_user=Depends(get_current_user),
):
    now = datetime.utcnow()
    notification_tokens_col.update_one(
        {"token": body.token},
        {
            "$set": {
                "platform": body.platform or "web",
                "user_id": str(current_user["_id"]) if current_user else None,
                "user_agent": request.headers.get("user-agent", "")[:500],
                "updated_at": now,
                "active": True,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    return {"status": "saved"}

@app.delete("/api/notifications/token")
def delete_notification_token(body: NotificationTokenInput):
    notification_tokens_col.delete_one({"token": body.token})
    return {"status": "deleted"}

@app.post("/api/admin/notifications/send")
def send_push_notification(
    body: NotificationSendInput,
    current_user=Depends(require_super_admin),
):
    if not (body.url.startswith("/") or body.url.startswith("https://")):
        raise HTTPException(400, "URL must start with / or https://")

    messaging = get_firebase_messaging()
    tokens = [
        doc["token"]
        for doc in notification_tokens_col.find({"active": True}, {"token": 1})
        if doc.get("token")
    ]
    if not tokens:
        return {"success": 0, "failed": 0, "removed": 0, "total": 0}

    click_url = body.url if body.url.startswith("https://") else f"https://www.shivmarg.live{body.url}"
    success = failed = 0
    invalid_tokens = []

    for start in range(0, len(tokens), 500):
        chunk = tokens[start:start + 500]
        message = messaging.MulticastMessage(
            tokens=chunk,
            data={"title": body.title, "body": body.body, "url": click_url},
            webpush=messaging.WebpushConfig(
                headers={"Urgency": "high"},
                fcm_options=messaging.WebpushFCMOptions(link=click_url),
            ),
        )
        response = messaging.send_each_for_multicast(message)
        success += response.success_count
        failed += response.failure_count
        for token, item in zip(chunk, response.responses):
            if item.success:
                continue
            error_text = str(item.exception).lower()
            if "registration-token-not-registered" in error_text or "invalid-registration-token" in error_text:
                invalid_tokens.append(token)

    if invalid_tokens:
        notification_tokens_col.delete_many({"token": {"$in": invalid_tokens}})

    return {
        "success": success,
        "failed": failed,
        "removed": len(invalid_tokens),
        "total": len(tokens),
        "sent_by": str(current_user["_id"]),
    }

@app.get("/api/admin/dashboard/stats")
def get_dashboard_stats(current_user=Depends(require_admin)):
    try:
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        return {
            "total_users":            users_col.count_documents({}),
            "total_comments":         comments_col.count_documents({}),
            "total_posts":            vidyapati_posts_col.count_documents({}),
            "featured_posts":         vidyapati_posts_col.count_documents({"featured": True}),
            "total_articles":         articles_col.count_documents({}),
            "published_articles":     articles_col.count_documents({"status": "published"}),
            "draft_articles":         articles_col.count_documents({"status": "draft"}),
            "pending_articles":       articles_col.count_documents({"status": "pending_approval"}),
            "rejected_articles":      articles_col.count_documents({"status": "rejected"}),
            "archived_articles":      articles_col.count_documents({"status": "archived"}),
            "total_authors":          authors_col.count_documents({}),
            "recent_users_7d":        users_col.count_documents({"created_at":    {"$gte": seven_days_ago}}),
            "recent_comments_7d":     comments_col.count_documents({"created_at": {"$gte": seven_days_ago}}),
            "recent_articles_7d":     articles_col.count_documents({"created_at": {"$gte": seven_days_ago}}),
            "recent_authors_7d":      authors_col.count_documents({"joined_at":   {"$gte": seven_days_ago}}),
            "pending_articles_7d":    articles_col.count_documents({"status": "pending_approval", "submitted_at": {"$gte": seven_days_ago}}),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users")
def get_all_users(skip: int = 0, limit: int = 100, role: Optional[str] = None, current_user=Depends(require_admin)):
    try:
        limit = min(int(limit), 100)
        skip  = max(int(skip),  0)
        query: dict = {}
        if role and role in ["user", "admin", "editor", "lekhak"]:
            query["role"] = role
        cursor = users_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
        users  = [serialize_user(u) for u in cursor]
        total  = users_col.count_documents(query)
        return {"users": users, "total": total, "limit": limit, "skip": skip}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/comments")
def get_all_comments(skip: int = 0, limit: int = 50, page_id: Optional[str] = None, current_user=Depends(require_admin)):
    try:
        limit = min(int(limit), 50)
        skip  = max(int(skip),  0)
        query: dict = {}
        if page_id:
            query["page_id"] = page_id
        cursor   = comments_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
        comments = [serialize_comment(c, str(current_user["_id"])) for c in cursor]
        total    = comments_col.count_documents(query)
        pages    = comments_col.distinct("page_id", {})
        return {"comments": comments, "total": total, "pages": pages, "limit": limit, "skip": skip}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/posts")
def get_all_posts(skip: int = 0, limit: int = 50, category: Optional[str] = None, current_user=Depends(require_admin)):
    try:
        limit = min(int(limit), 50)
        skip  = max(int(skip),  0)
        query: dict = {}
        if category:
            query["category"] = category
        cursor     = vidyapati_posts_col.find(query).sort("createdAt", DESCENDING).skip(skip).limit(limit)
        posts      = [serialize_post(p) for p in cursor]
        total      = vidyapati_posts_col.count_documents(query)
        categories = vidyapati_posts_col.distinct("category", {})
        return {"posts": posts, "total": total, "categories": categories, "limit": limit, "skip": skip}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(user_id: str, body: RoleUpdate, current_user=Depends(require_super_admin)):
    try:
        if body.role not in ["user", "admin", "editor", "lekhak"]:
            raise HTTPException(400, "Invalid role")
        oid  = ObjectId(user_id)
        user = users_col.find_one({"_id": oid})
        if not user:
            raise HTTPException(404, "User not found")
        users_col.update_one({"_id": oid}, {"$set": {"role": body.role, "updated_at": datetime.utcnow()}})
        return serialize_user(users_col.find_one({"_id": oid}))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/comments/{comment_id}")
def admin_delete_comment(comment_id: str, current_user=Depends(require_admin)):
    try:
        oid = ObjectId(comment_id)
    except Exception:
        raise HTTPException(400, "Invalid comment id")
    comment = comments_col.find_one({"_id": oid})
    if not comment:
        raise HTTPException(404, "Comment not found")
    comments_col.delete_one({"_id": oid})
    return {"status": "deleted", "id": str(oid)}

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, current_user=Depends(require_super_admin)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user id")
    if str(oid) == str(current_user["_id"]):
        raise HTTPException(400, "Cannot delete yourself")
    user = users_col.find_one({"_id": oid})
    if not user:
        raise HTTPException(404, "User not found")
    comments_deleted = comments_col.count_documents({"user_id": user_id})
    comments_col.delete_many({"user_id": user_id})
    authors_col.delete_one({"user_id": user_id})
    users_col.delete_one({"_id": oid})
    return {"status": "deleted", "id": str(oid), "comments_deleted": comments_deleted}

# ─────────────────────────────────────────────
#  HEALTH
# ─────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "db":     DB_NAME,
        "version": "3.1.0",
        "collections": {
            "users":    users_col.count_documents({}),
            "comments": comments_col.count_documents({}),
            "articles": articles_col.count_documents({}),
            "authors":  authors_col.count_documents({}),
        },
        "articles_by_status": {
            "draft":            articles_col.count_documents({"status": "draft"}),
            "pending_approval": articles_col.count_documents({"status": "pending_approval"}),
            "published":        articles_col.count_documents({"status": "published"}),
            "rejected":         articles_col.count_documents({"status": "rejected"}),
            "archived":         articles_col.count_documents({"status": "archived"}),
        }
    }

# ─────────────────────────────────────────────
#  RUN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
