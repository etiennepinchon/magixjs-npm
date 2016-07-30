#!/usr/bin/env node

var CoffeeScript, CookieParser, Generate, about, build, buildAutoImport, buildProduction, capitalizeFirstLetter, clean, colors, compileFile, create, deleteFolderRecursive, dirCheck, fs, getDirectories, indent, launch, makeID, path, program, prompt, reorderFiles, restify, uglify, walk, watch, watcher;

prompt = require('prompt');

program = require('commander');

colors = require('colors');

fs = require('fs-extra');

walk = require('walk');

path = require('path');

watcher = require('node-watch');

Generate = require('./lib/Generate');

CoffeeScript = require('coffee-script');

uglify = require('uglify-js');

restify = require('restify');

CookieParser = require('restify-cookies');

prompt.message = 'Orbe';

Array.prototype.move = function(old_index, new_index) {
  var k;
  if (new_index >= this.length) {
    k = new_index - this.length;
    while (k-- + 1) {
      this.push(void 0);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this;
};

reorderFiles = function(files) {
  var id, index, item, item2, new_files, no_match, _i, _len;
  new_files = JSON.parse(JSON.stringify(files));
  no_match = [];
  for (item in files) {
    index = -1;
    for (item2 in new_files) {
      if (new_files[item2].name === files[item]["extends"]) {
        index = item2;
      }
    }
    if (index > -1) {
      if (index > item) {
        new_files = new_files.move(index, item);
      }
    } else {
      no_match.push(files[item].id);
    }
  }
  for (_i = 0, _len = no_match.length; _i < _len; _i++) {
    id = no_match[_i];
    if (id !== void 0) {
      for (item in new_files) {
        if (new_files[item].id === id) {
          new_files.move(item, 0);
        }
      }
    }
  }
  return new_files;
};

capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};

indent = function(str, numOfIndents, opt_spacesPerIndent) {
  str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
  numOfIndents = new Array(opt_spacesPerIndent + 1 || 0).join(' ');
  if (opt_spacesPerIndent) {
    return str.replace(/^\t+/g, (function(tabs) {
      return tabs.replace(/./g, numOfIndents);
    }));
  } else {
    return str;
  }
};

deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath;
      curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

makeID = function() {
  var i, possible, text;
  text = '';
  possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
  i = 0;
  while (i < 8) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    i++;
  }
  return text;
};

about = function() {
  console.log('');
  console.log('                 888');
  console.log('                 888');
  console.log('                 888');
  console.log(' .d88b.  888d888 88888b.   .d88b.');
  console.log('d88""88b 888P"   888 "88b d8P  Y8b');
  console.log('888  888 888     888  888 88888888');
  console.log('Y88..88P 888     888 d88P Y8b.');
  console.log(' "Y88P"  888     88888P"   "Y8888');
  console.log('');
  console.log('Orbe | orbe.io'.green);
  console.log('Created by Etienne Pinchon (@etiennepinchon)'.green);
  console.log('Copyright ©2016'.green);
};

