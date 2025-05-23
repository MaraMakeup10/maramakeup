<?php
// Conexión a la base de datos
$conexion = new mysqli("localhost", "root", "", "mara makeup");

// Verificar conexión
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Recoger datos del formulario
$nombre = $_POST['nombreRegistro'];
$correo = $_POST['emailRegistro'];
$contraseña = $_POST['passRegistro'];
$confirmar = $_POST['confirmPassRegistro'];

// Validar que las contraseñas coincidan
if ($contraseña !== $confirmar) {
    echo "Las contraseñas no coinciden.";
    exit;
}

// Encriptar la contraseña
$contraseña_hash = password_hash($contraseña, PASSWORD_DEFAULT);

// Validar que el correo no exista
$consulta = "SELECT * FROM clientes WHERE correo = '$correo'";
$resultado = $conexion->query($consulta);
if ($resultado->num_rows > 0) {
    echo "El correo ya está registrado.";
    exit;
}

// Insertar cliente
$sql = "INSERT INTO clientes (nombre, correo) VALUES ('$nombre', '$correo')";
if ($conexion->query($sql) === TRUE) {
    echo "Registro exitoso.";
} else {
    echo "Error: " . $conexion->error;
}

$conexion->close();
?>
