 <div class="col-lg-12 col-md-12"> 
    <div class="row">
        <h3 class="panel-heading"> Teaching Plans - Subjects Statistic</h3>
    </div>
    <div class="row">
        <!-- col-lg-12 end here -->
        <div class="col-lg-12 col-md-12 sortable-layout">

            <!--overall data-->
            <div class="panel panel-default toggle panelMove panelClose panelRefresh">
                <!-- Start .panel -->
                <div class="panel-body">
                    <div class="col-lg-4 col-md-12 sortable-layout">
                        <h4 class="panel-title">S-T-E-A-M</h4>
            
                        <li id="dounut_items" hidden="true">{{$data["overall"]}}</li>
                        <li id="dounut_items_value" hidden="true">{{$data["overall_value"]}}</li>
                        <div id="morris-donut" style="width: 100%; height:250px;"></div>
                    </div>

                    <!--ARTS data-->
                    <div class="col-lg-4 col-md-12 sortable-layout">
                        <h4 class="panel-title">Arts Subjects</h4>
                        
                        <li id="dounut_arts" hidden="true">{{$data["arts"]}}</li>
                        <li id="dounut_arts_value" hidden="true">{{$data["arts_value"]}}</li>
                        <div id="morris-donut-arts" style="width: 100%; height:250px;"></div>
                    </div>

                    <!--STEM data-->
                    <div class="col-lg-4 col-md-12 sortable-layout">
                        <h4 class="panel-title">STEM Subjects</h4>
           
                        <li id="dounut_stem" hidden="true">{{$data["stem"]}}</li>
                        <li id="dounut_stem_value" hidden="true">{{$data["stem_value"]}}</li>
                        <div id="morris-donut-stem" style="width: 100%; height:250px;"></div>
                    </div>
                </div>
            </div>
        <!-- col-lg-12 end here -->   
        </div>
    </div>
</div>