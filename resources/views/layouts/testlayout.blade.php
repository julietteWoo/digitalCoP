<!doctype html>
<html lang="en" ng-app="dcopApp" id="ng-app">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Digital Community of Practice</title>
         <!-- Fonts -->
        <link rel="dns-prefetch" href="//fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">
        <link href="css/bootstrap.min.css")" rel="stylesheet" media="screen">

        <!-- JS -->
        <script src="js/angular/angular.js"></script>
        <script src="js/angular/angular-resource.js"></script>
        <script src="js/angular/angular-route.js"></script>
        <!-- load angular -->

        <script src="js/jquery-1.9.0.min.js" type="text/javascript"></script>
        <script src="js/bootstrap.min.js" type="text/javascript"></script>
        <script src="js/ui-bootstrap-tpls-0.10.0.min.js" type="text/javascript"></script>

        <!-- ANGULAR -->
        <!-- all angular resources will be loaded from the /public folder -->
        <script src="js/controllers/mainCtrl.js"></script> <!-- load our controller -->
        <script src="js/services/dcopServices.js"></script> <!-- load our service -->
        <script src="js/app.js"></script> <!-- load our application -->

        <!-- Styles -->
        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    </head>
    <body class="container">
            <div ng-class="{ active: isActive('/comments')}"><a href="#/comment">comments</a></div>
            <main class="py-4">
                @yield('content')
            </main>
        </div>
    </body>
</html>