# ORBE.IO

A NEW WAY TO CREATE ANYTHING.

[orbe.io](https://orbe.io)

#############################################
# Install

> npm install orbe

#############################################
# Commands

# orbe about

* About Orbe.

# orbe create [type]

* Allow you to create a project.
* Type: [app, playground]

ex: orbe create app

# orbe launch [dir] [port]

* Launch a local server to help you code an orb project.

# orbe build [project dir] [env]

* Build your project.

## orbe build production

* Optimize your project for a production environement (merge files, minify..).

# orbe clean [project dir]

* Clear the build of a project.

# orbe watch [project dir]

* Observe change on a project and compile on the fly.

ex: orbe watch

#############################################
# Example

## Create your first project:

> orbe create app

> > Orbe: name:  demo

> > Orbe: Orb created successfully.

> cd orb-demo

> orbe launch

## Create production version of your project
## (Will create copy of your project that will be minified and optimized)

> orbe clean

> orbe build production

#############################################
# Stuff to know about orbe projects

* You code using COFFEESCRIPT.
* No HTML, no CSS, no javascript required.
* No need for anything else out of the box.
* To create a class, create a new file and write: 

> Extends View

> this.background = red

> this.didAppear = ->

> 	say 'hi'

## .. Instead of the traditional 'class' keyword

* One class per file

* Classes are auto imported by default. 
To import classes manually, add a '!' at the very beggining of you file.
Then:
> Import 'MyFirstView', ->

> say 'imported'

## In case you are wondering, 'say' is the print method, short and cool ;)

> say 'something :P'

#############################################
# Documentation / help

To find help visit:
[Orbe Documentation](https://orbe.io/learn)
[Twitter](https://twitter.com/orbeio)

#############################################
# About
Created by Etienne Pinchon (@etiennepinchon)
[Twitter](https://twitter.com/etiennepinchon)
©2016