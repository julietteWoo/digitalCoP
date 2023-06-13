    @extends('layouts.app')

    @section('content')
        <div class="container" ng-controller="CommentController">
            <div class="row">
                <div class="col-md-12">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <button class="btn btn-primary btn-xs pull-right" ng-click="initComment()">Add Comments</button>
                            Topics
                        </div>

                        <div class="panel-body">
                            @if (session('status'))
                                <div class="alert alert-success">
                                    {{ session('status') }}
                                </div>
                            @endif


                            <table class="table table-bordered table-striped" ng-if="comments.length > 0">
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Action</th>
                                </tr>
                                <tr ng-repeat="(index, comment) in comments">
                                    <td>
                                        @{{ index + 1 }}
                                    </td>
                                    <td>@{{ comment.name }}</td>
                                    <td>@{{ comment.description }}</td>
                                    <td>
                                        <button class="btn btn-success btn-xs" ng-click="initEdit(index)">Edit</button>
                                        <button class="btn btn-danger btn-xs" ng-click="deleteComment(index)" >Delete</button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    @endsection