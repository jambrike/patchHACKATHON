const { preprocessText } = require('./preprocessText');
const { streamSpeechToFile } = require('./openaiTts');
const { playAudioFile } = require('./playback');

async function speak(text, options = {}) {
  const processedText = options.preprocessed ? text : preprocessText(text);

  if (!processedText) {
    throw new Error('Cannot speak empty text.');
  }

  const outputPath = await streamSpeechToFile(processedText, options.outputPath, {
    ...options,
    preprocessed: true
  });

  try {
    await playAudioFile(outputPath, options);
  } finally {
    if (options.keepFile !== true) {
      await removeTempFile(outputPath);
    }
  }

  return outputPath;
}

async function removeTempFile(filePath) {
  const fs = require('fs/promises');

  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Temporary playback cleanup should not hide a successful TTS request.
  }
}

module.exports = {
  speak,
  streamSpeechToFile,
  preprocessText,
  playAudioFile
};
