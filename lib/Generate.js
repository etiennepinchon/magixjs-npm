var Generate;

Generate = {};

Generate.HTML = function(name, description, keywords, app_icon) {
  var html;
  html = '<html>\n<head>\n\t<title>' + name + '</title>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t';
  if (app_icon) {
    html += '<link rel="icon" type="image/png" href="/documents/icon/' + app_icon + '.png">\n\t';
  } else {
    html += '<link rel="icon" type="image/png" href="https://magixjs.com/default/favicon/icon.png">\n\t';
  }
  if (description && description.length > 0) {
    html += '<meta name="description" content="' + description + '">\n\t';
  }
  if (keywords && keywords.length > 0 && keywords[0].length > 0) {
    html += '<meta name="keywords" content="' + keywords + '">\n\t';
  }
  html += '\n\t<!-- SCRIPT -->\n\t<script type="text/javascript" src="https://magixjs.com/framework/1.0/magix.loader.min.js"></script>\n\t<script type="text/javascript" src="/build/catalog.js"></script>\n\t<script type="text/javascript" src="/build/index.js"></script>\n</head>\n<body>\n</body>\n</html>';
  return html;
};

Generate.indexJS = function(paths) {
  if (!paths) {
    paths = "'/build/App.js'";
  }
  return "window.__BUILD = " + (JSON.stringify(new Date().getTime())) + ";\nMagiX.load(" + paths + ");";
};

Generate.catalog = function(documents) {
  var catalog, collection, collection_index, file_ext, file_name, full_path, i, item, path, paths_collection, _i, _len;
  if (!documents) {
    documents = [];
  }
  paths_collection = [];
  collection = '';
  i = 0;
  for (_i = 0, _len = documents.length; _i < _len; _i++) {
    item = documents[_i];
    full_path = item.split('/');
    file_name = full_path[full_path.length - 1];
    path = item.replace(file_name, '');
    file_ext = file_name.split('.').pop();
    collection_index = paths_collection.indexOf(path);
    if (collection_index === -1) {
      paths_collection.push(path);
      collection_index = paths_collection.length - 1;
    }
    collection += 'a[p[' + collection_index + ']+"' + file_name.replace(new RegExp('.' + file_ext + '$'), '') + '"]="' + file_ext + '";';
    i++;
  }
  catalog = "a={};p=" + (JSON.stringify(paths_collection)) + ";";
  catalog += collection;
  catalog += 'window.__CATALOG=a;';
  return catalog;
};

Generate.JS = function() {
  return "// Import font\nFont('Quicksand', '400,300');\n\n// Create page\nApp.page = new Page({\n\tbackgroundColor: white\n})\n\nvar hello = new Text({\n\ttext: 'magiX',\n\twidth: 300,\n\tfontSize: 90,\n\tfontWeight: 300,\n\tcolor: black,\n\tspacing: 4\n\t});\n\nhello.center();";
};

Generate.CS = function() {
  return "# Import font\nFont 'Quicksand', '400,300'\n\n# Create page\nApp.page = new Page\n\tbackgroundColor: white\n\nhello = new Text\n\ttext: 'magiX'\n\twidth: 300\n\tfontSize: 90\n\tfontWeight: 300\n\tcolor: black\n\tspacing: 4\n\t\nhello.center()\n";
};

Generate.appRunJS = function(app) {
  if (!app) {
    app = '';
  }
  return 'App.run(function() {\n' + app + '\n});\n';
};

module.exports = Generate;
