// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import { CanvasSpace, Pt, Group, Line } from 'pts';
import seedrandom from 'seedrandom';
import { transparentize } from 'color2k';

// Todo:
// [x] Make circles wiggle
// [x] Possibly add fraying to the outer edges of circles (UPDATE: NO!)
// [x] Fix resize
// [x] Add fxhash seed
// [x] Center canvas in window
// [x] Give it bound height on wide screens
// [x] Refactor circle/portal names
// [x] Refactor moveSpeed (two rotation speeds in different formats)
// [x] Fade in on load
// [ ] Give lines a minimum thickness when canvas is small
// [ ] Refactor features and make simple iterations more rare
// [ ] If animation is turned off, make sure it doesn't animate when resized
// [ ] Don't allow only darker blue (pick color combos)
// [ ] Change colors?
// [ ] Add query string param for turning off animation
// [ ] Set background color and padding with query string params
// [ ] Set line thickness with query string params
// [ ] Test on mobile

const SEED = (window as any).fxhash;
// const SEED = 'oozo2eYjpL8wbrVtHbfL9N8CEUaENiMqzLU6voWyCb9nVDK4Bru';
const COLORS = ['#130325', '#BE4B88', '#00A1D6', '#006A8E', '#D7C27D'];

console.log('Seed:', SEED);
const rng = seedrandom(SEED);

const getRandomBetween = (min, max) => min + (max - min) * rng();
const getRandomIntBetween = (min, max) => Math.round(min + (max - min) * rng());

const gaussianRng = (res = 10) =>
  [...Array(res)].reduce((r) => r + rng(), 0) / res;

const space = new CanvasSpace('#empty-portals');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });
const form = space.getForm();

const transparentizeFactor = getRandomBetween(0.2, 0.6);
const col = [
  COLORS[getRandomIntBetween(1, 4)],
  COLORS[getRandomIntBetween(1, 4)],
].sort();
const nPortals = getRandomIntBetween(3, 6);

const getRandomPortalParams = () => {
  const nLines = getRandomIntBetween(100, 200);
  return {
    pCenterMultipliers: {
      x: gaussianRng(),
      y: gaussianRng(),
    },
    radiusDivisor: getRandomBetween(0.8, 5),
    color: col[getRandomIntBetween(0, 1)],
    rotationTime: getRandomBetween(180 * 1000, 540 * 1000),
    rotationDirection: [-1, 1][getRandomIntBetween(0, 1)],
    moveDistanceDivisor: getRandomBetween(50, 100),
    moveRotationTime: getRandomBetween(30 * 1000, 100 * 1000),
    nLines,
    lineRotationFactor: getRandomBetween(0.2, 0.27),
    lineThicknesDivisor: 800,
    lineTransparentizeFactors: [...Array(nLines)].map(
      () => transparentizeFactor * rng()
    ),
  };
};

const portalsParams = [...Array(nPortals)].map(getRandomPortalParams);

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

const getAngleFromDirectionAndTime = (direction, rotationTime, time) =>
  direction * -((time % rotationTime) / rotationTime) * 2 * Math.PI;

const mapNumToRange = (number, [inMin, inMax], [outMin, outMax]) => {
  return ((number - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

const fadeTime = 2000;
const fadeStagger = -1000;

let portals;
let startTime;
space.add({
  start: (bound) => {
    portals = portalsParams.map((portalParams) =>
      getPortalFromParams(portalParams, bound)
    );
  },
  animate: (time) => {
    if (!startTime) startTime = time;
    portals.forEach((c, i) => {
      const moveVector = Line.fromAngle(
        new Pt(0, 0),
        getAngleFromDirectionAndTime(
          c.rotationDirection,
          c.moveRotationTime,
          time
        ),
        c.moveDistance
      )[1];
      c.lines.forEach(({ line, trans }) => {
        const _l: Group = line.clone();
        _l.rotate2D(
          getAngleFromDirectionAndTime(
            c.rotationDirection,
            c.rotationTime,
            time
          ),
          c.pCenter
        );
        _l.moveBy(moveVector);

        // Fade in portals
        const portalStartTime = startTime + i * (fadeTime + fadeStagger);
        let alpha = 0;
        if (time > portalStartTime && time < portalStartTime + fadeTime) {
          alpha = (time - portalStartTime) / fadeTime;
        } else if (time >= portalStartTime + fadeTime) {
          alpha = 1;
        }

        // Render
        form
          .strokeOnly(
            transparentize(c.color, mapNumToRange(alpha, [0, 1], [1, trans])),
            c.lineThickness
          )
          .line(_l);
      });
    });
  },
  resize: (bound) => {
    portals = portalsParams.map((portalParams) =>
      getPortalFromParams(portalParams, bound)
    );
  },
});

space.play();
