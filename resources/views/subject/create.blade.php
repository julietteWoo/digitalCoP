{{openFrame()}}

	{!! Form::open(['enctype'=>'multipart/form-data' ,'url' => '/subjectmanagement' , 'method' => 'POST']) !!}

	@csrf

	{{-- Name Field --}}
	<div class="form-group">
		{!! Form::label('Name') !!}
		{!! Form::text('subject','subject',['class' => 'form-control']) !!}
	</div>

	<div class="form-group">
		{!! Form::label('Group') !!}
		{!! Form::text('subject_group','subject_group',['class' => 'form-control']) !!}
	</div>

	{!! Form::submit('Add', ['class' => 'btn btn-'. 'warning' .' col-xs-12', 'type'=>'submit']) !!}

{{closeFrame()}}