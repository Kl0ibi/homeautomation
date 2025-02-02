<?php
// Function to fetch data from the provided URL using cURL
function fetchData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

// URLs to fetch data from
$values_url = "http://kloibi.ddns.net:55000/values";
$energy_url = "http://kloibi.ddns.net:58000/energy/sum";

// Perform the two fetches
$values_response = fetchData($values_url);
$energy_response = fetchData($energy_url);

// Decode the responses as JSON
$values_json = json_decode($values_response, true);
$energy_json = json_decode($energy_response, true);

// Combine the results into one response
$response_data = [
    'values' => $values_json,
    'energy' => $energy_json,
];

// Set the response as JSON
header('Content-Type: application/json');
echo json_encode($response_data);
?>
