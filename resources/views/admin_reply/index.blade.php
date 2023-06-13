@include('layouts.admin_panel_bar')

{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>Id</th>
            <th>Topic Title</th>
            <th>Content</th>
            <th>Created by</th>
            <th>Updated by</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
    	@foreach ($data['replies'] as $reply)
    		<tr>
    			<td>
                    {{$reply['id']}}<br>
                </td>
                <td>
                    {{$reply['title']}}
                </td>
                <td>
                    {{$reply['content']}}
                </td>
                <td>
                    {{$reply['user']}}<br>
                </td>
                <td>
                    {{$reply['updated_at']}}
                </td>
                <td>
                    <a href="#" class="btn btn-danger col-xs-12" data-toggle="modal" data-target="#confirmation_{{$reply->id}}">Delete</a>
                     {{ modalConfirmationDeleteActivity($reply,"reply",'AdminReplyController@destroy','Are you sure you want to remove this activity?') }}
                </td>
    		</tr>
		@endforeach
    </tbody>
</table>


{{closeFrame()}}