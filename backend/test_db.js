require('dotenv').config();
const { getDashboardData } = require('./src/controllers/analyticsController');
const req = {};
const res = {
  json: (data) => console.log(JSON.stringify(data, null, 2)),
  status: (code) => ({ json: (err) => console.log("ERROR", code, err) })
};
getDashboardData(req, res);
