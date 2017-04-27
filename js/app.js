angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives',
  'starter.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});

angular.module('starter')
  .filter('toTimeStamp', function() {
    return function(input, param) {
      return moment(input).unix() * 1000;
    }
  });

angular.module('starter.directives', [])
  .directive('goBack', function() {
    return {
      restrict: 'A',
      replace: true,
      template: '<div class="back-wrap" ng-click="myGoBack()"> ' +
        '<i class="ion-arrow-left-c"></i><span>返回</span>' + '</div>',
      controller: function($scope, $state, $ionicHistory) {
        $scope.myGoBack = function() {
          $backView = $ionicHistory.backView();
          if ($backView) {
            $backView.go();
          } else {
            $state.go('guard.order', {
              type: 'guard',
              part: 'new'
            });
          }
        };
      }
    }
  })

;

angular.module('starter.controllers', [])
