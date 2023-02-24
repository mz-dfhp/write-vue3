module.exports = {
  '*.{js,json}': ['prettier --write'],
  '*.ts?(x)': [
    'eslint --cache --cache-location node_modules/.cache/eslint/',
    'prettier --parser=typescript --write'
  ],
  '*.md': ['prettier --write --cache']
}
