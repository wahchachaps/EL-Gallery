const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PRIVATE_NOTE_LENGTH = 2000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SUPPORTED_TYPES = new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/webm"
]);

const SESSION_COOKIE = "__Host-el_gallery_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const ACCOUNTS = {
    husbun: { username: "husbun", displayName: "Husbun", secret: "GALLERY_LOGIN_PASSWORD" },
    wifebun: { username: "wifebun", displayName: "Wifebun", secret: "GALLERY_WIFEBUN_PASSWORD" }
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const cors = corsHeaders(request, env);

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: cors });
        }

        try {
            let response;

            if (url.pathname === "/api/auth/login" ||
                url.pathname === "/api/auth/logout" ||
                url.pathname === "/api/auth/me") {
                response = await handleAuth(request, env, url);
            } else if (!isAllowedOrigin(request, env)) {
                response = json({ error: "Forbidden." }, 403);
            } else {
                const session = await sessionAuthorized(request, env);
                if (!session.authenticated) {
                    response = json({ error: "Unauthorized." }, 401);
                } else {
                    response = await routeProtectedRequest(request, env, url, session.account);
                }
            }

            cors.forEach((value, key) => response.headers.set(key, value));
            return response;
        } catch (error) {
            console.error(error);
            const response = error instanceof ServiceUnavailableError
                ? json({ error: "The gallery is temporarily unavailable." }, 503)
                : json({ error: "The request could not be completed." }, 500);
            cors.forEach((value, key) => response.headers.set(key, value));
            return response;
        }
    }
};

async function routeProtectedRequest(request, env, url, account) {
    if (url.pathname === "/api/favorites" || url.pathname.startsWith("/api/favorites/")) {
        return handleFavorites(request, env, url, account);
    }
    if (url.pathname === "/api/letters" || url.pathname.startsWith("/api/letters/")) {
        return handleLetters(request, env, url, account);
    }
    if (url.pathname === "/api/memories" && request.method === "GET") {
        return listMemories(request, env);
    }
    if (url.pathname === "/api/upload" && request.method === "POST") {
        return uploadMemory(request, env, account);
    }
    if (url.pathname.startsWith("/api/media/") && ["GET", "HEAD"].includes(request.method)) {
        return serveMedia(request, env, url.pathname.slice("/api/media/".length));
    }
    const match = url.pathname.match(/^\/api\/memories\/([^/]+)$/);
    if (match && request.method === "PATCH") return editMemory(request, env, decodeURIComponent(match[1]), account);
    if (match && request.method === "DELETE") return deleteMemory(request, env, decodeURIComponent(match[1]));
    return json({ error: "Not found." }, 404);
}

function corsHeaders(request, env) {
    const configured = (env.ALLOWED_ORIGIN || "https://wahchachaps.github.io")
        .split(",")
        .map(value => value.trim());
    const origin = request.headers.get("Origin");
    const allowedOrigin = configured.includes(origin) ? origin : configured[0];

    return new Headers({
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range, ETag, Accept-Ranges",
        Vary: "Origin"
    });
}

function isAllowedOrigin(request, env) {
    const origin = request.headers.get("Origin");
    if (!origin) return true;
    const configured = (env.ALLOWED_ORIGIN || "https://wahchachaps.github.io")
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);
    return configured.includes(origin);
}

function json(body, status = 200, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {"Content-Type": "application/json; charset=utf-8","Cache-Control": "no-store",...headers}
    });
}

function validDate(value) {
    if (!DATE_PATTERN.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizePrivateNote(value) {
    if (value === null || value === undefined || value === "") {
        return { value: null };
    }
    if (typeof value !== "string") {
        return { error: "private_note must be a string or null." };
    }
    const note = value.trim();
    if (note.length > MAX_PRIVATE_NOTE_LENGTH) {
        return { error: "Private notes can contain up to 2000 characters." };
    }
    return { value: note || null };
}

function mediaType(mimeType) {
    if (mimeType === "image/gif") return "gif";
    if (mimeType.startsWith("video/")) return "video";
    return "image";
}

function serializeMemory(row, request) {
    const origin = new URL(request.url).origin;
    return {
        id: row.id,
        type: row.media_type,
        src: `${origin}/api/media/${encodeURIComponent(row.file_key)}`,
        date: row.memory_date,
        caption: row.caption,
        originalName: row.original_name,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        groupId: row.group_id ?? null,
        groupOrder: Number.isInteger(row.group_order) ? row.group_order : null,
        privateNote: row.private_note ?? null
        ,uploadedBy: row.uploaded_by ?? null
        ,editedBy: row.edited_by ?? null
        ,editedAt: row.edited_at ?? null
    };
}

async function supabase(env, path, options = {}) {
    const secretKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!env.SUPABASE_URL || !secretKey) {
        throw new Error("Supabase Worker secrets are not configured.");
    }
    const authorization = secretKey.startsWith("eyJ")
        ? { Authorization: `Bearer ${secretKey}` }
        : {};
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: secretKey,
            ...authorization,
            ...options.headers
        }
    });
    if (!response.ok) {
        throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
    }
    if (response.status === 204) return null;
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : null;
}

