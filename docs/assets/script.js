(function ($, Kineto) {
  // Make sure Kineto has been loaded
  if (!Kineto) {
    throw new Error('Kineto not found.');
  }
  // Kineto demo preset
  var preset = {
    perView: {
      perView: 2,
    },
    margin: {
      margin: 40,
    },
    startAt: {
      startAt: 2,
    },
    vertical: {
      mode: 'vertical',
    },
    loop: {
      loop: true,
    },
    adaptiveHeight: {
      height: 'adaptive',
    },
    equalHeight: {
      height: 'equal',
    },
    moveBy: {
      moveBy: 2,
    },
    speed: {
      speed: 1000,
    },
    easingPreset: {
      easing: 'easeInOutCirc',
    },
    customEasing: {
      easing: [0.2, 2, 0.3, 0.8],
    },
    moveOnClick: {
      perView: 3,
      loop: true,
      moveOnClick: true,
    },
    stream: {
      stream: true,
    },
    navigation: {
      arrows: true,
      arrowTemplate: ['&larr;', '&rarr;'],
      count: true,
      countTemplate: '<em class="current">{{current}}</em> / {{total}}',
      pagination: true,
      paginationTemplate: '{{index}}',
    },
    noSwipe: {
      touchSwipe: false,
      mouseSwipe: false,
    },
    swipeThreshold: {
      swipeThreshold: 20,
    },
    noEdgeBounce: {
      swipeEdgeBounce: false,
    },
    smallEdgeFriction: {
      swipeEdgeFriction: 0.2,
    },
    wheel: {
      wheel: true,
    },
    wheelThrottle: {
      wheel: true,
      wheelThrottle: 1000,
    },
    wheelNoEdges: {
      mode: 'vertical',
      wheel: true,
      wheelEdgeRelease: false,
    },
    noAria: {
      aria: false,
    },
    pixelPerfect: {
      perView: 2.5,
      cssPrecision: 0,
    },
    usePercent: {
      perView: 2.5,
      usePercent: true,
      responsive: false,
    },
    responsive: {
      responsive: {
        600: {
          perView: 1.5,
          margin: 20,
        },
        800: {
          perView: 2,
          margin: 30,
        },
      },
    },
    desktopFirst: {
      perView: 2,
      margin: 30,
      responsive: {
        800: {
          perView: 1.5,
          margin: 20,
        },
        600: {
          perView: 1,
          margin: 10,
        },
      },
      responsiveMode: 'desktop-first',
    },
    sync1: {
      syncId: 'gallery',
      loop: true,
      stream: true,
    },
    sync2: {
      syncId: 'gallery',
      perView: 3,
      loop: true,
      pagination: false,
    },
    sync3: {
      syncId: 'gallery',
      perView: 5,
      align: 'justify',
      arrows: false,
      pagination: false,
    },
  };

  // Navigation
  $('#page')
    .on('skeletabs:init', function (_, skeletabs) {
      initKineto(skeletabs.$currentPanel);
    })
    .on('skeletabs:moved', function (_, skeletabs) {
      initKineto(skeletabs.$currentPanel);
      refreshKineto(skeletabs.$currentPanel);
    })
    .skeletabs(
      {
        breakpoint: 800,
        breakpointLayout: 'destroy',
        history: 'push',
        keyboardTabs: 'vertical',
        transitionDuration: 300,
      },
      {
        tabGroup: 'nav-group',
        tabItem: 'nav-item',
        tab: 'nav-link',
        panelGroup: 'content',
        panel: 'section',
        init: 'page-init',
        tabsMode: 'page-tabs',
        accordionMode: 'page-accordion',
      },
    );

  if (window.innerWidth <= 800) {
    initKineto('#content');
  }

  // Internal links: smooth-scroll to the target
  $(document).on('click', 'a[href^="#"]', function (event) {
    var hash = $(this).attr('href');
    pushState(hash);
    $('#page').skeletabs('goTo', hash);
    event.preventDefault();
  });

  // Apply Kineto onto containers within the container element passed
  function initKineto(root) {
    $(root)
      .find('.carousel')
      .not('.kineto-init')
      .each(function (_, container) {
        var options = preset[container.id];
        Kineto.create(container, options);
      });
  }

  // Force refresh Kineto onto containers within the container element passed
  function refreshKineto(root) {
    $(root)
      .find('.kineto-init')
      .each(function (_, container) {
        Kineto.refresh(container);
      });
  }

  // Update hash in URL
  function pushState(hash) {
    if (window.history && window.history.pushState) {
      window.history.pushState({ hash: hash }, null, hash);
    } else {
      window.location.hash = hash;
    }
  }
})(window.jQuery, window.Kineto);
