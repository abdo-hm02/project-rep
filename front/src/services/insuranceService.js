const API_URL = 'http://localhost:6500/api';

export const insuranceService = {

  
  // Get all pending insurance requests
  async getPendingInsurances() {
    try {
      const response = await fetch(`${API_URL}/insurance/pending`);
      if (!response.ok) throw new Error('Failed to fetch pending insurances');
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending insurances:', error);
      throw error;
    }
  },

  // Get all insurances with status filter
  async getInsurancesByStatus(status) {
    try {
      const response = await fetch(`${API_URL}/insurance/status/${status}`);
      if (!response.ok) throw new Error('Failed to fetch insurances');
      return await response.json();
    } catch (error) {
      console.error('Error fetching insurances:', error);
      throw error;
    }
  },

  // Update insurance status
  async updateInsuranceStatus(insuranceId, status, attestationFile = null) {
    try {
      const formData = new FormData();
      formData.append('status', status);
     
      if (status === 'approved' && attestationFile) {
        formData.append('attestation', attestationFile);
      }
      
      const response = await fetch(`${API_URL}/insurance/${insuranceId}/status`, {
        method: 'PATCH',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  async getAllInsurances() {
    try {
      const response = await fetch(`${API_URL}/insurance/all`);
      if (!response.ok) throw new Error('Failed to fetch insurances');
      return await response.json();
    } catch (error) {
      console.error('Error fetching insurances:', error);
      throw error;
    }
  },

  // Get insurance documents
  async getInsuranceDocuments(insuranceId) {
    try {
      const response = await fetch(`${API_URL}/insurance/${insuranceId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch insurance documents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching insurance documents:', error);
      throw error;
    }
  },

  // Download attestation
  async downloadAttestation(insuranceId) {
    try {
      const response = await fetch(`${API_URL}/insurance/${insuranceId}/attestation`);
      if (!response.ok) throw new Error('Failed to download attestation');
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading attestation:', error);
      throw error;
    }
  },

  async getDocument(mongoId) {
    try {
      const response = await fetch(`${API_URL}/insurance/documents/serve/${mongoId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      return response;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  async createRefund(paymentIntentId) {
    try {
        const response = await fetch(`${API_URL}/insurance/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentIntentId })
        });
        if (!response.ok) throw new Error('Refund creation failed');
        return await response.json();
    } catch (error) {
        console.error('Refund error:', error);
        throw error;
    }
  }
};

export const authService = {
  async logout() {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};