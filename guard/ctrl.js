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
                // var flag = confirm('确定要休息么？')
                // if (flag) {
                // } else {
                //   $scope.status.isChecked = !$scope.status.isChecked;
                // }
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

.controller('guardOrderDetailCtrl', function($scope, $rootScope, $stateParams,
  UserInfo, StartPrice,
  FuritOrWash, guardOrderDetailFurit, guardOrderDetailFetchwash,
  guardOrderDetailSendwash,
  shopOrderDetailFurit, shopOrderDetailWash) {
  $scope.type = $stateParams.orderType;
  var guardOrVendor = $stateParams.type;
  UserInfo.then(function(user) {
    getOrder();

    function getOrder(argument) {
      var detailMethod;
      if ($scope.type == 17001) {
        if (guardOrVendor == 'vendor') {
          detailMethod = shopOrderDetailFurit;
        } else {
          detailMethod = guardOrderDetailFurit;
        }
      }
      if ($scope.type == 17002) {
        if (guardOrVendor == 'vendor') {
          detailMethod = shopOrderDetailWash;
        } else {
          detailMethod = guardOrderDetailFetchwash;
        }
      }
      if ($scope.type == 17003) {
        detailMethod = guardOrderDetailSendwash;
      }
      detailMethod.get({
        'longitude': user.longitude,
        'latitude': user.latitude,
        'orderId': $stateParams.orderId
      }, function(data) {
        $scope.order = data.data;
        var orderStage = data.data.orderStatusId - 0;
        if ((orderStage >= 12005 && orderStage < 13000) ||
          orderStage >= 13005) {
          $scope.isGet = true;
        }
      });
    }

    $scope.clickPrice = function(event, order) {
      StartPrice.save({
          orderId: order.orderId
        })
        .$promise
        .then(function(res) {
          if (res.code === 0) {
            FuritOrWash.toWash(order.shopId, order.orderId, true);
            $state.go('washSingleOrder', {
              shopId: order.shopId,
              orderId: order.orderId
            });
          }
        });
    }
  })
})

.controller('guardOrdersCtrl', function($scope, $stateParams, $state, $location,
  UserInfo, EguardOrderList, EguardAction, VendorOrderList, VendorAction,
  guardOrderNumber, shopOrderNumber) {
  var part = $stateParams.part || 'new';
  var type = $stateParams.type;
  var nameKey = type === 'guard' ? 'eguardId' : 'shopHostId';
  var methodList = type === 'guard' ? EguardOrderList : VendorOrderList;
  var methodAction = type === 'guard' ? EguardAction : VendorAction;
  var methodNumber = type === 'guard' ? guardOrderNumber : shopOrderNumber;
  // var methodLogout = type === 'guard' ? guardLogout : shopLogout;
  var data = {
    // 'eguardId': 'C0000000009',
    // 'shopHostId': 'C0000000008',
    'pos': 0
  };
  UserInfo.then(function(user) {

    data[nameKey] = user.userId;

    $scope.type = type;
    $scope.orderTypeObj = {
      17001: '水果',
      17002: '洗衣取衣',
      17003: '洗衣送回',
      // 17004: '代买'
    }

    $scope.status = {
      now: 'new',
      new: 'new',
      process: 'process',
      finish: 'finish',
      noOrder: false
    }

    $scope.button = {
      isBlueShow: true,
      isRedShow: true,
      blueText: 'Blue',
      redText: 'Red'
    }

    var blueStatus2Action = {
      guard: {
        12001: 'accept',
        12004: 'fetch',
        12005: 'finish',
        13001: 'acceptWash',
        13004: 'fetchWash',
        13007: 'finishWash',
        16001: 'acceptSendWash',
        16003: 'fetchSendWash',
        16004: 'finishSendWash',
      },
      vendor: {
        14003: 'begin',
        14004: 'finish'
      }
    }

    var redStatus2Action = {
      guard: {
        12001: 'refuse',
        13001: 'refuseWash',
        16001: 'refuseSendWash',
      }
    }

    $scope.status.now = part;

    getOrders();
    $scope.clickBlue = function(event, order) {
      event.stopPropagation();
      event.preventDefault();
      methodAction[blueStatus2Action[type][order.orderStatusId]].get({
        'orderId': order.orderId
      }, function(res) {
        if (res.code === 0) {
          alert('操作成功');
        } else {
          alert('操作失败！');
        }
        getOrders();
      })
    }
    $scope.clickRed = function(event, order) {
      event.stopPropagation();
      event.preventDefault();
      methodAction[redStatus2Action[type][order.orderStatusId]].get({
        'orderId': order.orderId
      }, function(res) {
        if (res.code === 0) {
          alert('操作成功');
        } else {
          alert('操作失败！');
        }
        getOrders();
      })
    }

    $scope.doRefresh = function() {
      getOrders();
      $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.clickTab = function(type) {
      $scope.status.now = $scope.status[type];
      $state.go('.', { part: $scope.status[type] }, { notify: false });
      // $location.replace('guard/order/guard/' + $scope.status[type]);
      getOrders();
    }

    $scope.toWeekCn = function(dataStr) {
      var index = moment(dataStr).format('E');
      var transfer = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return transfer[index];
    }

    function getOrders() {
      // data[nameKey] = user.userId;
      data.pos = 0;
      $scope.status.noOrder = false;
      methodList[$scope.status.now].get(data, function(data) {
        $scope.orders = addStatus(data.data);
      })
      methodNumber.get(data, function(data) {
        $scope.ordersNumber = data.data;
      })

    }

    function addStatus(dataArray) {
      if (!dataArray || dataArray.length == 0) {
        $scope.status.noOrder = true;
        console.log('NO DATA');
        return;
      }
      dataArray.forEach(function(value, index) {
        value.isRedShow = false;
        value.isBlueShow = false;
        switch (value.orderStatusId) {
          case 12001:
            value.isBlueShow = true;
            value.isRedShow = true;
            value.blueText = '接单';
            value.redText = '拒单';
            break;
          case 12004:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '取货';
            value.redText = 'Red';
            break;
          case 12005:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '已送达';
            value.redText = 'Red';
            break;
          case 13001:
            value.isBlueShow = true;
            value.isRedShow = true;
            value.blueText = '接单';
            value.redText = '拒单';
            break;
          case 13004:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '取衣';
            value.redText = 'Red';
            break;
          case 13007:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '送达洗衣店';
            value.redText = 'Red';
            break;
          case 14003:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '开始清洗';
            value.redText = 'Red';
            break;
          case 14004:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '清洗完成';
            value.redText = 'Red';
            break;
          case 16001:
            value.isBlueShow = true;
            value.isRedShow = true;
            value.blueText = '接单';
            value.redText = '拒单';
            break;
          case 16003:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '洗衣店取回';
            value.redText = 'Red';
            break;
          case 16004:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '已送达';
            value.redText = 'Red';
            break;
        }
      })
      return dataArray;
    }

  });

})

;
