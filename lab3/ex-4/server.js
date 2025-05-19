const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const DATA_DIR = './data';
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const STATIC_DIR = './static';

const PORT = 3000;

async function initializeData() {
  try {
    try {
      await fs.access(DATA_DIR);
    } catch (err) {
      await fs.mkdir(DATA_DIR);
    }

    try {
      await fs.access(RESERVATIONS_FILE);
    } catch (err) {
      await fs.writeFile(RESERVATIONS_FILE, JSON.stringify([]));
    }

    try {
      await fs.access(STATIC_DIR);
    } catch (err) {
      await fs.mkdir(STATIC_DIR);
    }
  } catch (err) {
    console.error('Error initializing data:', err);
  }
}

async function readReservations() {
  try {
    const data = await fs.readFile(RESERVATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading reservations:', err);
    return [];
  }
}

async function writeReservations(reservations) {
  try {
    await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations));
  } catch (err) {
    console.error('Error writing reservations:', err);
  }
}

const rooms = [
  { number: 101, capacity: 2, type: 'Ekonomiczny', price: 50 },
  { number: 102, capacity: 3, type: 'Standard', price: 80 },
  { number: 103, capacity: 1, type: 'Ekonomiczny', price: 50 }
];

async function serveStaticFile(req, res, filePath) {
  try {
    const fullPath = path.join(STATIC_DIR, filePath);
    const data = await fs.readFile(fullPath);
    
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('File not found');
  }
}

