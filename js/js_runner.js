const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, TableOfContents, LevelFormat,
} = require('docx');
const fs = require('fs');

const C = {
  blue: "0078D4", darkBlue: "003366", lightBlue: "EFF6FC",
  green: "107C10", orange: "D83B01", purple: "8764B8",
  gray: "605E5C", lightGray: "F3F2F1", medGray: "EDEBE9",
  darkGray: "323130", white: "FFFFFF", codeBack: "F8F8F8",
  codeBorder: "DDDBD9", borderLine: "DDDBD9",
  get: "61AFFE", post: "49CC90", patch: "FCA130",
  put: "FCA130", delete_c: "F93E3E",
};

const border  = (color = C.borderLine) => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color = C.borderLine) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder  = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });
const cellMargins = { top: 100, bottom: 100, left: 150, right: 150 };

function para(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, font: "Segoe UI", size: opts.size || 20, bold: opts.bold || false, color: opts.color || C.darkGray, italics: opts.italics || false })];
  return new Paragraph({
    children: runs,
    heading: opts.heading,
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after || 160, line: opts.line || 276 },
    ...(opts.indent && { indent: opts.indent }),
    ...(opts.border && { border: opts.border }),
    ...(opts.shading && { shading: opts.shading }),
    pageBreakBefore: opts.pageBreak || false,
  });
}

function run(text, opts = {}) {
  return new TextRun({ text, font: opts.font || "Segoe UI", size: opts.size || 20, bold: opts.bold || false, color: opts.color || C.darkGray, italics: opts.italics || false });
}

function codeRun(text) {
  return new TextRun({ text, font: "Consolas", size: 18, color: "C7254E" });
}

function codeBlock(lines) {
  const rows = lines.map(line =>
    new TableRow({
      children: [new TableCell({
        borders: noBorders(),
        width: { size: 9360, type: WidthType.DXA },
        margins: { top: 0, bottom: 0, left: 180, right: 180 },
        shading: { fill: C.codeBack, type: ShadingType.CLEAR },
        children: [new Paragraph({
          children: [new TextRun({ text: line, font: "Consolas", size: 17, color: "3B3B3B" })],
          spacing: { before: 0, after: 0, line: 240 },
        })],
      })]
    })
  );
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    borders: { top: border(C.codeBorder), bottom: border(C.codeBorder), left: border(C.codeBorder), right: border(C.codeBorder), insideH: noBorder(), insideV: noBorder() },
    rows,
  });
}

function methodBadge(method) {
  const colorMap = { GET: C.get, POST: C.post, PATCH: C.patch, PUT: C.put, DELETE: C.delete_c };
  const fill = colorMap[method] || C.gray;
  return new TableCell({
    width: { size: 900, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders: borders(),
    shading: { fill, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: method, font: "Segoe UI", size: 16, bold: true, color: C.white })],
    })],
  });
}

function endpointRow(method, path, description) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [900, 2800, 5660],
    borders: { top: border(C.borderLine), bottom: border(C.borderLine), left: border(C.borderLine), right: border(C.borderLine), insideH: noBorder(), insideV: border(C.borderLine) },
    rows: [new TableRow({
      children: [
        methodBadge(method),
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          margins: cellMargins,
          borders: borders(),
          shading: { fill: C.lightGray, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: path, font: "Consolas", size: 17, bold: true, color: C.darkBlue })] })],
        }),
        new TableCell({
          width: { size: 5660, type: WidthType.DXA },
          margins: cellMargins,
          borders: borders(),
          verticalAlign: VerticalAlign.CENTER,
          children: [para(description, { after: 0 })],
        }),
      ]
    })]
  });
}

function paramsTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      margins: cellMargins,
      borders: borders(C.borderLine),
      shading: { fill: C.lightBlue, type: ShadingType.CLEAR },
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: h, font: "Segoe UI", size: 18, bold: true, color: C.darkBlue })] })],
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => {
      const isFirst = i === 0;
      return new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        margins: cellMargins,
        borders: borders(C.borderLine),
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: cell, font: isFirst ? "Consolas" : "Segoe UI", size: 17, color: isFirst ? "C7254E" : C.darkGray, bold: isFirst })],
        })],
      });
    })
  }));
  return new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

function sectionLabel(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Segoe UI", size: 18, bold: true, color: C.blue })],
    spacing: { before: 200, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: C.blue, space: 10 } },
    indent: { left: 200 },
  });
}

function authBadge(required) {
  const fill  = required ? "FFF4CE" : "DFF6DD";
  const color = required ? "7A5B00" : "054B16";
  const text  = required ? "🔒  Authentication Required" : "🔓  Public — No Authentication";
  return new Paragraph({
    spacing: { before: 120, after: 200 },
    shading: { fill, type: ShadingType.CLEAR },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text, font: "Segoe UI", size: 18, bold: true, color })],
  });
}

function roleBadge(roleText) {
  return new Paragraph({
    spacing: { before: 0, after: 160 },
    shading: { fill: "F0F0FF", type: ShadingType.CLEAR },
    indent: { left: 120, right: 120 },
    children: [
      run("Required Role: ", { bold: true, color: C.purple }),
      run(roleText, { color: C.purple }),
    ],
  });
}

function statusTable(codes) {
  const colW = Math.floor(9360 / codes.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: codes.map(() => colW),
    rows: [new TableRow({
      children: codes.map(({ code, desc, fill }) => new TableCell({
        width: { size: colW, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        borders: borders(),
        shading: { fill: fill || C.lightGray, type: ShadingType.CLEAR },
        children: [
          new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(code), font: "Consolas", size: 20, bold: true, color: fill ? C.white : C.darkGray })] }),
          new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: desc, font: "Segoe UI", size: 16, color: fill ? C.white : C.gray })] }),
        ],
      }))
    })]
  });
}

function spacer(pt = 160) { return new Paragraph({ children: [], spacing: { before: 0, after: pt } }); }
function divider() {
  return new Paragraph({ children: [], spacing: { before: 240, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.medGray, space: 1 } } });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Segoe UI", size: 32, bold: true, color: C.darkBlue })],
    spacing: { before: 0, after: 240 },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Segoe UI", size: 26, bold: true, color: C.darkBlue })],
    spacing: { before: 280, after: 160 },
  });
}

