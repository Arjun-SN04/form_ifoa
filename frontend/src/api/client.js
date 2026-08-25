import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const client = axios.create({ baseURL, withCredentials: true });

export const getBatches = () => client.get('/batches').then((r) => r.data);

export const getFormSchema = () => client.get('/form-schema').then((r) => r.data);

export const adminGetFormSchema = () => client.get('/admin/form-schema').then((r) => r.data);

export const adminUpdateFormSchema = (sections) =>
  client.put('/admin/form-schema', { sections }).then((r) => r.data);

export const submitForm = (answers) => client.post('/submissions', { answers }).then((r) => r.data);

export const getSubmission = (id) => client.get(`/submissions/${id}`).then((r) => r.data);

export const adminLogin = (password) =>
  client.post('/admin/login', { password }).then((r) => r.data);

export const adminLogout = () => client.post('/admin/logout').then((r) => r.data);

export const adminMe = () => client.get('/admin/me').then((r) => r.data);

export const adminListSubmissions = () => client.get('/admin/submissions').then((r) => r.data);

export const adminGetSubmission = (id) =>
  client.get(`/admin/submissions/${id}`).then((r) => r.data);

export const adminUpdateSubmission = (id, data) =>
  client.put(`/admin/submissions/${id}`, data).then((r) => r.data);

export const adminDeleteSubmission = (id) =>
  client.delete(`/admin/submissions/${id}`).then((r) => r.data);

export const adminListBatches = () => client.get('/admin/batches').then((r) => r.data);

export const adminCreateBatch = (label) =>
  client.post('/admin/batches', { label }).then((r) => r.data);

export const adminUpdateBatch = (id, data) =>
  client.put(`/admin/batches/${id}`, data).then((r) => r.data);

export const adminDeleteBatch = (id) => client.delete(`/admin/batches/${id}`).then((r) => r.data);
