# ShivaMarg Backend — Complete Software Documentation

> **Version:** 3.0.0  
> **Framework:** FastAPI (Python)  
> **Database:** MongoDB  
> **File:** `shivamarg_backend.py`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Configuration & Environment Variables](#3-configuration--environment-variables)
4. [Database Collections & Indexes](#4-database-collections--indexes)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Data Models & Schemas](#6-data-models--schemas)
7. [API Routes Reference](#7-api-routes-reference)
   - [Auth Routes](#71-auth-routes)
   - [User Routes](#72-user-routes)
   - [Comment Routes](#73-comment-routes)
   - [Posts Routes](#74-posts-routes)
   - [Articles Routes](#75-articles-routes)
   - [Lekhak (Author) Routes](#76-lekhak-author-routes)
   - [Admin Routes](#77-admin-routes)
   - [Health Route](#78-health-route)
8. [Serializers](#8-serializers)
9. [Helper Functions](#9-helper-functions)
10. [Role & Permission System](#10-role--permission-system)
11. [Error Handling](#11-error-handling)
12. [Running the Server](#12-running-the-server)
13. [Full API Quick Reference Table](#13-full-api-quick-reference-table)

---

## 1. Project Overview

**ShivaMarg** is a Hindi/Sanskrit content platform. This backend is a single-file FastAPI server that powers:

- **User authentication** — register, login, JWT tokens
- **Comments system** — post, edit, delete, like comments on any page
- **Vidyapati Geet Sangrah** — a collection of posts/songs (read-only from API perspective)
- **Articles** — a full CMS for creating, publishing, and managing articles
- **Lekhak (लेखक)** — an author profile system where users can register as writers, add books, contributions, activities, and gain followers

The entire server lives in **one Python file** and connects to a MongoDB database.

---

## 2. Tech Stack & Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | Web framework — defines all HTTP routes |
| `uvicorn` | ASGI server to run the FastAPI app |
| `pymongo` | MongoDB driver for Python |
| `python-jose[cryptography]` | JWT token creation and verification |
| `passlib[bcrypt]` | Password hashing and verification |
| `pydantic` | Request body validation via BaseModel schemas |
| `python-multipart` | Required by FastAPI for form support |
| `bson` | ObjectId handling for MongoDB `_id` fields |

**Install all dependencies:**
```bash
pip install fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-slugify
```

---

## 3. Configuration & Environment Variables

All config values are read from environment variables, with safe defaults for local development.

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `ShivaMarg` | MongoDB database name |
| `SECRET_KEY` | `shiva-om-namah-supersecret-...` | JWT signing secret — **must be changed in production** |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins (comma-separated list) |
| `PORT` | `8000` | Port the server listens on |

**Algorithm:** `HS256`  
**Token Expiry:** 7 days (10,080 minutes)

---

## 4. Database Collections & Indexes

The server uses **5 MongoDB collections** inside the `ShivaMarg` database.

### Collections

| Collection Variable | MongoDB Collection Name | Purpose |
|---|---|---|
| `users_col` | `users` | Registered user accounts |
| `comments_col` | `comments` | Comments on any page |
| `vidyapati_posts_col` | `VidyapatiGeetSangrah` | Vidyapati song/post collection |
| `articles_col` | `articles` | CMS articles |
| `authors_col` | `authors` | Author (Lekhak) profiles |

### Indexes

**users:**
- `email` — unique
- `username` — unique

**comments:**
- `(page_id, created_at DESC)` — for fetching comments per page sorted by newest
- `user_id` — for fetching a user's comments

**VidyapatiGeetSangrah:**
- `createdAt DESC`
- `featured`

**articles:**
- `slug` — unique
- `(status, published_at DESC)`
- `category_slug`
- `tags`
- `view_count DESC`
- `author_id`

**authors:**
- `user_id` — unique (one author profile per user)
- `slug` — unique (URL-friendly profile identifier)
- `username` — unique (denormalized for fast lookup)
- `followers_count DESC`
- `categories`

---

## 5. Authentication & Authorization

### How It Works

1. User registers or logs in → server returns a **JWT token**
2. Client sends the token in every protected request as: `Authorization: Bearer <token>`
3. Server decodes the token, finds the user in MongoDB, and injects them into the route handler

### Token Structure

```json
{
  "sub": "<MongoDB user _id as string>",
  "exp": "<expiry timestamp>"
}
```

### Dependency Functions

These are FastAPI `Depends()` functions injected into route handlers:

| Function | Behavior |
|---|---|
| `get_current_user` | Decodes token if present; returns `None` if no token (does NOT raise error) |
| `require_user` | Calls `get_current_user`; raises `401` if not logged in |
| `require_admin` | Requires role in `["admin", "editor", "lekhak"]`; raises `403` otherwise |
| `require_super_admin` | Requires role exactly `"admin"`; raises `403` otherwise |

### Password Handling

- Passwords are hashed using **bcrypt** via `passlib`
- Plain passwords are never stored
- `hash_password(plain)` → returns bcrypt hash
- `verify_password(plain, hashed)` → returns `True`/`False`

---

## 6. Data Models & Schemas

These are Pydantic models used to validate incoming request bodies.

### Auth Schemas

**`RegisterInput`**
```
username      string   min 3, max 30 chars (letters, numbers, underscore only)
email         string   must be unique
password      string   min 6 chars
display_name  string?  optional; defaults to username
role          string?  optional; defaults to "user"
```

**`LoginInput`**
```
email     string
password  string
```

**`ProfileUpdate`** (PATCH /api/auth/profile)
```
display_name  string?  min 1, max 60
username      string?  min 3, max 30
email         string?
```

**`PasswordChange`** (POST /api/auth/password)
```
old_password  string
new_password  string  min 6
```

**`PersonalDetails`** (PUT /api/auth/details)
```
mobile   string?  max 20
dob      string?  date of birth
address  dict?    free-form address object
```

---

### Article Schemas

**`ArticleCreate`** (POST /api/articles)
```
title          string   min 3, max 300
subtitle       string?
content        string   min 10
excerpt        string?  auto-generated from content if not provided
banner_url     string?
thumbnail_url  string?
category       string?
category_slug  string?  auto-generated from category if not provided
tags           list?    array of strings
status         string?  "draft" | "published" | "archived"  (default: "draft")
read_time      int?     estimated read time in minutes (default: 5)
slug           string?  auto-generated from title if not provided
```

**`ArticleUpdate`** (PUT /api/articles/{slug}) — all fields optional

---

### Lekhak (Author) Schemas

**`AuthorRegisterInput`** (POST /api/lekhak/register)
```
display_name  string   min 2, max 100
pen_name      string?  max 100  — लेखकीय नाम
tagline       string?  max 200  — एक-पंक्ति परिचय
bio           string   min 10, max 500
biography     string?  detailed biography
categories    list?    array of category strings
expertise     string?
location      string?
birth_year    int?
website       string?
twitter       string?
instagram     string?
facebook      string?
youtube       string?
slug          string?  custom slug; auto-generated if not provided
```

**`AuthorUpdate`** (PATCH /api/lekhak/me) — all fields optional (same fields as above + avatar, cover_image)

**`BookInput`** (POST /api/lekhak/me/books)
```
title      string  min 1, max 255
year       int?
publisher  string?
cover_url  string?
link       string?
```

**`ContributionInput`** (POST /api/lekhak/me/contributions)
```
title        string  min 1, max 255
description  string  min 1
year         int
```

**`ActivityInput`** (POST /api/lekhak/me/activities)
```
title        string  min 1, max 255
description  string  min 1
date         string  ISO date e.g. "2024-01-15"
```

---

### Admin Schemas

**`RoleUpdate`** (PATCH /api/admin/users/{user_id}/role)
```
role  string  must be one of: "user", "admin", "editor", "lekhak"
```

---

## 7. API Routes Reference

Base URL: `http://localhost:8000`

---

### 7.1 Auth Routes

---

#### `POST /api/auth/register`
Register a new user account.

**Auth required:** No  
**Request body:** `RegisterInput`

**Success response `201`:**
```json
{
  "token": "<jwt_token>",
  "user": { ...serialize_user }
}
```

**Errors:**
- `400` — email already registered
- `400` — username already taken
- `400` — invalid username format

---

#### `POST /api/auth/login`
Log in with email and password.

**Auth required:** No  
**Request body:** `LoginInput`

**Success response `200`:**
```json
{
  "token": "<jwt_token>",
  "user": { ...serialize_user }
}
```

**Errors:**
- `401` — invalid email or password

---

#### `GET /api/auth/me`
Get the currently logged-in user's profile.

**Auth required:** Yes (any role)

**Success response `200`:** `serialize_user` object

---

#### `PATCH /api/auth/profile`
Update display name, username, or email.

**Auth required:** Yes  
**Request body:** `ProfileUpdate`

**Success response `200`:** updated `serialize_user`

---

#### `POST /api/auth/password`
Change password.

**Auth required:** Yes  
**Request body:** `PasswordChange`

**Success response `200`:**
```json
{ "message": "Password updated successfully" }
```

**Errors:**
- `400` — old password incorrect

---

#### `PUT /api/auth/details`
Update personal details (mobile, DOB, address).

**Auth required:** Yes  
**Request body:** `PersonalDetails`

**Success response `200`:** updated `serialize_user`

---

### 7.2 User Routes

---

#### `GET /api/users/{user_id}/comments`
Get all comments posted by a specific user.

**Auth required:** No (optional — affects `liked_by_me` field)  
**Query params:**
- `skip` (int, default 0)
- `limit` (int, default 50)

**Success response `200`:**
```json
{
  "total": 12,
  "pages": [{ "page_id": "shiv-aarti", "page_title": "Shiv Aarti" }],
  "comments": [ ...serialize_comment ]
}
```

---

#### `GET /api/users/{user_id}/profile`
Get a user's public profile.

**Auth required:** No

**Success response `200`:**
```json
{
  "id": "...",
  "username": "...",
  "display_name": "...",
  "avatar": "...",
  "created_at": "...",
  "is_author": true,
  "author_slug": "ramesh-kumar",
  "stats": {
    "comments": 42,
    "pages": 7
  }
}
```

---

### 7.3 Comment Routes

---

#### `GET /api/comments/{page_id}`
Get comments for a specific page.

**Auth required:** No (optional — affects `liked_by_me`)  
**Query params:**
- `skip` (int, default 0)
- `limit` (int, default 20)

**Success response `200`:**
```json
{
  "total": 5,
  "comments": [ ...serialize_comment ]
}
```

---

#### `POST /api/comments`
Post a new comment.

**Auth required:** Yes  
**Request body:**
```json
{
  "page_id": "shiv-aarti",
  "text": "बहुत सुंदर!"
}
```

**Success response `201`:** `serialize_comment` object

---

#### `PUT /api/comments/{comment_id}`
Edit your own comment.

**Auth required:** Yes (must be comment owner)  
**Request body:** `{ "text": "updated text" }`

**Errors:**
- `403` — cannot edit another user's comment

---

#### `DELETE /api/comments/{comment_id}`
Delete your own comment.

**Auth required:** Yes (must be comment owner)  
**Success response:** `204 No Content`

**Errors:**
- `403` — cannot delete another user's comment

---

#### `POST /api/comments/{comment_id}/like`
Toggle like/unlike on a comment.

**Auth required:** Yes

**Success response `200`:** updated `serialize_comment` object (with `liked_by_me` toggled)

---

### 7.4 Posts Routes

These routes serve the **VidyapatiGeetSangrah** collection (read-only).

---

#### `GET /api/posts/latest`
Get the latest posts sorted by `createdAt` descending.

**Auth required:** No  
**Query params:**
- `limit` (int, default 15, max 20)
- `skip` (int, default 0)

**Success response `200`:**
```json
{
  "posts": [ ...serialize_post ],
  "total": 100,
  "limit": 15,
  "skip": 0
}
```

---

#### `GET /api/posts/featured`
Get featured posts only.

**Auth required:** No  
**Query params:** `limit` (default 15, max 20)

---

#### `GET /api/posts/search`
Search posts by keyword and/or category.

**Auth required:** No  
**Query params:**
- `q` (string) — searches `name`, `eng`, `preview` fields
- `category` (string)
- `limit` (int, default 10, max 50)

---

#### `GET /api/posts/{post_id}`
Get a single post by MongoDB `_id`.

**Auth required:** No

**Errors:**
- `404` — post not found

---

### 7.5 Articles Routes

---

#### `GET /api/articles`
List articles. Public users see only `published`. Admins/editors/lekhak can filter by `status`.

**Auth required:** No (optional)  
**Query params:**
- `skip`, `limit` (max 50)
- `category` (category_slug)
- `tag`
- `status` (only respected if admin/editor/lekhak)

**Success response `200`:**
```json
{
  "articles": [ ...serialize_article (no content field) ],
  "total": 50,
  "limit": 10,
  "skip": 0
}
```

---

#### `GET /api/articles/popular`
Top articles by `view_count`.

**Auth required:** No  
**Query params:** `limit` (default 6, max 20)

---

#### `GET /api/articles/latest`
Most recently published articles.

**Auth required:** No  
**Query params:** `limit` (default 5, max 20)

---

#### `GET /api/articles/categories`
Aggregated list of categories with article counts.

**Auth required:** No

**Success response `200`:**
```json
{
  "categories": [
    { "slug": "bhakti", "name": "Bhakti", "count": 12 }
  ]
}
```

---

#### `GET /api/articles/search`
Full-text search across title, subtitle, excerpt, tags, category.

**Auth required:** No  
**Query params:** `q` (required), `limit` (default 10, max 50)

---

#### `GET /api/articles/{slug}`
Get a single article by slug. Increments `view_count` by 1 on each call. Admins can view drafts; public can only view `published`.

**Auth required:** No (optional)

---

#### `POST /api/articles`
Create a new article.

**Auth required:** Yes (admin, editor, or lekhak)  
**Request body:** `ArticleCreate`

**Notes:**
- `slug` is auto-generated from title if not provided
- `excerpt` is auto-generated from content (first 200 chars) if not provided
- `author_slug` is pulled from the author's profile in the `authors` collection
- Increments `articles_count` on the author's profile

---

#### `PUT /api/articles/{slug}`
Update an existing article.

**Auth required:** Yes (admin, editor, or lekhak)  
**Request body:** `ArticleUpdate` (all fields optional)

---

#### `DELETE /api/articles/{slug}`
Delete an article and all its comments.

**Auth required:** Yes (**super admin only**)  
**Success response:** `204 No Content`

---

#### `POST /api/articles/{slug}/like`
Toggle like on a published article.

**Auth required:** Yes

**Success response `200`:**
```json
{ "liked": true, "like_count": 42 }
```

---

#### `PATCH /api/articles/{slug}/status`
Change article status.

**Auth required:** Yes (admin, editor, or lekhak)  
**Request body:** `{ "status": "published" }`  
Valid values: `"draft"`, `"published"`, `"archived"`

---

### 7.6 Lekhak (Author) Routes

**Lekhak** = लेखक = Author/Writer. These routes manage author profiles.

---

#### `POST /api/lekhak/register`
Register the current user as a Lekhak (author). Creates an entry in the `authors` collection and upgrades the user's role to `"lekhak"`.

**Auth required:** Yes  
**Request body:** `AuthorRegisterInput`

**Success response `201`:**
```json
{
  ...serialize_author,
  "message": "बधाई हो! आपकी लेखक प्रोफ़ाइल बन गई।",
  "profile_url": "author-profile.html?slug=ramesh-kumar"
}
```

**Errors:**
- `409` — already registered as an author

**Slug generation logic:**
1. Use custom `slug` if provided
2. Otherwise, generate from `display_name` (ASCII only, lowercase, hyphenated)
3. If the slug already exists, append `-1`, `-2`, etc.

---

#### `GET /api/lekhak`
Public list of all authors, sorted by `followers_count`.

**Auth required:** No  
**Query params:**
- `skip`, `limit` (max 50)
- `category` — filter by category
- `search` — search `display_name`, `pen_name`, `username`, `bio`

**Success response `200`:** Returns lightweight author cards (no books/contributions/activities/biography)

---

#### `GET /api/lekhak/me`
Get the currently logged-in user's own author profile.

**Auth required:** Yes

**Errors:**
- `404` — no author profile exists yet

---

#### `GET /api/lekhak/{slug}`
Get a public author profile by slug.

**Auth required:** No (optional — affects `is_following` field)

**Errors:**
- `404` — author not found

---

#### `GET /api/lekhak/{slug}/articles`
Get published articles by a specific author.

**Auth required:** No  
**Query params:** `skip`, `limit` (max 50)

---

#### `PATCH /api/lekhak/me`
Update the author's own profile.

**Auth required:** Yes  
**Request body:** `AuthorUpdate`

**Note:** Also syncs `display_name` back to the `users` collection.

---

#### `POST /api/lekhak/me/books`
Add a book to the author's profile.

**Auth required:** Yes  
**Request body:** `BookInput`

**Success response `201`:**
```json
{
  "book": { "id": "...", "title": "...", "year": 2020, ... },
  "message": "किताब जोड़ी गई"
}
```

---

#### `DELETE /api/lekhak/me/books/{book_id}`
Remove a book from the author's profile.

**Auth required:** Yes  
**Success response:** `204 No Content`

---

#### `POST /api/lekhak/me/contributions`
Add a contribution entry.

**Auth required:** Yes  
**Request body:** `ContributionInput`

**Success response `201`:**
```json
{
  "contribution": { "id": "...", "title": "...", "description": "...", "year": 2019 },
  "message": "योगदान जोड़ा गया"
}
```

---

#### `DELETE /api/lekhak/me/contributions/{item_id}`
Remove a contribution entry.

**Auth required:** Yes  
**Success response:** `204 No Content`

---

#### `POST /api/lekhak/me/activities`
Add an activity entry.

**Auth required:** Yes  
**Request body:** `ActivityInput`

**Success response `201`:**
```json
{
  "activity": { "id": "...", "title": "...", "description": "...", "date": "2024-01-15" },
  "message": "गतिविधि जोड़ी गई"
}
```

---

#### `DELETE /api/lekhak/me/activities/{item_id}`
Remove an activity entry.

**Auth required:** Yes  
**Success response:** `204 No Content`

---

#### `POST /api/lekhak/{slug}/follow`
Toggle follow/unfollow an author.

**Auth required:** Yes

**Success response `200`:**
```json
{
  "is_following": true,
  "followers_count": 23,
  "message": "अनुसरण की स्थिति बदली"
}
```

---

### 7.7 Admin Routes

All admin routes require role `"admin"`, `"editor"`, or `"lekhak"` unless noted.

---

#### `GET /api/admin/dashboard/stats`
Overview statistics for the admin dashboard.

**Auth required:** Yes (admin/editor/lekhak)

**Success response `200`:**
```json
{
  "total_users": 150,
  "total_comments": 800,
  "total_posts": 200,
  "featured_posts": 12,
  "total_articles": 45,
  "published_articles": 38,
  "draft_articles": 7,
  "total_authors": 10,
  "recent_users_7d": 5,
  "recent_comments_7d": 30,
  "recent_articles_7d": 3,
  "recent_authors_7d": 1
}
```

---

#### `GET /api/admin/users`
Get all users with optional role filter.

**Auth required:** Yes (admin/editor/lekhak)  
**Query params:** `skip`, `limit` (max 100), `role`

---

#### `GET /api/admin/comments`
Get all comments with optional page filter.

**Auth required:** Yes (admin/editor/lekhak)  
**Query params:** `skip`, `limit` (max 50), `page_id`

---

#### `GET /api/admin/posts`
Get all posts from VidyapatiGeetSangrah with optional category filter.

**Auth required:** Yes (admin/editor/lekhak)  
**Query params:** `skip`, `limit` (max 50), `category`

---

#### `PATCH /api/admin/users/{user_id}/role`
Change a user's role.

**Auth required:** Yes (**super admin only**)  
**Request body:** `RoleUpdate`  
Valid roles: `"user"`, `"admin"`, `"editor"`, `"lekhak"`

---

#### `DELETE /api/admin/comments/{comment_id}`
Delete any comment (admin override).

**Auth required:** Yes (admin/editor/lekhak)  
**Success response `200`:** `{ "status": "deleted", "id": "..." }`

---

#### `DELETE /api/admin/users/{user_id}`
Delete a user and all their data.

**Auth required:** Yes (**super admin only**)

**What gets deleted:**
- The user's account from `users`
- All their comments from `comments`
- Their author profile from `authors`

**Errors:**
- `400` — cannot delete yourself

---

### 7.8 Health Route

#### `GET /api/health`
Server and database health check.

**Auth required:** No

**Success response `200`:**
```json
{
  "status": "ok",
  "db": "ShivaMarg",
  "collections": {
    "users": 150,
    "comments": 800,
    "articles": 45,
    "authors": 10
  }
}
```

---

## 8. Serializers

Serializers are internal functions that convert raw MongoDB documents (which include `_id` ObjectId fields) into clean JSON-safe dictionaries.

### `serialize_user(u)`
Returns safe user data. Never exposes the `password` field.

| Field | Description |
|---|---|
| `id` | string version of `_id` |
| `username` | login username |
| `display_name` | shown publicly |
| `email` | user's email |
| `avatar` | image URL or first letter of username (uppercase) |
| `role` | `user`, `admin`, `editor`, or `lekhak` |
| `mobile` | optional phone number |
| `dob` | optional date of birth |
| `address` | optional address object |
| `is_author` | `true` if role is lekhak/admin/editor |
| `author_slug` | set when user registers as Lekhak |
| `created_at` | ISO datetime string |

---

### `serialize_comment(c, current_user_id=None)`
| Field | Description |
|---|---|
| `id` | comment id |
| `page_id` | which page this comment belongs to |
| `user_id` | who posted it |
| `username` | poster's username |
| `avatar` | poster's avatar |
| `text` | comment content |
| `likes` | count of likes (not the list of user ids) |
| `liked_by_me` | `true` if `current_user_id` is in the likes list |
| `created_at` | ISO datetime |
| `updated_at` | ISO datetime |

---

### `serialize_post(p)`
Normalizes fields from the `VidyapatiGeetSangrah` collection which may have inconsistent field names (`name`/`eng`, `imageUrl`/`img`, etc.).

| Field | Source |
|---|---|
| `id` | `_id` |
| `name` | `name` or `eng` |
| `title` | `eng` or `name` |
| `description` / `desc` | `preview` |
| `image` / `img` | `imageUrl` or `img` |
| `url` / `link` | `url` |
| `hashtags` | `hashtags` array |
| `featured` | boolean |
| `createdAt` / `date` | ISO datetime |

---

### `serialize_article(a, full=True)`
When `full=False`, omits the `content` field (used in listing endpoints to reduce payload size).

| Key Fields | Description |
|---|---|
| `id`, `title`, `slug` | basics |
| `subtitle`, `excerpt` | short descriptions |
| `banner_url`, `thumbnail_url` | images |
| `author` | object with `id`, `username`, `avatar`, `author_slug` |
| `category`, `category_slug`, `tags` | taxonomy |
| `status` | `draft`, `published`, or `archived` |
| `read_time` | minutes |
| `view_count`, `like_count` | engagement stats |
| `published_at`, `created_at`, `updated_at` | timestamps |
| `content` | HTML/markdown content (only when `full=True`) |

---

### `serialize_author(a, current_user_id=None)`
Full author profile. Calculates `followers_count` from the length of the `followers` list. Sets `is_following` if `current_user_id` is in the `followers` list.

| Key Fields | Description |
|---|---|
| `id`, `user_id`, `username`, `slug` | identifiers |
| `display_name`, `pen_name` | names |
| `tagline`, `bio`, `biography` | descriptions |
| `avatar`, `cover_image` | images |
| `website`, `twitter`, `instagram`, `facebook`, `youtube` | social links |
| `categories`, `expertise`, `location`, `birth_year` | metadata |
| `books` | list of `{id, title, year, publisher, cover_url, link}` |
| `contributions` | list of `{id, title, description, year}` |
| `activities` | list of `{id, title, description, date}` |
| `articles_count` | cached count |
| `followers_count` | computed from `len(followers)` |
| `total_views` | sum of all article views |
| `is_following` | whether current user follows this author |
| `is_verified` | verified badge |
| `joined_at`, `updated_at` | timestamps |

---

### `serialize_author_card(a)`
Lightweight version of `serialize_author` for listing pages. Excludes `books`, `contributions`, `activities`, `biography`.

---

## 9. Helper Functions

### `make_slug(text)`
Generates a URL-safe slug from any text, including Hindi (Devanagari Unicode). Removes special characters, collapses spaces/underscores/hyphens to single hyphens, lowercases the result.

**Example:**
```python
make_slug("शिव आरती")   # → "शिव-आरती"
make_slug("Shiv Aarti") # → "shiv-aarti"
```

---

### `make_author_slug(display_name, username)`
Generates a clean ASCII slug from the author's display name (for browser-friendly URLs). Falls back to `username` if display name contains no ASCII characters.

**Example:**
```python
make_author_slug("Ramesh Kumar", "ramesh123") # → "ramesh-kumar"
make_author_slug("रमेश कुमार", "ramesh123")  # → "ramesh123"
```

---

### `create_token(data)`
Creates a JWT token. Adds `exp` (expiry) to the payload and signs with `SECRET_KEY`.

### `decode_token(token)`
Decodes and verifies a JWT token. Raises `HTTPException 401` if invalid or expired.

### `hash_password(plain)` / `verify_password(plain, hashed)`
bcrypt-based password utilities.

---

## 10. Role & Permission System

| Role | Description | Can Do |
|---|---|---|
| `user` | Default for all new registrations | Read public content, post/edit/delete own comments, like |
| `lekhak` | Registered author | All user permissions + create/edit articles + manage own author profile |
| `editor` | Content editor | Same as lekhak — create/edit articles |
| `admin` | Super administrator | Everything — including delete users, delete articles, change roles |

### Permission Matrix

| Action | user | lekhak | editor | admin |
|---|:---:|:---:|:---:|:---:|
| Read public content | ✅ | ✅ | ✅ | ✅ |
| Post/edit/delete own comments | ✅ | ✅ | ✅ | ✅ |
| Like comments/articles | ✅ | ✅ | ✅ | ✅ |
| Follow authors | ✅ | ✅ | ✅ | ✅ |
| Register as Lekhak | ✅ | — | — | — |
| Create/edit articles | ❌ | ✅ | ✅ | ✅ |
| Manage own author profile | ❌ | ✅ | ✅ | ✅ |
| View admin dashboard | ❌ | ✅ | ✅ | ✅ |
| Delete any comment (admin) | ❌ | ✅ | ✅ | ✅ |
| View all users list | ❌ | ✅ | ✅ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ |
| Delete articles | ❌ | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ❌ | ✅ |

---

## 11. Error Handling

All routes use `HTTPException` with standard HTTP status codes.

| Code | Meaning | Example |
|---|---|---|
| `400` | Bad Request | Invalid input, duplicate username/email |
| `401` | Unauthorized | Missing/invalid/expired JWT token |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Resource does not exist in DB |
| `409` | Conflict | Already registered as author |
| `500` | Server Error | Unexpected exception (caught generically) |

Most routes wrap their logic in `try/except` and re-raise `HTTPException` or convert unexpected exceptions to `500`.

---

## 12. Running the Server

### Development
```bash
uvicorn shivamarg_backend:app --host 0.0.0.0 --port 8000 --reload
```

### Production
```bash
PORT=8000 \
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net" \
DB_NAME="ShivaMarg" \
SECRET_KEY="your-strong-secret-key-here" \
ALLOWED_ORIGINS="https://shivamarg.com,https://www.shivamarg.com" \
uvicorn shivamarg_backend:app --host 0.0.0.0 --port 8000 --workers 4
```

### Directly (via `__main__`)
```bash
python shivamarg_backend.py
```

### Interactive API Docs
FastAPI auto-generates docs at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 13. Full API Quick Reference Table

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/auth/me` | Yes | Get own profile |
| PATCH | `/api/auth/profile` | Yes | Update name/username/email |
| POST | `/api/auth/password` | Yes | Change password |
| PUT | `/api/auth/details` | Yes | Update mobile/dob/address |
| GET | `/api/users/{id}/comments` | Optional | User's comment history |
| GET | `/api/users/{id}/profile` | No | User's public profile |
| GET | `/api/comments/{page_id}` | Optional | Get page comments |
| POST | `/api/comments` | Yes | Post a comment |
| PUT | `/api/comments/{id}` | Yes | Edit own comment |
| DELETE | `/api/comments/{id}` | Yes | Delete own comment |
| POST | `/api/comments/{id}/like` | Yes | Toggle like on comment |
| GET | `/api/posts/latest` | No | Latest posts |
| GET | `/api/posts/featured` | No | Featured posts |
| GET | `/api/posts/search` | No | Search posts |
| GET | `/api/posts/{id}` | No | Single post detail |
| GET | `/api/articles` | Optional | List articles |
| GET | `/api/articles/popular` | No | Top articles by views |
| GET | `/api/articles/latest` | No | Most recent articles |
| GET | `/api/articles/categories` | No | Category list with counts |
| GET | `/api/articles/search` | No | Search articles |
| GET | `/api/articles/{slug}` | Optional | Article detail (increments views) |
| POST | `/api/articles` | Admin/Editor/Lekhak | Create article |
| PUT | `/api/articles/{slug}` | Admin/Editor/Lekhak | Update article |
| DELETE | `/api/articles/{slug}` | Super Admin | Delete article |
| POST | `/api/articles/{slug}/like` | Yes | Toggle like on article |
| PATCH | `/api/articles/{slug}/status` | Admin/Editor/Lekhak | Change article status |
| POST | `/api/lekhak/register` | Yes | Register as author |
| GET | `/api/lekhak` | Optional | List all authors |
| GET | `/api/lekhak/me` | Yes | Own author profile |
| PATCH | `/api/lekhak/me` | Yes | Update own author profile |
| GET | `/api/lekhak/{slug}` | Optional | Public author profile |
| GET | `/api/lekhak/{slug}/articles` | No | Author's articles |
| POST | `/api/lekhak/me/books` | Yes | Add a book |
| DELETE | `/api/lekhak/me/books/{id}` | Yes | Remove a book |
| POST | `/api/lekhak/me/contributions` | Yes | Add contribution |
| DELETE | `/api/lekhak/me/contributions/{id}` | Yes | Remove contribution |
| POST | `/api/lekhak/me/activities` | Yes | Add activity |
| DELETE | `/api/lekhak/me/activities/{id}` | Yes | Remove activity |
| POST | `/api/lekhak/{slug}/follow` | Yes | Toggle follow author |
| GET | `/api/admin/dashboard/stats` | Admin/Editor/Lekhak | Dashboard stats |
| GET | `/api/admin/users` | Admin/Editor/Lekhak | List all users |
| GET | `/api/admin/comments` | Admin/Editor/Lekhak | List all comments |
| GET | `/api/admin/posts` | Admin/Editor/Lekhak | List all posts |
| PATCH | `/api/admin/users/{id}/role` | Super Admin | Change user role |
| DELETE | `/api/admin/comments/{id}` | Admin/Editor/Lekhak | Delete any comment |
| DELETE | `/api/admin/users/{id}` | Super Admin | Delete user + all data |
| GET | `/api/health` | No | Health check |

---

*Documentation generated for ShivaMarg Backend v3.0.0*