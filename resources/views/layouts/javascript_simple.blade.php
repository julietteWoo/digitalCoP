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
		
		
        <!-- Other plugins ( load only nessesary plugins for every page) -->
		<!-- =========================================================== -->
        <script src="{{ URL::asset('assets/plugins/forms/fancyselect/fancySelect.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/select2/select2.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/validation/jquery.validate.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/dual-list-box/jquery.bootstrap-duallistbox.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/validation/additional-methods.min.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/bootstrap-tagsinput/bootstrap-tagsinput.js') }}"></script>
        <script src="{{ URL::asset('assets/js/libs/typeahead.bundle.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/summernote/summernote.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/bootstrap-markdown/bootstrap-markdown.js') }}"></script>
        <script src="{{ URL::asset('assets/plugins/forms/dropzone/dropzone.js') }}"></script>
    

        <script src="{{ URL::asset('assets/js/jquery.dynamic.js') }}"></script>
        <script src="{{ URL::asset('assets/js/main.js') }}"></script>

<script>
    $('div.alert').not('.alert-important').delay(8000).slideUp(300);
</script>