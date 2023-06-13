@extends('layouts.main_simple')

@section('content')
    <div class="login-page">

        @include('layouts.home_button')
        <!-- Start login container -->
        <div class="container login-container">
            <div class="login-panel panel panel-default plain animated bounceIn">
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/register') }}">
                    
                        @csrf
                      
                        <div class="form-group{{ $errors->has('username') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-user"></i></span>
                                    <input id="name" type="text" class="form-control" name="name" value="{{ old('name') }}" placeholder="Username">
                                    @error('name')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $errors->first('name') }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-user"></i></span>
                                    <input id="email" type="text" class="form-control" name="email" value="{{ old('email') }}" placeholder="E-Mail Address">
                                    @error('email')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $errors->first('email') }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-key"></i></span>
                                    <input type="password" name="password" id="password" class="form-control" value="" placeholder="password">
                                     @if ($errors->has('password'))
                                        <span class="help-block">
                                            <strong>{{ $errors->first('password') }}</strong>
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <div class="col-lg-12">
                                <div class="input-group input-icon">
                                    <span class="input-group-addon"><i class="fa fa-key"></i></span>
                                    <input id="password-confirm" type="password" class="form-control" name="password_confirmation" placeholder="Confirm Password">
                                     @if ($errors->has('password_confirmation'))
                                        <span class="help-block">
                                            <strong>{{ $errors->first('password_confirmation') }}</strong>
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group mb0">
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                            </div>
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-4 mb25">
                                <button class="btn btn-primary pull-right" type="submit">Register</button>
                            </div>
                        </div>
                        
                    </form>
                    
                    
                </div>
                <div class="panel-footer gray-lighter-bg bt">
                    <h4 class="text-center"><strong>Already have an account?</strong>
                    </h4>
                    <p class="text-center"><a href="{{ url(Request::segment(0) . '/login') }}" class="btn btn-warning"> Login here</a>
                    </p>
                </div>
            </div>
            <!-- End .panel -->
        </div>
        <!-- End login container --> 
    </div>

@endsection