// ── Build a standard endpoint block ─────────────────────────────────────────
function buildEndpoint({ heading, method, path, desc, auth, role, params, bodyParams, queryParams, exReq, exRes, codes, notes }) {
  const items = [];
  items.push(h2(heading));
  items.push(endpointRow(method, path, desc));
  items.push(spacer(160));
  items.push(authBadge(auth));
  if (role) items.push(roleBadge(role));
  if (notes) {
    items.push(new Paragraph({
      spacing: { before: 0, after: 160 },
      shading: { fill: "FFF4CE", type: ShadingType.CLEAR },
      indent: { left: 120, right: 120 },
      children: [run("ℹ  " + notes, { color: "7A5B00" })],
    }));
  }
  if (params && params.length) {
    items.push(sectionLabel("Path Parameters"));
    items.push(spacer(80));
    items.push(paramsTable(["Parameter", "Type", "Description"], params, [1800, 1000, 6560]));
    items.push(spacer(160));
  }
  if (queryParams && queryParams.length) {
    items.push(sectionLabel("Query Parameters"));
    items.push(spacer(80));
    items.push(paramsTable(["Parameter", "Type", "Required", "Default", "Description"], queryParams, [1600, 900, 900, 1000, 4960]));
    items.push(spacer(160));
  }
  if (bodyParams && bodyParams.length) {
    items.push(sectionLabel("Request Body"));
    items.push(spacer(80));
    items.push(paramsTable(["Field", "Type", "Required", "Constraints", "Description"], bodyParams, [1600, 900, 900, 1600, 4360]));
    items.push(spacer(160));
  }
  items.push(sectionLabel("Example Request"));
  items.push(spacer(80));
  items.push(codeBlock(exReq));
  items.push(spacer(160));
  items.push(sectionLabel("Response"));
  items.push(spacer(80));
  items.push(codeBlock(exRes));
  items.push(spacer(160));
  items.push(sectionLabel("Status Codes"));
  items.push(spacer(80));
  items.push(statusTable(codes));
  items.push(spacer(200));
  items.push(divider());
  return items;
}

// ════════════════════════════════════════════════════════════════════════════
//  DOCUMENT CHILDREN
// ════════════════════════════════════════════════════════════════════════════
const children = [];

// ── Cover ───────────────────────────────────────────────────────────────────
children.push(
  spacer(2400),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: "ShivMarg", font: "Segoe UI Light", size: 72, color: C.blue })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: "REST API Reference — Part 2", font: "Segoe UI", size: 40, color: C.darkGray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 }, children: [new TextRun({ text: "Version 3.1.0  •  Users · Posts · Articles · Lekhak · Admin · Health", font: "Segoe UI", size: 22, color: C.gray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 1 } }, children: [] }),
  spacer(400),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "Base URL", font: "Segoe UI", size: 20, bold: true, color: C.gray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "https://api.shivamarg.com", font: "Consolas", size: 22, color: C.blue, bold: true })] }),
  spacer(3000),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Companion to Part 1 — 35 additional endpoints", font: "Segoe UI", size: 18, color: C.gray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Confidential — For Authorized Developers Only", font: "Segoe UI", size: 18, color: C.gray, italics: true })] }),
);

// ── TOC ─────────────────────────────────────────────────────────────────────
children.push(
  para("", { pageBreak: true }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Table of Contents", font: "Segoe UI", size: 32, bold: true, color: C.darkBlue })], spacing: { before: 0, after: 320 } }),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
);

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — USERS
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("1  Users"));
children.push(para("User endpoints expose public-facing profile data and per-user comment history. No authentication is required for the public profile endpoint; comment history optionally uses a token to populate the liked_by_me field."));
children.push(spacer(120));

children.push(...buildEndpoint({
  heading: "1.1  Get User's Comment History",
  method: "GET", path: "/api/users/{user_id}/comments",
  desc: "Returns all comments posted by a specific user, with a page summary showing which pages they have commented on.",
  auth: false,
  notes: "Passing a valid Bearer token enriches the liked_by_me field on each comment. Without a token, liked_by_me is always false.",
  params: [["user_id", "string", "MongoDB ObjectId of the target user."]],
  queryParams: [
    ["skip",  "integer", "No", "0",  "Number of comments to skip (for pagination)."],
    ["limit", "integer", "No", "50", "Maximum comments to return. Hard cap: 50."],
  ],
  exReq: [
    "GET /api/users/64a1b2c3d4e5f6789abc0001/comments?skip=0&limit=20",
    "Authorization: Bearer <token>   // optional",
  ],
  exRes: [
    "{",
    '  "total": 42,',
    '  "pages": [',
    '    { "page_id": "shiv-aarti", "page_title": "shiv-aarti" },',
    '    { "page_id": "om-namah-shivaya", "page_title": "om-namah-shivaya" }',
    "  ],",
    '  "comments": [',
    "    {",
    '      "id": "64b1c2d3...",',
    '      "page_id": "shiv-aarti",',
    '      "page_title": "shiv-aarti",',
    '      "username": "ramkumar",',
    '      "text": "Om Namah Shivaya!",',
    '      "likes": 3,',
    '      "liked_by_me": false,',
    '      "created_at": "2024-07-15T08:00:00.000Z"',
    "    }",
    "  ]",
    "}",
  ],
  codes: [
    { code: 200, desc: "Success", fill: C.green },
    { code: 400, desc: "Invalid user_id format" },
  ],
}));

children.push(...buildEndpoint({
  heading: "1.2  Get Public User Profile",
  method: "GET", path: "/api/users/{user_id}/profile",
  desc: "Returns a user's public profile including their display name, avatar, role, author status, and activity stats.",
  auth: false,
  params: [["user_id", "string", "MongoDB ObjectId of the target user."]],
  exReq: ["GET /api/users/64a1b2c3d4e5f6789abc0001/profile"],
  exRes: [
    "{",
    '  "id": "64a1b2c3d4e5f6789abc0001",',
    '  "username": "ramkumar",',
    '  "display_name": "Ram Kumar",',
    '  "avatar": "R",',
    '  "created_at": "2024-07-01T10:30:00.000Z",',
    '  "is_author": false,',
    '  "author_slug": null,',
    '  "stats": {',
    '    "comments": 42,',
    '    "pages": 8',
    "  }",
    "}",
  ],
  codes: [
    { code: 200, desc: "Profile returned", fill: C.green },
    { code: 400, desc: "Invalid user_id format" },
    { code: 404, desc: "User not found" },
  ],
}));

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — POSTS (Vidyapati)
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("2  Posts (Vidyapati Geet Sangrah)"));
children.push(para("These endpoints serve content from the VidyapatiGeetSangrah collection via the /api/posts prefix. All endpoints are public and read-only. Results are capped at 20 items per request."));
children.push(spacer(120));

children.push(...buildEndpoint({
  heading: "2.1  Get Latest Posts",
  method: "GET", path: "/api/posts/latest",
  desc: "Returns the most recently added posts, sorted by createdAt and updatedAt descending.",
  auth: false,
  queryParams: [
    ["limit", "integer", "No", "15", "Number of posts to return. Max 20."],
    ["skip",  "integer", "No", "0",  "Number of posts to skip."],
  ],
  exReq: ["GET /api/posts/latest?limit=10&skip=0"],
  exRes: [
    "{",
    '  "posts": [',
    "    {",
    '      "id": "64c1d2e3f4a5b6789abc0020",',
    '      "name": "Suno Suno He Bholanath",',
    '      "title": "Suno Suno He Bholanath",',
    '      "description": "A devotional song praising Lord Shiva...",',
    '      "category": "Devotional",',
    '      "typeLabel": "Geet",',
    '      "image": "https://cdn.shivamarg.com/vidyapati/suno.jpg",',
    '      "url": "/vidyapati/suno-suno-he-bholanath",',
    '      "hashtags": ["shiva", "devotional"],',
    '      "featured": false,',
    '      "createdAt": "2024-06-01T00:00:00.000Z"',
    "    }",
    "  ],",
    '  "total": 156,',
    '  "limit": 10,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Success", fill: C.green },
    { code: 500, desc: "Server error" },
  ],
}));