async function generateHomePage() {
  const reservations = await readReservations();
  
  const availableDates = [
    { month: 'VII', days: '14-21, 30-31' },
    { month: 'VIII', days: '1-12' }
  ];
  
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotel "Student"</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'hotel-purple': '#6366f1',
                        'hotel-azure': '#0080ff'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 bg-hotel-azure text-white py-4 shadow-md">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <div class="text-xl font-bold">Hotel "Student"</div>
            
            <div class="md:hidden">
                <button onclick="toggleMobileMenu()" class="focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <nav class="hidden md:flex space-x-6">
                <div class="relative group">
                    <a href="#" class="hover:text-gray-200">Oferta</a>
                    <div class="absolute hidden group-hover:block bg-white text-black shadow-lg rounded-md mt-2 py-2 w-48">
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Pokoje</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Restauracja</a>
                    </div>
                </div>
                <a href="/reservation" class="hover:text-gray-200">Zarezerwuj</a>
            </nav>
        </div>

        <div id="mobileMenu" class="hidden md:hidden">
            <div class="px-4 pt-2 pb-4 space-y-2">
                <a href="#" class="block py-2 border-b">Oferta pokoi</a>
                <a href="#" class="block py-2 border-b">Restauracja</a>
                <a href="/reservation" class="block py-2">Zarezerwuj</a>
            </div>
        </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div class="space-y-6">
            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <div class="p-6">
                    <div class="w-full h-64 md:h-96 overflow-hidden">
                        <img 
                            src="/static/KrkMainSq.jpg" 
                            alt="Kraków Main Square" 
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Dostępne terminy</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border p-2">Miesiąc</th>
                                    <th class="border p-2">Dni</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${availableDates.map(date => `
                                <tr>
                                    <td class="border p-2 text-center">${date.month}</td>
                                    <td class="border p-2 text-center">${date.days}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="mt-6">
                            <button class="w-full bg-hotel-purple text-white py-3 rounded-md hover:bg-indigo-600 transition duration-300"
                            onclick="window.location.href='/reservation';">
                                Zarezerwuj
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white shadow-md rounded-lg overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-700 mb-4">Opcje noclegu</h2>
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <h3 class="font-semibold mb-2">Pokój Ekonomiczny</h3>
                                <div class="bg-gray-100 rounded-lg overflow-hidden">
                                    <img 
                                        src="/static/hotelRoom.webp" 
                                        alt="Pokój ekonomiczny" 
                                        class="w-full h-48 object-cover"
                                    />
                                </div>
                                <ul class="list-disc list-inside mt-2">
                                    <li>Do 2 osób</li>
                                    <li>Wspólna łazienka</li>
                                    <li>Cena: 50 zł/noc</li>
                                </ul>
                            </div>
                            <div>
                                <h3 class="font-semibold mb-2">Pokój Standard</h3>
                                <div class="bg-gray-100 rounded-lg overflow-hidden">
                                    <img 
                                        src="/static/hotelRoomV2.jpg" 
                                        alt="Pokój standard" 
                                        class="w-full h-48 object-cover"
                                    />
                                </div>
                                <ul class="list-disc list-inside mt-2">
                                    <li>Do 3 osób</li>
                                    <li>Własna łazienka</li>
                                    <li>Cena: 80 zł/noc</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-lg overflow-hidden">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-700 mb-4">Adres</h2>
                        <div class="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <img 
                                src="/static/adress.jpg" 
                                alt="Lokalizacja hotelu" 
                                class="w-full h-48 object-cover"
                            />
                        </div>
                        <p><strong>Adres:</strong> ul. Studencka 12</p>
                        <p><strong>Miasto:</strong> Kraków</p>
                        <p><strong>Kod pocztowy:</strong> 30-100</p>
                    </div>
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-700 mb-4">Dojazd</h2>
                        <div class="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <img 
                                src="/static/taxi.jpeg" 
                                alt="Lokalizacja hotelu" 
                                class="w-full h-48 object-cover"
                            />
                        </div>
                        <p><strong>Transport:</strong> Lotnisko Kraków Balice</p>
                        <p><strong>Taksówki:</strong> Bolt, Uber</p>
                        <p><strong>Komunikacja miejska:</strong> MPK Kraków</p>
                    </div>
                </div>
            </div>

            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Atrakcje miasta</h2>
                    <div class="h-full w-full aspect-w-16 aspect-h-9">
                        <iframe 
                            src="https://www.youtube.com/embed/6eUvzOFR2nQ" 
                            title="Atrakcje Krakowa" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            class="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-hotel-azure text-white py-4">
        <div class="container mx-auto px-4 text-right">
            <span>&copy; Hotel studencki</span>
        </div>
    </footer>

    <script>
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
            }
        }
    </script>
</body>
</html>`;
}

async function generateReservationPage() {
  const reservations = await readReservations();
  
  const roomsWithAvailability = rooms.map(room => {
    const roomReservations = reservations.filter(r => r.roomNumber == room.number);
    const availableSpots = room.capacity - roomReservations.length;
    const guests = roomReservations.map(r => r.guestName);
    return {
      ...room,
      availableSpots,
      guests
    };
  });
  
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rezerwacja - Hotel "Student"</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'hotel-purple': '#6366f1',
                        'hotel-azure': '#0080ff'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 bg-hotel-azure text-white py-4 shadow-md">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <a href="/" class="text-xl font-bold">Hotel "Student"</a>
            
            <div class="md:hidden">
                <button onclick="toggleMobileMenu()" class="focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <nav class="hidden md:flex space-x-6">
                <div class="relative group">
                    <a href="#" class="hover:text-gray-200">Oferta</a>
                    <div class="absolute hidden group-hover:block bg-white text-black shadow-lg rounded-md mt-2 py-2 w-48">
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Pokoje</a>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100">Restauracja</a>
                    </div>
                </div>
                <a href="/reservation" class="hover:text-gray-200 font-bold">Zarezerwuj</a>
            </nav>
        </div>

        <div id="mobileMenu" class="hidden md:hidden">
            <div class="px-4 pt-2 pb-4 space-y-2">
                <a href="#" class="block py-2 border-b">Oferta pokoi</a>
                <a href="#" class="block py-2 border-b">Restauracja</a>
                <a href="/reservation" class="block py-2 font-bold">Zarezerwuj</a>
            </div>
        </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Rezerwacja pokojów</h1>
        <p class="mb-6 text-gray-600">Aby dokonać rezerwacji, wybierz pokój i wypełnij formularz.</p>

        <div id="roomsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${roomsWithAvailability.map(room => `
            <div class="shadow-md rounded-lg overflow-hidden ${room.availableSpots > 0 ? 'bg-white' : 'bg-gray-200'}">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-700 mb-2">Pokój ${room.number} - ${room.type}</h2>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm bg-hotel-purple text-white py-1 px-3 rounded-full">${room.price} zł/noc</span>
                        <span class="${room.availableSpots > 0 ? 'text-green-600' : 'text-red-600'}">
                            ${room.availableSpots > 0 ? `Dostępne miejsca: ${room.availableSpots}/${room.capacity}` : 'Brak miejsc'}
                        </span>
                    </div>
                    
                    ${room.guests && room.guests.length > 0 ? `
                        <div>
                            <p class="font-medium text-gray-700 mb-2">Aktualne rezerwacje:</p>
                            <ul class="list-disc list-inside">
                                ${room.guests.map(guest => `
                                    <li class="flex justify-between items-center py-1">
                                        <span>${guest}</span>
                                        <form method="GET" action="/removeReservation" class="inline">
                                            <input type="hidden" name="roomNumber" value="${room.number}">
                                            <input type="hidden" name="guestName" value="${guest}">
                                            <button type="submit" class="text-red-500 hover:text-red-700" aria-label="Usuń rezerwację">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </form>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${room.availableSpots > 0 ? `
                        <div class="mt-4">
                            <form method="GET" action="/addReservation">
                                <input type="hidden" name="roomNumber" value="${room.number}">
                                <div class="flex space-x-2">
                                    <input 
                                        type="text" 
                                        name="guestName"
                                        placeholder="Imię i nazwisko gościa" 
                                        class="flex-grow p-2 border rounded"
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        class="bg-hotel-purple text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-300"
                                    >
                                        Rezerwuj
                                    </button>
                                </div>
                            </form>
                        </div>
                    ` : ''}
                </div>
            </div>
            `).join('')}
        </div>
    </main>

    <footer class="bg-hotel-azure text-white py-4">
        <div class="container mx-auto px-4 text-right">
            <span>&copy; Hotel studencki</span>
        </div>
    </footer>

    <script>
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
            }
        }
    </script>
</body>
</html>`;
}

async function addReservation(query) {
  const roomNumber = parseInt(query.roomNumber);
  const guestName = query.guestName;
  
  if (!guestName || guestName.trim() === '') {
    return { success: false, message: 'Proszę podać nazwisko gościa' };
  }
  
  const room = rooms.find(r => r.number === roomNumber);
  if (!room) {
    return { success: false, message: `Pokój ${roomNumber} nie istnieje.` };
  }
  
  const reservations = await readReservations();
  const roomReservations = reservations.filter(r => r.roomNumber === roomNumber);
  
  if (roomReservations.length >= room.capacity) {
    return { success: false, message: `Pokój ${roomNumber} jest już w pełni zarezerwowany.` };
  }
  
  reservations.push({ roomNumber, guestName });
  await writeReservations(reservations);
  
  return { success: true, message: `Pokój ${roomNumber} został zarezerwowany dla ${guestName}.` };
}

async function removeReservation(query) {
  const roomNumber = parseInt(query.roomNumber);
  const guestName = query.guestName;
  
  const reservations = await readReservations();
  const index = reservations.findIndex(r => r.roomNumber === roomNumber && r.guestName === guestName);
  
  if (index === -1) {
    return { success: false, message: `Nie znaleziono rezerwacji dla gościa: ${guestName} w pokoju ${roomNumber}` };
  }
  
  reservations.splice(index, 1);
  await writeReservations(reservations);
  
  return { success: true, message: `Rezerwacja dla ${guestName} w pokoju ${roomNumber} została usunięta.` };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  try {
    if (pathname === '/' || pathname === '/index.html') {
      const html = await generateHomePage();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (pathname === '/reservation') {
      const html = await generateReservationPage();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (pathname === '/addReservation') {
      const result = await addReservation(query);
      
      res.writeHead(302, { 'Location': '/reservation' });
      res.end();
    } else if (pathname === '/removeReservation') {
      const result = await removeReservation(query);
      
      res.writeHead(302, { 'Location': '/reservation' });
      res.end();
    } else if (pathname.startsWith('/static/')) {
      const filePath = pathname.substring(8);
      await serveStaticFile(req, res, filePath);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>404 - Not Found</title>
          </head>
          <body>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/">Go back to home page</a>
          </body>
        </html>
      `);
    }
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>500 - Server Error</title>
        </head>
        <body>
          <h1>500 - Server Error</h1>
          <p>Something went wrong on the server.</p>
          <a href="/">Go back to home page</a>
        </body>
      </html>
    `);
  }
});

async function startServer() {
  await initializeData();
  
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();