
export const useLyzrAPI = () => {
  const callLyzrAPI = async (userInput: string) => {
    console.log('Calling Lyzr API with input:', userInput);
    
    const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-default-7UtAJqDCIh2oHWoqNpnvKAfmZKZBkT4G'
      },
      body: JSON.stringify({
        user_id: "user_health_assistant",
        agent_id: "683bd57b3b7c57f1745ce939",
        session_id: `session_${Date.now()}`,
        message: userInput
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lyzr API response:', data);
    
    if (data && data.response) {
      return data.response;
    } else {
      throw new Error('No response found in API response');
    }
  };

  return { callLyzrAPI };
};