children.push(...buildEndpoint({
  heading: "2.2  Get Featured Posts",
  method: "GET", path: "/api/posts/featured",
  desc: "Returns only posts marked as featured: true, sorted by updatedAt descending.",
  auth: false,
  queryParams: [
    ["limit", "integer", "No", "15", "Number of featured posts to return. Max 20."],
  ],
  exReq: ["GET /api/posts/featured?limit=6"],
  exRes: [
    "{",
    '  "posts": [ /* Array of Post Objects with featured: true */ ],',
    '  "total": 12,',
    '  "limit": 6',
    "}",
  ],
  codes: [
    { code: 200, desc: "Success", fill: C.green },
    { code: 500, desc: "Server error" },
  ],
}));

children.push(...buildEndpoint({
  heading: "2.3  Search Posts",
  method: "GET", path: "/api/posts/search",
  desc: "Full-text search across post name, English title, and preview/description. Optionally filter by category.",
  auth: false,
  queryParams: [
    ["q",        "string",  "No", "\"\"", "Search term. Matches against name, eng (English title), and preview fields (case-insensitive)."],
    ["category", "string",  "No", "\"\"", "Filter by exact category name."],
    ["limit",    "integer", "No", "10",   "Maximum results. Hard cap: 50."],
  ],
  exReq: ["GET /api/posts/search?q=Bholanath&category=Devotional&limit=10"],
  exRes: [
    "{",
    '  "posts": [ /* Matching Post Objects */ ],',
    '  "total": 5,',
    '  "query": "Bholanath",',
    '  "category": "Devotional",',
    '  "limit": 10',
    "}",
  ],
  codes: [
    { code: 200, desc: "Results returned (empty array if no matches)", fill: C.green },
    { code: 500, desc: "Server error" },
  ],
}));

children.push(...buildEndpoint({
  heading: "2.4  Get Post by ID",
  method: "GET", path: "/api/posts/{post_id}",
  desc: "Retrieve a single post by its MongoDB ObjectId.",
  auth: false,
  params: [["post_id", "string", "MongoDB ObjectId of the post."]],
  exReq: ["GET /api/posts/64c1d2e3f4a5b6789abc0020"],
  exRes: ["{ /* Single Post Object — see Post Object fields below */ }"],
  codes: [
    { code: 200, desc: "Post returned", fill: C.green },
    { code: 400, desc: "Invalid post_id format" },
    { code: 404, desc: "Post not found" },
  ],
}));

// Post Object reference
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.5  Post Object Reference", font: "Segoe UI", size: 26, bold: true, color: C.darkBlue })], spacing: { before: 280, after: 160 } }),
  para("Returned by all /api/posts endpoints."),
  spacer(80),
  paramsTable(
    ["Field", "Type", "Description"],
    [
      ["id",          "string",  "MongoDB ObjectId."],
      ["name",        "string",  "Primary name / title of the post."],
      ["title",       "string",  "English title (eng field from DB)."],
      ["description", "string",  "Short preview/description text."],
      ["category",    "string",  "Category name (e.g. Devotional, Bhajan)."],
      ["typeLabel",   "string",  "Content type label (e.g. Geet, Stuti)."],
      ["image",       "string",  "Image URL."],
      ["url",         "string",  "Relative URL path to the post page."],
      ["hashtags",    "array",   "Array of hashtag strings."],
      ["featured",    "boolean", "True if the post is marked as featured."],
      ["createdAt",   "string",  "ISO 8601 creation timestamp."],
      ["updatedAt",   "string",  "ISO 8601 last updated timestamp."],
    ],
    [1600, 1000, 6760]
  ),
  spacer(240),
  divider(),
);

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — ARTICLES (additional endpoints)
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("3  Articles — Additional Endpoints"));
children.push(para("These endpoints supplement the core article CRUD covered in Part 1. They include discovery endpoints (popular, latest, categories, search), author-specific views, admin review queues, and article lifecycle actions (like, status change, delete)."));
children.push(spacer(120));

// Note on GET /api/articles role-based behavior
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.0  Role-Based Behaviour of GET /api/articles", font: "Segoe UI", size: 26, bold: true, color: C.darkBlue })], spacing: { before: 0, after: 160 } }),
  new Paragraph({
    spacing: { before: 0, after: 200 },
    shading: { fill: "EFF6FC", type: ShadingType.CLEAR },
    indent: { left: 120, right: 120 },
    children: [run("The main article list endpoint behaves differently depending on the caller's role:", { bold: true, color: C.darkBlue })],
  }),
  paramsTable(
    ["Caller Role", "Token Required", "Default Query", "Can Filter by status?"],
    [
      ["public / user", "No", "status = published", "No — always sees published only"],
      ["lekhak",        "Yes", "author_id = self (all statuses)", "Yes — but only own articles"],
      ["editor / admin","Yes", "Any status", "Yes — all articles"],
    ],
    [2000, 1600, 3000, 2760]
  ),
  spacer(200),
  divider(),
);

children.push(...buildEndpoint({
  heading: "3.1  Get Popular Articles",
  method: "GET", path: "/api/articles/popular",
  desc: "Returns the top published articles sorted by view_count descending. Useful for trending sections and homepage widgets.",
  auth: false,
  queryParams: [
    ["limit", "integer", "No", "6", "Number of articles to return. Max 20."],
  ],
  exReq: ["GET /api/articles/popular?limit=6"],
  exRes: [
    "{",
    '  "articles": [ /* Array of Article Objects (no content field) */ ]',
    "}",
  ],
  codes: [{ code: 200, desc: "Success", fill: C.green }],
}));

children.push(...buildEndpoint({
  heading: "3.2  Get Latest Articles",
  method: "GET", path: "/api/articles/latest",
  desc: "Returns the most recently published articles sorted by published_at descending. Useful for 'Latest' sections.",
  auth: false,
  queryParams: [
    ["limit", "integer", "No", "5", "Number of articles to return. Max 20."],
  ],
  exReq: ["GET /api/articles/latest?limit=5"],
  exRes: [
    "{",
    '  "articles": [ /* Array of Article Objects (no content field) */ ]',
    "}",
  ],
  codes: [{ code: 200, desc: "Success", fill: C.green }],
}));

children.push(...buildEndpoint({
  heading: "3.3  Get Article Categories",
  method: "GET", path: "/api/articles/categories",
  desc: "Returns all categories that have at least one published article, along with their article counts. Sorted by count descending.",
  auth: false,
  exReq: ["GET /api/articles/categories"],
  exRes: [
    "{",
    '  "categories": [',
    '    { "slug": "mythology", "name": "Mythology", "count": 24 },',
    '    { "slug": "devotional", "name": "Devotional", "count": 18 },',
    '    { "slug": "vedic-philosophy", "name": "Vedic Philosophy", "count": 11 }',
    "  ]",
    "}",
  ],
  codes: [{ code: 200, desc: "Categories array returned", fill: C.green }],
}));

