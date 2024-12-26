const API_URL = 'http://localhost:6500/api'; // adjust to match your backend URL

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials, accountType) => {
  try {
    // Use different endpoints for users and agents
    const endpoint = accountType === 'agent' 
      ? `${API_URL}/agents/login`
      : `${API_URL}/users/login`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // For agents, store credentials and redirect
    if (accountType === 'agent') {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify({
        ...data.data.agent,
        type: 'agent'
      }));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};