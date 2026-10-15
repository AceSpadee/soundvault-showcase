import app from './app.js';
import { httpServerHandler } from 'cloudflare:node';

app.listen(3000);

export default httpServerHandler({
    port: 3000
});