children.push(...buildEndpoint({
  heading: "3.4  Search Articles",
  method: "GET", path: "/api/articles/search",
  desc: "Full-text search across published articles. Matches title, subtitle, excerpt, tags, and category (case-insensitive). Results sorted by view_count descending.",
  auth: false,
  queryParams: [
    ["q",     "string",  "Yes", "\"\"", "Search query. Returns empty array if not provided."],
    ["limit", "integer", "No",  "10",   "Maximum results. Hard cap: 50."],
  ],
  exReq: ["GET /api/articles/search?q=Lord+Shiva&limit=10"],
  exRes: [
    "{",
    '  "articles": [ /* Matching Article Objects (no content field) */ ],',
    '  "total": 7,',
    '  "query": "Lord Shiva"',
    "}",
  ],
  codes: [
    { code: 200, desc: "Results returned (empty array if no match)", fill: C.green },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.5  Get Pending Articles (Admin Queue)",
  method: "GET", path: "/api/articles/pending",
  desc: "Returns articles with status pending_approval, sorted by submission time (oldest first). Used by editors and admins to process the review queue.",
  auth: true, role: "admin (super admin only)",
  queryParams: [
    ["skip",  "integer", "No", "0",  "Number to skip."],
    ["limit", "integer", "No", "20", "Results per page. Max 50."],
  ],
  exReq: [
    "GET /api/articles/pending?skip=0&limit=20",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "articles": [ /* Articles with status: pending_approval */ ],',
    '  "total": 5,',
    '  "limit": 20,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Queue returned", fill: C.green },
    { code: 403, desc: "Not super admin" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.6  Get My Articles",
  method: "GET", path: "/api/articles/my",
  desc: "Returns all articles belonging to the authenticated user across all statuses. Supports optional status filter.",
  auth: true,
  queryParams: [
    ["skip",   "integer", "No", "0",  "Number to skip."],
    ["limit",  "integer", "No", "20", "Results per page. Max 50."],
    ["status", "string",  "No", "all","Filter by status: draft, pending_approval, published, rejected, archived."],
  ],
  exReq: [
    "GET /api/articles/my?status=draft&limit=10",
    "Authorization: Bearer <token>",
  ],
  exRes: [
    "{",
    '  "articles": [ /* Author\'s own articles */ ],',
    '  "total": 12,',
    '  "limit": 10,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Success", fill: C.green },
    { code: 401, desc: "Unauthorized" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.7  Delete an Article",
  method: "DELETE", path: "/api/articles/{slug}",
  desc: "Permanently delete an article. Authors can only delete their own draft or rejected articles. Admins and editors can delete any article. Also deletes all associated comments.",
  auth: true,
  notes: "Authors can only delete articles with status draft or rejected. Admins/editors can delete any status.",
  params: [["slug", "string", "URL slug of the article to delete."]],
  exReq: [
    "DELETE /api/articles/the-divine-story-of-lord-shiva",
    "Authorization: Bearer <token>",
  ],
  exRes: ["// 204 No Content — empty body"],
  codes: [
    { code: 204, desc: "Deleted", fill: C.green },
    { code: 403, desc: "Not owner or wrong status" },
    { code: 404, desc: "Article not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.8  Like / Unlike an Article",
  method: "POST", path: "/api/articles/{slug}/like",
  desc: "Toggle a like on a published article. Calling again removes the like. Only works on published articles.",
  auth: true,
  params: [["slug", "string", "Slug of the published article to like/unlike."]],
  exReq: [
    "POST /api/articles/the-divine-story-of-lord-shiva/like",
    "Authorization: Bearer <token>",
  ],
  exRes: [
    "{",
    '  "liked": true,',
    '  "like_count": 47',
    "}",
  ],
  codes: [
    { code: 200, desc: "Like toggled", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "Article not found or not published" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.9  Change Article Status (Admin)",
  method: "PATCH", path: "/api/articles/{slug}/status",
  desc: "Directly set an article's status. Admin and editor only. If changing to published for the first time, sets published_at automatically.",
  auth: true, role: "editor / admin",
  params: [["slug", "string", "Slug of the article."]],
  bodyParams: [
    ["status", "string", "Yes", "See valid statuses", "New status: draft, pending_approval, published, rejected, archived."],
  ],
  exReq: [
    "PATCH /api/articles/the-divine-story-of-lord-shiva/status",
    "Authorization: Bearer <admin_token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "status": "archived"',
    "}",
  ],
  exRes: [
    "{",
    '  "slug": "the-divine-story-of-lord-shiva",',
    '  "status": "archived"',
    "}",
  ],
  codes: [
    { code: 200, desc: "Status updated", fill: C.green },
    { code: 400, desc: "Invalid status value" },
    { code: 403, desc: "Insufficient role" },
    { code: 404, desc: "Article not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.10  Submit Article for Review",
  method: "POST", path: "/api/articles/{slug}/submit",
  desc: "Submit a draft or rejected article for editorial review. Changes status to pending_approval. Only the article owner can call this.",
  auth: true,
  notes: "Only articles with status draft or rejected can be submitted. The article must belong to the authenticated user.",
  params: [["slug", "string", "Slug of the article to submit."]],
  exReq: [
    "POST /api/articles/my-new-article/submit",
    "Authorization: Bearer <token>",
  ],
  exRes: [
    "{",
    '  "message": "लेख समीक्षा के लिए भेज दिया गया है",',
    '  "slug": "my-new-article",',
    '  "status": "pending_approval",',
    '  "submitted_at": "2024-07-20T12:00:00.000Z",',
    '  "article": { /* Article Object */ }',
    "}",
  ],
  codes: [
    { code: 200, desc: "Submitted for review", fill: C.green },
    { code: 400, desc: "Article not in draft/rejected status" },
    { code: 403, desc: "Not the article owner" },
    { code: 404, desc: "Article not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "3.11  Approve or Reject an Article",
  method: "POST", path: "/api/articles/{slug}/review",
  desc: "Approve or reject a pending_approval article. Requires super admin. Approving publishes the article and increments the author's articles_count. Rejecting requires a rejection_reason.",
  auth: true, role: "admin (super admin only)",
  params: [["slug", "string", "Slug of the article under review."]],
  bodyParams: [
    ["action",           "string", "Yes",         "approve | reject",   "Action to take on the article."],
    ["rejection_reason", "string", "Conditional", "Non-empty string",   "Required when action is reject."],
  ],
  exReq: [
    "POST /api/articles/my-new-article/review",
    "Authorization: Bearer <admin_token>",
    "Content-Type: application/json",
    "",
    "// Approve:",
    '{ "action": "approve" }',
    "",
    "// Reject:",
    "{",
    '  "action": "reject",',
    '  "rejection_reason": "Needs more citations and references."',
    "}",
  ],
  exRes: [
    "{",
    '  "message": "लेख प्रकाशित कर दिया गया है",',
    '  "slug": "my-new-article",',
    '  "status": "published",',
    '  "article": { /* Updated Article Object */ }',
    "}",
  ],
  codes: [
    { code: 200, desc: "Review action applied", fill: C.green },
    { code: 400, desc: "Invalid action / missing rejection_reason / wrong current status" },
    { code: 403, desc: "Not super admin" },
    { code: 404, desc: "Article not found" },
  ],
}));

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — LEKHAK (AUTHORS /api/lekhak)
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("4  Lekhak (Author Profiles)"));
children.push(para("The /api/lekhak prefix manages the full author profile lifecycle. Any logged-in user can register as a lekhak. Author profiles support books, contributions, and activity logs as sub-resources."));
children.push(spacer(120));

children.push(...buildEndpoint({
  heading: "4.1  Register as Lekhak",
  method: "POST", path: "/api/lekhak/register",
  desc: "Create an author profile for the authenticated user. Automatically upgrades the user's role to lekhak. Returns a 409 if the user already has an author profile.",
  auth: true,
  notes: "On success, the user's role is set to lekhak and their author_slug is set on the users collection.",
  bodyParams: [
    ["display_name", "string", "Yes", "2–100 chars",  "Full name for public profile."],
    ["bio",          "string", "Yes", "10–500 chars", "Short author biography."],
    ["pen_name",     "string", "No",  "Max 100 chars","Pen name / pseudonym."],
    ["tagline",      "string", "No",  "Max 200 chars","Short tagline or motto."],
    ["biography",    "string", "No",  "-",            "Long-form biography (HTML/Markdown supported)."],
    ["categories",   "array",  "No",  "-",            "Array of category slugs this author writes about."],
    ["expertise",    "string", "No",  "-",            "Area of expertise."],
    ["location",     "string", "No",  "-",            "City / country."],
    ["birth_year",   "integer","No",  "-",            "Year of birth."],
    ["website",      "string", "No",  "URL",          "Personal website."],
    ["twitter",      "string", "No",  "URL",          "Twitter/X profile URL."],
    ["instagram",    "string", "No",  "URL",          "Instagram profile URL."],
    ["facebook",     "string", "No",  "URL",          "Facebook profile URL."],
    ["youtube",      "string", "No",  "URL",          "YouTube channel URL."],
    ["slug",         "string", "No",  "slug format",  "Custom slug. Auto-generated from display_name if omitted."],
  ],
  exReq: [
    "POST /api/lekhak/register",
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "display_name": "Pandit Ram Kumar",',
    '  "bio": "Scholar of Vedic literature with 20 years of experience.",',
    '  "tagline": "Bringing ancient wisdom to modern readers",',
    '  "categories": ["mythology", "vedic-philosophy"],',
    '  "location": "Varanasi, India"',
    "}",
  ],
  exRes: [
    "{",
    "  /* Full Author Object */",
    '  "message": "बधाई हो! आपकी लेखक प्रोफ़ाइल बन गई।",',
    '  "profile_url": "author-profile.html?slug=pandit-ram-kumar"',
    "}",
  ],
  codes: [
    { code: 201, desc: "Author profile created", fill: C.green },
    { code: 409, desc: "Author profile already exists for this user" },
    { code: 401, desc: "Unauthorized" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.2  List All Lekhak (Author Cards)",
  method: "GET", path: "/api/lekhak",
  desc: "Returns a paginated list of author cards (summary view). Supports search and category filtering. Sorted by followers_count descending.",
  auth: false,
  queryParams: [
    ["skip",     "integer", "No", "0",  "Number to skip."],
    ["limit",    "integer", "No", "20", "Results per page. Max 50."],
    ["category", "string",  "No", "\"\"","Filter by category slug."],
    ["search",   "string",  "No", "\"\"","Search across display_name, pen_name, username, and bio."],
  ],
  exReq: ["GET /api/lekhak?limit=12&category=mythology&search=pandit"],
  exRes: [
    "{",
    '  "authors": [',
    "    {",
    '      "id": "64d1e2f3...",',
    '      "username": "ramkumar",',
    '      "slug": "pandit-ram-kumar",',
    '      "display_name": "Pandit Ram Kumar",',
    '      "pen_name": "",',
    '      "tagline": "Bringing ancient wisdom to modern readers",',
    '      "bio": "Scholar of Vedic literature...",',
    '      "avatar": "https://cdn.shivamarg.com/avatars/ram.jpg",',
    '      "categories": ["mythology", "vedic-philosophy"],',
    '      "articles_count": 14,',
    '      "followers_count": 128,',
    '      "is_verified": false',
    "    }",
    "  ],",
    '  "total": 34,',
    '  "limit": 12,',
    '  "skip": 0',
    "}",
  ],
  codes: [{ code: 200, desc: "Success", fill: C.green }],
}));

children.push(...buildEndpoint({
  heading: "4.3  Get My Author Profile",
  method: "GET", path: "/api/lekhak/me",
  desc: "Returns the full author profile for the authenticated user. Returns 404 if the user has not yet registered as an author.",
  auth: true,
  exReq: [
    "GET /api/lekhak/me",
    "Authorization: Bearer <token>",
  ],
  exRes: ["{ /* Full Author Object — see §4.0 Author Object */ }"],
  codes: [
    { code: 200, desc: "Profile returned", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "No author profile found — register first" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.4  Get Author Profile by Slug",
  method: "GET", path: "/api/lekhak/{slug}",
  desc: "Returns a full author profile by slug. Passing an optional Bearer token populates the is_following field.",
  auth: false,
  notes: "Passing a valid Bearer token enriches the is_following field. Without token, is_following is always false.",
  params: [["slug", "string", "URL slug of the author profile."]],
  exReq: ["GET /api/lekhak/pandit-ram-kumar"],
  exRes: ["{ /* Full Author Object with is_following populated */ }"],
  codes: [
    { code: 200, desc: "Author returned", fill: C.green },
    { code: 404, desc: "Author not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.5  Get Author's Published Articles",
  method: "GET", path: "/api/lekhak/{slug}/articles",
  desc: "Returns published articles belonging to the author identified by slug. Sorted by published_at descending.",
  auth: false,
  params: [["slug", "string", "URL slug of the author."]],
  queryParams: [
    ["skip",  "integer", "No", "0",  "Number to skip."],
    ["limit", "integer", "No", "20", "Results per page. Max 50."],
  ],
  exReq: ["GET /api/lekhak/pandit-ram-kumar/articles?limit=10"],
  exRes: [
    "{",
    '  "articles": [ /* Published Article Objects (no content field) */ ],',
    '  "total": 14',
    "}",
  ],
  codes: [
    { code: 200, desc: "Articles returned", fill: C.green },
    { code: 404, desc: "Author not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.6  Update My Author Profile",
  method: "PATCH", path: "/api/lekhak/me",
  desc: "Update the authenticated user's own author profile. All fields optional. Also syncs display_name to the users collection if changed.",
  auth: true,
  bodyParams: [
    ["display_name", "string",  "No", "Max 100 chars", "Updated full name."],
    ["pen_name",     "string",  "No", "Max 100 chars", "Updated pen name."],
    ["tagline",      "string",  "No", "Max 200 chars", "Updated tagline."],
    ["bio",          "string",  "No", "Max 500 chars", "Updated short bio."],
    ["biography",    "string",  "No", "-",             "Updated long biography."],
    ["categories",   "array",   "No", "-",             "Updated categories array."],
    ["expertise",    "string",  "No", "-",             "Updated expertise."],
    ["location",     "string",  "No", "-",             "Updated location."],
    ["birth_year",   "integer", "No", "-",             "Updated birth year."],
    ["avatar",       "string",  "No", "URL",           "Updated avatar image URL."],
    ["cover_image",  "string",  "No", "URL",           "Updated profile cover image URL."],
    ["website",      "string",  "No", "URL",           "Updated website URL."],
    ["twitter",      "string",  "No", "URL",           "Updated Twitter URL."],
    ["instagram",    "string",  "No", "URL",           "Updated Instagram URL."],
    ["facebook",     "string",  "No", "URL",           "Updated Facebook URL."],
    ["youtube",      "string",  "No", "URL",           "Updated YouTube URL."],
  ],
  exReq: [
    "PATCH /api/lekhak/me",
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "tagline": "Exploring the depths of Vedic wisdom",',
    '  "avatar": "https://cdn.shivamarg.com/avatars/ram-new.jpg"',
    "}",
  ],
  exRes: ["{ /* Updated Full Author Object */ }"],
  codes: [
    { code: 200, desc: "Profile updated", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "No author profile found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.7  Add a Book",
  method: "POST", path: "/api/lekhak/me/books",
  desc: "Add a book entry to the authenticated author's bibliography. Each book gets a unique auto-generated id.",
  auth: true,
  bodyParams: [
    ["title",     "string",  "Yes", "1–255 chars", "Book title."],
    ["year",      "integer", "No",  "-",           "Publication year."],
    ["publisher", "string",  "No",  "-",           "Publisher name."],
    ["cover_url", "string",  "No",  "URL",         "Book cover image URL."],
    ["link",      "string",  "No",  "URL",         "Link to purchase or read the book."],
  ],
  exReq: [
    "POST /api/lekhak/me/books",
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "title": "Shiva Purana: A Modern Commentary",',
    '  "year": 2022,',
    '  "publisher": "Vedic Press",',
    '  "cover_url": "https://cdn.shivamarg.com/books/shiva-purana.jpg"',
    "}",
  ],
  exRes: [
    "{",
    '  "book": {',
    '    "id": "64e1f2a3b4c5d6789abc0030",',
    '    "title": "Shiva Purana: A Modern Commentary",',
    '    "year": 2022,',
    '    "publisher": "Vedic Press",',
    '    "cover_url": "https://cdn.shivamarg.com/books/shiva-purana.jpg",',
    '    "link": ""',
    "  },",
    '  "message": "किताब जोड़ी गई"',
    "}",
  ],
  codes: [
    { code: 201, desc: "Book added", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "No author profile found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.8  Delete a Book",
  method: "DELETE", path: "/api/lekhak/me/books/{book_id}",
  desc: "Remove a book from the authenticated author's bibliography by its book id.",
  auth: true,
  params: [["book_id", "string", "The id field of the book entry (generated at creation time)."]],
  exReq: [
    "DELETE /api/lekhak/me/books/64e1f2a3b4c5d6789abc0030",
    "Authorization: Bearer <token>",
  ],
  exRes: ["// 204 No Content — empty body"],
  codes: [
    { code: 204, desc: "Book deleted", fill: C.green },
    { code: 401, desc: "Unauthorized" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.9  Add a Contribution",
  method: "POST", path: "/api/lekhak/me/contributions",
  desc: "Add a literary or academic contribution to the author's profile. Each entry gets a unique auto-generated id.",
  auth: true,
  bodyParams: [
    ["title",       "string",  "Yes", "1–255 chars", "Contribution title."],
    ["description", "string",  "Yes", "Non-empty",   "Description of the contribution."],
    ["year",        "integer", "Yes", "-",           "Year of the contribution."],
  ],
  exReq: [
    "POST /api/lekhak/me/contributions",
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "title": "Research Paper: Shiva in Maithili Literature",',
    '  "description": "Published in Journal of Indian Studies, Vol 12.",',
    '  "year": 2021',
    "}",
  ],
  exRes: [
    "{",
    '  "contribution": {',
    '    "id": "64e1f2a3...",',
    '    "title": "Research Paper: Shiva in Maithili Literature",',
    '    "description": "Published in Journal of Indian Studies, Vol 12.",',
    '    "year": 2021',
    "  },",
    '  "message": "योगदान जोड़ा गया"',
    "}",
  ],
  codes: [
    { code: 201, desc: "Contribution added", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "No author profile found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.10  Delete a Contribution",
  method: "DELETE", path: "/api/lekhak/me/contributions/{item_id}",
  desc: "Remove a contribution entry from the author's profile.",
  auth: true,
  params: [["item_id", "string", "The id field of the contribution entry."]],
  exReq: [
    "DELETE /api/lekhak/me/contributions/64e1f2a3b4c5d6789abc0031",
    "Authorization: Bearer <token>",
  ],
  exRes: ["// 204 No Content — empty body"],
  codes: [
    { code: 204, desc: "Contribution deleted", fill: C.green },
    { code: 401, desc: "Unauthorized" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.11  Add an Activity",
  method: "POST", path: "/api/lekhak/me/activities",
  desc: "Add a public activity or event (e.g. lecture, seminar, award) to the author's profile.",
  auth: true,
  bodyParams: [
    ["title",       "string", "Yes", "1–255 chars", "Activity or event title."],
    ["description", "string", "Yes", "Non-empty",   "Description of the activity."],
    ["date",        "string", "Yes", "Date string", "Date of the activity (e.g. 2024-03-15)."],
  ],
  exReq: [
    "POST /api/lekhak/me/activities",
    "Authorization: Bearer <token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "title": "Keynote at Varanasi Sanskrit Conference",',
    '  "description": "Presented research on Maithili devotional poetry.",',
    '  "date": "2024-03-15"',
    "}",
  ],
  exRes: [
    "{",
    '  "activity": {',
    '    "id": "64e1f2a3...",',
    '    "title": "Keynote at Varanasi Sanskrit Conference",',
    '    "description": "Presented research on Maithili devotional poetry.",',
    '    "date": "2024-03-15"',
    "  },",
    '  "message": "गतिविधि जोड़ी गई"',
    "}",
  ],
  codes: [
    { code: 201, desc: "Activity added", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "No author profile found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.12  Delete an Activity",
  method: "DELETE", path: "/api/lekhak/me/activities/{item_id}",
  desc: "Remove an activity entry from the author's profile.",
  auth: true,
  params: [["item_id", "string", "The id field of the activity entry."]],
  exReq: [
    "DELETE /api/lekhak/me/activities/64e1f2a3b4c5d6789abc0032",
    "Authorization: Bearer <token>",
  ],
  exRes: ["// 204 No Content — empty body"],
  codes: [
    { code: 204, desc: "Activity deleted", fill: C.green },
    { code: 401, desc: "Unauthorized" },
  ],
}));

children.push(...buildEndpoint({
  heading: "4.13  Follow / Unfollow an Author",
  method: "POST", path: "/api/lekhak/{slug}/follow",
  desc: "Toggle following an author. Calling again removes the follow. Returns the updated follower count and follow state.",
  auth: true,
  params: [["slug", "string", "URL slug of the author to follow/unfollow."]],
  exReq: [
    "POST /api/lekhak/pandit-ram-kumar/follow",
    "Authorization: Bearer <token>",
  ],
  exRes: [
    "{",
    '  "is_following": true,',
    '  "followers_count": 129,',
    '  "message": "अनुसरण की स्थिति बदली"',
    "}",
  ],
  codes: [
    { code: 200, desc: "Follow toggled", fill: C.green },
    { code: 401, desc: "Unauthorized" },
    { code: 404, desc: "Author not found" },
  ],
}));

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — ADMIN
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("5  Admin Endpoints"));
children.push(new Paragraph({
  spacing: { before: 0, after: 200 },
  shading: { fill: "FFF4CE", type: ShadingType.CLEAR },
  indent: { left: 120, right: 120 },
  children: [
    run("⚠  Warning: ", { bold: true, color: "7A5B00" }),
    run("All endpoints in this section require role: admin or editor unless noted otherwise. Super-admin-only endpoints explicitly state role: admin.", { color: "7A5B00" }),
  ],
}));
children.push(spacer(80));

children.push(...buildEndpoint({
  heading: "5.1  Dashboard Stats",
  method: "GET", path: "/api/admin/dashboard/stats",
  desc: "Returns a comprehensive platform statistics snapshot. Includes counts for all content types, user registrations, and activity over the last 7 days.",
  auth: true, role: "editor / admin",
  exReq: [
    "GET /api/admin/dashboard/stats",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "total_users": 1240,',
    '  "total_comments": 8760,',
    '  "total_posts": 156,',
    '  "featured_posts": 12,',
    '  "total_articles": 94,',
    '  "published_articles": 61,',
    '  "draft_articles": 18,',
    '  "pending_articles": 5,',
    '  "rejected_articles": 8,',
    '  "archived_articles": 2,',
    '  "total_authors": 34,',
    '  "recent_users_7d": 47,',
    '  "recent_comments_7d": 320,',
    '  "recent_articles_7d": 6,',
    '  "recent_authors_7d": 3,',
    '  "pending_articles_7d": 4',
    "}",
  ],
  codes: [
    { code: 200, desc: "Stats returned", fill: C.green },
    { code: 403, desc: "Insufficient role" },
    { code: 500, desc: "Server error" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.2  List All Users",
  method: "GET", path: "/api/admin/users",
  desc: "Returns all registered users, sorted by creation date descending. Supports filtering by role.",
  auth: true, role: "editor / admin",
  queryParams: [
    ["skip",  "integer", "No", "0",   "Number to skip."],
    ["limit", "integer", "No", "100", "Results per page. Max 100."],
    ["role",  "string",  "No", "all", "Filter by role: user, lekhak, editor, admin."],
  ],
  exReq: [
    "GET /api/admin/users?role=lekhak&limit=50",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "users": [ /* Array of User Objects */ ],',
    '  "total": 34,',
    '  "limit": 50,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Users returned", fill: C.green },
    { code: 403, desc: "Insufficient role" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.3  List All Comments (Admin)",
  method: "GET", path: "/api/admin/comments",
  desc: "Returns all comments across the platform, sorted by creation date descending. Optionally filter by page_id. Also returns the distinct list of all page IDs that have comments.",
  auth: true, role: "editor / admin",
  queryParams: [
    ["skip",    "integer", "No", "0",  "Number to skip."],
    ["limit",   "integer", "No", "50", "Results per page. Max 50."],
    ["page_id", "string",  "No", "\"\"","Filter by specific page_id."],
  ],
  exReq: [
    "GET /api/admin/comments?page_id=shiv-aarti&limit=25",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "comments": [ /* Array of Comment Objects */ ],',
    '  "total": 87,',
    '  "pages": ["shiv-aarti", "om-namah-shivaya", "maha-mrityunjay"],',
    '  "limit": 25,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Comments returned", fill: C.green },
    { code: 403, desc: "Insufficient role" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.4  List All Vidyapati Posts (Admin)",
  method: "GET", path: "/api/admin/posts",
  desc: "Returns all Vidyapati posts with admin-level access. Also returns the distinct category list. Supports filtering by category.",
  auth: true, role: "editor / admin",
  queryParams: [
    ["skip",     "integer", "No", "0",  "Number to skip."],
    ["limit",    "integer", "No", "50", "Results per page. Max 50."],
    ["category", "string",  "No", "\"\"","Filter by category name."],
  ],
  exReq: [
    "GET /api/admin/posts?category=Devotional&limit=20",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "posts": [ /* Array of Post Objects */ ],',
    '  "total": 48,',
    '  "categories": ["Devotional", "Bhajan", "Stuti", "Aarti"],',
    '  "limit": 20,',
    '  "skip": 0',
    "}",
  ],
  codes: [
    { code: 200, desc: "Posts returned", fill: C.green },
    { code: 403, desc: "Insufficient role" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.5  Update User Role",
  method: "PATCH", path: "/api/admin/users/{user_id}/role",
  desc: "Change a specific user's role. Super admin only. Valid roles: user, lekhak, editor, admin.",
  auth: true, role: "admin (super admin only)",
  params: [["user_id", "string", "MongoDB ObjectId of the target user."]],
  bodyParams: [
    ["role", "string", "Yes", "user | lekhak | editor | admin", "The new role to assign."],
  ],
  exReq: [
    "PATCH /api/admin/users/64a1b2c3d4e5f6789abc0001/role",
    "Authorization: Bearer <admin_token>",
    "Content-Type: application/json",
    "",
    "{",
    '  "role": "lekhak"',
    "}",
  ],
  exRes: ["{ /* Updated User Object with new role */ }"],
  codes: [
    { code: 200, desc: "Role updated", fill: C.green },
    { code: 400, desc: "Invalid role value" },
    { code: 403, desc: "Not super admin" },
    { code: 404, desc: "User not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.6  Admin Delete a Comment",
  method: "DELETE", path: "/api/admin/comments/{comment_id}",
  desc: "Permanently delete any comment on the platform. Admins and editors can delete any comment regardless of ownership.",
  auth: true, role: "editor / admin",
  params: [["comment_id", "string", "MongoDB ObjectId of the comment to delete."]],
  exReq: [
    "DELETE /api/admin/comments/64b1c2d3e4f5a6789abc0010",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "status": "deleted",',
    '  "id": "64b1c2d3e4f5a6789abc0010"',
    "}",
  ],
  codes: [
    { code: 200, desc: "Comment deleted", fill: C.green },
    { code: 400, desc: "Invalid comment_id format" },
    { code: 403, desc: "Insufficient role" },
    { code: 404, desc: "Comment not found" },
  ],
}));

children.push(...buildEndpoint({
  heading: "5.7  Admin Delete a User",
  method: "DELETE", path: "/api/admin/users/{user_id}",
  desc: "Permanently delete a user account. Also deletes all their comments and their author profile (cascade delete). Cannot delete yourself.",
  auth: true, role: "admin (super admin only)",
  notes: "This is a cascading delete. Removing a user also removes all their comments and their author profile from the database.",
  params: [["user_id", "string", "MongoDB ObjectId of the user to delete."]],
  exReq: [
    "DELETE /api/admin/users/64a1b2c3d4e5f6789abc0001",
    "Authorization: Bearer <admin_token>",
  ],
  exRes: [
    "{",
    '  "status": "deleted",',
    '  "id": "64a1b2c3d4e5f6789abc0001",',
    '  "comments_deleted": 42',
    "}",
  ],
  codes: [
    { code: 200, desc: "User deleted", fill: C.green },
    { code: 400, desc: "Invalid user_id or cannot delete yourself" },
    { code: 403, desc: "Not super admin" },
    { code: 404, desc: "User not found" },
  ],
}));

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 6 — HEALTH
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("6  Health Check"));
children.push(para("The health endpoint provides a quick liveness and readiness check. It verifies the API is running and returns live document counts from all collections. No authentication required."));
children.push(spacer(120));

children.push(...buildEndpoint({
  heading: "6.1  Health Check",
  method: "GET", path: "/api/health",
  desc: "Returns the API status, version, database name, live collection document counts, and article counts broken down by status. Use this endpoint for uptime monitoring and deployment verification.",
  auth: false,
  exReq: ["GET /api/health"],
  exRes: [
    "{",
    '  "status": "ok",',
    '  "db": "ShivMarg",',
    '  "version": "3.1.0",',
    '  "collections": {',
    '    "users": 1240,',
    '    "comments": 8760,',
    '    "articles": 94,',
    '    "authors": 34',
    "  },",
    '  "articles_by_status": {',
    '    "draft": 18,',
    '    "pending_approval": 5,',
    '    "published": 61,',
    '    "rejected": 8,',
    '    "archived": 2',
    "  }",
    "}",
  ],
  codes: [
    { code: 200, desc: "API is healthy", fill: C.green },
    { code: 500, desc: "Database unreachable" },
  ],
}));

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 7 — QUICK REFERENCE
// ════════════════════════════════════════════════════════════════════════════
children.push(para("", { pageBreak: true }));
children.push(h1("7  Quick Reference — Part 2"));
children.push(para("All 35 endpoints documented in this part at a glance."));
children.push(spacer(120));
children.push(
  paramsTable(
    ["Method", "Endpoint", "Auth", "Role", "Description"],
    [
      ["GET",    "/api/users/{user_id}/comments",          "No",    "-",             "User's comment history"],
      ["GET",    "/api/users/{user_id}/profile",           "No",    "-",             "Public user profile"],
      ["GET",    "/api/posts/latest",                      "No",    "-",             "Latest Vidyapati posts"],
      ["GET",    "/api/posts/featured",                    "No",    "-",             "Featured posts only"],
      ["GET",    "/api/posts/search",                      "No",    "-",             "Search posts"],
      ["GET",    "/api/posts/{post_id}",                   "No",    "-",             "Get post by ID"],
      ["GET",    "/api/articles/popular",                  "No",    "-",             "Top articles by views"],
      ["GET",    "/api/articles/latest",                   "No",    "-",             "Most recent articles"],
      ["GET",    "/api/articles/categories",               "No",    "-",             "All article categories"],
      ["GET",    "/api/articles/search",                   "No",    "-",             "Search articles"],
      ["GET",    "/api/articles/pending",                  "Yes",   "admin",         "Articles awaiting review"],
      ["GET",    "/api/articles/my",                       "Yes",   "any",           "Author's own articles"],
      ["DELETE", "/api/articles/{slug}",                   "Yes",   "owner/admin",   "Delete an article"],
      ["POST",   "/api/articles/{slug}/like",              "Yes",   "any",           "Like/unlike article"],
      ["PATCH",  "/api/articles/{slug}/status",            "Yes",   "editor/admin",  "Change article status"],
      ["POST",   "/api/articles/{slug}/submit",            "Yes",   "owner",         "Submit for review"],
      ["POST",   "/api/articles/{slug}/review",            "Yes",   "admin",         "Approve/reject article"],
      ["POST",   "/api/lekhak/register",                   "Yes",   "any",           "Register as author"],
      ["GET",    "/api/lekhak",                            "No",    "-",             "List all authors"],
      ["GET",    "/api/lekhak/me",                         "Yes",   "any",           "My author profile"],
      ["GET",    "/api/lekhak/{slug}",                     "No",    "-",             "Author profile by slug"],
      ["GET",    "/api/lekhak/{slug}/articles",            "No",    "-",             "Author's articles"],
      ["PATCH",  "/api/lekhak/me",                         "Yes",   "any",           "Update my profile"],
      ["POST",   "/api/lekhak/me/books",                   "Yes",   "any",           "Add book"],
      ["DELETE", "/api/lekhak/me/books/{book_id}",         "Yes",   "any",           "Delete book"],
      ["POST",   "/api/lekhak/me/contributions",           "Yes",   "any",           "Add contribution"],
      ["DELETE", "/api/lekhak/me/contributions/{item_id}", "Yes",   "any",           "Delete contribution"],
      ["POST",   "/api/lekhak/me/activities",              "Yes",   "any",           "Add activity"],
      ["DELETE", "/api/lekhak/me/activities/{item_id}",    "Yes",   "any",           "Delete activity"],
      ["POST",   "/api/lekhak/{slug}/follow",              "Yes",   "any",           "Follow/unfollow author"],
      ["GET",    "/api/admin/dashboard/stats",             "Yes",   "editor/admin",  "Platform stats"],
      ["GET",    "/api/admin/users",                       "Yes",   "editor/admin",  "List all users"],
      ["GET",    "/api/admin/comments",                    "Yes",   "editor/admin",  "All comments"],
      ["GET",    "/api/admin/posts",                       "Yes",   "editor/admin",  "All Vidyapati posts"],
      ["PATCH",  "/api/admin/users/{user_id}/role",        "Yes",   "admin",         "Update user role"],
      ["DELETE", "/api/admin/comments/{comment_id}",       "Yes",   "editor/admin",  "Delete any comment"],
      ["DELETE", "/api/admin/users/{user_id}",             "Yes",   "admin",         "Delete user (cascade)"],
      ["GET",    "/api/health",                            "No",    "-",             "Health check"],
    ],
    [700, 3400, 700, 1400, 3160]
  ),
  spacer(240),
);

// ── Footer page ───────────────────────────────────────────────────────────────
children.push(
  para("", { pageBreak: true }),
  spacer(2400),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: "ShivMarg API Reference — Part 2", font: "Segoe UI", size: 28, bold: true, color: C.blue })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "Version 3.1.0  •  35 Endpoints Documented", font: "Segoe UI", size: 18, color: C.gray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "Combined with Part 1: 63 total endpoints covered", font: "Segoe UI", size: 18, color: C.gray })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Confidential — For Authorized Developers Only", font: "Segoe UI", size: 16, color: C.gray, italics: true })] }),
);

// ════════════════════════════════════════════════════════════════════════════
//  ASSEMBLE
// ════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: { config: [] },
  styles: {
    default: { document: { run: { font: "Segoe UI", size: 20, color: C.darkGray } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Segoe UI", color: C.darkBlue },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.blue, space: 6 } } },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Segoe UI", color: C.darkBlue },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Segoe UI", color: C.blue },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: 0 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 6 } },
          children: [new TextRun({ text: "ShivMarg API Reference  v3.1.0  |  Part 2", font: "Segoe UI", size: 16, color: C.gray })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.lightGray, space: 6 } },
          children: [
            new TextRun({ text: "Page ", font: "Segoe UI", size: 16, color: C.gray }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Segoe UI", size: 16, color: C.gray }),
            new TextRun({ text: " of ", font: "Segoe UI", size: 16, color: C.gray }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Segoe UI", size: 16, color: C.gray }),
            new TextRun({ text: "  •  Confidential", font: "Segoe UI", size: 16, color: C.gray }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/ShivMarg_API_Reference_Part2_v3.1.0.docx', buf);
  console.log('Done!');
}).catch(console.error);