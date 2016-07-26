#!/usr/bin/env node

##############################################################
# REQUIRE

prompt   	 = require 'prompt'
program  	 = require('commander')
colors 	 	 = require('colors')
fs 		 	 = require('fs-extra')
walk  	 	 = require('walk')
path 		 = require('path')
watcher 	 = require('node-watch')
Generate 	 = require('./lib/Generate')
CoffeeScript = require('coffee-script')
uglify 		 = require('uglify-js')
restify 	 = require('restify')
CookieParser = require('restify-cookies')

##############################################################
# CONFIG

prompt.message = 'Orbe'

##############################################################
# HELPERS

Array::move = (old_index, new_index) ->
	  if new_index >= @length
	    k = new_index - (@length)
	    while k-- + 1
	      @push undefined
	  @splice new_index, 0, @splice(old_index, 1)[0]
	  this

reorderFiles = (files)->
	new_files = JSON.parse(JSON.stringify(files));
	no_match = []
	for item of files
		index = -1
		for item2 of new_files
			if new_files[item2].name is files[item].extends
				index = item2
		if index > -1
			if index > item
				new_files = new_files.move(index, item)
		else
			no_match.push files[item].id

	for id in no_match
		if id isnt undefined
			for item of new_files
				if new_files[item].id is id
					new_files.move(item, 0)
	return new_files

capitalizeFirstLetter = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)

getDirectories = (srcpath) ->
  fs.readdirSync(srcpath).filter (file) ->
    fs.statSync(path.join(srcpath, file)).isDirectory()

# Indent text
indent = (str, numOfIndents, opt_spacesPerIndent) ->
	str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
	numOfIndents = new Array(opt_spacesPerIndent + 1 or 0).join(' ')
	# re-use
	if opt_spacesPerIndent then str.replace(/^\t+/g, ((tabs) ->
		tabs.replace /./g, numOfIndents
	)) else str

deleteFolderRecursive = (path) ->
	if fs.existsSync(path)
		fs.readdirSync(path).forEach (file, index) ->
			curPath = path + '/' + file
			if fs.lstatSync(curPath).isDirectory()
				# recurse
				deleteFolderRecursive curPath
			else
				# delete file
				fs.unlinkSync curPath
			return
		fs.rmdirSync path
	return

makeID = ->
	text = ''
	possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
	i = 0
	while i < 8
		text += possible.charAt(Math.floor(Math.random() * possible.length))
		i++
	text

##############################################################
# PROGRAMS FUNCTIONS

about = ->
	console.log ''
	console.log '                 888'
	console.log '                 888'
	console.log '                 888'
	console.log ' .d88b.  888d888 88888b.   .d88b.'
	console.log 'd88""88b 888P"   888 "88b d8P  Y8b'
	console.log '888  888 888     888  888 88888888'
	console.log 'Y88..88P 888     888 d88P Y8b.'
	console.log ' "Y88P"  888     88888P"   "Y8888'
	console.log ''
	console.log 'Orbe | orbe.io'.green
	console.log 'Created by Etienne Pinchon (@etiennepinchon)'.green
	console.log 'Copyright ©2016'.green
	return

