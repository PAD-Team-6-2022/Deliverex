const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

// Body parsing
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session
const SessionStore = require('./session/store');

app.use(
    require('express-session')({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: new SessionStore(),
    }),
);

// Authentication
const passport = require('./auth/passport');

app.use(passport.initialize());
app.use(passport.session());

// Flash messages
const flash = require('connect-flash');
app.use(flash());

// Set controllers
app.use('/dashboard', require('./controllers/dashboard'));
app.use('/setup', require('./controllers/setup'));
app.use('/', require('./controllers/tracker'));
app.use('/api', require('./controllers/api'));

// Set fallback route
app.get('*', (req, res) => {
    res.status(404).render('error', { title: '404 - Niet gevonden' });
});

const PORT = process.env.NODE_ENV === 'development' ? 3000 : 80;

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
