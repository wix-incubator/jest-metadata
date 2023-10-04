function generateTests() {
  const num = process.env.NUM_TESTS || '1';
  return Array.from({length: +num}, () => {
    const a = randomInt(1, 100);
    const b = randomInt(1, 100);
    return [a, b, a + b];
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  generateTests,
};
