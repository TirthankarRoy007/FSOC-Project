const express = require('express');
const router = express.Router();

router.get('/healthCheck', function (req, res) {
    res.send('App is running successfully')
});

module.exports = router