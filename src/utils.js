function checkPathIsExist(path) {
  try {
    accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  checkPathIsExist,
};
