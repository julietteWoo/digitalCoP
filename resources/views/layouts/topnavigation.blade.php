
<div id="header" class="page-navbar custome-page-nav">
    
    <!-- / navbar-brand -->
    
    <!-- .no-collapse -->
    <div id="navbar-no-collapse" class="navbar-no-collapse">


        @if(Auth::user() && Auth::user()->type != 'community')
            <!-- top left nav -->
            <ul class="nav navbar-nav">
                
                <!-- toggle side bar -->
                <li class="toggle-sidebar">
                    <a href="#">
                        <i class="fa fa-reorder"></i>
                        <span class="sr-only">Collapse sidebar</span>
                    </a>
                </li>
            </ul>
            <!-- / top left nav -->
        @endif
        


        <!-- top right nav -->
        <ul class="nav navbar-nav navbar-right">

             <!-- model button -->
            <li>
                <a data-toggle="modal" data-target="#emailModal" >
                    <i class="fa fa-btn fa-envelope"></i>
                    <span class="sr-only">Message</span>
                </a>
            </li>

            <!-- home button -->
            <li>
                <a href="/" >
                    <i class="fa fa-btn fa-home"></i>
                    <span class="sr-only">Home</span>
                </a>
            </li>

            <!-- public access button -->
            <li>
                <a href="/public" >
                    <i class="fa fa-btn fa-star"></i>
                    <span class="sr-only">Public Access</span>
                </a>
            </li>

            <!-- logout button -->
            <li>
                <a href="{{ route('logout') }}" 
                onclick="event.preventDefault();
                                document.getElementById('logout-form').submit();">
                    <i class="fa fa-btn fa-power-off"></i>
                    <span class="sr-only">Logout</span>
                </a>
                <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                    @csrf
                </form>
            </li>
            
        </ul>
        <!-- / top right nav -->

    </div>
    <!-- / collapse -->
</div>

<div class="modal fade" id="emailModal" tabindex="-1" role="dialog" aria-labelledby="demoModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <div class="row">
                    <div class="col-lg-10 col-md-10 col-xs-10">
                        <h5 class="modal-title" id="demoModalLabel">Send Your Email</h5>
                    </div>
                    <div class="col-lg-2 col-md-2 col-xs-2">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-body">
                {!! Form::open(['enctype'=>'multipart/form-data' ,'url' => '/message' , 'method' => 'POST']) !!}
                    @csrf
                    Send to:
                    <div class="row">
                        @foreach($data['userlist'] as $user)
                            <div class="col-lg-3 col-md-3 col-xs-3">
                                {!! Form::checkbox($user['id'], $user['name'])!!} {{$user['name']}}
                            </div>
                        @endforeach
                    </div>
                    <br>
                    Message:
                        {!! Form::textarea('message','message',['class' => 'form-control']) !!}
                        {!! Form::submit('Send', ['class' => 'btn btn-'. 'success' .' col-xs-12', 'type'=>'submit']) !!}
                {{ Form::close() }}
            </div>
        </div>
    </div>
</div>
