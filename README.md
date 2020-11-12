# [kineto](https://findawayer.github.io/kineto/) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/findawayer/kineto/blob/master/LICENSE)

Kineto is an open source JavaScript library for building carousels on websites. It aims to cover every **essential feature of a carousel** while staying **simple and intuitive** for integration.

- [Documentation](https://findawayer.github.io/kineto/)
  - [Demo](https://findawayer.github.io/kineto/#Demo)
  - [Options](https://findawayer.github.io/kineto/#Options)
  - [Methods](https://findawayer.github.io/kineto/#ClassNames)
  - [Methods](https://findawayer.github.io/kineto/#Methods)
  - [Events](https://findawayer.github.io/kineto/#Events)
  - [FAQ](https://findawayer.github.io/kineto/#FAQ)

> kineto works on all ECMAScript 5 compliant browsers. We have no plan to support IE 8 and prior that are unable to parse compressed source codes.

## Get started

### Install kineto

Please download [the latest version of kineto](https://github.com/findawayer/kineto/releases). Ready-to-use resources are located in `/dist` folder.

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="kineto.css" />
  </head>
  <body>
    <script src="kineto.js"></script>
  </body>
</html>
```

- Insert the CSS and JS files into your HTML.
- The CSS file contains opinionated theme for Kineto's submodules. You don't need to include it if you are going to create your own look and feel.
- The JS file is placed at the end of body element for improved performance.

### Create HTML structure

You only need to have a container holding your content slides as direct children elements. `class` and accessibility attributes will be automatically added once you enable Kineto.

```html
<div id="carousel">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

### Initialize Kineto with JavaScript

Once DOM is ready, you can now initialize kineto with `Kineto.create()` method.

```js
Kineto.create('#carousel', { pagination: true });
```

Kineto is applied to all elements matching the selector provided. To control only a specific instance, we recommend you to use either a unique selector or an element object instead the selector.

More detailed informations are available on [documentation](https://findawayer.github.io/kineto/) page.
