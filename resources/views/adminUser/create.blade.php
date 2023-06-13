{{openFrame()}}

	{!! Form::open(['enctype'=>'multipart/form-data' ,'url' => '/usermanagement' , 'method' => 'POST']) !!}

	@csrf

	{{-- Name Field --}}
	<div class="form-group">
		{!! Form::label('Name') !!}
		{!! Form::text('name','nameexample',['class' => 'form-control']) !!}
	</div>

	{{-- Email Field --}}
	<div class="form-group">
		{!! Form::label('Email') !!}
		{!! Form::email('email','example@gmail.com',['class' => 'form-control']) !!}
	</div>

	{{-- Password --}}
	<div class="form-group">
		{!! Form::label('Password') !!}
		{!! Form::password('password',[ 'id'=> 'password','class' => 'form-control']) !!}
	</div>

	{{-- Type --}}
	<div class="form-group">
		{!! Form::label('Type') !!}
		{!! Form::select('type',$dataSet['userType'],['class' => 'form-control']) !!}
	</div>

	{!! Form::submit('Add', ['class' => 'btn btn-'. 'warning' .' col-xs-12', 'type'=>'submit']) !!}

{{closeFrame()}}