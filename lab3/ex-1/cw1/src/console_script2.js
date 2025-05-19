const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const FILE = 'counter.txt';

function updateCounterSync() {
    let count = 0;
    try {
        count = parseInt(fs.readFileSync(FILE, 'utf-8'));
        if (isNaN(count)) count = 0;
    } catch (err) {
        count = 0;
    }
    count++;
    fs.writeFileSync(FILE, count.toString(), 'utf-8');
    console.log(`(sync) Licznik: ${count}`);
}

function updateCounterAsync() {
    fs.readFile(FILE, 'utf-8', (err, data) => {
        let count = 0;
        if (!err && !isNaN(parseInt(data))) {
            count = parseInt(data);
        }
        count++;
        fs.writeFile(FILE, count.toString(), 'utf-8', (err) => {
            if (err) {
                console.error('Błąd zapisu:', err);
            } else {
                console.log(`(async) Licznik: ${count}`);
            }
        });
    });
}

function handleInteractiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Wpisz komendę do wykonania (CTRL+C aby zakończyć): '
    });

    rl.prompt();
    rl.on('line', (line) => {
        exec(line.trim(), (err, stdout, stderr) => {
            if (err) {
                console.error(`Błąd: ${err.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            if (stdout) {
                console.log(`stdout: ${stdout}`);
            }
            rl.prompt();
        });
    });
}

const arg = process.argv[2];
if (arg === '--sync') {
    updateCounterSync();
} else if (arg === '--async') {
    updateCounterAsync();
} else {
    handleInteractiveMode();
}