create = (type) ->

	if not type
		console.log 'Orbe: [ERR] Orbe type required! Choose from "app" or "playground" like so "orbe create app" :)'.red
		return

	# Lower case
	type = type.toLowerCase()

	if type is 'app' or type is 'playground' #or type is 'module'
		prompt.start()
		prompt.get properties:
			name:
				pattern: /^[a-zA-Z0-9\_\s\-]{1,100}$/
				message: 'Name must be only letters, numbers, underscores, spaces or dashes.'
				required: true
		, (err, result) ->
			return if err
			
			dirOrb = './orb-' + result.name
			if not fs.existsSync(dirOrb)
			    fs.mkdirSync(dirOrb)
				
			# Generate App content in both JS and CS
			appJS = Generate.JS()
			appCS = Generate.CS()

			if type is 'playground'
				appJS = Generate.PlaygroundJS(Generate.PlaygroundContentJS())
				appCS = Generate.PlaygroundContentCS()
			
			done = ->
				console.log 'Orbe: '+type+' created successfully.'.green
				console.log 'Orbe: Path: ' + process.cwd() + '/orb-' + result.name

			createJSON = ->
				packageFile = 
					name: result.name
					type: type
					version: '0.0.0'
					description: ''
					tags: ''
					created_at: new Date

				fs.writeFile dirOrb + '/orb.json', JSON.stringify(packageFile, null, 2), (err) ->
					return console.log(err) if err
					done()

			createIndexJS = ->
				indexJS = Generate.indexJS()
				fs.writeFile dirOrb + '/build/index.js', indexJS, (err) ->
					return console.log(err) if err
					createCatalog()

			createCatalog = ->
				catalog = Generate.catalog()
				fs.writeFile dirOrb + '/build/catalog.js', catalog, (err) ->
					return console.log(err) if err
					createJSON()
					
			# Folders and files generation
			dirBuild = dirOrb + '/build'
			dirSources = dirOrb + '/documents'

			fs.mkdirSync dirOrb if not fs.existsSync(dirOrb)
			fs.mkdirSync dirBuild if not fs.existsSync(dirBuild)
			fs.mkdirSync dirSources if not fs.existsSync(dirSources)

			htmlContent = Generate.HTML(result.name, '', '', no)
					
			appNameCS = '/App.coffee'
			if type is 'playground'
				appNameCS = '/Playground.coffee' 
				appJS = Generate.playgroundRunJS indent(appJS, 1)
			else
				appJS = Generate.appRunJS indent(appJS, 1)
				
			# Write HTML content
			fs.writeFile dirOrb + '/index.html', htmlContent, (err) ->
				return console.log(err) if err
					
				# Write BUILD content
				fs.writeFile dirBuild + '/App.js', appJS, (err) ->
					return console.log(err) if err
						
					# Write SOURCES content
					fs.writeFile dirSources + appNameCS, appCS, (err) ->
						return console.log(err) if err
							
						createIndexJS()
						return
					return
				return
			return
		return

	console.log 'Orbe: [ERR] Invalid orb type.'.red

launch = (dir, server_port)->

	if not dir
		dir = undefined

	i = parseInt(dir)
	if Number.isInteger(i) and i > 0
		server_port = dir
		dir = undefined

	dir = process.cwd() if not dir 
	if not fs.existsSync(dir)
		console.log 'Orbe: [ERR] Given folder does not exist.'.red
		return

	# If dir ends with / remove it
	if dir.endsWith('/')
		dir = dir.slice(0, -1)

	server_port = 9000 if not server_port
	
	######################################################
	# SERVER

	server = restify.createServer
		name: 'server'
		version: '1.0.0'

	server.use restify.acceptParser(server.acceptable)
	server.use restify.queryParser()
	server.use restify.bodyParser()
	server.use CookieParser.parse
	server.use restify.gzipResponse()
	
	server.get /^\/build\/?.*/, restify.serveStatic directory: dir
	server.get /^\/documents\/?.*/, restify.serveStatic directory: dir

	server.get /\/?/, (req, res, next) ->
		res.writeHead 200
		fs.createReadStream(dir + '/index.html').pipe res
		next()

	server.__port = server_port
	server.start = (message)->
		server.listen server.__port, 'localhost', ->
			if message
				console.log(('Orbe: Orb launched! Running! Address ' + server.url).green)
	
	server.start(yes)
	if fs.existsSync(dir + '/documents')
		watch(dir, server)

