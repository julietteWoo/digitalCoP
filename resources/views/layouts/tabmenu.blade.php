<?php
	// Common Tab button
	function simpleTab($tab,$tabsearch,$icon,$buttonText){
	?>
		<li class="{{ $tab   == $tabsearch ? 'active btn btn-default' : 'btn btn-default' }}" >
			<a href="?tab={{$tabsearch}}">
				<i class="{{$icon}}"></i> {{$buttonText}}
			</a>
		</li>
	<?php
	}

	// button to go back once
	function backButton(){
	?>
	<a onclick="history.go(-1)" class="btn btn-warning col-xs-1" >
		<i class="fa fa-arrow-left"></i> {{ 'Back'  }}
	</a>
	<?php	
	}

	// navigation button with Session
	function simpleSessionButton($session,$url,$icon,$buttonText){
	?>
	<li class="{{ Session::get('sub-navigation')   == $session ? 'active btn btn-default' : 'btn btn-default' }}" >
			<a href="{{$url}}">
				<i class="{{$icon}}"></i> {{$buttonText}}
			</a>
		</li>
	<?php	
	}

	// navigation button with Session2
	function simpleSession2Button($session,$url,$icon,$buttonText){
	?>
	<li class="{{ Session::get('sub2-navigation')   == $session ? 'active btn btn-default' : 'btn btn-default' }}" >
			<a href="{{$url}}">
				<i class="{{$icon}}"></i> {{$buttonText}}
			</a>
		</li>
	<?php	
	}
?>