

<!-- col-lg-4 start here -->
<div class="tabs mb20">
    <ul id="profileTab" class="nav nav-tabs">
        <li class="active"><a href="#overview" data-toggle="tab" aria-expanded="true">You Teaching Plans</a>
        </li>
        <li class="">
            <a href="#edit-profile" data-toggle="tab">Other Teaching Plans You Involved</a>
        </li>
    </ul>
    <div id="myTabContent" class="tab-content">
        <div class="tab-pane fade active in" id="overview">
            <table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
                <thead>
                    <tr role="row">
                        <th>Id</th>
                        <th>Teaching Plan Title</th>
                        <th>Public/Private</th>
                        <th>Collaboration</th>
                        <th>Updated by</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['user_teaching_plans'] as $plan)
                        <tr>
                            <td>
                                {{$plan['id']}}<br>
                            </td>
                            <td>
                                <a href="/teachingplan#/view/{{$plan->id}}" target="_blank" style="color:#1a8cff">
                                    {{$plan['title']}}
                                </a>
                            </td>
                            <td>
                                {{$plan['public']}}<br>
                            </td>
                            <td>
                                {{$plan['allow_collaboration_flag']==1? 'Yes':''}}<br>
                            </td>
                            <td>
                                {{$plan['updated_at']}}
                            </td>
                            
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <a href="http://192.168.1.119:3000/teachingplan#/create" target='blank' class="btn btn-warning timeline-load-more-btn"><i class="fa fa-plus"></i> Add </a>
        </div>
        <div class="tab-pane fade pb0" id="edit-profile">
            <table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
                <thead>
                    <tr role="row">
                        <th>Id</th>
                        <th>Teaching Plan Title</th>
                        <th>Public/Private</th>
                        <th>Created by</th>
                        <th>Updated by</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['teaching_plans'] as $plan)
                        <tr>
                            <td>
                                {{$plan['id']}}<br>
                            </td>
                            <td>
                                <a href="/teachingplan#/view/{{$plan->id}}" target="_blank" style="color:#1a8cff">
                                    {{$plan['title']}}
                                </a>
                            </td>
                            <td>
                                {{$plan['public']}}
                            </td>
                            <td>
                                {{$plan['author']}}<br>
                            </td>
                            <td>
                                {{$plan['updated_at']}}
                            </td>
                            
                        </tr>
                    @endforeach
                </tbody>
            </table>
            
        </div>
    </div>
</div>