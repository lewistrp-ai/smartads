// Local development server. On Vercel, api/index.js serves the same app.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Smart Ads Backend running on http://localhost:${PORT}`);
});
