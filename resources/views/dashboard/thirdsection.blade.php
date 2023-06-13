 <div class="col-lg-12 col-md-12"> 
    <div class="row">

        <h3 class="panel-heading"> Nodes-Subjects Statistic</h3>
    </div>
    <div class="row">
        <!-- col-lg-6 end here -->
        <div class="col-lg-6 col-md-12 sortable-layout">
            <div class="row">
                <div class="col-lg-12 col-md-6 col-sm-12">
                    <!-- PIE CHART -->
                    <div class="panel panel-default plain toggle panelMove panelClose panelRefresh">
                        <!-- Start .panel -->
                        <li id="pie_type" hidden="true">{{$data["subjects"]}}</li>
                        <li id="pie_type_value" hidden="true">{{$data["subjects_value"]}}</li>
                        <div class="panel-heading">
                            <h4 class="panel-title">Nodes in Subjects Pie Chart</h4>
                        </div>
                        <div class="panel-body">
                            <div id="pie-chart" style="width: 100%; height:200px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- col-lg-6 end here -->
        <div class="col-lg-6 col-md-12 sortable-layout">
            <div class="row">
                <!-- Cost BAR CHART -->
                <div class="panel panel-default plain toggle panelMove panelClose panelRefresh">
                    <!-- Start .panel -->
                    <div class="panel-heading">
                        <h4 class="panel-title">Nodes in Subjects Bar Chart </h4>
                    </div>
                    <div class="panel-body">
                        <li id="bar_items" hidden="true">{{$data["node_subject"]}}</li>
                        <li id="bar_values" hidden="true">{{$data["node_subject_value"]}}</li> 
                        <div class="canvas-holder">
                            <canvas id="bar-chartjs" height="125"></canvas>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>