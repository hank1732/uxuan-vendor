angular.module('starter.controllers', [])

.controller('infoCtrl', function($scope, UserInfo, guardInfo) {
  UserInfo.then(function(user) {
    guardInfo.get({
        'eguardId': user.userId
      })
      .$promise
      .then(function(res) {
        if (res.code === 0) {
          $scope.guard = res.data;
        } else {
          alert(res.msg);
        }
      })
  })
})

.controller('resetCtrl', function($scope, $stateParams, $state, resetShop,
  resetGuard, UserInfo) {
  var type = $stateParams.type;
  var method = type === 'guard' ? resetGuard : resetShop;
  var nameKey = type === 'guard' ? 'userId' : 'shopHostId';
  var order = type === 'guard' ? 'guard.order' : 'shop.order';
  $scope.user = {};
  UserInfo.then(function(user) {
    $scope.reset = function() {
      if ($scope.user.password !== $scope.user.passwordConfirm) {
        alert('两次输入的新密码不一致');
        return;
      }
      var data = {
        'eguardId': user.userId,
        'account': '',
        'rawPassword': $scope.user.oldPassword,
        'newPassword': $scope.user.password
      }
      method.save(data)
        .$promise
        .then(function(res) {
          if (res.code === 0) {
            alert(res.msg);
            $state.go(order)
          } else {
            alert(res.msg);
          }
        }, function(res) {
          alert('用户名/密码错误');
        })
    }
  })
})

.controller('loginCtrl', function($scope, $stateParams, $state, guardLogin,
  shopLogin, UserInfo) {
  UserInfo.then(function(user) {
    $scope.user = {};
    $scope.login = function() {
      var type = $stateParams.type;
      var method = type === 'guard' ? guardLogin : shopLogin
      var nameKey = type === 'guard' ? 'eguardId' : 'shopHostId'
      var data = {
        'account': $scope.user.username,
        'password': $scope.user.password
      }
      data[nameKey] = user.userId;
      method.get(data)
        .$promise
        .then(function(res) {
          if (res.code === 0) {
            if (type === 'guard') {
              $state.go('guard.order', { type: 'guard' })
            } else {
              $state.go('vendor.order', { type: 'vendor' })
            }
          } else {
            alert(res.msg);
          }
        }, function(res) {
          alert('用户名/密码错误');
        })
    }
  })
})

.controller('guardAccountCtrl', function($scope, $stateParams, $state, UserInfo,
  guardAccount,
  shopAccount, guardNotices, shopNotices, guardWork, guardFree, guardLogout,
  shopLogout) {
  var type = $stateParams.type;
  var nameKey = type === 'guard' ? 'eguardId' : 'shopHostId';
  var method = type === 'guard' ? guardAccount : shopAccount;
  var methodNotice = type === 'guard' ? guardNotices : shopNotices;
  var methodLogout = type === 'guard' ? guardLogout : shopLogout;
  var data = {};
  UserInfo.then(function(user) {
    $scope.user = user;
    data[nameKey] = user.userId;
    method.get(data)
      .$promise
      .then(function(res) {
        $scope.user = res.data;
        $scope.status = { isChecked: res.data.eguardStatusId === 4001 };
        $scope.$watch('status.isChecked', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            if (newValue == false) {
              guardFree.get({ 'eguardId': user.userId });
            } else {
              guardWork.get({ 'eguardId': user.userId })
            }
          }
        })
      }, function(res) {
        // alert('用户名/密码错误');
      });

    methodNotice.get(data)
      .$promise
      .then(function(res) {
        $scope.notices = res.data;
      });

    $scope.logout = function() {
      data[nameKey] = user.userId;
      methodLogout.save(data)
        .$promise
        .then(function() {
          $state.go('login', { type: type });
        })
    };
  })
})

.controller('guardFlowCtrl', function($scope, $stateParams, UserInfo,
  guardOrderFlow, shopOrderFlow, shopCash) {
  var type = $stateParams.type;
  var method = type === 'guard' ? guardOrderFlow : shopOrderFlow;
  var nameKey = type === 'guard' ? 'eguardId' : 'shopHostId';
  var data = {};

  $scope.type = type;

  UserInfo.then(function(user) {
    data[nameKey] = user.userId;
    $scope.time = {
      start: new Date(moment().subtract(7, 'days')),
      end: new Date()
    }
    $scope.filterOrder = function() {
      getOrders();
    }
    $scope.doRefresh = function() {
      getOrders();
      $scope.$broadcast('scroll.refreshComplete');
    }
    getOrders();

    $scope.askCash = function() {
      shopCash.get(data, function(res) {
        if (res.code == 0) {
          alert('申请提现成功！');
        }
      })
    }

    function getOrders() {
      data['timeZone'] = [moment($scope.time.start).unix(), moment(
        $scope.time.end).unix()];
      method.save(data, function(res) {
        $scope.flows = res.data.detail;
        $scope.flows.totalCount = res.data.totalCount
        $scope.flows.totalMoney = res.data.totalMoney
      })
    }
  });
})

.controller('shopCashFlowCtrl', function($scope, $stateParams, UserInfo,
  shopCashFlow) {
  UserInfo.then(function(user) {
    getOrders();

    function getOrders() {
      shopCashFlow.get({
        shopHostId: user.userId
      }, function(res) {
        $scope.flows = res.data;
      })
    }
  });
})
