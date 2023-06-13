<!doctype html>
	@if($heading  == 'Dashboard')
		<html >
	@elseif($heading  == 'Forum')
		<html class="no-js" lang="en" ng-app="dcopApp" id="ng-app">
	@elseif($heading  == 'Get Ideas')
		<html class="no-js" lang="en" ng-app="dcopNodeApp" id="ng-app">
	@elseif($heading  == 'Teaching Plan')
		<html class="no-js" lang="en" ng-app="dcopTPApp" id="ng-app">
	@elseif($heading  == 'Public Discussion')
		<html class="no-js" lang="en" ng-app="dcopDiscussionApp" id="ng-app">
	@elseif($heading  == 'Timesheet')
		<html class="no-js" lang="en" ng-app="dcopTSApp" id="ng-app">	
	@endif
	
    
	<!-- header -->
	@include('layouts.header')
   
    <body>
    	<!-- modal -->
    	@include('modal.confirmation')

        <!-- page-top-nav -->
        @include('layouts.topnavigation')

	    @if(Auth::user()==null || Auth::user()->type == 'community')
    		<div id="wrapper">
    			<div id="page-header" class="clearfix">
			        <div class="custom-header" style = "margin-top: 60px; text-align: center">
    					<h2>Page Does Not Exist</h2>
    				</div>
    			</div>
    		</div>
    	@else
	        <!-- #wrapper -->
	        <div id="wrapper">
	        	<!-- page-sidebar -->
				@include('layouts.mainnavigation') 


				<!-- .page-content --> 
			    <!--<div class="page-content sidebar-page right-sidebar-page clearfix">-->
			    <div class="page-content sidebar-page clearfix">
			        <!-- .page-content-wrapper -->
			        <div class="page-content-wrapper">
			            <div class="page-content-inner">
				                

			                <!-- .page-content-top -->
			                <div id="page-header" class="clearfix">
			                    <div class="page-header custom-header">
			                        <h2>{{ $heading }}</h2>
			                      	<span class="txt">Digital Solution for Collaboration</span>
			                    </div>
			                    <!-- col-lg-4 end here -->
			                </div>

			                {{-- Error Handling and Flash messages --}}
	    					@include('partials._flash')
	    					@include('errors.list')

			                {{-- CRUD Section View --}}
			                @include('layouts.tabmenu')
			                @include($folder.'.'.$view)
				              
			              	<!-- extra blank lines to cater collapsed footer -->
			              	<br/>
			              	<br/>
			              	<br/>

				                
				            <!-- End .row -->
				        </div>
				            <!-- / .page-content-inner -->
				    </div>
			        <!-- / page-content-wrapper -->
			    </div>
			    <!-- / page-content -->
			</div>

			<!-- Footer  -->
	        @include('layouts.footer')

	        <!-- Back to top -->
	        <div id="back-to-top"><a href="#">Back to Top</a></div>
	        
	        <!-- Javascripts -->
	        @include('layouts.javascript')

	    @endif

    </body>
</html>

<?php
function openFrame(){
?>
<div class="row">
<div class="col-lg-12">
<div class="panel panel-primary panelMove toggle">
<div class="panel-body">  
<?php
}
?>

<?php
function closeFrame(){
?>
</div>
</div>
</div>
</div>
<?php
}
?>

<?php
function openTable(){
?>
<table id="basic-datatables" class="table table-striped table-bordered dataTable" cellspacing="0" width="100%" tole="grid" aroa-describedby="basic-datatables_info" style="width:100%">
<?php
}
?>

<?php
function closeTable(){
?>
</table>
<?php
}
?>