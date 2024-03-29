// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var TicTacToe = angular.module('TicTacToe', ['ionic'])

.run(function($ionicPlatform, $rootScope, storageService, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.Keyboard) {
      window.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });

  $rootScope.appShutdown = function() {
    $timeout(function(){
          ionic.Platform.exitApp();
    },500)
  };


  //set some defaults

  let settings = storageService.get('settings');

  if (!settings || !settings.difficulty) {
    storageService.set('settings', {difficulty: 'easy', gameMode: 'htp'}) //htp = human to phone; hth = human to human
  }
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $stateProvider

    .state('app',{
      url: '/app',
      abstract: true,
      templateUrl: 'templates/app.html',
      disableHardwareBackButton : true
    })
    .state('app.home',{
      url: '/home',
      views:{
        'content': {
          templateUrl: 'templates/home.html',
          disableHardwareBackButton : true,
          controller:  'homeCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
  $ionicConfigProvider.views.maxCache(0);
});