

{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>Id</th>
            <th>Node Name</th>
            <th>Note</th>
            <th>Action</th>
        </tr>
    </thead>
        <tbody>
        	@foreach ($data['nodes'] as $node)
        		<tr>
                {!! Form::open(['enctype'=>'multipart/form-data' ,'url' => '/nodemanagement' , 'method' => 'POST']) !!}
                    @csrf
        			<td>
                        {{$node['id']}}
                        {!! Form::hidden('id',$node['id'],['class' => 'form-control']) !!}
                    </td>
                    <td>
                        {{$node['name']}}
                    </td>
 
                    <td>
                        {!! Form::text('note',$node['note'],['class' => 'form-control']) !!}
                    </td>
                    
                    <td>
                         {!! Form::submit('Update', ['class' => 'btn btn-'. 'warning' .' col-xs-12', 'type'=>'submit']) !!}
                    </td>
                {{ Form::close() }}
        		</tr>

    		@endforeach

        </tbody>

</table>


{{closeFrame()}}