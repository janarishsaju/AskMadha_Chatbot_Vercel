import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function impactLight(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics not supported on this device — fail silently
  }
}

export async function impactMedium(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics not supported on this device — fail silently
  }
}

export async function impactHeavy(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Haptics not supported on this device — fail silently
  }
}

export async function notificationSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics not supported on this device — fail silently
  }
}

export async function selectionFeedback(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await Haptics.selectionAsync();
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Haptics not supported on this device — fail silently
  }
}