create = function(type) {
  if (!type) {
    console.log('Orbe: [ERR] Orbe type required! Choose from "app" or "playground" like so "orbe create app" :)'.red);
    return;
  }
  type = type.toLowerCase();
  if (type === 'app' || type === 'playground') {
    prompt.start();
    prompt.get({
      properties: {
        name: {
          pattern: /^[a-zA-Z0-9\_\s\-]{1,100}$/,
          message: 'Name must be only letters, numbers, underscores, spaces or dashes.',
          required: true
        }
      }
    }, function(err, result) {
      var appCS, appJS, appNameCS, createCatalog, createIndexJS, createJSON, dirBuild, dirOrb, dirSources, done, htmlContent;
      if (err) {
        return;
      }
      dirOrb = './orb-' + result.name;
      if (!fs.existsSync(dirOrb)) {
        fs.mkdirSync(dirOrb);
      }
      appJS = Generate.JS();
      appCS = Generate.CS();
      if (type === 'playground') {
        appJS = Generate.PlaygroundJS(Generate.PlaygroundContentJS());
        appCS = Generate.PlaygroundContentCS();
      }
      done = function() {
        console.log('Orbe: ' + type + ' created successfully.'.green);
        return console.log('Orbe: Path: ' + process.cwd() + '/orb-' + result.name);
      };
      createJSON = function() {
        var packageFile;
        packageFile = {
          name: result.name,
          type: type,
          version: '0.0.0',
          description: '',
          tags: '',
          created_at: new Date
        };
        return fs.writeFile(dirOrb + '/orb.json', JSON.stringify(packageFile, null, 2), function(err) {
          if (err) {
            return console.log(err);
          }
          return done();
        });
      };
      createIndexJS = function() {
        var indexJS;
        indexJS = Generate.indexJS();
        return fs.writeFile(dirOrb + '/build/index.js', indexJS, function(err) {
          if (err) {
            return console.log(err);
          }
          return createCatalog();
        });
      };
      createCatalog = function() {
        var catalog;
        catalog = Generate.catalog();
        return fs.writeFile(dirOrb + '/build/catalog.js', catalog, function(err) {
          if (err) {
            return console.log(err);
          }
          return createJSON();
        });
      };
      dirBuild = dirOrb + '/build';
      dirSources = dirOrb + '/documents';
      if (!fs.existsSync(dirOrb)) {
        fs.mkdirSync(dirOrb);
      }
      if (!fs.existsSync(dirBuild)) {
        fs.mkdirSync(dirBuild);
      }
      if (!fs.existsSync(dirSources)) {
        fs.mkdirSync(dirSources);
      }
      htmlContent = Generate.HTML(result.name, '', '', false);
      appNameCS = '/App.coffee';
      if (type === 'playground') {
        appNameCS = '/Playground.coffee';
        appJS = Generate.playgroundRunJS(indent(appJS, 1));
      } else {
        appJS = Generate.appRunJS(indent(appJS, 1));
      }
      fs.writeFile(dirOrb + '/index.html', htmlContent, function(err) {
        if (err) {
          return console.log(err);
        }
        fs.writeFile(dirBuild + '/App.js', appJS, function(err) {
          if (err) {
            return console.log(err);
          }
          fs.writeFile(dirSources + appNameCS, appCS, function(err) {
            if (err) {
              return console.log(err);
            }
            createIndexJS();
          });
        });
      });
    });
    return;
  }
  return console.log('Orbe: [ERR] Invalid orb type.'.red);
};

launch = function(dir, server_port) {
  var i, server;
  if (!dir) {
    dir = void 0;
  }
  i = parseInt(dir);
  if (Number.isInteger(i) && i > 0) {
    server_port = dir;
    dir = void 0;
  }
  if (!dir) {
    dir = process.cwd();
  }
  if (!fs.existsSync(dir)) {
    console.log('Orbe: [ERR] Given folder does not exist.'.red);
    return;
  }
  if (dir.endsWith('/')) {
    dir = dir.slice(0, -1);
  }
  if (!server_port) {
    server_port = 9000;
  }
  server = restify.createServer({
    name: 'server',
    version: '1.0.0'
  });
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.use(CookieParser.parse);
  server.use(restify.gzipResponse());
  server.get(/^\/build\/?.*/, restify.serveStatic({
    directory: dir
  }));
  server.get(/^\/documents\/?.*/, restify.serveStatic({
    directory: dir
  }));
  server.get(/\/?/, function(req, res, next) {
    res.writeHead(200);
    fs.createReadStream(dir + '/index.html').pipe(res);
    return next();
  });
  server.__port = server_port;
  server.start = function(message) {
    return server.listen(server.__port, 'localhost', function() {
      if (message) {
        return console.log(('Orbe: Orb launched! Running! Address ' + server.url).green);
      }
    });
  };
  server.start(true);
  if (fs.existsSync(dir + '/documents')) {
    return watch(dir, server);
  }
};

build = function(dir, env) {
  var files, isProd, prod, startA, walker;
  prod = ['production', 'prod', 'p'];
  isProd = false;
  if (!env) {
    if (prod.indexOf(dir) > -1) {
      isProd = true;
      dir = void 0;
    }
  } else {
    if (prod.indexOf(env) > -1) {
      isProd = true;
    }
  }
  if (!dir) {
    dir = '.';
  }
  if (!dirCheck(dir)) {
    return;
  }
  files = [];
  startA = +new Date();
  walker = walk.walk(dir + '/documents', {
    followLinks: false
  });
  walker.on('file', function(root, stat, next) {
    var file, file_build, filename, name;
    filename = stat.name;
    if (filename.endsWith('.coffee')) {
      files.push(root + '/' + filename);
      name = filename.split('/');
      name = name[name.length - 1];
      name = name.replace('.coffee', '');
      compileFile(name, root, next);
    } else if (filename && (filename.endsWith('.js') || filename.endsWith('.css'))) {
      file = root + '/' + filename;
      file_build = file.replace('documents', 'build');
      files.push(file);
      console.log(('Orbe: Copy ' + filename).magenta);
      fs.copy(file, file_build, function(err) {
        if (err) {
          return console.error(err);
        }
        return next();
      });
    } else {
      next();
    }
  });
  return walker.on('end', function() {
    var endA;
    buildAutoImport(dir);
    endA = +new Date();
    console.log(("Orbe: Done: " + files.length + " files built in " + (endA - startA) + " ms.").green);
    if (isProd) {
      buildProduction(dir);
    }
  });
};

