<a href="/usermanagement/create" class="btn btn-primary">Add</a>

{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>id</th>
            <th>name</th>
            <th>email</th>
            <th>type</th>
            <th>action</th>
        </tr>
    </thead>
    <tbody>
    	@foreach ($data['users'] as $user)
    		<tr>
    			<td>
                    {{$user['id']}}<br>
                </td>
                <td>
                    {{$user['name']}}<br>
                </td>
                <td>
                    {{$user['email']}}<br>
                </td>
                <td>
                    {{$user['type']}}<br>
                </td>
                <td>
                    <a href="#" class="btn btn-danger col-xs-12" data-toggle="modal" data-target="#confirmation_{{$user->id}}">Delete</a>
                     {{ modalConfirmationDeleteActivity($user,"user",'AdminUserController@destroy','Are you sure you want to remove this user?') }}
                </td>
    		</tr>
		@endforeach
    </tbody>
</table>


{{closeFrame()}}