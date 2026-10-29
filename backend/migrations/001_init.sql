CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    expires_at TEXT NOT NULL
);

CREATE TABLE bands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE band_memberships (
    band_id INTEGER NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (band_id, user_id)
);

CREATE TABLE songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    band_id INTEGER NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    interpret TEXT NOT NULL DEFAULT '',
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    bpm INTEGER NOT NULL DEFAULT 0 CHECK (bpm >= 0),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE setlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    band_id INTEGER NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage_time TEXT CHECK (stage_time IS NULL OR stage_time GLOB '[0-2][0-9]:[0-5][0-9]'),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE setlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setlist_id INTEGER NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('song', 'note', 'pause')),
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    text TEXT,
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    position INTEGER NOT NULL CHECK (position > 0),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (
        (type = 'song' AND song_id IS NOT NULL AND text IS NULL AND duration_seconds IS NULL)
        OR
        (type = 'note' AND song_id IS NULL AND text IS NOT NULL and duration_seconds IS NULL)
        OR
        (type = 'pause' AND song_id IS NULL AND text IS NULL and duration_seconds IS NOT NULL)
    )
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    band_id INTEGER NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    setlist_id INTEGER REFERENCES setlists(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('other', 'rehearsal', 'gig')),
    meetup_time TEXT CHECK (meetup_time IS NULL OR meetup_time GLOB '[0-2][0-9]:[0-5][0-9]'),
    start_time TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]'),
    end_time TEXT CHECK (end_time IS NULL OR end_time GLOB '[0-2][0-9]:[0-5][0-9]'),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    band_id INTEGER NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('event', 'custom')),
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (
        (type = 'event' AND event_id IS NOT NULL)
        OR
        (type = 'custom' AND event_id IS NULL)
    )
);

CREATE TABLE channel_members (
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_band_memberships_user ON band_memberships(user_id);
CREATE UNIQUE INDEX idx_band_memberships_single_owner ON band_memberships(band_id) WHERE role = 'owner';
CREATE INDEX idx_songs_band ON songs(band_id);
CREATE INDEX idx_setlists_band ON setlists(band_id);
CREATE UNIQUE INDEX idx_setlist_items_position ON setlist_items(setlist_id, position);
CREATE INDEX idx_events_band_date ON events(band_id, date);
CREATE INDEX idx_channels_band ON channels(band_id);
CREATE UNIQUE INDEX idx_channels_event ON channels(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at);
