<div class='panel panel-default plain' id='dyn_0'>
    <div class="panel-heading">
        <h4 class="panel-title bb">Profile details</h4>
    </div>
    <div class="panel-body">
        <div class="row profile">
            <!-- Start .row -->
            <div class="col-md-6">
                <div class="profile-name">
                    <h3 onclick='onEditing()' id='username'>{{Auth::user()->name}}</h3>
                    <div style='display:none' id="usernamefield">
                        {{openFrame()}}

                            {!! Form::open(['enctype'=>'multipart/form-data' ,'url' => '/profile' , 'method' => 'POST']) !!}
                            @csrf

                                <input type="text" class="form-control" name="username" placeholder="{{Auth::user()->name}}" value="{{Auth::user()->name}}" required/>
                                <a class="btn btn-default" onclick="onCancel()">Cancel</a>

                            {!! Form::submit('Update', ['class' => 'btn btn-warning form-btn', 'type'=>'submit']) !!}

                        {{closeFrame()}}
                    </div>

                    <!-- Start .row -->
                    <div class="col-md-8">
                        <dl class="mt20">
                            <dt class="text-muted">Email</dt>
                            <dd>{{Auth::user()->email}}</dd>
                            
                        </dl>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="profile-tags">
                    <h5 class="text-muted">User Type</h5>
                    <p >{{Auth::user()->type}}</p>
                </div>
            </div>
        </div>
        <!-- End .row -->
    </div>
</div>

<script type="text/javascript">
    //MENU HIDE/SHOW TOGGLE
    function onEditing() {
        var name = document.getElementById('username');
        name.style.display = 'none';
        var namefield = document.getElementById('usernamefield');
        namefield.style.display = 'block';
    }    
    function onCancel() {
        var name = document.getElementById('username');
        name.style.display = 'block';
        var namefield = document.getElementById('usernamefield');
        namefield.style.display = 'none';
    }         
</script>