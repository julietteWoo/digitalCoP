<!-- col-lg-4 start here -->
<div class="tabs mb20">
    <ul id="profileTab" class="nav nav-tabs">
        <li class="active"><a href="#userPublic" data-toggle="tab" aria-expanded="true">You Public Board Topics</a>
        </li>
        <li class="">
            <a href="#otherPublic" data-toggle="tab">Other Public Board Topics You Involved</a>
        </li>
    </ul>
    <div id="myTabContent" class="tab-content">
        <div class="tab-pane fade active in" id="userPublic">
            <table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
                <thead>
                    <tr role="row">
                        <th>Id</th>
                        <th>Teaching Plan Title</th>
                        <th>reply</th>
                        <th>Updated by</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['user_public_board'] as $plan)
                        <tr>
                            <td>
                                {{$plan['id']}}<br>
                            </td>
                            <td>
                                <a href="/publicdiscussion#/discussionview/{{$plan->id}}" target="_blank" style="color:#1a8cff">
                                    {{$plan['title']}}
                                </a>
                            </td>
                            <td>
                                {{$plan['replies']}}<br>
                            </td>
                            <td>
                                {{$plan['updated_at']}}
                            </td>
                           
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="tab-pane fade pb0" id="otherPublic">
            <table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
                <thead>
                    <tr role="row">
                        <th>Id</th>
                        <th>Teaching Plan Title</th>
                        <th>Created by</th>
                        <th>Updated by</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['public_board'] as $topic)
                        <tr>
                            <td>
                                {{$topic['id']}}<br>
                            </td>
                            <td>
                                <a href="/publicdiscussion#/discussionview/{{$topic->id}}" target="_blank" style="color:#1a8cff">
                                    {{$topic['title']}}
                                </a>
                            </td>
                            
                            <td>
                                {{$topic['author']}}<br>
                            </td>
                            <td>
                                {{$topic['updated_at']}}
                            </td>
                            
                        </tr>
                    @endforeach
                </tbody>
            </table>
            
        </div>
    </div>
</div>