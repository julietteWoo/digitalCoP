 <div class="col-lg-12 col-md-12"> 
    <div class="row">

        <h3 class="panel-heading"> What's Hot</h3>
    </div>

    <div class="row">
        <h4 class="panel-heading"> Nodes</h4>
        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}
                <div class="row">
                    <thead>
                        <tr>
                            <td>Most Connects Nodes</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                @foreach ($data['common_nodes'] as $node)
                                    <a  href="/node#/node/{{$node}}" target="_blank" >
                                        <span   class="badge badge-danger mr10 mb10 ng-binding ng-scope"> {{$node}} </span>
                                    </a>
                                @endforeach
                            </td>
                        </tr>
                    </tbody>
                </div>
            {{closeTable()}}
        </div>

        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}
                <div class="row">

                    <thead>
                        <tr>
                            <td>Newest Updated Nodes</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                             <td>    
                                @foreach ($data['update_nodes'] as $node)
                                    <a  href="/node#/node/{{$node}}" target="_blank" >
                                        <span   class="badge badge-warning mr10 mb10 ng-binding ng-scope"> {{$node}} </span>
                                    </a>
                                @endforeach
                            </td>
                        </tr>
                    </tbody>
                    

                </div>
            {{closeTable()}}
        </div>

        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}

                <div class="row">

                    <thead>
                        <tr>
                            <td>Newest Created Nodes</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                @foreach ($data['new_nodes'] as $node)
                                    <a  href="/node#/node/{{$node}}" target="_blank" >
                                        <span   class="badge badge-primary mr10 mb10 ng-binding ng-scope"> {{$node}} </span>
                                    </a>
                                @endforeach
                            </td>
                        </tr>
                    </tbody>
                </div>
            {{closeTable()}}
        </div>
     </div>

     <h4 class="panel-heading"> 'Topics'</h4>
     <div class="row">
        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}
                <div class="row">
                    <thead>
                        <tr>
                            <td>Hottest Topics</td>
                        </tr>
                        <tbody>
                            
                            @foreach ($data['hot_topics'] as $node)
                                <tr>
                                    <td><a href="/forum#/topicview/{{$node->id}}" target="_blank" style="color:#1a8cff">{{$node->title}} </a></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </thead>

                </div>
            {{closeTable()}}
        </div>

        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}
                <div class="row">

                    <thead>
                        <tr>
                            <td>Neweast Updated Topics</td>
                        </tr>
                        <tbody>
                            
                            @foreach ($data['update_topics'] as $node)
                                <tr>
                                    <td><a href="/publicdiscussion#/discussionview/{{$node->id}}" target="_blank" style="color:#1a8cff">{{$node->title}} </a></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </thead>

                </div>
            {{closeTable()}}
        </div>

        <div class="col-lg-4 col-md-6"> 
            {{openTable()}}

                <div class="row">

                    <thead>
                        <tr>
                            <td>New Created Topics</td>
                        </tr>
                        <tbody>
                            
                            @foreach ($data['new_topics'] as $node)
                                <tr>
                                    <td><a href="/forum#/topicview/{{$node->id}}" target="_blank" style="color:#1a8cff">{{$node->title}} </a></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </thead>

                </div>
            {{closeTable()}}
        </div>
     </div>

     <div class="row">
        <h4 class="panel-heading"> Top Disccusion</h4>
    </div>
     <div class="row">
        <div class="col-lg-12 col-md-12"> 
            {{openTable()}}
                <div class="row">
                    <thead>
                        <tr>
                            <td>Discussion Title</td>
                            <td>Node</td>
                            <td>Replies</td>
                        </tr>
                        <tbody>
                            
                            @foreach ($data['discussion'] as $discussion)
                                <tr>
                                    <td><a href="/forum#/discussionview/{{$discussion->id}}" target="_blank" style="color:#1a8cff">{{$discussion->title}}</a></td>
                                    <td>{{$discussion->name}}</td>
                                    <td>{{$discussion->replies}}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </thead>

                </div>
            {{closeTable()}}
        </div>
     </div>
</div>