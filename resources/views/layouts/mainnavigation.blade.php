<!-- .page-sidebar -->
    <aside id="sidebar" class="page-sidebar hidden-md hidden-sm hidden-xs">
        <!-- Start .sidebar-inner -->
        <div class="sidebar-inner">
            <!-- Start .sidebar-scrollarea -->
            <div class="sidebar-scrollarea">
                <!--  .sidebar-panel -->

                <!--  .sidebar-panel -->
                <div class="sidebar-panel">
                    <h5 class="sidebar-panel-title">Profile</h5>
                </div>

                <!-- =========================================== User Icon ============================= -->
                <!-- / .sidebar-panel -->
                <div class="user-info clearfix custom-user-info" style="width: 100%">
                    <span class="name"><i class="fa fa-user"></i> {{Auth::user()->name}}</span>
                    <div class="btn-group">
                        <button type="button" class="btn btn-default btn-xs " >
                            <a href="{{'/profile'}}">Profile</a>
                        </button>
                    </div>
                </div>

                <div class="sidebar-panel">
                    <h5 class="sidebar-panel-title">{{ 'Navigation'  }}</h5>
                </div>
                <div class="side-nav">
                        <ul class="nav">


                        <!-- =========================================== Dashboard ============================= -->
                        
                            {{ navLaravelButton(
                                '/dashboard', 
                                'Dashboard',
                                'fa fa-pie-chart',
                                $heading
                            )}}

                            <!-- =========================================== get idea ============================= -->
                            {{ navAngularButton(
                                '/node#/node', 
                                'Get Ideas',
                                'fa fa-chain',
                                $heading
                            )}}

                            <!-- =========================================== teaching plan============================= -->
                            {{ navAngularButton(
                                '/teachingplan#/teachingplan', 
                                'Teaching Plan',
                                'fa fa-file',
                                $heading
                            )}}

                            <!-- =========================================== group discussion ============================= -->
                            {{ navAngularButton(
                                '/forum#/topic', 
                                'Forum',
                                'fa fa-comments',
                                $heading
                            )}}

                            <!-- =========================================== public discussion ============================= -->
                            {{ navAngularButton(
                                '/publicdiscussion#/discussion', 
                                'Public Discussion',
                                'fa fa-users',
                                $heading
                            )}}

                            <!-- =========================================== timesheet ============================= -->

                            <!--
                            {{ navLaravelButton(
                                '/timesheet#/timesheet', 
                                'Timesheet',
                                'fa fa-hourglass',
                                $heading
                            )}}
                            -->

                            <!-- =========================================== admin ============================= -->
                            @if( Auth::user()->type == "admin")
                                <li>
                                    <a href="#"><i class="l-basic-webpage-txt"></i><span class="txt">Admin</span></a>
                                        <ul class="sub">

                                        {{ navLaravelButton(
                                            '/adminmanagement', 
                                            'Admin Forum',
                                            'fa fa-comments-o',
                                            $heading
                                        )}}

                                        {{ navLaravelButton(
                                            '/nodemanagement', 
                                            'Admin Nodes',
                                            'fa fa-dot-circle-o',
                                            $heading
                                        )}}

                                        {{ navLaravelButton(
                                            '/usermanagement', 
                                            'Admin User',
                                            'fa fa-user',
                                            $heading
                                        )}}

                                        {{ navLaravelButton(
                                            '/subjectmanagement', 
                                            'Admin Subject',
                                            'fa fa-book',
                                            $heading
                                        )}}

                                        {{ navLaravelButton(
                                            '/teachingplanmanagement', 
                                            'Admin Teaching Plan',
                                            'fa fa-tasks',
                                            $heading
                                        )}}
                                    </ul>
                                </li>
                            @endif

                    </ul>
                </div>
                <!-- =========================================== NEW Navigation  ============================= -->
                
            </div>
            <!-- End .sidebar-scrollarea -->
        </div>
        <!-- End .sidebar-inner -->
    </aside>


    <?php
    // Helper function to place Navigation Button
    function navLaravelButton($URL,$buttonLabel,$icon,$heading){
        echo '<li>';
        echo '<a href="' . $URL . '"';
        if ($heading == $buttonLabel){
            echo ' class="active"';
        }
        echo '>';

        if (!empty($icon))
        {
             echo '<i class="' . $icon . '"></i>';
        }
        echo '<span class="txt">' . $buttonLabel . '</span></a>';
        echo '</li>';
    }

    // Helper function to place Navigation Button
    function navAngularButton($URL,$buttonLabel,$icon,$heading){
        echo '<li>';
        echo '<a href="'. $URL . '"';
        if ($heading == $buttonLabel){
            echo ' class="active"';
        }
        echo '>';

        if (!empty($icon))
        {
             echo '<i class="' . $icon . '"></i>';
        }
        echo '<span class="txt">' . $buttonLabel . '</span></a>';
        echo '</li>';
    }
    ?>


