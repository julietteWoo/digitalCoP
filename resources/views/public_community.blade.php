<!DOCTYPE html>
<html class="no-js" lang="en" ng-app="dcopPublicApp" id="ng-app">
    @include('layouts.home_header')

    <script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
           <!-- JS for Angular-->
    <script src="js/angular/angular.js"></script>
    <script src="js/angular/angular-resource.js"></script>
    <script src="js/angular/angular-route.js"></script>
    <!-- load angular -->

    <script src="js/ui-bootstrap-tpls-0.10.0.min.js" type="text/javascript"></script>

    <script src="{{ URL::asset('assets/js/libs/highcharts.js') }}"></script>
    <script src="{{ URL::asset('assets/js/libs/networkgraph.js') }}"></script>
    <script src="js/controllers/publicCtrl.js"></script>
    <script src="js/services/dcopPublicServices.js"></script> <!-- load our service -->
    <script src="js/publicApp.js"></script>


    <script src="js/angular/textAngular-1.5.16/dist/textAngular-rangy.min.js"></script>
    <script src="js/angular/textAngular-1.5.16/dist/textAngular-sanitize.min.js"></script>
    <script src="js/angular/textAngular-1.5.16/dist/textAngular.min.js"></script>

    <body>
        <div class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
            <div class="container">
                <div class="top-left links">
                    <a href="/">Home</a>
                </div>

                @if (Route::has('login'))
                    <div class="top-right links">
                        @auth
                            @if(Auth::user()->type != 'community')
                                <a href="{{ url('/dashboard') }}">Dashboard</a>
                            @endif
                                <a href="{{ route('logout') }}" 
                                onclick="event.preventDefault();
                                                document.getElementById('logout-form').submit();">
                                    Logout
                                </a>
                                <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                    @csrf
                                </form>
                        @else
                            <a href="{{ route('login') }}">Login</a>

                            @if (Route::has('register'))
                                <a href="{{ route('register') }}">Register</a>
                            @endif
                        @endauth
                    </div>

                @endif
            </div>
        </div>
        <div class="m-b-md" style="margin-left:70px; margin-right:70px; margin-top:100px; margin-bottom:100px">
            <div class="content">
                <h2>
                    Digital Community of Practice
                </h2>

                <div class="m-b-md" style="margin-left:70px; margin-right:70px">
                    <div ng-view></div>
                </div>
            </div>
        </div>
    </body>
    @include('layouts.footer_simple')
</html>