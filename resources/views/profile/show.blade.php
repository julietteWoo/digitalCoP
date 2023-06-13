{{openFrame()}}
	<div class="row">
		<div class="col-lo-6 col-md-6 col-sm-12">
			<!-- user details section -->
			@include('profile.basic_info')

			@include('profile.teaching_plan_subject_stats')

			@include('profile.public_board')

		</div>
		<div class="col-lo-6 col-md-6 col-sm-12">
			<!-- user teaching plan section -->
			@include('profile.teaching_plan_list')

			<!-- user input topic section -->
			@include('profile.topic_list')

		</div>
	</div>

{{closeFrame()}}

