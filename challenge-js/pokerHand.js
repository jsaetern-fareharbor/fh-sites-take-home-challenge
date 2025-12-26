// Parses a 5-card poker hand string and determines its rank.
class PokerHand {
  static ACE_VALUE = 14;  // Ace is high (14); treated as low only in A-2-3-4-5 straights.
  static HAND_SIZE = 5;

  constructor(hand = '') {
    if (typeof hand !== 'string') {
      throw new TypeError('Hand must be a string');
    }

    const parts = hand.trim() ? hand.trim().split(/\s+/) : [];
    if (parts.length !== PokerHand.HAND_SIZE) {
      throw new RangeError('Hand must contain exactly 5 cards');
    }

    this.cards = parts.map(PokerHand.#normalizeCard);

    // Prevent duplicate cards (e.g. "As As")
    const uniqueCards = new Set(this.cards.map(c => `${c.rank}${c.suit}`));
    if (uniqueCards.size !== PokerHand.HAND_SIZE) {
      throw new RangeError('Hand contains duplicate cards');
    }
  }

  getRank() {
    const sortedRanks = this.cards.map(c => c.value).sort((a, b) => a - b);
    const suits = this.cards.map(c => c.suit);

    const isFlush = this.#checkFlush(suits);
    const isStraight = this.#checkStraight(sortedRanks);
    const rankCounts = PokerHand.#countRanks(sortedRanks);

    if (isFlush && isStraight) {
      return this.#isRoyalFlush(sortedRanks) ? 'Royal Flush' : 'Straight Flush';
    }
    if (rankCounts.highest === 4) return 'Four of a Kind';
    if (rankCounts.highest === 3 && rankCounts.second === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (rankCounts.highest === 3) return 'Three of a Kind';
    if (rankCounts.highest === 2 && rankCounts.second === 2) return 'Two Pair';
    if (rankCounts.highest === 2) return 'One Pair';
    return 'High Card';
  }

  #checkFlush(suits) {
    return suits.every(suit => suit === suits[0]);
  }

  #checkStraight(sortedRanks) {
    // Special-case A-2-3-4-5 (Ace-low straight).
    const isWheel =
      sortedRanks[0] === 2 &&
      sortedRanks[1] === 3 &&
      sortedRanks[2] === 4 &&
      sortedRanks[3] === 5 &&
      sortedRanks[4] === PokerHand.ACE_VALUE;
    if (isWheel) return true;

    for (let i = 1; i < sortedRanks.length; i++) {
      if (sortedRanks[i] !== sortedRanks[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  // Assumes a straight flush; true only for 10-J-Q-K-A.
  #isRoyalFlush(sortedRanks) {
    return sortedRanks[0] === 10 && sortedRanks[4] === PokerHand.ACE_VALUE;
  }

  // Parses and validates a card token; returns { rank, suit, value }.
  static #normalizeCard(token) {
    const match = /^((10)|[2-9]|[TJQKA])([SHDC])$/i.exec(token.trim());
    if (!match) {
      throw new RangeError(`Invalid card: "${token}"`);
    }

    const rankRaw = match[1].toUpperCase();
    const suit = match[3].toUpperCase();
    const rank = rankRaw === '10' ? 'T' : rankRaw;

    const valueMap = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
      '7': 7, '8': 8, '9': 9,
      T: 10, J: 11, Q: 12, K: 13, A: 14,
    };

    return { rank, suit, value: valueMap[rank] };
  }

  static #countRanks(sortedRanks) {
    const counts = new Map();
    for (const rank of sortedRanks) {
      counts.set(rank, (counts.get(rank) || 0) + 1);
    }

    const sortedCounts = [...counts.values()].sort((a, b) => b - a);
    return {
      highest: sortedCounts[0] || 0,
      second: sortedCounts[1] || 0
    };
  }
}

module.exports = PokerHand;
