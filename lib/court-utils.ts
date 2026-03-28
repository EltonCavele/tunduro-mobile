import type { CourtType } from 'lib/court.types';

export function formatCourtTypeLabel(type: CourtType) {
  return type === 'INDOOR' ? 'Indoor' : 'Outdoor';
}

export function formatCourtPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency || 'MZN',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'MZN'}`;
  }
}

export function formatCourtCapacity(maxPlayers: number) {
  return `${maxPlayers} jogador${maxPlayers === 1 ? '' : 'es'}`;
}

export function formatCourtLighting(hasLighting: boolean) {
  return hasLighting ? 'Com iluminacao' : 'Sem iluminacao';
}

export function formatCourtRating(ratingAverage: number, ratingCount: number) {
  if (ratingCount <= 0) {
    return 'Sem avaliacoes';
  }

  return `${ratingAverage.toFixed(1)} (${ratingCount})`;
}
