angular.module('starter.services', ['ngResource'])

.factory('userWechatInfo', function($resource) {
  return $resource('http://www.lifeuxuan.com/index.php/user/basicinfo');
})

.factory('userRegister', function($resource) {
  return $resource('http://www.lifeuxuan.com/index.php/user/register');
})

.factory('UserInfo', function($resource, $q, $timeout, userWechatInfo,
  userRegister) {
  var deferred = $q.defer();
  var user = {
    'userId': 'C0000000001',
  }

  // ------------for test-----------------
  if (window.location.hostname == "localhost") {
    deferred.resolve(user);
    return deferred.promise;
  }
  // ------------for test-----------------

  userWechatInfo.get({}, function(e) {
    user.name = e.data.nickname;
    user.img = e.data.headimgurl;
    user.openid = e.data.openid;
    user.headPicUrl = e.data.headimgurl;
    userRegister.get({
      'latitude': user.latitude,
      'longitude': user.longitude,
      'openId': user.openid,
      'username': user.nickname,
      'password': '',
      'headPicUrl': user.headPicUrl
    }, function(e) {
      if (e.data) {
        user.userId = e.data.userId;
        user.verify = e.data.verifyCode;
        var address = e.data.lastAddress;
        user.rcvAddress = address.rcvAddress;
        user.rcvPhone = address.rcvPhone;
        user.rcvName = address.rcvName;
        deferred.resolve(user);
      }
    })
  });

  return deferred.promise;
})

;
