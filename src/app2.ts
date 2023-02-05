// https://coolors.co/130325-be4b88-00a1d6-004d66-d7c27d

import { CanvasSpace, Pt, Create, Group } from 'pts';
import seedrandom from 'seedrandom';
import randomWords from 'random-words';
import PoissonDiskSampling from 'poisson-disk-sampling';
import { transparentize } from 'color2k';

const [SEED] = randomWords(1);
// const SEED = 'hello';
const COLORS = ['#130325', '#BE4B88', '#00A1D6', '#006A8E', '#D7C27D'];

console.log(SEED);
const rng = seedrandom(SEED);

const getRandomBetween = (min, max) => min + (max - min) * rng();

const space = new CanvasSpace('#hello');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });
const form = space.getForm();

space.add((time, ftime) => {
  // Point
  const p = new Pt(
    (space.width / 2) * rng() + space.width / 4,
    (space.height / 2) * rng() + space.height / 4
  );

  // Arc
  const getLine = () => {
    const maxDistanceFromPoint = space.width / 30;
    const getRandomCloseEnoughToPoint = () => {
      return p.$add([
        getRandomBetween(-maxDistanceFromPoint, maxDistanceFromPoint),
        getRandomBetween(-maxDistanceFromPoint, maxDistanceFromPoint),
      ]);
    };
    const pLineStart = getRandomCloseEnoughToPoint();
    return new Group(pLineStart);
  };
  const line = getLine();

  // Circle poisson distance function
  const pCircle = new Pt(
    (space.width / 2) * rng() + space.width / 4,
    (space.height / 2) * rng() + space.height / 4
  );
  const circleRadius = getRandomBetween(space.width * 0.2, space.width * 0.45);
  // const circle = Circle.fromCenter(pCircle, circleRadius);

  const circleThickness = space.width / getRandomBetween(5, 10);
  const distanceFunction = (p) => {
    const vector = pCircle.$subtract(p[0], p[1]);
    const magnitude = vector.magnitude();
    const distanceToCircleEdge = Math.abs(magnitude - circleRadius);
    return distanceToCircleEdge > circleThickness
      ? 1
      : distanceToCircleEdge / circleThickness;
  };

  // Poisson and Voronoi
  const minDistance = space.width / 25;
  const depth = minDistance * 3;
  const pds = new PoissonDiskSampling(
    {
      shape: [space.width, space.height, depth],
      minDistance: minDistance,
      maxDistance: minDistance * 1.8,
      distanceFunction,
    },
    rng
  );

  const pdsPoints = pds.fill();

  const points2D = pdsPoints.map(([x, y]) => new Pt(x, y));

  const de = Create.delaunay(points2D);
  de.delaunay();
  const cells = de.voronoi();

  // Render

  form.strokeOnly(COLORS[3]).polygons(cells);

  // pdsPoints.forEach((p) =>
  //   form
  //     .fillOnly(transparentize(COLORS[1], 1 - p[2] / depth))
  //     .point(new Pt(p[0], p[1]), (p[2] / depth) * 2, 'circle')
  // );

  // form.strokeOnly('pink').circle(circle);

  form.fillOnly(COLORS[4]).point(p, getRandomBetween(10, 20), 'circle');
  // form.fillOnly('pink').point(pCircle, 10, 'circle');

  // form.strokeOnly(COLORS[1], 10).line(line);
});

space.playOnce();