watch = function(dir, server) {
  if (!dir) {
    dir = '.';
  }
  if (!dirCheck(dir)) {
    return;
  }
  console.log('Orbe: Now observing changes in your project..'.green);
  return watcher(dir + '/documents', function(filename) {
    var file_build, name;
    if (filename && filename.endsWith('.coffee')) {
      name = filename.split('/');
      name = name[name.length - 1];
      name = name.replace('.coffee', '');
      path = filename.split('/');
      path.pop();
      path = path.join('/');
      if (fs.existsSync(filename)) {
        compileFile(name, path, void 0, true);
        buildAutoImport(dir);
      }
    } else if (filename && (filename.endsWith('.js') || filename.endsWith('.css'))) {
      name = filename.split('/');
      name = name[name.length - 1];
      file_build = filename.replace('documents', 'build');
      if (fs.existsSync(filename)) {
        console.log(('Orbe: Updating ' + name).magenta);
        fs.copy(filename, file_build, function(err) {
          if (err) {
            return console.error(err);
          }
        });
      } else if (fs.existsSync(file_build)) {
        name = file_build.split('/');
        name = name[name.length - 1];
        console.log(('Orbe: Removing ' + name).magenta);
        fs.unlink(file_build, function(err) {
          if (err) {
            return console.log(err);
          }
        });
      }
    }
    if (server && server.close) {
      server.close();
      server.start(false);
    }
  });
};

clean = function(dir) {
  var pathBuild;
  if (!dir) {
    dir = '.';
  }
  if (!dirCheck(dir)) {
    return;
  }
  console.log('Orbe: Cleaning..'.magenta);
  pathBuild = dir + '/build';
  deleteFolderRecursive(pathBuild);
  build(dir);
  console.log("Orbe: Done: build cleaned.".green);
};

dirCheck = function(dir) {
  var dirBuild, dir_build_check, dir_documents_check, directories, directory, _i, _len;
  if (!dir) {
    dir = '.';
  }
  dir_build_check = false;
  dir_documents_check = false;
  if (!fs.existsSync(dir)) {
    console.log('Orbe: [ERR] Given folder does not exist.'.red);
    return;
  }
  directories = getDirectories(dir);
  for (_i = 0, _len = directories.length; _i < _len; _i++) {
    directory = directories[_i];
    if (directory === 'build') {
      dir_build_check = true;
    } else if (directory === 'documents') {
      dir_documents_check = true;
    }
  }
  if (!dir_build_check || !dir_documents_check) {
    if (!dir_build_check && !dir_documents_check) {
      console.log('Orbe: [ERR] Cannot find the "documents" directory.'.red);
      console.log('Orbe: [HELP] Are you sure you are in the right folder? (cd orb-yourProjectName ;) ).'.magenta);
    } else {
      if (!dir_build_check) {
        dirBuild = __dirname + '/build';
        if (!fs.existsSync(dirBuild)) {
          fs.mkdirSync(dirBuild);
        }
        return true;
      }
      if (!dir_documents_check) {
        console.log('Orbe: [ERR] Cannot find the "documents" directory.'.red);
      }
    }
    return false;
  }
  return true;
};

