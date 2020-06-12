const fs = require('fs');
const path = require('path');

if (require.main === module) {
  const root = process.cwd();

  const namespaces = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const icons = [];
  for (const namespace of namespaces) {
    const namespaceRoot = path.join(root, namespace);
    for (const file of walk(namespaceRoot)) {
      const name = path
        .basename(file, '.svg')
        .replace(/^sbb_/, '')
        .replace(/_/g, '-');
      const tags = path.relative(root, path.dirname(file)).split('/');
      fs.renameSync(file, path.join(namespaceRoot, `${name}.svg`));
      icons.push({ name, namespace, tags });
    }
  }

  fs.writeFileSync(
    path.join(root, 'index.json'),
    JSON.stringify(icons),
    'utf8'
  );

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>SBB Icon CDN</title>
  <style type="text/css">
    body {
      display: flex;
      flex-wrap: wrap;
    }
    a {
      color: black;
      margin: 0.5rem;
      text-align: center;
      text-decoration: none;
      width: 25rem;
    }
    table {
      text-align: left;
    }
  </style>
</head>
<body>
${icons
  .map(
    (i) => `<a href="${i.namespace}/${i.name}.svg">
  <img src="${i.namespace}/${i.name}.svg">
  <table>
    <tr>
      <th>Name</th>
      <td>${i.name}</td>
    </tr>
    <tr>
      <th>Namespace</th>
      <td>${i.namespace}</td>
    </tr>
  </table>
</a>
`
  )
  .join('\n')}
</body>
</html>
`;
  fs.writeFileSync(
    path.join(root, 'index.html'),
    html,
    'utf8'
  );
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((files, entry) => {
    if (entry.isFile()) {
      files.push(path.join(dir, entry.name));
    } else if (entry.isDirectory()) {
      files.push(...walk(path.join(dir, entry.name)));
    }
    return files;
  }, []);
}
