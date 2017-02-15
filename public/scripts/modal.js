const myConfirm = (message, okButtonClass, callback) => {
  const template = $(`
    <div id="my-modal" class="modal-body">
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
    $("#my-modal").remove();
  });

  template.find("#btn-ok").click(() => {
    callback(true)
    $("#my-modal").remove();
  });

  template.find("#modal-close").click(() => {
    $("#my-modal").remove();
  })

  $("body").append(template)
}
