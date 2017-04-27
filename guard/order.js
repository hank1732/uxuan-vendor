angular.module('starter.controllers')

.controller('guardOrderDetailCtrl', function($scope, $rootScope, $stateParams,
  UserInfo, guardOrderDetailFurit, guardOrderDetailFetchwash,
  guardOrderDetailSendwash,
  shopOrderDetailFurit, shopOrderDetailWash, guardOrderDetailDrink) {
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
      if ($scope.type == 17004) {
        detailMethod = guardOrderDetailDrink;
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
  var data = {
    'eguardId': 'C0000000001',
    'shopHostId': 'C0000000007',
    'pos': 0
  };
  UserInfo.then(function(user) {

    data[nameKey] = user.userId;

    $scope.type = type;
    $scope.orderTypeObj = {
      17001: '水果',
      17002: '洗衣取衣',
      17003: '洗衣送回',
      17004: '咖啡',
      17005: '代买',
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
        26001: 'acceptDrink',
        26004: 'fetchDrink',
        26005: 'finishDrink',
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
        26001: 'refuseDrink',
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
          alert('操作失败！' + res.msg);
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
          alert('操作失败！' + res.msg);
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
      // data.shopHostId = 'C0000000007';
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
        value.redText = '拒单';
        value.isBlueShow = false;
        value.avaliableAction && value.avaliableAction.forEach(function(item) {
          if (item === 'canRejectOrder') {
            value.isRedShow = true
          }
          switch (item) {
            case 'canAccpetOrder':
              value.blueText = '接单';
              break;
            case 'canFetchGoods':
              value.blueText = '取货';
              break;
            case 'canGoodsDelivered':
              value.blueText = '已送达';
              break;
            case 'canFetchWash':
              value.blueText = '取衣';
              break;
            case 'canWashReachVendor':
              value.blueText = '送达洗衣店';
              break;
            case 'canStartWash':
              value.blueText = '开始清洗';
              break;
            case 'canWashBack':
              value.blueText = '洗衣店取回';
              break;
          }
        })
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
          case 26001:
            value.isBlueShow = true;
            value.isRedShow = true;
            value.blueText = '接单';
            value.redText = '拒单';
            break;
          case 26004:
            value.isBlueShow = true;
            value.isRedShow = false;
            value.blueText = '取货';
            value.redText = 'Red';
            break;
          case 26005:
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
