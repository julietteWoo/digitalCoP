@include('layouts.admin_panel_bar')

{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>Id</th>
            <th>Title/Content</th>
            <th>Replies</th>
            <th>Created by</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
    	@foreach ($data['topics'] as $topic)
    		<tr>
    			<td>
                    {{$topic['id']}}<br>
                </td>
                <td>
                    {{$topic['title']}}<br>
                    {{$topic['content']}}<br>
                </td>
                <td>
                    {{$topic['replies']}}<br>
                </td>
                <td>
                    {{$topic['user']}}<br>
                </td>
                <td>
                    <a href="#" class="btn btn-danger col-xs-12" data-toggle="modal" data-target="#confirmation_{{$topic->id}}">Delete</a>
                     {{ modalConfirmationDeleteActivity($topic,"topic",'AdminController@destroy','Are you sure you want to remove this activity?') }}
                </td>
    		</tr>
		@endforeach
    </tbody>
</table>


{{closeFrame()}}