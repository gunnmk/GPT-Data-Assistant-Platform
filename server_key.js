// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios'); 
const PORT = 3000;

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('URL_DA_API_EXTERNA', {
      headers: {
        'Authorization': `Bearer ${process.env.API_GPT}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Erro ao buscar dados da API');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
