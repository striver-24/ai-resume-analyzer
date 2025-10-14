import { neon, neonConfig } from '@neondatabase/serverless';

// Enable fetch mode for better compatibility with Vercel
neonConfig.fetchConnectionCache = true;

// Get database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create SQL query function
export const sql = neon(DATABASE_URL);

/**
 * Database helper functions
 */

// User operations
export async function createUser(uuid: string, username: string, email?: string) {
    const result = await sql`
        INSERT INTO users (uuid, name, email)
        VALUES (${uuid}, ${username}, ${email || null})
        ON CONFLICT (uuid) DO UPDATE
        SET name = ${username}, email = ${email || null}, updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    return result[0];
}

export async function getUserByUuid(uuid: string) {
    const result = await sql`
        SELECT * FROM users WHERE uuid = ${uuid} LIMIT 1
    `;
    return result[0] || null;
}

export async function getUserById(id: string) {
    const result = await sql`
        SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return result[0] || null;
}

// Session operations
export async function createSession(userId: string, sessionToken: string, expiresAt: Date) {
    const result = await sql`
        INSERT INTO sessions (user_id, session_token, expires_at)
        VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
        RETURNING *
    `;
    return result[0];
}

export async function getSessionByToken(sessionToken: string) {
    const result = await sql`
        SELECT s.*, u.uuid, u.name as username, u.email
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ${sessionToken}
        AND s.expires_at > CURRENT_TIMESTAMP
        LIMIT 1
    `;
    return result[0] || null;
}

export async function deleteSession(sessionToken: string) {
    await sql`
        DELETE FROM sessions WHERE session_token = ${sessionToken}
    `;
}

export async function cleanupExpiredSessions() {
    await sql`
        DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP
    `;
}

// Resume operations
export async function createResume(data: {
    userId: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    gcsUrl?: string;
}) {
    const result = await sql`
        INSERT INTO resumes (user_id, file_name, file_path, file_size, mime_type, gcs_url)
        VALUES (
            ${data.userId},
            ${data.fileName},
            ${data.filePath},
            ${data.fileSize || null},
            ${data.mimeType || null},
            ${data.gcsUrl || null}
        )
        RETURNING *
    `;
    return result[0];
}

export async function getResumeById(id: string) {
    const result = await sql`
        SELECT * FROM resumes WHERE id = ${id} LIMIT 1
    `;
    return result[0] || null;
}

export async function getResumesByUserId(userId: string, limit = 50) {
    const result = await sql`
        SELECT * FROM resumes
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
    `;
    return result;
}

export async function updateResumeAnalysis(id: string, analysisData: any, atsScore?: number) {
    const result = await sql`
        UPDATE resumes
        SET analysis_data = ${JSON.stringify(analysisData)},
            ats_score = ${atsScore || null}
        WHERE id = ${id}
        RETURNING *
    `;
    return result[0];
}

export async function deleteResume(id: string) {
    await sql`
        DELETE FROM resumes WHERE id = ${id}
    `;
}

// Key-Value store operations (backward compatible with Puter KV)
export async function kvGet(key: string, userId?: string) {
    const result = userId
        ? await sql`SELECT value FROM kv_store WHERE key = ${key} AND user_id = ${userId} LIMIT 1`
        : await sql`SELECT value FROM kv_store WHERE key = ${key} AND user_id IS NULL LIMIT 1`;
    return result[0]?.value || null;
}

export async function kvSet(key: string, value: string, userId?: string) {
    await sql`
        INSERT INTO kv_store (key, value, user_id)
        VALUES (${key}, ${value}, ${userId || null})
        ON CONFLICT (key) DO UPDATE
        SET value = ${value}, updated_at = CURRENT_TIMESTAMP
    `;
    return true;
}

export async function kvDelete(key: string, userId?: string) {
    const result = userId
        ? await sql`DELETE FROM kv_store WHERE key = ${key} AND user_id = ${userId}`
        : await sql`DELETE FROM kv_store WHERE key = ${key} AND user_id IS NULL`;
    return true;
}

export async function kvList(pattern: string, returnValues = false, userId?: string) {
    // Convert simple wildcard pattern to SQL LIKE pattern
    const sqlPattern = pattern.replace(/\*/g, '%');
    
    const result = userId
        ? await sql`
            SELECT key, value FROM kv_store
            WHERE key LIKE ${sqlPattern}
            AND user_id = ${userId}
            ORDER BY key
        `
        : await sql`
            SELECT key, value FROM kv_store
            WHERE key LIKE ${sqlPattern}
            AND user_id IS NULL
            ORDER BY key
        `;

    if (returnValues) {
        return result.map((row: any) => ({ key: row.key, value: row.value }));
    }
    return result.map((row: any) => row.key);
}

export async function kvFlush(userId?: string) {
    if (userId) {
        await sql`DELETE FROM kv_store WHERE user_id = ${userId}`;
    } else {
        await sql`DELETE FROM kv_store WHERE user_id IS NULL`;
    }
    return true;
}

// Database initialization
export async function initializeDatabase() {
    try {
        // Test connection
        await sql`SELECT 1`;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
