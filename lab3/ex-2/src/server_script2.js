import { createServer } from 'http';
import { readFile, appendFile } from 'fs';
import { join, __dirname } from 'path';
import { URLSearchParams } from 'url';

const PORT = 8000;
const FILE = join(__dirname, '../entries.txt');

function renderPage(entriesHtml) {
    return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Księga gości</title>
</head>
<body>
    <h1>Księga gości</h1>
    <h2>Poprzednie wpisy:</h2>
    <div>${entriesHtml}</div>
    <hr>
    <h2>Dodaj nowy wpis</h2>
    <form method="POST" action="/">
        <label>Imię i nazwisko:<br><input type="text" name="name" required></label><br><br>
        <label>Treść wpisu:<br><textarea name="message" rows="5" cols="40" required></textarea></label><br><br>
        <button type="submit">Wyślij</button>
    </form>
</body>
</html>
    `;
}

function formatEntries(rawData) {
    if (!rawData) return '<i>Brak wpisów.</i>';
    return rawData
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
            const [name, message] = line.split('||');
            return `<p><strong>${name}</strong>: ${message}</p>`;
        })
        .join('');
}

const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        readFile(FILE, 'utf-8', (err, data) => {
            const entriesHtml = formatEntries(data);
            const html = renderPage(entriesHtml);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
    } else if (req.method === 'POST' && req.url === '/') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const name = params.get('name')?.trim().replace(/\|{2,}/g, '|') || 'Anonim';
            const message = params.get('message')?.trim().replace(/\|{2,}/g, '|') || '';
            if (name && message) {
                const entry = `${name}||${message}\n`;
                appendFile(FILE, entry, err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Błąd zapisu do pliku.');
                    } else {
                        res.writeHead(302, { Location: '/' });
                        res.end();
                    }
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Nieprawidłowe dane.');
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Nie znaleziono');
    }
});

server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}/`);
});
