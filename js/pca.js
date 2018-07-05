const PCA = require('ml-pca');
const dataset = [[4.9, 3.2, 1.2, 0.4], [5.4, 3.3, 1.4, 0.9]];
// dataset is a two-dimensional array where rows represent the samples and columns the features
const pca = new PCA(dataset);
console.log(pca.getExplainedVariance());
/*
[ 0.9246187232017269,
  0.05306648311706785,
  0.017102609807929704,
  0.005212183873275558 ]
*/
const newPoints = [[4.9, 3.2, 1.2, 0.4], [5.4, 3.3, 1.4, 0.9]];
console.log(pca.predict(newPoints)); // project new points into the PCA space
/*
[
  [ -2.830722471866897,
    0.01139060953209596,
    0.0030369648815961603,
    -0.2817812120420965 ],
  [ -2.308002707614927,
    -0.3175048770719249,
    0.059976053412802766,
    -0.688413413360567 ]]
*/