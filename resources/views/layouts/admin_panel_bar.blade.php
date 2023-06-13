<div class="btn-group">
	@if($folder == "admin")
		<a class="btn btn-default active" href='/adminmanagement'>Topics</a>
	@else
		<a class="btn btn-default" href='/adminmanagement'>Topics</a>
	@endif	
	@if($folder == "admin_reply")
		<a class="btn btn-default active" href='/adminreplymanagement'>Replies</a>
	@else
		<a class="btn btn-default" href='/adminreplymanagement'>Replies</a>
	@endif
</div>