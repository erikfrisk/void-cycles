// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import { CanvasSpace, Pt, Create, Group, Tempo, Mat, Circle, Line } from 'pts';
import seedrandom from 'seedrandom';
import randomWords from 'random-words';
import PoissonDiskSampling from 'poisson-disk-sampling';
import { transparentize } from 'color2k';

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

const getRandomLinesCircle = (space) => {
  const pCenter = new Pt(
    space.width * gaussianRng(),
    space.height * gaussianRng()
  );
  const radius = space.width / getRandomBetween(0.8, 5);
  const N_LINES = getRandomIntBetween(100, 200);
  const rotation = getRandomBetween(0.2, 0.27);
  return [...Array(N_LINES)].map((x, i) => {
    const l = Line.fromAngle(pCenter, i * ((2 * Math.PI) / N_LINES), radius);
    l[0] = l.centroid();
    l.rotate2D(2 * Math.PI * rotation);
    return l;
  });
};

space.add({
  start: (bound, space) => {},
  animate: (time, ftime, space) => {
    const N_CIRCLES = getRandomIntBetween(3, 6);
    const circles = [...Array(N_CIRCLES)].map(() =>
      getRandomLinesCircle(space)
    );

    const col = [
      COLORS[getRandomIntBetween(1, 4)],
      COLORS[getRandomIntBetween(1, 4)],
    ];
    const transparentizeFactor = getRandomBetween(0.2, 0.6);
    console.log('transparentizeFactor', transparentizeFactor);
    circles.forEach((c) => {
      const _col = col[getRandomIntBetween(0, 1)];
      c.forEach((l) => {
        form
          .strokeOnly(
            transparentize(_col, transparentizeFactor * rng()),
            space.width / 800
          )
          .line(l);
      });
    });
  },
});

space.playOnce();
