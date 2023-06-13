<a href="/subjectmanagement/create" class="btn btn-primary">Add</a>

{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>id</th>
            <th>name</th>
            <th>group</th>
            <th>action</th>
        </tr>
    </thead>
    <tbody>
    	@foreach ($data['subjects'] as $subject)
    		<tr>
    			<td>
                    {{$subject['id']}}<br>
                </td>
                <td>
                    {{$subject['subject']}}<br>
                </td>
                <td>
                    {{$subject['subject_group']}}<br>
                </td>
                <td>
                    <a href="#" class="btn btn-danger col-xs-12" data-toggle="modal" data-target="#confirmation_{{$subject->id}}">Delete</a>
                     {{ modalConfirmationDeleteActivity($subject,"subject",'AdminSubjectController@destroy','Are you sure you want to remove this subject?') }}
                </td>
    		</tr>
		@endforeach
    </tbody>
</table>


{{closeFrame()}}