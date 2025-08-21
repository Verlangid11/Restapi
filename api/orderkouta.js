const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { URLSearchParams } = require('url');
const crypto = require("crypto");
const QRCode = require('qrcode');
const { ImageUploadService } = require('node-upload-images');

// CLASS OrderKuota
class OrderKuota {
  static API_URL = 'https://app.orderkuota.com:443/api/v2';
  static API_URL_ORDER = 'https://app.orderkuota.com:443/api/v2/order';
  static HOST = 'app.orderkuota.com';
  static USER_AGENT = 'okhttp/4.10.0';
  static APP_VERSION_NAME = '25.03.14';
  static APP_VERSION_CODE = '250314';
  static APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';

  constructor(username = null, authToken = null) {
    this.username = username;
    this.authToken = authToken;
  }

  async loginRequest(username, password) {
    const payload = new URLSearchParams({
      username,
      password,
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
  }

  async getAuthToken(username, otp) {
    const payload = new URLSearchParams({
      username,
      password: otp,
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
  }

  async getTransactionQris(type = '', page = '1') {
    const payload = new URLSearchParams({
      auth_token: this.authToken,
      auth_username: this.username,
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][jenis]': type,
      'requests[qris_history][page]': page,
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      'requests[qris_history][keterangan]': '',
      'requests[0]': 'qris_history',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_reg_id: OrderKuota.APP_REG_ID,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }

  // New method to get all transactions (not just QRIS)
  async getAllTransactions(page = '1') {
    const payload = new URLSearchParams({
      auth_token: this.authToken,
      auth_username: this.username,
      'requests[0]': 'account',
      'requests[1]': 'qris_history',
      'requests[qris_history][page]': page,
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][jenis]': '',
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      'requests[qris_history][keterangan]': '',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_reg_id: OrderKuota.APP_REG_ID,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }

  async withdrawalQris(amount = '') {
    const payload = new URLSearchParams({
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME,
      auth_username: this.username,
      auth_token: this.authToken,
      'requests[qris_withdraw][amount]': amount,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }

  buildHeaders() {
    return {
      'Host': OrderKuota.HOST,
      'User-Agent': OrderKuota.USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async request(method, url, body = null) {
    try {
      console.log(`Making ${method} request to: ${url}`);
      console.log('Request body:', body?.toString());
      
      const res = await fetch(url, {
        method,
        headers: this.buildHeaders(),
        body: body ? body.toString() : null,
      });

      console.log(`Response status: ${res.status}`);
      
      // Check if response is successful
      if (!res.ok) {
        const errorText = await res.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await res.json();
        console.log('JSON response:', JSON.stringify(jsonData, null, 2));
        return jsonData;
      } else {
        const textData = await res.text();
        console.log('Text response:', textData);
        return textData;
      }
    } catch (err) {
      console.error('Request error:', err.message);
      return { error: err.message, status: false };
    }
  }
}

// FUNCTION QRIS TOOLS
function convertCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ("000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}

function generateTransactionId() {
  return `VERLANGID-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function generateExpirationTime() {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30);
  return expirationTime;
}

async function elxyzFile(buffer) {
  try {
    const service = new ImageUploadService('pixhost.to');
    const { directLink } = await service.uploadFromBinary(buffer, 'verlang.png');
    return directLink;
  } catch (err) {
    console.error('Image upload error:', err);
    throw new Error('Failed to upload image');
  }
}

async function createQRIS(amount, codeqr) {
  try {
    let qrisData = codeqr;
    qrisData = qrisData.slice(0, -4);
    const step1 = qrisData.replace("010211", "010212");
    const step2 = step1.split("5802ID");
    amount = amount.toString();
    let uang = "54" + ("0" + amount.length).slice(-2) + amount;
    uang += "5802ID";
    const final = step2[0] + uang + step2[1];
    const result = final + convertCRC16(final);
    const buffer = await QRCode.toBuffer(result);
    const uploadedFile = await elxyzFile(buffer);
    return {
      idtransaksi: generateTransactionId(),
      jumlah: amount,
      expired: generateExpirationTime(),
      imageqris: { url: uploadedFile }
    };
  } catch (err) {
    console.error('QRIS creation error:', err);
    throw new Error('Failed to create QRIS');
  }
}

// Helper function to validate auth credentials
function validateAuth(username, token) {
  if (!username || !token) {
    return { valid: false, error: 'Username and token are required' };
  }
  if (typeof username !== 'string' || typeof token !== 'string') {
    return { valid: false, error: 'Username and token must be strings' };
  }
  if (username.trim().length === 0 || token.trim().length === 0) {
    return { valid: false, error: 'Username and token cannot be empty' };
  }
  return { valid: true };
}

// ROUTE EXPORT
module.exports = [
  {
    name: "Get OTP",
    desc: "Get OTP Orderkuota",
    category: "Orderkuota",
    path: "/orderkuota/getotp?apikey=&username=&password=",
    async run(req, res) {
      const { apikey, username, password } = req.query;
      
      // Validate apikey
      if (!global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }
      
      // Validate required parameters
      if (!username) return res.status(400).json({ status: false, error: 'Missing username' });
      if (!password) return res.status(400).json({ status: false, error: 'Missing password' });
      
      try {
        const ok = new OrderKuota();
        const login = await ok.loginRequest(username, password);
        
        // Check if login was successful
        if (login.error) {
          return res.status(500).json({ status: false, error: login.error });
        }
        
        res.json({ status: true, result: login.results || login });
      } catch (err) {
        console.error('Get OTP error:', err);
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Get Token",
    desc: "Get Token Orderkuota",
    category: "Orderkuota",
    path: "/orderkuota/gettoken?apikey=&username=&otp=",
    async run(req, res) {
      const { apikey, username, otp } = req.query;
      
      // Validate apikey
      if (!global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }
      
      // Validate required parameters
      if (!username) return res.status(400).json({ status: false, error: 'Missing username' });
      if (!otp) return res.status(400).json({ status: false, error: 'Missing otp' });
      
      try {
        const ok = new OrderKuota();
        const login = await ok.getAuthToken(username, otp);
        
        // Check if login was successful
        if (login.error) {
          return res.status(500).json({ status: false, error: login.error });
        }
        
        res.json({ status: true, result: login.results || login });
      } catch (err) {
        console.error('Get Token error:', err);
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Cek Mutasi QRIS",
    desc: "Cek Mutasi Qris Orderkuota",
    category: "Orderkuota",
    path: "/orderkuota/mutasiqr?apikey=&username=&token=&type=&page=",
    async run(req, res) {
      const { apikey, username, token, type = '', page = '1' } = req.query;
      
      // Validate apikey
      if (!global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }
      
      // Validate auth credentials
      const authValidation = validateAuth(username, token);
      if (!authValidation.valid) {
        return res.status(400).json({ status: false, error: authValidation.error });
      }
      
      try {
        console.log('Checking mutations for:', { 
          username: username, 
          tokenLength: token.length, 
          type: type,
          page: page 
        });
        
        const ok = new OrderKuota(username.trim(), token.trim());
        
        // Try different methods to get transactions
        let response = await ok.getAllTransactions(page);
        console.log('getAllTransactions response:', JSON.stringify(response, null, 2));
        
        if (response.error || !response.results) {
          // Fallback to original method
          response = await ok.getTransactionQris(type, page);
          console.log('getTransactionQris response:', JSON.stringify(response, null, 2));
        }
        
        // Check if response has error
        if (response.error) {
          return res.status(500).json({ 
            status: false, 
            error: `API Error: ${response.error}` 
          });
        }
        
        // Parse response and find transactions
        let transactions = [];
        let allTransactions = [];
        
        // Try multiple response structures
        if (response?.results?.qris_history?.results) {
          allTransactions = response.results.qris_history.results;
        } else if (response?.qris_history?.results) {
          allTransactions = response.qris_history.results;
        } else if (response?.results && Array.isArray(response.results)) {
          allTransactions = response.results;
        } else if (Array.isArray(response)) {
          allTransactions = response;
        }
        
        console.log('All transactions found:', allTransactions.length);
        
        // Filter transactions - include both IN and OUT for debugging
        const incomingTransactions = allTransactions.filter(e => 
          e.status === "IN" || e.status === "INCOMING" || e.type === "IN"
        );
        
        // Also get recent transactions (last 10) regardless of status for debugging
        const recentTransactions = allTransactions.slice(0, 10);
        
        console.log('Incoming transactions:', incomingTransactions);
        console.log('Recent transactions (for debug):', recentTransactions.map(t => ({
          id: t.id,
          status: t.status,
          type: t.type,
          amount: t.amount || t.jumlah,
          date: t.date || t.tanggal,
          description: t.description || t.keterangan
        })));
        
        res.json({ 
          status: true, 
          result: incomingTransactions,
          total: incomingTransactions.length,
          debug: {
            totalFound: allTransactions.length,
            recentTransactions: recentTransactions.slice(0, 5) // Only show first 5 for brevity
          }
        });
        
      } catch (err) {
        console.error('Mutation check error:', err);
        res.status(500).json({ 
          status: false, 
          error: `Failed to check mutations: ${err.message}` 
        });
      }
    }
  },
  {
    name: "Cek Semua Transaksi",
    desc: "Cek Semua Transaksi (Debug Mode)",
    category: "Orderkuota",
    path: "/orderkuota/alltransactions?apikey=&username=&token=&page=",
    async run(req, res) {
      const { apikey, username, token, page = '1' } = req.query;
      
      // Validate apikey
      if (!global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }
      
      // Validate auth credentials
      const authValidation = validateAuth(username, token);
      if (!authValidation.valid) {
        return res.status(400).json({ status: false, error: authValidation.error });
      }
      
      try {
        const ok = new OrderKuota(username.trim(), token.trim());
        const response = await ok.getAllTransactions(page);
        
        console.log('Full API response:', JSON.stringify(response, null, 2));
        
        if (response.error) {
          return res.status(500).json({ 
            status: false, 
            error: `API Error: ${response.error}` 
          });
        }
        
        // Return full response for debugging
        res.json({ 
          status: true, 
          result: response,
          message: "Full API response for debugging"
        });
        
      } catch (err) {
        console.error('All transactions error:', err);
        res.status(500).json({ 
          status: false, 
          error: `Failed to get transactions: ${err.message}` 
        });
      }
    }
  },
  {
    name: "Create QRIS Payment",
    desc: "Generate QR Code Payment",
    category: "Orderkuota",
    path: "/orderkuota/createpayment?apikey=&amount=&codeqr=",
    async run(req, res) {
      const { apikey, amount, codeqr } = req.query;
      
      // Validate apikey
      if (!global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }
      
      // Validate required parameters
      if (!amount) return res.status(400).json({ status: false, error: 'Amount is required' });
      if (!codeqr) return res.status(400).json({ status: false, error: 'QrCode is required' });
      
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ status: false, error: 'Amount must be a positive number' });
      }
      
      try {
        const qrData = await createQRIS(numAmount, codeqr);
        res.status(200).json({ status: true, result: qrData });
      } catch (error) {
        console.error('QRIS creation error:', error);
        res.status(500).json({ status: false, error: error.message });
      }
    }
  }
];