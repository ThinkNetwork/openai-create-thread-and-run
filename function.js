window.function = async function(
    api_key, assistant_id, thread_messages, include, model, instructions, additional_instructions, additional_messages, 
    tools, metadata, temperature, top_p, stream, max_prompt_tokens, max_completion_tokens, truncation_strategy, 
    tool_choice, parallel_tool_calls, response_format
) {
    // Validate API Key
    if (!api_key.value) {
        return "Error: OpenAI API Key is required.";
    }

    // Validate Assistant ID
    if (!assistant_id.value) {
        return "Error: Assistant ID is required.";
    }

    // Parse JSON values if provided
    const parseJson = (input) => {
        if (!input || !input.value) return undefined;
        try {
            return JSON.parse(input.value);
        } catch (e) {
            return `Error: Invalid JSON format for ${input.name}`;
        }
    };

    const metadataValue = parseJson(metadata);
    const truncationStrategyValue = parseJson(truncation_strategy);
    const additionalMessagesValue = parseJson(additional_messages);
    const toolsValue = parseJson(tools);
    const responseFormatValue = parseJson(response_format);
    const threadMessagesValue = parseJson(thread_messages);

    // Construct request payload
    const payload = {
        assistant_id: assistant_id.value,
        thread: {}
    };

    if (threadMessagesValue) payload.thread.messages = threadMessagesValue;
    if (model.value) payload.model = model.value;
    if (instructions.value) payload.instructions = instructions.value;
    if (additional_instructions.value) payload.additional_instructions = additional_instructions.value;
    if (additionalMessagesValue) payload.additional_messages = additionalMessagesValue;
    if (toolsValue) payload.tools = toolsValue;
    if (metadataValue) payload.metadata = metadataValue;
    if (temperature.value !== undefined) payload.temperature = parseFloat(temperature.value);
    if (top_p.value !== undefined) payload.top_p = parseFloat(top_p.value);
    if (stream.value !== undefined) payload.stream = stream.value.toLowerCase() === "true";
    if (max_prompt_tokens.value !== undefined) payload.max_prompt_tokens = parseInt(max_prompt_tokens.value);
    if (max_completion_tokens.value !== undefined) payload.max_completion_tokens = parseInt(max_completion_tokens.value);
    if (truncationStrategyValue) payload.truncation_strategy = truncationStrategyValue;
    if (tool_choice.value) payload.tool_choice = tool_choice.value;
    if (parallel_tool_calls.value !== undefined) payload.parallel_tool_calls = parallel_tool_calls.value.toLowerCase() === "true";
    if (responseFormatValue) payload.response_format = responseFormatValue;

    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (include.value) queryParams.append("include[]", include.value);

    // API endpoint URL
    const apiUrl = `https://api.openai.com/v1/threads/runs?${queryParams.toString()}`;

    // Make API request
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${api_key.value}`,
                "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`;
        }

        // Parse and return response
        const responseData = await response.json();
        return JSON.stringify(responseData, null, 2);

    } catch (error) {
        return `Error: Request failed - ${error.message}`;
    }
};
