/**
 * Created by andh on 8/10/16.
 */
/**
 * Created by andh on 7/28/16.
 */
angular.module('funstart').controller('PlayController', ['$scope','$rootScope','GamesService','ActivityService','FriendsService','ShareService','BattleService','$location','$routeParams','$http','$timeout','$mdToast',
    function($scope,$rootScope,GamesService,ActivityService,FriendsService,ShareService,BattleService,$location,$routeParams,$http,$timeout,$mdToast){
        $scope.loadGame = function(){
            $scope.isInit = true;
            $scope.games = GamesService;
            //load info this game
            $scope.games.loadGame($routeParams.gameId,function(){
                $scope.isInit = false;
                if($location.search().roomId){
                    $scope.isBattle = true;
                    $scope.battle = BattleService;
                    $scope.battle.init($scope.games.currentGame,$rootScope.user,$location.search().roomId,null,function(){
                        $scope.isBattle = false;
                    });
                }
            });
            $scope.isBattleMode = false;
            //set order for recommend games and reset data list;
            $scope.games.order = 'random';
            $scope.games.hasMore = true;
            $scope.games.data = [];
            //set phase game play
            $scope.isLoad = true;
            $scope.isPlay = false;
            $scope.isEnd = false;
            $scope.isBattle = false;
            $scope.time = Date.now();
            $scope.share = ShareService;
            // eventAdsense.load();
        };
        $scope.loadTest = function(){
            $scope.isInit = true;
            $scope.games = GamesService;
            //load info this game
            $timeout(function() {
                $scope.isInit = false;
                $scope.link = '/sources/game/' + $routeParams.gameId + '/';
                //set order for recommend games and reset data list;
                $scope.games.order = 'random';
                $scope.games.hasMore = true;
                $scope.games.data = [];
                //set phase game play
                $scope.isLoad = true;
                $scope.isPlay = false;
                $scope.isEnd = false;
                $scope.share = ShareService;
            }, 200);

            // eventAdsense.load();
        };


        $scope.finishLoading = function(){
            if($rootScope.user){
                $scope.user = {
                    username: $rootScope.user.username,
                    avatar: $rootScope.user.avatar,
                    displayName: $rootScope.user.displayName
                };
            } else {
                $scope.user = {
                    avatar: 'http://www.funstart.net/sources/avatar.jpg',
                    displayName: 'Người chơi'
                }
            }
            $scope.isLoad = false;
            console.log('done load!');
            //init info share
            $scope.share.setInfo({
                game: ($scope.games.currentGame)?$scope.games.currentGame.title:'Test Title',
                url: location.href,
                pic: ($scope.games.currentGame)?$scope.games.currentGame.thumbAds:'http://www.funstart.net/sources/ads.jpg',
                des: ($scope.games.currentGame)?$scope.games.currentGame.des:'Test Description'
            });
            //load recommend games
            $scope.games.loadGames();

        };
        $scope.start = function(){
            
        };

        //filter display for mobile
        $scope.filterMobile = function(index){
            if($(window).width()<600) {
                if(index<3) return true;
                return false;
            } else {
                if(index<6) return true;
                return false;
            }

        }
        $scope.onPlay = function(){
            $scope.isEnd = false;
            $scope.isPlay = true;
            $scope.start();
        }
        // $scope.onReplay = function(){
        //     $scope.isEnd = false;
        //     $scope.start();
        // };
        $scope.onShareFacebook = function(){
            // $scope.share();
        };
        $scope.skipAds = function() {
            eventAdsense.skipAds();
        }
        $scope.user = {};
        $scope.endGame = function(data){
            /*test*/
            // $scope.isWin = true;
            // $scope.players.data[0].score = 2000;
            /*test*/
            console.log('end!');
            // $scope.$apply(function () {
                $scope.isEnd = true;
            // });
            console.log('time',$scope.time);
            console.log('now',Date.now());
            if(Date.now() - $scope.time >= 2*60*1000){
                eventAdsense.load();
            }
            $scope.setActivity(data);
        };
        $scope.uploadResult = function(obj,callback){
            var fd = new FormData();
            var url = '/api/uploadresult/' + $routeParams.gameId;
            console.log(url);
            fd.append('file',obj.file);
            $http.post(url, fd, {
                    withCredentials : false,
                    headers : {
                        'Content-Type' : undefined
                    },
                    transformRequest : angular.identity
                })
                .success(function(res)
                {
                    obj.pic = res.data;
                    $scope.share.setInfo(obj);
                    if(callback) callback();
                })
                .error(function(res)
                {
                    console.log(res);
                    if(callback) callback();
                });

        };
        $scope.onReady = function(){
            $scope.battle.onReady();
        };
        $scope.setActivity = function(data){
            if($rootScope.user && $routeParams.gameId){
                $scope.activity = ActivityService;
                $scope.activity.updateScore({game: $routeParams.gameId,score: data},function (res) {
                    if(res.data.level > $rootScope.user.level){
                        var toast3 = $mdToast.simple()
                            .textContent('Chúc mừng! Bạn đã được thăng cấp')
                            .theme('md-accent')
                            .position('bottom left');
                        $mdToast.show(toast3).then(function(response) {
                            //callback
                        });
                    }
                    $rootScope.user = res.data;
                    sessionStorage.setItem('user',JSON.stringify($rootScope.user));
                });
            }
        };
        //BATTLE
        $scope.onBattleAgain = function(){
            $scope.isEnd = false;
            $scope.isPlay = false;
            $scope.battle.onCreateRoom(function(){
                console.log('vo day');
                $timeout(function(){
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('.battle-room')))
                            .clickOutsideToClose(true)
                            .title('THÔNG BÁO!')
                            .textContent('Lời mời đã được gửi đi')
                            .ok('Okie!')
                    );
                },200);

            });
        }
        $scope.onCreateRoom = function(){
            $scope.isBattle = true;
            $scope.battle = BattleService;
            $scope.battle.init($scope.games.currentGame,$rootScope.user,null);
            $scope.battle.onCreateRoom();
        }
        $scope.statusClass = function(status){
            return 'status-' + status;
        }
        $scope.onBattleCall = function () {
            $scope.isBattle = true;
            $scope.battle = BattleService;
            $scope.battle.init($scope.games.currentGame,$rootScope.user,null);
            $scope.battle.onFindBattle(null,function(){
                $scope.isBattle = false;
            });
        }
        $scope.onBattleCallback = function(){
            $scope.isPlay = true;
            $scope.start();
        }
        $scope.onCloseBattle = function(){
            console.log('Vo day');
            var confirm = $mdDialog.confirm()
                .title('Thoát chế độ thách đấu')
                .textContent('Bạn chắc chắn muốn thoát chứ?')
                .ok('Có')
                .cancel('Không');
            if($scope.battle.status.isEndGame){
                confirm.parent(angular.element(document.querySelector('.recommend-games')))
            } else if($scope.battle.status.isFullscreen){
                confirm.parent(angular.element(document.querySelector('.game-area')))
            } else if($scope.battle.status.isWaitRoom){
                confirm.parent(angular.element(document.querySelector('.battle-room')));
            } else {
                confirm.parent(angular.element(document.querySelector('.spinner-bg')));
            }
            $mdDialog.show(confirm).then(function() {
                $scope.isBattle = false;
                //chuyen phase game ve chon choi
                $scope.isPlay = false;
                $scope.isEnd = false;
                $scope.battle.onCloseBattle();
            }, function() {

            });

        }
        $scope.isMobile = function(){
            if($(window).width() >= 960){
                return false;
            } else {
                return true;
            }
        }

    }]);
angular.module('funstart').directive('fsImg', function($routeParams) {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, elem, attr)
        {
            var s = document.createElement("img");
            var src = elem.attr('src');
            if(src!==undefined)
            {
                s.src = '/sources/game/' + $routeParams.gameId + src;
                if(s.class) s.class = elem.attr('class');
                if(s.style) s.style = elem.attr('style');
                if(s.id) s.id = elem.attr('id');
            }
            else
            {
                var code = elem.text();
                s.text = code;
            }
            elem.parent().append(s);
            elem.remove();
        }
    };
});

angular.module('funstart').directive('fsScript', function($routeParams) {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, elem, attr)
        {

            var s = document.createElement("script");
            s.type = "text/javascript";
            var src = elem.attr('src');
            if(src!==undefined)
            {
                s.src = '/sources/game/' + $routeParams.gameId + src;
            }
            else
            {
                var code = elem.text();
                s.text = code;
            }
            document.head.appendChild(s);
            elem.remove();

        }
    };
});
// angular.module('funstart').directive('ng-game', function() {
//     return {
//         restrict: 'E',
//         scope: false,
//         link: function(scope, elem, attr)
//         {
//             elem.html();
//         }
//     };
// });

angular.module('funstart').directive('fsLink', function($routeParams) {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, elem, attr)
        {
            var s = document.createElement("link");
            s.type = "text/css";
            s.rel = "stylesheet";
            var href = elem.attr('href');
            if(href!==undefined)
            {
                s.href = '/sources/game/' + $routeParams.gameId + href;
            }
            else
            {
                var code = elem.text();
                s.text = code;
            }
            document.head.appendChild(s);
            elem.remove();
        }
    };
});
