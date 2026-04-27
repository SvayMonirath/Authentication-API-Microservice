const baseUrlInput = document.getElementById('baseUrlInput');
const currentBaseUrl = document.getElementById('currentBaseUrl');
const responseOutput = document.getElementById('responseOutput');
const connectionDot = document.getElementById('connectionDot');
const saveBaseUrlButton = document.getElementById('saveBaseUrlButton');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');

const BASE_URL_STORAGE_KEY = 'auth-demo-base-url';
const ACCESS_TOKEN_STORAGE_KEY = 'auth-demo-access-token';
const DEFAULT_BASE_URL = `${window.location.origin}`;
let accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

const normalizeBaseUrl = (value) => value.replace(/\/$/, '');

const getBaseUrl = () =>
  normalizeBaseUrl(baseUrlInput.value.trim() || DEFAULT_BASE_URL);

const setConnectionState = (isOnline) => {
  connectionDot.classList.toggle('online', isOnline);
};

const showResponse = (payload) => {
  responseOutput.textContent = JSON.stringify(payload, null, 2);
};

const saveBaseUrl = (value) => {
  const normalized = normalizeBaseUrl(value.trim() || DEFAULT_BASE_URL);
  localStorage.setItem(BASE_URL_STORAGE_KEY, normalized);
  baseUrlInput.value = normalized;
  currentBaseUrl.textContent = normalized;
  setConnectionState(true);
};

const loadBaseUrl = () => {
  const storedValue = localStorage.getItem(BASE_URL_STORAGE_KEY);
  const initialValue = storedValue ? storedValue : DEFAULT_BASE_URL;
  baseUrlInput.value = initialValue;
  currentBaseUrl.textContent = normalizeBaseUrl(initialValue);
};

const requestJson = async (path, body) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'string' ? data : data?.message || 'Request failed';

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
};

const handleSubmit = async (event, path) => {
  event.preventDefault();
  saveBaseUrl(getBaseUrl());

  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData.entries());

  try {
    setConnectionState(true);
    const result = await requestJson(path, payload);

    if (path === '/authentication/login' && result?.data?.access_token) {
      accessToken = result.data.access_token;
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    }

    showResponse({
      ok: true,
      endpoint: path,
      result,
    });
    event.currentTarget.reset();
  } catch (error) {
    setConnectionState(false);
    showResponse({
      ok: false,
      endpoint: path,
      error: error.message,
    });
  }
};

saveBaseUrlButton.addEventListener('click', () => {
  saveBaseUrl(getBaseUrl());
  showResponse({ ok: true, message: 'Backend URL saved.' });
});

registerForm.addEventListener('submit', (event) => {
  void handleSubmit(event, '/authentication/register');
});

loginForm.addEventListener('submit', (event) => {
  void handleSubmit(event, '/authentication/login');
});

logoutButton.addEventListener('click', async () => {
  saveBaseUrl(getBaseUrl());

  try {
    setConnectionState(true);
    const result = await requestJson('/authentication/logout', {});
    accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

    showResponse({
      ok: true,
      endpoint: '/authentication/logout',
      result,
    });
  } catch (error) {
    setConnectionState(false);
    showResponse({
      ok: false,
      endpoint: '/authentication/logout',
      error: error.message,
    });
  }
});

loadBaseUrl();