build = (dir, env) ->
	prod = ['production', 'prod', 'p']
	isProd = no

	if not env
		if prod.indexOf(dir) > -1
			isProd = yes
			dir = undefined
	else
		isProd = yes if prod.indexOf(env) > -1
	
	dir = '.' if not dir
	return if not dirCheck dir

	files   = []
	startA 	= +new Date()

	# Walker options
	walker = walk.walk(dir + '/documents', followLinks: false)
	walker.on 'file', (root, stat, next) ->
		filename = stat.name
		if filename.endsWith('.coffee')
			files.push root + '/' + filename
			name = filename.split('/')
			name = name[name.length-1]
			name = name.replace('.coffee', '')

			compileFile name, root, next
		
		# JS files
		else if filename and (filename.endsWith('.js') or filename.endsWith('.css'))
			
			file = root + '/' + filename
			file_build = file.replace('documents', 'build')
			files.push file

			console.log ('Orbe: Copy ' + filename).magenta
			fs.copy file, file_build, (err) ->
				return console.error(err) if err
				next()
		else
			next()
		return

	walker.on 'end', ->
		buildAutoImport(dir)

		endA = +new Date()
		console.log "Orbe: Done: #{files.length} files built in #{(endA-startA)} ms.".green

		# Build production project
		buildProduction(dir) if isProd
		return


watch = (dir, server) ->
	dir = '.' if not dir
	return if not dirCheck dir
	console.log 'Orbe: Now observing changes in your project..'.green

	watcher dir + '/documents', (filename) ->

		# If file is coffeescript
		if filename and filename.endsWith('.coffee')
			name = filename.split('/')
			name = name[name.length-1]
			name = name.replace('.coffee', '')

			path = filename.split('/')
			path.pop()
			path = path.join('/')

			if fs.existsSync(filename)
				compileFile name, path, undefined, yes
				buildAutoImport(dir)

		# JS files
		else if filename and (filename.endsWith('.js') or filename.endsWith('.css'))
			name = filename.split('/')
			name = name[name.length-1]

			file_build = filename.replace('documents', 'build')
			# If the path exist, simply copy the JS file to the build
			if fs.existsSync(filename)
				console.log ('Orbe: Updating ' + name).magenta
				fs.copy filename, file_build, (err) ->
					return console.error(err) if err
			else if fs.existsSync(file_build)
				name = file_build.split('/')
				name = name[name.length-1]
				console.log ('Orbe: Removing ' + name).magenta
				fs.unlink file_build, (err) ->
					console.log err if err

		#else if filename and filename.index#filename isnt '.DS_Store'

		if server
			server.close()
			server.start(no)

		return


clean = (dir) ->
	dir = '.' if not dir
	return if not dirCheck dir

	console.log 'Orbe: Cleaning..'.magenta

	pathBuild = dir + '/build'
	deleteFolderRecursive pathBuild
	build(dir)
	console.log "Orbe: Done: build cleaned.".green
	return

	

##############################################################
# PROCESSES

dirCheck = (dir)->
	dir 				= '.' if not dir
	dir_build_check 	= no
	dir_documents_check	= no

	if not fs.existsSync(dir)
		console.log 'Orbe: [ERR] Given folder does not exist.'.red
		return

	directories = getDirectories(dir)
	for directory in directories
		if directory is 'build'
			dir_build_check = yes
		else if directory is 'documents'
			dir_documents_check = yes

	if not dir_build_check or not dir_documents_check
		if not dir_build_check and not dir_documents_check
			console.log 'Orbe: [ERR] Cannot find the "documents" directory.'.red
			console.log 'Orbe: [HELP] Are you sure you are in the right folder? (cd orb-yourProjectName ;) ).'.magenta
		else
			if not dir_build_check
				dirBuild = __dirname + '/build'
				fs.mkdirSync dirBuild if not fs.existsSync(dirBuild)
				return yes
			if not dir_documents_check
				console.log 'Orbe: [ERR] Cannot find the "documents" directory.'.red
		return no

	return yes

