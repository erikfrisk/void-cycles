// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import { CanvasSpace, Pt, Group, Line, Bound } from 'pts';
import seedrandom from 'seedrandom';
import { transparentize } from 'color2k';

// Todo:
// [x] Make circles wiggle
// [x] Possibly add fraying to the outer edges of circles (UPDATE: NO!)
// [x] Fix resize
// [ ] Add query string param for turning off animation
// [ ] Refactor features and make simple iterations more rare
// [ ] Add fxhash seed
// [ ] Center canvas in window
// [ ] Fade in on load
// [ ] Refactor moveSpeed (two rotation speeds in different formats)
// [ ] Refactor circle/portal names
// [ ] Give it bound height on wide screens
// [ ] Give lines a minimum thickness when canvas is small
// [ ] If animation is turned off, make sure it doesn't animate when resized

const SEED = (window as any).fxhash;
// const SEED = 'oozo2eYjpL8wbrVtHbfL9N8CEUaENiMqzLU6voWyCb9nVDK4Bru';
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
const N_CIRCLES = getRandomIntBetween(3, 6);

const getRandomPortalParams = () => {
  const nLines = getRandomIntBetween(100, 200);
  return {
    pCenterMultipliers: {
      x: gaussianRng(),
      y: gaussianRng(),
    },
    radiusDivisor: getRandomBetween(0.8, 5),
    color: col[getRandomIntBetween(0, 1)],
    rotationSpeed: getRandomBetween(0.00001, 0.00003),
    rotationDirection: [-1, 1][getRandomIntBetween(0, 1)],
    moveDistanceDivisor: getRandomBetween(50, 100),
    moveSpeed: getRandomBetween(30000, 100000),
    nLines,
    lineRotationFactor: getRandomBetween(0.2, 0.27),
    lineThicknesDivisor: 800,
    lineTransparentizeFactors: [...Array(nLines)].map(
      () => transparentizeFactor * rng()
    ),
  };
};

const circleParams = [...Array(N_CIRCLES)].map(getRandomPortalParams);

const getPortalFromParams = (params, bound) => {
  const pCenter = new Pt(
    bound.width * params.pCenterMultipliers.x,
    bound.height * params.pCenterMultipliers.y
  );
  const radius = bound.width / params.radiusDivisor;
  return {
    ...params,
    pCenter,
    radius,
    moveDistance: bound.width / params.moveDistanceDivisor,
    lineThickness: bound.width / params.lineThicknesDivisor,
    lines: [...Array(params.nLines)].map((x, i) => {
      const l = Line.fromAngle(
        pCenter,
        i * ((2 * Math.PI) / params.nLines),
        radius
      );
      l[0] = l.centroid();
      // l.scale(getRandomBetween(1, 1.1), l[0]);
      l.rotate2D(
        params.rotationDirection * 2 * Math.PI * params.lineRotationFactor
      );
      return {
        line: l,
        trans: params.lineTransparentizeFactors[i],
      };
    }),
  };
};

let circles;
space.add({
  start: (bound) => {
    circles = circleParams.map((portalParams) =>
      getPortalFromParams(portalParams, bound)
    );
  },
  animate: (time) => {
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
          .strokeOnly(transparentize(c.color, trans), c.lineThickness)
          .line(_l);
      });
    });
  },
  resize: (bound) => {
    circles = circleParams.map((portalParams) =>
      getPortalFromParams(portalParams, bound)
    );
  },
});

space.play();
