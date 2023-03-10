// Void cycles by Erik Frisk, 2023-02-12
//
// Copyright (c) 2023, Erik Frisk
// All rights reserved.
//
// Libraries used (via npm):
// - parcel (MIT License)
// - color2k (MIT License)
// - lodash (MIT License)
// - normalize.css (MIT License)
// - pts (Apache License, Version 2.0)
// - seedrandom (MIT License)

import { CanvasSpace, Pt, Group, Line } from 'pts';
import seedrandom from 'seedrandom';
import { transparentize } from 'color2k';
import {
  getAngleFromDirectionAndTime,
  getRngHelpers,
  mapNumToRange,
} from './helpers';
import getFxhashFeatures from './getFxhashFeatures';

// Available query string parameters:
// animate=false
// background=000

const SEED = (window as any).fxhash;

console.log('Seed:', SEED);

const rng = seedrandom(SEED);

const { getRandomBetween, getRandomIntBetween, gaussianRng } =
  getRngHelpers(rng);

// --------------------------------------------
// Query string params
// --------------------------------------------

const qsParams = new URLSearchParams(window.location.search);

const isAnimate =
  (qsParams.get('animate') || '').toLowerCase() !== 'false' &&
  !(window as any).isFxpreview;
const background = qsParams.get('background');

if (background) {
  document.body.style.backgroundColor = `#${background}`;
}

// --------------------------------------------
// Generate parameters and features
// --------------------------------------------

const COLORS = ['#130325', '#BE4B88', '#00A1D6', '#006A8E', '#D7C27D'];

const paletteColors = {
  gentleBlue: COLORS[3],
  vibrantBlue: COLORS[2],
  magenta: COLORS[1],
  yellow: COLORS[4],
};
const paletteColorNames = Object.keys(paletteColors);

const nPortals = [3, 4, 4, 5, 5, 5, 6, 6, 6][getRandomIntBetween(0, 8)];
const transparentizeFactor = [
  0.2, 0.3, 0.3, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6,
][getRandomIntBetween(0, 11)];
const iterationColorNames = [
  paletteColorNames[getRandomIntBetween(0, 3)],
  paletteColorNames[getRandomIntBetween(0, 3)],
].sort();

const getRandomPortalParams = () => {
  const nLines = getRandomIntBetween(100, 200);
  return {
    pCenterMultipliers: {
      x: gaussianRng(),
      y: gaussianRng(),
    },
    radiusDivisor: getRandomBetween(0.8, 5),
    colorName: iterationColorNames[getRandomIntBetween(0, 1)],
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

(window as any).$fxhashFeatures = getFxhashFeatures(
  nPortals,
  portalsParams,
  transparentizeFactor
);

console.log('Features:');
console.log('* Emptiness:', (window as any).$fxhashFeatures.Emptiness);
console.log('* Entropy:', (window as any).$fxhashFeatures.Entropy);
console.log('* Density:', (window as any).$fxhashFeatures.Density);
console.log('* Stillness:', (window as any).$fxhashFeatures.Stillness);
console.log('* Color:', (window as any).$fxhashFeatures.Color);

// --------------------------------------------
// Render and animate
// --------------------------------------------

const space = new CanvasSpace('#void-cycles');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });
const form = space.getForm();

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
      if (isAnimate) {
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
              transparentize(
                paletteColors[c.colorName],
                mapNumToRange(alpha, [0, 1], [1, trans])
              ),
              c.lineThickness
            )
            .line(_l);
        });
      } else {
        c.lines.forEach(({ line, trans }) => {
          // Render
          form
            .strokeOnly(
              transparentize(paletteColors[c.colorName], trans),
              c.lineThickness
            )
            .line(line);
        });
      }
    });
  },
  resize: (bound) => {
    portals = portalsParams.map((portalParams) =>
      getPortalFromParams(portalParams, bound)
    );
  },
});

if (isAnimate) {
  space.play();
} else {
  space.playOnce();
}
