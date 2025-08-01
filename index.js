const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/', express.static(path.join(__dirname, 'ui')));
app.use('/api', express.static(path.join(__dirname, 'api')));

// Global Helpers
global.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      ...options
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.apikey = process.env.APIKEY || null;
global.totalreq = 0;

// Settings
const settings = {
  creatorName: "verlangid",
  whatsappLink: "https://wa.me/6287821239407",
  apiTitle: "verlang API's",
  githubLink: "https://whatsapp.com/channel/0029VaSaXJaCsU9MBxDjyt1P",
  instagramLink: "https://whatsapp.com/channel/0029VaSaXJaCsU9MBxDjyt1P"
};


// Global JSON Response Wrapper
app.use((req, res, next) => {
  global.totalreq += 1;

  const originalJson = res.json;
  res.json = function (data) {
    if (
      typeof data === 'object' &&
      req.path !== '/endpoints' &&
      req.path !== '/set'
    ) {
      return originalJson.call(this, {
        creator: settings.creatorName || "Created Using Skyzo",
        ...data
      });
    }
    return originalJson.call(this, data);
  };

  next();
});

app.get('/set', (req, res) => res.json(settings));

// Dynamic route loader with sorted categories and endpoints
let totalRoutes = 0;
let rawEndpoints = {};
const apiFolder = path.join(__dirname, 'api');

fs.readdirSync(apiFolder).forEach(file => {
  const fullPath = path.join(apiFolder, file);
  if (file.endsWith('.js')) {
    try {
      const routes = require(fullPath);
      const handlers = Array.isArray(routes) ? routes : [routes];

      handlers.forEach(route => {
        const { name, desc, category, path: routePath, run } = route;

        if (name && desc && category && routePath && typeof run === 'function') {
          const cleanPath = routePath.split('?')[0];
          app.get(cleanPath, run);

          if (!rawEndpoints[category]) rawEndpoints[category] = [];
          rawEndpoints[category].push({ name, desc, path: routePath });

          totalRoutes++;
          console.log(chalk.hex('#55efc4')(`✔ Loaded: `) + chalk.hex('#ffeaa7')(`${cleanPath} (${file})`));
        } else {
          console.warn(chalk.bgRed.white(` ⚠ Skipped invalid route in ${file}`));
        }
      });

    } catch (err) {
      console.error(chalk.bgRed.white(` ❌ Error in ${file}: ${err.message}`));
    }
  }
});

const endpoints = Object.keys(rawEndpoints)
  .sort((a, b) => a.localeCompare(b))
  .reduce((sorted, category) => {
    sorted[category] = rawEndpoints[category].sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, {});

app.get('/endpoints', (req, res) => {
  res.json(endpoints);
});

app.get('/', (req, res) => {
  try {
  res.sendFile(path.join(__dirname, 'index.html'));
  } catch (err) {
  console.log(err)
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(` 🚀 Server is running on port ${PORT} `));
  console.log(chalk.bgCyan.black(` 📦 Total Routes Loaded: ${totalRoutes} `));
});

module.exports = app;