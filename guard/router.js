// angular.module('guard', ['ionic', 'guard.controllers', 'guard.directives', 'guard.services'])

angular.module('starter')

.config(function($locationProvider, $ionicConfigProvider, $stateProvider) {
  $locationProvider.html5Mode(true);

  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider
    .state('guard', {
      url: '/guard',
      abstract: true,
      templateUrl: 'guard/menu.html'
    })
    .state('guard.order', {
      url: '/order/:type/:part',
      cache: false,
      views: {
        'tab-order': {
          templateUrl: 'guard/order.html'
        }
      }
    })
    .state('guard.flow', {
      url: '/flow/:type',
      cache: false,
      views: {
        'tab-flow': {
          templateUrl: 'guard/flow.html'
        }
      }
    })
    .state('guard.account', {
      url: '/account/:type',
      cache: false,
      views: {
        'tab-account': {
          templateUrl: 'guard/account.html'
        }
      }
    })
    .state('guradOrderDetail', {
      url: '/guard/orderDetail/:orderId/:orderType/:type',
      cache: false,
      templateUrl: 'guard/orderDetail.html'
    })
    .state('login', {
      url: '/guard/login/:type',
      cache: false,
      templateUrl: 'guard/login.html'
    })
    .state('resetPassword', {
      url: '/guard/resetPassword/:type',
      templateUrl: 'guard/resetPassword.html'
    })
    .state('guardRule', {
      url: '/guard/guardRule',
      templateUrl: 'guard/rule.html'
    })
    .state('guardInfo', {
      url: '/guard/guardInfo',
      cache: false,
      templateUrl: 'guard/info.html'
    })
    .state('guardInfoEdit', {
      url: '/guard/guardInfoEdit/:type',
      cache: false,
      templateUrl: 'guard/infoEdit.html'
    })
    .state('guardPromteCode', {
      url: '/guard/guardPromteCode/:type',
      templateUrl: 'guard/promteCode.html'
    })
    .state('guardNotice', {
      url: '/guard/guardNotice/:type',
      templateUrl: 'guard/notice.html'
    })
});
