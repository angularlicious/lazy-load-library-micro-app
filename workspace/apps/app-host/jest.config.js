module.exports = {
  name: 'app-host',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/app-host',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
