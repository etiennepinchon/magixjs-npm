var Generate;

Generate = {};

Generate.HTML = function(name, description, keywords, app_icon) {
  var html;
  html = '<html>\n<head>\n\t<title>' + name + '</title>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t';
  if (app_icon) {
    html += '<link rel="icon" type="image/png" href="/documents/icon/' + app_icon + '.png">\n\t';
  } else {
    html += '<link rel="icon" type="image/png" href="https://data.orbe.io/default/favicon/icon.png">\n\t';
  }
  if (description && description.length > 0) {
    html += '<meta name="description" content="' + description + '">\n\t';
  }
  if (keywords && keywords.length > 0 && keywords[0].length > 0) {
    html += '<meta name="keywords" content="' + keywords + '">\n\t';
  }
  html += '\n\t<!-- SCRIPT -->\n\t<script type="text/javascript" src="https://orbe.io/framework/1.0/orbe.loader.min.js"></script>\n\t<script type="text/javascript" src="/build/catalog.js"></script>\n<script type="text/javascript" src="/build/index.js"></script>\n</head>\n<body>\n</body>\n</html>';
  return html;
};

Generate.indexJS = function(paths) {
  if (!paths) {
    paths = "'/build/App.js'";
  }
  return "window.__BUILD = " + (JSON.stringify(new Date().getTime())) + ";\nOrbe.load(" + paths + ");";
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
  return "// Import fonts\nFonts({\n\tname: 'Open Sans',\n\tweight: '400,300'\n});\n\n// Create page\nApp.page = new Page({\n\tbackgroundColor: white\n})\n\nvar hello = new Text({\n\ttext: 'Hello',\n\twidth: 300,\n\tfontSize: 90,\n\tfontWeight: 300,\n\tcolor: black,\n\tspacing: 4,\n\tparent: App.page\n});\n\nhello.center();\n";
};

Generate.CS = function() {
  return "# Import fonts\nFonts\n\tname: 'Open Sans'\n\tweight: '400,300'\n\n# Create page\nApp.page = new Page\n\tbackgroundColor: white\n\nhello = new Text\n\ttext: 'Hello'\n\twidth: 300\n\tfontSize: 90\n\tfontWeight: 300\n\tcolor: black\n\tspacing: 4\n\tparent: App.page\n\t\nhello.center()";
};

Generate.PlaygroundJS = function(playground) {
  if (!playground) {
    playground = "";
  }
  return 'var Playground = new Page();\nApp.page = Playground;\n\n' + playground + '\n';
};

Generate.PlaygroundContentJS = function() {
  return "// Import fonts\nFonts({\n\tname: 'Open Sans',\n\tweight: '400,300'\n});\n\nvar hello = new Text({\n\ttext: 'Hello',\n\twidth: 300,\n\tfontSize: 90,\n\tfontWeight: 300,\n\tcolor: black,\n\tspacing: 4,\n\tparent: Playground\n});\n\nhello.center();";
};

Generate.PlaygroundContentCS = function() {
  return "# Import fonts\nFonts\n\tname: 'Open Sans'\n\tweight: '400,300'\n\nhello = new Text\n\ttext: 'Hello'\n\twidth: 300\n\tfontSize: 90\n\tfontWeight: 300\n\tcolor: black\n\tspacing: 4\n\tparent: Playground\n\nhello.center()";
};

module.exports = Generate;

Generate.playgroundRunJS = function(playground) {
  if (!playground) {
    playground = '';
  }
  return 'App.run(function() {\n' + playground + '\n});';
};

Generate.appRunJS = function(app) {
  if (!app) {
    app = '';
  }
  return 'App.run(function() {\n' + app + '\n});';
};
