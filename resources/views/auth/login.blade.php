
@extends('layouts.main_simple')

@section('content')
  
    <div class="login-page">

        @include('layouts.home_button')
        <!-- Start login container -->
        <div class="container login-container">
            <div class="login-panel panel panel-default plain animated bounceIn">
                <!-- Start .panel -->
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                    
                        {{ csrf_field() }}
                        
                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-user"></i></span>
                                    <input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" placeholder="{{'E-Mail Address'}}">
                                    @if ($errors->has('email'))
                                        <span class="help-block">
                                            <strong>
                                            @if ($errors->first('email') == 'The email field is required.')
                                                {{ 'The email field is required.'  }}
                                            @else
                                                {{ $errors->first('email') }}
                                            @endif
                                            </strong>
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-key"></i></span>
                                    <input type="password" name="password" id="password" class="form-control" value="" placeholder="{{'password'}}">
                                     @if ($errors->has('password'))
                                        <span class="help-block">
                                            <strong>
                                            @if ($errors->first('password') == 'The password field is required.')
                                                {{ 'The password field is required.'  }}
                                            @else
                                                {{ $errors->first('password') }}
                                            @endif
                                            </strong>
                                        </span>
                                    @endif
                                </div>
                                <span class="help-block text-right"><a href="{{ url('/password/reset') }}">{{ 'Forget Password ?'  }}</a></span> 
                            </div>
                        </div>
                        
                        <div class="form-group mb0">
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                <div class="checkbox-custom">
                                    <input type="checkbox" name="remember" id="remember" value="option">
                                    <label for="remember">{{ 'Remember user'  }}</label>
                                </div>
                            </div>
                            <div class="col-lg-23 col-md-6 col-sm-6 col-xs-4 mb25">
                                <button class="btn btn-primary pull-right" type="submit">{{ 'Login'  }}</button>
                            </div>
                        </div>
                        
                    </form>
                      
                </div>

                
            </div>
            <!-- End .panel -->
        </div>
        <!-- End login container -->
    </div>

@endsection
