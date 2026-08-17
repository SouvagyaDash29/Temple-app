// src/services/shareService.js
import { Share, Linking } from 'react-native';

function buildShareMessage(event) {
  const date = new Date(event.date);
  const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const lines = [event.title, `${dateStr} \u2022 ${timeStr}`];
  if (event.location) lines.push(event.location);
  if (event.notes) lines.push(event.notes);
  lines.push('', 'Shared from Temple Devotee App');
  return lines.join('\n');
}

/** Opens the native share sheet (Message/Mail/WhatsApp/Telegram all show up here automatically). */
export async function shareEvent(event) {
  try {
    await Share.share({ message: buildShareMessage(event), title: event.title });
  } catch (err) {
    console.warn('Share failed:', err.message);
  }
}

/** Deep-links straight into WhatsApp; falls back to the generic share sheet if it's not installed. */
export async function shareEventToWhatsApp(event) {
  const url = `whatsapp://send?text=${encodeURIComponent(buildShareMessage(event))}`;
  const supported = await Linking.canOpenURL(url).catch(() => false);
  if (supported) return Linking.openURL(url);
  return shareEvent(event);
}

/** Deep-links straight into Telegram; falls back to the generic share sheet if it's not installed. */
export async function shareEventToTelegram(event) {
  const url = `tg://msg?text=${encodeURIComponent(buildShareMessage(event))}`;
  const supported = await Linking.canOpenURL(url).catch(() => false);
  if (supported) return Linking.openURL(url);
  return shareEvent(event);
}

export default { shareEvent, shareEventToWhatsApp, shareEventToTelegram, buildShareMessage };
