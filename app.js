const composer = document.querySelector('#composer');
import { runHealthcareAgent } from './agent-workflow.js';

const input = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const chat = document.querySelector('#chat-scroll');
const prompts = document.querySelector('#welcome-prompts');
const languageSelect = document.querySelector('#language');
const toast = document.querySelector('#toast');
let awaitingFollowUp = false;
let conversationComplete = false;
let turnCount = 0;
let toastTimer;
let sessionId = crypto.randomUUID();

function addMessage({ message, role, statusLabel, urgentTitle, urgent = false, time }) {
  const row = document.createElement('div');
  row.className = `message-row ${role === 'user' ? 'user-row' : 'assistant-row response-row'}`;
  if (role === 'user') {
    const content = document.createElement('div');
    content.className = 'message-content';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const label = document.createElement('strong');
    label.textContent = 'You';
    const stamp = document.createElement('span');
    stamp.textContent = time;
    meta.append(label, stamp);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = message;
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = 'R';
    content.append(meta, bubble);
    row.append(content, avatar);
  } else {
    if (urgent) {
      const alert = document.createElement('div');
      alert.className = 'safety-alert';
      const heading = document.createElement('strong');
      heading.textContent = urgentTitle;
      alert.append(heading, document.createTextNode(message));
      row.className = 'safety-alert-row';
      row.append(alert);
    } else {
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27s-10-6.3-10-14a5.5 5.5 0 0 1 10-3.2A5.5 5.5 0 0 1 26 13c0 7.7-10 14-10 14Z"/><path d="M10.5 16h3l1.7-3.3 2.4 6 1.6-2.7h2.3"/></svg>';
      const content = document.createElement('div');
      content.className = 'message-content';
      const meta = document.createElement('div');
      meta.className = 'message-meta';
      const label = document.createElement('strong');
      label.textContent = 'Swasthya';
      const stamp = document.createElement('span');
      stamp.textContent = time;
      meta.append(label, stamp);
      const bubble = document.createElement('div');
      bubble.className = 'bubble assistant-bubble';
      const paragraph = document.createElement('p');
      paragraph.textContent = message;
      const badge = document.createElement('span');
      badge.className = `response-status${urgent ? ' urgent' : ''}`;
      badge.textContent = statusLabel;
      bubble.append(paragraph, badge);
      content.append(meta, bubble);
      row.append(avatar, content);
    }
  }
  chat.append(row);
  chat.scrollTop = chat.scrollHeight;
}

function currentTime() {
  return new Intl.DateTimeFormat(languageSelect.value === 'hi' ? 'hi-IN' : 'en', { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

function handleMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;
  turnCount += 1;
  if (turnCount === 1) prompts.hidden = true;
  const time = currentTime();
  addMessage({ message: cleanMessage, role: 'user', time });
  const result = runHealthcareAgent(sessionId, cleanMessage, { awaiting_follow_up: awaitingFollowUp, completed: conversationComplete, language: languageSelect.value });
  const urgent = result.status === 'urgent_escalation';
  const unsupported = result.status === 'unsupported_language';
  if (!unsupported) {
    awaitingFollowUp = result.status === 'needs_clarification';
    conversationComplete = result.status === 'urgent_escalation' || result.status === 'safe_handoff';
  }
  addMessage({ message: result.response, role: 'assistant', statusLabel: result.status_label, urgentTitle: result.urgent_title, urgent, time: currentTime() });
  input.value = '';
  input.style.height = 'auto';
  sendButton.disabled = true;
  input.focus();
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  handleMessage(input.value);
});

input.addEventListener('input', () => {
  sendButton.disabled = !input.value.trim();
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (input.value.trim()) composer.requestSubmit();
  }
});

document.querySelectorAll('.prompt-chip').forEach((button) => {
  button.addEventListener('click', () => handleMessage(button.dataset.prompt));
});

document.querySelector('#new-chat').addEventListener('click', () => {
  chat.innerHTML = '<div class="date-divider"><span></span><small>YOUR CONVERSATION STARTS HERE</small><span></span></div><div class="message-row assistant-row"><div class="message-avatar"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27s-10-6.3-10-14a5.5 5.5 0 0 1 10-3.2A5.5 5.5 0 0 1 26 13c0 7.7-10 14-10 14Z"/><path d="M10.5 16h3l1.7-3.3 2.4 6 1.6-2.7h2.3"/></svg></div><div class="message-content"><div class="message-meta"><strong>Swasthya</strong><span>Just now</span></div><div class="bubble assistant-bubble"><p>Namaste! I’m here to help you make sense of health questions and think through a safe next step.</p><p>What’s on your mind today?</p><div class="message-foot"><span class="tiny-sparkle">✳</span> Here to support, not diagnose</div></div></div></div>';
  chat.append(prompts);
  prompts.hidden = false;
  sessionId = crypto.randomUUID();
  awaitingFollowUp = false;
  conversationComplete = false;
  turnCount = 0;
  input.value = '';
  input.style.height = 'auto';
  sendButton.disabled = true;
  input.focus();
});

document.querySelector('#emergency-button').addEventListener('click', () => {
  languageSelect.value = 'en';
  handleMessage('I need urgent help');
});

document.querySelectorAll('.nav-item[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.getAttribute('href') === '#') {
      event.preventDefault();
      showToast('You’re viewing the health assistant.');
      return;
    }
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) {
      event.preventDefault();
      showToast('You’re viewing the health assistant.');
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}
