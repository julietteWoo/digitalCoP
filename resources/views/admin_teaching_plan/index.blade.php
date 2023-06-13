{{openFrame()}}

<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
    <thead>
        <tr role="row">
            <th>Id</th>
            <th>Teaching Plan Title</th>
            <th>Content</th>
            <th>Created by</th>
            <th>Updated by</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
    	@foreach ($data['teaching_plan'] as $plan)
    		<tr>
    			<td>
                    {{$plan['id']}}<br>
                </td>
                <td>
                    {{$plan['title']}}
                </td>
                <td>
                    {{$plan['content']}}
                </td>
                <td>
                    {{$plan['user']['name']}}<br>
                </td>
                <td>
                    {{$plan['updated_at']}}
                </td>
                <td>
                    <a href="#" class="btn btn-danger col-xs-12" data-toggle="modal" data-target="#confirmation_{{$plan->id}}">Delete</a>
                     {{ modalConfirmationDeleteActivity($plan,"plan",'AdminTeachingPlanController@destroy','Are you sure you want to remove this plan?') }}
                </td>
    		</tr>
		@endforeach
    </tbody>
</table>


{{closeFrame()}}