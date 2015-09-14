'use strict';

angular.module('alfirin.directive')
  .directive('alfSticky', ['$window', '$document', function ($window, $document) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.defaultOptions = {
          topSpacing: 0,
          bottomSpacing: 0,
          className: 'is-sticky',
          wrapperClassName: 'sticky-wrapper',
          getWidthFrom: '',
          widthFromWrapper: true,
          responsiveWidth: false
        };

        scope.topSpacing = attrs.alfStickyTopSpacing !== undefined && attrs.alfStickyTopSpacing !== '' ? attrs.alfStickyTopSpacing : 64;
        scope.stickyWrapper = undefined;
        scope.currentTop = null;

        var windowHeight = $window.innerHeight;

        scope.scroller = function () {
          var windowEl = angular.element($window);
          var scrollTop = windowEl.scrollTop(),
            documentHeight = $document.height(),
            dwh = documentHeight - windowHeight,
            extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

          var elementTop = scope.stickyWrapper.offset().top,
            etse = elementTop - scope.topSpacing - extra;

          scope.stickyWrapper.css('height', element.outerHeight());

          if (scrollTop <= etse) {
            if (scope.currentTop !== null) {
              element
                .css({
                  'width': '',
                  'position': '',
                  'top': ''
                });
              element.parent().removeClass(scope.defaultOptions.className);
              element.trigger('sticky-end', [scope.defaultOptions]);
              scope.currentTop = null;
            }
          }
          else {
            var newTop = documentHeight - element.outerHeight() - scope.topSpacing - scope.defaultOptions.bottomSpacing - scrollTop - extra;
            if (newTop < 0) {
              newTop = newTop + scope.topSpacing;
            } else {
              newTop = scope.topSpacing;
            }
            if (scope.currentTop !== newTop) {
              var newWidth;
              if (scope.defaultOptions.getWidthFrom) {
                newWidth = $(scope.defaultOptions.getWidthFrom).width() || null;
              } else if (scope.defaultOptions.widthFromWrapper) {
                newWidth = scope.stickyWrapper.width();
              }
              if (newWidth === null) {
                newWidth = element.width();
              }
              element
                .css('width', newWidth)
                .css('position', 'fixed')
                .css('top', newTop);

              element.parent().addClass(scope.defaultOptions.className);

              if (scope.currentTop === null) {
                element.trigger('sticky-start', [scope.defaultOptions]);
              } else {
                // sticky is started but it have to be repositioned
                element.trigger('sticky-update', [scope.defaultOptions]);
              }

              if (scope.currentTop === scope.topSpacing && scope.currentTop > newTop || scope.currentTop === null && newTop < scope.topSpacing) {
                // just reached bottom || just started to stick but bottom is already reached
                element.trigger('sticky-bottom-reached', [scope.defaultOptions]);
              } else if (scope.currentTop !== null && newTop === scope.topSpacing && scope.currentTop < newTop) {
                // sticky is started && sticked at topSpacing && overflowing from top just finished
                element.trigger('sticky-bottom-unreached', [scope.defaultOptions]);
              }

              scope.currentTop = newTop;
            }
          }
        };

        scope.resizer = function () {
          windowHeight = $window.innerHeight;

          var newWidth = null;
          if (scope.defaultOptions.getWidthFrom) {
            if (scope.defaultOptions.responsiveWidth) {
              newWidth = $(scope.defaultOptions.getWidthFrom).width();
            }
          } else if (scope.defaultOptions.widthFromWrapper) {
            newWidth = scope.stickyWrapper.width();
          }
          if (newWidth !== null) {
            element.css('width', newWidth);
          }
        };

        scope.init = function () {
          var stickyId = element.attr('id');
          var stickyHeight = element.outerHeight();
          var wrapperId = stickyId ? stickyId + '-' + scope.defaultOptions.wrapperClassName : scope.defaultOptions.wrapperClassName;
          var wrapper = $('<div></div>')
            .attr('id', wrapperId)
            .addClass(scope.defaultOptions.wrapperClassName);

          element.wrapAll(wrapper);

          scope.stickyWrapper = element.parent();

          if (element.css('float') === 'right') {
            element.css({'float': 'none'}).parent().css({'float': 'right'});
          }

          scope.stickyWrapper.css('height', stickyHeight);

          scope.currentTop = null;
        };

        scope.unStick = function () {
          element.unwrap();
          element
            .css({
              'width': '',
              'position': '',
              'top': '',
              'float': ''
            });
        };

        // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
        if ($window.addEventListener) {
          $window.addEventListener('scroll', scope.scroller, false);
          $window.addEventListener('resize', scope.resizer, false);
        } else if ($window.attachEvent) {
          $window.attachEvent('onscroll', scope.scroller);
          $window.attachEvent('onresize', scope.resizer);
        }

        scope.$watch(function () {
            return element.height();
          },
          function (newValue, oldValue) {
            if (newValue !== oldValue) {
              scope.scroller();
            }
          }
        );

        scope.init();
      }
    };
  }]
);
