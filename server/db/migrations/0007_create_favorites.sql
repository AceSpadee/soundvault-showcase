CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demo_session_id TEXT NOT NULL,
    recording_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demo_session_id) REFERENCES demo_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (recording_id) REFERENCES recordings(id),
    UNIQUE (demo_session_id, recording_id)
);