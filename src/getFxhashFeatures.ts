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
  //   gentleBlue
  //   vibrantBlue
  //   magenta
  //   yellow

  let color;
  if (_.isEqual(iterationColorNames, ['gentleBlue'])) {
    color = 'Blue';
  } else if (_.isEqual(iterationColorNames, ['gentleBlue', 'vibrantBlue'])) {
    color = 'Blue';
  } else if (_.isEqual(iterationColorNames, ['gentleBlue', 'magenta'])) {
    color = 'Blue, magenta';
  } else if (_.isEqual(iterationColorNames, ['gentleBlue', 'yellow'])) {
    color = 'Blue, yellow';
  } else if (_.isEqual(iterationColorNames, ['vibrantBlue'])) {
    color = 'Blue';
  } else if (_.isEqual(iterationColorNames, ['magenta', 'vibrantBlue'])) {
    color = 'Blue, magenta';
  } else if (_.isEqual(iterationColorNames, ['vibrantBlue', 'yellow'])) {
    color = 'Blue, yellow';
  } else if (_.isEqual(iterationColorNames, ['magenta'])) {
    color = 'Magenta';
  } else if (_.isEqual(iterationColorNames, ['magenta', 'yellow'])) {
    color = 'Magenta, yellow';
  } else if (_.isEqual(iterationColorNames, ['yellow'])) {
    color = 'Yellow';
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
    Color: color,
  };
};
