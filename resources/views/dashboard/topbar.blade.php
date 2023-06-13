<div class="col-lg-12 col-md-12"> 
    <div class="row">   <!-- .row -->
        <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <!-- .col-md-3 -->
            <div class="panel panel-info tile panelClose panelRefresh">
                <!-- Start .panel -->
                <div class="panel-heading">
                    <h4 class="panel-title">Total Connection Nodes</h4>
                </div>
                <div class="panel-body pt0">
                    <div class="progressbar-stats-1">
                        <div class="stats">
                            <i class="l-software-add-vectorpoint"></i> 
                            <div id="visitor_number" class="stats-number" data-from="0" data-to='{{$data["num_nodes"]}}'> {{$data["num_nodes_month"]}}</div>
                            <p class="mb0">
                            	new connection nodes
                            	@if ($data["num_nodes_month"] != '0')
        	                		<i class="fa fa-arrow-circle-o-up s20 mr5 pull-right"></i> 
        	                	@else
        	                		<i class="fa fa-circle s20 mr5 pull-right"></i>
        	                	@endif
                            </p>
                        </div>
                        <div class="progress animated-bar flat transparent progress-bar-xs mb10 mt0">
                            <div class="progress-bar progress-bar-white" role="progressbar" data-transitiongoal="63"></div>
                        </div>
                        <div class="comparison">
                            <p class="mb0">
        	                	{{$data["num_nodes"]}} overall connection nodes 
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End .panel -->
        </div>


        <!-- / .col-md-3 -->
        <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <!-- .col-md-3 -->
            <div class="panel panel-success tile panelClose panelRefresh">
                <!-- Start .panel -->
                <div class="panel-heading">
                    <h4 class="panel-title">Total Topics</h4>
                </div>
                <div class="panel-body pt0">
                    <div class="progressbar-stats-1">
                        <div class="stats">
                            <i class="l-basic-elaboration-message-dots"></i> 
                            <div class="stats-number" data-from="0" data-to='{{$data["num_topics"]}}'>{{$data["num_topics_month"]}}</div>
                            <p class="mb0">
                            	new topics
        	                    @if ($data["num_topics_month"] != '0')
        	                		<i class="fa fa-arrow-circle-o-up s20 mr5 pull-right"></i> 
        	                	@else
        	                		<i class="fa fa-circle s20 mr5 pull-right"></i> 
        	                	@endif
                        	</p>
                        </div>
                        <div class="progress animated-bar flat transparent progress-bar-xs mb10 mt0">
                            <div class="progress-bar progress-bar-white" role="progressbar" data-transitiongoal="86"></div>
                        </div>
                        <div class="comparison">
                        	<p class="mb0">
        	                	{{$data["num_topics"]}} overall topics
                        	</p>
                            
                        </div>
                    </div>
                </div>
            </div>
            <!-- End .panel -->
        </div>

        <!-- / .col-md-3 -->
        <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <!-- .col-md-3 -->
            <div class="panel panel-danger tile panelClose panelRefresh">
                <!-- Start .panel -->
                <div class="panel-heading">
                    <h4 class="panel-title">Total Teaching Plans</h4>
                </div>
                <div class="panel-body pt0">
                    <div class="progressbar-stats-1">
                        <div class="stats">
                            <i class="l-basic-life-buoy"></i> 
                            <div class="stats-number" data-from="0" data-to='{{$data["num_teachingplans"]}}'>{{$data["num_teachingplans_month"]}}</div>
                            <p class="mb0">
                            	new teaching plans
        	                    @if ($data["num_teachingplans_month"] != '0')
        	                		<i class="fa fa-arrow-circle-o-up s20 mr5 pull-right"></i>
        	                	@else
        	                		<i class="fa fa-circle s20 mr5 pull-right"></i> 
        	                	@endif
                            </p>
                        </div>
                        <div class="progress animated-bar flat transparent progress-bar-xs mb10 mt0">
                            <div class="progress-bar progress-bar-white" role="progressbar" data-transitiongoal="35"></div>
                        </div>
                        <div class="comparison">
                            <p class="mb0">
                            	{{$data["num_teachingplans"]}} overall teaching plans
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End .panel -->
        </div>


        <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
            <!-- .col-md-3 -->
            <div class="panel panel-default tile panelClose panelRefresh">
                <!-- Start .panel -->
                <div class="panel-heading">
                    <h4 class="panel-title">STEAM</h4>
                </div>
                <div class="panel-body pt0">
                    <div class="progressbar-stats-1 dark">
                        <div class="stats">
                            <i class="l-basic-book-pencil"></i> 
                            <div class="stats-number" data-from="0" data-to='{{$data["num_teachingplans"]}}'>{{$data["num_steam_month"]}}</div>
                            <p class="mb0">
                            	new teaching plans
        	                    @if ($data["num_steam_month"] != '0')
        	                		<i class="fa fa-arrow-circle-o-up s20 mr5 pull-right"></i>
        	                	@else
        	                		<i class="fa fa-circle s20 mr5 pull-right"></i> 
        	                	@endif
                            </p>
                        </div>
                        <div class="progress animated-bar flat transparent progress-bar-xs mb10 mt0">
                            <div class="progress-bar progress-bar-white" role="progressbar" data-transitiongoal="55"></div>
                        </div>
                        <div class="comparison">
                        	<p class="mb0">
                            	{{$data["num_steam"]}} overall STEAM connections
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End .panel -->
        </div>
    </div>
</div>

