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
    // Palette: Faded blue | Blue on blue | Vibrant blue | Magenta | Yellow | Blue on yellow | Blue on magenta | Magenta on yellow
  };
};
