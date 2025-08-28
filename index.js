<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>verlang API's</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }
    .fade-in {
      animation: fadeIn 1s ease-in-out;
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900">verlang API's</h1>
      <p class="mt-2 text-sm text-gray-600">A powerful and modern API service by verlangid</p>
    </div>
  </header>

  <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <section class="bg-white rounded-lg shadow-md p-6 mb-8 fade-in">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome to verlang API's</h2>
      <p class="text-gray-600 mb-4">Explore our collection of APIs designed to make your development process seamless and efficient. Access our endpoints to integrate powerful features into your applications.</p>
      <div class="flex space-x-4">
        <a href="/endpoints" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">View API Endpoints</a>
        <a href="https://wa.me/6287821239407" class="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300">Contact Us</a>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6 fade-in">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">GitHub</h3>
        <p class="text-gray-600 mb-4">Explore our open-source projects and contribute to the community.</p>
        <a href="https://whatsapp.com/channel/0029VaSaXJaCsU9MBxDjyt1P" class="text-blue-600 hover:underline">Visit GitHub</a>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 fade-in">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">WhatsApp</h3>
        <p class="text-gray-600 mb-4">Reach out to us directly for support or inquiries.</p>
        <a href="https://wa.me/6287821239407" class="text-blue-600 hover:underline">Contact on WhatsApp</a>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 fade-in">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Instagram</h3>
        <p class="text-gray-600 mb-4">Follow us for updates and community engagement.</p>
        <a href="https://whatsapp.com/channel/0029VaSaXJaCsU9MBxDjyt1P" class="text-blue-600 hover:underline">Follow on Instagram</a>
      </div>
    </section>
  </main>

  <footer class="bg-gray-800 text-white py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-center">&copy; 2025 verlang API's. All rights reserved.</p>
      <p class="text-center text-sm mt-2">Created by verlangid</p>
    </div>
  </footer>

  <script>
    // Fetch and display API endpoints dynamically
    fetch('/endpoints')
      .then(res => res.json())
      .then(data => {
        const container = document.createElement('section');
        container.className = 'bg-white rounded-lg shadow-md p-6 mt-8 fade-in';
        container.innerHTML = '<h2 class="text-2xl font-semibold text-gray-800 mb-4">Available Endpoints</h2>';
        for (const [category, endpoints] of Object.entries(data)) {
          const categoryDiv = document.createElement('div');
          categoryDiv.innerHTML = `<h3 class="text-xl font-medium text-gray-700 mt-4">${category}</h3>`;
          const ul = document.createElement('ul');
          ul.className = 'list-disc pl-6';
          endpoints.forEach(endpoint => {
            ul.innerHTML += `<li class="text-gray-600"><strong>${endpoint.name}</strong>: ${endpoint.desc} (<a href="${endpoint.path}" class="text-blue-600 hover:underline">${endpoint.path}</a>)</li>`;
          });
          categoryDiv.appendChild(ul);
          container.appendChild(categoryDiv);
        }
        document.querySelector('main').appendChild(container);
      })
      .catch(err => console.error('Error fetching endpoints:', err));
  </script>
</body>
</html>