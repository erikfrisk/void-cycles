export const getRngHelpers = (rng) => ({
  getRandomBetween: (min, max) => min + (max - min) * rng(),
  getRandomIntBetween: (min, max) => Math.round(min + (max - min) * rng()),
  gaussianRng: (res = 10) => [...Array(res)].reduce((r) => r + rng(), 0) / res,
});

export const mapNumToRange = (number, [inMin, inMax], [outMin, outMax]) => {
  return ((number - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};