function requestCookie(request, name) {
    const cookies = request.headers.get("Cookie") || "";
    const item = cookies.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
    return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

async function sha256Hex(value) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function passwordMatches(input, configured) {
    if (typeof configured !== "string" || !configured) return false;

    const inputHash = await sha256Hex(input);
    const configuredVerifier = configured.match(/^sha256:([0-9a-f]{64})$/i)?.[1];
    const candidateHashes = configuredVerifier
        ? [configuredVerifier.toLowerCase()]
        : [...new Set([
            configured,
            configured.trim(),
            configured.replace(/^(['"])(.*)\1$/, "$2")
        ])].filter(Boolean).map(value => sha256Hex(value));
    const hashes = configuredVerifier ? candidateHashes : await Promise.all(candidateHashes);

    return hashes.some(configuredHash => {
        let difference = inputHash.length ^ configuredHash.length;
        for (let index = 0; index < Math.max(inputHash.length, configuredHash.length); index += 1) {
            difference |= (inputHash.charCodeAt(index) || 0) ^ (configuredHash.charCodeAt(index) || 0);
        }
        return difference === 0;
    });
}

async function sessionAuthorized(request, env) {
    const token = requestCookie(request, SESSION_COOKIE);
    if (!token) return { authenticated: false, reason: "missing" };
    try {
        const hash = await sha256Hex(token);
        const rows = await supabase(env, `gallery_sessions?token_hash=eq.${hash}&revoked_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,username,account_username,display_name&limit=1`);
        if (!rows.length) return { authenticated: false, reason: "expired" };
        const storedUsername = rows[0].account_username || rows[0].username;
        const username = storedUsername === "elvince" ? "husbun" : storedUsername;
        const account = ACCOUNTS[username];
        return account
            ? { authenticated: true, reason: "valid", account }
            : { authenticated: false, reason: "legacy-unknown-account" };
    } catch (error) {
        throw new ServiceUnavailableError("Session validation is temporarily unavailable.");
    }
}

class ServiceUnavailableError extends Error {
    constructor(message) {
        super(message);
        this.name = "ServiceUnavailableError";
    }
}

async function loginRateLimit(request, env, failed) {
    if (!env.AUTH_RATE_LIMIT) return { blocked: false };
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const key = `login:${await sha256Hex(ip)}`;
    const current = await env.AUTH_RATE_LIMIT.get(key, { type: "json" }) || { failures: 0 };
    if (!failed) return { blocked: current.failures >= MAX_LOGIN_FAILURES };
    const failures = current.failures + 1;
    await env.AUTH_RATE_LIMIT.put(key, JSON.stringify({ failures }), { expirationTtl: LOGIN_WINDOW_SECONDS });
    return { blocked: failures >= MAX_LOGIN_FAILURES };
}

function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=None`;
}

async function handleAuth(request, env, url) {
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
        const session = await sessionAuthorized(request, env);
        return json({
            authenticated: session.authenticated,
            ...(session.account ? { user: { username: session.account.username, displayName: session.account.displayName } } : {})
        });
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        const token = requestCookie(request, SESSION_COOKIE);
        if (token) {
            try {
                const hash = await sha256Hex(token);
                await supabase(env, `gallery_sessions?token_hash=eq.${hash}&revoked_at=is.null`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
                    body: JSON.stringify({ revoked_at: new Date().toISOString() })
                });
            } catch {
                // Clearing the browser cookie still prevents this client from reusing it.
            }
        }
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    }

    if (url.pathname !== "/api/auth/login" || request.method !== "POST") {
        return json({ error: "Method not allowed." }, 405);
    }
    if (!env.GALLERY_LOGIN_PASSWORD || !env.GALLERY_WIFEBUN_PASSWORD || !env.SUPABASE_URL || !(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)) {
        return json({ error: "Authentication is not configured." }, 503);
    }
    const limited = await loginRateLimit(request, env, false);
    if (limited.blocked) return json({ error: "Too many attempts. Try again later." }, 429, { "Retry-After": String(LOGIN_WINDOW_SECONDS) });
    const input = await request.json().catch(() => null);
    const username = typeof input?.username === "string" ? input.username.trim() : "";
    const password = typeof input?.password === "string" ? input.password : "";
    const account = ACCOUNTS[username];
    if (!account || !(await passwordMatches(password, env[account.secret]))) {
        await loginRateLimit(request, env, true);
        return json({ error: "Incorrect username or password." }, 401);
    }
    const token = randomToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    await supabase(env, "gallery_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ token_hash: await sha256Hex(token), username, account_username: account.username, display_name: account.displayName, expires_at: expiresAt })
    });
    return json({ ok: true, user: { username: account.username, displayName: account.displayName } }, 200, { "Set-Cookie": sessionCookie(token) });
}

const selectRows = (env, query) =>
    supabase(env, `memories?${query}`, { method: "GET" });

async function listMemories(request, env) {
    const rows = await selectRows(env, "select=*&order=memory_date.asc,created_at.asc");
    return json({ memories: rows.map(row => serializeMemory(row, request)) });
}

async function uploadMemory(request, env, account) {
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_FILE_SIZE + 1024 * 1024) {
        return json({ error: "Each file must be 100 MB or smaller." }, 413);
    }

    const form = await request.formData();
    const file = form.get("file");
    const date = String(form.get("date") || "");
    const caption = String(form.get("caption") || "").trim() || "Untitled memory";
    const rawGroupId = String(form.get("group_id") || "").trim();
    const rawGroupOrder = String(form.get("group_order") || "").trim();
    const privateNote = normalizePrivateNote(form.get("private_note"));

    if (!(file instanceof File)) return json({ error: "A media file is required." }, 400);
    if (!SUPPORTED_TYPES.has(file.type)) return json({ error: "Unsupported media type." }, 415);
    if (file.size > MAX_FILE_SIZE) return json({ error: "Each file must be 100 MB or smaller." }, 413);
    if (!validDate(date)) return json({ error: "A valid date is required." }, 400);
    if (caption.length > 100) return json({ error: "Caption must be 100 characters or fewer." }, 400);
    if (privateNote.error) return json({ error: privateNote.error }, 400);

    let groupId = null;
    let groupOrder = null;
    if (rawGroupId) {
        if (!UUID_PATTERN.test(rawGroupId)) return json({ error: "group_id must be a valid UUID." }, 400);
        if (!/^\d+$/.test(rawGroupOrder)) return json({ error: "group_order must be a non-negative integer." }, 400);
        groupId = rawGroupId;
        groupOrder = Number(rawGroupOrder);
        if (!Number.isSafeInteger(groupOrder)) return json({ error: "group_order is out of range." }, 400);
    } else if (rawGroupOrder) {
        return json({ error: "group_order requires group_id." }, 400);
    }

    if (groupId) {
        const existing = await selectRows(env, `group_id=eq.${encodeURIComponent(groupId)}&group_order=eq.${groupOrder}&select=*`);
        if (existing.length) return json({ memory: serializeMemory(existing[0], request) });
    }

    const extension = file.name.includes(".")
        ? `.${file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "")}`
        : "";
    const fileKey = `${date}/${crypto.randomUUID()}${extension}`;
    await env.MEDIA_BUCKET.put(fileKey, file.stream(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { originalName: file.name }
    });

    try {
        const rows = await supabase(env, "memories", {
            method: "POST",
            headers: { "Content-Type": "application/json", Prefer: "return=representation" },
            body: JSON.stringify({
                caption,
                memory_date: date,
                media_type: mediaType(file.type),
                file_key: fileKey,
                original_name: file.name,
                mime_type: file.type,
                file_size: file.size,
                group_id: groupId,
                group_order: groupOrder,
                private_note: privateNote.value
                ,uploaded_by: account.username
            })
        });
        return json({ memory: serializeMemory(rows[0], request) }, 201);
    } catch (error) {
        await env.MEDIA_BUCKET.delete(fileKey);
        throw error;
    }
}

async function serveMedia(request, env, encodedKey) {
    const object = await env.MEDIA_BUCKET.get(decodeURIComponent(encodedKey), { range: request.headers });
    if (!object) return json({ error: "Media not found." }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    if (object.range) {
        const offset = object.range.offset || 0;
        const length = object.range.length || object.size;
        headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
        headers.set("Content-Length", String(length));
    } else {
        headers.set("Content-Length", String(object.size));
    }
    return new Response(request.method === "HEAD" ? null : object.body, {
        status: object.range ? 206 : 200,
        headers
    });
}

async function editMemory(request, env, id, account) {
    const body = await request.json().catch(() => null);
    if (!body || !validDate(String(body.date || ""))) return json({ error: "A valid date is required." }, 400);
    if (typeof body.caption !== "string") return json({ error: "Caption must be a string." }, 400);
    const caption = body.caption.trim();
    if (caption.length > 100) return json({ error: "Caption must be 100 characters or fewer." }, 400);

    const hasPrivateNote = Object.prototype.hasOwnProperty.call(body, "private_note") ||
        Object.prototype.hasOwnProperty.call(body, "privateNote");
    const privateNote = normalizePrivateNote(body.private_note ?? body.privateNote);
    if (hasPrivateNote && privateNote.error) return json({ error: privateNote.error }, 400);

    const found = await selectRows(env, `id=eq.${encodeURIComponent(id)}&select=*`);
    if (!found.length) return json({ error: "Memory not found." }, 404);
    const current = found[0];
    const filter = current.group_id
        ? `group_id=eq.${encodeURIComponent(current.group_id)}`
        : `id=eq.${encodeURIComponent(id)}`;
    const changes = { caption, memory_date: body.date };
    if (hasPrivateNote) changes.private_note = privateNote.value;
    changes.edited_by = account.username;
    changes.edited_at = new Date().toISOString();

    const rows = await supabase(env, `memories?${filter}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(changes)
    });
    const serialized = rows.map(row => serializeMemory(row, request));
    return json({
        memory: serialized.find(memory => memory.id === id) || serialized[0],
        memories: serialized
    });
}

