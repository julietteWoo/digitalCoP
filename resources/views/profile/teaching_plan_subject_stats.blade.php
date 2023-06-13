<div class="panel panel-default plain" id="dyn_1">
    <!-- Start .panel -->
    <div class="panel-heading">
        <h4 class="panel-title">User Teaching Plan Subject Stats</h4>
    </div>
    <div class="panel-body">
        <ul class="progressbars-stats list-unstyled">
            @foreach ($data['subject'] as $key=>$sub )
                <li>
                    <span class="progressbar-text">{{($key==" " ||$key==null)? "General": $key}}{{($sub['subject_group']==''|| $sub['subject_group']==null)? '' : ' ('. $sub['subject_group'].')'}}  </span>
                    <div class="progress animated-bar flat mt0">
                        <div class="progress-bar {{$sub['color']}}" role="progressbar" data-transitiongoal="{{$sub['number']}}" aria-valuenow="{{$sub['number']}}" style="width: {{$sub['percentage']}};">{{$sub['percentage']}}</div>
                    </div>
                </li>
           @endforeach
        </ul>
    </div>
</div>