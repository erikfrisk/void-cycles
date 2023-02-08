// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import {
  CanvasSpace,
  Pt,
  Create,
  Group,
  Tempo,
  Mat,
  Circle,
  Line,
  Num,
} from 'pts';
import seedrandom from 'seedrandom';
import randomWords from 'random-words';
import { transparentize } from 'color2k';

// Todo:
// [x] Make circles wiggle
// [x] Possibly add fraying to the outer edges of circles (UPDATE: NO!)
// [ ] Add query string param for turning off animation
// [ ] Refactor features and make simple iterations more rare
// [ ] Add fxhash seed
// [ ] Fix reload
// [ ] Center canvas in window

const [SEED] = randomWords(1);
// const SEED = 'hello';
const COLORS = ['#130325', '#BE4B88', '#00A1D6', '#006A8E', '#D7C27D'];

console.log('Seed:', SEED);
const rng = seedrandom(SEED);

const getRandomBetween = (min, max) => min + (max - min) * rng();
const getRandomIntBetween = (min, max) => Math.round(min + (max - min) * rng());

const gaussianRng = (res = 10) =>
  [...Array(res)].reduce((r) => r + rng(), 0) / res;

const space = new CanvasSpace('#hello');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });
const form = space.getForm();

const transparentizeFactor = getRandomBetween(0.2, 0.6);
const col = [
  COLORS[getRandomIntBetween(1, 4)],
  COLORS[getRandomIntBetween(1, 4)],
].sort();

const getRandomLinesCircle = (space) => {
  const pCenter = new Pt(
    space.width * gaussianRng(),
    space.height * gaussianRng()
  );
  const radius = space.width / getRandomBetween(0.8, 5);
  const N_LINES = getRandomIntBetween(100, 200);
  const rotation = getRandomBetween(0.2, 0.27);
  const rotationDirection = [-1, 1][getRandomIntBetween(0, 1)];
  return {
    pCenter,
    radius,
    color: col[getRandomIntBetween(0, 1)],
    rotationSpeed: getRandomBetween(0.00001, 0.00003),
    rotationDirection,
    moveDistance: space.width / getRandomBetween(50, 100),
    moveSpeed: getRandomBetween(30000, 100000),
    nLines: N_LINES,
    lineRotationFactor: rotation,
    lines: [...Array(N_LINES)].map((x, i) => {
      const l = Line.fromAngle(pCenter, i * ((2 * Math.PI) / N_LINES), radius);
      l[0] = l.centroid();
      // l.scale(getRandomBetween(1, 1.1), l[0]);
      l.rotate2D(rotationDirection * 2 * Math.PI * rotation);
      return {
        line: l,
        trans: transparentizeFactor * rng(),
      };
    }),
  };
};

let circles;
space.add({
  start: (bound, space) => {
    const N_CIRCLES = getRandomIntBetween(3, 6);
    circles = [...Array(N_CIRCLES)].map(() => getRandomLinesCircle(space));
  },
  animate: (time, ftime, space) => {
    circles.forEach((c) => {
      const movedPCenter = Line.fromAngle(
        new Pt(0, 0),
        c.rotationDirection *
          -((time % c.moveSpeed) / c.moveSpeed) *
          2 *
          Math.PI,
        c.moveDistance
      )[1];
      c.lines.forEach(({ line, trans }) => {
        const _l: Group = line.clone();
        _l.moveBy(movedPCenter);
        _l.rotate2D(c.rotationDirection * -time * c.rotationSpeed, c.pCenter);
        form
          .strokeOnly(transparentize(c.color, trans), space.width / 800)
          .line(_l);
      });
    });
  },
});

space.play();
