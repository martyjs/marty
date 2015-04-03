export default function arrayToConstants(array) {
  let constants = {};

  array.forEach(function(actionType) {
    [actionType, `${actionType}_DONE`, `${actionType}_FAILED`, `${actionType}_STARTING`].
      forEach(type => constants[type] = type);
  });

  return constants;
}
