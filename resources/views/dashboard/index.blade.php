@if(Auth::user()->type != 'community')	

	{{openFrame()}}

	<!-- top Overall statistic section -->
	@include('dashboard.topbar')

	<!-- middle section Subject contribute to nodes statistic section -->
	@include('dashboard.middlesection')

	<!-- third section Nodes-Subject statistic to nodes statistic section -->
	@include('dashboard.thirdsection')

	<!-- third section •    What’s hot list to nodes statistic section -->
	@include('dashboard.fourthsection')

	{{closeFrame()}}

@endif