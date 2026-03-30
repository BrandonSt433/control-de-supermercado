import Swal from "sweetalert2";import "sweetalert2/dist/sweetalert2.min.css";

const baseConfig = {
  showClass: {
    popup: "swal2-show",  
  },
  hideClass: {
    popup: "swal2-hide",
  },
  timerProgressBar: true,
};


const Toast = Swal.mixin({
  ...baseConfig,
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
});


export const showSuccess = (title, text) =>
  Toast.fire({
    icon: "success",
    title,
    text,
  });


export const showError = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text,
    confirmButtonText: "Aceptar",
  });


export const showWarning = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text,
    confirmButtonText: "Entendido",
  });


export const confirmDelete = (title, text) =>
  Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });
