import http from 'http';
import { URL } from 'url';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'chronos_payroll_super_secret_token_key';

const postJson = (url, body, token) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Connection': 'close',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

const getJson = (url, token) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Connection': 'close',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
};

async function startTest() {
  console.log("Loading server.js in-process...");
  // Import server.js to boot the server
  await import('./server.js');

  console.log("Starting server connection polling...");
  
  let empLogin = null;
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      empLogin = await postJson('http://localhost:5000/api/auth/login', { username: 'employee', password: 'password123' });
      console.log(`Connected to server successfully on attempt ${attempt}!`);
      break;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        console.log(`Server not listening yet (Attempt ${attempt}/${maxAttempts})... waiting 2s`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  if (!empLogin) {
    console.error("Failed to connect to server after maximum attempts.");
    process.exit(1);
  }

  try {
    console.log("1. Authenticating test sessions...");
    const employeeToken = empLogin.data.token;
    const employeeId = empLogin.data.id;
    console.log(`Employee logged in: ID=${employeeId}`);

    const hrLogin = await postJson('http://localhost:5000/api/auth/login', { username: 'hr', password: 'password123' });
    const hrToken = hrLogin.data.token;
    const hrId = hrLogin.data.id;
    console.log(`HR logged in: ID=${hrId}`);

    console.log("2. Fetching categories...");
    const catResult = await getJson('http://localhost:5000/api/expenses/categories', employeeToken);
    const category = catResult.data.data[0];
    console.log(`Using Category: ${category.name} (ID: ${category.id})`);

    console.log("3. Creating Draft expense claim...");
    const expenseData = {
      title: 'In-process Dinner ' + Date.now(),
      categoryId: category.id,
      amount: 1500,
      expenseDate: new Date().toISOString().split('T')[0],
      currency: 'INR',
      project: 'Apollo v2',
      description: 'Dinner',
      paymentMethod: 'Cash',
      location: 'Delhi Office',
      status: 'Draft'
    };
    const createResult = await postJson('http://localhost:5000/api/expenses', expenseData, employeeToken);
    const expenseId = createResult.data.data.id;
    console.log(`Draft created: ID=${expenseId}`);

    console.log("4. Submitting expense claim...");
    const submitResult = await postJson(`http://localhost:5000/api/expenses/${expenseId}/submit`, {}, employeeToken);
    console.log(`Claim submitted: Status=${submitResult.data.data.status}`);

    console.log("5. HR Requesting More Information...");
    const requestInfoResult = await postJson(`http://localhost:5000/api/expenses/${expenseId}/request-info`, {
      requestMessage: "Please provide a valid receipt upload."
    }, hrToken);
    console.log("HR request status:", requestInfoResult.status);
    console.log("HR request data:", requestInfoResult.data);

    console.log("6. Employee Resubmitting claim...");
    const resubmitResult = await postJson(`http://localhost:5000/api/expenses/${expenseId}/resubmit`, {
      description: "Resubmitted description",
      amount: 1600
    }, employeeToken);
    console.log("Resubmit response status:", resubmitResult.status);
    console.log("Resubmit response data:", resubmitResult.data);

    console.log("All steps run successfully!");
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (err) {
    console.error("Test execution caught error:", err);
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

startTest();
