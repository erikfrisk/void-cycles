export const getRngHelpers = (rng) => ({
  getRandomBetween: (min, max) => min + (max - min) * rng(),
  getRandomIntBetween: (min, max) => {
    const _min = Math.ceil(min);
    const _max = Math.floor(max);
    return Math.floor(rng() * (_max - _min + 1)) + _min;
  },
  gaussianRng: (res = 10) => [...Array(res)].reduce((r) => r + rng(), 0) / res,
});

export const mapNumToRange = (number, [inMin, inMax], [outMin, outMax]) => {
  return ((number - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

export const getAngleFromDirectionAndTime = (direction, rotationTime, time) =>
  direction * -((time % rotationTime) / rotationTime) * 2 * Math.PI;
