import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Registration
app.post('/api/register', async (req, res) => {
    console.log('Empfangener Body:', req.body);
    const { email, password, firstName, lastName, color, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein!' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Das Passwort muss mindestens 6 Zeichen lang sein.' });
    }

    try {
        // PW-Hashing
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const userColor = color || '#3b82f6';
        const userRole = role || 'user';

        // insert to DB
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, color, role) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [email, passwordHash, firstName, lastName, color, role], function(err) {
            if (err) {
                // SQLite-Fehlercode für UNIQUE constraint failed
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Diese E-Mail ist bereits registriert.' });
                }
                return res.status(500).json({ error: 'Datenbankfehler: ' + err.message });
            }

            // 'this.lastID' gibt uns die ID des neu eingefügten Datensatzes
            res.status(201).json({ 
                message: 'Registrierung erfolgreich!', 
                userId: this.lastID 
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({error: "Email und Passwort sind erforderlich"});
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({error: "Datenbankfehler" });
        }
        
        if (!user) {
            return res.status(401).json({error: "Ungültige Anmeldedaten."});
        }

        try {

            const match = await bcrypt.compare(password, user.password_hash);

            if (!match) {
                return res.status(401).json({error: "Ungültige Anmeldedaten."});
            }

            const token = `user_session_${user.id}`;

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.json({ message: "Erfolgreich eingeloggt!"})
            
        } catch (error) {
            res.status(500).json({error: "Fehler beim Login-Prozess"});
        }

    })
})

// Protected Route
app.get('/api/protected', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({error: "Nicht autorisiert. Bitte einloggen."});
    }

    res.json({message: "Zugriff erlaubt, du bist eingeloggt.", token })
})

// Logout Route
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.json({message: "Erfolgreich ausgeloggt!"});
});

// Current user Route
app.get('/api/me', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Nicht eingeloggt."});
    }

    const userId = token.replace('user_session_', '');

    const query = `SELECT id, email, first_name, last_name, color, role, created_at FROM users WHERE id = ?`
    db.get(query, [userId], (err, user) => {
        if (err || !user) {
            return res.status(401).json({error: "Ungültige Session"});
        }

        res.json({ user });
    })
})

// 
app.post('/api/users/batch', (req, res) => {
    // User Auth
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({error: "Nicht eingeloggt."});
    }

    const {userIds} = req.body;

    // return empty Array if userIds is not an Array or empty
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.json([]);
    }

    const placeholders = userIds.map(() => '?').join(',');

    const query = `
        SELECT id, first_name, last_name, color
        FROM users
        WHERE id IN (${placeholders})
    `;

    db.all(query, userIds, (err, rows) => {
        if (err) {
            console.error("DB_FEHLER beim Batch:", err.message);
            return res.status(500).json({error: 'Fehler beim laden der Benutzerdaten!'});
        }

        res.json(rows);
    })
})


// Hilfs-Route: Alle User anzeigen
app.get('/api/users', (req, res) => {
    const query = `SELECT id, email, created_at, color, role FROM users`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Fehler beim Laden der User' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