async function deleteMemory(request, env, id) {
    const found = await selectRows(env, `id=eq.${encodeURIComponent(id)}&select=*`);
    if (!found.length) return json({ error: "Memory not found." }, 404);
    const current = found[0];
    await supabase(env, `memories?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
    });
    // The database foreign key also cascades this cleanup. Keep the explicit
    // delete for installations that were created before the favorites FK.
    await supabase(env, `gallery_favorites?memory_id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
    });
    await env.MEDIA_BUCKET.delete(current.file_key);

    if (current.group_id) {
        const remaining = await selectRows(env, `group_id=eq.${encodeURIComponent(current.group_id)}&select=*&order=group_order.asc,created_at.asc`);
        if (remaining.length === 1) {
            await supabase(env, `memories?id=eq.${encodeURIComponent(remaining[0].id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
                body: JSON.stringify({ group_id: null, group_order: null })
            });
        } else {
            await Promise.all(remaining.map((row, index) => row.group_order === index
                ? null
                : supabase(env, `memories?id=eq.${encodeURIComponent(row.id)}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
                    body: JSON.stringify({ group_order: index })
                })));
        }
    }
    return json({ success: true });
}

async function handleFavorites(request, env, url, account) {
    if (
        !env.SUPABASE_URL ||
        !(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)
    ) {
        return json({ error: "Favorite storage is not configured." }, 503);
    }

    const collection = url.pathname === "/api/favorites";
    const match = url.pathname.match(/^\/api\/favorites\/([^/]+)$/);
    const memoryId = match ? decodeURIComponent(match[1]) : null;

    if (!collection && !match) return json({ error: "Not found." }, 404);
    if (memoryId && !UUID_PATTERN.test(memoryId)) {
        return json({ error: "Invalid memory ID." }, 400);
    }

    const scope = `gallery_scope=eq.private-gallery&account_username=eq.${encodeURIComponent(account.username)}`;

    if (collection && request.method === "GET") {
        const rows = await supabase(
            env,
            `gallery_favorites?${scope}&select=memory_id,created_at&order=created_at.asc`
        );
        return json({ favoriteIds: rows.map(row => row.memory_id) });
    }

    if (collection && request.method === "POST") {
        const input = await request.json().catch(() => null);
        if (!input || typeof input.memory_id !== "string" || !UUID_PATTERN.test(input.memory_id)) {
            return json({ error: "A valid memory_id is required." }, 400);
        }

        const found = await selectRows(env, `id=eq.${encodeURIComponent(input.memory_id)}&select=id&limit=1`);
        if (!found.length) return json({ error: "Memory not found." }, 404);

        await supabase(env, "gallery_favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Prefer: "resolution=ignore-duplicates,return=minimal"
            },
            body: JSON.stringify({
                gallery_scope: "private-gallery",
                account_username: account.username,
                memory_id: input.memory_id
            })
        });
        return json({ ok: true, memoryId: input.memory_id });
    }

    if (memoryId && request.method === "DELETE") {
        await supabase(env, `gallery_favorites?${scope}&memory_id=eq.${encodeURIComponent(memoryId)}`, {
            method: "DELETE",
            headers: { Prefer: "return=minimal" }
        });
        return json({ ok: true, memoryId });
    }

    return json({ error: "Method not allowed." }, 405, {
        Allow: collection ? "GET, POST" : "DELETE"
    });
}

