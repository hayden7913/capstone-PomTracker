const myConfirm = (message, okButtonClass, callback) => {
  const template = $(`
    <div id="myModal" class="modal-body">
      <div class="modal-content">
         <span id="modal-close">&times;</span>
          <div id="modal-message">${message}</div>
          <div id="button-wrapper">
            <button id="btn-cancel" class="modal-btn">Cancel</button>
            <button id="btn-ok" class="${okButtonClass} modal-btn">Okay</button>
          </div>
      </div>
    </div>`);


  template.find("#btn-cancel").click(() => {
    callback(false);
    $("#myModal").remove();
  });

  template.find("#btn-ok").click(() => {
    callback(true);
    $("#myModal").remove();
  });

  $("body").on('keyup', function(event){

    if(event.keyCode == 13){
      callback(true);
      $("#myModal").remove();
      $("body").off()
    }
  });

  template.find("#modal-close").click(() => {
    $("#myModal").remove();
  });

  $("body").append(template);
}
