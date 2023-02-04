// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import { CanvasSpace, Pt, Create, Group, Tempo, Mat } from 'pts';
import seedrandom from 'seedrandom';
import randomWords from 'random-words';
import PoissonDiskSampling from 'poisson-disk-sampling';
import { transparentize } from 'color2k';

const [SEED] = randomWords(1);
// const SEED = 'hello';
const COLORS = ['#130325', '#BE4B88', '#00A1D6', '#006A8E', '#D7C27D'];
const NUM_SQUARES_X = 42;
const NUM_SQUARES_Y = 42;

console.log(SEED);
const rng = seedrandom(SEED);

const getRandomBetween = (min, max) => min + (max - min) * rng();
const getRandomIntBetween = (min, max) => Math.round(min + (max - min) * rng());

const space = new CanvasSpace('#hello');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });
const form = space.getForm();

const animTime = 1000;

const gaussianRng = (res = 10) =>
  [...Array(res)].reduce((r) => r + rng(), 0) / res;

const getSquareDistanceFromCenterPercentage = (i) => {
  const xIndex = i % NUM_SQUARES_X;
  const yIndex = Math.floor(i / NUM_SQUARES_X);
  const pMiddle = new Pt(NUM_SQUARES_X / 2, NUM_SQUARES_Y / 2);
  const distanceFromCenter = new Pt(xIndex, yIndex)
    .subtract(pMiddle)
    .magnitude();
  return distanceFromCenter / pMiddle.magnitude();
};

const getUniqueSquareIndex = (_animatedSquares) => {
  const i = getRandomIntBetween(0, NUM_SQUARES_X * NUM_SQUARES_Y - 1);
  if (_animatedSquares.map(({ squareIndex }) => squareIndex).includes(i)) {
    // Index already taken. Try again
    return getUniqueSquareIndex(_animatedSquares);
  }
  const distanceFromCenterPercentage = getSquareDistanceFromCenterPercentage(i);
  if (distanceFromCenterPercentage > 2 * Math.abs(gaussianRng() - 0.5)) {
    // Too far away. Try again.
    return getUniqueSquareIndex(_animatedSquares);
  }
  return i;
};

let squares;
let animatedSquares = [];
space.add({
  start: (bound, space) => {
    squares = [...Array(NUM_SQUARES_X * NUM_SQUARES_Y)].map((x, i) => {
      const squareWidth = space.width / NUM_SQUARES_X;
      const squareHeight = space.height / NUM_SQUARES_Y;
      const xTopLeft = (i % NUM_SQUARES_X) * squareWidth;
      const yTopLeft = Math.floor(i / NUM_SQUARES_X) * squareHeight;
      return new Group(
        new Pt(xTopLeft, yTopLeft),
        new Pt(xTopLeft + squareWidth, yTopLeft),
        new Pt(xTopLeft + squareWidth, yTopLeft + squareHeight),
        new Pt(xTopLeft, yTopLeft + squareHeight)
      );
    });
    [...Array(10)].forEach((x, i) => {
      const startTime = getRandomIntBetween(0, 10 * 1000);
      animatedSquares[i] = {
        squareIndex: getUniqueSquareIndex(animatedSquares),
        startTime,
        endTime: startTime + getRandomIntBetween(2 * animTime, 10 * 1000),
        // color: COLORS[getRandomIntBetween(1, 4)],
        rotation: getRandomIntBetween(0, 3),
        opacity: rng(),
      };
    });
  },
  animate: (time, ftime, space) => {
    animatedSquares.forEach(
      ({ squareIndex, startTime, endTime, color, rotation, opacity }, i) => {
        if (time < startTime) return;
        if (time > endTime) {
          const startTime = getRandomIntBetween(time, time + 10 * 1000);
          animatedSquares[i] = {
            squareIndex: getUniqueSquareIndex(animatedSquares),
            startTime,
            endTime: startTime + getRandomIntBetween(2 * animTime, 10 * 1000),
            // color: COLORS[getRandomIntBetween(1, 4)],
            rotation: getRandomIntBetween(0, 3),
            opacity: rng(),
          };
          return;
        }
        const square = squares[squareIndex].clone();
        const pCenter = square.centroid();
        if (time <= startTime + animTime) {
          const s = (time - startTime) / animTime;
          square.scale([s, 1]);
        }
        if (time >= endTime - animTime) {
          // const s = 1 - (1 / (1 - endAnimFraction)) * (t - endAnimFraction);
          const s = (endTime - time) / animTime;
          square.scale([s, 1], square.p2);
        }
        square.rotate2D((rotation * Math.PI) / 2, pCenter);
        // form.fillOnly(color).polygon(square);
        form.fillOnly(transparentize('white', 1 - opacity)).polygon(square);
      }
    );
  },
});

// const tempo = new Tempo(60);

// let squareIndex = getRandomIntBetween(0, NUM_SQUARES_X * NUM_SQUARES_Y - 1);
// const everyFive = tempo.every(5);
// everyFive.start((count) => {
//   squareIndex = getRandomIntBetween(0, NUM_SQUARES_X * NUM_SQUARES_Y - 1);
// }, 1000);
// everyFive.progress((count, t) => {
//   const square = squares[squareIndex].clone();
//   const startAnimFraction = 0.2;
//   const endAnimFraction = 0.8;
//   if (t <= startAnimFraction) {
//     square.scale([t * (1 / startAnimFraction), 1]);
//   }
//   if (t >= endAnimFraction) {
//     const s = 1 - (1 / (1 - endAnimFraction)) * (t - endAnimFraction);
//     square.scale([s, 1], square.p2);
//   }

//   form.fillOnly(COLORS[1]).polygon(square);
// }, 1000);

// space.add(tempo);

space.play();