const LETTER_MAX = {
    title: 120,
    sender: 80,
    recipient: 80,
    message: 12000,
    closing: 80,
    signature: 80
};

const LETTER_STYLES = {
    font_style: new Set(["normal", "handwritten"]),
    ink_color: new Set(["black", "navy", "burgundy"]),
    paper_style: new Set(["lined", "plain"])
};

function todayLetterDate() {
    return new Date().toISOString().slice(0, 10);
}

function decodeTokenPart(value) {
    const base64 = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        "="
    );

    return Uint8Array.from(
        atob(padded),
        character => character.charCodeAt(0)
    );
}

async function letterAuthorized(request, env) {
    const token = request.headers.get(
        "Cf-Access-Jwt-Assertion"
    );

    if (!token) return false;

    try {
        const parts = token.split(".");

        if (parts.length !== 3) return false;

        const decoder = new TextDecoder();

        const header = JSON.parse(
            decoder.decode(decodeTokenPart(parts[0]))
        );

        const claims = JSON.parse(
            decoder.decode(decodeTokenPart(parts[1]))
        );

        const issuer = `https://${env.CF_ACCESS_TEAM_DOMAIN}`;

        const audiences = Array.isArray(claims.aud)
            ? claims.aud
            : [claims.aud];

        const now = Date.now() / 1000;

        if (
            header.alg !== "RS256" ||
            claims.iss !== issuer ||
            !audiences.includes(env.CF_ACCESS_AUD) ||
            typeof claims.exp !== "number" ||
            claims.exp <= now ||
            (claims.nbf && claims.nbf > now)
        ) {
            return false;
        }

        const allowedEmails = env.ALLOWED_GALLERY_EMAILS
            .split(",")
            .map(value => value.trim().toLowerCase())
            .filter(Boolean);

        if (
            typeof claims.email !== "string" ||
            !allowedEmails.includes(
                claims.email.trim().toLowerCase()
            )
        ) {
            return false;
        }

        const response = await fetch(
            `${issuer}/cdn-cgi/access/certs`
        );

        if (!response.ok) return false;

        const { keys } = await response.json();

        const signingKey = keys.find(key =>
            key.kid === header.kid &&
            key.kty === "RSA"
        );

        if (!signingKey) return false;

        const key = await crypto.subtle.importKey(
            "jwk",
            signingKey,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            },
            false,
            ["verify"]
        );

        return await crypto.subtle.verify(
            "RSASSA-PKCS1-v1_5",
            key,
            decodeTokenPart(parts[2]),
            new TextEncoder().encode(
                `${parts[0]}.${parts[1]}`
            )
        );
    } catch {
        return false;
    }
}

