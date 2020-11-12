(function (Kineto) {
  var preset = {
    perView: {
      perView: 2
    },
    margin: {
      margin: 40
    },
    startAt: {
      startAt: 2
    },
    vertical: {
      mode: 'vertical'
    },
    loop: {
      loop: true
    },
    adaptiveHeight: {
      height: 'adaptive'
    },
    equalHeight: {
      height: 'equal'
    },
    moveBy: {
      moveBy: 2
    },
    speed: {
      speed: 1000
    },
    easingPreset: {
      easing: 'easeInOutCirc'
    },
    customEasing: {
      easing: [0.2, 2, 0.3, 0.8]
    },
    waitAnimation: {
      waitAnimation: true
    },
    moveOnClick: {
      moveOnClick: true,
      perView: 3
    },
    stream: {
      stream: true
    },
    streamEverySecond: {
      stream: true,
      streamEvery: 1000
    },
    pauseOnHover: {
      stream: true,
      pauseOnFocus: false,
      pauseOnHover: true
    },
    navigation: {
      arrows: true,
      arrowTemplate: ['&larr;', '&rarr;'],
      count: true,
      countTemplate: '<em class="current">{{current}}</em> / {{total}}',
      pagination: true,
      paginationTemplate: '{{index}}'
    },
    noSwipe: {
      touchSwipe: false,
      mouseSwipe: false
    },
    swipeThreshold: {
      swipeThreshold: 20
    },
    noEdgeBounce: {
      swipeEdgeBounce: false
    },
    smallEdgeFriction: {
      swipeEdgeFriction: 0.2
    },
    wheel: {
      wheel: true
    },
    wheelThrottle: {
      wheel: true,
      wheelThrottle: 1000
    },
    wheelNoEdges: {
      mode: 'vertical',
      wheel: true,
      wheelEdgeRelease: false
    },
    noAria: {
      aria: false
    },
    pixelPerfect: {
      perView: 2.5,
      cssPrecision: 0
    },
    usePercent: {
      perView: 2.5,
      usePercent: true
    },
    responsive: {
      perView: 1,
      margin: 10,
      responsive: {
        600: {
          perView: 1.5,
          margin: 20
        },
        800: {
          perView: 2,
          margin: 30
        }
      }
    },
    desktopFirst: {
      perView: 2,
      margin: 30,
      responsive: {
        800: {
          perView: 1.5,
          margin: 20
        },
        600: {
          perView: 1,
          margin: 10
        }
      },
      responsiveMode: 'desktop-first'
    },
    sync1: {
      syncId: 'gallery',
      loop: true,
      stream: true
    },
    sync2: {
      syncId: 'gallery',
      perView: 3,
      loop: true,
      pagination: false,
      stream: true
    },
    sync3: {
      syncId: 'gallery',
      perView: 5,
      align: 'justify',
      arrows: false,
      pagination: false
    }
  };
  var containers = document.querySelectorAll('.carousel');
  var options;
  // Make sure Kineto has been loaded
  if (!Kineto) {
    throw new Error('Kineto not found.');
  }
  // Define CSS class formating rule
  Kineto.setClassFormat('BEM');
  // Define globally shared options
  Kineto.setDefaults({ margin: 10 });
  // Init kineto
  containers.forEach(function (container) {
    options = preset[container.id];
    Kineto.create(container, options);
  });
})(window.Kineto);