compileFile = (name, dir, next, notification)->
	console.log ('Orbe: Processing ' + name + ' ..').magenta

	fs.readFile dir + '/' + name + '.coffee', 'utf8', (err, data) ->
		return console.log(err) if err
		
		contentCopy = data
		file = {}

		if name isnt 'Playground' and name isnt 'App'
			if /(Extends )\w+[ ]*\n/.test(contentCopy)
				contentCopy = contentCopy.replace /(Extends )\w+[ ]*\n/, (match) ->	
					file.type = match.replace('Extends ', '')
					file.type = file.type.replace(/[ ]*\n/, '')
					return ''

				if /(Kind )([-a-zA-Z0-9])*\n/.test(contentCopy)
					contentCopy = params.contentCopy.replace /(Kind )([-a-zA-Z0-9])*\n/, (match) ->	
						file.kind = match.replace('Kind ', '')
						file.kind = file.kind.replace(/\n/, '')
						return ''

				if /(Element )([-a-zA-Z0-9])*\n/.test(contentCopy)
					contentCopy = contentCopy.replace /(Element )([-a-zA-Z0-9])*\n/, (match) ->	
						file.element = match.replace('Element ', '')
						file.element = file.element.replace(/\n/, '')
						return ''

				# We signal the code that we are about to add a class wrapper around the code
				addClass = true

				# We indent the code
				contentCopy = indent(contentCopy, 2)
				classes 	= ['Page', 'View', 'Text', 'Button', 'Link', 'CheckBox', 'Dropdown', 'RadioButton', 'Image', 'List', 'ListItem', 'TextField', 'TextView', 'FileField', 'Player', 'Slider', 'ProgressBar', 'Canvas', 'WebView']

				# If extend framework, inject class with init
				if classes.indexOf(file.type) > -1
					# Create a class that extends another one
					classFile = 'class ' + name + ' extends ' + file.type + '\n\t'
					classFile += '_kind : "' + file.kind + '"\n\t' if file.kind
					classFile += '_elementType : "'+ file.element + '"\n\t' if file.element
					classFile += 'constructor: (options) ->\n\t\t\
							super\n\
						' + contentCopy + '\n\t\t\
						if not @_didAppear and @parent and @didAppear\n\t\t\t\
							@_didAppear = true\n\t\t\t\
							@didAppear(@__options)'

				else
					# Create an empty class
					if file.type is 'None'
						classFile = "class #{name}\n\t"
						classFile += '_kind : "' + file.kind + '"\n\t' if file.kind
						classFile += '_elementType : "'+ file.element + '"\n\t' if file.element
						classFile += "constructor: (options) ->\n\t\t\
								super\n\
							#{contentCopy}"
					else
						# Create an empty class
						classFile = 'class ' + name + ' extends ' + file.type + '\n\t'
						classFile += '_kind : "' + file.kind + '"\n\t' if file.kind
						classFile += '_elementType : "'+ file.element + '"\n\t' if file.element
						classFile += 'constructor: (options) ->\n\t\t\
								super\n\
							' + contentCopy + '\n\t\t\
						if not @_didAppear and @parent and @didAppear\n\t\t\t\
							@_didAppear = true\n\t\t\t\
							@didAppear(@__options)'
			else if /(class)\s+\w+\s+(extends)\s+\w+/.test(contentCopy)
				file.element = contentCopy.match(/(class)\s+\w+\s+(extends)\s+\w+/)[0].replace(/(class)\s+\w+\s+(extends)\s+/, '')
				classFile = contentCopy
			else
				classFile = contentCopy
		else
			classFile = contentCopy

		# Convert CS to JS
		converted = null
		try
			converted = CoffeeScript.compile(classFile, 'bare': true)
		catch err
			convert_error = err
		
		# Define paths
		dirBuild = dir.replace('documents', 'build')
		fs.mkdirSync dirBuild if not fs.existsSync(dirBuild)

		filePathBuild = dirBuild + '/' + name + '.js'

		if converted
			if name is 'Playground'
				filePathBuild = dirBuild + '/App.js'
				convertedFinal = Generate.appRunJS indent(Generate.PlaygroundJS(converted), 1)
			else if name is 'App'
				convertedFinal = Generate.appRunJS indent(converted, 1)
			else
				convertedFinal = converted

			fs.writeFile filePathBuild, convertedFinal, (err) ->
				console.log err if err
				console.log 'Orbe: ↳ success'.green
				next() if next
		else
			lines_info = String(convert_error).replace('[stdin]:', '').split(':')
			error = capitalizeFirstLetter "#{convert_error.message} at line #{lines_info[0]} column #{lines_info[1]}"
			console.log "Orbe: ↳ #{error}".red

			# Show user notification when watching changes
			if notification
				notifier = require('node-notifier')
				path = require('path')
				notifier.notify {
				  title: 'Orbe | Error on ' + name
				  message: error
				  icon: path.join(__dirname, 'images/icon.png')
				  sound: no
				  wait: no
				}, (err, response) ->
				  # Response is response from notification
				  return


