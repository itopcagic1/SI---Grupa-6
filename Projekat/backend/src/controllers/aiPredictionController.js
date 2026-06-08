const aiPredictionService = require('../services/aiPredictionService');

async function generateMatchPrediction(req, res) {
  try {
    const prediction = await aiPredictionService.generateMatchPrediction(req.params.id);

    return res.status(201).json({
      success: true,
      message: 'AI predikcija je uspješno generisana.',
      prediction
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.code || 'AI_PREDICTION_ERROR',
      message: error.message || 'Greška pri generisanju AI predikcije.'
    });
  }
}

async function getLatestMatchPrediction(req, res) {
  try {
    const prediction = await aiPredictionService.getLatestMatchPrediction(req.params.id);

    if (!prediction) {
      return res.status(404).json({
        error: 'AI_PREDICTION_NOT_FOUND',
        message: 'AI predikcija za ovu utakmicu još nije generisana.'
      });
    }

    return res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.code || 'AI_PREDICTION_FETCH_ERROR',
      message: error.message || 'Greška pri dohvatanju AI predikcije.'
    });
  }
}

async function generateLeaguePrediction(req, res) {
  try {
    const prediction = await aiPredictionService.generateLeaguePrediction(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.code || 'AI_LEAGUE_PREDICTION_ERROR',
      message:
        error.message ||
        'Greška pri generisanju AI predikcije lige.'
    });
  }
}

module.exports = {
  generateMatchPrediction,
  getLatestMatchPrediction,
  generateLeaguePrediction
};