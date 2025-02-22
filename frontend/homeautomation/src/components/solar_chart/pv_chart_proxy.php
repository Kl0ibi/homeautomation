<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin");

$baseUrl = "http://kloibi.ddns.net:58000/day/pv";

if (!empty($_GET['date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['date'])) {
    $date = urlencode($_GET['date']);
    $apiUrl = "$baseUrl/$date";
} else {
    $apiUrl = $baseUrl;
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Timeout in seconds

// Execute cURL request and get the response
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $error_msg]);
    exit;
}

// Get the HTTP status code
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Close cURL session
curl_close($ch);

// Check if the response is successful
if ($httpCode == 200) {
    // Decode the JSON response
    $data = json_decode($response, true);

    // Check if the JSON decoding was successful
    if (json_last_error() === JSON_ERROR_NONE) {
        // Set the content type to JSON
        header('Content-Type: application/json');

        // Output the JSON data
        echo json_encode($data);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid JSON response from API']);
    }
} else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API request failed with HTTP code ' . $httpCode]);
}
?>