buildAutoImport = (dir)->
	autoImport = []
	catalog = []

	# documents = reorderFiles documents
	documents = []

	# CREATE DOCUMENT ARRAY WITH FILE EXTENDS
	# LOOP THROUGH DOCUMENTS AND REORDER

	walker = walk.walk(dir + '/documents', followLinks: false)
	walker.on 'file', (root, stat, next) ->
		if stat.name.endsWith('.coffee')

			doc = {}
			doc.name = stat.name.split('/')
			doc.name = doc.name[doc.name.length-1]
			doc.name = doc.name.replace('.coffee', '')

			fs.readFile root + '/' + doc.name + '.coffee', 'utf8', (err, data) ->
				return console.log(err) if err
				
				if data[0] isnt '!'
					root = root.substring(root.indexOf("/documents") + 1)
					path = '/' + root.replace('documents', 'build') + '/' + stat.name.replace('coffee', 'js')
					if path isnt '/build/Playground.js' and path isnt '/build/App.js'

						if /(Element )([-a-zA-Z0-9])*\n/.test(data)
							doc.extends = data.match(/(Element )([-a-zA-Z0-9])*\n/)[0].replace('Element ', '')
							doc.extends = doc.extends.replace(/\n/, '')
						else if /(class)\s+\w+\s+(extends)\s+\w+/.test(data)
							doc.extends = data.match(/(class)\s+\w+\s+(extends)\s+\w+/)[0].replace(/(class)\s+\w+\s+(extends)\s+/, '')
							
						else
							doc.extends = null
						doc.path = path
						doc.id = makeID()

						documents.push doc
				next()
		else if stat.name.endsWith('.png') or stat.name.endsWith('.svg') or stat.name.endsWith('.jpg') or stat.name.endsWith('.jpeg') or stat.name.endsWith('.gif') or stat.name.endsWith('.webm') or stat.name.endsWith('.ogg') or stat.name.endsWith('.mpeg') or stat.name.endsWith('.mp3') or stat.name.endsWith('.wav') or stat.name.endsWith('.webm') or stat.name.endsWith('.mp4') or stat.name.endsWith('.ogg')
			catalog.push (root.substring(root.indexOf("/documents") + 1)).replace('documents/', '') + '/' + stat.name
			next()
		else
			next()
		return

	walker.on 'end', ->
		documents = reorderFiles documents
		
		for file in documents
			autoImport.push file.path

		autoImport.push '/build/App.js'
		indexJS = Generate.indexJS(JSON.stringify(autoImport))
		fs.writeFile dir + '/build/index.js', indexJS, (err) ->
			return console.log(err) if err
			fs.writeFile dir + '/build/catalog.js', Generate.catalog(catalog), (err) ->
				return console.log(err) if err
		return


