Generate = {}

#<link rel="shortcut icon" href="assets/app_icon.png" type="image/x-icon" />\n';
Generate.HTML = (name, description, keywords, app_icon) ->
	
	html = '<html>\n\
	<head>\n\t\
		<title>' + name + '</title>\n\t\
		<meta charset="UTF-8">\n\t\
		<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t'

	if app_icon
		html += '<link rel="icon" type="image/png" href="/documents/icon/' + app_icon + '.png">\n\t'
	else
		html += '<link rel="icon" type="image/png" href="https://magixjs.com/default/favicon/icon.png">\n\t'
		
	if description and description.length > 0
		html += '<meta name="description" content="' + description + '">\n\t'

	if keywords and keywords.length > 0 and keywords[0].length > 0
		html += '<meta name="keywords" content="' + keywords + '">\n\t'

	html +='\n\t\
		<!-- SCRIPT -->\n\t\
		<script type="text/javascript" src="https://s3.amazonaws.com/data.magixjs.com/framework/1.0/magix.loader.min.js"></script>\n\t\
		<script type="text/javascript" src="/build/catalog.js"></script>\n\t\
		<script type="text/javascript" src="/build/index.js"></script>\n\
	</head>\n\
	<body>\n\
	</body>\n\
	</html>'

	html

Generate.indexJS = (paths)->
	paths = "'/build/App.js'" if not paths
	return "window.__BUILD = #{JSON.stringify(new Date().getTime())};\n\
	MagiX.load(#{paths});"

Generate.catalog = (documents) ->

	documents = [] if not documents

	paths_collection = []
	collection = ''
	i = 0
	for item in documents

		# NOTE: no need to check for item type. Done previously.

		full_path = item.split('/')
		file_name = full_path[full_path.length-1]
		path = item.replace(file_name, '')
		file_ext = file_name.split('.').pop()

		collection_index = paths_collection.indexOf path
		if collection_index is -1
			paths_collection.push path
			collection_index = paths_collection.length-1

		collection += 'a[p[' + collection_index + ']+"' + file_name.replace(new RegExp('.' + file_ext + '$'), '') + '"]="' + file_ext + '";'
		i++

	catalog = "a={};p=#{JSON.stringify(paths_collection)};"
	catalog += collection
	catalog += 'window.__CATALOG=a;'

	return catalog

Generate.JS = ->
	return "\
		// Import font\n\
		Font('Quicksand', '400,300');\n\
		\n\
		// Create page\n\
		App.page = new Page({\n\t\
			backgroundColor: white\n\
		})\n\
		\n\
		var hello = new Text({\n\t\
			text: 'magiX',\n\t\
			width: 300,\n\t\
			fontSize: 90,\n\t\
			fontWeight: 300,\n\t\
			color: black,\n\t\
			spacing: 4\n\t\
		});\n\
		\n\
		hello.center();"

# Generate CS for main App
Generate.CS = ->
	return "# Import font\n\
		Font 'Quicksand', '400,300'\n\
		\n\
		# Create page\n\
		App.page = new Page\n\t\
			backgroundColor: white\n\
		\n\
		hello = new Text\n\t\
			text: 'magiX'\n\t\
			width: 300\n\t\
			fontSize: 90\n\t\
			fontWeight: 300\n\t\
			color: black\n\t\
			spacing: 4\n\t\
		\n\
		hello.center()\n"

Generate.appRunJS = (app) ->
	app = '' if not app
	return 'App.run(function() {\n\
		' + app + '\n\
	});\n'

module.exports = Generate
