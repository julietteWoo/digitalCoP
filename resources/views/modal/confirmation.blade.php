<?php
// template function for modal confirmation
function modalConfirmation($id,$heading, $body,$buttonType,$unit){
    ?>
<div class="modal fade" id="{{$id}}" tabindex="-1" role="dialog" aria-labelledby="logoutLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title" id="myModalLabel">{{$heading}}</h4>
            </div>

            <div class="modal-body">
                {!! Form::hidden('type', $unit) !!}
                <?php

                    echo nl2br($body);

                ?>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-default col-xs-5" data-dismiss="modal">Cancel</button>
                {!! Form::button('<i class="fa fa-send"></i> Confirm', ['class' => 'btn btn-'. $buttonType .' col-xs-5', 'type'=>'submit']) !!}
            </div>
        </div>
    </div>
</div>
<?php
}
?>

<?php
// function for predefined confirmation modal for event deletion
function modalConfirmationDeleteActivity($event, $unit, $controllerFunction, $bodyMessage)
    {
        ?>
        {!! Form::model($event, ['method' => 'DELETE', 'action' => [$controllerFunction, $event->id]]) !!}

        <?php
        $id = 'confirmation_' . $event->id;

        $heading = $event->name . " - Deletion Confirmation";
        
        $body = $bodyMessage;

        $buttonType = "danger";
        modalConfirmation($id,$heading,$body,$buttonType,$unit);
        ?>
        {!! Form::close() !!}
        <?php
    }
?>