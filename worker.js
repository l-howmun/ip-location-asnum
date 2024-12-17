addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const { pathname } = new URL(request.url)
  
    if (pathname === '/') {
      return new Response(html, {
        headers: { 'content-type': 'text/html' },
      })
    } else if (pathname.startsWith('/lookup')) {
      const ip = new URL(request.url).searchParams.get('ip')
      if (!ip) {
        return new Response('IP address is required', { status: 400 })
      }
  
      const geoData = await fetchGeoData(ip)
      return new Response(JSON.stringify(geoData), {
        headers: { 'content-type': 'application/json' },
      })
    }
  
    return new Response('Not found', { status: 404 })
  }
  
  async function fetchGeoData(ip) {
    const apiKey = 'YOUR_IPINFO_API_KEY' // Replace with your ipinfo.io API key
    const response = await fetch(`https://ipinfo.io/${ip}/json?token=${apiKey}`)
    const data = await response.json()
  
    const [lat, lon] = data.loc.split(',')
    return {
      country: data.country,
      asn: data.org,
      lat,
      lon,
    }
  }
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>IP Address Lookup</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #121212;
        color: #ffffff;
        margin: 0;
        padding: 0;
      }
      h1 {
        text-align: center;
        margin-top: 20px;
      }
      form {
        display: flex;
        justify-content: center;
        align-items: center; /* Add this line */
        margin: 20px 0;
      }
      label {
        margin-right: 10px;
      }
      input {
        padding: 5px;
        font-size: 16px;
      }
      button {
        padding: 5px 10px;
        font-size: 16px;
        cursor: pointer;
      }
      #result {
        text-align: center;
        margin-top: 20px;
      }
      #map {
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <h1>IP Address Lookup</h1>
    <form id="lookupForm">
      <label for="ip">Enter IP Address:</label>
      <input type="text" id="ip" name="ip" required>
      <button type="submit">Lookup</button>
    </form>
    <div id="result">
      <p>Country: <span id="country"></span></p>
      <p>AS Number: <span id="asn"></span></p>
    </div>
    <div id="map" style="width: 100%; height: 400px;"></div>
    <script>
      document.getElementById('lookupForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        const ip = document.getElementById('ip').value
        const response = await fetch('/lookup?ip=' + ip)
        const data = await response.json()
  
        document.getElementById('country').textContent = data.country
        document.getElementById('asn').textContent = data.asn
  
        const map = L.map('map').setView([data.lat, data.lon], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)
  
        L.marker([data.lat, data.lon]).addTo(map)
          .bindPopup('IP Location')
          .openPopup()
      })
    </script>
  </body>
  </html>
  `