compileFile = function(name, dir, next, notification) {
  console.log(('Orbe: Processing ' + name + ' ..').magenta);
  return fs.readFile(dir + '/' + name + '.coffee', 'utf8', function(err, data) {
    var addClass, classFile, classes, contentCopy, convert_error, converted, convertedFinal, dirBuild, error, file, filePathBuild, lines_info, notifier;
    if (err) {
      return console.log(err);
    }
    contentCopy = data;
    file = {};
    if (name !== 'Playground' && name !== 'App') {
      if (/(Extends )\w+[ ]*\n/.test(contentCopy)) {
        contentCopy = contentCopy.replace(/(Extends )\w+[ ]*\n/, function(match) {
          file.type = match.replace('Extends ', '');
          file.type = file.type.replace(/[ ]*\n/, '');
          return '';
        });
        if (/(Kind )([-a-zA-Z0-9])*\n/.test(contentCopy)) {
          contentCopy = params.contentCopy.replace(/(Kind )([-a-zA-Z0-9])*\n/, function(match) {
            file.kind = match.replace('Kind ', '');
            file.kind = file.kind.replace(/\n/, '');
            return '';
          });
        }
        if (/(Element )([-a-zA-Z0-9])*\n/.test(contentCopy)) {
          contentCopy = contentCopy.replace(/(Element )([-a-zA-Z0-9])*\n/, function(match) {
            file.element = match.replace('Element ', '');
            file.element = file.element.replace(/\n/, '');
            return '';
          });
        }
        addClass = true;
        contentCopy = indent(contentCopy, 2);
        classes = ['Page', 'View', 'Text', 'Button', 'Link', 'CheckBox', 'Dropdown', 'RadioButton', 'Image', 'List', 'ListItem', 'TextField', 'TextView', 'FileField', 'Player', 'Slider', 'ProgressBar', 'Canvas', 'WebView'];
        if (classes.indexOf(file.type) > -1) {
          classFile = 'class ' + name + ' extends ' + file.type + '\n\t';
          if (file.kind) {
            classFile += '_kind : "' + file.kind + '"\n\t';
          }
          if (file.element) {
            classFile += '_elementType : "' + file.element + '"\n\t';
          }
          classFile += 'constructor: (options) ->\n\t\tsuper\n' + contentCopy + '\n\t\tif not @_didAppear and @parent and @didAppear\n\t\t\t@_didAppear = true\n\t\t\t@didAppear(@__options)';
        } else {
          if (file.type === 'None') {
            classFile = "class " + name + "\n\t";
            if (file.kind) {
              classFile += '_kind : "' + file.kind + '"\n\t';
            }
            if (file.element) {
              classFile += '_elementType : "' + file.element + '"\n\t';
            }
            classFile += "constructor: (options) ->\n\t\tsuper\n" + contentCopy;
          } else {
            classFile = 'class ' + name + ' extends ' + file.type + '\n\t';
            if (file.kind) {
              classFile += '_kind : "' + file.kind + '"\n\t';
            }
            if (file.element) {
              classFile += '_elementType : "' + file.element + '"\n\t';
            }
            classFile += 'constructor: (options) ->\n\t\tsuper\n' + contentCopy + '\n\t\tif not @_didAppear and @parent and @didAppear\n\t\t\t@_didAppear = true\n\t\t\t@didAppear(@__options)';
          }
        }
      } else if (/(class)\s+\w+\s+(extends)\s+\w+/.test(contentCopy)) {
        file.element = contentCopy.match(/(class)\s+\w+\s+(extends)\s+\w+/)[0].replace(/(class)\s+\w+\s+(extends)\s+/, '');
        classFile = contentCopy;
      } else {
        classFile = contentCopy;
      }
    } else {
      classFile = contentCopy;
    }
    converted = null;
    try {
      converted = CoffeeScript.compile(classFile, {
        'bare': true
      });
    } catch (_error) {
      err = _error;
      convert_error = err;
    }
    dirBuild = dir.replace('documents', 'build');
    if (!fs.existsSync(dirBuild)) {
      fs.mkdirSync(dirBuild);
    }
    filePathBuild = dirBuild + '/' + name + '.js';
    if (converted) {
      if (name === 'Playground') {
        filePathBuild = dirBuild + '/App.js';
        convertedFinal = Generate.appRunJS(indent(Generate.PlaygroundJS(converted), 1));
      } else if (name === 'App') {
        convertedFinal = Generate.appRunJS(indent(converted, 1));
      } else {
        convertedFinal = converted;
      }
      return fs.writeFile(filePathBuild, convertedFinal, function(err) {
        if (err) {
          console.log(err);
        }
        console.log('Orbe: ↳ success'.green);
        if (next) {
          return next();
        }
      });
    } else {
      lines_info = String(convert_error).replace('[stdin]:', '').split(':');
      error = capitalizeFirstLetter("" + convert_error.message + " at line " + lines_info[0] + " column " + lines_info[1]);
      console.log(("Orbe: ↳ " + error).red);
      if (notification) {
        notifier = require('node-notifier');
        path = require('path');
        return notifier.notify({
          title: 'Orbe | Error on ' + name,
          message: error,
          icon: path.join(__dirname, 'images/icon.png'),
          sound: false,
          wait: false
        }, function(err, response) {});
      }
    }
  });
};

