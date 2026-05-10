const homepageService = require('../services/homepageService');

async function getHomepageData(req, res) {
  try {
    const podaci = await homepageService.dohvatiPodatkeZaHomepage();
    return res.status(200).json({
      uspjeh: true,
      podaci
    });
  } catch (error) {
    return res.status(500).json({
      uspjeh: false,
      poruka: error.message || 'Greška na serveru'
    });
  }
}

module.exports = {
  getHomepageData
};
