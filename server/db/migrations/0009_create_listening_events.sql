CREATE TABLE IF NOT EXISTS listening_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demo_session_id TEXT NOT NULL,
    recording_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    seconds_listened INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    skipped INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demo_session_id) REFERENCES demo_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (recording_id) REFERENCES recordings(id)
);