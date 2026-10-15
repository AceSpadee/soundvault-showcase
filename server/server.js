import 'dotenv/config';
import sequelize from './config/connection.js';
import './models/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();