
1. http://127.0.0.1:8000/list-apps
type: get

output: [
    "multi_tool_agent",
    "vertexagent"
]
it helpt to check the api is working or not 

2. http://127.0.0.1:8000/apps/multi_tool_agent/users/ck/sessions/sess127

type: post

purpose: to create a new session for the user "ck" in the "multi_tool_agent" app with session id "sess127"
output: 

{
    "id": "sess127",
    "appName": "multi_tool_agent",
    "userId": "ck",
    "state": {},
    "events": [],
    "lastUpdateTime": 1755337118.98228
}
3. http://127.0.0.1:8000/apps/multi_tool_agent/users/ck/sessions/sess127

type: get

purpose: to retrieve the session information for the user "ck" in the "multi_tool_agent" app with session id "sess127" . help to check session is created or not 
output: 

{
    "id": "sess127",
    "appName": "multi_tool_agent",
    "userId": "ck",
    "state": {},
    "events": [],
    "lastUpdateTime": 1755337118.98228
}

4. http://127.0.0.1:8000/run

type: post

json body: 
{
  "app_name": "multi_tool_agent",
  "user_id": "ck",
  "session_id": "sess127",
  "new_message": {
    "role": "user",
    "parts": [
      {"text": "i want to lunch a product , it's a jar of healthy fruits"}
    ]
  },
  "streaming": false
}

output:

[
    {
        "content": {
            "parts": [
                {
                    "text": "Okay, a jar of healthy fruits! To give you the most useful SWOT analysis, I need a little more information. Could you tell me more about this product? For example:\n\n*   **What specific fruits** are included in the jar?\n*   **Who is your target market?** (e.g., health-conscious individuals, busy professionals, children, etc.)\n*   **What is unique about your product?** (e.g., organic, locally sourced, special blend, specific health benefits)\n*   **What is your pricing strategy?** (e.g., premium, competitive, budget-friendly)\n*   **How will you distribute your product?** (e.g., online, retail stores, farmers' markets)\n*   **Are there any similar products already on the market?**\n\nOnce I have a clearer picture, I can perform a targeted SWOT analysis.\n"
                }
            ],
            "role": "model"
        },
        "groundingMetadata": {},
        "usageMetadata": {
            "candidatesTokenCount": 189,
            "candidatesTokensDetails": [
                {
                    "modality": "TEXT",
                    "tokenCount": 189
                }
            ],
            "promptTokenCount": 241,
            "promptTokensDetails": [
                {
                    "modality": "TEXT",
                    "tokenCount": 241
                }
            ],
            "totalTokenCount": 430,
            "trafficType": "ON_DEMAND"
        },
        "invocationId": "e-98ee4dae-4ff2-4555-80d8-6944979ff9d4",
        "author": "multi_tool_agent",
        "actions": {
            "stateDelta": {},
            "artifactDelta": {},
            "requestedAuthConfigs": {}
        },
        "id": "ZPYp2W8I",
        "timestamp": 1755337288.820232
    }
]