function validateLetterInput(input) {
    if (
        !input ||
        typeof input !== "object" ||
        Array.isArray(input)
    ) {
        return { error: "A letter object is required." };
    }

    const data = {};

    if (typeof input.is_draft !== "boolean") {
        return { error: "is_draft must be boolean." };
    }

    const isDraft = input.is_draft;
    for (const field of ["title", "sender", "recipient", "message"]) {
        if (
            typeof input[field] !== "string" ||
            (!isDraft && !input[field].trim())
        ) {
            return { error: `${field} must be a nonblank string.` };
        }

        if (input[field].length > LETTER_MAX[field]) {
            return { error: `${field} is too long.` };
        }

        data[field] = field === "message" ? input[field] : input[field].trim();
    }

    if (isDraft && !data.title) data.title = "Untitled letter";

    for (const field of ["closing", "signature"]) {
        if (input[field] !== undefined && typeof input[field] !== "string") {
            return { error: `${field} must be a string.` };
        }
        if ((input[field] || "").length > LETTER_MAX[field]) {
            return { error: `${field} is too long.` };
        }
        data[field] = (input[field] || "").trim();
    }

    for (const field of Object.keys(LETTER_STYLES)) {
        if (input[field] !== undefined && !LETTER_STYLES[field].has(input[field])) {
            return { error: `${field} has an unsupported value.` };
        }
        data[field] = input[field] || (field === "font_style" ? "normal" : field === "ink_color" ? "black" : "lined");
    }

    if (typeof input.letter_date !== "string") {
        return { error: "letter_date must be a string." };
    }
    if (!input.letter_date && isDraft) {
        data.letter_date = todayLetterDate();
    } else if (!validDate(input.letter_date)) {
        return {
            error: "A valid letter_date is required (YYYY-MM-DD)."
        };
    } else {
        data.letter_date = input.letter_date;
    }
    data.is_draft = input.is_draft;

    return { data };
}

