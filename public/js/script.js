// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict"

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Automatically hide flash messages after 3 seconds
document.addEventListener("DOMContentLoaded", () => {
  const flashMessages = document.querySelectorAll(".flash-message");

  flashMessages.forEach((message) => {
    setTimeout(() => {
      message.classList.remove("show");

      setTimeout(() => {
        message.remove();
      }, 500);
    }, 3000);
  });
});