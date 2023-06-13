<!-- Javascripts -->

       <!-- Load pace first -->
        <script src="{{ URL::asset('assets/plugins/core/pace/pace.min.js') }}"></script>
        <!-- Important javascript libs(put in all pages) -->
        <script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
        <script>
        window.jQuery || document.write('<script src="{{ URL::asset('assets/js/libs/jquery-2.1.1.min.js') }}">\x3C/script>')
        </script>
        <script src="http://code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
        <script>
        window.jQuery || document.write('<script src="{{ URL::asset('assets/js/libs/jquery-ui-1.10.4.min.js') }}">\x3C/script>')
        </script>
        <!-- Bootstrap plugins -->
        <script src="{{ URL::asset('assets/js/bootstrap/bootstrap.js') }}"></script>
        <!-- Core plugins ( not remove ) -->
        <script src="{{ URL::asset('assets/js/libs/modernizr.custom.js') }}"></script>
        <!-- Handle responsive view functions -->
        <script src="{{ URL::asset('assets/js/jRespond.min.js') }}"></script>
        <!-- Custom scroll for sidebars,tables and etc. -->
        <script src="{{ URL::asset('assets/plugins/core/slimscroll/jquery.slimscroll.min.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/core/slimscroll/jquery.slimscroll.horizontal.min.js') }}"></script>
        <!-- Remove click delay in touch -->
        <script src="{{ URL::asset('assets/plugins/core/fastclick/fastclick.js') }}"></script>
        <!-- Increase jquery animation speed -->
        <script src="{{ URL::asset('assets/plugins/core/velocity/jquery.velocity.min.js') }}"></script>
        <!-- Quick search plugin (fast search for many widgets) -->
        <script src="{{ URL::asset('assets/plugins/core/quicksearch/jquery.quicksearch.js') }}"></script>
        <!-- Bootbox fast bootstrap modals -->
        <script src="{{ URL::asset('assets/plugins/ui/bootbox/bootbox.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/charts/sparklines/jquery.sparkline.js') }}"></script>
        <script src="{{ URL::asset('assets/js/jquery.dynamic.js') }}"></script>
        <script src="{{ URL::asset('assets/js/main.js') }}"></script>

		
		@if($heading  != 'Dashboard')
                <!-- Other plugins ( load only nessesary plugins for every page) -->
        		<!-- =========================================================== -->
                <script src="{{ URL::asset('assets/plugins/forms/fancyselect/fancySelect.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/select2/select2.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/maskedinput/jquery.maskedinput.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/dual-list-box/jquery.bootstrap-duallistbox.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/spinner/jquery.bootstrap-touchspin.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/bootstrap-datepicker/bootstrap-datepicker.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/bootstrap-timepicker/bootstrap-timepicker.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/bootstrap-colorpicker/bootstrap-colorpicker.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/bootstrap-tagsinput/bootstrap-tagsinput.js') }}"></script>
                <script src="{{ URL::asset('assets/js/libs/typeahead.bundle.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/summernote/summernote.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/bootstrap-markdown/bootstrap-markdown.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/forms/dropzone/dropzone.js') }}"></script>
                
                <!-- tables -->
                <script src="{{ URL::asset('assets/plugins/tables/datatables/jquery.dataTables.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/tables/datatables/dataTables.tableTools.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/tables/datatables/dataTables.bootstrap.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/tables/datatables/dataTables.responsive.js') }}"></script>

                <script src="{{ URL::asset('assets/js/libs/moment.min.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/ui/calendar/fullcalendar.js') }}"></script>
        		
                <!-- Pages -->
                <script src="{{ URL::asset('assets/js/pages/tables-data.js') }}"></script>
                <script src="{{ URL::asset('assets/js/pages/forms-advanced.js') }}"></script>
                <!-- Others -->
        		<script src="{{ URL::asset('assets/js/libs/jquery.bootstrap-duallistbox.js') }}"></script>
                <script src="{{ URL::asset('assets/plugins/ui/bootstrap-slider/bootstrap-slider.js') }}"></script>
                <script src="{{ URL::asset('assets/js/pages/sliders.js') }}"></script>

                
                
                <!-- JS for Angular-->
                <script src="js/angular/angular.js"></script>
                <script src="js/angular/angular-resource.js"></script>
                <script src="js/angular/angular-route.js"></script>
                <!-- load angular -->

                <script src="js/ui-bootstrap-tpls-0.10.0.min.js" type="text/javascript"></script>

                <!-- ANGULAR -->

                <!-- all angular resources will be loaded from the /public folder -->
                @if($heading  == 'Forum')
                    <script src="js/controllers/mainCtrl.js"></script> <!-- load our controller -->
                @elseif($heading  == 'Public Discussion')
                    <script src="js/controllers/dcopDiscussionControllers.js"></script> <!-- load our controller -->
                @elseif($heading  == 'Get Ideas')
                    <script src="js/controllers/dcopNodeControllers.js"></script> <!-- load our controller -->
                @elseif($heading  == 'Teaching Plan')
                    <script src="js/controllers/dcopTPControllers.js"></script> <!-- load our controller -->
                @elseif($heading  == 'Timesheet')
                    <script src="js/controllers/dcopTSControllers.js"></script> <!-- load our controller -->
                @endif
               
                @if($heading  != 'Profile')
                    <script src="js/services/dcopServices.js"></script> <!-- load our service -->
                 
                    <script src="js/app.js"></script>
                     <!-- load our application -->

                    <script src="js/angular/textAngular-1.5.16/dist/textAngular-rangy.min.js"></script>
                    <script src="js/angular/textAngular-1.5.16/dist/textAngular-sanitize.min.js"></script>
                    <script src="js/angular/textAngular-1.5.16/dist/textAngular.min.js"></script>
                @endif

                
                @if($heading  == 'Get Ideas')
                    <script src="{{ URL::asset('assets/js/libs/highcharts.js') }}"></script>
                    <script src="{{ URL::asset('assets/js/libs/networkgraph.js') }}"></script>
                @endif
		@else

			<!-- Charts -->
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.custom.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.pie.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.resize.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.time.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.growraf.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.categories.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.stack.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.orderBars.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.tooltip.min.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/flot/jquery.flot.curvedLines.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/chartjs/Chart.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/pie-chart/jquery.easy-pie-chart.js') }}"></script>
			<script src="{{ URL::asset('assets/plugins/charts/progressbars/progressbar.js') }}"></script>
            <!--dounoutcharts -->
            <script src="{{ URL::asset('assets/js/libs/raphael.js')}}"></script>
            <script src="{{ URL::asset('assets/plugins/charts/morris/morris.js')}}"></script>

            <!--custmised settings -->
            <script src="{{ URL::asset('assets/js/pages/charts-chartjs.js') }}"></script>
		@endif

        @if(Auth::user()->id!=0 && Auth::user()->type!='community')
            <script type="text/javascript">
                  var notificationsWrapper   = $('.dropdown-notifications');
                  var notificationsToggle    = notificationsWrapper.find('a[data-toggle]');
                  var notificationsCountElem = notificationsToggle.find('i[data-count]');
                  var notificationsCount     = parseInt(notificationsCountElem.data('count'));
                  var notifications          = notificationsWrapper.find('ul.dropdown-menu');

                  // if (notificationsCount <= 0) {
                  //   notificationsWrapper.hide();
                  // }

                  // Enable pusher logging - don't include this in production
                  // Pusher.logToConsole = true;

                  //var pusher = new Pusher('68d6253126b511394fd6', {
                    //encrypted: true
                  //  cluster: 'ap4'
                  //});

                  // Subscribe to the channel we specified in our Laravel Event
                  //var channel = pusher.subscribe('New Update');

                  // Bind a function to a Event (the full Laravel class)
                  //channel.bind('App\\Events\\NewUpdate', function(data) {
                    // var existingNotifications = notifications.html();
                    // var avatar = Math.floor(Math.random() * (71 - 20 + 1)) + 20;
                    // var newNotificationHtml = `
                    //   <li class="notification active">
                    //       <div class="media">
                    //         <div class="media-left">
                    //           <div class="media-object">
                    //             <img src="https://api.adorable.io/avatars/71/`+avatar+`.png" class="img-circle" alt="50x50" style="width: 50px; height: 50px;">
                    //           </div>
                    //         </div>
                    //         <div class="media-body">
                    //           <strong class="notification-title">`+data.message+`</strong>
                    //           <!--p class="notification-desc">Extra description can go here</p-->
                    //           <div class="notification-meta">
                    //             <small class="timestamp">about a minute ago</small>
                    //           </div>
                    //         </div>
                    //       </div>
                    //   </li>
                    // `;
                    // notifications.html(newNotificationHtml + existingNotifications);

                    // notificationsCount += 1;
                    // notificationsCountElem.attr('data-count', notificationsCount);
                    // notificationsWrapper.find('.notif-count').text(notificationsCount);
                    // notificationsWrapper.show();
                  //  alert(JSON.stringify(data));
                  //});
                </script>
        @endif

<script>
    $('div.alert').not('.alert-important').delay(8000).slideUp(300);
</script>