buildAutoImport = function(dir) {
  var autoImport, catalog, documents, walker;
  autoImport = [];
  catalog = [];
  documents = [];
  walker = walk.walk(dir + '/documents', {
    followLinks: false
  });
  walker.on('file', function(root, stat, next) {
    var doc;
    if (stat.name.endsWith('.coffee')) {
      doc = {};
      doc.name = stat.name.split('/');
      doc.name = doc.name[doc.name.length - 1];
      doc.name = doc.name.replace('.coffee', '');
      fs.readFile(root + '/' + doc.name + '.coffee', 'utf8', function(err, data) {
        if (err) {
          return console.log(err);
        }
        if (data[0] !== '!') {
          root = root.substring(root.indexOf("/documents") + 1);
          path = '/' + root.replace('documents', 'build') + '/' + stat.name.replace('coffee', 'js');
          if (path !== '/build/Playground.js' && path !== '/build/App.js') {
            if (/(Element )([-a-zA-Z0-9])*\n/.test(data)) {
              doc["extends"] = data.match(/(Element )([-a-zA-Z0-9])*\n/)[0].replace('Element ', '');
              doc["extends"] = doc["extends"].replace(/\n/, '');
            } else if (/(class)\s+\w+\s+(extends)\s+\w+/.test(data)) {
              doc["extends"] = data.match(/(class)\s+\w+\s+(extends)\s+\w+/)[0].replace(/(class)\s+\w+\s+(extends)\s+/, '');
            } else {
              doc["extends"] = null;
            }
            doc.path = path;
            doc.id = makeID();
            documents.push(doc);
          }
        }
        return next();
      });
    } else if (stat.name.endsWith('.png') || stat.name.endsWith('.svg') || stat.name.endsWith('.jpg') || stat.name.endsWith('.jpeg') || stat.name.endsWith('.gif') || stat.name.endsWith('.webm') || stat.name.endsWith('.ogg') || stat.name.endsWith('.mpeg') || stat.name.endsWith('.mp3') || stat.name.endsWith('.wav') || stat.name.endsWith('.webm') || stat.name.endsWith('.mp4') || stat.name.endsWith('.ogg')) {
      catalog.push((root.substring(root.indexOf("/documents") + 1)).replace('documents/', '') + '/' + stat.name);
      next();
    } else {
      next();
    }
  });
  return walker.on('end', function() {
    var file, indexJS, _i, _len;
    documents = reorderFiles(documents);
    for (_i = 0, _len = documents.length; _i < _len; _i++) {
      file = documents[_i];
      autoImport.push(file.path);
    }
    autoImport.push('/build/App.js');
    indexJS = Generate.indexJS(JSON.stringify(autoImport));
    fs.writeFile(dir + '/build/index.js', indexJS, function(err) {
      if (err) {
        return console.log(err);
      }
      return fs.writeFile(dir + '/build/catalog.js', Generate.catalog(catalog), function(err) {
        if (err) {
          return console.log(err);
        }
      });
    });
  });
};

