<?php
header('Content-Type: application/json');
// Simula que recibes los datos
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (isset($data['items']) && count($data['items']) > 0) {
    $simulated_init_point = "https://mpago.li/1uK8W1q"; 
    echo json_encode(['init_point' => $simulated_init_point]);
} else {
    http_response_code(400); // Bad request
    echo json_encode(['message' => 'No se recibieron items para procesar desde el script PHP.']);
}
?>