buildProduction = (dir)->

	dir = process.cwd() if not dir 
	#if dir is '.'
	dirName = dir.split('/')
	dirName = dirName[dirName.length-1]

	files = []
	folder = path.dirname(dir) + '/' + dirName
	paths_to_remove = []

	orbJSON = fs.readFileSync(folder + '/orb.json', 'utf8')
	config = JSON.parse(orbJSON)
	if not config.name
		console.log 'Orbe: [ERR] Invalid JSON project file, name missing.'.red
		return

	prodFolder = folder + "/../orb-#{config.name}-production"
	
	# Generate scriptID
	scriptID = makeID()

	# fs.copy folder, prodFolder, (err) ->
	# 	return console.error err if err

	if not fs.existsSync(prodFolder)
		console.log 'Orbe: Cloning working project..'.magenta
		fs.mkdirSync prodFolder

	# Clean build
	if fs.existsSync(prodFolder + '/build')
		deleteFolderRecursive prodFolder + '/build'

	# Copy project folder to production dir
	fs.copy folder, prodFolder, (err) ->
		return console.error err if err

		console.log ('Orbe: Production path: ' + prodFolder).green
		fs.writeFile prodFolder + '/build/index.js', Generate.indexJS(JSON.stringify('/build/' + scriptID + '.js')), (err) ->
			return console.log(err) if err
			minify()
			return
		return

	minify = ->
		
		walker = walk.walk(prodFolder + '/documents', followLinks: false)
		walker.on 'file', (root, stat, next) ->
			name = stat.name.split('/')
			name = name[name.length-1]
			
			# REMOVE DS STORE ON MAC OS
			if stat.name.endsWith('.DS_Store')
				fs.unlinkSync root+'/'+stat.name

			# PUSH PATHS TO REMOVE LATER ON..
			if stat.name.endsWith('.coffee') or stat.name.endsWith('.js') or stat.name.endsWith('.css')
				name = name.replace('.coffee', '').replace('.js', '').replace('.css', '')
				if name isnt 'Playground' or name isnt 'App'
					paths_to_remove.push root+'/'+stat.name

			# IF COFFEE, PREPARE FOR MINIFING
			if stat.name.endsWith('.coffee')
				name = name.replace('.coffee', '')

				fs.readFile root + '/' + name + '.coffee', 'utf8', (err, data) ->
					return console.log(err) if err

					path = root.replace('documents', 'build') + '/' + stat.name.replace('coffee', 'js')

					if data[0] isnt '!'
						if path isnt prodFolder + '/build/Playground.js' and path isnt prodFolder + '/build/App.js'
							files.push path
							next()
						else
							next()
					else
						uglified = uglify.minify([path]).code
						fs.writeFile path, uglified, 'utf8', (err) ->
							return console.log(err) if err
							next()
			else
				next()
			return

		walker.on 'end', ->
			files.push prodFolder + '/build/App.js'

			# Minify files
			uglified = '/* Made with Orbe (orbe.io) and a smile :) */ ' + uglify.minify(files).code
			console.log 'Orbe: Minify script..'.magenta

			appPath = prodFolder + '/build/' + scriptID + '.js'
			fs.writeFile appPath, uglified, (err) ->

				console.log 'Orbe: Cleaning..'.magenta
				cleaning ->
					console.log "Orbe: Done: Orb built for production.".green
			return

	cleaning = (cb)->

		# ADD BUILD FOLDER PATHS TO DOCUMENTS PATH
		paths_to_remove = paths_to_remove.concat(files)

		# CLEAN BUILD AND DOCUMENTS FOLDER
		try
			for item in paths_to_remove
				if fs.existsSync(item)
					fs.unlinkSync item
		catch e
			console.log e

		cleanEmptyFoldersRecursively = (folder) ->
		  fs = require('fs')
		  path = require('path')
		  isDir = fs.statSync(folder).isDirectory()
		  if !isDir
		    return
		  files = fs.readdirSync(folder)
		  if files.length > 0
		    files.forEach (file) ->
		      fullPath = path.join(folder, file)
		      cleanEmptyFoldersRecursively fullPath
		      return
		    # re-evaluate files; after deleting subfolder
		    # we may have parent folder empty now
		    files = fs.readdirSync(folder)
		  if files.length == 0
		    console.log ('Orbe: removing: '+folder).magenta
		    fs.rmdirSync folder
		    return
		  return

		cleanEmptyFoldersRecursively prodFolder + '/documents/'
		cleanEmptyFoldersRecursively prodFolder + '/build/'

		cb() if cb

		
##############################################################
# PROGRAMS

program
	.command('about')
	.description('About Orbe.')
	.action about

program
	.command('create [type]')
	.description('Allow you to create a project.')
	.action create

program
	.command('launch [dir] [port]')
	.description('Launch a local server to help you code an orb project.')
	.action launch

program
	.command('build [dir] [env]')
	.description('Build a project.')
	.action build

program
	.command('clean [dir]')
	.description('Clear the build of a project.')
	.action clean

program
	.command('watch [dir]')
	.description('Observe change on a project and compile on the fly.')
	.action watch

# program
# 	.command('install [name] [dir]')
# 	.description('Add module to your project.')
# 	.action install

program.parse process.argv












