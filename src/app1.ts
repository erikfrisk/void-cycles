// https://coolors.co/130325-e82835-00a1d6-006a8e-d7c27d

const COLORS = ['#130325', '#E82835', '#00A1D6', '#006A8E', '#D7C27D'];
const LEFT_SECTIONS = 20;

import { CanvasSpace, Pt, Group, Num, Line } from 'pts';

const space = new CanvasSpace('#hello');
space.setup({ bgcolor: COLORS[0], retina: true, resize: true });

const form = space.getForm();

space.add((time, ftime) => {
  const p = Num.randomPt(
    [space.width / 3, space.height / 3],
    [(space.width * 2) / 3, (space.height * 2) / 3]
  );

  const pUp = new Pt(p.x, 0);

  const rectRight = new Group(pUp, new Pt(space.width, space.height));

  const pTopLeft = new Pt();
  const pTopRight = new Pt(space.width, 0);
  const pBottomRight = new Pt(space.width, space.height);
  const pBottomLeft = new Pt(0, space.height);

  const rayTop = new Group(pTopLeft, pTopRight);
  const rayLeft = new Group(pTopLeft, pBottomLeft);
  const rayBottom = new Group(pBottomLeft, pBottomRight);

  const polygonsLeft = [...Array(LEFT_SECTIONS - 1)].map((x, i) => {
    const angleTop = (Math.PI * 2 * 3) / 4;
    const angleDiff = ((i + 1) / LEFT_SECTIONS) * Math.PI;
    const angle = angleTop - angleDiff;

    const p2 = p.clone();
    p2.toAngle(angle, 1, true);

    const ray = new Group(p, p2);
    const pTopRay = Line.intersectRay2D(rayTop, ray);
    const pLeftRay = Line.intersectRay2D(rayLeft, ray);
    const pBottomRay = Line.intersectRay2D(rayBottom, ray);

    if (pTopRay && pTopRay.x >= 0 && pTopRay.x <= p.x) {
      return new Group(p, pUp, pTopRay);
    } else if (pLeftRay && pLeftRay.y >= 0 && pLeftRay.y <= space.height) {
      return new Group(p, pUp, pTopLeft, pLeftRay);
    } else if (pBottomRay && pBottomRay.x >= 0 && pBottomRay.x <= p.x) {
      return new Group(p, pUp, pTopLeft, pBottomLeft, pBottomRay);
    }
  });

  form.fillOnly(COLORS[0]).rect(rectRight);
  // form.fillOnly(COLORS[4]).point(p, 3, 'circle');
  polygonsLeft.forEach((poly) =>
    form
      .fillOnly(COLORS[1])
      .alpha(1 / LEFT_SECTIONS)
      .polygon(poly)
  );
});

space.playOnce();
