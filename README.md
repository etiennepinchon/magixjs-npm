# MagiX

In mystery lies beauty. 
[magixjs](https://magixjs.com)

MagiX allow you to create the most advance webapps ever built.
Combined with Coffeescript, MagiX get ride of HTML/CSS and Javascript allowing you to create webapps only using one language and one framework. It is easy to learn and will push your next project to new heights.

# Install

> npm install -g magixjs

# Commands

## magix about

* About Magix.

## magix create [type]

* Allow you to create a project.
* Type: [app, playground]

ex: magix create app

## magix launch [dir] [port]

* Launch a local server to help you code an orb project.

## magix build [project dir] [env]

* Build your project.
* magix build production
** Optimize your project for a production environement (merge files, minify..).

## magix clean [project dir]

* Clear the build of a project.

## magix watch [project dir]

* Observe change on a project and compile on the fly.
* Note: when doing a 'magix launch' you do not need to do an 'magix watch'

ex: magix watch


# Example

## Create your first project:

> magix create demo

> > Magix: Project created successfully.

> cd orb-demo

> magix launch

## Create production version of your project
## (Will create copy of your project that will be minified and optimized)

> magix clean

> magix build production

# About magix projects

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

> log 'imported'

## In case you are wondering, 'log' is the print method, short and cool ;)

> log 'something :P'

# Documentation / help

To find help visit:

[Magix Documentation](https://magixjs.com/learn)

[Twitter](https://twitter.com/magixjs)

# About
Created by Etienne Pinchon (@etiennepinchon)

[Twitter](https://twitter.com/etiennepinchon)

©2016