buildProduction = function(dir) {
  var cleaning, config, dirName, files, folder, minify, orbJSON, paths_to_remove, prodFolder, scriptID;
  if (!dir) {
    dir = process.cwd();
  }
  dirName = dir.split('/');
  dirName = dirName[dirName.length - 1];
  files = [];
  folder = path.dirname(dir) + '/' + dirName;
  paths_to_remove = [];
  orbJSON = fs.readFileSync(folder + '/orb.json', 'utf8');
  config = JSON.parse(orbJSON);
  if (!config.name) {
    console.log('Orbe: [ERR] Invalid JSON project file, name missing.'.red);
    return;
  }
  prodFolder = folder + ("/../orb-" + config.name + "-production");
  scriptID = makeID();
  if (!fs.existsSync(prodFolder)) {
    console.log('Orbe: Cloning working project..'.magenta);
    fs.mkdirSync(prodFolder);
  }
  if (fs.existsSync(prodFolder + '/build')) {
    deleteFolderRecursive(prodFolder + '/build');
  }
  fs.copy(folder, prodFolder, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log(('Orbe: Production path: ' + prodFolder).green);
    fs.writeFile(prodFolder + '/build/index.js', Generate.indexJS(JSON.stringify('/build/' + scriptID + '.js')), function(err) {
      if (err) {
        return console.log(err);
      }
      minify();
    });
  });
  minify = function() {
    var walker;
    walker = walk.walk(prodFolder + '/documents', {
      followLinks: false
    });
    walker.on('file', function(root, stat, next) {
      var name;
      name = stat.name.split('/');
      name = name[name.length - 1];
      if (stat.name.endsWith('.DS_Store')) {
        fs.unlinkSync(root + '/' + stat.name);
      }
      if (stat.name.endsWith('.coffee') || stat.name.endsWith('.js') || stat.name.endsWith('.css')) {
        name = name.replace('.coffee', '').replace('.js', '').replace('.css', '');
        if (name !== 'Playground' || name !== 'App') {
          paths_to_remove.push(root + '/' + stat.name);
        }
      }
      if (stat.name.endsWith('.coffee')) {
        name = name.replace('.coffee', '');
        fs.readFile(root + '/' + name + '.coffee', 'utf8', function(err, data) {
          var uglified;
          if (err) {
            return console.log(err);
          }
          path = root.replace('documents', 'build') + '/' + stat.name.replace('coffee', 'js');
          if (data[0] !== '!') {
            if (path !== prodFolder + '/build/Playground.js' && path !== prodFolder + '/build/App.js') {
              files.push(path);
              return next();
            } else {
              return next();
            }
          } else {
            uglified = uglify.minify([path]).code;
            return fs.writeFile(path, uglified, 'utf8', function(err) {
              if (err) {
                return console.log(err);
              }
              return next();
            });
          }
        });
      } else {
        next();
      }
    });
    return walker.on('end', function() {
      var appPath, uglified;
      files.push(prodFolder + '/build/App.js');
      uglified = '/* Made with Orbe (orbe.io) and a smile :) */ ' + uglify.minify(files).code;
      console.log('Orbe: Minify script..'.magenta);
      appPath = prodFolder + '/build/' + scriptID + '.js';
      fs.writeFile(appPath, uglified, function(err) {
        console.log('Orbe: Cleaning..'.magenta);
        return cleaning(function() {
          return console.log("Orbe: Done: Orb built for production.".green);
        });
      });
    });
  };
  return cleaning = function(cb) {
    var cleanEmptyFoldersRecursively, e, item, _i, _len;
    paths_to_remove = paths_to_remove.concat(files);
    try {
      for (_i = 0, _len = paths_to_remove.length; _i < _len; _i++) {
        item = paths_to_remove[_i];
        if (fs.existsSync(item)) {
          fs.unlinkSync(item);
        }
      }
    } catch (_error) {
      e = _error;
      console.log(e);
    }
    cleanEmptyFoldersRecursively = function(folder) {
      var isDir;
      fs = require('fs');
      path = require('path');
      isDir = fs.statSync(folder).isDirectory();
      if (!isDir) {
        return;
      }
      files = fs.readdirSync(folder);
      if (files.length > 0) {
        files.forEach(function(file) {
          var fullPath;
          fullPath = path.join(folder, file);
          cleanEmptyFoldersRecursively(fullPath);
        });
        files = fs.readdirSync(folder);
      }
      if (files.length === 0) {
        console.log(('Orbe: removing: ' + folder).magenta);
        fs.rmdirSync(folder);
        return;
      }
    };
    cleanEmptyFoldersRecursively(prodFolder + '/documents/');
    cleanEmptyFoldersRecursively(prodFolder + '/build/');
    if (cb) {
      return cb();
    }
  };
};

program.command('about').description('About Orbe.').action(about);

program.command('create [type]').description('Allow you to create a project.').action(create);

program.command('launch [dir] [port]').description('Launch a local server to help you code an orb project.').action(launch);

program.command('build [dir] [env]').description('Build a project.').action(build);

program.command('clean [dir]').description('Clear the build of a project.').action(clean);

program.command('watch [dir]').description('Observe change on a project and compile on the fly.').action(watch);

program.parse(process.argv);
