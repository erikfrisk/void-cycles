import _ from 'lodash';
import { mapNumToRange } from './helpers';

export default (nPortals, portalsParams, transparentizeFactor) => {
  const averagePortalNLines =
    portalsParams.reduce((x, { nLines }) => x + nLines, 0) / nPortals;

  const averagePortalRotationTime =
    portalsParams.reduce((x, { rotationTime }) => x + rotationTime, 0) /
    nPortals;
  const averagePortalRotationTimeFactor = mapNumToRange(
    averagePortalRotationTime,
    [180 * 1000, 540 * 1000],
    [0, 1]
  );

  const averagePortalMoveRotationTime =
    portalsParams.reduce((x, { moveRotationTime }) => x + moveRotationTime, 0) /
    nPortals;
  const averagePortalMoveRotationTimeFactor = mapNumToRange(
    averagePortalMoveRotationTime,
    [30 * 1000, 100 * 1000],
    [0, 1]
  );

  const stillnessFactor =
    (averagePortalRotationTimeFactor + averagePortalMoveRotationTimeFactor) / 2;

  const iterationColorNames = _(portalsParams)
    .map('colorName')
    .uniq()
    .sort()
    .value();

  console.log('nPortals', nPortals);
  console.log('transparentizeFactor', transparentizeFactor);
  console.log('averagePortalNLines', averagePortalNLines);
  console.log('averagePortalRotationTime', averagePortalRotationTime);
  console.log(
    'averagePortalRotationTimeFactor',
    averagePortalRotationTimeFactor
  );
  console.log('averagePortalMoveRotationTime', averagePortalMoveRotationTime);
  console.log(
    'averagePortalMoveRotationTimeFactor',
    averagePortalMoveRotationTimeFactor
  );
  console.log('stillnessFactor', stillnessFactor);
  console.log('iterationColorNames', iterationColorNames);

  // paletteColors:
  //   fadedBlue
  //   vibrantBlue
  //   magenta
  //   yellow

  let palette;
  if (_.isEqual(iterationColorNames, ['fadedBlue'])) {
    palette = 'Faded blue';
  } else if (_.isEqual(iterationColorNames, ['fadedBlue', 'vibrantBlue'])) {
    palette = 'Blue';
  } else if (_.isEqual(iterationColorNames, ['fadedBlue', 'magenta'])) {
    palette = 'Faded blue, magenta';
  } else if (_.isEqual(iterationColorNames, ['fadedBlue', 'yellow'])) {
    palette = 'Faded blue, yellow';
  } else if (_.isEqual(iterationColorNames, ['vibrantBlue'])) {
    palette = 'Vibrant blue';
  } else if (_.isEqual(iterationColorNames, ['magenta', 'vibrantBlue'])) {
    palette = 'Vibrant blue, magenta';
  } else if (_.isEqual(iterationColorNames, ['vibrantBlue', 'yellow'])) {
    palette = 'Vibrant blue, yellow';
  } else if (_.isEqual(iterationColorNames, ['magenta'])) {
    palette = 'Magenta';
  } else if (_.isEqual(iterationColorNames, ['magenta', 'yellow'])) {
    palette = 'Magenta, yellow';
  } else if (_.isEqual(iterationColorNames, ['yellow'])) {
    palette = 'Yellow';
  }

  return {
    Emptiness: {
      3: 'Very high',
      4: 'High',
      5: 'Medium',
      6: 'Low',
    }[nPortals],
    Entropy:
      transparentizeFactor <= 0.3
        ? 'High'
        : transparentizeFactor <= 0.4
        ? 'Medium'
        : 'Low',
    Density:
      averagePortalNLines <= 133
        ? 'Low'
        : averagePortalNLines <= 167
        ? 'Medium'
        : 'High',
    Stillness:
      stillnessFactor <= 0.33
        ? 'Low'
        : stillnessFactor <= 0.67
        ? 'Medium'
        : 'High',
    Palette: palette,
  };
};
