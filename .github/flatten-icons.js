const fs = require('fs');
const path = require('path');

if (require.main === module) {
  const version = process.env.CDN_VERSION || 'unversioned';
  const root = process.cwd();

  const namespaces = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const icons = [];
  for (const namespace of namespaces) {
    const namespaceRoot = path.join(root, namespace);
    for (const file of walk(namespaceRoot)) {
      const name = path.basename(file, '.svg');
      const tags = path.relative(root, path.dirname(file)).split('/');
      const flatFilePath = path.join(namespaceRoot, `${name}.svg`);
      fs.renameSync(file, flatFilePath);
      markImmutable(flatFilePath, file);
      icons.push({ name, namespace, tags });
    }
  }

  fs.writeFileSync(
    path.join(root, 'index.json'),
    JSON.stringify({ version, icons }),
    'utf8'
  );

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>SBB Icon CDN</title>
  <style type="text/css">
    main {
      display: flex;
      flex-wrap: wrap;
    }
    div {
      color: black;
      display: inline-flex;
      flex-direction: column;
      margin: 0.5rem;
      text-align: center;
      text-decoration: none;
      width: 15rem;
    }
    span {
      user-select: all;
    }
  </style>
</head>
<body>
  <h1>SBB Icon CDN ${version}</h1>
  <main>
${icons
  .map(
    (i) => `<div>
  <a href="${i.namespace}/${i.name}.svg">
    <img src="${i.namespace}/${i.name}.svg">
  </a>
  <span>${i.namespace}:${i.name}</span>
</div>
`
  )
  .join('\n')}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');

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
  
  function markImmutable(file, originalPath) {
    originalPath = originalPath.toLowerCase();
    if (originalPath.includes('/fpl/') && ['/him-cus/', '/produkt/'].some(p => originalPath.includes(p))) {
      console.log(`Marked ${path.relative(root, file)} as color immutable`);
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace('<svg ', '<svg class="color-immutable" ');
      fs.writeFileSync(file, content, 'utf8');
    }
  }  
}
