@if(Auth::user()->type != 'community')
	{{openFrame()}}

	  		<div ng-view></div>

	{{closeFrame()}}
@endif
