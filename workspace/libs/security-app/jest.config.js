module.exports = {
  name: 'security-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/security-app',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