async function handleLetters(request, env, url, account) {
    if (
        !env.SUPABASE_URL ||
        !(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)
    ) {
        return json({
            error: "Letter storage is not configured."
        }, 503);
    }

    const collection = url.pathname === "/api/letters";

    const match = url.pathname.match(
        /^\/api\/letters\/([^/]+)$/
    );

    if (!collection && !match) {
        return json({ error: "Not found." }, 404);
    }

    const id = match?.[1];

    if (id && !UUID_PATTERN.test(id)) {
        return json({ error: "Invalid letter ID." }, 400);
    }

    const scope = "gallery_scope=eq.private-gallery";

    if (collection && request.method === "GET") {
        const rows = await supabase(
            env,
            `letters?${scope}&select=id,title,sender,recipient,letter_date,message,is_draft,font_style,ink_color,paper_style,closing,signature,created_at,updated_at,owner_username,author_username&order=letter_date.desc,updated_at.desc`
        );

        return json({ letters: rows.filter(row => !row.is_draft || row.owner_username === account.username) });
    }

    if (
        (collection && request.method === "POST") ||
        (id && request.method === "PATCH")
    ) {
        const input = await request.json().catch(() => null);

        const checked = validateLetterInput(input);

        if (checked.error) {
            return json({ error: checked.error }, 400);
        }

        const creating = collection;

        if (!creating) {
            const existing = await supabase(env, `letters?id=eq.${id}&${scope}&select=id,is_draft,owner_username&limit=1`);
            if (!existing.length || (existing[0].is_draft && existing[0].owner_username !== account.username)) {
                return json({ error: "Letter not found." }, 404);
            }
        }

        const path = creating
            ? "letters"
            : `letters?id=eq.${id}&${scope}`;

        const body = creating
            ? {
                ...checked.data,
                gallery_scope: "private-gallery",
                owner_username: checked.data.is_draft ? account.username : null,
                author_username: account.username
            }
            : {
                ...checked.data,
                owner_username: checked.data.is_draft ? account.username : null
            };

        const rows = await supabase(env, path, {
            method: creating ? "POST" : "PATCH",
            headers: {
                "Content-Type": "application/json",
                Prefer: "return=representation"
            },
            body: JSON.stringify(body)
        });

        if (!rows.length) {
            return json({ error: "Letter not found." }, 404);
        }

        return json(
            { letter: rows[0] },
            creating ? 201 : 200
        );
    }

    if (id && request.method === "DELETE") {
        const existing = await supabase(env, `letters?id=eq.${id}&${scope}&select=id,is_draft,owner_username&limit=1`);
        if (!existing.length || (existing[0].is_draft && existing[0].owner_username !== account.username)) {
            return json({ error: "Letter not found." }, 404);
        }
        const rows = await supabase(
            env,
            `letters?id=eq.${id}&${scope}`,
            {
                method: "DELETE",
                headers: {
                    Prefer: "return=representation"
                }
            }
        );

        return rows.length
            ? json({ ok: true })
            : json({ error: "Letter not found." }, 404);
    }

    return json(
        { error: "Method not allowed." },
        405,
        {
            Allow: collection
                ? "GET, POST"
                : "PATCH, DELETE"
        }
    );
}
