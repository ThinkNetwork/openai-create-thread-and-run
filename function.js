window.function = async function(api_key, endpoint, body, json) {
  // GET VALUES FROM INPUTS, WITH DEFAULT VALUES WHERE APPLICABLE
  const apiKey = api_key.value ?? "";
  const endpointValue = endpoint.value ?? "";
  const bodyValue = body.value ?? "";
  const jsonValue = json.value ?? "";

  // INPUT VALIDATION
  if (!apiKey) {
    return "Error: API Key is required.";
  }
  if (!endpointValue) {
    return "Error: API Endpoint is required.";
  }
  if (!bodyValue) {
    return "Error: The Body (JSON) is required.";
  }

  // INITIALIZE VARIABLE FOR BODY JSON MESSAGE
  let bodyMessage = "";

  if (bodyValue) {
    // TRY TO PARSE THE JSON TO SEE IF IT'S VALID
    try {
      const parsedBodyJson = JSON.parse(bodyValue);

      // CHECK IF Body JSON IS EMPTY
      if (Object.keys(parsedBodyJson).length === 0) {
        return "Error: Invalid Body JSON Schema - Schema is empty.";
      }
    } catch (e) {
      return "Error: Invalid Body JSON Schema";
    }

    // CREATE THE JSON MESSAGE
    bodyMessage = `You must format your input as a JSON value. Your input will be parsed and type-checked according to the provided schema, so make sure all fields in your input match the schema exactly and there are no trailing commas! Do not, under any circumstances, include markdown or a markdown code-block in your response. Your response should be raw JSON only, with nothing else added.\n\nHere is the JSON Schema your input must adhere to:\n\n${bodyValue}`;
  }

  // INITIALIZE VARIABLE FOR JSON MESSAGE
  let jsonMessage = "";

  if (jsonValue) {
    // TRY TO PARSE THE JSON TO SEE IF IT'S VALID
    try {
      const parsedJson = JSON.parse(jsonValue);

      // CHECK IF JSON IS EMPTY
      if (Object.keys(parsedJson).length === 0) {
        return "Error: Invalid JSON Schema - Schema is empty.";
      }
    } catch (e) {
      return "Error: Invalid JSON Schema";
    }

    // CREATE THE JSON MESSAGE
    jsonMessage = `You must format your output as a JSON value. Your output will be parsed and type-checked according to the provided schema, so make sure all fields in your output match the schema exactly and there are no trailing commas! Do not, under any circumstances, include markdown or a markdown code-block in your response. Your response should be raw JSON only, with nothing else added.\n\nHere is the JSON Schema your output must adhere to:\n\n${jsonValue}`;
  }

  //let payload = bodyValue;

  // PERFORM POST REQUEST TO OPENAI
  try {
    const response = await fetch(endpointValue, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: bodyValue //JSON.stringify(payload)
    });

    // IF THERE'S AN ERROR, RETURN THE ERROR MESSAGE
    if (!response.ok) {
      let errorMessage = `Error ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch (e) {
        errorMessage += ": Unable to parse error details.";
      }
      return errorMessage;
    }

    // ELSE, PARSE THE RESPONSE
    let data;
    try {
      data = await response.json();
    } catch (e) {
      return "Error: Failed to parse API response.";
    }

    // SAFELY ACCESS ASSISTANT'S MESSAGE
    if (data.id && data.id.length > 0) {
      const assistantMessage = data.id;
      // RETURN THE ASSISTANT MESSAGE
      return assistantMessage;
    } else {
      return "Error: Received an invalid response from the API.";
    }

  } catch (error) {
    // CATCH ANY ERRORS THAT OCCUR WHILE FETCHING THE RESPONSE
    return `Error: Request failed - ${error.message}`;
  }
};
