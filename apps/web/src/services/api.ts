import axios from 'axios';
import { SatelliteInput } from '@space-sa/core';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

export const api = {
  // Satellites
  getSatellites: async () => {
    const response = await apiClient.get('/satellites');
    return response.data.data;
  },

  addSatellite: async (data: SatelliteInput) => {
    const response = await apiClient.post('/satellites', data);
    return response.data.data;
  },

  updateSatellite: async (id: string, data: SatelliteInput) => {
    const response = await apiClient.put(`/satellites/${id}`, data);
    return response.data.data;
  },

  deleteSatellite: async (id: string) => {
    const response = await apiClient.delete(`/satellites/${id}`);
    return response.data.data;
  },

  // Alerts
  getAlerts: async (filters: { type?: string; severity?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.severity) params.append('severity', filters.severity);
    
    const response = await apiClient.get(`/alerts?${params.toString()}`);
    return response.data.data;
  },

  acknowledgeAlert: async (id: string) => {
    const response = await apiClient.post(`/alerts/${id}/acknowledge`);
    return response.data.data;
  },

  // Space Weather
  getSpaceWeather: async (days: number = 7) => {
    const response = await apiClient.get(`/space-weather?days=${days}`);
    return response.data.data;
  },

  getKpData: async () => {
    const response = await apiClient.get('/space-weather/kp');
    return response.data.data;
  },

  getCmeData: async (days: number = 7) => {
    const response = await apiClient.get(`/space-weather/cme?days=${days}`);
    return response.data.data;
  },

  getNotifications: async (days: number = 7) => {
    const response = await apiClient.get(`/space-weather/notifications?days=${days}`);
    return response.data.data;
  },

  // Decisions
  getDecisions: async () => {
    const response = await apiClient.get('/decisions');
    return response.data.data;
  },

  suggestDecision: async (alertType: string, alertData: any) => {
    const response = await apiClient.post('/decisions/suggest', {
      alertType,
      alertData,
    });
    return response.data.data;
  },

  executeDecision: async (decisionId: string, actionId: string) => {
    const response = await apiClient.post('/decisions/execute', {
      decisionId,
      actionId,
    });
    return response.data.data;
  },

  // Health
  getHealth: async () => {
    const response = await apiClient.get('/healthz');
    return response.data;
  },

  getMetrics: async () => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },
};
