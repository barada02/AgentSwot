import requests

# Endpoint URL of your local FastAPI server
url = "http://127.0.0.1:8000/call-agent"

# The payload (query you want to send to the agent)
payload = {
    "query": "what is the symptoms of covid-19",
}

# Send POST request
response = requests.post(url, json=payload)

# Print the response from the agent
if response.status_code == 200:
    print("Agent Response:", response.json()["response"])
else:
    print("Error:", response.status_code, response.text)
